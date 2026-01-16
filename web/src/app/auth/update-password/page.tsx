'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

/**
 * Update Password Page
 *
 * User arrives here after clicking the password reset link in their email.
 * They enter a new password to complete the reset process.
 * Design: Moleskine notebook aesthetic
 */
export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  // Check if user has a valid recovery session
  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // User should have a session from the recovery link
      setIsValidSession(!!session);
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError('Please enter a new password');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setIsSuccess(true);

      // Redirect to home after a brief delay
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 2000);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking session
  if (isValidSession === null) {
    return (
      <div className="min-h-screen notebook-bg flex items-center justify-center p-4">
        <div className="text-[var(--text-muted)]">Verifying session...</div>
      </div>
    );
  }

  // Show error if no valid session
  if (!isValidSession) {
    return (
      <div className="min-h-screen notebook-bg flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-[var(--accent-nav)] rounded-l-lg" />
            <div className="absolute left-3 top-0 bottom-0 w-px flex flex-col justify-around py-8">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-px bg-[var(--notebook-stitch)]"
                  style={{ marginLeft: '-4px' }}
                />
              ))}
            </div>
            <div className="bg-[var(--surface-page)] rounded-r-xl rounded-l-none shadow-lg ml-4 p-8 text-center">
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "var(--state-hard-bg)" }}
              >
                <svg
                  className="w-8 h-8"
                  style={{ color: "var(--state-hard)" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h1 className="heading-serif text-2xl text-[var(--text-heading)] mb-2">
                Invalid or Expired Link
              </h1>
              <p className="text-[var(--text-muted)] text-sm mb-6">
                This password reset link is invalid or has expired. Please
                request a new one.
              </p>
              <Link
                href="/auth/reset-password"
                className="inline-block py-3 px-6 bg-[var(--accent-ribbon)] hover:bg-[var(--accent-ribbon-hover)] text-white font-medium rounded-lg transition-colors"
              >
                Request New Link
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            {isSuccess ? (
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h1 className="heading-serif text-2xl text-[var(--text-heading)] mb-2">
                  Password Updated
                </h1>
                <p className="text-[var(--text-muted)] text-sm mb-6">
                  Your password has been successfully updated. Redirecting you
                  to the app...
                </p>
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 text-[var(--accent-nav)]"
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
                </div>
              </div>
            ) : (
              /* Form state */
              <>
                <div className="text-center mb-8">
                  <h1 className="heading-serif text-2xl text-[var(--text-heading)] mb-2">
                    Create New Password
                  </h1>
                  <p className="text-[var(--text-muted)] text-sm">
                    Enter your new password below
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
                      htmlFor="password"
                      className="block text-sm font-medium text-[var(--text-body)] mb-1"
                    >
                      New Password
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
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your new password"
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
                        Updating...
                      </span>
                    ) : (
                      'Update Password'
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
