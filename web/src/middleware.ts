import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { checkIpRateLimit } from '@/lib/security/rate-limit-check';

/**
 * Next.js Middleware
 *
 * Runs on every request to:
 * 1. Apply IP-based rate limiting for API routes (DDoS protection)
 * 2. Refresh Supabase auth sessions and protect routes
 */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // IP-based rate limiting for API routes
  // This catches brute force/DDoS before authentication
  if (pathname.startsWith('/api/')) {
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
