import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Debug endpoint to test rate limiting directly
 * GET /api/dev/rate-limit-test
 */
export async function GET(request: NextRequest) {
  const envCheck = {
    hasUrl: !!process.env.UPSTASH_REDIS_REST_URL,
    hasToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
    urlPrefix: process.env.UPSTASH_REDIS_REST_URL?.substring(0, 30) || 'not set',
  };

  // Get client IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0].trim() || realIp || 'unknown';
  const identifier = `test:ip:${ip}`;

  let directResult = null;
  let directError = null;

  // Test Upstash directly
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      prefix: 'test:ratelimit',
    });

    const result = await ratelimit.limit(identifier);
    directResult = {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    directError = error instanceof Error ? error.message : String(error);
  }

  return NextResponse.json({
    envCheck,
    ip,
    identifier,
    directResult,
    directError,
  });
}
