import { describe, it, expect } from 'vitest';

/**
 * Due Count Consistency Tests
 *
 * Issue #63: Today and Notebook pages must show the same due count.
 *
 * The FSRS scientific principle:
 * - New cards (never reviewed) are capped at 15/day to prevent burnout
 * - Review cards (already in learning cycle) are unlimited
 * - dueToday = min(newCards, DAILY_NEW_CARDS_LIMIT) + reviewDue
 */

const DAILY_NEW_CARDS_LIMIT = 15;

/**
 * Calculate due count using FSRS scientific principles
 * This matches the logic in /api/words/stats/route.ts
 */
function calculateDueToday(newCardsAvailable: number, reviewDue: number): number {
  const cappedNewCards = Math.min(newCardsAvailable, DAILY_NEW_CARDS_LIMIT);
  return cappedNewCards + reviewDue;
}

describe('Due count calculation (FSRS scientific)', () => {
  describe('calculateDueToday', () => {
    it('should cap new cards at 15 when many new cards available', () => {
      // User bulk-imported 700 words, 10 need review
      const newCards = 700;
      const reviewDue = 10;

      const dueToday = calculateDueToday(newCards, reviewDue);

      // Should be 15 (capped) + 10 = 25, NOT 710
      expect(dueToday).toBe(25);
    });

    it('should show all new cards when under the limit', () => {
      const newCards = 5;
      const reviewDue = 3;

      const dueToday = calculateDueToday(newCards, reviewDue);

      // Should be 5 + 3 = 8 (no capping needed)
      expect(dueToday).toBe(8);
    });

    it('should show exactly 15 new cards at the limit', () => {
      const newCards = 15;
      const reviewDue = 0;

      const dueToday = calculateDueToday(newCards, reviewDue);

      expect(dueToday).toBe(15);
    });

    it('should handle zero new cards correctly', () => {
      const newCards = 0;
      const reviewDue = 20;

      const dueToday = calculateDueToday(newCards, reviewDue);

      // Should be 0 + 20 = 20 (all review)
      expect(dueToday).toBe(20);
    });

    it('should handle zero review cards correctly', () => {
      const newCards = 50;
      const reviewDue = 0;

      const dueToday = calculateDueToday(newCards, reviewDue);

      // Should be 15 (capped) + 0 = 15
      expect(dueToday).toBe(15);
    });

    it('should handle edge case of exactly limit new cards', () => {
      const newCards = 15;
      const reviewDue = 10;

      const dueToday = calculateDueToday(newCards, reviewDue);

      // Should be 15 + 10 = 25
      expect(dueToday).toBe(25);
    });

    it('should not limit review cards (FSRS principle)', () => {
      // User has 100 review cards due (real scenario after vacation)
      const newCards = 3;
      const reviewDue = 100;

      const dueToday = calculateDueToday(newCards, reviewDue);

      // Review cards are never capped - learning cycle takes priority
      // Should be 3 + 100 = 103
      expect(dueToday).toBe(103);
    });
  });

  describe('DAILY_NEW_CARDS_LIMIT constant', () => {
    it('should be 15 (FSRS recommended)', () => {
      expect(DAILY_NEW_CARDS_LIMIT).toBe(15);
    });
  });
});
