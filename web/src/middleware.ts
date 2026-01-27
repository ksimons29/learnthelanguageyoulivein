import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { checkIpRateLimit } from '@/lib/security/rate-limit-check';

/**
 * Next.js Middleware
 *
 * Runs on every request to:
 * 1. Apply IP-based rate limiting for mutating API routes (DDoS protection)
 * 2. Refresh Supabase auth sessions and protect routes
 *
 * Rate limiting strategy:
 * - Middleware: Only rate-limits POST/PUT/DELETE requests (mutation protection)
 * - Route-level: Individual routes apply their own tier-based limits
 *
 * Why only mutating requests?
 * - GET requests are read-only and relatively cheap
 * - A page load triggers 5-6 concurrent GET requests (onboarding/status, words,
 *   words/stats, tours/progress, gamification/state)
 * - The old 10 req/min limit for ALL requests caused 429s on normal page loads
 * - DDoS/brute force attacks target write endpoints (auth, word capture)
 */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // IP-based rate limiting for mutating API routes only
  // GET requests are cheaper and have route-level rate limiting
  // This catches brute force/DDoS on write operations before authentication
  const isMutatingRequest = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);

  if (pathname.startsWith('/api/') && isMutatingRequest) {
    try {
      const rateLimit = await checkIpRateLimit(request);
      if (!rateLimit.success && rateLimit.response) {
        return rateLimit.response;
      }
    } catch (error) {
      // Fail-open: log error but continue
      console.error('[Middleware] Rate limit error:', error);
    }
  }

  // Continue with session handling
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
