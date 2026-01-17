/**
 * Exercise Type Determination
 *
 * Determines the appropriate exercise type based on word mastery levels.
 * Progressively increases difficulty as users demonstrate recall ability.
 *
 * Exercise Types:
 * - multiple_choice: Easiest - recognition-based, good for new words
 * - fill_blank: Medium - partial recall, requires recognizing the word in context
 * - type_translation: Hardest - full production, requires typing the translation
 *
 * Reference: /docs/engineering/implementation_plan.md (lines 357-368)
 */

import type { Word } from '@/lib/db/schema';

export type ExerciseType = 'multiple_choice' | 'fill_blank' | 'type_translation';

/**
 * Determine exercise type based on average mastery level of words
 *
 * Uses consecutiveCorrectSessions as the mastery indicator:
 * - < 1 average: multiple_choice (still learning)
 * - 1-2 average: fill_blank (gaining confidence)
 * - >= 2 average: type_translation (approaching mastery)
 *
 * This creates a natural progression where exercises get harder
 * as users demonstrate better recall.
 */
export function determineExerciseType(words: Word[]): ExerciseType {
  if (words.length === 0) {
    return 'multiple_choice'; // Default to easiest
  }

  // Calculate average consecutive correct sessions
  const totalCorrectSessions = words.reduce(
    (sum, w) => sum + (w.consecutiveCorrectSessions || 0),
    0
  );
  const avgCorrectSessions = totalCorrectSessions / words.length;

  // Progressive difficulty based on mastery
  if (avgCorrectSessions < 1) {
    return 'multiple_choice'; // Easiest - still learning
  }

  if (avgCorrectSessions < 2) {
    return 'fill_blank'; // Medium - gaining confidence
  }

  return 'type_translation'; // Hardest - approaching mastery
}

/**
 * Get display name for exercise type
 *
 * Used for UI display and logging.
 */
export function getExerciseTypeName(exerciseType: ExerciseType): string {
  switch (exerciseType) {
    case 'multiple_choice':
      return 'Multiple Choice';
    case 'fill_blank':
      return 'Fill in the Blank';
    case 'type_translation':
      return 'Type Translation';
    default:
      return 'Unknown';
  }
}

/**
 * Get difficulty level (1-3) for exercise type
 *
 * Useful for sorting or displaying difficulty indicators.
 */
export function getExerciseDifficulty(exerciseType: ExerciseType): number {
  switch (exerciseType) {
    case 'multiple_choice':
      return 1;
    case 'fill_blank':
      return 2;
    case 'type_translation':
      return 3;
    default:
      return 1;
  }
}

/**
 * Select a random word to blank out for fill_blank exercises
 *
 * Prefers words with lower mastery (more practice needed).
 */
export function selectWordToBlank(words: Word[]): Word | null {
  if (words.length === 0) return null;

  // Sort by consecutive correct sessions (ascending - less mastery first)
  const sorted = [...words].sort(
    (a, b) => (a.consecutiveCorrectSessions || 0) - (b.consecutiveCorrectSessions || 0)
  );

  // Return the word with lowest mastery
  return sorted[0];
}
