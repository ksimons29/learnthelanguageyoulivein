/**
 * Retry Utility
 *
 * Provides robust retry logic with exponential backoff for transient API failures.
 * Used across the codebase for OpenAI TTS, translation, and storage operations.
 */

/**
 * Execute a function with retry logic and exponential backoff.
 *
 * Features:
 * - Configurable max retries and base delay
 * - Exponential backoff: delay doubles each attempt (1s → 2s → 4s → 8s)
 * - Logs warnings for each retry attempt
 * - Throws original error after all retries exhausted
 *
 * @param fn - Async function to execute
 * @param maxRetries - Maximum retry attempts (default: 3)
 * @param baseDelayMs - Initial delay between retries in ms (default: 1000)
 * @returns Result of the function
 * @throws Original error if all retries fail
 *
 * @example
 * ```ts
 * const result = await withRetry(
 *   () => generateAudio({ text, languageCode }),
 *   3,  // 3 retries
 *   2000 // Start with 2s delay
 * );
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      console.warn(
        `Retry ${attempt}/${maxRetries} after ${delay}ms:`,
        error instanceof Error ? error.message : error
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error('Retry exhausted'); // TypeScript: unreachable but satisfies return type
}

/**
 * Sleep utility for adding delays between operations.
 *
 * @param ms - Milliseconds to sleep
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
