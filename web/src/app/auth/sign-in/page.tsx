'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

/**
 * Sign In Page
 *
 * Design: Moleskine notebook aesthetic
 * - Paper texture background
 * - Card with stitched binding edge
 * - Coral ribbon accent on primary CTA
 */
export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      // Redirect to home after successful sign in
      router.push('/');
      router.refresh();
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="heading-serif text-2xl text-[var(--text-heading)] mb-2">
                Welcome Back
              </h1>
              <p className="text-[var(--text-muted)] text-sm">
                Continue your language journey
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
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--notebook-ruling)]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[var(--surface-page)] text-[var(--text-muted)]">
                  or sign in with email
                </span>
              </div>
            </div>

            {/* Email/Password form */}
            <form onSubmit={handleSignIn} className="space-y-4">
              {error && (
                <div
                  className="p-3 border rounded-lg text-sm"
                  style={{
                    backgroundColor: "var(--state-hard-bg)",
                    borderColor: "var(--state-hard)",
                    color: "var(--state-hard)",
                  }}
                >
                  {error}
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
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-[var(--text-body)]"
                  >
                    Password
                  </label>
                  <Link
                    href="/auth/reset-password"
                    className="text-sm text-[var(--accent-nav)] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-nav)] focus:border-transparent transition-shadow"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--surface-page-aged)",
                    color: "var(--text-body)",
                  }}
                  required
                />
              </div>

              {/* Primary CTA with coral ribbon accent */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-[var(--accent-ribbon)] hover:bg-[var(--accent-ribbon-hover)] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isLoading ? (
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
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Sign up link */}
            <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/sign-up"
                className="text-[var(--accent-nav)] hover:underline font-medium"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
