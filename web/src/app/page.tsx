"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, PartyPopper, X } from "lucide-react";
import {
  CaptureButton,
  ReviewDueButton,
  CapturedTodayList,
  TodaysProgress,
} from "@/components/home";
import { BingoBoard, BingoBoardModal, BossRoundPrompt, BossRoundGame, BossRoundResults } from "@/components/gamification";
import { InfoButton } from "@/components/brand";
import { useAuthStore } from "@/lib/store/auth-store";
import { useWordsStore } from "@/lib/store/words-store";
import { useGamificationStore } from "@/lib/store/gamification-store";
import { useOnboardingStatus } from "@/lib/hooks";
import type { Word } from "@/lib/db/schema";

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const { words, isLoading: wordsLoading, fetchWords } = useWordsStore();
  const { needsOnboarding, isLoading: onboardingLoading } = useOnboardingStatus();

  // Gamification state
  const {
    daily,
    streak,
    bingo,
    showDailyGoalCelebration,
    fetchState: fetchGamificationState,
    dismissDailyGoalCelebration,
  } = useGamificationStore();

  // Bingo modal state
  const [showBingoModal, setShowBingoModal] = useState(false);

  // Boss round state
  const [bossRoundState, setBossRoundState] = useState<'hidden' | 'prompt' | 'playing' | 'results'>('hidden');
  const [bossRoundWords, setBossRoundWords] = useState<Word[]>([]);
  const [bossRoundTimeLimit, setBossRoundTimeLimit] = useState(90);
  const [bossRoundScore, setBossRoundScore] = useState(0);
  const [bossRoundTimeUsed, setBossRoundTimeUsed] = useState(0);
  const [bossRoundStats, setBossRoundStats] = useState<{
    bestScore: number;
    totalAttempts: number;
    perfectCount: number;
  } | null>(null);
  const [bossRoundLoading, setBossRoundLoading] = useState(false);

  // Redirect to onboarding if user hasn't completed it
  useEffect(() => {
    if (!authLoading && !onboardingLoading && user && needsOnboarding) {
      router.push("/onboarding");
    }
  }, [user, authLoading, onboardingLoading, needsOnboarding, router]);

  // Fetch words when user is authenticated
  useEffect(() => {
    if (user && !authLoading) {
      fetchWords();
    }
  }, [user, authLoading, fetchWords]);

  // Fetch gamification state
  useEffect(() => {
    if (user && !authLoading) {
      fetchGamificationState();
    }
  }, [user, authLoading, fetchGamificationState]);

  // Fetch boss round data when daily goal is complete
  useEffect(() => {
    const fetchBossRound = async () => {
      if (!daily?.isComplete || bossRoundLoading || bossRoundWords.length > 0) {
        return;
      }

      setBossRoundLoading(true);
      try {
        const response = await fetch("/api/gamification/boss-round");
        if (response.ok) {
          const { data } = await response.json();
          if (data.words && data.words.length > 0) {
            setBossRoundWords(data.words);
            setBossRoundTimeLimit(data.timeLimit || 90);
            setBossRoundState('prompt');
          }
          if (data.stats) {
            setBossRoundStats(data.stats);
          }
        }
      } catch (err) {
        console.error("Failed to fetch boss round:", err);
      } finally {
        setBossRoundLoading(false);
      }
    };

    fetchBossRound();
  }, [daily?.isComplete, bossRoundLoading, bossRoundWords.length]);

  // Redirect to sign-in if not authenticated (client-side fallback)
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

    return {
      capturedToday,
      capturedCount: capturedToday.length,
      dueCount: dueForReview.length,
      reviewedCount: reviewedToday.length,
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

  // Boss round handlers
  const handleStartBossRound = useCallback(() => {
    setBossRoundState('playing');
  }, []);

  const handleSkipBossRound = useCallback(() => {
    setBossRoundState('hidden');
  }, []);

  const handleBossRoundComplete = useCallback(async (score: number, timeUsed: number) => {
    setBossRoundScore(score);
    setBossRoundTimeUsed(timeUsed);
    setBossRoundState('results');

    // Submit results to server
    try {
      await fetch("/api/gamification/boss-round", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score,
          totalWords: bossRoundWords.length,
          timeUsed,
        }),
      });
      // Refresh gamification state to update bingo
      await fetchGamificationState();
    } catch (err) {
      console.error("Failed to submit boss round results:", err);
    }
  }, [bossRoundWords.length, fetchGamificationState]);

  const handleBossRoundCancel = useCallback(() => {
    setBossRoundState('prompt');
  }, []);

  const handleBossRoundResultsClose = useCallback(() => {
    setBossRoundState('hidden');
  }, []);

  // Show loading state while checking auth or onboarding status
  if (authLoading || (user && onboardingLoading)) {
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

  // Don't render while redirecting to onboarding
  if (user && needsOnboarding) {
    return (
      <div className="min-h-screen notebook-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2
            className="h-8 w-8 animate-spin mx-auto mb-3"
            style={{ color: "var(--accent-nav)" }}
          />
          <p style={{ color: "var(--text-muted)" }}>Setting up your notebook...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  // Boss round game (full screen takeover)
  if (bossRoundState === 'playing' && bossRoundWords.length > 0) {
    return (
      <BossRoundGame
        words={bossRoundWords}
        timeLimit={bossRoundTimeLimit}
        onComplete={handleBossRoundComplete}
        onCancel={handleBossRoundCancel}
      />
    );
  }

  return (
    <div className="min-h-screen notebook-bg relative">
      {/* Ribbon bookmark hanging from top */}
      <div className="ribbon-bookmark" />

      {/* Elastic band on right edge */}
      <div className="elastic-band fixed top-0 bottom-0 right-0 w-8 pointer-events-none z-30" />

      <div className="mx-auto max-w-md px-5 py-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
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
          <InfoButton />
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
              Today&apos;s Progress
            </h2>
          </div>
          <div className="page-stack-3d page-curl">
            <TodaysProgress
              captured={stats.capturedCount}
              reviewed={daily?.completedReviews ?? stats.reviewedCount}
              streak={streak?.currentStreak ?? 0}
              dailyTarget={daily?.targetReviews ?? 10}
              dailyComplete={daily?.isComplete ?? false}
            />
          </div>
        </section>

        {/* Boss Round Challenge - appears when daily goal is complete */}
        {bossRoundState === 'prompt' && bossRoundWords.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-1 h-6 rounded-full"
                style={{ backgroundColor: "var(--accent-ribbon)" }}
              />
              <h2
                className="text-xl font-semibold heading-serif ink-text"
                style={{ color: "var(--text-heading)" }}
              >
                Boss Round
              </h2>
            </div>
            <div className="page-stack-3d">
              <BossRoundPrompt
                onStart={handleStartBossRound}
                onSkip={handleSkipBossRound}
                stats={bossRoundStats}
              />
            </div>
          </section>
        )}

        {/* Daily Bingo */}
        {bingo && (
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
                Daily Bingo
              </h2>
            </div>
            <div className="page-stack-3d">
              <BingoBoard
                variant="compact"
                onExpand={() => setShowBingoModal(true)}
              />
            </div>
          </section>
        )}
      </div>

      {/* Bingo Modal */}
      <BingoBoardModal
        isOpen={showBingoModal}
        onClose={() => setShowBingoModal(false)}
      />

      {/* Daily Goal Celebration Modal */}
      {showDailyGoalCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={dismissDailyGoalCelebration}
          />

          {/* Celebration Card */}
          <div
            className="relative mx-4 max-w-sm w-full rounded-r-2xl rounded-l-sm p-8 text-center animate-in zoom-in-95 duration-300"
            style={{
              backgroundColor: "var(--surface-page)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
          >
            {/* Close button */}
            <button
              onClick={dismissDailyGoalCelebration}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-[var(--surface-elevated)] transition-colors"
            >
              <X className="h-5 w-5" style={{ color: "var(--text-muted)" }} />
            </button>

            {/* Binding edge */}
            <div
              className="absolute left-0 top-0 bottom-0 w-4 rounded-l-sm"
              style={{
                background: "linear-gradient(90deg, var(--accent-ribbon) 0%, var(--accent-ribbon-hover) 100%)",
              }}
            />
            <div
              className="absolute left-1.5 top-4 bottom-4 w-0.5"
              style={{
                backgroundImage: "repeating-linear-gradient(to bottom, transparent 0px, transparent 6px, var(--notebook-stitch) 6px, var(--notebook-stitch) 10px)",
              }}
            />

            {/* Icon */}
            <div
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6"
              style={{
                backgroundColor: "var(--accent-ribbon-light)",
              }}
            >
              <PartyPopper
                className="h-10 w-10"
                style={{ color: "var(--accent-ribbon)" }}
              />
            </div>

            {/* Title */}
            <h2
              className="text-3xl font-bold heading-serif mb-2"
              style={{ color: "var(--text-heading)" }}
            >
              Done for today!
            </h2>

            {/* Message */}
            <p
              className="text-base mb-6"
              style={{ color: "var(--text-muted)" }}
            >
              You completed your daily goal of {daily?.targetReviews ?? 10} reviews.
              {(streak?.currentStreak ?? 0) > 1 && (
                <span className="block mt-1 font-medium" style={{ color: "var(--accent-ribbon)" }}>
                  {streak?.currentStreak} day streak!
                </span>
              )}
            </p>

            {/* Action Button */}
            <button
              onClick={dismissDailyGoalCelebration}
              className="w-full py-4 text-lg font-semibold rounded-xl text-white transition-all hover:-translate-y-0.5 active:translate-y-0"
              style={{
                backgroundColor: "var(--accent-ribbon)",
                boxShadow: "0 4px 12px rgba(232, 92, 74, 0.3)",
              }}
            >
              Keep it up!
            </button>

            {/* Optional: Practice more link */}
            <button
              onClick={() => {
                dismissDailyGoalCelebration();
                router.push("/review");
              }}
              className="mt-3 text-sm font-medium transition-colors"
              style={{ color: "var(--accent-nav)" }}
            >
              Practice more
            </button>
          </div>
        </div>
      )}

      {/* Boss Round Results Modal */}
      {bossRoundState === 'results' && (
        <BossRoundResults
          score={bossRoundScore}
          total={bossRoundWords.length}
          timeUsed={bossRoundTimeUsed}
          onClose={handleBossRoundResultsClose}
        />
      )}
    </div>
  );
}
