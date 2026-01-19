/**
 * FSRS (Free Spaced Repetition Scheduler) Utilities
 *
 * This module provides functions for the spaced repetition algorithm.
 * FSRS uses a power law forgetting curve: R(t) = (1 + t/(9·S))^(-1)
 *
 * Key concepts:
 * - Stability (S): Days until retrievability drops to 90%
 * - Retrievability (R): Probability of successful recall (0-1)
 * - A word is "due" when R < 0.9 (90% recall threshold)
 *
 * Reference: /docs/engineering/FSRS_IMPLEMENTATION.md
 */

import {
  createEmptyCard,
  fsrs,
  generatorParameters,
  Rating,
  State,
  Card,
  type Grade,
} from 'ts-fsrs';
import type { Word } from '@/lib/db/schema';

// Initialize FSRS with default FSRS-4.5 parameters
const params = generatorParameters();
const f = fsrs(params);

/**
 * Calculate current retrievability based on stability and days since review
 * Formula: R(t) = (1 + t/(9·S))^(-1)
 */
export function calculateRetrievability(
  stability: number,
  daysSinceReview: number
): number {
  if (daysSinceReview <= 0) return 1.0;
  return Math.pow(1 + daysSinceReview / (9 * stability), -1);
}

/**
 * Calculate days between two dates
 */
export function daysBetween(date1: Date | null, date2: Date): number {
  if (!date1) return 0;
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((date2.getTime() - date1.getTime()) / msPerDay);
}

/**
 * Check if a word is due for review (retrievability < 90%)
 */
export function isDue(word: Word, threshold: number = 0.9): boolean {
  // New words (never reviewed) are always due
  if (!word.lastReviewDate) {
    return true;
  }

  const daysSince = daysBetween(word.lastReviewDate, new Date());
  const currentR = calculateRetrievability(word.stability, daysSince);
  return currentR < threshold;
}

/**
 * Convert numeric rating (1-4) to ts-fsrs Rating enum
 */
export function toFsrsRating(rating: 1 | 2 | 3 | 4): Grade {
  const ratingMap: Record<number, Grade> = {
    1: Rating.Again,
    2: Rating.Hard,
    3: Rating.Good,
    4: Rating.Easy,
  };
  return ratingMap[rating];
}

/**
 * Create a ts-fsrs Card from a Word entity
 */
export function wordToCard(word: Word): Card {
  const now = new Date();
  const lastReview = word.lastReviewDate || now;
  const elapsedDays = daysBetween(word.lastReviewDate, now);
  const scheduledDays = word.nextReviewDate
    ? daysBetween(word.lastReviewDate, word.nextReviewDate)
    : 1;

  // Start with an empty card to get default values for learning_steps
  const baseCard = createEmptyCard(now);

  return {
    ...baseCard,
    due: word.nextReviewDate || now,
    stability: word.stability,
    difficulty: word.difficulty,
    elapsed_days: elapsedDays,
    scheduled_days: scheduledDays,
    reps: word.reviewCount,
    lapses: word.lapseCount,
    state: word.reviewCount === 0 ? State.New : State.Review,
    last_review: lastReview,
  };
}

/**
 * Process a review and calculate new FSRS parameters
 *
 * @param word - The word being reviewed
 * @param rating - User's rating (1=Again, 2=Hard, 3=Good, 4=Easy)
 * @param sessionId - Current review session ID
 * @returns Updated word parameters (not persisted)
 */
export function processReview(
  word: Word,
  rating: 1 | 2 | 3 | 4,
  sessionId: string
): Partial<Word> {
  const now = new Date();

  // Create FSRS card from word
  const card = wordToCard(word);

  // Get next state from FSRS
  const fsrsRating = toFsrsRating(rating);
  const scheduling = f.repeat(card, now);
  const next = scheduling[fsrsRating];

  // Calculate new retrievability (just reviewed = 100%)
  const newRetrievability = 1.0;

  // Build updated word parameters
  const updates: Partial<Word> = {
    difficulty: next.card.difficulty,
    stability: next.card.stability,
    retrievability: newRetrievability,
    nextReviewDate: next.card.due,
    lastReviewDate: now,
    reviewCount: word.reviewCount + 1,
    lapseCount: rating === 1 ? word.lapseCount + 1 : word.lapseCount,
    updatedAt: now,
  };

  // Update mastery tracking
  if (rating >= 3) {
    // Good or Easy = correct answer
    if (word.lastCorrectSessionId !== sessionId) {
      // Different session, increment consecutive correct count
      updates.consecutiveCorrectSessions =
        (word.consecutiveCorrectSessions || 0) + 1;
      updates.lastCorrectSessionId = sessionId;
    }

    // Check for mastery (3 correct sessions)
    if ((updates.consecutiveCorrectSessions || 0) >= 3) {
      updates.masteryStatus = 'ready_to_use';
    } else if ((updates.consecutiveCorrectSessions || 0) >= 1) {
      updates.masteryStatus = 'learned';
    }
  } else {
    // Again or Hard = incorrect/struggling
    updates.consecutiveCorrectSessions = 0;
    updates.lastCorrectSessionId = null;
    updates.masteryStatus = 'learning';
  }

  return updates;
}

/**
 * Get human-readable next review text based on next review date
 */
export function getNextReviewText(nextReviewDate: Date): string {
  const now = new Date();
  const diffMs = nextReviewDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'Review now';

  // For days within a week, show the actual day name
  if (diffDays <= 7) {
    const dayName = nextReviewDate.toLocaleDateString('en-US', { weekday: 'long' });
    return dayName;
  }

  if (diffDays < 14) return 'In about a week';
  if (diffDays < 30) return `In ${Math.floor(diffDays / 7)} weeks`;
  return `In about ${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''}`;
}

// Re-export Rating enum for use in components
export { Rating } from 'ts-fsrs';
