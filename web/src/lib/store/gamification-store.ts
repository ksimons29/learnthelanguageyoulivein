import { create } from 'zustand';
import type { BingoSquareId } from '@/lib/db/schema';

/**
 * Gamification Store
 *
 * Manages gamification state including daily progress, streaks, and bingo board.
 * State is synced with the server on fetch and updated optimistically on events.
 */

interface DailyProgress {
  targetReviews: number;
  completedReviews: number;
  completedAt: string | null;
  isComplete: boolean;
}

interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  streakFreezeCount: number;
}

interface BingoState {
  squaresCompleted: BingoSquareId[];
  squareDefinitions: { id: BingoSquareId; label: string; target: number }[];
  bingoAchieved: boolean;
  bingoAchievedAt: string | null;
}

interface GamificationStoreState {
  // State
  daily: DailyProgress | null;
  streak: StreakState | null;
  bingo: BingoState | null;
  isLoading: boolean;
  error: string | null;

  // Session tracking for consecutive correct
  consecutiveCorrect: number;

  // UI state
  showDailyGoalCelebration: boolean;
  showBingoCelebration: boolean;

  // Actions
  fetchState: () => Promise<void>;
  emitItemAnswered: (data: {
    wordId: string;
    rating: 1 | 2 | 3 | 4;
    exerciseType: 'fill-blank' | 'multiple-choice' | 'type-translation';
    category?: string;
  }) => Promise<void>;
  emitSessionCompleted: (data: { wordsReviewed: number; correctCount: number }) => Promise<void>;
  emitWordMastered: (wordId: string) => Promise<void>;
  dismissDailyGoalCelebration: () => void;
  dismissBingoCelebration: () => void;
  resetSession: () => void;
}

export const useGamificationStore = create<GamificationStoreState>((set, get) => ({
  // Initial state
  daily: null,
  streak: null,
  bingo: null,
  isLoading: false,
  error: null,
  consecutiveCorrect: 0,
  showDailyGoalCelebration: false,
  showBingoCelebration: false,

  /**
   * Fetch current gamification state from server
   */
  fetchState: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/gamification/state');
      if (!response.ok) {
        throw new Error('Failed to fetch gamification state');
      }

      const { data } = await response.json();
      set({
        daily: data.daily,
        streak: data.streak,
        bingo: data.bingo,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch state',
        isLoading: false,
      });
    }
  },

  /**
   * Emit item_answered event
   *
   * Called after each review item is answered.
   * Updates daily progress and bingo board.
   */
  emitItemAnswered: async (data) => {
    const state = get();
    const wasCorrect = data.rating >= 3;

    // Update consecutive correct count
    const newConsecutiveCorrect = wasCorrect ? state.consecutiveCorrect + 1 : 0;
    set({ consecutiveCorrect: newConsecutiveCorrect });

    // Optimistic update for daily progress
    if (state.daily) {
      const newCompleted = state.daily.completedReviews + 1;
      const justCompletedGoal = !state.daily.isComplete && newCompleted >= state.daily.targetReviews;

      set({
        daily: {
          ...state.daily,
          completedReviews: newCompleted,
          isComplete: state.daily.isComplete || justCompletedGoal,
          completedAt: justCompletedGoal ? new Date().toISOString() : state.daily.completedAt,
        },
        showDailyGoalCelebration: justCompletedGoal,
      });

      // Update streak optimistically if daily goal just completed
      if (justCompletedGoal && state.streak) {
        const newCurrentStreak = state.streak.currentStreak + 1;
        set({
          streak: {
            ...state.streak,
            currentStreak: newCurrentStreak,
            longestStreak: Math.max(state.streak.longestStreak, newCurrentStreak),
            lastCompletedDate: new Date().toISOString().split('T')[0],
          },
        });
      }
    }

    // Send event to server (fire-and-forget with error handling)
    try {
      const response = await fetch('/api/gamification/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: {
            type: 'item_answered',
            data: {
              ...data,
              wasCorrect,
              consecutiveCorrect: newConsecutiveCorrect,
            },
          },
        }),
      });

      if (response.ok) {
        const { data: responseData } = await response.json();

        // Check if bingo was achieved
        if (state.bingo && responseData.bingoUpdates?.length > 0) {
          const newCompleted = [...(state.bingo.squaresCompleted || [])];
          for (const squareId of responseData.bingoUpdates) {
            if (!newCompleted.includes(squareId)) {
              newCompleted.push(squareId);
            }
          }

          // Check if this caused a bingo
          const hadBingo = state.bingo.bingoAchieved;
          const hasBingo = checkBingo(newCompleted);

          set({
            bingo: {
              ...state.bingo,
              squaresCompleted: newCompleted,
              bingoAchieved: hasBingo,
            },
            showBingoCelebration: hasBingo && !hadBingo,
          });
        }
      }
    } catch (error) {
      console.error('Failed to emit item_answered event:', error);
      // Don't revert optimistic update - will sync on next fetch
    }
  },

  /**
   * Emit session_completed event
   */
  emitSessionCompleted: async (data) => {
    try {
      await fetch('/api/gamification/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: {
            type: 'session_completed',
            data,
          },
        }),
      });
    } catch (error) {
      console.error('Failed to emit session_completed event:', error);
    }
  },

  /**
   * Emit word_mastered event
   */
  emitWordMastered: async (wordId) => {
    try {
      await fetch('/api/gamification/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: {
            type: 'word_mastered',
            data: { wordId },
          },
        }),
      });
    } catch (error) {
      console.error('Failed to emit word_mastered event:', error);
    }
  },

  dismissDailyGoalCelebration: () => set({ showDailyGoalCelebration: false }),

  dismissBingoCelebration: () => set({ showBingoCelebration: false }),

  resetSession: () => set({ consecutiveCorrect: 0 }),
}));

/**
 * Check if user has achieved bingo (3 in a row)
 */
function checkBingo(completedSquares: BingoSquareId[]): boolean {
  const squareOrder: BingoSquareId[] = [
    'review5', 'streak3', 'fillBlank',
    'multipleChoice', 'typeTranslation', 'workWord',
    'socialWord', 'masterWord', 'finishSession',
  ];
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
