/**
 * Security Rate Limiting
 *
 * Protects against DDoS attacks and brute force attempts using Upstash Redis.
 * This is SEPARATE from subscription-based limits (50 words/day) which track daily quotas.
 *
 * Rate Limit Tiers:
 * - unauthenticated: 10 req/min - IP-based, catches brute force before auth
 * - expensive: 30 req/min - POST /api/words (OpenAI ~$0.02/call)
 * - write: 60 req/min - POST /api/reviews, /api/feedback
 * - read: 120 req/min - All GET endpoints
 *
 * Fail-Open Strategy: When Redis is unavailable, requests are allowed through.
 * Subscription limits (database-backed) still enforce daily caps.
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Rate limit tiers with requests per minute
 */
export const SECURITY_RATE_LIMITS = {
  unauthenticated: 10,  // IP-based, catches brute force before auth
  expensive: 30,        // POST /api/words (OpenAI ~$0.02/call)
  write: 60,            // POST /api/reviews, /api/feedback
  read: 120,            // All GET endpoints
} as const;

export type RateLimitTier = keyof typeof SECURITY_RATE_LIMITS;

/**
 * Rate limit check result
 */
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp in seconds
}

// Lazy-initialized Redis client and rate limiters
let redis: Redis | null = null;
let rateLimiters: Map<RateLimitTier, Ratelimit> | null = null;
let redisWarningLogged = false;

/**
 * Initialize Redis connection and rate limiters
 * Uses lazy initialization to avoid startup failures if Redis is unavailable
 */
function initializeRateLimiters(): Map<RateLimitTier, Ratelimit> | null {
  if (rateLimiters) {
    return rateLimiters;
  }

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) {
    if (!redisWarningLogged) {
      console.warn(
        '[Rate Limiter] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set. ' +
        'Security rate limiting disabled (fail-open).'
      );
      redisWarningLogged = true;
    }
    return null;
  }

  try {
    redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });

    // Create rate limiters for each tier using sliding window algorithm
    // Sliding window provides smoother rate limiting than fixed windows
    rateLimiters = new Map();

    for (const [tier, limit] of Object.entries(SECURITY_RATE_LIMITS)) {
      rateLimiters.set(
        tier as RateLimitTier,
        new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(limit, '1 m'),
          prefix: `ratelimit:${tier}`,
          analytics: false, // Disable analytics to reduce Redis calls
        })
      );
    }

    return rateLimiters;
  } catch (error) {
    if (!redisWarningLogged) {
      console.error('[Rate Limiter] Failed to initialize Redis:', error);
      redisWarningLogged = true;
    }
    return null;
  }
}

/**
 * Check rate limit for a given tier and identifier
 *
 * @param tier - The rate limit tier to check
 * @param identifier - Unique identifier (e.g., "user:123" or "ip:1.2.3.4")
 * @returns RateLimitResult with success status and metadata
 *
 * Fail-Open: Returns success=true if Redis is unavailable
 */
export async function checkSecurityRateLimit(
  tier: RateLimitTier,
  identifier: string
): Promise<RateLimitResult> {
  const limiters = initializeRateLimiters();

  // Fail-open: if Redis is not configured, allow the request
  if (!limiters) {
    return {
      success: true,
      limit: SECURITY_RATE_LIMITS[tier],
      remaining: SECURITY_RATE_LIMITS[tier],
      reset: Math.floor(Date.now() / 1000) + 60,
    };
  }

  const limiter = limiters.get(tier);
  if (!limiter) {
    // This shouldn't happen, but fail-open if it does
    console.error(`[Rate Limiter] Unknown tier: ${tier}`);
    return {
      success: true,
      limit: SECURITY_RATE_LIMITS[tier],
      remaining: SECURITY_RATE_LIMITS[tier],
      reset: Math.floor(Date.now() / 1000) + 60,
    };
  }

  try {
    const result = await limiter.limit(identifier);

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: Math.floor(result.reset / 1000), // Convert ms to seconds
    };
  } catch (error) {
    // Fail-open on Redis errors
    console.error('[Rate Limiter] Redis error, allowing request:', error);
    return {
      success: true,
      limit: SECURITY_RATE_LIMITS[tier],
      remaining: SECURITY_RATE_LIMITS[tier],
      reset: Math.floor(Date.now() / 1000) + 60,
    };
  }
}

/**
 * Get the rate limit for a tier without consuming a request
 * Useful for displaying limits in error messages
 */
export function getRateLimitForTier(tier: RateLimitTier): number {
  return SECURITY_RATE_LIMITS[tier];
}
