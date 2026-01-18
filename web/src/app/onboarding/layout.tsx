"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import { Loader2 } from "lucide-react";

/**
 * Onboarding Layout
 *
 * Ensures user is authenticated before accessing onboarding.
 * Navigation is automatically hidden via path checks in nav components.
 */
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/sign-in");
    }
  }, [user, isLoading, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--surface-notebook)" }}
      >
        <Loader2
          className="h-8 w-8 animate-spin"
          style={{ color: "var(--accent-nav)" }}
        />
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  return <>{children}</>;
}
