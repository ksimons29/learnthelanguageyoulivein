import { NextResponse } from 'next/server';
import { getCurrentUser, getUserLanguagePreference } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { words } from '@/lib/db/schema';
import { eq, sql, and, or, lte, gte } from 'drizzle-orm';

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
 *     dueToday: number,
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
    const [stats] = await db
      .select({
        totalWords: sql<number>`count(*)::int`,
        masteredCount: sql<number>`
          count(*) filter (where ${words.masteryStatus} = 'ready_to_use')::int
        `,
        learningCount: sql<number>`
          count(*) filter (where ${words.masteryStatus} = 'learning')::int
        `,
        dueToday: sql<number>`
          count(*) filter (
            where ${words.retrievability} < 0.9
            or ${words.nextReviewDate} <= ${nowISO}::timestamp
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

    return NextResponse.json({
      data: {
        totalWords: stats?.totalWords ?? 0,
        masteredCount: stats?.masteredCount ?? 0,
        learningCount: stats?.learningCount ?? 0,
        dueToday: stats?.dueToday ?? 0,
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
