/**
 * Review Queue Shuffle Utilities
 *
 * Provides shuffling logic for review queues that balances:
 * 1. FSRS priority (most overdue words should still come first)
 * 2. Variety (prevent memorizing word order)
 *
 * Uses "priority band" shuffling: words are grouped by urgency,
 * each band is shuffled, then concatenated. This ensures overdue
 * words still appear early while adding randomness within bands.
 */

import type { Word } from '@/lib/db/schema';

/**
 * Fisher-Yates shuffle algorithm
 *
 * Shuffles an array in-place with O(n) time complexity.
 * Uses Math.random() which is sufficient for UX purposes
 * (not cryptographic randomness).
 *
 * @param array - Array to shuffle (mutated in place)
 * @returns The same array, shuffled
 */
export function fisherYatesShuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Priority bands for shuffling
 *
 * - OVERDUE: Words significantly past their review date (>7 days)
 * - DUE: Words at or past their review date
 * - NEW: Words never reviewed before
 */
type PriorityBand = 'overdue' | 'due' | 'new';

/**
 * Categorize a word into a priority band
 *
 * @param word - The word to categorize
 * @param now - Current timestamp for comparison
 * @returns The priority band for this word
 */
function getPriorityBand(word: Word, now: Date): PriorityBand {
  // Never reviewed = new word
  if (!word.lastReviewDate) {
    return 'new';
  }

  // No next review date = treat as due
  if (!word.nextReviewDate) {
    return 'due';
  }

  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Significantly overdue (>7 days past review date)
  if (word.nextReviewDate < sevenDaysAgo) {
    return 'overdue';
  }

  // Past review date but not severely overdue
  if (word.nextReviewDate <= now) {
    return 'due';
  }

  // Not due yet (shouldn't happen in due words list, but handle gracefully)
  return 'new';
}

/**
 * Shuffle words within priority bands
 *
 * This maintains FSRS priority (overdue words first) while adding
 * variety within each band to prevent users from memorizing order.
 *
 * Algorithm:
 * 1. Categorize words into priority bands (overdue, due, new)
 * 2. Shuffle each band independently
 * 3. Concatenate: overdue first, then due, then new
 *
 * @param words - Array of due words (will be copied, not mutated)
 * @returns New array with words shuffled within priority bands
 */
export function shuffleWithinPriorityBands(words: Word[]): Word[] {
  if (words.length <= 1) {
    return [...words];
  }

  const now = new Date();

  // Categorize into bands
  const bands: Record<PriorityBand, Word[]> = {
    overdue: [],
    due: [],
    new: [],
  };

  for (const word of words) {
    const band = getPriorityBand(word, now);
    bands[band].push(word);
  }

  // Shuffle each band
  fisherYatesShuffle(bands.overdue);
  fisherYatesShuffle(bands.due);
  fisherYatesShuffle(bands.new);

  // Concatenate in priority order
  return [...bands.overdue, ...bands.due, ...bands.new];
}

/**
 * Simple full shuffle (no priority preservation)
 *
 * Use this when you want complete randomization without
 * respecting FSRS priority. Useful for small word sets
 * or when variety is more important than priority.
 *
 * @param words - Array of words (will be copied, not mutated)
 * @returns New array with words fully shuffled
 */
export function shuffleFully(words: Word[]): Word[] {
  const copy = [...words];
  return fisherYatesShuffle(copy);
}
