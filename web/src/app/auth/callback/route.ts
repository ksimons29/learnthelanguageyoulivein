import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Auth Callback Handler
 *
 * Handles:
 * - Email confirmation links
 * - OAuth redirects (Google, Apple)
 * - Password reset links
 *
 * After successful auth, redirects to onboarding (new users) or home (existing users)
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';

  if (code) {
    const supabase = await createClient();

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if user has completed onboarding
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Check for existing profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .single();

        // Redirect based on onboarding status
        if (!profile || !profile.onboarding_completed) {
          return NextResponse.redirect(
            new URL('/onboarding', requestUrl.origin)
          );
        }
      }

      // User has completed onboarding, redirect to next or home
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  // If there's an error or no code, redirect to sign-in
  return NextResponse.redirect(new URL('/auth/sign-in', requestUrl.origin));
}
