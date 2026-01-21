import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { words } from '@/lib/db/schema/words';
import { reviewSessions } from '@/lib/db/schema/sessions';
import { userFeedback } from '@/lib/db/schema/user-feedback';
import { dailyProgress, streakState } from '@/lib/db/schema/gamification';
import { sql, count, avg, sum, eq, gte, and, isNotNull, isNull } from 'drizzle-orm';

/**
 * GET /api/admin/stats
 *
 * Platform-level analytics dashboard endpoint.
 * Protected by ADMIN_SECRET environment variable.
 *
 * Returns aggregate metrics across all users:
 * - User counts and activity
 * - Word capture statistics
 * - Audio generation health
 * - Review performance
 * - Gamification engagement
 * - User feedback summary
 */
export async function GET(request: NextRequest) {
  // Simple secret-based auth for admin access
  const adminSecret = request.headers.get('x-admin-secret');
  const expectedSecret = process.env.ADMIN_SECRET;

  if (!expectedSecret || adminSecret !== expectedSecret) {
    return NextResponse.json(
      { error: 'Unauthorized. Set ADMIN_SECRET env var and pass x-admin-secret header.' },
      { status: 401 }
    );
  }

  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const oneDayAgo = new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000);

    // Execute all queries in parallel for performance
    const [
      userStats,
      wordStats,
      audioStats,
      reviewStats,
      gamificationStats,
      feedbackStats,
      languagePairStats,
      recentFeedback,
      productKpis,
      retentionStats,
    ] = await Promise.all([
      // User statistics
      db.execute(sql`
        SELECT
          COUNT(DISTINCT user_id) as total_users,
          COUNT(DISTINCT CASE WHEN created_at >= ${sevenDaysAgo} THEN user_id END) as new_users_7d,
          COUNT(DISTINCT CASE WHEN created_at >= ${thirtyDaysAgo} THEN user_id END) as new_users_30d
        FROM words
      `),

      // Word statistics
      db.execute(sql`
        SELECT
          COUNT(*) as total_words,
          COUNT(CASE WHEN created_at >= ${today} THEN 1 END) as words_today,
          COUNT(CASE WHEN created_at >= ${sevenDaysAgo} THEN 1 END) as words_7d,
          COUNT(CASE WHEN created_at >= ${thirtyDaysAgo} THEN 1 END) as words_30d,
          COUNT(CASE WHEN mastery_status = 'ready_to_use' THEN 1 END) as mastered_words,
          COUNT(CASE WHEN mastery_status = 'learned' THEN 1 END) as learned_words,
          COUNT(CASE WHEN mastery_status = 'learning' THEN 1 END) as learning_words,
          ROUND(AVG(review_count)::numeric, 1) as avg_reviews_per_word,
          ROUND(AVG(lapse_count)::numeric, 2) as avg_lapses_per_word
        FROM words
      `),

      // Audio generation statistics (key health metric!)
      db.execute(sql`
        SELECT
          COUNT(*) as total_words,
          COUNT(CASE WHEN audio_url IS NOT NULL THEN 1 END) as with_audio,
          COUNT(CASE WHEN audio_url IS NULL AND audio_generation_failed = false THEN 1 END) as pending_audio,
          COUNT(CASE WHEN audio_generation_failed = true THEN 1 END) as failed_audio,
          ROUND(
            100.0 * COUNT(CASE WHEN audio_url IS NOT NULL THEN 1 END) / NULLIF(COUNT(*), 0),
            1
          ) as audio_success_rate
        FROM words
      `),

      // Review statistics
      db.execute(sql`
        SELECT
          COUNT(*) as total_sessions,
          COALESCE(SUM(words_reviewed), 0) as total_reviews,
          COALESCE(SUM(correct_count), 0) as total_correct,
          ROUND(
            100.0 * COALESCE(SUM(correct_count), 0) / NULLIF(COALESCE(SUM(words_reviewed), 0), 0),
            1
          ) as accuracy_rate,
          COUNT(CASE WHEN started_at >= ${sevenDaysAgo} THEN 1 END) as sessions_7d,
          ROUND(AVG(words_reviewed)::numeric, 1) as avg_words_per_session
        FROM review_sessions
        WHERE ended_at IS NOT NULL
      `),

      // Gamification statistics
      db.execute(sql`
        SELECT
          COUNT(DISTINCT user_id) as users_with_streaks,
          ROUND(AVG(current_streak)::numeric, 1) as avg_streak,
          MAX(longest_streak) as max_streak_ever,
          COUNT(CASE WHEN current_streak >= 7 THEN 1 END) as users_7plus_streak,
          COUNT(CASE WHEN current_streak >= 30 THEN 1 END) as users_30plus_streak
        FROM streak_state
      `),

      // Feedback statistics
      db.execute(sql`
        SELECT
          COUNT(*) as total_feedback,
          COUNT(CASE WHEN type = 'bug_report' THEN 1 END) as bug_reports,
          COUNT(CASE WHEN type = 'feature_request' THEN 1 END) as feature_requests,
          COUNT(CASE WHEN type = 'general_feedback' THEN 1 END) as general_feedback,
          COUNT(CASE WHEN created_at >= ${sevenDaysAgo} THEN 1 END) as feedback_7d
        FROM user_feedback
      `),

      // Language pair distribution
      db.execute(sql`
        SELECT
          source_lang,
          target_lang,
          COUNT(*) as word_count,
          COUNT(DISTINCT user_id) as user_count
        FROM words
        GROUP BY source_lang, target_lang
        ORDER BY word_count DESC
        LIMIT 10
      `),

      // Recent feedback (last 10) - ANONYMOUS: no user_id exposed
      db.execute(sql`
        SELECT
          id,
          type,
          message,
          page_context,
          created_at
        FROM user_feedback
        ORDER BY created_at DESC
        LIMIT 10
      `),

      // Product KPIs (from PRD requirements)
      db.execute(sql`
        SELECT
          -- Daily Active Users (reviewed today)
          COUNT(DISTINCT CASE WHEN rs.started_at >= ${today} THEN rs.user_id END) as dau,
          -- Weekly Active Users (reviewed in last 7 days)
          COUNT(DISTINCT CASE WHEN rs.started_at >= ${sevenDaysAgo} THEN rs.user_id END) as wau,
          -- Monthly Active Users
          COUNT(DISTINCT CASE WHEN rs.started_at >= ${thirtyDaysAgo} THEN rs.user_id END) as mau,
          -- Session completion rate (sessions with ended_at vs total)
          ROUND(
            100.0 * COUNT(CASE WHEN rs.ended_at IS NOT NULL THEN 1 END) /
            NULLIF(COUNT(*), 0), 1
          ) as session_completion_rate,
          -- Average session duration (minutes)
          ROUND(
            AVG(EXTRACT(EPOCH FROM (rs.ended_at - rs.started_at)) / 60)::numeric, 1
          ) as avg_session_minutes
        FROM review_sessions rs
        WHERE rs.started_at >= ${thirtyDaysAgo}
      `),

      // Retention cohorts (D1, D7, D30)
      db.execute(sql`
        WITH user_cohorts AS (
          SELECT
            user_id,
            MIN(created_at) as first_activity
          FROM words
          GROUP BY user_id
        ),
        user_returns AS (
          SELECT
            uc.user_id,
            uc.first_activity,
            MAX(rs.started_at) as last_review
          FROM user_cohorts uc
          LEFT JOIN review_sessions rs ON uc.user_id = rs.user_id
          GROUP BY uc.user_id, uc.first_activity
        )
        SELECT
          -- D1 retention: users who returned day after signup (from users who signed up 2-30 days ago)
          ROUND(100.0 * COUNT(CASE
            WHEN first_activity < ${oneDayAgo}
            AND last_review >= first_activity + INTERVAL '1 day'
            THEN 1 END) /
            NULLIF(COUNT(CASE WHEN first_activity < ${oneDayAgo} AND first_activity >= ${thirtyDaysAgo} THEN 1 END), 0), 1
          ) as d1_retention,
          -- D7 retention: users active 7 days after signup
          ROUND(100.0 * COUNT(CASE
            WHEN first_activity < ${sevenDaysAgo}
            AND last_review >= first_activity + INTERVAL '7 days'
            THEN 1 END) /
            NULLIF(COUNT(CASE WHEN first_activity < ${sevenDaysAgo} AND first_activity >= ${thirtyDaysAgo} THEN 1 END), 0), 1
          ) as d7_retention,
          -- D30 retention: users still active 30 days after signup
          ROUND(100.0 * COUNT(CASE
            WHEN first_activity < ${thirtyDaysAgo}
            AND last_review >= first_activity + INTERVAL '30 days'
            THEN 1 END) /
            NULLIF(COUNT(CASE WHEN first_activity < ${thirtyDaysAgo} THEN 1 END), 0), 1
          ) as d30_retention
        FROM user_returns
      `),
    ]);

    // Active users (users who captured or reviewed in last 7 days)
    const activeUsersResult = await db.execute(sql`
      SELECT COUNT(DISTINCT user_id) as active_users_7d
      FROM (
        SELECT user_id FROM words WHERE created_at >= ${sevenDaysAgo}
        UNION
        SELECT user_id FROM review_sessions WHERE started_at >= ${sevenDaysAgo}
      ) as active
    `);

    // Type helper for raw SQL results (Drizzle returns array directly)
    type RawRow = Record<string, unknown>;
    const getRow = (result: unknown[], index = 0): RawRow => (result[index] || {}) as RawRow;

    return NextResponse.json({
      generatedAt: now.toISOString(),
      users: {
        total: Number(getRow(userStats).total_users || 0),
        newLast7Days: Number(getRow(userStats).new_users_7d || 0),
        newLast30Days: Number(getRow(userStats).new_users_30d || 0),
        activeLast7Days: Number(getRow(activeUsersResult).active_users_7d || 0),
      },
      words: {
        total: Number(getRow(wordStats).total_words || 0),
        capturedToday: Number(getRow(wordStats).words_today || 0),
        capturedLast7Days: Number(getRow(wordStats).words_7d || 0),
        capturedLast30Days: Number(getRow(wordStats).words_30d || 0),
        mastered: Number(getRow(wordStats).mastered_words || 0),
        learned: Number(getRow(wordStats).learned_words || 0),
        learning: Number(getRow(wordStats).learning_words || 0),
        avgReviewsPerWord: Number(getRow(wordStats).avg_reviews_per_word || 0),
        avgLapsesPerWord: Number(getRow(wordStats).avg_lapses_per_word || 0),
      },
      audio: {
        totalWords: Number(getRow(audioStats).total_words || 0),
        withAudio: Number(getRow(audioStats).with_audio || 0),
        pendingAudio: Number(getRow(audioStats).pending_audio || 0),
        failedAudio: Number(getRow(audioStats).failed_audio || 0),
        successRate: Number(getRow(audioStats).audio_success_rate || 0),
      },
      reviews: {
        totalSessions: Number(getRow(reviewStats).total_sessions || 0),
        totalReviews: Number(getRow(reviewStats).total_reviews || 0),
        totalCorrect: Number(getRow(reviewStats).total_correct || 0),
        accuracyRate: Number(getRow(reviewStats).accuracy_rate || 0),
        sessionsLast7Days: Number(getRow(reviewStats).sessions_7d || 0),
        avgWordsPerSession: Number(getRow(reviewStats).avg_words_per_session || 0),
      },
      gamification: {
        usersWithStreaks: Number(getRow(gamificationStats).users_with_streaks || 0),
        avgStreak: Number(getRow(gamificationStats).avg_streak || 0),
        maxStreakEver: Number(getRow(gamificationStats).max_streak_ever || 0),
        usersWith7PlusStreak: Number(getRow(gamificationStats).users_7plus_streak || 0),
        usersWith30PlusStreak: Number(getRow(gamificationStats).users_30plus_streak || 0),
      },
      feedback: {
        total: Number(getRow(feedbackStats).total_feedback || 0),
        bugReports: Number(getRow(feedbackStats).bug_reports || 0),
        featureRequests: Number(getRow(feedbackStats).feature_requests || 0),
        generalFeedback: Number(getRow(feedbackStats).general_feedback || 0),
        last7Days: Number(getRow(feedbackStats).feedback_7d || 0),
        recent: (recentFeedback as RawRow[]).map((f) => ({
          id: f.id,
          type: f.type,
          message: String(f.message || '').substring(0, 200),
          pageContext: f.page_context,
          createdAt: f.created_at,
        })),
      },
      languagePairs: (languagePairStats as RawRow[]).map((lp) => ({
        sourceLang: lp.source_lang,
        targetLang: lp.target_lang,
        wordCount: Number(lp.word_count || 0),
        userCount: Number(lp.user_count || 0),
      })),
      // Product KPIs (from PRD)
      productKpis: {
        // Active users
        dau: Number(getRow(productKpis).dau || 0),
        wau: Number(getRow(productKpis).wau || 0),
        mau: Number(getRow(productKpis).mau || 0),
        // Session metrics
        sessionCompletionRate: Number(getRow(productKpis).session_completion_rate || 0),
        avgSessionMinutes: Number(getRow(productKpis).avg_session_minutes || 0),
        // Retention (key growth metrics)
        d1Retention: Number(getRow(retentionStats).d1_retention || 0),
        d7Retention: Number(getRow(retentionStats).d7_retention || 0),
        d30Retention: Number(getRow(retentionStats).d30_retention || 0),
      },
      // Mastery funnel (from PRD: 3-recall requirement)
      masteryFunnel: {
        learning: Number(getRow(wordStats).learning_words || 0),
        learned: Number(getRow(wordStats).learned_words || 0),
        mastered: Number(getRow(wordStats).mastered_words || 0),
        conversionToLearned: Number(getRow(wordStats).total_words || 0) > 0
          ? Math.round(100 * Number(getRow(wordStats).learned_words || 0) /
              (Number(getRow(wordStats).learning_words || 0) + Number(getRow(wordStats).learned_words || 0) + Number(getRow(wordStats).mastered_words || 0)))
          : 0,
        conversionToMastered: Number(getRow(wordStats).total_words || 0) > 0
          ? Math.round(100 * Number(getRow(wordStats).mastered_words || 0) /
              (Number(getRow(wordStats).learning_words || 0) + Number(getRow(wordStats).learned_words || 0) + Number(getRow(wordStats).mastered_words || 0)))
          : 0,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch admin stats', details: message },
      { status: 500 }
    );
  }
}
