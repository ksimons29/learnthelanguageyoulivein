/**
 * Audio polling configuration
 *
 * These constants control how the client polls for audio generation status.
 * Extracted to a separate module for testability.
 *
 * Issue #135 UX improvement timeline:
 * - 0-15s: Normal spinner
 * - 15-20s: Show "Taking longer than expected..." warning
 * - 20-30s: Show "Retry" button (user can retry or keep waiting)
 * - 30s: Auto-fail, show permanent retry button
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
 * Threshold for showing "Taking longer than expected..." message.
 * At 15 seconds, the user has been waiting long enough to appreciate feedback.
 * Issue #135: Provides early feedback before showing retry option.
 */
export const AUDIO_SHOW_WARNING_MS = 15000;

/**
 * Threshold for showing early "Retry" button while still waiting.
 * At 20 seconds, give users the option to retry without waiting for full timeout.
 * Issue #135: Users can choose to retry early or continue waiting.
 */
export const AUDIO_SHOW_EARLY_RETRY_MS = 20000;

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
