/**
 * Rate Limiting Utilities
 *
 * Enforces subscription-based limits for the application.
 * Currently implements daily limits for:
 * - Word captures (free tier: 50/day)
 * - Review sessions (free tier: 10/day)
 *
 * Note: For DDoS protection, use Vercel's edge rate limiting or Upstash.
 * These limits are for subscription enforcement, not security.
 */

import { db } from '@/lib/db';
import { words, reviewSessions } from '@/lib/db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';

/**
 * Subscription tier limits
 * TODO: Move to a proper subscription system when implementing Stripe
 */
export const RATE_LIMITS = {
  free: {
    wordsPerDay: 50,
    reviewSessionsPerDay: 10,
  },
  // Premium tier - no limits (for future Stripe integration)
  premium: {
    wordsPerDay: Infinity,
    reviewSessionsPerDay: Infinity,
  },
} as const;

export type SubscriptionTier = keyof typeof RATE_LIMITS;

/**
 * Get start of today in UTC
 */
function getStartOfToday(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/**
 * Check if user has exceeded their daily word capture limit
 *
 * @param userId - The user's ID
 * @param tier - The user's subscription tier (default: 'free')
 * @returns Object with allowed status and current/max counts
 */
export async function checkWordCaptureLimit(
  userId: string,
  tier: SubscriptionTier = 'free'
): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
}> {
  const limit = RATE_LIMITS[tier].wordsPerDay;

  // Premium users have no limits
  if (limit === Infinity) {
    return { allowed: true, current: 0, limit: Infinity, remaining: Infinity };
  }

  const startOfToday = getStartOfToday();

  // Count words captured today
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(words)
    .where(
      and(
        eq(words.userId, userId),
        gte(words.createdAt, startOfToday)
      )
    );

  const current = Number(result[0]?.count ?? 0);
  const remaining = Math.max(0, limit - current);

  return {
    allowed: current < limit,
    current,
    limit,
    remaining,
  };
}

/**
 * Check if user has exceeded their daily review session limit
 *
 * @param userId - The user's ID
 * @param tier - The user's subscription tier (default: 'free')
 * @returns Object with allowed status and current/max counts
 */
export async function checkReviewSessionLimit(
  userId: string,
  tier: SubscriptionTier = 'free'
): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
}> {
  const limit = RATE_LIMITS[tier].reviewSessionsPerDay;

  // Premium users have no limits
  if (limit === Infinity) {
    return { allowed: true, current: 0, limit: Infinity, remaining: Infinity };
  }

  const startOfToday = getStartOfToday();

  // Count review sessions started today
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(reviewSessions)
    .where(
      and(
        eq(reviewSessions.userId, userId),
        gte(reviewSessions.startedAt, startOfToday)
      )
    );

  const current = Number(result[0]?.count ?? 0);
  const remaining = Math.max(0, limit - current);

  return {
    allowed: current < limit,
    current,
    limit,
    remaining,
  };
}

/**
 * Rate limit error response helper
 */
export function rateLimitResponse(
  resource: 'words' | 'reviews',
  limitInfo: { current: number; limit: number; remaining: number }
) {
  return {
    error: `Daily ${resource} limit reached`,
    code: 'RATE_LIMIT_EXCEEDED',
    details: {
      current: limitInfo.current,
      limit: limitInfo.limit,
      remaining: limitInfo.remaining,
      resetsAt: getStartOfTomorrow().toISOString(),
    },
  };
}

function getStartOfTomorrow(): Date {
  const today = getStartOfToday();
  return new Date(today.getTime() + 24 * 60 * 60 * 1000);
}
