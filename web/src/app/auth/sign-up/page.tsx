'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Mail, RefreshCw, CheckCircle } from 'lucide-react';

/**
 * Parse Supabase rate limit error to extract wait time
 * Example: "For security purposes, you can only request this after 32 seconds."
 */
function parseRateLimitSeconds(message: string): number | null {
  const match = message.match(/after (\d+) seconds/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Sign Up Page
 *
 * Step 1 of the two-step signup flow:
 * 1. Create account (this page)
 * 2. Onboarding (languages + reason)
 *
 * Handles email confirmation flow when Supabase has it enabled.
 * If session is null but user exists, shows "check email" UI.
 *
 * Design: Moleskine notebook aesthetic
 * - Paper texture background
 * - Card with stitched binding edge
 * - Coral ribbon accent on primary CTA
 */
export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitCountdown, setRateLimitCountdown] = useState<number | null>(null);

  // Email confirmation state
  const [emailSent, setEmailSent] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Countdown timer for rate limit
  useEffect(() => {
    if (rateLimitCountdown === null || rateLimitCountdown <= 0) return;

    const timer = setInterval(() => {
      setRateLimitCountdown((prev) => {
        if (prev === null || prev <= 1) {
          setError(null); // Clear error when countdown finishes
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [rateLimitCountdown]);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCountdown <= 0) return;

    const timer = setInterval(() => {
      setResendCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCountdown]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        // Check for rate limit error and extract countdown
        const rateLimitSeconds = parseRateLimitSeconds(signUpError.message);
        if (rateLimitSeconds) {
          setRateLimitCountdown(rateLimitSeconds);
          setError(`Too many attempts. Please wait ${rateLimitSeconds} seconds.`);
        } else {
          setError(signUpError.message);
        }
        return;
      }

      // Check if email confirmation is required
      // If session is null but user exists, email confirmation is pending
      if (data.user && !data.session) {
        setEmailSent(true);
        setResendCountdown(60);
        return;
      }

      // Session exists - auto-confirm is enabled, proceed to onboarding
      router.push('/auth/onboarding');
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (resendCountdown > 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        const rateLimitSeconds = parseRateLimitSeconds(error.message);
        if (rateLimitSeconds) {
          setResendCountdown(rateLimitSeconds);
          setError(`Please wait ${rateLimitSeconds} seconds before requesting another email.`);
        } else {
          setError(error.message);
        }
        return;
      }

      setResendCountdown(60);
    } catch {
      setError('Failed to resend email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Email confirmation sent - show check email UI
  if (emailSent) {
    return (
      <div className="min-h-screen notebook-bg flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="relative">
            {/* Binding edge */}
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-[var(--accent-nav)] rounded-l-lg" />

            {/* Stitching marks */}
            <div className="absolute left-3 top-0 bottom-0 w-px flex flex-col justify-around py-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-px bg-[var(--notebook-stitch)]"
                  style={{ marginLeft: '-4px' }}
                />
              ))}
            </div>

            {/* Card content */}
            <div className="bg-[var(--surface-page)] rounded-r-xl rounded-l-none shadow-lg ml-4 p-8">
              {/* Success icon */}
              <div className="flex justify-center mb-6">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--accent-nav-light)' }}
                >
                  <Mail
                    className="w-10 h-10"
                    style={{ color: 'var(--accent-nav)' }}
                  />
                </div>
              </div>

              {/* Header */}
              <div className="text-center mb-6">
                <h1
                  className="text-[28px] leading-tight mb-3 heading-serif"
                  style={{ fontWeight: 700, color: '#000000' }}
                >
                  Check Your Email
                </h1>
                <p
                  className="text-[15px] leading-relaxed"
                  style={{ color: '#5A6268' }}
                >
                  We sent a confirmation link to
                </p>
                <p
                  className="text-[15px] font-medium mt-1"
                  style={{ color: 'var(--accent-nav)' }}
                >
                  {email}
                </p>
              </div>

              {/* Instructions */}
              <div
                className="p-4 rounded-lg mb-6"
                style={{ backgroundColor: 'var(--surface-page-aged)' }}
              >
                <p className="text-sm text-center" style={{ color: '#5A6268' }}>
                  Click the link in the email to verify your account and start
                  your language learning journey.
                </p>
              </div>

              {/* Error message */}
              {error && (
                <div
                  className="p-3 border rounded-lg text-sm mb-4"
                  style={{
                    backgroundColor: 'var(--state-hard-bg)',
                    borderColor: 'var(--state-hard)',
                    color: 'var(--state-hard)',
                  }}
                >
                  {error}
                </div>
              )}

              {/* Resend button */}
              <button
                onClick={handleResendEmail}
                disabled={isLoading || resendCountdown > 0}
                className="w-full py-3 px-4 border rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--text-body)',
                  backgroundColor: 'var(--surface-page)',
                }}
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                {resendCountdown > 0
                  ? `Resend in ${resendCountdown}s`
                  : 'Resend email'}
              </button>

              {/* Back to sign up */}
              <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
                Wrong email?{' '}
                <button
                  onClick={() => setEmailSent(false)}
                  className="text-[var(--accent-nav)] hover:underline font-medium"
                >
                  Go back
                </button>
              </p>

              {/* Sign in link */}
              <p className="mt-4 text-center text-sm text-[var(--text-muted)]">
                Already confirmed?{' '}
                <Link
                  href="/auth/sign-in"
                  className="text-[var(--accent-nav)] hover:underline font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen notebook-bg flex items-center justify-center p-4">
      {/* Main card container */}
      <div className="w-full max-w-md">
        {/* Notebook card with binding */}
        <div className="relative">
          {/* Binding edge */}
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-[var(--accent-nav)] rounded-l-lg" />

          {/* Stitching marks */}
          <div className="absolute left-3 top-0 bottom-0 w-px flex flex-col justify-around py-8">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-px bg-[var(--notebook-stitch)]"
                style={{ marginLeft: '-4px' }}
              />
            ))}
          </div>

          {/* Card content */}
          <div className="bg-[var(--surface-page)] rounded-r-xl rounded-l-none shadow-lg ml-4 p-8">
            {/* Header with Logo */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-5">
                <Image
                  src="/images/llyli-icon.png"
                  alt="LLYLI"
                  width={88}
                  height={88}
                  className="rounded-2xl shadow-lg"
                />
              </div>
              <h1
                className="text-[28px] leading-tight mb-3 heading-serif"
                style={{
                  fontWeight: 700,
                  color: '#000000',
                }}
              >
                Start Your Journey
              </h1>
              <p
                className="text-[15px] leading-relaxed"
                style={{ color: '#5A6268' }}
              >
                Remember real phrases from your daily life
              </p>
            </div>

            {/* Social sign-in buttons (placeholder for Phase 2) */}
            <div className="space-y-3 mb-6">
              <button
                type="button"
                disabled
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text-body)",
                  backgroundColor: "var(--surface-page)",
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continue with Google</span>
                <span className="text-xs text-[var(--text-muted)]">(Coming soon)</span>
              </button>

              <button
                type="button"
                disabled
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text-body)",
                  backgroundColor: "var(--surface-page)",
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                <span>Continue with Apple</span>
                <span className="text-xs text-[var(--text-muted)]">(Coming soon)</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--notebook-ruling)]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[var(--surface-page)] text-[var(--text-muted)]">
                  or continue with email
                </span>
              </div>
            </div>

            {/* Email/Password form */}
            <form onSubmit={handleSignUp} className="space-y-4">
              {error && (
                <div
                  className="p-3 border rounded-lg text-sm"
                  style={{
                    backgroundColor: rateLimitCountdown ? "var(--state-medium-bg)" : "var(--state-hard-bg)",
                    borderColor: rateLimitCountdown ? "var(--state-medium)" : "var(--state-hard)",
                    color: rateLimitCountdown ? "var(--state-medium)" : "var(--state-hard)",
                  }}
                >
                  {rateLimitCountdown
                    ? `Too many attempts. Please wait ${rateLimitCountdown} seconds before trying again.`
                    : error
                  }
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[var(--text-body)] mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-nav)] focus:border-transparent transition-shadow"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--surface-page-aged)",
                    color: "var(--text-body)",
                  }}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[var(--text-body)] mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-nav)] focus:border-transparent transition-shadow"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--surface-page-aged)",
                    color: "var(--text-body)",
                  }}
                  required
                  minLength={8}
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-[var(--text-body)] mb-1"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-nav)] focus:border-transparent transition-shadow"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--surface-page-aged)",
                    color: "var(--text-body)",
                  }}
                  required
                  minLength={8}
                />
              </div>

              {/* Primary CTA with coral ribbon accent */}
              <button
                type="submit"
                disabled={isLoading || rateLimitCountdown !== null}
                className="w-full py-3 px-4 bg-[var(--accent-ribbon)] hover:bg-[var(--accent-ribbon-hover)] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {rateLimitCountdown ? (
                  `Wait ${rateLimitCountdown}s`
                ) : isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Sign in link */}
            <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
              Already have an account?{' '}
              <Link
                href="/auth/sign-in"
                className="text-[var(--accent-nav)] hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>

            {/* Terms notice */}
            <p className="mt-4 text-center text-xs text-[var(--text-muted)]">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>

        {/* Coral ribbon bookmark accent */}
        <div className="absolute right-8 -top-2 w-6 h-16 bg-[var(--accent-ribbon)] rounded-b-sm shadow-md hidden sm:block" />
      </div>
    </div>
  );
}
