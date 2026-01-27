import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getUserLanguagePreference } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { words, reviewSessions } from '@/lib/db/schema';
import { isDue, processReview, getNextReviewText } from '@/lib/fsrs';
import { eq, and, desc, lte, or, isNull, sql } from 'drizzle-orm';
import { shuffleWithinPriorityBands } from '@/lib/review/shuffle';
import { checkApiRateLimit } from '@/lib/security/rate-limit-check';

/**
 * Session boundary: 2 hours
 * A new session starts when >2 hours since last review activity
 */
const SESSION_BOUNDARY_HOURS = 2;

/**
 * Maximum words per review session
 *
 * Following FSRS scientific principles:
 * - Users should review 20-30 items per session for optimal retention
 * - Sessions longer than ~25 items lead to diminishing returns
 * - This ensures users see the "Session Complete" screen regularly
 */
const MAX_SESSION_WORDS = 25;

/**
 * GET /api/reviews
 *
 * Get words due for review and create/resume a session.
 * A word is "due" when its retrievability drops below 90%.
 *
 * Query params:
 * - limit: Max words to return (default 20)
 *
 * Returns:
 * - sessionId: Current review session ID
 * - words: Array of words due for review
 * - totalDue: Total count of due words
 *
 * Reference: /docs/engineering/FSRS_IMPLEMENTATION.md
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get user's language preference for filtering
    const languagePreference = await getUserLanguagePreference(user.id);

    // 3. Parse query parameters
    // Default limit enforces session size for healthy learning habits
    const { searchParams } = new URL(request.url);
    const requestedLimit = parseInt(searchParams.get('limit') || String(MAX_SESSION_WORDS));
    const limit = Math.min(requestedLimit, MAX_SESSION_WORDS); // Cap at maximum

    // 4. Get or create review session
    const sessionId = await getOrCreateSession(user.id);

    // 5. Get user's words filtered by BOTH native and target language
    // This ensures only words from the user's configured language pair are included.
    // Match words where:
    // - sourceLang matches target AND targetLang matches native (user typed in target language)
    // - sourceLang matches native AND targetLang matches target (user typed in native language)
    const userWords = await db
      .select()
      .from(words)
      .where(
        and(
          eq(words.userId, user.id),
          or(
            // User captured in target language (e.g., typed Portuguese, got English translation)
            and(
              eq(words.sourceLang, languagePreference.targetLanguage),
              eq(words.targetLang, languagePreference.nativeLanguage)
            ),
            // User captured in native language (e.g., typed English, got Portuguese translation)
            and(
              eq(words.sourceLang, languagePreference.nativeLanguage),
              eq(words.targetLang, languagePreference.targetLanguage)
            )
          )
        )
      );

    // 5. Filter to due words using FSRS retrievability calculation
    const now = new Date();
    const dueWords = userWords.filter((word) => {
      // Words that have never been reviewed are due
      if (!word.lastReviewDate) {
        return true;
      }
      // Check if next review date has passed
      if (word.nextReviewDate && word.nextReviewDate <= now) {
        return true;
      }
      // Also check using FSRS retrievability calculation
      return isDue(word);
    });

    // 6. Shuffle within priority bands (Issue #64)
    // This maintains FSRS priority (overdue > due > new) while adding variety
    // to prevent users from memorizing word order. Words are grouped into
    // priority bands and shuffled within each band, then concatenated.
    const shuffledWords = shuffleWithinPriorityBands(dueWords);

    // 7. Limit results
    const limitedWords = shuffledWords.slice(0, limit);

    return NextResponse.json({
      data: {
        sessionId,
        words: limitedWords,
        totalDue: dueWords.length,
        // Include language preferences for client-side exercise generation
        nativeLanguage: languagePreference.nativeLanguage,
        targetLanguage: languagePreference.targetLanguage,
      },
    });
  } catch (error) {
    console.error('Get due words error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to get due words',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reviews
 *
 * Submit a review rating for a word.
 * Updates FSRS parameters and mastery tracking.
 *
 * Body:
 * - wordId: ID of the word being reviewed
 * - rating: 1 (Again), 2 (Hard), 3 (Good), or 4 (Easy)
 * - sessionId: Current review session ID
 *
 * Returns:
 * - word: Updated word with new FSRS parameters
 * - nextReviewText: Human-readable next review timing
 * - masteryAchieved: true if word just reached "ready to use" status
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

    // 1a. Security rate limit (DDoS/brute force protection)
    // Uses 'write' tier (60 req/min) for review submissions
    const securityLimit = await checkApiRateLimit(request, user.id, 'write');
    if (!securityLimit.success && securityLimit.response) {
      return securityLimit.response;
    }

    // 2. Validate request body
    const body = await request.json();
    const { wordId, rating, sessionId } = body;

    if (!wordId || typeof wordId !== 'string') {
      return NextResponse.json(
        { error: 'wordId is required' },
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

    // 3. Get the word and verify ownership
    const [word] = await db
      .select()
      .from(words)
      .where(and(eq(words.id, wordId), eq(words.userId, user.id)));

    if (!word) {
      return NextResponse.json(
        { error: 'Word not found or not owned by user' },
        { status: 404 }
      );
    }

    // 4. Check if word was at "learning" status before review
    const wasLearning = word.masteryStatus !== 'ready_to_use';

    // 5. Process review with FSRS algorithm
    const updates = processReview(word, rating as 1 | 2 | 3 | 4, sessionId);

    // 6. Update word in database
    const [updatedWord] = await db
      .update(words)
      .set(updates)
      .where(eq(words.id, wordId))
      .returning();

    // 7. Update session stats atomically (prevents race conditions)
    // Only update if session is still active (endedAt IS NULL) to prevent
    // stats accumulating in ended sessions
    await db
      .update(reviewSessions)
      .set({
        wordsReviewed: sql`${reviewSessions.wordsReviewed} + 1`,
        correctCount:
          rating >= 3
            ? sql`${reviewSessions.correctCount} + 1`
            : reviewSessions.correctCount,
      })
      .where(and(
        eq(reviewSessions.id, sessionId),
        isNull(reviewSessions.endedAt)
      ));

    // 8. Determine if mastery was just achieved
    const masteryAchieved =
      wasLearning && updatedWord.masteryStatus === 'ready_to_use';

    // 9. Get human-readable next review text
    const nextReviewText = updatedWord.nextReviewDate
      ? getNextReviewText(updatedWord.nextReviewDate)
      : 'Soon';

    return NextResponse.json({
      data: {
        word: updatedWord,
        nextReviewText,
        masteryAchieved,
      },
    });
  } catch (error) {
    console.error('Submit review error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to submit review',
      },
      { status: 500 }
    );
  }
}

/**
 * Get or create a review session
 *
 * A new session is created if:
 * - No previous session exists
 * - Last session is >2 hours old
 * - Last session has been ended
 *
 * IMPORTANT: Uses a transaction to prevent race conditions where
 * two simultaneous requests could create duplicate active sessions.
 */
async function getOrCreateSession(userId: string): Promise<string> {
  const twoHoursAgo = new Date(Date.now() - SESSION_BOUNDARY_HOURS * 60 * 60 * 1000);

  // Use a transaction to prevent race conditions
  // If two requests arrive simultaneously, only one will create a session
  return await db.transaction(async (tx) => {
    // Look for an active session (started within last 2 hours and not ended)
    const [existingSession] = await tx
      .select()
      .from(reviewSessions)
      .where(
        and(
          eq(reviewSessions.userId, userId),
          isNull(reviewSessions.endedAt)
        )
      )
      .orderBy(desc(reviewSessions.startedAt))
      .limit(1);

    // Check if session is still valid (within 2-hour window)
    if (existingSession && existingSession.startedAt >= twoHoursAgo) {
      return existingSession.id;
    }

    // Close any old unclosed sessions
    if (existingSession) {
      await tx
        .update(reviewSessions)
        .set({ endedAt: new Date() })
        .where(eq(reviewSessions.id, existingSession.id));
    }

    // Create new session
    const [newSession] = await tx
      .insert(reviewSessions)
      .values({
        userId,
        wordsReviewed: 0,
        correctCount: 0,
      })
      .returning();

    return newSession.id;
  });
}

/**
 * Get session statistics
 */
async function getSessionStats(
  sessionId: string
): Promise<{ wordsReviewed: number; correctCount: number }> {
  const [session] = await db
    .select()
    .from(reviewSessions)
    .where(eq(reviewSessions.id, sessionId));

  return {
    wordsReviewed: session?.wordsReviewed || 0,
    correctCount: session?.correctCount || 0,
  };
}
