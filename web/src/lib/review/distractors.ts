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
 * @param word - The word to extract native language text from
 * @param nativeLanguage - The user's native language code (e.g., 'en')
 * @returns The text in the user's native language
 */
export function getNativeLanguageText(word: Word, nativeLanguage: string): string {
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
 * @param word - The word to extract target language text from
 * @param targetLanguage - The user's target language code (e.g., 'pt-PT')
 * @returns The text in the user's target language
 */
export function getTargetLanguageText(word: Word, targetLanguage: string): string {
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
      limit: String(count + 5), // Fetch extra in case some are invalid
      excludeId: correctWord.id,
    });

    const response = await fetch(`/api/words?${params.toString()}`);

    if (!response.ok) {
      console.error("Failed to fetch distractors:", response.statusText);
      return [];
    }

    const { data } = await response.json();
    const words: Word[] = data?.words || [];

    // Return shuffled subset
    return shuffleArray(words).slice(0, count);
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
  const options: MultipleChoiceOption[] = [
    { id: correctWord.id, text: getNativeLanguageText(correctWord, nativeLanguage) },
    ...distractors.map((d) => ({
      id: d.id,
      text: getNativeLanguageText(d, nativeLanguage),
    })),
  ];

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
