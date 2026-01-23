import OpenAI from 'openai';
import { getTTSVoice, type LanguageConfig } from '@/lib/config/languages';
import { withTTSUsageTracking } from '@/lib/api-usage/logger';

/**
 * Text-to-Speech Service
 *
 * Generates high-quality native audio pronunciation using OpenAI TTS API.
 * Audio is optimized for speech: MP3 format, 128kbps, 44.1kHz.
 *
 * Supports multiple languages with appropriate voice selection:
 * - Portuguese (Portugal): 'nova' voice
 * - English: 'alloy' voice
 * - Swedish: 'nova' voice
 * - And more (see /lib/config/languages.ts)
 *
 * Reference: /docs/engineering/implementation_plan.md (lines 95-114)
 */

// Maximum text length for TTS (OpenAI supports up to 4096 chars, we limit to 500 for phrases)
const MAX_TTS_TEXT_LENGTH = 500;

// Timeout for TTS API calls (30 seconds)
const TTS_TIMEOUT_MS = 30000;

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      'OPENAI_API_KEY environment variable is not set. Please configure it in .env.local'
    );
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export interface TTSOptions {
  text: string;
  languageCode?: string; // ISO language code (e.g., 'pt-PT', 'en', 'sv')
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  speed?: number; // 0.25 to 4.0, default 1.0
  userId?: string; // Optional user ID for usage tracking
}

/**
 * Generate audio for a given text using OpenAI TTS
 *
 * Features:
 * - Text length validation (max 500 chars)
 * - 30s timeout to prevent hung requests
 * - Rate limit detection for retry logic
 * - API usage tracking for cost monitoring
 *
 * @param options - TTS configuration options
 * @returns Audio buffer in MP3 format
 * @throws Error if text is too long, timeout occurs, or API fails
 */
export async function generateAudio(options: TTSOptions): Promise<Buffer> {
  const { text, languageCode, voice, speed = 1.0, userId } = options;

  // Validate text length
  if (!text || text.trim().length === 0) {
    throw new Error('TTS text cannot be empty');
  }
  if (text.length > MAX_TTS_TEXT_LENGTH) {
    throw new Error(`TTS text too long: ${text.length} chars (max ${MAX_TTS_TEXT_LENGTH})`);
  }

  // Use provided voice, or get voice based on language code, or default to 'nova'
  const selectedVoice = voice || (languageCode ? getTTSVoice(languageCode) : 'nova');

  // Wrap TTS API call with usage tracking
  return withTTSUsageTracking(
    userId,
    text,
    async () => {
      const openai = getOpenAI();

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TTS_TIMEOUT_MS);

      try {
        const response = await openai.audio.speech.create(
          {
            model: 'tts-1', // Use 'tts-1-hd' for higher quality (2x cost)
            voice: selectedVoice,
            input: text,
            response_format: 'mp3', // AAC preferred but MP3 widely supported
            speed,
          },
          { signal: controller.signal }
        );

        clearTimeout(timeoutId);
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
      } catch (error) {
        clearTimeout(timeoutId);

        // Handle abort (timeout)
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error(`TTS request timed out after ${TTS_TIMEOUT_MS / 1000}s`);
        }

        // Handle rate limiting (OpenAI returns 429)
        if (error instanceof OpenAI.RateLimitError) {
          const retryAfter = error.headers?.get?.('retry-after');
          throw new Error(`TTS rate limited${retryAfter ? `, retry after ${retryAfter}s` : ''}`);
        }

        console.error('TTS generation failed:', error);
        throw new Error(
          `Failed to generate audio: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    },
    { languageCode, voice: selectedVoice, speed }
  );
}

/**
 * Select appropriate voice based on language code
 *
 * Uses the language configuration to select the best voice.
 * Falls back to 'nova' for unknown languages.
 *
 * @param languageCode - ISO language code (e.g., 'pt-PT', 'en', 'sv')
 * @returns Recommended voice for the language
 */
export function selectVoiceForLanguage(
  languageCode: string
): TTSOptions['voice'] {
  // Use centralized language config
  return getTTSVoice(languageCode);
}

/**
 * Estimate TTS cost for a given text
 *
 * OpenAI TTS Pricing: $15 per 1 million characters
 *
 * @param text - Text to estimate cost for
 * @returns Estimated cost in USD
 */
export function estimateTTSCost(text: string): number {
  const characterCount = text.length;
  const costPer1MCharacters = 15.0;
  return (characterCount / 1_000_000) * costPer1MCharacters;
}
