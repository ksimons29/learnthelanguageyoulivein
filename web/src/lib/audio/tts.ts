import OpenAI from 'openai';
import { getTTSVoice, type LanguageConfig } from '@/lib/config/languages';

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
}

/**
 * Generate audio for a given text using OpenAI TTS
 *
 * @param options - TTS configuration options
 * @returns Audio buffer in MP3 format
 */
export async function generateAudio(options: TTSOptions): Promise<Buffer> {
  const { text, languageCode, voice, speed = 1.0 } = options;

  // Use provided voice, or get voice based on language code, or default to 'nova'
  const selectedVoice = voice || (languageCode ? getTTSVoice(languageCode) : 'nova');
  const openai = getOpenAI();

  try {
    const response = await openai.audio.speech.create({
      model: 'tts-1', // Use 'tts-1-hd' for higher quality (2x cost)
      voice: selectedVoice,
      input: text,
      response_format: 'mp3', // AAC preferred but MP3 widely supported
      speed,
    });

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('TTS generation failed:', error);
    throw new Error(
      `Failed to generate audio: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
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
