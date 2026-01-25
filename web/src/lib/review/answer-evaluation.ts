/**
 * Answer Evaluation Module
 *
 * Provides fuzzy matching for user answers using Levenshtein distance.
 * Allows for minor typos while still counting answers as correct.
 *
 * Threshold: 1 typo per 5 characters, minimum 1 typo allowed.
 */

export type AnswerStatus = 'correct' | 'correct_with_typo' | 'incorrect';

export interface AnswerEvaluation {
  status: AnswerStatus;
  /** Set when status is 'correct_with_typo' - shows the corrected spelling */
  correctedSpelling?: string;
}

/**
 * Strip accents/diacritics from a string.
 * "café" → "cafe", "são" → "sao"
 */
function stripAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Normalize text for comparison.
 * - Lowercase
 * - Trim whitespace
 * - Strip accents
 */
export function normalizeForComparison(text: string): string {
  return stripAccents(text.toLowerCase().trim());
}

/**
 * Calculate Levenshtein distance between two strings.
 * This measures the minimum number of single-character edits
 * (insertions, deletions, substitutions) needed to change one string into another.
 *
 * Uses Wagner-Fischer algorithm with O(n*m) time and O(min(n,m)) space.
 */
export function levenshteinDistance(a: string, b: string): number {
  // Optimization: if strings are equal, distance is 0
  if (a === b) return 0;

  // Optimization: ensure a is the shorter string for space efficiency
  if (a.length > b.length) {
    [a, b] = [b, a];
  }

  const aLen = a.length;
  const bLen = b.length;

  // If one string is empty, distance is length of other string
  if (aLen === 0) return bLen;

  // Use single array for space optimization
  // prev[j] represents distance for (i-1, j)
  let prev = Array.from({ length: aLen + 1 }, (_, i) => i);
  let curr = new Array<number>(aLen + 1);

  for (let j = 1; j <= bLen; j++) {
    curr[0] = j;

    for (let i = 1; i <= aLen; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[i] = Math.min(
        prev[i] + 1,      // deletion
        curr[i - 1] + 1,  // insertion
        prev[i - 1] + cost // substitution
      );
    }

    // Swap arrays
    [prev, curr] = [curr, prev];
  }

  return prev[aLen];
}

/**
 * Calculate the maximum allowed typos based on answer length.
 * Formula: 1 typo per 5 characters, minimum 1.
 */
function maxAllowedTypos(length: number): number {
  return Math.max(1, Math.floor(length / 5));
}

/**
 * Evaluate a user's answer against the correct answer.
 *
 * Returns:
 * - 'correct' if answers match exactly (after normalization)
 * - 'correct_with_typo' if within typo threshold
 * - 'incorrect' otherwise
 *
 * @param userAnswer - The answer provided by the user
 * @param correctAnswer - The expected correct answer
 */
export function evaluateAnswer(
  userAnswer: string,
  correctAnswer: string
): AnswerEvaluation {
  const normalizedUser = normalizeForComparison(userAnswer);
  const normalizedCorrect = normalizeForComparison(correctAnswer);

  // Exact match after normalization
  if (normalizedUser === normalizedCorrect) {
    return { status: 'correct' };
  }

  // Calculate Levenshtein distance
  const distance = levenshteinDistance(normalizedUser, normalizedCorrect);
  const maxTypos = maxAllowedTypos(normalizedCorrect.length);

  // Within typo threshold
  if (distance <= maxTypos) {
    return {
      status: 'correct_with_typo',
      correctedSpelling: correctAnswer,
    };
  }

  // Too many differences - incorrect
  return { status: 'incorrect' };
}
