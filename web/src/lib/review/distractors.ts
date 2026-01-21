import type { Word } from "@/lib/db/schema";

export interface MultipleChoiceOption {
  id: string;
  text: string;
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get the text from a word that's in the user's native language.
 *
 * Words can be captured in either direction:
 * - PT→EN: originalText="folgar" (PT), translation="to relax" (EN)
 * - EN→PT: originalText="timeless" (EN), translation="intemporal" (PT)
 *
 * For multiple choice, all options must be in the user's native language.
 *
 * @param word - The word to extract native language text from (can be null/undefined)
 * @param nativeLanguage - The user's native language code (e.g., 'en')
 * @returns The text in the user's native language, or empty string if word is null/undefined
 */
export function getNativeLanguageText(word: Word | null | undefined, nativeLanguage: string): string {
  // FIX for Issue #69: Guard against undefined/null word
  // This can happen when closing review mid-session (state clears before render completes)
  if (!word) {
    return '';
  }

  // sourceLang is the language of originalText
  // targetLang is the language of translation
  if (word.sourceLang === nativeLanguage) {
    return word.originalText;
  }
  if (word.targetLang === nativeLanguage) {
    return word.translation;
  }
  // Fallback: if neither matches exactly, use translation
  // This handles cases where language codes might differ slightly (e.g., 'en' vs 'en-US')
  return word.translation;
}

/**
 * Get the text from a word that's in the user's target language (learning language).
 *
 * This is the text that should be shown as the prompt in exercises.
 *
 * @param word - The word to extract target language text from (can be null/undefined)
 * @param targetLanguage - The user's target language code (e.g., 'pt-PT')
 * @returns The text in the user's target language, or empty string if word is null/undefined
 */
export function getTargetLanguageText(word: Word | null | undefined, targetLanguage: string): string {
  // FIX for Issue #69: Guard against undefined/null word
  // This can happen when closing review mid-session (state clears before render completes)
  if (!word) {
    return '';
  }

  if (word.sourceLang === targetLanguage) {
    return word.originalText;
  }
  if (word.targetLang === targetLanguage) {
    return word.translation;
  }
  // Fallback: use originalText (typically in target language for most captures)
  return word.originalText;
}

/**
 * Fetch distractor words for multiple choice exercises.
 * Returns words from the same category, excluding the correct answer.
 *
 * Fetches extra words to account for duplicates being filtered out later.
 *
 * @param correctWord - The word that is the correct answer
 * @param count - Number of distractors to fetch (default: 3)
 * @returns Array of distractor words
 */
export async function fetchDistractors(
  correctWord: Word,
  count: number = 3
): Promise<Word[]> {
  try {
    const params = new URLSearchParams({
      category: correctWord.category || "other",
      limit: String(count + 10), // Fetch extra to account for duplicates and invalid words
      excludeId: correctWord.id,
    });

    const response = await fetch(`/api/words?${params.toString()}`);

    if (!response.ok) {
      console.error("Failed to fetch distractors:", response.statusText);
      return [];
    }

    const { data } = await response.json();
    const words: Word[] = data?.words || [];

    // Return shuffled words (deduplication happens in buildMultipleChoiceOptions)
    return shuffleArray(words);
  } catch (error) {
    console.error("Error fetching distractors:", error);
    return [];
  }
}

/**
 * Build multiple choice options from correct word and distractors.
 *
 * IMPORTANT: All options must be in the user's native language.
 * This handles bidirectional capture where words might have been captured
 * in either direction (target→native or native→target).
 *
 * Options are shuffled so correct answer isn't always in same position.
 * Duplicates are filtered out to prevent showing the same text twice.
 *
 * @param correctWord - The word that is the correct answer
 * @param distractors - Array of distractor words
 * @param nativeLanguage - User's native language code (e.g., 'en')
 * @returns Shuffled array of options, all in native language
 */
export function buildMultipleChoiceOptions(
  correctWord: Word,
  distractors: Word[],
  nativeLanguage: string
): MultipleChoiceOption[] {
  const correctText = getNativeLanguageText(correctWord, nativeLanguage);
  const correctTextNormalized = correctText.toLowerCase().trim();

  // Track seen texts to prevent duplicates (case-insensitive)
  const seenTexts = new Set<string>([correctTextNormalized]);

  // Start with the correct answer
  const options: MultipleChoiceOption[] = [
    { id: correctWord.id, text: correctText },
  ];

  // Add distractors, filtering out duplicates by text
  for (const d of distractors) {
    const text = getNativeLanguageText(d, nativeLanguage);
    const textNormalized = text.toLowerCase().trim();

    // Skip if we've already seen this text (prevents duplicate buttons)
    if (seenTexts.has(textNormalized)) {
      continue;
    }

    seenTexts.add(textNormalized);
    options.push({ id: d.id, text });
  }

  return shuffleArray(options);
}

/**
 * Get distractors and build options in one call.
 * Convenience function for the review page.
 *
 * @param correctWord - The word that is the correct answer
 * @param nativeLanguage - User's native language code (e.g., 'en')
 * @returns Object with options array and correct option ID
 */
export async function prepareMultipleChoiceOptions(
  correctWord: Word,
  nativeLanguage: string
): Promise<{
  options: MultipleChoiceOption[];
  correctOptionId: string;
}> {
  const distractors = await fetchDistractors(correctWord, 3);
  const options = buildMultipleChoiceOptions(correctWord, distractors, nativeLanguage);

  return {
    options,
    correctOptionId: correctWord.id,
  };
}
