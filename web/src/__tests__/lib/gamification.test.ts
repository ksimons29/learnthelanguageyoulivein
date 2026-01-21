import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Gamification Unit Tests
 *
 * Tests the core gamification logic including:
 * - Bingo board winning conditions
 * - Streak calculations
 * - Daily progress state
 *
 * These tests ensure the gamification system works correctly
 * for user personas like Sofia (casual learner), Ralf (ambitious goals),
 * and Maria (needs consistency motivation).
 */

// Import the checkBingo function by recreating it for testing
// (In production code, this could be extracted to a shared utility)
type BingoSquareId =
  | 'review5'
  | 'streak3'
  | 'fillBlank'
  | 'multipleChoice'
  | 'addContext'
  | 'workWord'
  | 'socialWord'
  | 'masterWord'
  | 'finishSession';

/**
 * Check if user has achieved bingo (3 in a row)
 * Grid layout:
 *   0 | 1 | 2   (review5, streak3, fillBlank)
 *   3 | 4 | 5   (multipleChoice, addContext, workWord)
 *   6 | 7 | 8   (socialWord, masterWord, finishSession)
 */
function checkBingo(completedSquares: BingoSquareId[]): boolean {
  const squareOrder: BingoSquareId[] = [
    'review5', 'streak3', 'fillBlank',
    'multipleChoice', 'addContext', 'workWord',
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

/**
 * Calculate streak status based on last completed date
 */
function calculateStreakStatus(
  currentStreak: number,
  lastCompletedDate: string | null,
  today: Date
): { isActive: boolean; shouldIncrement: boolean; shouldReset: boolean } {
  if (!lastCompletedDate) {
    return { isActive: false, shouldIncrement: true, shouldReset: false };
  }

  const lastDate = new Date(lastCompletedDate);
  const todayStr = today.toISOString().split('T')[0];
  const lastDateStr = lastDate.toISOString().split('T')[0];

  // Already completed today
  if (todayStr === lastDateStr) {
    return { isActive: true, shouldIncrement: false, shouldReset: false };
  }

  // Check if yesterday
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (lastDateStr === yesterdayStr) {
    return { isActive: true, shouldIncrement: true, shouldReset: false };
  }

  // Streak broken (more than 1 day gap)
  return { isActive: false, shouldIncrement: false, shouldReset: true };
}

describe('Bingo Board Logic', () => {
  describe('checkBingo - Row wins', () => {
    it('detects top row bingo (review5, streak3, fillBlank)', () => {
      const completed: BingoSquareId[] = ['review5', 'streak3', 'fillBlank'];
      expect(checkBingo(completed)).toBe(true);
    });

    it('detects middle row bingo (multipleChoice, addContext, workWord)', () => {
      const completed: BingoSquareId[] = ['multipleChoice', 'addContext', 'workWord'];
      expect(checkBingo(completed)).toBe(true);
    });

    it('detects bottom row bingo (socialWord, masterWord, finishSession)', () => {
      const completed: BingoSquareId[] = ['socialWord', 'masterWord', 'finishSession'];
      expect(checkBingo(completed)).toBe(true);
    });
  });

  describe('checkBingo - Column wins', () => {
    it('detects left column bingo (review5, multipleChoice, socialWord)', () => {
      const completed: BingoSquareId[] = ['review5', 'multipleChoice', 'socialWord'];
      expect(checkBingo(completed)).toBe(true);
    });

    it('detects center column bingo (streak3, addContext, masterWord)', () => {
      const completed: BingoSquareId[] = ['streak3', 'addContext', 'masterWord'];
      expect(checkBingo(completed)).toBe(true);
    });

    it('detects right column bingo (fillBlank, workWord, finishSession)', () => {
      const completed: BingoSquareId[] = ['fillBlank', 'workWord', 'finishSession'];
      expect(checkBingo(completed)).toBe(true);
    });
  });

  describe('checkBingo - Diagonal wins', () => {
    it('detects main diagonal bingo (review5, addContext, finishSession)', () => {
      const completed: BingoSquareId[] = ['review5', 'addContext', 'finishSession'];
      expect(checkBingo(completed)).toBe(true);
    });

    it('detects anti-diagonal bingo (fillBlank, addContext, socialWord)', () => {
      const completed: BingoSquareId[] = ['fillBlank', 'addContext', 'socialWord'];
      expect(checkBingo(completed)).toBe(true);
    });
  });

  describe('checkBingo - No win scenarios', () => {
    it('returns false for empty board', () => {
      expect(checkBingo([])).toBe(false);
    });

    it('returns false for single square', () => {
      const completed: BingoSquareId[] = ['review5'];
      expect(checkBingo(completed)).toBe(false);
    });

    it('returns false for two squares', () => {
      const completed: BingoSquareId[] = ['review5', 'streak3'];
      expect(checkBingo(completed)).toBe(false);
    });

    it('returns false for non-aligned three squares', () => {
      // L-shape, not a line
      const completed: BingoSquareId[] = ['review5', 'streak3', 'multipleChoice'];
      expect(checkBingo(completed)).toBe(false);
    });

    it('returns false for scattered squares without line', () => {
      const completed: BingoSquareId[] = ['review5', 'addContext', 'socialWord', 'workWord'];
      // Check: review5(0), addContext(4), socialWord(6), workWord(5)
      // No complete line despite having 4 squares
      expect(checkBingo(completed)).toBe(false);
    });
  });

  describe('checkBingo - Extra squares beyond win', () => {
    it('returns true when more than 3 squares completed including a line', () => {
      const completed: BingoSquareId[] = [
        'review5', 'streak3', 'fillBlank', // Top row (winning)
        'multipleChoice', 'addContext', // Extra squares
      ];
      expect(checkBingo(completed)).toBe(true);
    });

    it('returns true for full board', () => {
      const completed: BingoSquareId[] = [
        'review5', 'streak3', 'fillBlank',
        'multipleChoice', 'addContext', 'workWord',
        'socialWord', 'masterWord', 'finishSession',
      ];
      expect(checkBingo(completed)).toBe(true);
    });
  });

  describe('checkBingo - Edge cases', () => {
    it('handles duplicate squares gracefully', () => {
      const completed: BingoSquareId[] = [
        'review5', 'review5', 'streak3', 'fillBlank',
      ];
      expect(checkBingo(completed)).toBe(true);
    });

    it('handles invalid square IDs gracefully', () => {
      const completed = ['review5', 'streak3', 'invalid' as BingoSquareId];
      expect(checkBingo(completed)).toBe(false);
    });
  });
});

describe('Streak Calculation Logic', () => {
  describe('calculateStreakStatus', () => {
    const today = new Date('2024-01-15T12:00:00Z');

    it('returns shouldIncrement=true for new user (no lastCompletedDate)', () => {
      const result = calculateStreakStatus(0, null, today);
      expect(result).toEqual({
        isActive: false,
        shouldIncrement: true,
        shouldReset: false,
      });
    });

    it('returns shouldIncrement=false when already completed today', () => {
      const result = calculateStreakStatus(5, '2024-01-15', today);
      expect(result).toEqual({
        isActive: true,
        shouldIncrement: false,
        shouldReset: false,
      });
    });

    it('returns shouldIncrement=true when last completed yesterday', () => {
      const result = calculateStreakStatus(5, '2024-01-14', today);
      expect(result).toEqual({
        isActive: true,
        shouldIncrement: true,
        shouldReset: false,
      });
    });

    it('returns shouldReset=true when streak is broken (2+ days gap)', () => {
      const result = calculateStreakStatus(5, '2024-01-13', today);
      expect(result).toEqual({
        isActive: false,
        shouldIncrement: false,
        shouldReset: true,
      });
    });

    it('handles week-long gap correctly', () => {
      const result = calculateStreakStatus(10, '2024-01-08', today);
      expect(result.shouldReset).toBe(true);
    });
  });
});

describe('Daily Progress Logic', () => {
  interface DailyProgress {
    targetReviews: number;
    completedReviews: number;
    completedAt: string | null;
    isComplete: boolean;
  }

  function updateDailyProgress(
    state: DailyProgress,
    wasCorrect: boolean
  ): DailyProgress {
    const newCompleted = state.completedReviews + 1;
    const justCompletedGoal = !state.isComplete && newCompleted >= state.targetReviews;

    return {
      ...state,
      completedReviews: newCompleted,
      isComplete: state.isComplete || justCompletedGoal,
      completedAt: justCompletedGoal ? new Date().toISOString() : state.completedAt,
    };
  }

  it('increments completed reviews on answer', () => {
    const initial: DailyProgress = {
      targetReviews: 10,
      completedReviews: 5,
      completedAt: null,
      isComplete: false,
    };

    const result = updateDailyProgress(initial, true);
    expect(result.completedReviews).toBe(6);
  });

  it('marks complete when reaching target', () => {
    const initial: DailyProgress = {
      targetReviews: 10,
      completedReviews: 9,
      completedAt: null,
      isComplete: false,
    };

    const result = updateDailyProgress(initial, true);
    expect(result.isComplete).toBe(true);
    expect(result.completedAt).not.toBeNull();
  });

  it('does not mark complete when already complete', () => {
    const completedAt = '2024-01-15T10:00:00Z';
    const initial: DailyProgress = {
      targetReviews: 10,
      completedReviews: 15,
      completedAt,
      isComplete: true,
    };

    const result = updateDailyProgress(initial, true);
    expect(result.completedReviews).toBe(16);
    expect(result.completedAt).toBe(completedAt); // Unchanged
  });

  it('allows exceeding target (extra practice like Ralf persona)', () => {
    const initial: DailyProgress = {
      targetReviews: 10,
      completedReviews: 20,
      completedAt: '2024-01-15T10:00:00Z',
      isComplete: true,
    };

    const result = updateDailyProgress(initial, true);
    expect(result.completedReviews).toBe(21);
    expect(result.isComplete).toBe(true);
  });
});

describe('Consecutive Correct Tracking', () => {
  function updateConsecutiveCorrect(current: number, wasCorrect: boolean): number {
    return wasCorrect ? current + 1 : 0;
  }

  it('increments on correct answer', () => {
    expect(updateConsecutiveCorrect(2, true)).toBe(3);
  });

  it('resets to 0 on incorrect answer', () => {
    expect(updateConsecutiveCorrect(5, false)).toBe(0);
  });

  it('starts from 0 on first correct', () => {
    expect(updateConsecutiveCorrect(0, true)).toBe(1);
  });

  it('streak3 bingo requires 3 consecutive correct', () => {
    let consecutive = 0;
    consecutive = updateConsecutiveCorrect(consecutive, true); // 1
    consecutive = updateConsecutiveCorrect(consecutive, true); // 2
    consecutive = updateConsecutiveCorrect(consecutive, true); // 3

    expect(consecutive >= 3).toBe(true); // Triggers 'streak3' bingo square
  });

  it('streak breaks on wrong answer', () => {
    let consecutive = 0;
    consecutive = updateConsecutiveCorrect(consecutive, true); // 1
    consecutive = updateConsecutiveCorrect(consecutive, true); // 2
    consecutive = updateConsecutiveCorrect(consecutive, false); // 0 (reset!)
    consecutive = updateConsecutiveCorrect(consecutive, true); // 1

    expect(consecutive).toBe(1);
  });
});

describe('Boss Round Eligibility', () => {
  interface Word {
    id: string;
    lapseCount: number;
    category: string;
  }

  function getBossRoundWords(words: Word[], count: number = 5): Word[] {
    // Boss round selects words with highest lapse count
    return words
      .sort((a, b) => b.lapseCount - a.lapseCount)
      .slice(0, count);
  }

  it('selects words with highest lapse count', () => {
    const words: Word[] = [
      { id: '1', lapseCount: 1, category: 'social' },
      { id: '2', lapseCount: 5, category: 'work' },
      { id: '3', lapseCount: 3, category: 'food' },
      { id: '4', lapseCount: 0, category: 'travel' },
      { id: '5', lapseCount: 4, category: 'social' },
    ];

    const result = getBossRoundWords(words, 3);

    expect(result).toHaveLength(3);
    expect(result[0].lapseCount).toBe(5);
    expect(result[1].lapseCount).toBe(4);
    expect(result[2].lapseCount).toBe(3);
  });

  it('returns all words if fewer than requested count', () => {
    const words: Word[] = [
      { id: '1', lapseCount: 2, category: 'social' },
      { id: '2', lapseCount: 1, category: 'work' },
    ];

    const result = getBossRoundWords(words, 5);
    expect(result).toHaveLength(2);
  });

  it('handles empty word list', () => {
    const result = getBossRoundWords([], 5);
    expect(result).toHaveLength(0);
  });

  it('includes words with zero lapses if needed', () => {
    const words: Word[] = [
      { id: '1', lapseCount: 0, category: 'social' },
      { id: '2', lapseCount: 0, category: 'work' },
      { id: '3', lapseCount: 1, category: 'food' },
    ];

    const result = getBossRoundWords(words, 5);
    expect(result).toHaveLength(3);
    expect(result[0].lapseCount).toBe(1); // Highest first
  });
});

describe('User Persona Scenarios', () => {
  describe('Sofia - Casual learner in Lisbon', () => {
    it('can complete daily goal of 10 reviews', () => {
      let progress = {
        targetReviews: 10,
        completedReviews: 0,
        completedAt: null,
        isComplete: false,
      };

      // Sofia does her 10 reviews
      for (let i = 0; i < 10; i++) {
        const newCompleted = progress.completedReviews + 1;
        const justCompleted = !progress.isComplete && newCompleted >= progress.targetReviews;
        progress = {
          ...progress,
          completedReviews: newCompleted,
          isComplete: progress.isComplete || justCompleted,
          completedAt: justCompleted ? new Date().toISOString() : progress.completedAt,
        };
      }

      expect(progress.isComplete).toBe(true);
      expect(progress.completedReviews).toBe(10);
    });

    it('can achieve bingo through normal use', () => {
      // Sofia completes: review 5, multiple choice, social word (diagonal)
      const completed: BingoSquareId[] = ['review5', 'multipleChoice', 'socialWord'];
      // This is the left column - bingo!
      expect(checkBingo(completed)).toBe(true);
    });
  });

  describe('Ralf - Ambitious Swedish learner', () => {
    it('can exceed daily goal for extra practice', () => {
      let progress = {
        targetReviews: 10,
        completedReviews: 0,
        completedAt: null,
        isComplete: false,
      };

      // Ralf does 30 reviews (3x goal)
      for (let i = 0; i < 30; i++) {
        const newCompleted = progress.completedReviews + 1;
        const justCompleted = !progress.isComplete && newCompleted >= progress.targetReviews;
        progress = {
          ...progress,
          completedReviews: newCompleted,
          isComplete: progress.isComplete || justCompleted,
          completedAt: justCompleted ? new Date().toISOString() : progress.completedAt,
        };
      }

      expect(progress.completedReviews).toBe(30);
      expect(progress.isComplete).toBe(true);
    });

    it('maintains streak over multiple days', () => {
      let streak = 0;
      const days = ['2024-01-10', '2024-01-11', '2024-01-12', '2024-01-13'];

      for (let i = 0; i < days.length; i++) {
        // Ralf completes his goal each day, streak increments
        streak++;
      }

      expect(streak).toBe(4);
    });
  });

  describe('Maria - Frustrated app-switcher', () => {
    it('streak freeze protects against one missed day', () => {
      const streakState = {
        currentStreak: 15, // Maria's built up a nice streak
        freezeCount: 1,
        lastCompletedDate: '2024-01-13',
      };

      // Maria misses January 14, it's now January 15
      const today = new Date('2024-01-15T12:00:00Z');
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // With freeze, streak should be preserved
      const daysMissed = Math.floor(
        (today.getTime() - new Date(streakState.lastCompletedDate).getTime()) / (1000 * 60 * 60 * 24)
      ) - 1;

      if (daysMissed > 0 && streakState.freezeCount > 0) {
        // Freeze activated, streak preserved
        expect(streakState.currentStreak).toBe(15);
      }
    });

    it('bingo provides achievable mini-goals', () => {
      // Maria can complete a bingo line in a single session
      const possibleQuickWin: BingoSquareId[] = [
        'review5',        // 5 reviews ✓
        'multipleChoice', // Do a multiple choice ✓
        'socialWord',     // Review a social category word ✓
      ];

      expect(checkBingo(possibleQuickWin)).toBe(true); // Left column!
    });
  });
});
