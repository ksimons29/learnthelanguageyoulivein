/**
 * Example Sentence Generator
 *
 * Generates a single example sentence for a word at capture time.
 * This is different from the multi-word review sentences - it's optimized
 * for showing a single-word usage example in the notebook.
 *
 * Cost: ~$0.00003 per sentence (~3 cents per 1000 sentences)
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
    throw new Error(
      'OPENAI_API_KEY environment variable is not set.'
    );
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

/**
 * Result from example sentence generation
 */
export interface ExampleSentenceResult {
  sentence: string;
  translation: string;
}

/**
 * Generate an example sentence for a single word
 *
 * Creates a natural, short sentence (max 8 words) showcasing the word in context.
 * The sentence is in the target language with translation in native language.
 */
export async function generateExampleSentence(
  word: string,
  targetLanguage: string,
  nativeLanguage: string
): Promise<ExampleSentenceResult> {
  const openai = getOpenAI();

  const targetLangName = getTranslationName(targetLanguage);
  const nativeLangName = getTranslationName(nativeLanguage);

  // Build language-specific instructions
  let languageInstructions = '';

  if (targetLanguage === 'pt-PT') {
    languageInstructions = `
EUROPEAN PORTUGUESE RULES:
- Use European Portuguese (Portugal) ONLY - never Brazilian Portuguese
- Use "tu" forms instead of "você" where appropriate
- Use European spelling and vocabulary`;
  } else if (targetLanguage === 'sv') {
    languageInstructions = `
SWEDISH RULES:
- Use standard Swedish (rikssvenska)
- Use natural Swedish word order and phrasing`;
  } else if (targetLanguage === 'en') {
    languageInstructions = `
ENGLISH RULES:
- Use natural, conversational English
- Use common expressions that native speakers would actually use`;
  }

  const systemPrompt = `You are a language learning sentence generator. Create a SHORT, natural example sentence in ${targetLangName}.

RULES:
1. The sentence MUST contain the word "${word}" exactly as written
2. Keep the sentence SHORT (maximum 8 words total)
3. Use everyday, practical language
4. The sentence should sound natural to a native speaker
5. Context should be a realistic daily situation
${languageInstructions}

OUTPUT FORMAT (JSON only, no markdown):
{
  "sentence": "The sentence in ${targetLangName}",
  "translation": "Translation in ${nativeLangName}"
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Generate a short example sentence using: ${word}` },
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' },
    max_tokens: 100,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error('Empty response from GPT');
  }

  const parsed = JSON.parse(content) as {
    sentence: string;
    translation: string;
  };

  return {
    sentence: parsed.sentence,
    translation: parsed.translation,
  };
}

/**
 * Generate and store example sentence for a word
 *
 * This is the main function called after word capture.
 * It generates the sentence and updates the word record.
 */
export async function generateAndStoreExampleSentence(
  wordId: string,
  wordText: string,
  targetLanguage: string,
  nativeLanguage: string
): Promise<void> {
  try {
    // Determine which text to use for sentence generation
    // We want the sentence to be in the TARGET language
    const result = await generateExampleSentence(
      wordText,
      targetLanguage,
      nativeLanguage
    );

    // Update the word with the generated sentence
    await db
      .update(words)
      .set({
        exampleSentence: result.sentence,
        exampleTranslation: result.translation,
      })
      .where(eq(words.id, wordId));
  } catch (error) {
    console.error(`Failed to generate example sentence for word ${wordId}:`, error);
    // Don't rethrow - this is a background task, word was already created successfully
  }
}
