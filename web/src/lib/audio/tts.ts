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

// Audio duration validation constants
// MP3 at 128kbps averages ~16KB per second of audio
const MP3_BYTES_PER_SECOND = 16000;
// Minimum acceptable audio duration in seconds
const MIN_AUDIO_DURATION_SECONDS = 0.3;
// Estimated seconds per character of spoken text (conservative estimate)
const SECONDS_PER_CHARACTER = 0.05;

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

/**
 * Validate audio buffer duration based on file size and expected text length.
 *
 * This catches truncated audio that might pass Whisper verification
 * (if Whisper transcribes the truncated portion correctly).
 *
 * @param buffer - Audio buffer to validate
 * @param text - The text that was spoken
 * @throws Error if audio is suspiciously short
 */
function validateAudioDuration(buffer: Buffer, text: string): void {
  const estimatedDuration = buffer.length / MP3_BYTES_PER_SECOND;
  const minExpectedDuration = Math.max(
    MIN_AUDIO_DURATION_SECONDS,
    text.length * SECONDS_PER_CHARACTER
  );

  if (estimatedDuration < minExpectedDuration * 0.5) {
    // Allow 50% margin to account for fast speech
    throw new Error(
      `Audio too short: ~${estimatedDuration.toFixed(2)}s for "${text}" ` +
      `(expected at least ${(minExpectedDuration * 0.5).toFixed(2)}s)`
    );
  }
}

// ============================================================================
// VERIFIED AUDIO GENERATION
// ============================================================================
// OpenAI TTS occasionally returns incorrect audio (wrong words, random content).
// This system verifies generated audio by transcribing it with Whisper and
// regenerating if the content doesn't match.
// ============================================================================

const MAX_VERIFICATION_ATTEMPTS = 3;

interface VerifiedTTSOptions extends TTSOptions {
  /** Skip verification (for batch operations where speed is critical) */
  skipVerification?: boolean;
}

/**
 * Result from generateVerifiedAudio
 * Issue #134: Now returns verification status so callers can flag unverified audio
 */
export interface VerifiedAudioResult {
  buffer: Buffer;
  verified: boolean;
}

interface VerificationResult {
  buffer: Buffer;
  verified: boolean;
  transcription?: string;
  attempts: number;
}

/**
 * Normalize text for comparison
 * Removes punctuation, extra spaces, and converts to lowercase
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.!?,;:'"]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Check if transcription matches expected text
 * Uses fuzzy matching to account for minor transcription differences
 */
function transcriptionMatches(transcription: string, expected: string): boolean {
  const normalizedTranscription = normalizeText(transcription);
  const normalizedExpected = normalizeText(expected);

  // Exact match
  if (normalizedTranscription === normalizedExpected) {
    return true;
  }

  // Contains match (for short words that might have extra sounds)
  if (
    normalizedTranscription.includes(normalizedExpected) ||
    normalizedExpected.includes(normalizedTranscription)
  ) {
    return true;
  }

  // For very short words (< 6 chars), check if first few characters match
  if (normalizedExpected.length < 6 && normalizedTranscription.length >= 3) {
    const prefix = normalizedExpected.slice(0, 3);
    if (normalizedTranscription.startsWith(prefix)) {
      return true;
    }
  }

  return false;
}

/**
 * Transcribe audio buffer using Whisper
 */
async function transcribeAudio(
  audioBuffer: Buffer,
  languageCode?: string
): Promise<string> {
  const openai = getOpenAI();

  // Convert Buffer to Uint8Array for Blob compatibility
  const uint8Array = new Uint8Array(audioBuffer);
  const blob = new Blob([uint8Array], { type: 'audio/mpeg' });
  const file = new File([blob], 'audio.mp3', { type: 'audio/mpeg' });

  const transcription = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
    language: languageCode?.split('-')[0], // Use base language code (pt, en, sv)
  });

  return transcription.text;
}

/**
 * Generate audio with verification
 *
 * This function generates TTS audio and verifies the content matches
 * the expected text by transcribing with Whisper. If verification fails,
 * it retries with different parameters (slower speed, punctuation).
 *
 * IMPORTANT: This adds ~1-2 seconds per generation due to Whisper transcription.
 * For batch operations, consider using skipVerification=true.
 *
 * Issue #134 change: Now returns { buffer, verified } instead of just buffer.
 * When verification fails after all retries, returns the last buffer with verified=false.
 * This allows callers to store the flag and show a warning icon in the UI.
 *
 * @param options - TTS options including text and language
 * @returns Object with audio buffer and verification status
 * @throws Error if no audio could be generated at all
 */
export async function generateVerifiedAudio(
  options: VerifiedTTSOptions
): Promise<VerifiedAudioResult> {
  const { text, languageCode, skipVerification = false, userId } = options;

  // If skipping verification, just generate normally (assume verified)
  if (skipVerification) {
    const buffer = await generateAudio(options);
    return { buffer, verified: true };
  }

  let lastTranscription = '';
  let lastBuffer: Buffer | null = null;

  // Attempt configurations: progressively slower and with punctuation
  const attemptConfigs = [
    { speed: 0.95, textModifier: (t: string) => t },
    { speed: 0.85, textModifier: (t: string) => t },
    { speed: 0.8, textModifier: (t: string) => t.endsWith('.') ? t : `${t}.` },
  ];

  for (let attempt = 0; attempt < MAX_VERIFICATION_ATTEMPTS; attempt++) {
    const config = attemptConfigs[attempt] || attemptConfigs[attemptConfigs.length - 1];
    const modifiedText = config.textModifier(text);

    try {
      // Generate audio
      const buffer = await generateAudio({
        ...options,
        text: modifiedText,
        speed: config.speed,
      });

      // Validate duration before expensive Whisper call
      validateAudioDuration(buffer, text);

      lastBuffer = buffer;

      // Transcribe and verify
      const transcription = await transcribeAudio(buffer, languageCode);
      lastTranscription = transcription;

      if (transcriptionMatches(transcription, text)) {
        if (attempt > 0) {
          console.log(
            `[TTS] Verified on attempt ${attempt + 1}: "${text}" → "${transcription}"`
          );
        }
        return { buffer, verified: true };
      }

      console.warn(
        `[TTS] Verification failed attempt ${attempt + 1}/${MAX_VERIFICATION_ATTEMPTS}: ` +
        `expected "${text}", got "${transcription}"`
      );
    } catch (error) {
      console.error(`[TTS] Generation attempt ${attempt + 1} failed:`, error);
    }
  }

  // All attempts failed - log detailed error
  console.error(
    `[TTS] VERIFICATION FAILED after ${MAX_VERIFICATION_ATTEMPTS} attempts: ` +
    `text="${text}", lastTranscription="${lastTranscription}", ` +
    `userId=${userId || 'unknown'}`
  );

  // Issue #134: Return last buffer with verified=false instead of throwing/silently returning
  // This allows callers to store the unverified flag and show a warning icon in the UI
  if (lastBuffer) {
    return { buffer: lastBuffer, verified: false };
  }

  throw new Error(
    `TTS generation failed after ${MAX_VERIFICATION_ATTEMPTS} attempts for "${text}"`
  );
}

/**
 * Check if an existing audio buffer contains the expected content
 *
 * Useful for validating cached or stored audio files.
 *
 * @param audioBuffer - Audio buffer to verify
 * @param expectedText - Expected spoken text
 * @param languageCode - Language code for transcription
 * @returns True if audio matches expected text
 */
export async function verifyAudioContent(
  audioBuffer: Buffer,
  expectedText: string,
  languageCode?: string
): Promise<boolean> {
  try {
    const transcription = await transcribeAudio(audioBuffer, languageCode);
    return transcriptionMatches(transcription, expectedText);
  } catch (error) {
    console.error('[TTS] Verification failed:', error);
    return false;
  }
}
