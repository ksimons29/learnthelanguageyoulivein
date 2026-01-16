import OpenAI from 'openai';

/**
 * Text-to-Speech Service
 *
 * Generates high-quality native audio pronunciation using OpenAI TTS API.
 * Audio is optimized for speech: MP3 format, 128kbps, 44.1kHz.
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
  language?: string; // Used to select appropriate voice
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
  const { text, voice = 'nova', speed = 1.0 } = options;
  const openai = getOpenAI();

  try {
    const response = await openai.audio.speech.create({
      model: 'tts-1', // Use 'tts-1-hd' for higher quality (2x cost)
      voice,
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
 * Select appropriate voice based on language
 *
 * @param language - Target language code or 'source'/'target'
 * @returns Recommended voice for the language
 */
export function selectVoiceForLanguage(
  language: string
): TTSOptions['voice'] {
  // OpenAI TTS supports multiple languages with same voices
  // Voice characteristics:
  // - alloy: neutral, balanced
  // - echo: male, clear
  // - fable: expressive, warm
  // - onyx: deep, authoritative
  // - nova: female, clear (good for Portuguese/Romance languages)
  // - shimmer: soft, gentle

  // For Portuguese and Romance languages, 'nova' is recommended
  if (language.toLowerCase().includes('pt') || language === 'target') {
    return 'nova';
  }

  // For English and other languages, use 'alloy' as default
  return 'alloy';
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
