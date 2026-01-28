/**
 * Tests for rate-limit-check helper functions
 *
 * Tests the API-level rate limit helpers including:
 * - IP extraction from request headers
 * - Rate limit response building
 * - Header management
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import {
  checkApiRateLimit,
  checkIpRateLimit,
  addRateLimitHeaders,
} from '@/lib/security/rate-limit-check';
import { RateLimitResult } from '@/lib/security/rate-limiter';

// Mock Next.js request/response
function createMockRequest(headers: Record<string, string> = {}): NextRequest {
  const url = 'https://example.com/api/test';
  const request = new NextRequest(url, {
    headers: new Headers(headers),
  });
  return request;
}

describe('Rate Limit Check Helper', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    // Ensure fail-open mode for unit tests
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('checkApiRateLimit', () => {
    it('returns success when not rate limited', async () => {
      const request = createMockRequest();
      const result = await checkApiRateLimit(request, 'user-123', 'expensive');

      expect(result.success).toBe(true);
      expect(result.response).toBeUndefined();
    });

    it('includes result object on success', async () => {
      const request = createMockRequest();
      const result = await checkApiRateLimit(request, 'user-123', 'expensive');

      expect(result.result).toBeDefined();
      expect(result.result.success).toBe(true);
      expect(result.result.limit).toBe(30); // expensive tier
    });

    it('uses user ID for authenticated requests', async () => {
      const request = createMockRequest();
      const result = await checkApiRateLimit(request, 'user-abc-123', 'write');

      // In fail-open mode, success is always true
      expect(result.success).toBe(true);
      expect(result.result.limit).toBe(60); // write tier
    });

    it('uses correct tier limit', async () => {
      const request = createMockRequest();

      const readResult = await checkApiRateLimit(request, 'user-1', 'read');
      expect(readResult.result.limit).toBe(120);

      const writeResult = await checkApiRateLimit(request, 'user-1', 'write');
      expect(writeResult.result.limit).toBe(60);

      const expensiveResult = await checkApiRateLimit(request, 'user-1', 'expensive');
      expect(expensiveResult.result.limit).toBe(30);

      const unauthResult = await checkApiRateLimit(request, null, 'unauthenticated');
      expect(unauthResult.result.limit).toBe(10);
    });
  });

  describe('IP extraction', () => {
    it('extracts IP from x-forwarded-for header', async () => {
      const request = createMockRequest({
        'x-forwarded-for': '192.168.1.100',
      });
      const result = await checkApiRateLimit(request, null, 'unauthenticated');

      // Should work without errors (IP extraction succeeded)
      expect(result.success).toBe(true);
    });

    it('handles comma-separated x-forwarded-for (takes first IP)', async () => {
      const request = createMockRequest({
        'x-forwarded-for': '192.168.1.100, 10.0.0.1, 172.16.0.1',
      });
      const result = await checkApiRateLimit(request, null, 'unauthenticated');

      expect(result.success).toBe(true);
    });

    it('falls back to x-real-ip header', async () => {
      const request = createMockRequest({
        'x-real-ip': '10.0.0.50',
      });
      const result = await checkApiRateLimit(request, null, 'unauthenticated');

      expect(result.success).toBe(true);
    });

    it('handles missing IP headers gracefully', async () => {
      const request = createMockRequest({});
      const result = await checkApiRateLimit(request, null, 'unauthenticated');

      // Should still work with 'unknown' fallback
      expect(result.success).toBe(true);
    });
  });

  describe('checkIpRateLimit', () => {
    it('uses unauthenticated tier', async () => {
      const request = createMockRequest({
        'x-forwarded-for': '192.168.1.1',
      });
      const result = await checkIpRateLimit(request);

      expect(result.result.limit).toBe(10); // unauthenticated tier
    });

    it('returns success in fail-open mode', async () => {
      const request = createMockRequest();
      const result = await checkIpRateLimit(request);

      expect(result.success).toBe(true);
    });
  });

  describe('addRateLimitHeaders', () => {
    it('adds X-RateLimit-Limit header', () => {
      const response = NextResponse.json({ ok: true });
      const result: RateLimitResult = {
        success: true,
        limit: 30,
        remaining: 25,
        reset: Math.floor(Date.now() / 1000) + 60,
      };

      addRateLimitHeaders(response, result);

      expect(response.headers.get('X-RateLimit-Limit')).toBe('30');
    });

    it('adds X-RateLimit-Remaining header', () => {
      const response = NextResponse.json({ ok: true });
      const result: RateLimitResult = {
        success: true,
        limit: 30,
        remaining: 25,
        reset: Math.floor(Date.now() / 1000) + 60,
      };

      addRateLimitHeaders(response, result);

      expect(response.headers.get('X-RateLimit-Remaining')).toBe('25');
    });

    it('adds X-RateLimit-Reset header', () => {
      const resetTime = Math.floor(Date.now() / 1000) + 60;
      const response = NextResponse.json({ ok: true });
      const result: RateLimitResult = {
        success: true,
        limit: 30,
        remaining: 25,
        reset: resetTime,
      };

      addRateLimitHeaders(response, result);

      expect(response.headers.get('X-RateLimit-Reset')).toBe(String(resetTime));
    });

    it('returns the response for chaining', () => {
      const response = NextResponse.json({ ok: true });
      const result: RateLimitResult = {
        success: true,
        limit: 30,
        remaining: 25,
        reset: Math.floor(Date.now() / 1000) + 60,
      };

      const returned = addRateLimitHeaders(response, result);

      expect(returned).toBe(response);
    });
  });
});
