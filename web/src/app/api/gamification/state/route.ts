import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { dailyProgress, streakState, bingoState, DEFAULT_BINGO_SQUARES } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { logger } from '@/lib/logger';

/**
 * GET /api/gamification/state
 *
 * Returns the current gamification state for the authenticated user:
 * - Daily progress (reviews done, target, completion status)
 * - Streak state (current streak, longest streak, freeze count)
 * - Bingo board state
 *
 * Creates records if they don't exist (first request of the day).
 */
export async function GET() {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // 2. Fetch or create daily progress (race-condition safe: try insert first)
    let daily: typeof dailyProgress.$inferSelect;
    try {
      // Attempt to insert - will fail if record already exists (unique constraint)
      const [newDaily] = await db
        .insert(dailyProgress)
        .values({
          userId: user.id,
          date: today,
        })
        .returning();
      daily = newDaily;
    } catch (error) {
      // Race condition: another request created it first, fetch the existing record
      const [existing] = await db
        .select()
        .from(dailyProgress)
        .where(
          and(
            eq(dailyProgress.userId, user.id),
            eq(dailyProgress.date, today)
          )
        );
      if (!existing) throw error; // Re-throw if it's a different error
      daily = existing;
    }

    // 3. Fetch or create streak state (race-condition safe: try insert first)
    let streak: typeof streakState.$inferSelect;
    try {
      // Attempt to insert - will fail if record already exists (unique constraint on userId)
      const [newStreak] = await db
        .insert(streakState)
        .values({
          userId: user.id,
        })
        .returning();
      streak = newStreak;
    } catch (error) {
      // Race condition: another request created it first, fetch the existing record
      const [existing] = await db
        .select()
        .from(streakState)
        .where(eq(streakState.userId, user.id));
      if (!existing) throw error; // Re-throw if it's a different error
      streak = existing;
    }

    // 4. Check if streak needs to be updated or reset
    const streakUpdate = calculateStreakUpdate(streak, today);
    if (streakUpdate.needsUpdate) {
      const [updatedStreak] = await db
        .update(streakState)
        .set({
          currentStreak: streakUpdate.currentStreak,
          streakFreezeCount: streakUpdate.freezeCount,
          lastFreezeUsedDate: streakUpdate.freezeUsedToday ? today : streak.lastFreezeUsedDate,
          updatedAt: new Date(),
        })
        .where(eq(streakState.userId, user.id))
        .returning();
      streak = updatedStreak;
    }

    // 5. Fetch or create bingo state (race-condition safe: try insert first)
    let bingo: typeof bingoState.$inferSelect;
    try {
      // Attempt to insert - will fail if record already exists (unique constraint)
      const [newBingo] = await db
        .insert(bingoState)
        .values({
          userId: user.id,
          date: today,
          squareDefinitions: DEFAULT_BINGO_SQUARES,
        })
        .returning();
      bingo = newBingo;
    } catch (error) {
      // Race condition: another request created it first, fetch the existing record
      const [existing] = await db
        .select()
        .from(bingoState)
        .where(
          and(
            eq(bingoState.userId, user.id),
            eq(bingoState.date, today)
          )
        );
      if (!existing) throw error; // Re-throw if it's a different error
      bingo = existing;
    }

    // 6. Return combined state
    return NextResponse.json({
      data: {
        daily: {
          targetReviews: daily.targetReviews,
          completedReviews: daily.completedReviews,
          completedAt: daily.completedAt,
          isComplete: daily.completedAt !== null,
        },
        streak: {
          currentStreak: streak.currentStreak,
          longestStreak: streak.longestStreak,
          lastCompletedDate: streak.lastCompletedDate,
          streakFreezeCount: streak.streakFreezeCount,
        },
        bingo: {
          squaresCompleted: bingo.squaresCompleted,
          squareDefinitions: bingo.squareDefinitions,
          bingoAchieved: bingo.bingoAchieved,
          bingoAchievedAt: bingo.bingoAchievedAt,
        },
      },
    });
  } catch (error) {
    logger.error({ error: error instanceof Error ? { message: error.message, stack: error.stack } : String(error), endpoint: '/api/gamification/state' }, 'Gamification state error');
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get gamification state' },
      { status: 500 }
    );
  }
}

/**
 * Calculate if streak needs updating based on last completed date
 *
 * Logic:
 * - If user completed yesterday, streak continues
 * - If user completed today, streak already counted
 * - If user missed yesterday but has freeze, use freeze
 * - If user missed yesterday and no freeze, reset streak
 */
function calculateStreakUpdate(
  streak: typeof streakState.$inferSelect,
  today: string
): {
  needsUpdate: boolean;
  currentStreak: number;
  freezeCount: number;
  freezeUsedToday: boolean;
} {
  if (!streak.lastCompletedDate) {
    // New user, no changes needed yet
    return {
      needsUpdate: false,
      currentStreak: 0,
      freezeCount: streak.streakFreezeCount,
      freezeUsedToday: false,
    };
  }

  const lastDate = new Date(streak.lastCompletedDate);
  const todayDate = new Date(today);
  const yesterday = new Date(todayDate);
  yesterday.setDate(yesterday.getDate() - 1);

  const lastDateStr = lastDate.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // If completed today, no changes needed
  if (lastDateStr === today) {
    return {
      needsUpdate: false,
      currentStreak: streak.currentStreak,
      freezeCount: streak.streakFreezeCount,
      freezeUsedToday: false,
    };
  }

  // If completed yesterday, streak continues (will be incremented on completion)
  if (lastDateStr === yesterdayStr) {
    return {
      needsUpdate: false,
      currentStreak: streak.currentStreak,
      freezeCount: streak.streakFreezeCount,
      freezeUsedToday: false,
    };
  }

  // User missed a day - check if we can use a freeze
  const daysSinceLastComplete = Math.floor(
    (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Only allow freeze for exactly 1 missed day (not multiple)
  if (daysSinceLastComplete === 2 && streak.streakFreezeCount > 0) {
    // Use a freeze - streak continues but freeze count decreases
    return {
      needsUpdate: true,
      currentStreak: streak.currentStreak,
      freezeCount: streak.streakFreezeCount - 1,
      freezeUsedToday: true,
    };
  }

  // Too many days missed, streak resets
  return {
    needsUpdate: true,
    currentStreak: 0,
    freezeCount: streak.streakFreezeCount,
    freezeUsedToday: false,
  };
}
