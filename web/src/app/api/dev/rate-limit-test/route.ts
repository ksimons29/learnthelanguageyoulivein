import { NextRequest, NextResponse } from 'next/server';
import { checkSecurityRateLimit, SECURITY_RATE_LIMITS } from '@/lib/security/rate-limiter';

/**
 * Debug endpoint to test rate limiting
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

  // Test rate limit
  const identifier = `test:ip:${ip}`;
  const result = await checkSecurityRateLimit('unauthenticated', identifier);

  return NextResponse.json({
    envCheck,
    ip,
    identifier,
    limits: SECURITY_RATE_LIMITS,
    result,
  });
}
