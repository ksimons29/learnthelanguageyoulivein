/**
 * FSRS Algorithm Unit Tests
 *
 * These tests verify the FSRS-4.5 spaced repetition implementation.
 * The algorithm is the scientific foundation of LLYLI's learning system.
 *
 * Key concepts tested:
 * - Forgetting curve: R(t) = (1 + t/(9·S))^(-1)
 * - Stability growth on successful reviews
 * - Stability decay on lapses (Again rating)
 * - Mastery progression (3 correct sessions)
 * - Session separation (different sessionId required)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calculateRetrievability,
  daysBetween,
  isDue,
  toFsrsRating,
  wordToCard,
  processReview,
  getNextReviewText,
  Rating,
} from '@/lib/fsrs';
import type { Word } from '@/lib/db/schema';

// Helper to create a mock Word with FSRS fields
function createMockWord(overrides: Partial<Word> = {}): Word {
  const now = new Date();
  return {
    id: 'test-word-id',
    userId: 'test-user-id',
    originalText: 'test',
    translation: 'teste',
    sourceLang: 'en',
    category: 'other',
    audioUrl: null,
    memoryContext: null,
    difficulty: 5.0,
    stability: 1.0,
    retrievability: 1.0,
    nextReviewDate: now,
    lastReviewDate: null,
    reviewCount: 0,
    lapseCount: 0,
    consecutiveCorrectSessions: 0,
    lastCorrectSessionId: null,
    masteryStatus: 'learning',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  } as Word;
}

describe('FSRS Algorithm', () => {
  // ─────────────────────────────────────────────────────────────────
  // calculateRetrievability - Forgetting Curve Tests
  // Formula: R(t) = (1 + t/(9·S))^(-1)
  // ─────────────────────────────────────────────────────────────────
  describe('calculateRetrievability', () => {
    it('returns 1.0 when daysSinceReview is 0 or negative', () => {
      expect(calculateRetrievability(10, 0)).toBe(1.0);
      expect(calculateRetrievability(10, -1)).toBe(1.0);
      expect(calculateRetrievability(1, 0)).toBe(1.0);
    });

    it('follows power law decay: R(t) = (1 + t/(9·S))^(-1)', () => {
      // With S=10, at t=10 days: R = (1 + 10/(9*10))^(-1) = (1 + 1/9)^(-1) = 0.9
      const r = calculateRetrievability(10, 10);
      expect(r).toBeCloseTo(0.9, 2);
    });

    it('returns 90% retrievability at t = S (stability equals elapsed days)', () => {
      // This is the key FSRS property: when t = S, R ≈ 90%
      // R(S) = (1 + S/(9·S))^(-1) = (1 + 1/9)^(-1) = 9/10 = 0.9
      expect(calculateRetrievability(1, 1)).toBeCloseTo(0.9, 2);
      expect(calculateRetrievability(10, 10)).toBeCloseTo(0.9, 2);
      expect(calculateRetrievability(30, 30)).toBeCloseTo(0.9, 2);
    });

    it('decays faster with lower stability', () => {
      const lowStability = calculateRetrievability(1, 5);
      const highStability = calculateRetrievability(10, 5);
      expect(lowStability).toBeLessThan(highStability);
    });

    it('approaches 0 as time increases', () => {
      // After 100 days with S=1, retrievability should be very low
      const r = calculateRetrievability(1, 100);
      expect(r).toBeLessThan(0.1);
    });

    it('handles very high stability values', () => {
      // S=365 (1 year stability), after 30 days
      const r = calculateRetrievability(365, 30);
      expect(r).toBeGreaterThan(0.9); // Should still be > 90%
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // daysBetween - Date Utility Tests
  // ─────────────────────────────────────────────────────────────────
  describe('daysBetween', () => {
    it('returns 0 when date1 is null', () => {
      expect(daysBetween(null, new Date())).toBe(0);
    });

    it('calculates correct days between dates', () => {
      const date1 = new Date('2026-01-01');
      const date2 = new Date('2026-01-11');
      expect(daysBetween(date1, date2)).toBe(10);
    });

    it('returns 0 for same date', () => {
      const date = new Date('2026-01-15');
      expect(daysBetween(date, date)).toBe(0);
    });

    it('handles negative days (date2 before date1)', () => {
      const date1 = new Date('2026-01-15');
      const date2 = new Date('2026-01-10');
      expect(daysBetween(date1, date2)).toBe(-5);
    });

    it('floors partial days', () => {
      const date1 = new Date('2026-01-01T00:00:00');
      const date2 = new Date('2026-01-02T12:00:00'); // 1.5 days
      expect(daysBetween(date1, date2)).toBe(1);
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // isDue - Due Word Detection Tests
  // ─────────────────────────────────────────────────────────────────
  describe('isDue', () => {
    it('returns true for new words (never reviewed)', () => {
      const word = createMockWord({ lastReviewDate: null });
      expect(isDue(word)).toBe(true);
    });

    it('returns false for recently reviewed words', () => {
      const word = createMockWord({
        lastReviewDate: new Date(),
        stability: 10,
      });
      expect(isDue(word)).toBe(false);
    });

    it('returns true when retrievability drops below 90%', () => {
      // Word reviewed 15 days ago with stability 10
      // R = (1 + 15/(9*10))^(-1) = (1 + 15/90)^(-1) ≈ 0.857 < 0.9
      const fifteenDaysAgo = new Date();
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

      const word = createMockWord({
        lastReviewDate: fifteenDaysAgo,
        stability: 10,
      });
      expect(isDue(word)).toBe(true);
    });

    it('returns false when retrievability is above 90%', () => {
      // Word reviewed 5 days ago with stability 10
      // R = (1 + 5/(9*10))^(-1) = (1 + 5/90)^(-1) ≈ 0.947 > 0.9
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

      const word = createMockWord({
        lastReviewDate: fiveDaysAgo,
        stability: 10,
      });
      expect(isDue(word)).toBe(false);
    });

    it('respects custom threshold', () => {
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

      const word = createMockWord({
        lastReviewDate: tenDaysAgo,
        stability: 10,
      });

      // At t=S, R=90%. isDue returns true when R < threshold
      // So at exactly R=0.9, isDue(word, 0.9) checks if 0.9 < 0.9 = false
      // But due to floating point, it's very close to 0.9
      expect(isDue(word, 0.95)).toBe(true); // Higher threshold = due sooner (0.9 < 0.95)
      expect(isDue(word, 0.85)).toBe(false); // Lower threshold = due later (0.9 > 0.85)
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // toFsrsRating - Rating Conversion Tests
  // ─────────────────────────────────────────────────────────────────
  describe('toFsrsRating', () => {
    it('converts 1 to Rating.Again', () => {
      expect(toFsrsRating(1)).toBe(Rating.Again);
    });

    it('converts 2 to Rating.Hard', () => {
      expect(toFsrsRating(2)).toBe(Rating.Hard);
    });

    it('converts 3 to Rating.Good', () => {
      expect(toFsrsRating(3)).toBe(Rating.Good);
    });

    it('converts 4 to Rating.Easy', () => {
      expect(toFsrsRating(4)).toBe(Rating.Easy);
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // wordToCard - Word to FSRS Card Conversion Tests
  // ─────────────────────────────────────────────────────────────────
  describe('wordToCard', () => {
    it('creates card with correct stability and difficulty', () => {
      const word = createMockWord({
        stability: 5.5,
        difficulty: 6.2,
      });
      const card = wordToCard(word);

      expect(card.stability).toBe(5.5);
      expect(card.difficulty).toBe(6.2);
    });

    it('sets state to New for words with reviewCount 0', () => {
      const word = createMockWord({ reviewCount: 0 });
      const card = wordToCard(word);

      expect(card.state).toBe(0); // State.New = 0
    });

    it('sets state to Review for words with reviewCount > 0', () => {
      const word = createMockWord({ reviewCount: 5 });
      const card = wordToCard(word);

      expect(card.state).toBe(2); // State.Review = 2
    });

    it('includes lapse count', () => {
      const word = createMockWord({ lapseCount: 3 });
      const card = wordToCard(word);

      expect(card.lapses).toBe(3);
    });

    it('includes review count as reps', () => {
      const word = createMockWord({ reviewCount: 10 });
      const card = wordToCard(word);

      expect(card.reps).toBe(10);
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // processReview - Core FSRS Processing Tests
  // ─────────────────────────────────────────────────────────────────
  describe('processReview', () => {
    const sessionId = 'test-session-123';

    describe('stability changes', () => {
      it('increases stability on Good rating for reviewed word', () => {
        // Use a word that has been reviewed multiple times (not new)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const word = createMockWord({
          stability: 2.0,
          difficulty: 5.0,
          reviewCount: 3, // Has been reviewed before
          lastReviewDate: yesterday,
        });

        const updates = processReview(word, 3, sessionId); // Good

        expect(updates.stability).toBeGreaterThan(2.0);
      });

      it('increases stability more on Easy rating than Good rating', () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const word = createMockWord({
          stability: 2.0,
          difficulty: 5.0,
          reviewCount: 3,
          lastReviewDate: yesterday,
        });

        const goodUpdates = processReview(word, 3, 'session-1'); // Good
        const easyUpdates = processReview(word, 4, 'session-2'); // Easy

        expect(easyUpdates.stability).toBeGreaterThan(goodUpdates.stability!);
      });

      it('decreases stability on Again rating (lapse)', () => {
        const word = createMockWord({
          stability: 10.0,
          reviewCount: 5,
          lastReviewDate: new Date(),
        });

        const updates = processReview(word, 1, sessionId); // Again

        expect(updates.stability).toBeLessThan(10.0);
      });
    });

    describe('lapse tracking', () => {
      it('increments lapseCount on Again rating', () => {
        const word = createMockWord({ lapseCount: 2 });

        const updates = processReview(word, 1, sessionId); // Again

        expect(updates.lapseCount).toBe(3);
      });

      it('does not increment lapseCount on Good rating', () => {
        const word = createMockWord({ lapseCount: 2 });

        const updates = processReview(word, 3, sessionId); // Good

        expect(updates.lapseCount).toBe(2);
      });

      it('does not increment lapseCount on Hard rating', () => {
        const word = createMockWord({ lapseCount: 2 });

        const updates = processReview(word, 2, sessionId); // Hard

        expect(updates.lapseCount).toBe(2);
      });
    });

    describe('review count', () => {
      it('always increments reviewCount', () => {
        const word = createMockWord({ reviewCount: 5 });

        const againUpdates = processReview(word, 1, sessionId);
        expect(againUpdates.reviewCount).toBe(6);

        const goodUpdates = processReview(word, 3, sessionId);
        expect(goodUpdates.reviewCount).toBe(6);
      });
    });

    describe('mastery progression', () => {
      it('increments consecutiveCorrectSessions on Good rating with new session', () => {
        const word = createMockWord({
          consecutiveCorrectSessions: 1,
          lastCorrectSessionId: 'old-session',
        });

        const updates = processReview(word, 3, 'new-session'); // Good, different session

        expect(updates.consecutiveCorrectSessions).toBe(2);
        expect(updates.lastCorrectSessionId).toBe('new-session');
      });

      it('does NOT increment consecutiveCorrectSessions on same session', () => {
        const word = createMockWord({
          consecutiveCorrectSessions: 1,
          lastCorrectSessionId: 'same-session',
        });

        const updates = processReview(word, 3, 'same-session'); // Good, SAME session

        // Should stay at 1, not increment to 2
        expect(updates.consecutiveCorrectSessions).toBeUndefined();
      });

      it('sets masteryStatus to ready_to_use at 3 consecutive correct sessions', () => {
        const word = createMockWord({
          consecutiveCorrectSessions: 2,
          lastCorrectSessionId: 'session-2',
          masteryStatus: 'learned',
        });

        const updates = processReview(word, 3, 'session-3'); // 3rd correct session

        expect(updates.consecutiveCorrectSessions).toBe(3);
        expect(updates.masteryStatus).toBe('ready_to_use');
      });

      it('sets masteryStatus to learned at 1 consecutive correct session', () => {
        const word = createMockWord({
          consecutiveCorrectSessions: 0,
          lastCorrectSessionId: null,
          masteryStatus: 'learning',
        });

        const updates = processReview(word, 3, sessionId); // 1st correct

        expect(updates.consecutiveCorrectSessions).toBe(1);
        expect(updates.masteryStatus).toBe('learned');
      });

      it('resets consecutiveCorrectSessions to 0 on Again rating', () => {
        const word = createMockWord({
          consecutiveCorrectSessions: 2,
          lastCorrectSessionId: 'session-2',
          masteryStatus: 'learned',
        });

        const updates = processReview(word, 1, sessionId); // Again

        expect(updates.consecutiveCorrectSessions).toBe(0);
        expect(updates.lastCorrectSessionId).toBeNull();
        expect(updates.masteryStatus).toBe('learning');
      });

      it('resets consecutiveCorrectSessions to 0 on Hard rating', () => {
        const word = createMockWord({
          consecutiveCorrectSessions: 2,
          lastCorrectSessionId: 'session-2',
        });

        const updates = processReview(word, 2, sessionId); // Hard

        expect(updates.consecutiveCorrectSessions).toBe(0);
        expect(updates.masteryStatus).toBe('learning');
      });

      it('increments on Easy rating (rating >= 3)', () => {
        const word = createMockWord({
          consecutiveCorrectSessions: 1,
          lastCorrectSessionId: 'session-1',
        });

        const updates = processReview(word, 4, 'session-2'); // Easy

        expect(updates.consecutiveCorrectSessions).toBe(2);
      });
    });

    describe('next review date', () => {
      it('sets nextReviewDate in the future', () => {
        const word = createMockWord();
        const now = new Date();

        const updates = processReview(word, 3, sessionId);

        expect(updates.nextReviewDate).toBeDefined();
        expect(updates.nextReviewDate!.getTime()).toBeGreaterThanOrEqual(
          now.getTime()
        );
      });

      it('sets shorter interval on Again than Good', () => {
        const word = createMockWord({
          stability: 5.0,
          reviewCount: 3,
          lastReviewDate: new Date(),
        });

        const againUpdates = processReview(word, 1, 'session-1');
        const goodUpdates = processReview(word, 3, 'session-2');

        const againInterval =
          againUpdates.nextReviewDate!.getTime() - Date.now();
        const goodInterval = goodUpdates.nextReviewDate!.getTime() - Date.now();

        expect(againInterval).toBeLessThan(goodInterval);
      });
    });

    describe('retrievability reset', () => {
      it('resets retrievability to 1.0 after review', () => {
        const word = createMockWord({ retrievability: 0.7 });

        const updates = processReview(word, 3, sessionId);

        expect(updates.retrievability).toBe(1.0);
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // getNextReviewText - Human-Readable Text Tests
  // ─────────────────────────────────────────────────────────────────
  describe('getNextReviewText', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-22T12:00:00'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns "Review now" for past dates', () => {
      const pastDate = new Date('2026-01-20');
      expect(getNextReviewText(pastDate)).toBe('Review now');
    });

    it('returns day name for dates within a week', () => {
      const threeDaysLater = new Date('2026-01-25'); // Sunday (Jan 22 + 3 = Jan 25)
      expect(getNextReviewText(threeDaysLater)).toBe('Sunday');
    });

    it('returns "In about a week" for 7-13 days', () => {
      const tenDaysLater = new Date('2026-02-01');
      expect(getNextReviewText(tenDaysLater)).toBe('In about a week');
    });

    it('returns "In X weeks" for 14-29 days', () => {
      const threeWeeksLater = new Date('2026-02-12');
      expect(getNextReviewText(threeWeeksLater)).toBe('In 3 weeks');
    });

    it('returns "In about X months" for 30+ days', () => {
      const twoMonthsLater = new Date('2026-03-25');
      expect(getNextReviewText(twoMonthsLater)).toBe('In about 2 months');
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // FSRS Scientific Properties (Integration-style tests)
  // ─────────────────────────────────────────────────────────────────
  describe('FSRS Scientific Properties', () => {
    it('interval grows with repeated Good ratings', () => {
      let word = createMockWord();
      const intervals: number[] = [];

      // Simulate 5 review cycles with Good rating
      for (let i = 0; i < 5; i++) {
        const updates = processReview(word, 3, `session-${i}`);

        // Calculate interval in days
        const interval = Math.round(
          (updates.nextReviewDate!.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        intervals.push(interval);

        // Apply updates for next iteration
        word = { ...word, ...updates } as Word;
      }

      // Each interval should be >= previous (monotonic increase)
      for (let i = 1; i < intervals.length; i++) {
        expect(intervals[i]).toBeGreaterThanOrEqual(intervals[i - 1]);
      }
    });

    it('mastery requires exactly 3 sessions with correct answers', () => {
      let word = createMockWord();

      // Session 1: Good
      let updates = processReview(word, 3, 'session-1');
      word = { ...word, ...updates } as Word;
      expect(word.consecutiveCorrectSessions).toBe(1);
      expect(word.masteryStatus).toBe('learned');

      // Session 2: Good
      updates = processReview(word, 3, 'session-2');
      word = { ...word, ...updates } as Word;
      expect(word.consecutiveCorrectSessions).toBe(2);
      expect(word.masteryStatus).toBe('learned');

      // Session 3: Good → MASTERY
      updates = processReview(word, 3, 'session-3');
      word = { ...word, ...updates } as Word;
      expect(word.consecutiveCorrectSessions).toBe(3);
      expect(word.masteryStatus).toBe('ready_to_use');
    });

    it('mastery resets completely on lapse after being mastered', () => {
      const word = createMockWord({
        consecutiveCorrectSessions: 3,
        masteryStatus: 'ready_to_use',
        lastCorrectSessionId: 'session-3',
      });

      const updates = processReview(word, 1, 'session-4'); // Again = lapse

      expect(updates.consecutiveCorrectSessions).toBe(0);
      expect(updates.masteryStatus).toBe('learning');
    });

    it('Hard rating is treated as incorrect for mastery', () => {
      const word = createMockWord({
        consecutiveCorrectSessions: 2,
        masteryStatus: 'learned',
      });

      const updates = processReview(word, 2, 'session-3'); // Hard

      // Hard resets mastery progress (treated as struggling)
      expect(updates.consecutiveCorrectSessions).toBe(0);
      expect(updates.masteryStatus).toBe('learning');
    });

    it('same session reviews do not count toward mastery', () => {
      const word = createMockWord({
        consecutiveCorrectSessions: 1,
        lastCorrectSessionId: 'session-1',
      });

      // Review again in SAME session
      const updates = processReview(word, 3, 'session-1'); // Same session

      // Should not increment
      expect(updates.consecutiveCorrectSessions).toBeUndefined();
      expect(word.consecutiveCorrectSessions).toBe(1); // Unchanged
    });

    it('lapse increases lapseCount and decreases stability', () => {
      const word = createMockWord({
        stability: 15.0,
        lapseCount: 0,
        reviewCount: 5,
        lastReviewDate: new Date(),
      });

      const updates = processReview(word, 1, 'session-1'); // Again

      expect(updates.lapseCount).toBe(1);
      expect(updates.stability).toBeLessThan(15.0);
    });
  });
});
