'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  SUPPORTED_LANGUAGES,
  getSupportedLanguageCodes,
} from '@/lib/config/languages';
import { LEARNING_REASONS } from '@/lib/db/schema/user-profiles';
import {
  Home,
  Briefcase,
  Heart,
  Plane,
  Globe,
  TrendingUp,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

// Map icon names to Lucide components
const REASON_ICONS: Record<string, LucideIcon> = {
  Home,
  Briefcase,
  Heart,
  Plane,
  Globe,
  TrendingUp,
  Sparkles,
};

/**
 * Onboarding Page
 *
 * Step 2 of the two-step signup flow:
 * 1. Account created (previous step)
 * 2. Select languages + reason (this page)
 *
 * Design: Moleskine notebook aesthetic with stepped progress
 */
export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [nativeLanguage, setNativeLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('pt-PT');
  const [learningReason, setLearningReason] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get language options
  const languageCodes = getSupportedLanguageCodes();
  const nativeLanguageOptions = languageCodes.filter(
    (code) => code !== targetLanguage
  );
  const targetLanguageOptions = languageCodes.filter(
    (code) => code !== nativeLanguage
  );

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/sign-up');
      }
    };

    checkAuth();
  }, [router]);

  const handleComplete = async () => {
    if (!learningReason) {
      setError('Please select a reason for learning');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/sign-up');
        return;
      }

      // Create or update user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          native_language: nativeLanguage,
          target_language: targetLanguage,
          learning_reason: learningReason,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error('Profile error:', profileError);
        setError('Failed to save preferences. Please try again.');
        return;
      }

      // Redirect to home
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Onboarding error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen notebook-bg flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Notebook card with binding */}
        <div className="relative">
          {/* Binding edge */}
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-[var(--accent-nav)] rounded-l-lg" />

          {/* Stitching marks */}
          <div className="absolute left-3 top-0 bottom-0 w-px flex flex-col justify-around py-8">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-px bg-[var(--notebook-stitch)]"
                style={{ marginLeft: '-4px' }}
              />
            ))}
          </div>

          {/* Card content */}
          <div className="bg-[var(--surface-page)] rounded-r-xl rounded-l-none shadow-lg ml-4 p-8">
            {/* Progress indicator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div
                className="w-3 h-3 rounded-full transition-colors"
                style={{
                  backgroundColor: step >= 1 ? "var(--accent-nav)" : "var(--border)",
                }}
              />
              <div
                className="w-8 h-0.5"
                style={{ backgroundColor: "var(--border)" }}
              >
                <div
                  className="h-full transition-all"
                  style={{
                    backgroundColor: "var(--accent-nav)",
                    width: step >= 2 ? "100%" : "0%",
                  }}
                />
              </div>
              <div
                className="w-3 h-3 rounded-full transition-colors"
                style={{
                  backgroundColor: step >= 2 ? "var(--accent-nav)" : "var(--border)",
                }}
              />
              <div
                className="w-8 h-0.5"
                style={{ backgroundColor: "var(--border)" }}
              >
                <div
                  className="h-full transition-all"
                  style={{
                    backgroundColor: "var(--accent-nav)",
                    width: step >= 3 ? "100%" : "0%",
                  }}
                />
              </div>
              <div
                className="w-3 h-3 rounded-full transition-colors"
                style={{
                  backgroundColor: step >= 3 ? "var(--accent-nav)" : "var(--border)",
                }}
              />
            </div>

            {/* Step 1: Native Language */}
            {step === 1 && (
              <div className="animate-fadeIn">
                <h1 className="heading-serif text-2xl text-[var(--text-heading)] text-center mb-2">
                  I already speak...
                </h1>
                <p className="text-[var(--text-muted)] text-sm text-center mb-6">
                  Select your native or strongest language
                </p>

                <div className="space-y-2">
                  {nativeLanguageOptions.map((code) => {
                    const lang = SUPPORTED_LANGUAGES[code];
                    return (
                      <button
                        key={code}
                        onClick={() => setNativeLanguage(code)}
                        className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                          nativeLanguage === code
                            ? 'border-[var(--accent-nav)] bg-[var(--accent-nav-light)]'
                            : 'border-[var(--border)] hover:border-[var(--text-muted)]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-[var(--text-body)]">
                              {lang.name}
                            </span>
                            <span className="ml-2 text-[var(--text-muted)]">
                              {lang.nativeName}
                            </span>
                          </div>
                          {nativeLanguage === code && (
                            <svg
                              className="w-5 h-5 text-[var(--accent-nav)]"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full mt-6 py-3 px-4 bg-[var(--accent-ribbon)] hover:bg-[var(--accent-ribbon-hover)] text-white font-medium rounded-lg transition-colors"
                >
                  Continue
                </button>
              </div>
            )}

            {/* Step 2: Target Language */}
            {step === 2 && (
              <div className="animate-fadeIn">
                <h1 className="heading-serif text-2xl text-[var(--text-heading)] text-center mb-2">
                  I&apos;m learning...
                </h1>
                <p className="text-[var(--text-muted)] text-sm text-center mb-6">
                  Select the language you want to remember
                </p>

                <div className="space-y-2">
                  {targetLanguageOptions.map((code) => {
                    const lang = SUPPORTED_LANGUAGES[code];
                    return (
                      <button
                        key={code}
                        onClick={() => setTargetLanguage(code)}
                        className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                          targetLanguage === code
                            ? 'border-[var(--accent-nav)] bg-[var(--accent-nav-light)]'
                            : 'border-[var(--border)] hover:border-[var(--text-muted)]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-[var(--text-body)]">
                              {lang.name}
                            </span>
                            <span className="ml-2 text-[var(--text-muted)]">
                              {lang.nativeName}
                            </span>
                          </div>
                          {targetLanguage === code && (
                            <svg
                              className="w-5 h-5 text-[var(--accent-nav)]"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 px-4 border text-[var(--text-body)] font-medium rounded-lg hover:opacity-80 transition-colors"
                    style={{ borderColor: "var(--border)" }}
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 py-3 px-4 bg-[var(--accent-ribbon)] hover:bg-[var(--accent-ribbon-hover)] text-white font-medium rounded-lg transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Learning Reason */}
            {step === 3 && (
              <div className="animate-fadeIn">
                <h1 className="heading-serif text-2xl text-[var(--text-heading)] text-center mb-2">
                  Why are you learning?
                </h1>
                <p className="text-[var(--text-muted)] text-sm text-center mb-6">
                  Help us personalize your experience
                </p>

                {error && (
                  <div
                    className="mb-4 p-3 border rounded-lg text-sm"
                    style={{
                      backgroundColor: "var(--state-hard-bg)",
                      borderColor: "var(--state-hard)",
                      color: "var(--state-hard)",
                    }}
                  >
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  {LEARNING_REASONS.map((reason) => {
                    const IconComponent = REASON_ICONS[reason.iconName];
                    return (
                      <button
                        key={reason.id}
                        onClick={() => setLearningReason(reason.id)}
                        className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                          learningReason === reason.id
                            ? 'border-[var(--accent-nav)] bg-[var(--accent-nav-light)]'
                            : 'border-[var(--border)] hover:border-[var(--text-muted)]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Moleskine-styled icon container */}
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                              backgroundColor: learningReason === reason.id
                                ? 'var(--accent-nav)'
                                : 'var(--surface-muted)',
                            }}
                          >
                            {IconComponent && (
                              <IconComponent
                                className="w-5 h-5"
                                style={{
                                  color: learningReason === reason.id
                                    ? 'white'
                                    : 'var(--text-muted)',
                                }}
                                strokeWidth={1.5}
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-[var(--text-body)] block">
                              {reason.label}
                            </span>
                            <span className="text-sm text-[var(--text-muted)]">
                              {reason.description}
                            </span>
                          </div>
                          {learningReason === reason.id && (
                            <svg
                              className="w-5 h-5 text-[var(--accent-nav)] flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 py-3 px-4 border text-[var(--text-body)] font-medium rounded-lg hover:opacity-80 transition-colors"
                    style={{ borderColor: "var(--border)" }}
                  >
                    Back
                  </button>
                  <button
                    onClick={handleComplete}
                    disabled={isLoading || !learningReason}
                    className="flex-1 py-3 px-4 bg-[var(--accent-ribbon)] hover:bg-[var(--accent-ribbon-hover)] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                        Saving...
                      </span>
                    ) : (
                      'Start Learning →'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
