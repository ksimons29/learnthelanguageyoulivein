import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { words, dailyProgress } from '@/lib/db/schema';
import { eq, and, desc, asc, sql } from 'drizzle-orm';

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

    return NextResponse.json({
      data: {
        words: bossWords,
        timeLimit: 90, // seconds
        count: bossWords.length,
      },
    });
  } catch (error) {
    console.error('Boss round start error:', error);
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
  try {
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

    // For now, just return the results
    // Future: Could store boss round history for achievements
    return NextResponse.json({
      data: {
        score,
        totalWords,
        accuracy,
        isPerfect,
        timeUsed,
        message: isPerfect
          ? 'Perfect score! You conquered the boss round!'
          : score >= Math.ceil(totalWords / 2)
          ? 'Well done! You passed the boss round!'
          : 'Keep practicing! You\'ll get them next time.',
      },
    });
  } catch (error) {
    console.error('Boss round complete error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to complete boss round' },
      { status: 500 }
    );
  }
}
