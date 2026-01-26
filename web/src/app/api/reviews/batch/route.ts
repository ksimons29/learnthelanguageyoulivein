import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { words, reviewSessions } from '@/lib/db/schema';
import { processReview, getNextReviewText } from '@/lib/fsrs';
import { eq, and, inArray, isNull, sql } from 'drizzle-orm';

/**
 * POST /api/reviews/batch
 *
 * Submit reviews for multiple words in a single transaction.
 * Used primarily for sentence reviews where all words receive the same rating.
 *
 * This endpoint solves Issue #132: Race conditions in sentence reviews
 * by batching all word reviews into a single database transaction.
 *
 * Body:
 * - wordIds: Array of word IDs to review
 * - rating: 1 (Again), 2 (Hard), 3 (Good), or 4 (Easy)
 * - sessionId: Current review session ID
 *
 * Returns:
 * - words: Array of updated words with new FSRS parameters
 * - masteryCount: Number of words that achieved mastery in this batch
 * - nextReviewTexts: Map of wordId -> human-readable next review timing
 *
 * Benefits over individual calls:
 * - Single network round-trip
 * - Atomic session stats update
 * - All-or-nothing transaction (no partial failures)
 *
 * Reference: /docs/engineering/FSRS_IMPLEMENTATION.md
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Validate request body
    const body = await request.json();
    const { wordIds, rating, sessionId } = body;

    if (!Array.isArray(wordIds) || wordIds.length === 0) {
      return NextResponse.json(
        { error: 'wordIds must be a non-empty array' },
        { status: 400 }
      );
    }

    if (wordIds.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 words per batch' },
        { status: 400 }
      );
    }

    if (!wordIds.every((id) => typeof id === 'string')) {
      return NextResponse.json(
        { error: 'All wordIds must be strings' },
        { status: 400 }
      );
    }

    if (!rating || ![1, 2, 3, 4].includes(rating)) {
      return NextResponse.json(
        { error: 'rating must be 1, 2, 3, or 4' },
        { status: 400 }
      );
    }

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    // 3. Process all reviews in a single transaction
    const result = await db.transaction(async (tx) => {
      // 3a. Get all words and verify ownership
      const userWords = await tx
        .select()
        .from(words)
        .where(and(inArray(words.id, wordIds), eq(words.userId, user.id)));

      // Verify we found all requested words
      if (userWords.length !== wordIds.length) {
        const foundIds = new Set(userWords.map((w) => w.id));
        const missingIds = wordIds.filter((id) => !foundIds.has(id));
        throw new Error(`Words not found or not owned: ${missingIds.join(', ')}`);
      }

      // 3b. Process each word's review
      const updatedWords = [];
      let masteryCount = 0;
      const nextReviewTexts: Record<string, string> = {};

      for (const word of userWords) {
        // Check if word was at "learning" status before review
        const wasLearning = word.masteryStatus !== 'ready_to_use';

        // Process review with FSRS algorithm
        const updates = processReview(word, rating as 1 | 2 | 3 | 4, sessionId);

        // Update word in database
        const [updatedWord] = await tx
          .update(words)
          .set(updates)
          .where(eq(words.id, word.id))
          .returning();

        updatedWords.push(updatedWord);

        // Track mastery achievements
        if (wasLearning && updatedWord.masteryStatus === 'ready_to_use') {
          masteryCount++;
        }

        // Get human-readable next review text
        nextReviewTexts[word.id] = updatedWord.nextReviewDate
          ? getNextReviewText(updatedWord.nextReviewDate)
          : 'Soon';
      }

      // 3c. Update session stats once for all words (atomic)
      const wordCount = userWords.length;
      const correctIncrement = rating >= 3 ? wordCount : 0;

      await tx
        .update(reviewSessions)
        .set({
          wordsReviewed: sql`${reviewSessions.wordsReviewed} + ${wordCount}`,
          correctCount: sql`${reviewSessions.correctCount} + ${correctIncrement}`,
        })
        .where(and(eq(reviewSessions.id, sessionId), isNull(reviewSessions.endedAt)));

      return {
        words: updatedWords,
        masteryCount,
        nextReviewTexts,
      };
    });

    return NextResponse.json({
      data: result,
    });
  } catch (error) {
    console.error('Batch review error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to submit batch review',
      },
      { status: 500 }
    );
  }
}
