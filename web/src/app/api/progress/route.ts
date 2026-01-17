import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { words, reviewSessions } from '@/lib/db/schema';
import { eq, sql, and, gte, lte, desc } from 'drizzle-orm';

/**
 * GET /api/progress
 *
 * Returns comprehensive progress statistics for the dashboard.
 * Combines LLYLI metrics with Anki-style dashboard elements.
 *
 * Response: {
 *   data: {
 *     // Word Counts (Anki-style stats grid)
 *     totalWords: number,
 *     wordsThisWeek: number,
 *     wordsThisMonth: number,
 *     categoryCount: number,
 *
 *     // Mastery Status
 *     learningWords: number,
 *     learnedWords: number,
 *     masteredWords: number,
 *
 *     // Review Stats
 *     totalReviews: number,
 *     correctReviews: number,
 *     retentionRate: number,
 *
 *     // Streak
 *     currentStreak: number,
 *     longestStreak: number,
 *
 *     // Learning indicators (Anki-style)
 *     dueToday: number,
 *     needPractice: number,      // retrievability < 0.9
 *     strugglingWords: number,   // lapseCount >= 3
 *
 *     // Forecast (next 7 days)
 *     forecast: { date: string, count: number }[],
 *
 *     // Activity Heatmap (last 90 days)
 *     activityHeatmap: { date: string, count: number }[],
 *
 *     // Ready to Use words (limit 10)
 *     readyToUseWords: Word[],
 *
 *     // Struggling words list (limit 5)
 *     strugglingWordsList: Word[]
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
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 2. Word counts by mastery status
    const wordCounts = await db
      .select({
        masteryStatus: words.masteryStatus,
        count: sql<number>`count(*)::int`,
      })
      .from(words)
      .where(eq(words.userId, user.id))
      .groupBy(words.masteryStatus);

    const totalWords = wordCounts.reduce((sum, row) => sum + row.count, 0);
    const learningWords = wordCounts.find(r => r.masteryStatus === 'learning')?.count ?? 0;
    const learnedWords = wordCounts.find(r => r.masteryStatus === 'learned')?.count ?? 0;
    const masteredWords = wordCounts.find(r => r.masteryStatus === 'ready_to_use')?.count ?? 0;

    // 2b. Anki-style time-based counts
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

    const [weekCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(words)
      .where(and(eq(words.userId, user.id), gte(words.createdAt, oneWeekAgo)));

    const [monthCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(words)
      .where(and(eq(words.userId, user.id), gte(words.createdAt, oneMonthAgo)));

    const wordsThisWeek = weekCount?.count ?? 0;
    const wordsThisMonth = monthCount?.count ?? 0;

    // 2c. Category count
    const [categoryResult] = await db
      .select({ count: sql<number>`count(distinct ${words.category})::int` })
      .from(words)
      .where(eq(words.userId, user.id));

    const categoryCount = categoryResult?.count ?? 0;

    // 2d. Learning indicators (Anki-style)
    const [needPracticeResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(words)
      .where(
        and(
          eq(words.userId, user.id),
          sql`${words.retrievability} < 0.9`
        )
      );

    const needPractice = needPracticeResult?.count ?? 0;

    // 2e. Struggling words (3+ lapses, like Anki's "Words to Review")
    const [strugglingResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(words)
      .where(
        and(
          eq(words.userId, user.id),
          gte(words.lapseCount, 3)
        )
      );

    const strugglingWords = strugglingResult?.count ?? 0;

    // 2f. Struggling words list (for display) - matches "Words to Review (3+ fails)"
    const strugglingWordsList = await db
      .select()
      .from(words)
      .where(
        and(
          eq(words.userId, user.id),
          gte(words.lapseCount, 1) // Show words with at least 1 lapse
        )
      )
      .orderBy(desc(words.lapseCount))
      .limit(10);

    // 2g. New cards (not yet studied) - matches "New Cards (Not Yet Studied)"
    const [newCardsResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(words)
      .where(
        and(
          eq(words.userId, user.id),
          eq(words.reviewCount, 0)
        )
      );

    const newCardsCount = newCardsResult?.count ?? 0;

    // 2h. New cards list (for display)
    const newCardsList = await db
      .select()
      .from(words)
      .where(
        and(
          eq(words.userId, user.id),
          eq(words.reviewCount, 0)
        )
      )
      .orderBy(desc(words.createdAt))
      .limit(10);

    // 2i. Words to focus on (due + need practice + struggling)
    const wordsToFocusOn = Math.min(
      needPractice + strugglingWords,
      totalWords
    );

    // 3. Review statistics (retention rate)
    const [reviewStats] = await db
      .select({
        totalReviews: sql<number>`coalesce(sum(${reviewSessions.wordsReviewed}), 0)::int`,
        correctReviews: sql<number>`coalesce(sum(${reviewSessions.correctCount}), 0)::int`,
      })
      .from(reviewSessions)
      .where(eq(reviewSessions.userId, user.id));

    const totalReviews = reviewStats?.totalReviews ?? 0;
    const correctReviews = reviewStats?.correctReviews ?? 0;
    const retentionRate = totalReviews > 0
      ? Math.round((correctReviews / totalReviews) * 100)
      : 0;

    // 4. Calculate streak (consecutive days with completed sessions)
    const { currentStreak, longestStreak } = await calculateStreak(user.id, today);

    // 5. Forecast: words due in next 7 days
    const forecast = await calculateForecast(user.id, today);
    const dueToday = forecast[0]?.count ?? 0;

    // 6. Activity heatmap (last 90 days of review activity)
    const ninetyDaysAgo = new Date(today);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const activityHeatmap = await db
      .select({
        date: sql<string>`date(${reviewSessions.endedAt})`,
        count: sql<number>`sum(${reviewSessions.wordsReviewed})::int`,
      })
      .from(reviewSessions)
      .where(
        and(
          eq(reviewSessions.userId, user.id),
          gte(reviewSessions.endedAt, ninetyDaysAgo)
        )
      )
      .groupBy(sql`date(${reviewSessions.endedAt})`)
      .orderBy(sql`date(${reviewSessions.endedAt})`);

    // 7. Ready to use words (mastered, limit 10)
    const readyToUseWords = await db
      .select()
      .from(words)
      .where(
        and(
          eq(words.userId, user.id),
          eq(words.masteryStatus, 'ready_to_use')
        )
      )
      .orderBy(desc(words.updatedAt))
      .limit(10);

    return NextResponse.json({
      data: {
        // Word Counts (Anki-style stats grid)
        totalWords,
        wordsThisWeek,
        wordsThisMonth,
        categoryCount,

        // Mastery Status
        learningWords,
        learnedWords,
        masteredWords,

        // Review Stats
        totalReviews,
        correctReviews,
        retentionRate,

        // Streak
        currentStreak,
        longestStreak,

        // Learning Indicators (Anki-style)
        dueToday,
        needPractice,
        strugglingWords,

        // Forecast
        forecast,

        // Heatmap
        activityHeatmap,

        // Ready to Use
        readyToUseWords,

        // Struggling Words List (Words to Review with fails)
        strugglingWordsList,

        // New Cards (Not Yet Studied)
        newCardsCount,
        newCardsList,

        // Words to Focus On
        wordsToFocusOn,
      },
    });
  } catch (error) {
    console.error('Progress retrieval error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to retrieve progress',
      },
      { status: 500 }
    );
  }
}

/**
 * Calculate current and longest study streak
 *
 * A streak is the number of consecutive days with at least one completed review session.
 */
async function calculateStreak(
  userId: string,
  today: Date
): Promise<{ currentStreak: number; longestStreak: number }> {
  // Get all unique dates with completed sessions, ordered descending
  const sessionDates = await db
    .select({
      date: sql<string>`date(${reviewSessions.endedAt})`,
    })
    .from(reviewSessions)
    .where(
      and(
        eq(reviewSessions.userId, userId),
        sql`${reviewSessions.endedAt} is not null`
      )
    )
    .groupBy(sql`date(${reviewSessions.endedAt})`)
    .orderBy(desc(sql`date(${reviewSessions.endedAt})`));

  if (sessionDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Convert to Date objects for comparison
  const dates = sessionDates.map(row => new Date(row.date));
  const todayStr = today.toISOString().split('T')[0];
  const yesterdayDate = new Date(today);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

  // Calculate current streak
  let currentStreak = 0;
  const mostRecentDateStr = dates[0].toISOString().split('T')[0];

  // Check if streak is active (studied today or yesterday)
  if (mostRecentDateStr === todayStr || mostRecentDateStr === yesterdayStr) {
    currentStreak = 1;
    let expectedDate = new Date(dates[0]);

    for (let i = 1; i < dates.length; i++) {
      expectedDate.setDate(expectedDate.getDate() - 1);
      const expectedStr = expectedDate.toISOString().split('T')[0];
      const actualStr = dates[i].toISOString().split('T')[0];

      if (actualStr === expectedStr) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak (scan all dates)
  let longestStreak = 0;
  let tempStreak = 1;

  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i - 1]);
    const currDate = new Date(dates[i]);
    const diffDays = Math.round(
      (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

  return { currentStreak, longestStreak };
}

/**
 * Calculate 7-day review forecast
 *
 * Returns an array of { date, count } for the next 7 days,
 * showing how many words are scheduled for review each day.
 */
async function calculateForecast(
  userId: string,
  today: Date
): Promise<{ date: string; count: number }[]> {
  const forecast: { date: string; count: number }[] = [];

  for (let i = 0; i < 7; i++) {
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + i);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const [result] = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(words)
      .where(
        and(
          eq(words.userId, userId),
          i === 0
            ? // Today: include overdue (nextReviewDate <= end of today)
              lte(words.nextReviewDate, nextDate)
            : // Future: words due on that specific day
              and(
                gte(words.nextReviewDate, targetDate),
                lte(words.nextReviewDate, nextDate)
              )
        )
      );

    forecast.push({
      date: targetDate.toISOString().split('T')[0],
      count: result?.count ?? 0,
    });
  }

  return forecast;
}
