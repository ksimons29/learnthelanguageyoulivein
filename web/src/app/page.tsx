"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  CaptureButton,
  ReviewDueButton,
  CapturedTodayList,
  TodaysProgress,
} from "@/components/home";
import { BrandWidget } from "@/components/brand";
import { useAuthStore } from "@/lib/store/auth-store";
import { useWordsStore } from "@/lib/store/words-store";

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const { words, isLoading: wordsLoading, fetchWords } = useWordsStore();

  // Fetch words when user is authenticated
  useEffect(() => {
    if (user && !authLoading) {
      fetchWords();
    }
  }, [user, authLoading, fetchWords]);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/sign-in");
    }
  }, [user, authLoading, router]);

  // Compute stats from words
  const stats = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Phrases captured today
    const capturedToday = words.filter((word) => {
      const createdAt = new Date(word.createdAt);
      return createdAt >= todayStart;
    });

    // Phrases due for review (nextReviewDate <= now)
    const dueForReview = words.filter((word) => {
      const nextReview = new Date(word.nextReviewDate);
      return nextReview <= now;
    });

    // Reviewed today (words with lastReviewDate today)
    const reviewedToday = words.filter((word) => {
      if (!word.lastReviewDate) return false;
      const lastReview = new Date(word.lastReviewDate);
      return lastReview >= todayStart;
    });

    // TODO: Implement streak calculation from review_sessions table
    // For now, show placeholder streak
    const streak = 0;

    return {
      capturedToday,
      capturedCount: capturedToday.length,
      dueCount: dueForReview.length,
      reviewedCount: reviewedToday.length,
      streak,
    };
  }, [words]);

  // Map captured today to the format CapturedTodayList expects
  const capturedTodayPhrases = useMemo(() => {
    return stats.capturedToday.map((word) => ({
      id: word.id,
      phrase: word.originalText,
      translation: word.translation,
      audioUrl: word.audioUrl,
    }));
  }, [stats.capturedToday]);

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen notebook-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2
            className="h-8 w-8 animate-spin mx-auto mb-3"
            style={{ color: "var(--accent-nav)" }}
          />
          <p style={{ color: "var(--text-muted)" }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen notebook-bg relative">
      {/* Ribbon bookmark hanging from top */}
      <div className="ribbon-bookmark" />

      {/* Elastic band on right edge */}
      <div className="elastic-band fixed top-0 bottom-0 right-0 w-8 pointer-events-none z-30" />

      <div className="mx-auto max-w-md px-5 py-6">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div className="pt-2">
            <h1
              className="text-4xl heading-serif ink-text tracking-tight"
              style={{ color: "var(--text-heading)" }}
            >
              Today
            </h1>
            <p
              className="text-sm mt-1 handwritten"
              style={{ color: "var(--text-muted)" }}
            >
              Your language journey
            </p>
          </div>
          {/* Bigger brand widget */}
          <BrandWidget
            size="lg"
            variant="default"
            tooltipText="About LLYLI"
            className="shadow-lifted"
          />
        </div>

        {/* Primary Actions - styled as notebook pages */}
        <div className="space-y-4 mb-10">
          <div className="page-stack-3d">
            <CaptureButton />
          </div>
          <div className="page-stack-3d">
            <ReviewDueButton dueCount={stats.dueCount} />
          </div>
        </div>

        {/* Captured Today Section */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-1 h-6 rounded-full"
              style={{ backgroundColor: "var(--accent-nav)" }}
            />
            <h2
              className="text-xl font-semibold heading-serif ink-text"
              style={{ color: "var(--text-heading)" }}
            >
              Captured Today
            </h2>
            {wordsLoading && (
              <Loader2
                className="h-4 w-4 animate-spin"
                style={{ color: "var(--accent-nav)" }}
              />
            )}
          </div>
          <div className="binding-edge-stitched">
            <CapturedTodayList phrases={capturedTodayPhrases} />
          </div>
        </section>

        {/* Today's Progress */}
        <section className="pb-8">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-1 h-6 rounded-full"
              style={{ backgroundColor: "var(--accent-nav)" }}
            />
            <h2
              className="text-xl font-semibold heading-serif ink-text"
              style={{ color: "var(--text-heading)" }}
            >
              Today&apos;s Progress
            </h2>
          </div>
          <div className="page-stack-3d page-curl">
            <TodaysProgress
              captured={stats.capturedCount}
              reviewed={stats.reviewedCount}
              streak={stats.streak}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
