import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  checkSecurityRateLimit,
  SECURITY_RATE_LIMITS,
  getRateLimitForTier,
} from '@/lib/security/rate-limiter';

/**
 * Rate Limiter Tests
 *
 * These tests focus on:
 * 1. Correct tier configurations
 * 2. Fail-open behavior when Redis is not configured
 * 3. Response format validation
 *
 * Note: Tests for actual Redis behavior require integration tests
 * with a real Upstash instance. Unit tests verify fail-open behavior.
 */
describe('Security Rate Limiter', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    // Ensure Redis is not configured for unit tests (fail-open mode)
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('SECURITY_RATE_LIMITS', () => {
    it('defines correct tier limits', () => {
      expect(SECURITY_RATE_LIMITS.unauthenticated).toBe(10);
      expect(SECURITY_RATE_LIMITS.expensive).toBe(30);
      expect(SECURITY_RATE_LIMITS.write).toBe(60);
      expect(SECURITY_RATE_LIMITS.read).toBe(120);
    });

    it('all tiers have positive limits', () => {
      for (const [tier, limit] of Object.entries(SECURITY_RATE_LIMITS)) {
        expect(limit).toBeGreaterThan(0);
      }
    });

    it('tiers are ordered by cost (unauthenticated < expensive < write < read)', () => {
      expect(SECURITY_RATE_LIMITS.unauthenticated).toBeLessThan(
        SECURITY_RATE_LIMITS.expensive
      );
      expect(SECURITY_RATE_LIMITS.expensive).toBeLessThan(
        SECURITY_RATE_LIMITS.write
      );
      expect(SECURITY_RATE_LIMITS.write).toBeLessThan(
        SECURITY_RATE_LIMITS.read
      );
    });
  });

  describe('getRateLimitForTier', () => {
    it('returns correct limit for unauthenticated tier', () => {
      expect(getRateLimitForTier('unauthenticated')).toBe(10);
    });

    it('returns correct limit for expensive tier', () => {
      expect(getRateLimitForTier('expensive')).toBe(30);
    });

    it('returns correct limit for write tier', () => {
      expect(getRateLimitForTier('write')).toBe(60);
    });

    it('returns correct limit for read tier', () => {
      expect(getRateLimitForTier('read')).toBe(120);
    });
  });

  describe('checkSecurityRateLimit (fail-open mode)', () => {
    // Without Redis configured, the rate limiter should fail-open

    it('returns success when Redis URL is not configured', async () => {
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;

      const result = await checkSecurityRateLimit('expensive', 'user:123');

      expect(result.success).toBe(true);
    });

    it('returns correct limit for tier even in fail-open mode', async () => {
      const result = await checkSecurityRateLimit('expensive', 'user:123');
      expect(result.limit).toBe(30);

      const result2 = await checkSecurityRateLimit('write', 'user:456');
      expect(result2.limit).toBe(60);
    });

    it('remaining equals limit in fail-open mode', async () => {
      const result = await checkSecurityRateLimit('expensive', 'user:123');
      expect(result.remaining).toBe(result.limit);
    });

    it('uses correct limit for unauthenticated tier', async () => {
      const result = await checkSecurityRateLimit('unauthenticated', 'ip:1.2.3.4');
      expect(result.limit).toBe(10);
    });

    it('uses correct limit for expensive tier', async () => {
      const result = await checkSecurityRateLimit('expensive', 'user:123');
      expect(result.limit).toBe(30);
    });

    it('uses correct limit for write tier', async () => {
      const result = await checkSecurityRateLimit('write', 'user:456');
      expect(result.limit).toBe(60);
    });

    it('uses correct limit for read tier', async () => {
      const result = await checkSecurityRateLimit('read', 'user:789');
      expect(result.limit).toBe(120);
    });
  });

  describe('response format', () => {
    it('includes all required fields', async () => {
      const result = await checkSecurityRateLimit('expensive', 'user:123');

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('limit');
      expect(result).toHaveProperty('remaining');
      expect(result).toHaveProperty('reset');
    });

    it('success is a boolean', async () => {
      const result = await checkSecurityRateLimit('expensive', 'user:123');
      expect(typeof result.success).toBe('boolean');
    });

    it('limit is a positive number', async () => {
      const result = await checkSecurityRateLimit('expensive', 'user:123');
      expect(typeof result.limit).toBe('number');
      expect(result.limit).toBeGreaterThan(0);
    });

    it('remaining is a non-negative number', async () => {
      const result = await checkSecurityRateLimit('expensive', 'user:123');
      expect(typeof result.remaining).toBe('number');
      expect(result.remaining).toBeGreaterThanOrEqual(0);
    });

    it('reset is a Unix timestamp in seconds', async () => {
      const now = Math.floor(Date.now() / 1000);
      const result = await checkSecurityRateLimit('expensive', 'user:123');

      expect(typeof result.reset).toBe('number');
      // Reset should be in the future (within 2 minutes)
      expect(result.reset).toBeGreaterThan(now);
      expect(result.reset).toBeLessThan(now + 120);
    });

    it('remaining is less than or equal to limit', async () => {
      const result = await checkSecurityRateLimit('expensive', 'user:123');
      expect(result.remaining).toBeLessThanOrEqual(result.limit);
    });
  });

  describe('identifier handling', () => {
    it('accepts user identifiers', async () => {
      const result = await checkSecurityRateLimit('expensive', 'user:abc-123');
      expect(result.success).toBe(true);
    });

    it('accepts IP identifiers', async () => {
      const result = await checkSecurityRateLimit('unauthenticated', 'ip:192.168.1.1');
      expect(result.success).toBe(true);
    });

    it('handles UUID identifiers', async () => {
      const result = await checkSecurityRateLimit(
        'write',
        'user:550e8400-e29b-41d4-a716-446655440000'
      );
      expect(result.success).toBe(true);
    });
  });
});
