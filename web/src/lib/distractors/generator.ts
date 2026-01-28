/**
 * Semantic Distractor Generator
 *
 * Generates semantically related but incorrect alternatives for multiple choice exercises.
 * Instead of random category-based distractors, this creates contextually relevant options
 * that make the exercise more educational.
 *
 * Example: "stamps" → distractors: ["letters", "envelopes", "postcards"]
 * Instead of: ["coffee", "hello", "thanks"]
 *
 * Cost: ~$0.00003 per call (~3 cents per 1000 words)
 */

import OpenAI from 'openai';
import { getTranslationName } from '@/lib/config/languages';
import { db } from '@/lib/db';
import { words } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Lazy-loaded OpenAI client
 */
function getOpenAI(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set.');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

/**
 * Generate semantically related distractors for a word
 *
 * Creates 4-5 words that are:
 * - In the same semantic category/context as the correct answer
 * - Plausibly confused with the correct answer
 * - All in the user's native language (what they see as options)
 *
 * @param targetWord - The word in the target language (what user is learning)
 * @param nativeTranslation - The correct translation in native language
 * @param nativeLanguage - The user's native language code (e.g., 'en')
 * @returns Array of 4-5 distractor words in native language
 */
export async function generateDistractors(
  targetWord: string,
  nativeTranslation: string,
  nativeLanguage: string
): Promise<string[]> {
  const openai = getOpenAI();
  const nativeLangName = getTranslationName(nativeLanguage);

  const systemPrompt = `You are a language learning exercise designer. Generate semantically related INCORRECT alternatives for a multiple choice vocabulary quiz.

TASK: Given a word and its correct translation, generate 4-5 alternative words that:
1. Are in ${nativeLangName}
2. Are from the SAME semantic category or context
3. Could plausibly be confused with the correct answer
4. Are definitely WRONG translations for the given word

GUIDELINES:
- For concrete nouns: use related objects (stamps → letters, envelopes, postcards)
- For verbs: use similar actions (to run → to walk, to jog, to sprint)
- For adjectives: use related qualities (cold → cool, freezing, chilly)
- For greetings/phrases: use other common phrases in similar contexts
- Keep words at a similar complexity level as the correct answer
- Avoid antonyms (those are too obviously wrong)
- Avoid words that could also be correct in some contexts

OUTPUT FORMAT (JSON only, no markdown):
{
  "distractors": ["word1", "word2", "word3", "word4"]
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Word being learned: "${targetWord}"
Correct translation in ${nativeLangName}: "${nativeTranslation}"

Generate 4-5 semantically related but INCORRECT alternatives in ${nativeLangName}.`,
      },
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' },
    max_tokens: 100,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error('Empty response from GPT');
  }

  const parsed = JSON.parse(content) as { distractors: string[] };

  // Filter out any accidental inclusion of the correct answer
  const filtered = parsed.distractors.filter(
    (d) => d.toLowerCase().trim() !== nativeTranslation.toLowerCase().trim()
  );

  // Ensure we have at least 3 distractors
  if (filtered.length < 3) {
    throw new Error(`Only got ${filtered.length} valid distractors`);
  }

  return filtered.slice(0, 5); // Return max 5
}

/**
 * Generate and store distractors for a word
 *
 * This is the main function called after word capture.
 * It generates semantic distractors and updates the word record.
 *
 * @param wordId - The ID of the word to update
 * @param targetWord - The word in the target language
 * @param nativeTranslation - The translation in the user's native language
 * @param nativeLanguage - The user's native language code
 */
export async function generateAndStoreDistractors(
  wordId: string,
  targetWord: string,
  nativeTranslation: string,
  nativeLanguage: string
): Promise<void> {
  try {
    const distractors = await generateDistractors(
      targetWord,
      nativeTranslation,
      nativeLanguage
    );

    // Update the word with generated distractors
    await db
      .update(words)
      .set({ distractors })
      .where(eq(words.id, wordId));
  } catch (error) {
    console.error(`Failed to generate distractors for word ${wordId}:`, error);
    // Don't rethrow - this is a background task, word was already created successfully
    // Fallback to category-based distractors will be used during review
  }
}
