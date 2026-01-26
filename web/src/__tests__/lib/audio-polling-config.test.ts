import { describe, it, expect } from 'vitest';
import {
  AUDIO_POLLING_TIMEOUT_MS,
  AUDIO_POLLING_INITIAL_INTERVAL_MS,
  AUDIO_POLLING_BACKOFF_MULTIPLIER,
  AUDIO_POLLING_MAX_INTERVAL_MS,
} from '@/lib/audio/polling-config';

/**
 * Tests for audio polling configuration
 *
 * Issue #129: Silent failures in background audio/sentence generation
 * - Users were waiting 60 seconds before seeing retry button for failed audio
 * - Reduced timeout to 30 seconds for faster feedback
 *
 * These tests ensure the configuration stays correct and doesn't regress.
 */
describe('Audio Polling Configuration', () => {
  describe('AUDIO_POLLING_TIMEOUT_MS', () => {
    // Happy path: Timeout is 30 seconds (Issue #129 fix)
    it('should be 30 seconds (30000ms) per Issue #129', () => {
      expect(AUDIO_POLLING_TIMEOUT_MS).toBe(30000);
    });

    // Failure test: Ensure timeout is NOT the old 60 second value
    it('should NOT be 60 seconds (the old value that caused slow failure feedback)', () => {
      expect(AUDIO_POLLING_TIMEOUT_MS).not.toBe(60000);
    });

    // Sanity check: Timeout is reasonable (not too short, not too long)
    it('should be between 15 and 45 seconds for reasonable UX', () => {
      expect(AUDIO_POLLING_TIMEOUT_MS).toBeGreaterThanOrEqual(15000);
      expect(AUDIO_POLLING_TIMEOUT_MS).toBeLessThanOrEqual(45000);
    });
  });

  describe('AUDIO_POLLING_INITIAL_INTERVAL_MS', () => {
    it('should be 1 second for responsive first check', () => {
      expect(AUDIO_POLLING_INITIAL_INTERVAL_MS).toBe(1000);
    });

    it('should be less than max interval', () => {
      expect(AUDIO_POLLING_INITIAL_INTERVAL_MS).toBeLessThan(AUDIO_POLLING_MAX_INTERVAL_MS);
    });
  });

  describe('AUDIO_POLLING_BACKOFF_MULTIPLIER', () => {
    it('should be 1.5 for gradual exponential backoff', () => {
      expect(AUDIO_POLLING_BACKOFF_MULTIPLIER).toBe(1.5);
    });

    it('should be greater than 1 (otherwise no backoff)', () => {
      expect(AUDIO_POLLING_BACKOFF_MULTIPLIER).toBeGreaterThan(1);
    });

    it('should be less than 3 (otherwise too aggressive)', () => {
      expect(AUDIO_POLLING_BACKOFF_MULTIPLIER).toBeLessThan(3);
    });
  });

  describe('AUDIO_POLLING_MAX_INTERVAL_MS', () => {
    it('should be 5 seconds to prevent excessive waiting between polls', () => {
      expect(AUDIO_POLLING_MAX_INTERVAL_MS).toBe(5000);
    });

    it('should be less than total timeout (otherwise only one poll)', () => {
      expect(AUDIO_POLLING_MAX_INTERVAL_MS).toBeLessThan(AUDIO_POLLING_TIMEOUT_MS);
    });
  });

  describe('Polling sequence calculation', () => {
    // Verify the polling sequence is reasonable within the timeout
    it('should allow multiple polls within timeout period', () => {
      let elapsed = 0;
      let interval = AUDIO_POLLING_INITIAL_INTERVAL_MS;
      let pollCount = 0;

      while (elapsed < AUDIO_POLLING_TIMEOUT_MS) {
        elapsed += interval;
        pollCount++;
        interval = Math.min(interval * AUDIO_POLLING_BACKOFF_MULTIPLIER, AUDIO_POLLING_MAX_INTERVAL_MS);
      }

      // Should have at least 5 poll attempts in 30 seconds
      // (1s + 1.5s + 2.25s + 3.38s + 5s + 5s + 5s + 5s... = many attempts)
      expect(pollCount).toBeGreaterThanOrEqual(5);
    });

    // Failure test: Ensure we don't poll too infrequently
    it('should not exceed 10 seconds between any two polls', () => {
      let interval = AUDIO_POLLING_INITIAL_INTERVAL_MS;

      for (let i = 0; i < 20; i++) {
        expect(interval).toBeLessThanOrEqual(10000);
        interval = Math.min(interval * AUDIO_POLLING_BACKOFF_MULTIPLIER, AUDIO_POLLING_MAX_INTERVAL_MS);
      }
    });
  });
});
