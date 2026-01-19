"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Flame, Trophy, Target, Calendar, Loader2, CheckCircle2, PartyPopper } from "lucide-react";
import { InfoButton } from "@/components/brand";
import { useReviewStore } from "@/lib/store/review-store";
import { useGamificationStore } from "@/lib/store/gamification-store";

export default function ReviewCompletePage() {
  const router = useRouter();
  const { wordsReviewed, correctCount, dueWords, endSession, resetSession } =
    useReviewStore();
  const { daily, streak, emitSessionCompleted, fetchState } = useGamificationStore();

  const [isEnding, setIsEnding] = useState(false);
  const [tomorrowDue, setTomorrowDue] = useState(0);

  // Calculate accuracy
  const accuracy =
    wordsReviewed > 0 ? Math.round((correctCount / wordsReviewed) * 100) : 0;

  // Check if daily goal is complete
  const isDailyGoalComplete = daily?.isComplete ?? false;

  // End the session when this page loads
  useEffect(() => {
    const endCurrentSession = async () => {
      setIsEnding(true);
      try {
        await endSession();

        // Emit session completed event for gamification
        await emitSessionCompleted({
          wordsReviewed,
          correctCount,
        });

        // Refresh gamification state
        await fetchState();

        // Fetch tomorrow's due count
        const response = await fetch("/api/reviews");
        if (response.ok) {
          const { data } = await response.json();
          setTomorrowDue(data.totalDue || 0);
        }
      } catch (err) {
        console.error("Failed to end session:", err);
      } finally {
        setIsEnding(false);
      }
    };

    // Only end if we had a session (wordsReviewed > 0 indicates we came from review)
    if (wordsReviewed > 0) {
      endCurrentSession();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDone = () => {
    resetSession();
    router.push("/");
  };

  // Loading state while ending session
  if (isEnding) {
    return (
      <div className="min-h-screen notebook-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2
            className="h-8 w-8 animate-spin"
            style={{ color: "var(--accent-nav)" }}
          />
          <p style={{ color: "var(--text-muted)" }}>Saving your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen notebook-bg relative">
      {/* Ribbon bookmark hanging from top */}
      <div className="ribbon-bookmark" />

      {/* Elastic band on right edge */}
      <div className="elastic-band fixed top-0 bottom-0 right-0 w-8 pointer-events-none z-30" />

      <div className="mx-auto max-w-md px-5 py-6">
        {/* Header with info button */}
        <div className="flex justify-end mb-8">
          <InfoButton />
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{
              backgroundColor: "var(--state-good)",
              boxShadow: "0 4px 12px rgba(58, 141, 66, 0.3)",
            }}
          >
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <h1
            className="text-4xl heading-serif ink-text tracking-tight"
            style={{ color: "var(--text-heading)" }}
          >
            Session Complete
          </h1>
          <p
            className="text-sm mt-2 handwritten"
            style={{ color: "var(--text-muted)" }}
          >
            Great work on your learning today!
          </p>
        </div>

        {/* Stats Card */}
        <div className="page-stack-3d mb-6">
          <div
            className="rounded-r-xl rounded-l-sm p-6 relative"
            style={{
              backgroundColor: "var(--surface-page)",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
            }}
          >
            {/* Binding edge */}
            <div
              className="absolute left-0 top-0 bottom-0 w-3 rounded-l-sm"
              style={{
                background:
                  "linear-gradient(90deg, var(--accent-nav) 0%, rgba(12, 107, 112, 0.7) 100%)",
              }}
            />
            <div
              className="absolute left-1.5 top-3 bottom-3 w-0.5"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to bottom, transparent 0px, transparent 6px, rgba(248,243,231,0.4) 6px, rgba(248,243,231,0.4) 10px)",
              }}
            />

            <div className="text-center mb-4">
              <p
                className="text-5xl font-bold"
                style={{ color: "var(--accent-nav)" }}
              >
                {wordsReviewed || dueWords.length}
              </p>
              <p style={{ color: "var(--text-muted)" }}>words reviewed</p>
            </div>

            <div
              className="h-px my-4"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to right, var(--notebook-stitch) 0px, var(--notebook-stitch) 4px, transparent 4px, transparent 8px)",
              }}
            />

            <div className="flex items-center justify-around">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Target
                    className="h-4 w-4"
                    style={{ color: "var(--accent-nav)" }}
                  />
                </div>
                <p
                  className="text-xl font-semibold"
                  style={{ color: "var(--text-heading)" }}
                >
                  {accuracy}%
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  Accuracy
                </p>
              </div>
              <div
                className="h-10 w-px"
                style={{ backgroundColor: "var(--notebook-stitch)" }}
              />
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Flame
                    className="h-4 w-4"
                    style={{ color: "var(--accent-ribbon)" }}
                    fill="currentColor"
                  />
                </div>
                <p
                  className="text-xl font-semibold"
                  style={{ color: "var(--text-heading)" }}
                >
                  {correctCount}
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  Correct
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Goal Status */}
        {daily && (
          <div
            className="mb-6 rounded-xl p-4 relative overflow-hidden"
            style={{
              backgroundColor: isDailyGoalComplete ? "var(--accent-ribbon-light)" : "var(--accent-nav-light)",
              border: `2px solid ${isDailyGoalComplete ? "var(--accent-ribbon)" : "var(--accent-nav)"}`,
            }}
          >
            <div className="flex items-center gap-3">
              {isDailyGoalComplete ? (
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "var(--accent-ribbon)" }}
                >
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
              ) : (
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "var(--accent-nav)" }}
                >
                  <Target className="h-5 w-5 text-white" />
                </div>
              )}
              <div className="flex-1">
                <p
                  className="text-lg font-semibold"
                  style={{ color: "var(--text-heading)" }}
                >
                  {isDailyGoalComplete ? "Daily goal complete!" : `${daily.completedReviews}/${daily.targetReviews} reviews`}
                </p>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  {isDailyGoalComplete
                    ? streak && streak.currentStreak > 0
                      ? `${streak.currentStreak} day streak!`
                      : "Great work today!"
                    : `${daily.targetReviews - daily.completedReviews} more to complete your goal`}
                </p>
              </div>
              {isDailyGoalComplete && (
                <PartyPopper
                  className="h-6 w-6 flex-shrink-0"
                  style={{ color: "var(--accent-ribbon)" }}
                />
              )}
            </div>

            {/* Progress bar */}
            {!isDailyGoalComplete && (
              <div className="mt-3">
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: "rgba(12, 107, 112, 0.2)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((daily.completedReviews / daily.targetReviews) * 100, 100)}%`,
                      backgroundColor: "var(--accent-nav)",
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tomorrow Preview */}
        <div
          className="mb-8 rounded-xl p-4 relative overflow-hidden"
          style={{
            backgroundColor: "var(--accent-nav-light)",
            border: "2px solid var(--accent-nav)",
          }}
        >
          <div className="flex items-center gap-3">
            <Calendar
              className="h-5 w-5"
              style={{ color: "var(--accent-nav)" }}
            />
            <div>
              <p
                className="text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                Coming up
              </p>
              <p
                className="text-lg font-semibold"
                style={{ color: "var(--text-heading)" }}
              >
                {tomorrowDue} words due for review
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <Link
            href="/review"
            className="block text-center font-medium transition-colors"
            style={{ color: "var(--accent-nav)" }}
          >
            Practice more
          </Link>

          <button
            onClick={handleDone}
            className="w-full py-5 text-lg font-semibold rounded-r-xl rounded-l-sm text-white transition-all hover:-translate-y-0.5 active:translate-y-0 relative"
            style={{
              backgroundColor: "var(--accent-ribbon)",
              boxShadow: "0 4px 12px rgba(232, 92, 74, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                "var(--accent-ribbon-hover)";
              e.currentTarget.style.boxShadow =
                "0 6px 16px rgba(232, 92, 74, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--accent-ribbon)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(232, 92, 74, 0.3)";
            }}
          >
            {/* Binding edge */}
            <div
              className="absolute left-0 top-0 bottom-0 w-4 rounded-l-sm"
              style={{
                background: "linear-gradient(90deg, #C04A3C 0%, #D94E3E 100%)",
              }}
            />
            <div
              className="absolute left-1.5 top-3 bottom-3 w-0.5"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to bottom, transparent 0px, transparent 6px, rgba(255,255,255,0.3) 6px, rgba(255,255,255,0.3) 10px)",
              }}
            />
            <span className="relative z-10">Done</span>
          </button>
        </div>
      </div>
    </div>
  );
}
