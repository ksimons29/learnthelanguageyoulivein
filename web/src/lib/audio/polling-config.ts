/**
 * Audio polling configuration
 *
 * These constants control how the client polls for audio generation status.
 * Extracted to a separate module for testability.
 */

/**
 * Total timeout for audio polling in milliseconds.
 * After this time, the client stops polling and marks audio as failed.
 *
 * Set to 30 seconds (reduced from 60s per Issue #129):
 * - Users see "Retry" button faster when audio fails
 * - Better UX than waiting a full minute for failure feedback
 *
 * The server-side audio generation with retries typically completes in 5-15s.
 * 30s provides generous headroom while improving failure feedback time.
 */
export const AUDIO_POLLING_TIMEOUT_MS = 30000;

/**
 * Initial polling interval in milliseconds.
 * First poll happens after this delay.
 */
export const AUDIO_POLLING_INITIAL_INTERVAL_MS = 1000;

/**
 * Backoff multiplier for exponential backoff.
 * Each subsequent poll interval = previous interval * this multiplier.
 */
export const AUDIO_POLLING_BACKOFF_MULTIPLIER = 1.5;

/**
 * Maximum polling interval in milliseconds.
 * Interval stops increasing once it reaches this value.
 */
export const AUDIO_POLLING_MAX_INTERVAL_MS = 5000;
