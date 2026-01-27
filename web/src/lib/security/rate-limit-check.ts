/**
 * API Rate Limit Check Helper
 *
 * Provides a convenient helper for checking rate limits in API routes.
 * Returns a pre-built 429 response when rate limited, matching the
 * existing rateLimitResponse() format from subscription limits.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  checkSecurityRateLimit,
  RateLimitTier,
  RateLimitResult,
} from './rate-limiter';

/**
 * Result of rate limit check for API routes
 */
export interface ApiRateLimitResult {
  success: boolean;
  response?: NextResponse; // Pre-built 429 response if rate limited
  result: RateLimitResult;
}

/**
 * Extract client IP from request
 * Handles Vercel's x-forwarded-for header and falls back to other headers
 */
function getClientIp(request: NextRequest): string {
  // Vercel sets x-forwarded-for
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can be comma-separated, take the first (client) IP
    return forwardedFor.split(',')[0].trim();
  }

  // Fallback headers
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Last resort: use a placeholder (shouldn't happen on Vercel)
  return 'unknown';
}

/**
 * Check API rate limit for a request
 *
 * @param request - The incoming request
 * @param userId - User ID if authenticated (null for unauthenticated requests)
 * @param tier - The rate limit tier to apply
 * @returns ApiRateLimitResult with success status and optional 429 response
 *
 * Usage in route handlers:
 * ```typescript
 * const securityLimit = await checkApiRateLimit(request, user.id, 'expensive');
 * if (!securityLimit.success) return securityLimit.response;
 * ```
 */
export async function checkApiRateLimit(
  request: NextRequest,
  userId: string | null,
  tier: RateLimitTier
): Promise<ApiRateLimitResult> {
  // Build identifier: prefer user ID for authenticated requests, fall back to IP
  const identifier = userId ? `user:${userId}` : `ip:${getClientIp(request)}`;

  const result = await checkSecurityRateLimit(tier, identifier);

  if (result.success) {
    return {
      success: true,
      result,
    };
  }

  // Build 429 response matching existing rateLimitResponse format
  const resetsAt = new Date(result.reset * 1000).toISOString();
  const retryAfter = Math.max(1, result.reset - Math.floor(Date.now() / 1000));

  const response = NextResponse.json(
    {
      error: 'Too many requests',
      code: 'RATE_LIMIT_EXCEEDED',
      details: {
        limit: result.limit,
        remaining: result.remaining,
        resetsAt,
      },
    },
    {
      status: 429,
      headers: {
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(result.reset),
        'Retry-After': String(retryAfter),
      },
    }
  );

  return {
    success: false,
    response,
    result,
  };
}

/**
 * Check IP-based rate limit (for unauthenticated requests)
 * Used in middleware before authentication
 */
export async function checkIpRateLimit(
  request: NextRequest
): Promise<ApiRateLimitResult> {
  return checkApiRateLimit(request, null, 'unauthenticated');
}

/**
 * Add rate limit headers to an existing response
 * Useful for adding headers to successful responses
 */
export function addRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult
): NextResponse {
  response.headers.set('X-RateLimit-Limit', String(result.limit));
  response.headers.set('X-RateLimit-Remaining', String(result.remaining));
  response.headers.set('X-RateLimit-Reset', String(result.reset));
  return response;
}
