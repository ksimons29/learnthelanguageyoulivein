import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { generatedSentences, words } from '@/lib/db/schema';
import { eq, and, isNull, inArray } from 'drizzle-orm';

/**
 * GET /api/sentences/next
 *
 * Get the next sentence for review.
 * Prioritizes sentences where all words are currently due.
 *
 * Query params:
 * - sessionId: Current review session ID (optional)
 *
 * Reference: /docs/engineering/implementation_plan.md (Epic 2)
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse query parameters
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    // 3. Find unused sentences
    const now = new Date();

    const unusedSentences = await db
      .select()
      .from(generatedSentences)
      .where(
        and(
          eq(generatedSentences.userId, user.id),
          isNull(generatedSentences.usedAt)
        )
      )
      .limit(10); // Get a few to find one with all words due

    // 4. For each sentence, check if all words are currently due
    for (const sentence of unusedSentences) {
      // Get the words for this sentence
      const sentenceWords = await db
        .select()
        .from(words)
        .where(
          and(
            eq(words.userId, user.id),
            inArray(words.id, sentence.wordIds)
          )
        );

      // Verify we found all words (data integrity check)
      if (sentenceWords.length !== sentence.wordIds.length) {
        console.warn(
          `Sentence ${sentence.id} has missing words. Expected ${sentence.wordIds.length}, found ${sentenceWords.length}`
        );
        continue;
      }

      // Check if all words are due (nextReviewDate <= now OR never reviewed)
      const allWordsDue = sentenceWords.every((w) => {
        if (!w.lastReviewDate) return true; // Never reviewed = due
        if (!w.nextReviewDate) return true; // No next date = due
        return w.nextReviewDate <= now;
      });

      if (allWordsDue) {
        // 5. Mark sentence as used
        await db
          .update(generatedSentences)
          .set({
            usedAt: now,
            sessionId: sessionId || null,
          })
          .where(eq(generatedSentences.id, sentence.id));

        // 6. Return the sentence with its target words
        return NextResponse.json({
          data: {
            sentence: {
              ...sentence,
              usedAt: now,
            },
            targetWords: sentenceWords,
          },
        });
      }
    }

    // 7. No sentence available with all words due
    // Check if there are any unused sentences at all
    const totalUnused = unusedSentences.length;

    return NextResponse.json({
      data: {
        sentence: null,
        targetWords: [],
        message:
          totalUnused > 0
            ? `${totalUnused} sentences pre-generated but words not yet due.`
            : 'No pre-generated sentences available. Generate more with POST /api/sentences/generate.',
      },
    });
  } catch (error) {
    console.error('Get next sentence error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get next sentence',
      },
      { status: 500 }
    );
  }
}
