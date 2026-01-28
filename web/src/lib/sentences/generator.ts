/**
 * Sentence Generator Module
 *
 * Uses GPT-4o-mini to generate natural sentences containing
 * 2-4 target words for contextual language learning.
 *
 * ADAPTIVE APPROACH:
 * The prompt analyzes the user's vocabulary to detect domain (work, social,
 * family, health, errands, bureaucracy) and adapts tone accordingly.
 * This creates sentences that feel relevant to the user's actual life
 * without assuming a specific persona.
 *
 * Philosophy: "The user's vocabulary IS the context signal."
 * - Work words → professional tone
 * - Social words → casual tone
 * - Family words → everyday tone
 *
 * Cost: ~$0.00006 per sentence (~6 cents per 1000 sentences)
 *
 * Reference: /docs/engineering/implementation_plan.md (Epic 2)
 */

import OpenAI from 'openai';
import { getTranslationName } from '@/lib/config/languages';
import { withGPTUsageTracking } from '@/lib/api-usage/logger';
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
  userId?: string; // Optional user ID for usage tracking
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

  // FIX #162: Use the text that's in the target language being learned
  // If user typed in target language, use originalText
  // If user typed in native language, use translation (which is in target language)
  const wordList = request.words.map((w) => {
    const isOriginalInTarget = w.sourceLang.split('-')[0] === request.targetLanguage.split('-')[0];
    return isOriginalInTarget ? w.originalText : w.translation;
  }).join(', ');

  // Build language-specific instructions with LOCAL grounding
  // Each language gets context that anyone living there would recognize
  let languageInstructions = '';
  let countryContext = '';

  if (request.targetLanguage === 'pt-PT') {
    countryContext = 'Portugal';
    languageInstructions = `
PORTUGAL - LOCAL GROUNDING:
Language rules:
- European Portuguese ONLY - never Brazilian Portuguese
- Use "tu" forms for informal, "você" only when formally appropriate
- European vocabulary: autocarro, telemóvel, pequeno-almoço, casa de banho, talho

Local references anyone living there would know:
- Shopping: Continente, Pingo Doce, pastelaria, talho, mercado, farmácia
- Bureaucracy: finanças, NIF, multibanco, junta de freguesia, SEF, AT
- Transport: comboio, metro, autocarro, CP, Via Verde
- Culture: café, pastel de nata, almoço, praia, fado
- Work: reunião, colega, prazo, projeto, almoço de trabalho

Match the formality to the vocabulary:
- Work words (reunião, cliente, prazo) → professional tone
- Social words (cerveja, amigos, jantar) → casual tone
- Bureaucracy words (NIF, finanças) → neutral/formal tone`;

  } else if (request.targetLanguage === 'sv') {
    countryContext = 'Sweden';
    languageInstructions = `
SWEDEN - LOCAL GROUNDING:
Language rules:
- Standard Swedish (rikssvenska)
- Always use "du" - everyone does in Sweden
- Natural word order, Swedish directness in communication

Local references anyone living there would know:
- Shopping: ICA, Coop, Systembolaget, apotek, Willys
- Bureaucracy: Skatteverket, personnummer, Försäkringskassan, BankID, Swish
- Transport: SL, pendeltåg, tunnelbana, SJ
- Culture: fika, midsommar, semester, stuga, fredagsmys
- Work: möte, kollega, deadline, AW (after work), lunch

Match the formality to the vocabulary:
- Work words (möte, projekt, deadline) → professional tone
- Social words (fika, vänner, helg) → casual tone
- Bureaucracy words (personnummer, Skatteverket) → neutral tone`;

  } else if (request.targetLanguage === 'en') {
    countryContext = 'an English-speaking environment';
    languageInstructions = `
ENGLISH - INTERNATIONAL CONTEXT:
Language rules:
- Natural, conversational English
- Mix of British and international usage
- Common expressions real people use, not textbook phrases

Local references for international/professional context:
- Daily life: GP, pharmacy, supermarket, post office, bank
- Work: meeting, deadline, email, call, presentation, feedback
- Social: pub, coffee, lunch, weekend plans, holiday
- Professional: schedule, budget, client, update, stakeholder

Match the formality to the vocabulary:
- Work words (meeting, deadline, presentation) → professional tone
- Social words (pub, weekend, friends) → casual tone
- Daily words (appointment, pharmacy) → neutral tone`;
  }

  const systemPrompt = `Generate a practice sentence for someone living in ${countryContext || 'abroad'} who captured these words from daily life.

ADAPTIVE APPROACH:
First, analyze the vocabulary provided: ${wordList}

Based on these words, determine:
1. DOMAIN: What area of life? (work, family, social, errands, bureaucracy, health, leisure)
2. REGISTER: Should this be formal or casual? (formal words → formal sentence)
3. SITUATION: What realistic scenario would naturally use ALL these words together?

Then generate a sentence that:
- Matches the domain and register you detected
- Sounds like something a local would actually say
- Feels like real life, not a textbook

EXAMPLES OF ADAPTATION:
- Words like "reunião, prazo, projeto" → Work context, professional tone
- Words like "cerveja, amigos, sábado" → Social context, casual tone
- Words like "médico, receita, farmácia" → Health context, neutral tone
- Words like "escola, filhos, buscar" → Family context, everyday tone
- Words like "NIF, finanças, documento" → Bureaucracy context, formal tone

RULES:
1. MUST contain ALL words exactly as written: ${wordList}
2. Maximum 10 words total
3. Natural spoken language - how people actually talk
4. Use local references when they fit naturally
5. Preserve word forms unless grammar absolutely requires change
${languageInstructions}

OUTPUT FORMAT (JSON only, no markdown):
{
  "sentence": "The sentence in ${targetLangName}",
  "translation": "Natural translation in ${nativeLangName}",
  "wordsUsed": ["words", "as", "they", "appear", "in", "sentence"]
}`;

  const userPrompt = `Generate a natural sentence using these ${targetLangName} words: ${wordList}`;

  // Wrap in usage tracking
  return withGPTUsageTracking(
    'sentence_generation',
    request.userId,
    async () => {
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

      const result = {
        text: parsed.sentence,
        translation: parsed.translation,
        wordsUsed: parsed.wordsUsed || request.words.map((w) => w.originalText),
        isValid,
      };

      return {
        result,
        usage: {
          prompt_tokens: response.usage?.prompt_tokens || 0,
          completion_tokens: response.usage?.completion_tokens || 0,
        },
      };
    },
    { wordCount: request.words.length, targetLanguage: request.targetLanguage }
  );
}

/**
 * Validate that a sentence contains all target words
 *
 * Uses multiple strategies to handle:
 * - Unicode characters (accented letters like ã, é)
 * - Word boundaries with punctuation
 * - Minor conjugation variations (verb endings)
 */
export function validateSentenceContainsWords(
  sentence: string,
  targetWords: string[]
): boolean {
  const sentenceLower = sentence.toLowerCase();
  const sentenceNormalized = normalizeText(sentenceLower);

  for (const word of targetWords) {
    const wordLower = word.toLowerCase();
    const wordNormalized = normalizeText(wordLower);

    // Strategy 1: Exact match with Unicode-aware boundaries
    // Use lookbehind/lookahead for word boundaries that handle Unicode
    const escapedWord = escapeRegex(wordLower);
    const unicodeBoundaryRegex = new RegExp(
      `(?<=^|[\\s.,!?;:"'()\\[\\]])${escapedWord}(?=$|[\\s.,!?;:"'()\\[\\]])`,
      'i'
    );

    if (unicodeBoundaryRegex.test(sentenceLower)) {
      continue; // Found exact match
    }

    // Strategy 2: Check normalized text (without diacritics)
    const escapedNormalized = escapeRegex(wordNormalized);
    const normalizedRegex = new RegExp(
      `(?<=^|[\\s.,!?;:"'()\\[\\]])${escapedNormalized}(?=$|[\\s.,!?;:"'()\\[\\]])`,
      'i'
    );

    if (normalizedRegex.test(sentenceNormalized)) {
      continue; // Found normalized match
    }

    // Strategy 3: Simple includes check (most lenient)
    if (sentenceLower.includes(wordLower) || sentenceNormalized.includes(wordNormalized)) {
      continue;
    }

    // Strategy 4: Check for word stem (at least 70% of characters match at start)
    // This handles minor conjugation variations
    const minStemLength = Math.max(3, Math.floor(wordLower.length * 0.7));
    const wordStem = wordLower.slice(0, minStemLength);
    const wordStemNormalized = wordNormalized.slice(0, minStemLength);

    if (
      sentenceLower.includes(wordStem) ||
      sentenceNormalized.includes(wordStemNormalized)
    ) {
      continue; // Found stem match
    }

    // No match found
    return false;
  }

  return true;
}

/**
 * Normalize text by removing diacritics
 * Converts "não" -> "nao", "está" -> "esta", etc.
 */
function normalizeText(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
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
