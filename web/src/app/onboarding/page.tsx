"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Onboarding Entry Point
 *
 * Redirects to the first step of onboarding (language selection).
 * This page acts as a router for the onboarding flow.
 */
export default function OnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to language selection (first step)
    router.replace("/onboarding/languages");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--accent-nav)" }} />
    </div>
  );
}
