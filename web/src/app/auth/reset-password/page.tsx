'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

/**
 * Password Reset Request Page
 *
 * User enters email to receive a password reset link.
 * Design: Moleskine notebook aesthetic
 */
export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/auth/update-password`,
        }
      );

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setIsSubmitted(true);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen notebook-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Notebook card with binding */}
        <div className="relative">
          {/* Binding edge */}
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-[var(--accent-nav)] rounded-l-lg" />

          {/* Stitching marks */}
          <div className="absolute left-3 top-0 bottom-0 w-px flex flex-col justify-around py-8">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-px bg-[var(--notebook-stitch)]"
                style={{ marginLeft: '-4px' }}
              />
            ))}
          </div>

          {/* Card content */}
          <div className="bg-[var(--surface-page)] rounded-r-xl rounded-l-none shadow-lg ml-4 p-8">
            {isSubmitted ? (
              /* Success state */
              <div className="text-center">
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "var(--state-easy-bg)" }}
                >
                  <svg
                    className="w-8 h-8"
                    style={{ color: "var(--state-easy)" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h1 className="heading-serif text-2xl text-[var(--text-heading)] mb-2">
                  Check Your Email
                </h1>
                <p className="text-[var(--text-muted)] text-sm mb-6">
                  We&apos;ve sent a password reset link to{' '}
                  <span className="font-medium text-[var(--text-body)]">
                    {email}
                  </span>
                </p>
                <p className="text-[var(--text-muted)] text-xs mb-6">
                  Didn&apos;t receive the email? Check your spam folder or try
                  again.
                </p>
                <Link
                  href="/auth/sign-in"
                  className="inline-block py-3 px-6 bg-[var(--accent-ribbon)] hover:bg-[var(--accent-ribbon-hover)] text-white font-medium rounded-lg transition-colors"
                >
                  Back to Sign In
                </Link>
              </div>
            ) : (
              /* Form state */
              <>
                <div className="text-center mb-8">
                  <h1 className="heading-serif text-2xl text-[var(--text-heading)] mb-2">
                    Reset Password
                  </h1>
                  <p className="text-[var(--text-muted)] text-sm">
                    Enter your email and we&apos;ll send you a reset link
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                      Email Address
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

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-[var(--accent-ribbon)] hover:bg-[var(--accent-ribbon-hover)] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                        Sending...
                      </span>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
                  Remember your password?{' '}
                  <Link
                    href="/auth/sign-in"
                    className="text-[var(--accent-nav)] hover:underline font-medium"
                  >
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
