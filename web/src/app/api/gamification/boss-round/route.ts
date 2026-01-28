import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { words, dailyProgress, bossRoundHistory } from '@/lib/db/schema';
import { eq, and, desc, asc, sql } from 'drizzle-orm';
import { getRequestContext } from '@/lib/logger/api-logger';
import { logger } from '@/lib/logger';

/**
 * GET /api/gamification/boss-round
 *
 * Returns 5 words for the boss round challenge.
 * Only available after daily goal is completed.
 *
 * Selection logic:
 * 1. Priority: Words with lowest retrievability from today's session
 * 2. Fallback: Words with highest lapse count
 * 3. Limit: Always returns exactly 5 or fewer if not enough words
 */
export async function GET() {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];

    // 2. Check if daily goal is completed
    const [daily] = await db
      .select()
      .from(dailyProgress)
      .where(
        and(
          eq(dailyProgress.userId, user.id),
          eq(dailyProgress.date, today)
        )
      );

    if (!daily || !daily.completedAt) {
      return NextResponse.json({
        error: 'Daily goal not yet completed',
        code: 'DAILY_GOAL_INCOMPLETE',
      }, { status: 400 });
    }

    // 3. Get words for boss round
    // Priority: Words with low retrievability or high lapse count
    const bossWords = await db
      .select()
      .from(words)
      .where(eq(words.userId, user.id))
      .orderBy(
        // Prioritize struggling words
        desc(words.lapseCount),
        asc(words.retrievability)
      )
      .limit(5);

    // 4. Get personal best stats (for motivation like Erik's scenario)
    // Wrapped in try-catch: history tracking is optional, Boss Round works without it
    let personalBest: { bestScore: number; totalAttempts: number; perfectCount: number; lastPlayed: string | null } | null = null;
    let recentScores: { score: number; total: number; completedAt: Date }[] = [];

    try {
      const [stats] = await db
        .select({
          bestScore: sql<number>`max(${bossRoundHistory.correctCount})`,
          totalAttempts: sql<number>`count(*)::int`,
          perfectCount: sql<number>`count(*) filter (where ${bossRoundHistory.isPerfect})::int`,
          lastPlayed: sql<string>`max(${bossRoundHistory.completedAt})`,
        })
        .from(bossRoundHistory)
        .where(eq(bossRoundHistory.userId, user.id));

      personalBest = stats;

      // Get recent scores for trend (last 5 attempts)
      recentScores = await db
        .select({
          score: bossRoundHistory.correctCount,
          total: bossRoundHistory.totalWords,
          completedAt: bossRoundHistory.completedAt,
        })
        .from(bossRoundHistory)
        .where(eq(bossRoundHistory.userId, user.id))
        .orderBy(desc(bossRoundHistory.completedAt))
        .limit(5);
    } catch (historyError) {
      // Table may not exist yet - Boss Round still works, just without history
      logger.warn({ error: historyError instanceof Error ? historyError.message : String(historyError) }, 'Boss round history unavailable');
    }

    return NextResponse.json({
      data: {
        words: bossWords,
        timeLimit: 90, // seconds
        count: bossWords.length,
        stats: {
          bestScore: personalBest?.bestScore ?? 0,
          totalAttempts: personalBest?.totalAttempts ?? 0,
          perfectCount: personalBest?.perfectCount ?? 0,
          lastPlayed: personalBest?.lastPlayed ?? null,
          recentScores: recentScores.map(s => ({
            score: s.score,
            total: s.total,
            date: s.completedAt,
          })),
        },
      },
    });
  } catch (error) {
    logger.error({ error: error instanceof Error ? { message: error.message, stack: error.stack } : String(error), endpoint: '/api/gamification/boss-round GET' }, 'Boss round start error');
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to start boss round' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/gamification/boss-round
 *
 * Submit boss round results.
 *
 * Body: { score: number, totalWords: number, timeUsed: number }
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const { logRequest, logResponse, logError } = getRequestContext(request);

  try {
    logRequest();
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { score, totalWords, timeUsed } = body;

    // Validate input
    if (typeof score !== 'number' || typeof totalWords !== 'number') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Calculate performance
    const accuracy = totalWords > 0 ? Math.round((score / totalWords) * 100) : 0;
    const isPerfect = score === totalWords;

    // Store boss round history (like Erik tracking Week 1: 2/5, Week 8: 4/5, Week 16: 5/5)
    // Wrapped in try-catch: history is optional, results still returned even if save fails
    let savedResult = null;
    let stats: { bestScore: number; totalAttempts: number; perfectCount: number } | null = null;
    let isNewBest = false;

    try {
      [savedResult] = await db
        .insert(bossRoundHistory)
        .values({
          userId: user.id,
          totalWords,
          correctCount: score,
          timeLimit: 90,
          timeUsed: timeUsed ?? 0,
          accuracy,
          isPerfect,
        })
        .returning();

      // Get updated stats after this attempt
      const [fetchedStats] = await db
        .select({
          bestScore: sql<number>`max(${bossRoundHistory.correctCount})`,
          totalAttempts: sql<number>`count(*)::int`,
          perfectCount: sql<number>`count(*) filter (where ${bossRoundHistory.isPerfect})::int`,
        })
        .from(bossRoundHistory)
        .where(eq(bossRoundHistory.userId, user.id));

      stats = fetchedStats;

      // Check if this was a new personal best
      isNewBest = savedResult && stats && score === stats.bestScore && stats.totalAttempts > 1;
    } catch (historyError) {
      // Table may not exist yet - Boss Round results still shown, just not persisted
      logger.warn({ error: historyError instanceof Error ? historyError.message : String(historyError) }, 'Boss round history save failed');
    }

    logResponse(200, Date.now() - startTime);
    return NextResponse.json({
      data: {
        score,
        totalWords,
        accuracy,
        isPerfect,
        timeUsed,
        isNewBest,
        stats: {
          bestScore: stats?.bestScore ?? score,
          totalAttempts: stats?.totalAttempts ?? 1,
          perfectCount: stats?.perfectCount ?? (isPerfect ? 1 : 0),
        },
        message: isPerfect
          ? 'Perfect score! You conquered the boss round!'
          : isNewBest
          ? 'New personal best! Keep improving!'
          : score >= Math.ceil(totalWords / 2)
          ? 'Well done! You passed the boss round!'
          : 'Keep practicing! You\'ll get them next time.',
      },
    });
  } catch (error) {
    logError(error, { endpoint: '/api/gamification/boss-round POST' });
    logResponse(500, Date.now() - startTime);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to complete boss round' },
      { status: 500 }
    );
  }
}
