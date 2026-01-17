import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { words } from '@/lib/db/schema';
import { eq, sql, and } from 'drizzle-orm';

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

    const now = new Date();

    // 2. Query category statistics with total and due counts
    // Using a single query with conditional aggregation for efficiency
    const categoryStats = await db
      .select({
        category: words.category,
        totalWords: sql<number>`count(*)::int`,
        dueCount: sql<number>`
          count(*) filter (
            where ${words.retrievability} < 0.9
            or ${words.nextReviewDate} <= ${now}
          )::int
        `,
      })
      .from(words)
      .where(eq(words.userId, user.id))
      .groupBy(words.category)
      .orderBy(sql`count(*) desc`);

    // 3. Count words without a category (inbox)
    // For MVP, we consider words created in the last 24 hours without review as "inbox"
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const [inboxResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(words)
      .where(
        and(
          eq(words.userId, user.id),
          eq(words.reviewCount, 0),
          sql`${words.createdAt} >= ${twentyFourHoursAgo}`
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
