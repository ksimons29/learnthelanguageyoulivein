"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/store/auth-store";

interface OnboardingStatus {
  needsOnboarding: boolean;
  profile: {
    targetLanguage?: string;
    nativeLanguage?: string;
    onboardingCompleted: boolean;
  } | null;
}

/**
 * Hook to check user's onboarding status.
 * Returns loading state, error, and whether the user needs onboarding.
 */
export function useOnboardingStatus() {
  const { user, isLoading: authLoading } = useAuthStore();
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Don't fetch if still loading auth or no user
    if (authLoading) {
      return;
    }

    if (!user) {
      setIsLoading(false);
      setStatus(null);
      return;
    }

    // Fetch onboarding status
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/onboarding/status");

        if (!response.ok) {
          throw new Error("Failed to check onboarding status");
        }

        const { data } = await response.json();
        setStatus(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, [user, authLoading]);

  return {
    needsOnboarding: status?.needsOnboarding ?? false,
    profile: status?.profile ?? null,
    isLoading: authLoading || isLoading,
    error,
  };
}
