import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { dailyProgress, streakState, bingoState, DEFAULT_BINGO_SQUARES, BingoSquareId } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

/**
 * Gamification Event Types
 *
 * Events that can be emitted by the review system:
 * - item_answered: User answered a review item
 * - session_completed: User completed their daily goal
 * - word_mastered: User mastered a word (ready_to_use)
 * - exercise_completed: User completed a specific exercise type
 */
type GamificationEvent = {
  type: 'item_answered';
  data: {
    wordId: string;
    rating: 1 | 2 | 3 | 4;
    exerciseType: 'fill-blank' | 'multiple-choice' | 'type-translation';
    category?: string;
    wasCorrect: boolean;
    consecutiveCorrect?: number;
  };
} | {
  type: 'session_completed';
  data: {
    wordsReviewed: number;
    correctCount: number;
  };
} | {
  type: 'word_mastered';
  data: {
    wordId: string;
  };
};

/**
 * POST /api/gamification/event
 *
 * Processes gamification events and updates daily progress, streak, and bingo board.
 *
 * Body: { event: GamificationEvent }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const event = body.event as GamificationEvent;

    if (!event || !event.type) {
      return NextResponse.json({ error: 'Invalid event' }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0];

    // 2. Process event based on type
    switch (event.type) {
      case 'item_answered':
        return await handleItemAnswered(user.id, today, event.data);

      case 'session_completed':
        return await handleSessionCompleted(user.id, today, event.data);

      case 'word_mastered':
        return await handleWordMastered(user.id, today);

      default:
        return NextResponse.json({ error: 'Unknown event type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Gamification event error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process event' },
      { status: 500 }
    );
  }
}

/**
 * Handle item_answered event
 *
 * Updates:
 * - Daily progress (increment completed reviews)
 * - Bingo squares based on exercise type and category
 * - Check for daily completion
 */
async function handleItemAnswered(
  userId: string,
  today: string,
  data: Extract<GamificationEvent, { type: 'item_answered' }>['data']
) {
  // Get or create daily progress
  let [daily] = await db
    .select()
    .from(dailyProgress)
    .where(
      and(
        eq(dailyProgress.userId, userId),
        eq(dailyProgress.date, today)
      )
    );

  if (!daily) {
    const [newDaily] = await db
      .insert(dailyProgress)
      .values({ userId, date: today })
      .returning();
    daily = newDaily;
  }

  // Increment completed reviews
  const newCompletedCount = daily.completedReviews + 1;
  const justCompletedDailyGoal = !daily.completedAt && newCompletedCount >= daily.targetReviews;

  // Update daily progress
  await db
    .update(dailyProgress)
    .set({
      completedReviews: newCompletedCount,
      completedAt: justCompletedDailyGoal ? new Date() : daily.completedAt,
      updatedAt: new Date(),
    })
    .where(eq(dailyProgress.id, daily.id));

  // Update bingo squares
  const bingoUpdates = await updateBingoSquares(userId, today, data);

  // If daily goal just completed, update streak
  let streakUpdated = false;
  if (justCompletedDailyGoal) {
    await updateStreakOnCompletion(userId, today);
    streakUpdated = true;
  }

  return NextResponse.json({
    data: {
      completedReviews: newCompletedCount,
      dailyGoalComplete: justCompletedDailyGoal || daily.completedAt !== null,
      justCompletedDailyGoal,
      streakUpdated,
      bingoUpdates,
    },
  });
}

/**
 * Handle session_completed event
 *
 * Explicit session end - ensure streak is updated if daily goal was met.
 */
async function handleSessionCompleted(
  userId: string,
  today: string,
  data: Extract<GamificationEvent, { type: 'session_completed' }>['data']
) {
  // Get daily progress
  const [daily] = await db
    .select()
    .from(dailyProgress)
    .where(
      and(
        eq(dailyProgress.userId, userId),
        eq(dailyProgress.date, today)
      )
    );

  if (!daily) {
    return NextResponse.json({ data: { processed: false } });
  }

  // Update bingo square for finishing session
  await updateBingoSquare(userId, today, 'finishSession');

  return NextResponse.json({
    data: {
      processed: true,
      dailyGoalComplete: daily.completedAt !== null,
    },
  });
}

/**
 * Handle word_mastered event
 *
 * Updates bingo square for mastering a word.
 */
async function handleWordMastered(userId: string, today: string) {
  await updateBingoSquare(userId, today, 'masterWord');

  return NextResponse.json({
    data: {
      processed: true,
    },
  });
}

/**
 * Update streak when user completes daily goal
 */
async function updateStreakOnCompletion(userId: string, today: string) {
  // Get or create streak state
  let [streak] = await db
    .select()
    .from(streakState)
    .where(eq(streakState.userId, userId));

  if (!streak) {
    const [newStreak] = await db
      .insert(streakState)
      .values({ userId })
      .returning();
    streak = newStreak;
  }

  // Calculate new streak
  let newCurrentStreak = 1;
  let newLongestStreak = streak.longestStreak;

  if (streak.lastCompletedDate) {
    const lastDate = new Date(streak.lastCompletedDate);
    const todayDate = new Date(today);
    const yesterday = new Date(todayDate);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastDateStr = lastDate.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastDateStr === today) {
      // Already completed today, no change
      return;
    } else if (lastDateStr === yesterdayStr) {
      // Completed yesterday, increment streak
      newCurrentStreak = streak.currentStreak + 1;
    }
    // Otherwise, streak resets to 1
  }

  // Update longest streak if needed
  newLongestStreak = Math.max(newLongestStreak, newCurrentStreak);

  await db
    .update(streakState)
    .set({
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      lastCompletedDate: today,
      updatedAt: new Date(),
    })
    .where(eq(streakState.userId, userId));
}

/**
 * Update bingo squares based on item answered event
 */
async function updateBingoSquares(
  userId: string,
  today: string,
  data: Extract<GamificationEvent, { type: 'item_answered' }>['data']
): Promise<BingoSquareId[]> {
  const squaresToUpdate: BingoSquareId[] = [];

  // Check which squares to update based on event data
  // review5: Check if we've reviewed 5 words (handled by counter)
  squaresToUpdate.push('review5');

  // streak3: Check consecutive correct
  if (data.consecutiveCorrect && data.consecutiveCorrect >= 3) {
    squaresToUpdate.push('streak3');
  }

  // Exercise type squares
  if (data.exerciseType === 'fill-blank') {
    squaresToUpdate.push('fillBlank');
  } else if (data.exerciseType === 'multiple-choice') {
    squaresToUpdate.push('multipleChoice');
  } else if (data.exerciseType === 'type-translation') {
    squaresToUpdate.push('typeTranslation');
  }

  // Category squares
  if (data.category === 'work') {
    squaresToUpdate.push('workWord');
  } else if (data.category === 'social') {
    squaresToUpdate.push('socialWord');
  }

  // Update each square
  const completedSquares: BingoSquareId[] = [];
  for (const squareId of squaresToUpdate) {
    const completed = await updateBingoSquare(userId, today, squareId);
    if (completed) {
      completedSquares.push(squareId);
    }
  }

  return completedSquares;
}

/**
 * Update a single bingo square
 *
 * Returns true if square was newly completed
 */
async function updateBingoSquare(
  userId: string,
  today: string,
  squareId: BingoSquareId
): Promise<boolean> {
  // Get or create bingo state
  let [bingo] = await db
    .select()
    .from(bingoState)
    .where(
      and(
        eq(bingoState.userId, userId),
        eq(bingoState.date, today)
      )
    );

  if (!bingo) {
    const [newBingo] = await db
      .insert(bingoState)
      .values({
        userId,
        date: today,
        squareDefinitions: DEFAULT_BINGO_SQUARES,
      })
      .returning();
    bingo = newBingo;
  }

  // Check if square already completed
  const completed = bingo.squaresCompleted as BingoSquareId[];
  if (completed.includes(squareId)) {
    return false;
  }

  // Add square to completed list
  const newCompleted = [...completed, squareId];

  // Check for bingo (3 in a row)
  const bingoAchieved = checkBingo(newCompleted);

  await db
    .update(bingoState)
    .set({
      squaresCompleted: newCompleted,
      bingoAchieved,
      bingoAchievedAt: bingoAchieved && !bingo.bingoAchieved ? new Date() : bingo.bingoAchievedAt,
      updatedAt: new Date(),
    })
    .where(eq(bingoState.id, bingo.id));

  return true;
}

/**
 * Check if user has achieved bingo (3 in a row)
 *
 * Board layout (0-indexed):
 * 0 1 2
 * 3 4 5
 * 6 7 8
 *
 * Winning lines:
 * Rows: [0,1,2], [3,4,5], [6,7,8]
 * Cols: [0,3,6], [1,4,7], [2,5,8]
 * Diag: [0,4,8], [2,4,6]
 */
function checkBingo(completedSquares: BingoSquareId[]): boolean {
  // Map square IDs to indices based on DEFAULT_BINGO_SQUARES order
  const squareOrder: BingoSquareId[] = DEFAULT_BINGO_SQUARES.map(s => s.id);
  const completedIndices = completedSquares.map(s => squareOrder.indexOf(s)).filter(i => i !== -1);

  const winningLines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6], // Diagonals
  ];

  for (const line of winningLines) {
    if (line.every(idx => completedIndices.includes(idx))) {
      return true;
    }
  }

  return false;
}
