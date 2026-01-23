import { db } from '@/lib/db';
import { apiUsageLog } from '@/lib/db/schema/api-usage';

/**
 * API Usage Logger
 *
 * Tracks OpenAI API calls for cost monitoring and analytics.
 *
 * Pricing (as of Jan 2025):
 * - GPT-4o-mini: $0.150 / 1M input tokens, $0.600 / 1M output tokens
 * - TTS-1: $15.00 / 1M characters
 */

const PRICING = {
  'gpt-4o-mini': {
    input: 0.150 / 1_000_000, // $ per input token
    output: 0.600 / 1_000_000, // $ per output token
  },
  'tts-1': {
    perChar: 15.00 / 1_000_000, // $ per character
  },
} as const;

interface GPTUsage {
  apiType: 'translation' | 'sentence_generation' | 'language_detection';
  model: 'gpt-4o-mini';
  promptTokens: number;
  completionTokens: number;
  userId?: string;
  status: 'success' | 'failure' | 'retry';
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

interface TTSUsage {
  apiType: 'tts';
  model: 'tts-1';
  characterCount: number;
  userId?: string;
  status: 'success' | 'failure' | 'retry';
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

type ApiUsage = GPTUsage | TTSUsage;

/**
 * Log API usage to database for cost tracking
 * Fire-and-forget - won't throw errors
 */
export async function logApiUsage(usage: ApiUsage): Promise<void> {
  try {
    let estimatedCost = 0;

    // Calculate cost based on API type
    if (usage.apiType === 'tts') {
      const pricing = PRICING['tts-1'];
      estimatedCost = usage.characterCount * pricing.perChar;
    } else {
      // GPT-based API (translation, sentence_generation, language_detection)
      const pricing = PRICING['gpt-4o-mini'];
      estimatedCost =
        usage.promptTokens * pricing.input +
        usage.completionTokens * pricing.output;
    }

    // Insert log entry
    await db.insert(apiUsageLog).values({
      userId: usage.userId || null,
      apiType: usage.apiType,
      model: usage.model,
      promptTokens: usage.apiType === 'tts' ? null : usage.promptTokens,
      completionTokens: usage.apiType === 'tts' ? null : usage.completionTokens,
      totalTokens: usage.apiType === 'tts' ? null : usage.promptTokens + usage.completionTokens,
      characterCount: usage.apiType === 'tts' ? usage.characterCount : null,
      estimatedCost,
      status: usage.status,
      errorMessage: usage.errorMessage || null,
      metadata: usage.metadata ? JSON.stringify(usage.metadata) : null,
    });
  } catch (error) {
    // Log to console but don't throw - API usage tracking is non-critical
    console.error('Failed to log API usage:', error);
  }
}

/**
 * Helper for GPT API calls with automatic usage logging
 */
export async function withGPTUsageTracking<T>(
  apiType: 'translation' | 'sentence_generation' | 'language_detection',
  userId: string | undefined,
  apiCall: () => Promise<{ result: T; usage: { prompt_tokens: number; completion_tokens: number } }>,
  metadata?: Record<string, unknown>
): Promise<T> {
  try {
    const { result, usage } = await apiCall();

    // Log successful usage
    await logApiUsage({
      apiType,
      model: 'gpt-4o-mini',
      promptTokens: usage.prompt_tokens,
      completionTokens: usage.completion_tokens,
      userId,
      status: 'success',
      metadata,
    });

    return result;
  } catch (error) {
    // Log failed usage (estimate tokens from error if available)
    await logApiUsage({
      apiType,
      model: 'gpt-4o-mini',
      promptTokens: 0, // Unknown on failure
      completionTokens: 0,
      userId,
      status: 'failure',
      errorMessage: error instanceof Error ? error.message : String(error),
      metadata,
    });

    throw error;
  }
}

/**
 * Helper for TTS API calls with automatic usage logging
 */
export async function withTTSUsageTracking<T>(
  userId: string | undefined,
  text: string,
  apiCall: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  try {
    const result = await apiCall();

    // Log successful usage
    await logApiUsage({
      apiType: 'tts',
      model: 'tts-1',
      characterCount: text.length,
      userId,
      status: 'success',
      metadata,
    });

    return result;
  } catch (error) {
    // Log failed usage
    await logApiUsage({
      apiType: 'tts',
      model: 'tts-1',
      characterCount: text.length,
      userId,
      status: 'failure',
      errorMessage: error instanceof Error ? error.message : String(error),
      metadata,
    });

    throw error;
  }
}
