/**
 * Sentence Generator Module
 *
 * Uses GPT-4o-mini to generate natural sentences containing
 * 2-4 target words for contextual language learning.
 *
 * Cost: ~$0.00006 per sentence (~6 cents per 1000 sentences)
 *
 * Reference: /docs/engineering/implementation_plan.md (Epic 2)
 */

import OpenAI from 'openai';
import { getTranslationName } from '@/lib/config/languages';
import type { Word } from '@/lib/db/schema';

/**
 * Lazy-loaded OpenAI client
 */
function getOpenAI(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      'OPENAI_API_KEY environment variable is not set. Please configure it in .env.local'
    );
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

/**
 * Request for sentence generation
 */
export interface SentenceGenerationRequest {
  words: Word[];
  targetLanguage: string; // e.g., 'pt-PT'
  nativeLanguage: string; // e.g., 'en'
}

/**
 * Result from sentence generation
 */
export interface GeneratedSentenceResult {
  text: string; // The generated sentence in target language
  translation: string; // Translation in native language
  wordsUsed: string[]; // Original text of words as they appear in sentence
  isValid: boolean; // Whether validation passed
}

/**
 * Generate a sentence using GPT-4o-mini
 *
 * Creates a natural, conversational sentence containing all target words.
 * The sentence is constrained to max 10 words for optimal learning.
 */
export async function generateSentence(
  request: SentenceGenerationRequest
): Promise<GeneratedSentenceResult> {
  const openai = getOpenAI();

  const targetLangName = getTranslationName(request.targetLanguage);
  const nativeLangName = getTranslationName(request.nativeLanguage);
  const wordList = request.words.map((w) => w.originalText).join(', ');

  const systemPrompt = `You are a language learning sentence generator. Create natural, conversational sentences in ${targetLangName}.

RULES:
1. The sentence MUST contain ALL of these words exactly as written: ${wordList}
2. Keep the sentence SHORT (maximum 10 words total)
3. Use everyday, practical language a language learner would encounter
4. The sentence should sound natural to a native speaker
5. Preserve the exact form of each target word (do not conjugate differently unless grammatically required)
6. Context should be realistic daily situations (work, shopping, home, social)

OUTPUT FORMAT (JSON only, no markdown code blocks):
{
  "sentence": "The sentence in ${targetLangName}",
  "translation": "Translation in ${nativeLangName}",
  "wordsUsed": ["list", "of", "target", "words", "as", "used", "in", "sentence"]
}`;

  const userPrompt = `Generate a natural sentence using these ${targetLangName} words: ${wordList}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7, // Some creativity, but not too random
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response from GPT');
    }

    const parsed = JSON.parse(content) as {
      sentence: string;
      translation: string;
      wordsUsed?: string[];
    };

    // Validate sentence contains all target words
    const isValid = validateSentenceContainsWords(
      parsed.sentence,
      request.words.map((w) => w.originalText)
    );

    return {
      text: parsed.sentence,
      translation: parsed.translation,
      wordsUsed: parsed.wordsUsed || request.words.map((w) => w.originalText),
      isValid,
    };
  } catch (error) {
    console.error('Sentence generation error:', error);
    throw new Error(
      `Failed to generate sentence: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Validate that a sentence contains all target words
 *
 * Uses word boundary matching to ensure words appear in the sentence.
 * Handles punctuation adjacent to words.
 */
export function validateSentenceContainsWords(
  sentence: string,
  targetWords: string[]
): boolean {
  const sentenceLower = sentence.toLowerCase();

  for (const word of targetWords) {
    const wordLower = word.toLowerCase();

    // Escape special regex characters in the word
    const escapedWord = escapeRegex(wordLower);

    // Try word boundary match first (works for most languages with spaces)
    const wordRegex = new RegExp(`\\b${escapedWord}\\b`, 'i');

    if (!wordRegex.test(sentenceLower)) {
      // Fallback: simple includes check for languages without clear word boundaries
      if (!sentenceLower.includes(wordLower)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Escape special regex characters
 */
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Generate sentence with retry logic
 *
 * Retries up to maxRetries times if validation fails.
 * Increases temperature slightly on each retry for more variation.
 */
export async function generateSentenceWithRetry(
  request: SentenceGenerationRequest,
  maxRetries: number = 3
): Promise<GeneratedSentenceResult | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await generateSentence(request);

      if (result.isValid) {
        return result;
      }

      console.warn(
        `Sentence validation failed (attempt ${attempt}/${maxRetries}):`,
        {
          sentence: result.text,
          targetWords: request.words.map((w) => w.originalText),
        }
      );

      // On last attempt, return even if validation failed
      // (better to have a sentence than nothing)
      if (attempt === maxRetries) {
        console.warn('Max retries reached, returning last attempt');
        return result;
      }
    } catch (error) {
      console.error(
        `Sentence generation error (attempt ${attempt}/${maxRetries}):`,
        error
      );

      if (attempt === maxRetries) {
        return null; // All retries exhausted
      }
    }
  }

  return null;
}

/**
 * Estimate cost for generating a sentence
 *
 * Based on GPT-4o-mini pricing:
 * - Input: $0.15 per 1M tokens
 * - Output: $0.60 per 1M tokens
 *
 * Average sentence: ~200 input tokens, ~50 output tokens
 */
export function estimateSentenceCost(wordCount: number): number {
  // Rough estimate: base prompt ~150 tokens + ~15 tokens per word
  const inputTokens = 150 + wordCount * 15;
  // Output: ~50 tokens for JSON response
  const outputTokens = 50;

  const inputCost = (inputTokens / 1_000_000) * 0.15;
  const outputCost = (outputTokens / 1_000_000) * 0.6;

  return inputCost + outputCost;
}
