import { NextResponse } from 'next/server';
import { getCurrentUser, getUserLanguagePreference } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { words, reviewSessions, streakState } from '@/lib/db/schema';
import { eq, sql, and, gte, lte, desc, or } from 'drizzle-orm';

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

    // 2. Get user's language preference for filtering
    const languagePreference = await getUserLanguagePreference(user.id);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
    const ninetyDaysAgo = new Date(today);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    // Convert dates to ISO strings for postgres-js raw SQL compatibility
    // Note: Drizzle's gte()/lte() operators handle Date objects correctly,
    // but raw sql`` template literals require string parameters
    const oneWeekAgoStr = oneWeekAgo.toISOString();
    const oneMonthAgoStr = oneMonthAgo.toISOString();

    // Run all independent queries in parallel for maximum performance
    const [
      aggregatedStats,
      reviewStats,
      storedStreak,
      streakData,
      forecastData,
      activityHeatmap,
      readyToUseWords,
      strugglingWordsList,
      newCardsList,
    ] = await Promise.all([
      // 1. Combined aggregated stats in a single query
      // ALWAYS filter by user's target language (check both sourceLang and targetLang)
      //
      // Due Today Calculation (FSRS scientific principles):
      // - newCardsCount: Words never reviewed (reviewCount = 0)
      // - reviewDue: Words in learning cycle with nextReviewDate <= now
      // - dueToday: MIN(newCardsCount, DAILY_NEW_CARDS_LIMIT) + reviewDue
      db
        .select({
          totalWords: sql<number>`count(*)::int`,
          learningWords: sql<number>`count(*) filter (where ${words.masteryStatus} = 'learning')::int`,
          learnedWords: sql<number>`count(*) filter (where ${words.masteryStatus} = 'learned')::int`,
          masteredWords: sql<number>`count(*) filter (where ${words.masteryStatus} = 'ready_to_use')::int`,
          wordsThisWeek: sql<number>`count(*) filter (where ${words.createdAt} >= ${oneWeekAgoStr})::int`,
          wordsThisMonth: sql<number>`count(*) filter (where ${words.createdAt} >= ${oneMonthAgoStr})::int`,
          categoryCount: sql<number>`count(distinct ${words.category})::int`,
          needPractice: sql<number>`count(*) filter (where ${words.retrievability} < 0.9)::int`,
          strugglingWords: sql<number>`count(*) filter (where ${words.lapseCount} >= 3)::int`,
          newCardsCount: sql<number>`count(*) filter (where ${words.reviewCount} = 0)::int`,
          // Review due: reviewed at least once AND nextReviewDate <= now
          reviewDue: sql<number>`count(*) filter (where ${words.reviewCount} > 0 and ${words.nextReviewDate} <= now())::int`,
        })
        .from(words)
        .where(
          and(
            eq(words.userId, user.id),
            or(
              and(
                eq(words.sourceLang, languagePreference.targetLanguage),
                eq(words.targetLang, languagePreference.nativeLanguage)
              ),
              and(
                eq(words.sourceLang, languagePreference.nativeLanguage),
                eq(words.targetLang, languagePreference.targetLanguage)
              )
            )
          )
        ),

      // 2. Review statistics
      db
        .select({
          totalReviews: sql<number>`coalesce(sum(${reviewSessions.wordsReviewed}), 0)::int`,
          correctReviews: sql<number>`coalesce(sum(${reviewSessions.correctCount}), 0)::int`,
        })
        .from(reviewSessions)
        .where(eq(reviewSessions.userId, user.id)),

      // 3. Stored streak state (from gamification system - single source of truth)
      db
        .select()
        .from(streakState)
        .where(eq(streakState.userId, user.id)),

      // 4. Streak calculation data (fallback for longest streak calculation)
      db
        .select({
          date: sql<string>`date(${reviewSessions.endedAt})`,
        })
        .from(reviewSessions)
        .where(
          and(
            eq(reviewSessions.userId, user.id),
            sql`${reviewSessions.endedAt} is not null`
          )
        )
        .groupBy(sql`date(${reviewSessions.endedAt})`)
        .orderBy(desc(sql`date(${reviewSessions.endedAt})`)),

      // 5. Forecast data in a single query with date grouping
      // ALWAYS filter by user's target language (check both sourceLang and targetLang)
      db
        .select({
          date: sql<string>`date(${words.nextReviewDate})`,
          count: sql<number>`count(*)::int`,
        })
        .from(words)
        .where(
          and(
            eq(words.userId, user.id),
            or(
              and(
                eq(words.sourceLang, languagePreference.targetLanguage),
                eq(words.targetLang, languagePreference.nativeLanguage)
              ),
              and(
                eq(words.sourceLang, languagePreference.nativeLanguage),
                eq(words.targetLang, languagePreference.targetLanguage)
              )
            ),
            lte(words.nextReviewDate, sevenDaysFromNow)
          )
        )
        .groupBy(sql`date(${words.nextReviewDate})`),

      // 6. Activity heatmap
      db
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
        .orderBy(sql`date(${reviewSessions.endedAt})`),

      // 7. Ready to use words
      // ALWAYS filter by user's target language (check both sourceLang and targetLang)
      db
        .select()
        .from(words)
        .where(
          and(
            eq(words.userId, user.id),
            or(
              and(
                eq(words.sourceLang, languagePreference.targetLanguage),
                eq(words.targetLang, languagePreference.nativeLanguage)
              ),
              and(
                eq(words.sourceLang, languagePreference.nativeLanguage),
                eq(words.targetLang, languagePreference.targetLanguage)
              )
            ),
            eq(words.masteryStatus, 'ready_to_use')
          )
        )
        .orderBy(desc(words.updatedAt))
        .limit(10),

      // 8. Struggling words list
      // ALWAYS filter by user's target language (check both sourceLang and targetLang)
      db
        .select()
        .from(words)
        .where(
          and(
            eq(words.userId, user.id),
            or(
              and(
                eq(words.sourceLang, languagePreference.targetLanguage),
                eq(words.targetLang, languagePreference.nativeLanguage)
              ),
              and(
                eq(words.sourceLang, languagePreference.nativeLanguage),
                eq(words.targetLang, languagePreference.targetLanguage)
              )
            ),
            gte(words.lapseCount, 1)
          )
        )
        .orderBy(desc(words.lapseCount))
        .limit(10),

      // 9. New cards list
      // ALWAYS filter by user's target language (check both sourceLang and targetLang)
      db
        .select()
        .from(words)
        .where(
          and(
            eq(words.userId, user.id),
            or(
              and(
                eq(words.sourceLang, languagePreference.targetLanguage),
                eq(words.targetLang, languagePreference.nativeLanguage)
              ),
              and(
                eq(words.sourceLang, languagePreference.nativeLanguage),
                eq(words.targetLang, languagePreference.targetLanguage)
              )
            ),
            eq(words.reviewCount, 0)
          )
        )
        .orderBy(desc(words.createdAt))
        .limit(10),
    ]);

    // Extract aggregated stats
    const stats = aggregatedStats[0] ?? {
      totalWords: 0,
      learningWords: 0,
      learnedWords: 0,
      masteredWords: 0,
      wordsThisWeek: 0,
      wordsThisMonth: 0,
      categoryCount: 0,
      needPractice: 0,
      strugglingWords: 0,
      newCardsCount: 0,
      reviewDue: 0,
    };

    const totalWords = stats.totalWords;
    const learningWords = stats.learningWords;
    const learnedWords = stats.learnedWords;
    const masteredWords = stats.masteredWords;
    const wordsThisWeek = stats.wordsThisWeek;
    const wordsThisMonth = stats.wordsThisMonth;
    const categoryCount = stats.categoryCount;
    const needPractice = stats.needPractice;
    const strugglingWords = stats.strugglingWords;
    const newCardsCount = stats.newCardsCount;
    const reviewDue = stats.reviewDue;

    // Calculate words to focus on
    const wordsToFocusOn = Math.min(needPractice + strugglingWords, totalWords);

    // Extract review stats
    const totalReviews = reviewStats[0]?.totalReviews ?? 0;
    const correctReviews = reviewStats[0]?.correctReviews ?? 0;
    const retentionRate = totalReviews > 0
      ? Math.round((correctReviews / totalReviews) * 100)
      : 0;

    // Use stored streak from gamification system (single source of truth)
    // Fall back to calculated streak if no stored streak exists
    const storedStreakData = storedStreak[0];
    const calculatedStreak = calculateStreakFromDates(streakData, today);

    const currentStreak = storedStreakData?.currentStreak ?? calculatedStreak.currentStreak;
    const longestStreak = storedStreakData?.longestStreak ?? calculatedStreak.longestStreak;

    // Build forecast from pre-fetched data
    const forecast = buildForecast(forecastData, today);

    // Calculate dueToday with capped new cards (FSRS scientific principles)
    // This prevents showing 700+ "due" for bulk imports
    const cappedNewCards = Math.min(newCardsCount, DAILY_NEW_CARDS_LIMIT);
    const dueToday = cappedNewCards + reviewDue;

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
        reviewDue,  // Words in learning cycle due now (for UI breakdown)
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
    // Include detailed error info for debugging
    const errorDetails = error instanceof Error
      ? { message: error.message, stack: error.stack?.split('\n').slice(0, 5) }
      : { message: 'Unknown error', raw: String(error) };
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to retrieve progress',
        debug: errorDetails,
      },
      { status: 500 }
    );
  }
}

/**
 * Calculate current and longest study streak from pre-fetched date data
 *
 * A streak is the number of consecutive days with at least one completed review session.
 */
function calculateStreakFromDates(
  sessionDates: { date: string }[],
  today: Date
): { currentStreak: number; longestStreak: number } {
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
 * Build 7-day review forecast from pre-fetched date data
 *
 * Returns an array of { date, count } for the next 7 days,
 * showing how many words are scheduled for review each day.
 */
function buildForecast(
  forecastData: { date: string; count: number }[],
  today: Date
): { date: string; count: number }[] {
  const forecast: { date: string; count: number }[] = [];

  // Create a map from date string to count for quick lookup
  const dateCountMap = new Map<string, number>();
  let overdueCount = 0;

  const todayStr = today.toISOString().split('T')[0];

  for (const row of forecastData) {
    if (row.date < todayStr) {
      // Overdue words - add to today's count
      overdueCount += row.count;
    } else {
      dateCountMap.set(row.date, row.count);
    }
  }

  // Build the 7-day forecast
  for (let i = 0; i < 7; i++) {
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + i);
    const dateStr = targetDate.toISOString().split('T')[0];

    let count = dateCountMap.get(dateStr) ?? 0;

    // Add overdue words to today's count
    if (i === 0) {
      count += overdueCount;
    }

    forecast.push({ date: dateStr, count });
  }

  return forecast;
}
