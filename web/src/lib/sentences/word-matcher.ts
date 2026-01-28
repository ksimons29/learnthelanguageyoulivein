/**
 * Word Matcher Module
 *
 * Groups due words by category and generates 2-4 word combinations
 * for sentence generation. Uses sliding window within 7-day due date
 * proximity to ensure words are reviewed together at optimal times.
 *
 * Reference: /docs/engineering/implementation_plan.md (Epic 2)
 */

import { db } from '@/lib/db';
import { words, generatedSentences, type Word } from '@/lib/db/schema';
import { eq, and, lte, inArray, or } from 'drizzle-orm';

/**
 * Configuration for word matching algorithm
 */
export interface WordMatchingConfig {
  minWordsPerSentence: number;
  maxWordsPerSentence: number;
  dueDateWindowDays: number;
  retrievabilityThreshold: number;
}

export const DEFAULT_WORD_MATCHING_CONFIG: WordMatchingConfig = {
  minWordsPerSentence: 2,
  maxWordsPerSentence: 5, // Increased from 4 for more challenging sentences
  dueDateWindowDays: 7,
  retrievabilityThreshold: 0.9,
};

/**
 * Get due words grouped by category
 *
 * Queries user words with nextReviewDate within the lookahead window,
 * filtered by the user's language pair, and groups them by category for
 * semantic sentence generation.
 *
 * IMPORTANT: Words must match BOTH the user's native AND target language
 * to prevent mixing words from different language pairs.
 * Words are included if they match either direction:
 * - sourceLang=target, targetLang=native (user captured in target language)
 * - sourceLang=native, targetLang=target (user captured in native language)
 */
export async function getDueWordsGroupedByCategory(
  userId: string,
  nativeLanguage: string,
  targetLanguage: string,
  lookaheadDays: number = 7
): Promise<Map<string, Word[]>> {
  const now = new Date();
  const lookaheadDate = new Date(now.getTime() + lookaheadDays * 24 * 60 * 60 * 1000);

  // DEBUG: Log query parameters
  console.log(`[DEBUG word-matcher] Query params: userId=${userId}, nativeLanguage="${nativeLanguage}", targetLanguage="${targetLanguage}", lookaheadDate=${lookaheadDate.toISOString()}`);

  // Query user words with nextReviewDate within lookahead window
  // Filter by BOTH native and target language to prevent mixing language pairs
  const dueWords = await db
    .select()
    .from(words)
    .where(
      and(
        eq(words.userId, userId),
        lte(words.nextReviewDate, lookaheadDate),
        or(
          // User captured in target language (sourceLang=target, targetLang=native)
          and(
            eq(words.sourceLang, targetLanguage),
            eq(words.targetLang, nativeLanguage)
          ),
          // User captured in native language (sourceLang=native, targetLang=target)
          and(
            eq(words.sourceLang, nativeLanguage),
            eq(words.targetLang, targetLanguage)
          )
        )
      )
    );

  // DEBUG: Log what words were found
  console.log(`[DEBUG word-matcher] Found ${dueWords.length} due words after all filters`);

  // Group by category in memory (more flexible than SQL GROUP BY)
  const categoryGroups = new Map<string, Word[]>();

  for (const word of dueWords) {
    const category = word.category || 'other';
    const existing = categoryGroups.get(category) || [];
    existing.push(word);
    categoryGroups.set(category, existing);
  }

  return categoryGroups;
}

/**
 * Generate all k-combinations of an array
 *
 * Used to create word groups of size 2, 3, or 4 from a category.
 *
 * Example: kCombinations([A, B, C], 2) => [[A,B], [A,C], [B,C]]
 */
export function kCombinations<T>(arr: T[], k: number): T[][] {
  if (k === 1) return arr.map((x) => [x]);
  if (k === arr.length) return [arr];
  if (k > arr.length) return [];

  const result: T[][] = [];
  for (let i = 0; i <= arr.length - k; i++) {
    const head = arr[i];
    const tailCombos = kCombinations(arr.slice(i + 1), k - 1);
    for (const tail of tailCombos) {
      result.push([head, ...tail]);
    }
  }
  return result;
}

/**
 * Generate word combinations from a list of category words
 *
 * Uses a sliding window approach to find words due within the
 * configured time window, then generates 2-4 word combinations.
 *
 * IMPORTANT: Limits output to prevent memory issues with large categories.
 */
export function generateWordCombinations(
  categoryWords: Word[],
  config: WordMatchingConfig = DEFAULT_WORD_MATCHING_CONFIG,
  maxCombinationsPerCategory: number = 100
): Word[][] {
  if (categoryWords.length < config.minWordsPerSentence) {
    return [];
  }

  const combinations: Word[][] = [];
  const seen = new Set<string>();

  // Sort by next review date (most overdue first)
  const sorted = [...categoryWords].sort((a, b) => {
    const dateA = a.nextReviewDate?.getTime() || 0;
    const dateB = b.nextReviewDate?.getTime() || 0;
    return dateA - dateB;
  });

  // Limit words to process to avoid combinatorial explosion
  // Take the most overdue words first
  const MAX_WORDS_PER_CATEGORY = 30;
  const limitedWords = sorted.slice(0, MAX_WORDS_PER_CATEGORY);

  // Sliding window approach - for each word, find others within 7-day window
  const windowMs = config.dueDateWindowDays * 24 * 60 * 60 * 1000;

  for (let i = 0; i < limitedWords.length && combinations.length < maxCombinationsPerCategory; i++) {
    const baseWord = limitedWords[i];
    const baseDate = baseWord.nextReviewDate?.getTime() || Date.now();
    const windowEnd = baseDate + windowMs;

    // Collect words within the time window (limit to 10 for efficiency)
    const windowWords = [baseWord];

    for (let j = i + 1; j < limitedWords.length && windowWords.length < 10; j++) {
      const candidateDate = limitedWords[j].nextReviewDate?.getTime() || Date.now();
      if (candidateDate <= windowEnd) {
        windowWords.push(limitedWords[j]);
      }
    }

    // Generate k-combinations for k in [min, min(max, windowWords.length)]
    if (windowWords.length >= config.minWordsPerSentence) {
      const maxK = Math.min(config.maxWordsPerSentence, windowWords.length);

      for (let k = config.minWordsPerSentence; k <= maxK && combinations.length < maxCombinationsPerCategory; k++) {
        const combos = kCombinations(windowWords, k);

        // Add unique combinations
        for (const combo of combos) {
          if (combinations.length >= maxCombinationsPerCategory) break;

          const hash = generateWordIdsHash(combo.map(w => w.id));
          if (!seen.has(hash)) {
            seen.add(hash);
            combinations.push(combo);
          }
        }
      }
    }
  }

  return combinations;
}

/**
 * Remove duplicate combinations (same words, different order)
 */
function deduplicateCombinations(combinations: Word[][]): Word[][] {
  const seen = new Set<string>();
  const unique: Word[][] = [];

  for (const combo of combinations) {
    const hash = generateWordIdsHash(combo.map((w) => w.id));
    if (!seen.has(hash)) {
      seen.add(hash);
      unique.push(combo);
    }
  }

  return unique;
}

/**
 * Generate a deterministic hash from word IDs
 *
 * Used for deduplication - ensures the same word combination
 * always produces the same hash regardless of input order.
 */
export function generateWordIdsHash(wordIds: string[]): string {
  // Sort IDs to ensure consistent hash regardless of input order
  const sortedIds = [...wordIds].sort();
  // Simple deterministic hash using pipe separator
  return sortedIds.join('|');
}

/**
 * Filter out word combinations that have already been used
 *
 * Checks the generatedSentences table for existing wordIdsHash values.
 */
export async function filterUsedCombinations(
  userId: string,
  combinations: Word[][]
): Promise<Word[][]> {
  if (combinations.length === 0) {
    return [];
  }

  // Generate hashes for all combinations
  const hashToCombo = new Map<string, Word[]>();
  for (const combo of combinations) {
    const hash = generateWordIdsHash(combo.map((w) => w.id));
    hashToCombo.set(hash, combo);
  }

  // Query existing hashes from database
  const allHashes = Array.from(hashToCombo.keys());

  // Batch query to check existing hashes
  const existingRecords = await db
    .select({ wordIdsHash: generatedSentences.wordIdsHash })
    .from(generatedSentences)
    .where(
      and(
        eq(generatedSentences.userId, userId),
        inArray(generatedSentences.wordIdsHash, allHashes)
      )
    );

  const usedHashes = new Set(existingRecords.map((r) => r.wordIdsHash));

  // Filter out used combinations
  return combinations.filter((combo) => {
    const hash = generateWordIdsHash(combo.map((w) => w.id));
    return !usedHashes.has(hash);
  });
}

/**
 * Get all unused word combinations for a user
 *
 * Main entry point - combines category grouping, combination generation,
 * and deduplication filtering.
 *
 * @param userId - The user's ID
 * @param nativeLanguage - The user's native language (for filtering words)
 * @param targetLanguage - The user's target language (for filtering words)
 * @param config - Word matching configuration
 * @param maxCombinations - Maximum combinations to return
 */
export async function getUnusedWordCombinations(
  userId: string,
  nativeLanguage: string,
  targetLanguage: string,
  config: WordMatchingConfig = DEFAULT_WORD_MATCHING_CONFIG,
  maxCombinations: number = 50
): Promise<Word[][]> {
  // 1. Get due words grouped by category (filtered by language pair)
  const categoryGroups = await getDueWordsGroupedByCategory(
    userId,
    nativeLanguage,
    targetLanguage,
    config.dueDateWindowDays
  );

  // 2. Generate combinations for each category
  const allCombinations: Word[][] = [];

  for (const [_category, categoryWords] of categoryGroups) {
    if (categoryWords.length >= config.minWordsPerSentence) {
      const combos = generateWordCombinations(categoryWords, config);
      allCombinations.push(...combos);
    }
  }

  // 3. Deduplicate combinations (FIX #163: wire up the dead code!)
  const dedupedCombinations = deduplicateCombinations(allCombinations);

  // 4. Filter out already-used combinations
  const unusedCombinations = await filterUsedCombinations(userId, dedupedCombinations);

  // 5. Prioritize by earliest due date and limit
  const prioritized = unusedCombinations
    .sort((a, b) => {
      const aEarliest = Math.min(...a.map((w) => w.nextReviewDate?.getTime() || 0));
      const bEarliest = Math.min(...b.map((w) => w.nextReviewDate?.getTime() || 0));
      return aEarliest - bEarliest;
    })
    .slice(0, maxCombinations);

  return prioritized;
}
