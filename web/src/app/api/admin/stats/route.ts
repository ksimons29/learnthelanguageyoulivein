import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { words } from '@/lib/db/schema/words';
import { reviewSessions } from '@/lib/db/schema/sessions';
import { userFeedback } from '@/lib/db/schema/user-feedback';
import { dailyProgress, streakState } from '@/lib/db/schema/gamification';
import { generatedSentences } from '@/lib/db/schema/sentences';
import { apiUsageLog } from '@/lib/db/schema/api-usage';
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
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Create SQL-safe timestamp values using sql.raw() to avoid parameter binding issues
    const today = sql.raw(`'${todayDate.toISOString()}'::timestamp`);
    const sevenDaysAgo = sql.raw(`'${new Date(todayDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()}'::timestamp`);
    const thirtyDaysAgo = sql.raw(`'${new Date(todayDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()}'::timestamp`);
    const oneDayAgo = sql.raw(`'${new Date(todayDate.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()}'::timestamp`);

    // OPTIMIZATION: Execute queries in parallel using Promise.all
    // All queries are independent read-only operations, safe to parallelize
    // This significantly reduces total response time for the admin dashboard

    // Test user filter - exclude test accounts from analytics
    // Convention: test emails end with @llyli.test or @apple-review.test
    const testUserFilter = sql`
      user_id NOT IN (
        SELECT id FROM auth.users
        WHERE email LIKE '%@llyli.test'
           OR email LIKE '%@apple-review.test'
      )
    `;

    // Execute all independent queries in parallel
    const [
      userStats,
      wordStats,
      audioStats,
      reviewStats,
      gamificationStats,
    ] = await Promise.all([
      // User statistics (excludes test users)
      db.execute(sql`
        SELECT
          COUNT(DISTINCT user_id) as total_users,
          COUNT(DISTINCT CASE WHEN created_at >= ${sevenDaysAgo} THEN user_id END) as new_users_7d,
          COUNT(DISTINCT CASE WHEN created_at >= ${thirtyDaysAgo} THEN user_id END) as new_users_30d
        FROM words
        WHERE ${testUserFilter}
      `),
      // Word statistics (excludes test users)
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
        WHERE ${testUserFilter}
      `),
      // Audio generation statistics - ONLY for recent captures (last 7 days)
      // Bulk imports don't have audio, so we exclude them for meaningful metrics
      db.execute(sql`
        SELECT
          COUNT(*) as total_words,
          COUNT(CASE WHEN audio_url IS NOT NULL THEN 1 END) as with_audio,
          COUNT(CASE WHEN audio_url IS NULL AND audio_generation_failed = false THEN 1 END) as pending_audio,
          COUNT(CASE WHEN audio_generation_failed = true THEN 1 END) as failed_audio,
          -- Recent captures only (last 7 days) for accurate success rate
          COUNT(CASE WHEN created_at >= ${sevenDaysAgo} THEN 1 END) as recent_total,
          COUNT(CASE WHEN created_at >= ${sevenDaysAgo} AND audio_url IS NOT NULL THEN 1 END) as recent_with_audio,
          COUNT(CASE WHEN created_at >= ${sevenDaysAgo} AND audio_generation_failed = true THEN 1 END) as recent_failed
        FROM words
        WHERE ${testUserFilter}
      `),
      // Review statistics (excludes test users)
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
          AND ${testUserFilter}
      `),
      // Gamification statistics (excludes test users)
      db.execute(sql`
        SELECT
          COUNT(DISTINCT user_id) as users_with_streaks,
          ROUND(AVG(current_streak)::numeric, 1) as avg_streak,
          MAX(longest_streak) as max_streak_ever,
          COUNT(CASE WHEN current_streak >= 7 THEN 1 END) as users_7plus_streak,
          COUNT(CASE WHEN current_streak >= 30 THEN 1 END) as users_30plus_streak
        FROM streak_state
        WHERE ${testUserFilter}
      `),
    ]);

    // Second batch of parallel queries
    const [
      feedbackStats,
      languagePairStats,
      recentFeedback,
      productKpis,
      retentionStats,
      activeUsersResult,
    ] = await Promise.all([
      // Feedback statistics (excludes test users)
      db.execute(sql`
        SELECT
          COUNT(*) as total_feedback,
          COUNT(CASE WHEN type = 'bug_report' THEN 1 END) as bug_reports,
          COUNT(CASE WHEN type = 'feature_request' THEN 1 END) as feature_requests,
          COUNT(CASE WHEN type = 'general_feedback' THEN 1 END) as general_feedback,
          COUNT(CASE WHEN created_at >= ${sevenDaysAgo} THEN 1 END) as feedback_7d
        FROM user_feedback
        WHERE ${testUserFilter}
      `),
      // Language pair distribution (filter out invalid same-language pairs, excludes test users)
      db.execute(sql`
        SELECT
          source_lang,
          target_lang,
          COUNT(*) as word_count,
          COUNT(DISTINCT user_id) as user_count
        FROM words
        WHERE source_lang != target_lang
          AND ${testUserFilter}
        GROUP BY source_lang, target_lang
        ORDER BY word_count DESC
        LIMIT 10
      `),
      // Recent feedback (last 10) - ANONYMOUS: no user_id exposed, excludes test users
      db.execute(sql`
        SELECT
          id,
          type,
          message,
          page_context,
          created_at
        FROM user_feedback
        WHERE ${testUserFilter}
        ORDER BY created_at DESC
        LIMIT 10
      `),
      // Product KPIs (from PRD requirements, excludes test users)
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
          -- Average session duration (minutes) - CAP at 30 min to exclude abandoned sessions
          ROUND(
            AVG(LEAST(EXTRACT(EPOCH FROM (rs.ended_at - rs.started_at)) / 60, 30))::numeric, 1
          ) as avg_session_minutes,
          -- Median session duration (more accurate than mean)
          ROUND(
            PERCENTILE_CONT(0.5) WITHIN GROUP (
              ORDER BY LEAST(EXTRACT(EPOCH FROM (rs.ended_at - rs.started_at)) / 60, 30)
            )::numeric, 1
          ) as median_session_minutes
        FROM review_sessions rs
        WHERE rs.started_at >= ${thirtyDaysAgo}
          AND rs.ended_at IS NOT NULL
          AND rs.user_id NOT IN (
            SELECT id FROM auth.users
            WHERE email LIKE '%@llyli.test'
               OR email LIKE '%@apple-review.test'
          )
      `),
      // Retention cohorts (D1, D7, D30) - excludes test users
      db.execute(sql`
        WITH user_cohorts AS (
          SELECT
            user_id,
            MIN(created_at) as first_activity
          FROM words
          WHERE user_id NOT IN (
            SELECT id FROM auth.users
            WHERE email LIKE '%@llyli.test'
               OR email LIKE '%@apple-review.test'
          )
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
      // Active users (users who captured or reviewed in last 7 days) - excludes test users
      db.execute(sql`
        SELECT COUNT(DISTINCT user_id) as active_users_7d
        FROM (
          SELECT user_id FROM words WHERE created_at >= ${sevenDaysAgo} AND ${testUserFilter}
          UNION
          SELECT user_id FROM review_sessions WHERE started_at >= ${sevenDaysAgo} AND ${testUserFilter}
        ) as active
      `),
    ]);

    // ============================================
    // SCIENCE VERIFICATION METRICS
    // Validate that our research-backed approach is working
    // ============================================

    // Third batch: Science verification metrics + new metrics (parallel)
    const [
      fsrsHealth,
      masteryValidation,
      sessionQuality,
      dataGuardrails,
      sentenceStats,
      apiUsageStats,
    ] = await Promise.all([
      // FSRS Health: Interval distribution (should grow over time)
      db.execute(sql`
        SELECT
          -- Interval distribution buckets
          COUNT(CASE WHEN stability < 1 THEN 1 END) as interval_under_1d,
          COUNT(CASE WHEN stability >= 1 AND stability < 7 THEN 1 END) as interval_1_7d,
          COUNT(CASE WHEN stability >= 7 AND stability < 30 THEN 1 END) as interval_7_30d,
          COUNT(CASE WHEN stability >= 30 AND stability < 90 THEN 1 END) as interval_30_90d,
          COUNT(CASE WHEN stability >= 90 THEN 1 END) as interval_90plus,
          -- Average stability by mastery status (should increase)
          ROUND(AVG(CASE WHEN mastery_status = 'learning' THEN stability END)::numeric, 1) as avg_stability_learning,
          ROUND(AVG(CASE WHEN mastery_status = 'learned' THEN stability END)::numeric, 1) as avg_stability_learned,
          ROUND(AVG(CASE WHEN mastery_status = 'ready_to_use' THEN stability END)::numeric, 1) as avg_stability_mastered,
          -- Overall retention proxy (words reviewed in last 7 days that were correct)
          COUNT(*) as total_reviewed_words
        FROM words
        WHERE review_count > 0 AND ${testUserFilter}
      `),
      // Mastery validation: Are words progressing correctly through 3-recall system?
      db.execute(sql`
        SELECT
          -- Average reviews to reach each stage
          ROUND(AVG(CASE WHEN mastery_status = 'learned' THEN review_count END)::numeric, 1) as avg_reviews_to_learned,
          ROUND(AVG(CASE WHEN mastery_status = 'ready_to_use' THEN review_count END)::numeric, 1) as avg_reviews_to_mastered,
          -- Words stuck in learning (>30 days old, still learning, reviewed but not progressing)
          COUNT(CASE
            WHEN mastery_status = 'learning'
            AND created_at < ${thirtyDaysAgo}
            AND review_count >= 5
            THEN 1
          END) as words_stuck_in_learning,
          -- Lapse rate (words that went back to learning after being learned)
          COUNT(CASE WHEN lapse_count > 0 THEN 1 END) as words_with_lapses,
          ROUND(AVG(lapse_count)::numeric, 2) as avg_lapse_count,
          -- Mastery without enough reviews (potential bug)
          COUNT(CASE
            WHEN mastery_status = 'ready_to_use'
            AND review_count < 3
            THEN 1
          END) as mastered_under_3_reviews
        FROM words
        WHERE ${testUserFilter}
      `),
      // Session quality: Are sessions in the optimal 5-15 minute range?
      db.execute(sql`
        SELECT
          -- Duration buckets (capped at 30 min)
          COUNT(CASE WHEN EXTRACT(EPOCH FROM (ended_at - started_at)) / 60 < 5 THEN 1 END) as sessions_under_5min,
          COUNT(CASE WHEN EXTRACT(EPOCH FROM (ended_at - started_at)) / 60 BETWEEN 5 AND 15 THEN 1 END) as sessions_5_15min,
          COUNT(CASE WHEN EXTRACT(EPOCH FROM (ended_at - started_at)) / 60 > 15 THEN 1 END) as sessions_over_15min,
          -- Optimal session percentage (5-15 min is ideal per science)
          ROUND(
            100.0 * COUNT(CASE WHEN EXTRACT(EPOCH FROM (ended_at - started_at)) / 60 BETWEEN 5 AND 15 THEN 1 END) /
            NULLIF(COUNT(*), 0), 1
          ) as optimal_session_pct,
          -- Words per session distribution
          ROUND(AVG(words_reviewed)::numeric, 1) as avg_words_per_session,
          COUNT(CASE WHEN words_reviewed > 25 THEN 1 END) as sessions_over_25_words
        FROM review_sessions
        WHERE ended_at IS NOT NULL
          AND started_at >= ${thirtyDaysAgo}
          AND ${testUserFilter}
      `),
      // Data quality guardrails: Catch anomalies that indicate bugs
      // Using separate subqueries since metrics come from different tables
      db.execute(sql`
        SELECT
          -- Suspicious intervals (>365 days = likely bug) - from words table
          (SELECT COUNT(*) FROM words
            WHERE stability > 365
            AND user_id NOT IN (
              SELECT id FROM auth.users WHERE email LIKE '%@llyli.test' OR email LIKE '%@apple-review.test'
            )
          ) as words_interval_over_year,
          -- Zero accuracy users (potential bot or broken UI) - from review_sessions
          (SELECT COUNT(DISTINCT user_id) FROM review_sessions
            WHERE words_reviewed > 10
            AND correct_count = 0
            AND ended_at IS NOT NULL
            AND user_id NOT IN (
              SELECT id FROM auth.users WHERE email LIKE '%@llyli.test' OR email LIKE '%@apple-review.test'
            )
          ) as users_zero_accuracy,
          -- Words never reviewed but old (capture without learning) - from words table
          (SELECT COUNT(*) FROM words
            WHERE review_count = 0
            AND created_at < ${sevenDaysAgo}
            AND user_id NOT IN (
              SELECT id FROM auth.users WHERE email LIKE '%@llyli.test' OR email LIKE '%@apple-review.test'
            )
          ) as old_words_never_reviewed,
          -- Daily review overload (users with >50 due words) - from words grouped
          (SELECT COUNT(*) FROM (
            SELECT user_id
            FROM words
            WHERE next_review_date <= NOW()
              AND user_id NOT IN (
                SELECT id FROM auth.users WHERE email LIKE '%@llyli.test' OR email LIKE '%@apple-review.test'
              )
            GROUP BY user_id
            HAVING COUNT(*) > 50
          ) overloaded) as users_overloaded
      `),
      // Sentence generation statistics (excludes test users)
      db.execute(sql`
        SELECT
          COUNT(*) as total_sentences,
          COUNT(CASE WHEN created_at >= ${today} THEN 1 END) as sentences_today,
          COUNT(CASE WHEN created_at >= ${sevenDaysAgo} THEN 1 END) as sentences_7d,
          COUNT(CASE WHEN created_at >= ${thirtyDaysAgo} THEN 1 END) as sentences_30d,
          COUNT(CASE WHEN used_at IS NOT NULL THEN 1 END) as sentences_used,
          COUNT(CASE WHEN used_at IS NULL THEN 1 END) as sentences_pre_generated,
          -- Word count distribution
          COUNT(CASE WHEN array_length(word_ids, 1) = 2 THEN 1 END) as sentences_2words,
          COUNT(CASE WHEN array_length(word_ids, 1) = 3 THEN 1 END) as sentences_3words,
          COUNT(CASE WHEN array_length(word_ids, 1) = 4 THEN 1 END) as sentences_4words,
          -- Average words per sentence
          ROUND(AVG(array_length(word_ids, 1))::numeric, 1) as avg_words_per_sentence,
          -- Exercise type distribution
          COUNT(CASE WHEN exercise_type = 'fill_blank' THEN 1 END) as fill_blank_count,
          COUNT(CASE WHEN exercise_type = 'multiple_choice' THEN 1 END) as multiple_choice_count,
          COUNT(CASE WHEN exercise_type = 'type_translation' THEN 1 END) as type_translation_count
        FROM generated_sentences
        WHERE ${testUserFilter}
      `),
      // API usage and cost statistics (excludes test users)
      db.execute(sql`
        SELECT
          -- Total API calls
          COUNT(*) as total_api_calls,
          COUNT(CASE WHEN created_at >= ${today} THEN 1 END) as calls_today,
          COUNT(CASE WHEN created_at >= ${sevenDaysAgo} THEN 1 END) as calls_7d,
          COUNT(CASE WHEN created_at >= ${thirtyDaysAgo} THEN 1 END) as calls_30d,
          -- By API type (all time)
          COUNT(CASE WHEN api_type = 'translation' THEN 1 END) as translation_calls,
          COUNT(CASE WHEN api_type = 'tts' THEN 1 END) as tts_calls,
          COUNT(CASE WHEN api_type = 'sentence_generation' THEN 1 END) as sentence_gen_calls,
          COUNT(CASE WHEN api_type = 'language_detection' THEN 1 END) as lang_detect_calls,
          -- By API type (7d)
          COUNT(CASE WHEN api_type = 'translation' AND created_at >= ${sevenDaysAgo} THEN 1 END) as translation_calls_7d,
          COUNT(CASE WHEN api_type = 'tts' AND created_at >= ${sevenDaysAgo} THEN 1 END) as tts_calls_7d,
          COUNT(CASE WHEN api_type = 'sentence_generation' AND created_at >= ${sevenDaysAgo} THEN 1 END) as sentence_gen_calls_7d,
          -- Token usage (all time)
          COALESCE(SUM(total_tokens), 0) as total_tokens_used,
          COALESCE(SUM(prompt_tokens), 0) as total_prompt_tokens,
          COALESCE(SUM(completion_tokens), 0) as total_completion_tokens,
          -- Token usage (7d)
          COALESCE(SUM(CASE WHEN created_at >= ${sevenDaysAgo} THEN total_tokens ELSE 0 END), 0) as tokens_7d,
          -- Character usage for TTS (all time)
          COALESCE(SUM(character_count), 0) as total_tts_characters,
          COALESCE(SUM(CASE WHEN created_at >= ${sevenDaysAgo} THEN character_count ELSE 0 END), 0) as tts_chars_7d,
          -- Cost (all time)
          COALESCE(SUM(estimated_cost), 0) as total_cost_usd,
          -- Cost (today)
          COALESCE(SUM(CASE WHEN created_at >= ${today} THEN estimated_cost ELSE 0 END), 0) as cost_today,
          -- Cost (7d)
          COALESCE(SUM(CASE WHEN created_at >= ${sevenDaysAgo} THEN estimated_cost ELSE 0 END), 0) as cost_7d,
          -- Cost (30d)
          COALESCE(SUM(CASE WHEN created_at >= ${thirtyDaysAgo} THEN estimated_cost ELSE 0 END), 0) as cost_30d,
          -- Success/failure rates
          COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_calls,
          COUNT(CASE WHEN status = 'failure' THEN 1 END) as failed_calls,
          ROUND(100.0 * COUNT(CASE WHEN status = 'success' THEN 1 END) / NULLIF(COUNT(*), 0), 1) as success_rate
        FROM api_usage_log
        WHERE (user_id IS NULL OR ${testUserFilter})
      `),
    ]);

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
        // All-time totals (includes bulk imports without audio)
        totalWords: Number(getRow(audioStats).total_words || 0),
        withAudio: Number(getRow(audioStats).with_audio || 0),
        pendingAudio: Number(getRow(audioStats).pending_audio || 0),
        failedAudio: Number(getRow(audioStats).failed_audio || 0),
        // Recent captures only (last 7 days) - meaningful success rate
        recentTotal: Number(getRow(audioStats).recent_total || 0),
        recentWithAudio: Number(getRow(audioStats).recent_with_audio || 0),
        recentFailed: Number(getRow(audioStats).recent_failed || 0),
        // Success rate based on recent captures (excludes bulk imports)
        successRate: Number(getRow(audioStats).recent_total || 0) > 0
          ? Math.round(100 * Number(getRow(audioStats).recent_with_audio || 0) / Number(getRow(audioStats).recent_total || 0))
          : 0,
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
        // Session metrics (capped at 30 min to exclude abandoned tabs)
        sessionCompletionRate: Number(getRow(productKpis).session_completion_rate || 0),
        avgSessionMinutes: Number(getRow(productKpis).avg_session_minutes || 0),
        medianSessionMinutes: Number(getRow(productKpis).median_session_minutes || 0),
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
      // Data quality notes for interpreting metrics
      dataQualityNotes: {
        testUsers: 'All metrics exclude test accounts (*@llyli.test, *@apple-review.test). Only real user data is shown.',
        audioSuccessRate: 'Based on last 7 days only. Bulk imports (before audio feature) are excluded.',
        sessionDuration: 'Capped at 30 min. Sessions longer than 30 min are counted as 30 min (abandoned tabs).',
        retention: 'D1/D7/D30 calculated from users who signed up within relevant windows. May show 0% if insufficient data.',
        languagePairs: 'Invalid same-language pairs (e.g., sv→sv) are filtered out.',
        userCounts: 'Derived from word captures. Users who only reviewed but never captured are not counted as "new users".',
      },
      // ============================================
      // SCIENCE VERIFICATION - Proof that our approach works
      // ============================================
      scienceMetrics: {
        // FSRS Algorithm Health (intervals should grow as words are learned)
        fsrsHealth: {
          intervalDistribution: {
            under1Day: Number(getRow(fsrsHealth).interval_under_1d || 0),
            days1to7: Number(getRow(fsrsHealth).interval_1_7d || 0),
            days7to30: Number(getRow(fsrsHealth).interval_7_30d || 0),
            days30to90: Number(getRow(fsrsHealth).interval_30_90d || 0),
            over90Days: Number(getRow(fsrsHealth).interval_90plus || 0),
          },
          avgStabilityByStatus: {
            learning: Number(getRow(fsrsHealth).avg_stability_learning || 0),
            learned: Number(getRow(fsrsHealth).avg_stability_learned || 0),
            mastered: Number(getRow(fsrsHealth).avg_stability_mastered || 0),
          },
          totalReviewedWords: Number(getRow(fsrsHealth).total_reviewed_words || 0),
        },
        // 3-Recall Mastery System Validation
        masteryValidation: {
          avgReviewsToLearned: Number(getRow(masteryValidation).avg_reviews_to_learned || 0),
          avgReviewsToMastered: Number(getRow(masteryValidation).avg_reviews_to_mastered || 0),
          wordsStuckInLearning: Number(getRow(masteryValidation).words_stuck_in_learning || 0),
          wordsWithLapses: Number(getRow(masteryValidation).words_with_lapses || 0),
          avgLapseCount: Number(getRow(masteryValidation).avg_lapse_count || 0),
          masteredUnder3Reviews: Number(getRow(masteryValidation).mastered_under_3_reviews || 0),
        },
        // Session Quality (optimal = 5-15 minutes per science)
        sessionQuality: {
          under5Min: Number(getRow(sessionQuality).sessions_under_5min || 0),
          optimal5to15Min: Number(getRow(sessionQuality).sessions_5_15min || 0),
          over15Min: Number(getRow(sessionQuality).sessions_over_15min || 0),
          optimalSessionPct: Number(getRow(sessionQuality).optimal_session_pct || 0),
          avgWordsPerSession: Number(getRow(sessionQuality).avg_words_per_session || 0),
          sessionsOver25Words: Number(getRow(sessionQuality).sessions_over_25_words || 0),
        },
        // Data Quality Guardrails (alerts for anomalies)
        guardrails: {
          wordsIntervalOverYear: Number(getRow(dataGuardrails).words_interval_over_year || 0),
          usersZeroAccuracy: Number(getRow(dataGuardrails).users_zero_accuracy || 0),
          oldWordsNeverReviewed: Number(getRow(dataGuardrails).old_words_never_reviewed || 0),
          usersOverloaded: Number(getRow(dataGuardrails).users_overloaded || 0),
        },
      },
      // Science metric explanations
      scienceNotes: {
        fsrsHealth: 'FSRS stability should increase as words progress: learning < learned < mastered. Healthy distribution shifts right over time.',
        masteryValidation: 'Words should reach mastery in ~3-6 reviews. "Stuck in learning" (>5 reviews, >30 days) indicates difficulty. "Mastered under 3" is a bug.',
        sessionQuality: '5-15 minute sessions are optimal per cognitive science. Sessions >25 words risk overload.',
        guardrails: 'Alerts: intervals >365d (suspicious), 0% accuracy (bot/bug), never reviewed (abandoned), >50 due (overload).',
      },
      // ============================================
      // SENTENCE GENERATION METRICS
      // Validates core differentiator: "AI combines words in never-repeating sentences"
      // ============================================
      sentences: {
        total: Number(getRow(sentenceStats).total_sentences || 0),
        generatedToday: Number(getRow(sentenceStats).sentences_today || 0),
        generated7d: Number(getRow(sentenceStats).sentences_7d || 0),
        generated30d: Number(getRow(sentenceStats).sentences_30d || 0),
        used: Number(getRow(sentenceStats).sentences_used || 0),
        preGenerated: Number(getRow(sentenceStats).sentences_pre_generated || 0),
        usageRate: Number(getRow(sentenceStats).total_sentences || 0) > 0
          ? Math.round(100 * Number(getRow(sentenceStats).sentences_used || 0) / Number(getRow(sentenceStats).total_sentences || 0))
          : 0,
        wordDistribution: {
          twoWords: Number(getRow(sentenceStats).sentences_2words || 0),
          threeWords: Number(getRow(sentenceStats).sentences_3words || 0),
          fourWords: Number(getRow(sentenceStats).sentences_4words || 0),
        },
        avgWordsPerSentence: Number(getRow(sentenceStats).avg_words_per_sentence || 0),
        exerciseTypeDistribution: {
          fillBlank: Number(getRow(sentenceStats).fill_blank_count || 0),
          multipleChoice: Number(getRow(sentenceStats).multiple_choice_count || 0),
          typeTranslation: Number(getRow(sentenceStats).type_translation_count || 0),
        },
      },
      // ============================================
      // API USAGE & COST METRICS
      // Track OpenAI API usage for cost monitoring
      // ============================================
      apiUsage: {
        totalCalls: Number(getRow(apiUsageStats).total_api_calls || 0),
        callsToday: Number(getRow(apiUsageStats).calls_today || 0),
        calls7d: Number(getRow(apiUsageStats).calls_7d || 0),
        calls30d: Number(getRow(apiUsageStats).calls_30d || 0),
        // By type (all time)
        callsByType: {
          translation: Number(getRow(apiUsageStats).translation_calls || 0),
          tts: Number(getRow(apiUsageStats).tts_calls || 0),
          sentenceGeneration: Number(getRow(apiUsageStats).sentence_gen_calls || 0),
          languageDetection: Number(getRow(apiUsageStats).lang_detect_calls || 0),
        },
        // By type (7d)
        callsByType7d: {
          translation: Number(getRow(apiUsageStats).translation_calls_7d || 0),
          tts: Number(getRow(apiUsageStats).tts_calls_7d || 0),
          sentenceGeneration: Number(getRow(apiUsageStats).sentence_gen_calls_7d || 0),
        },
        // Token usage
        tokenUsage: {
          total: Number(getRow(apiUsageStats).total_tokens_used || 0),
          prompt: Number(getRow(apiUsageStats).total_prompt_tokens || 0),
          completion: Number(getRow(apiUsageStats).total_completion_tokens || 0),
          last7d: Number(getRow(apiUsageStats).tokens_7d || 0),
        },
        // TTS character usage
        ttsCharacters: {
          total: Number(getRow(apiUsageStats).total_tts_characters || 0),
          last7d: Number(getRow(apiUsageStats).tts_chars_7d || 0),
        },
        // Cost (USD)
        costs: {
          totalUsd: Number(getRow(apiUsageStats).total_cost_usd || 0),
          todayUsd: Number(getRow(apiUsageStats).cost_today || 0),
          last7dUsd: Number(getRow(apiUsageStats).cost_7d || 0),
          last30dUsd: Number(getRow(apiUsageStats).cost_30d || 0),
          // Per-user average (7d)
          avgPerActiveUser7d: Number(getRow(activeUsersResult).active_users_7d || 0) > 0
            ? (Number(getRow(apiUsageStats).cost_7d || 0) / Number(getRow(activeUsersResult).active_users_7d || 0))
            : 0,
        },
        // Success/failure
        successRate: Number(getRow(apiUsageStats).success_rate || 0),
        successfulCalls: Number(getRow(apiUsageStats).successful_calls || 0),
        failedCalls: Number(getRow(apiUsageStats).failed_calls || 0),
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    const err = error as Error & { code?: string; cause?: unknown };
    return NextResponse.json(
      {
        error: 'Failed to fetch admin stats',
        details: err.message,
        code: err.code,
        cause: err.cause instanceof Error ? err.cause.message : String(err.cause || ''),
      },
      { status: 500 }
    );
  }
}
