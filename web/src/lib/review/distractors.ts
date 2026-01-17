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
 * The correct word shows its translation, distractors show their translations.
 * Options are shuffled so correct answer isn't always in same position.
 *
 * @param correctWord - The word that is the correct answer
 * @param distractors - Array of distractor words
 * @returns Shuffled array of options
 */
export function buildMultipleChoiceOptions(
  correctWord: Word,
  distractors: Word[]
): MultipleChoiceOption[] {
  const options: MultipleChoiceOption[] = [
    { id: correctWord.id, text: correctWord.translation },
    ...distractors.map((d) => ({
      id: d.id,
      text: d.translation,
    })),
  ];

  return shuffleArray(options);
}

/**
 * Get distractors and build options in one call.
 * Convenience function for the review page.
 *
 * @param correctWord - The word that is the correct answer
 * @returns Object with options array and correct option ID
 */
export async function prepareMultipleChoiceOptions(
  correctWord: Word
): Promise<{
  options: MultipleChoiceOption[];
  correctOptionId: string;
}> {
  const distractors = await fetchDistractors(correctWord, 3);
  const options = buildMultipleChoiceOptions(correctWord, distractors);

  return {
    options,
    correctOptionId: correctWord.id,
  };
}
