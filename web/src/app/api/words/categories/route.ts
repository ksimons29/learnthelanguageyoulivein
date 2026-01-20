import { NextResponse } from 'next/server';
import { getCurrentUser, getUserLanguagePreference } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { words } from '@/lib/db/schema';
import { eq, sql, and, or } from 'drizzle-orm';
import { VALID_CATEGORIES } from '@/lib/config/categories';

/**
 * GET /api/words/categories
 *
 * Returns category statistics for the user's word collection.
 * Each category includes total word count and count of words due for review.
 *
 * A word is considered "due" when:
 * - retrievability < 0.9 (forgetting threshold), OR
 * - nextReviewDate <= now (scheduled review time passed)
 *
 * Response: {
 *   data: {
 *     categories: [{ category: "food", totalWords: 24, dueCount: 8 }, ...],
 *     inboxCount: 5
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

    // 2. Get user's language preference for filtering
    const languagePreference = await getUserLanguagePreference(user.id);

    const now = new Date();
    // Convert dates to ISO strings for postgres driver compatibility
    const nowISO = now.toISOString();

    // 3. Query category statistics with total and due counts
    // Using a single query with conditional aggregation for efficiency
    // ALWAYS filter by user's target language
    const rawCategoryStats = await db
      .select({
        category: words.category,
        totalWords: sql<number>`count(*)::int`,
        dueCount: sql<number>`
          count(*) filter (
            where ${words.retrievability} < 0.9
            or ${words.nextReviewDate} <= ${nowISO}::timestamp
          )::int
        `,
      })
      .from(words)
      .where(
        and(
          eq(words.userId, user.id),
          // Match words where the user's target language appears as either:
          // - sourceLang (they entered a word in their target language)
          // - targetLang (they entered a word in their native language, translated to target)
          or(
            eq(words.sourceLang, languagePreference.targetLanguage),
            eq(words.targetLang, languagePreference.targetLanguage)
          )
        )
      )
      .groupBy(words.category)
      .orderBy(sql`count(*) desc`);

    // Normalize unknown categories to "other" and merge duplicates
    // This prevents multiple "Other" rows from appearing in the UI
    const categoryMap = new Map<string, { totalWords: number; dueCount: number }>();

    for (const stat of rawCategoryStats) {
      // Normalize: if category isn't in VALID_CATEGORIES, map to "other"
      const normalizedCategory = VALID_CATEGORIES.includes(stat.category)
        ? stat.category
        : 'other';

      const existing = categoryMap.get(normalizedCategory);
      if (existing) {
        // Merge counts for duplicate categories
        existing.totalWords += stat.totalWords;
        existing.dueCount += stat.dueCount;
      } else {
        categoryMap.set(normalizedCategory, {
          totalWords: stat.totalWords,
          dueCount: stat.dueCount,
        });
      }
    }

    // Convert back to array and sort by total words descending
    const categoryStats = Array.from(categoryMap.entries())
      .map(([category, counts]) => ({
        category,
        totalWords: counts.totalWords,
        dueCount: counts.dueCount,
      }))
      .sort((a, b) => b.totalWords - a.totalWords);

    // 4. Count words without a category (inbox)
    // For MVP, we consider words created in the last 24 hours without review as "inbox"
    // ALWAYS filter by user's target language
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twentyFourHoursAgoISO = twentyFourHoursAgo.toISOString();
    const [inboxResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(words)
      .where(
        and(
          eq(words.userId, user.id),
          // Match words where the user's target language appears as either sourceLang or targetLang
          or(
            eq(words.sourceLang, languagePreference.targetLanguage),
            eq(words.targetLang, languagePreference.targetLanguage)
          ),
          eq(words.reviewCount, 0),
          sql`${words.createdAt} >= ${twentyFourHoursAgoISO}::timestamp`
        )
      );

    const inboxCount = inboxResult?.count ?? 0;

    return NextResponse.json({
      data: {
        categories: categoryStats,
        inboxCount,
      },
    });
  } catch (error) {
    console.error('Categories retrieval error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to retrieve categories',
      },
      { status: 500 }
    );
  }
}
