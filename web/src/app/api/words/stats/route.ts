import { NextResponse } from 'next/server';
import { getCurrentUser, getUserLanguagePreference } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { words } from '@/lib/db/schema';
import { eq, sql, and, or, lte, gte } from 'drizzle-orm';

/**
 * Daily new card limit for spaced repetition
 *
 * Following FSRS scientific principles:
 * - Users should see 15-20 new cards per day MAX to prevent burnout
 * - Review cards (already in learning cycle) are unlimited
 * - This prevents overwhelming users with 700+ "due" cards from bulk imports
 */
const DAILY_NEW_CARDS_LIMIT = 15;

/**
 * GET /api/words/stats
 *
 * Returns comprehensive statistics for the user's word collection.
 * Used by the Notebook JournalHeader component.
 *
 * Response: {
 *   data: {
 *     totalWords: number,
 *     masteredCount: number,
 *     learningCount: number,
 *     dueToday: number,        // Capped new cards + review due
 *     newCardsAvailable: number, // Total new cards (never reviewed)
 *     reviewDue: number,       // Words in learning cycle due now
 *     needsAttention: number,
 *     targetLanguage: string,
 *   }
 * }
 */
export async function GET() {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get user's language preference
    const languagePreference = await getUserLanguagePreference(user.id);

    const now = new Date();
    const nowISO = now.toISOString();

    // 3. Query comprehensive stats in a single query
    // ALWAYS filter by user's target language
    //
    // Due Today Calculation (FSRS scientific principles):
    // - newCardsAvailable: Words never reviewed (reviewCount = 0)
    // - reviewDue: Words in learning cycle with nextReviewDate <= now
    // - dueToday: MIN(newCardsAvailable, DAILY_NEW_CARDS_LIMIT) + reviewDue
    //
    // This prevents showing 700+ "due" for bulk imports while still
    // surfacing review cards that genuinely need attention.
    const [stats] = await db
      .select({
        totalWords: sql<number>`count(*)::int`,
        masteredCount: sql<number>`
          count(*) filter (where ${words.masteryStatus} = 'ready_to_use')::int
        `,
        learningCount: sql<number>`
          count(*) filter (where ${words.masteryStatus} = 'learning')::int
        `,
        // New cards: never reviewed before
        newCardsAvailable: sql<number>`
          count(*) filter (where ${words.reviewCount} = 0)::int
        `,
        // Review due: reviewed at least once AND nextReviewDate <= now
        reviewDue: sql<number>`
          count(*) filter (
            where ${words.reviewCount} > 0
            and ${words.nextReviewDate} <= ${nowISO}::timestamp
          )::int
        `,
        needsAttention: sql<number>`
          count(*) filter (where ${words.lapseCount} >= 3)::int
        `,
      })
      .from(words)
      .where(
        and(
          eq(words.userId, user.id),
          or(
            eq(words.sourceLang, languagePreference.targetLanguage),
            eq(words.targetLang, languagePreference.targetLanguage)
          )
        )
      );

    // Calculate dueToday with capped new cards
    const newCardsAvailable = stats?.newCardsAvailable ?? 0;
    const reviewDue = stats?.reviewDue ?? 0;
    const cappedNewCards = Math.min(newCardsAvailable, DAILY_NEW_CARDS_LIMIT);
    const dueToday = cappedNewCards + reviewDue;

    return NextResponse.json({
      data: {
        totalWords: stats?.totalWords ?? 0,
        masteredCount: stats?.masteredCount ?? 0,
        learningCount: stats?.learningCount ?? 0,
        dueToday,
        newCardsAvailable,  // Total new cards (for UI breakdown)
        reviewDue,          // Review cards due (for UI breakdown)
        needsAttention: stats?.needsAttention ?? 0,
        targetLanguage: languagePreference.targetLanguage,
      },
    });
  } catch (error) {
    console.error('Stats retrieval error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to retrieve stats',
      },
      { status: 500 }
    );
  }
}
