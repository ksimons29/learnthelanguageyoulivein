/**
 * Sentences Module
 *
 * Dynamic sentence generation for mixed practice review.
 * Combines 2-4 related words into natural sentences for
 * contextual vocabulary learning.
 *
 * Reference: /docs/engineering/implementation_plan.md (Epic 2)
 */

// Word matching and combination generation
export {
  getDueWordsGroupedByCategory,
  generateWordCombinations,
  generateWordIdsHash,
  filterUsedCombinations,
  getUnusedWordCombinations,
  kCombinations,
  DEFAULT_WORD_MATCHING_CONFIG,
  type WordMatchingConfig,
} from './word-matcher';

// Sentence generation with GPT
export {
  generateSentence,
  generateSentenceWithRetry,
  validateSentenceContainsWords,
  estimateSentenceCost,
  type SentenceGenerationRequest,
  type GeneratedSentenceResult,
} from './generator';

// Exercise type determination
export {
  determineExerciseType,
  getExerciseTypeName,
  getExerciseDifficulty,
  selectWordToBlank,
  type ExerciseType,
} from './exercise-type';

// Sentence pre-generation utility
export {
  triggerSentencePreGeneration,
  type SentencePreGenerationConfig,
} from './pre-generation';
