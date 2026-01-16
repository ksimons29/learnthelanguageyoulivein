"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Lightbulb, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  ReviewHeader,
  SentenceCard,
  GradingButtons,
  FeedbackCard,
  MasteryModal,
} from "@/components/review";
import { useReviewStore } from "@/lib/store/review-store";
import { useAuthStore } from "@/lib/store/auth-store";
import { useAudioPlayer } from "@/lib/hooks";

type Rating = "hard" | "good" | "easy";

export default function ReviewPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const {
    sessionId,
    dueWords,
    currentIndex,
    reviewState,
    lastRating,
    lastNextReviewText,
    lastMasteryAchieved,
    wordsReviewed,
    isLoading,
    error,
    startSession,
    submitReview,
    setReviewState,
    setCurrentIndex,
    resetSession,
  } = useReviewStore();

  const [showMastery, setShowMastery] = useState(false);
  const [masteredPhrase, setMasteredPhrase] = useState("");

  // Audio player for current word
  const currentWord = dueWords[currentIndex];
  const { isPlaying, isLoading: audioLoading, play, stop } = useAudioPlayer();

  // Initialize session on mount
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/sign-in");
      return;
    }

    if (user && !sessionId && !isLoading) {
      startSession().catch((err) => {
        console.error("Failed to start session:", err);
      });
    }
  }, [user, authLoading, sessionId, isLoading, startSession, router]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  const handleClose = () => {
    resetSession();
    router.push("/");
  };

  const handleReveal = () => {
    setReviewState("revealed");
  };

  const handleGrade = async (rating: Rating) => {
    if (!currentWord || !sessionId) return;

    // Map string rating to numeric
    const ratingMap: Record<Rating, 1 | 2 | 3 | 4> = {
      hard: 2,
      good: 3,
      easy: 4,
    };

    try {
      await submitReview(currentWord.id, ratingMap[rating]);
      setReviewState("feedback");

      // Check if mastery was achieved
      if (lastMasteryAchieved) {
        setMasteredPhrase(currentWord.originalText);
        setShowMastery(true);
      }
    } catch (err) {
      console.error("Failed to submit review:", err);
    }
  };

  const handleContinue = () => {
    const isLastItem = currentIndex >= dueWords.length - 1;

    if (isLastItem) {
      router.push("/review/complete");
    } else {
      setCurrentIndex(currentIndex + 1);
      setReviewState("recall");
    }
  };

  const handleMasteryContinue = () => {
    setShowMastery(false);
    handleContinue();
  };

  const handlePlayAudio = () => {
    if (currentWord?.audioUrl) {
      if (isPlaying) {
        stop();
      } else {
        play(currentWord.audioUrl);
      }
    }
  };

  const getFeedbackMessage = () => {
    switch (lastRating) {
      case "easy":
        return "Good recall!";
      case "good":
        return "Nice work!";
      case "hard":
        return "Keep practicing!";
      default:
        return "";
    }
  };

  // Loading state
  if (authLoading || (isLoading && !dueWords.length)) {
    return (
      <div className="min-h-screen notebook-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2
            className="h-8 w-8 animate-spin"
            style={{ color: "var(--accent-nav)" }}
          />
          <p style={{ color: "var(--text-muted)" }}>Loading review session...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen notebook-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <AlertTriangle
            className="h-12 w-12"
            style={{ color: "var(--state-hard)" }}
          />
          <p style={{ color: "var(--text-heading)" }}>Failed to load review</p>
          <p style={{ color: "var(--text-muted)" }}>{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 rounded-lg text-white"
            style={{ backgroundColor: "var(--accent-nav)" }}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // No words due
  if (!dueWords.length) {
    return (
      <div className="min-h-screen notebook-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <div
            className="h-16 w-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "var(--state-easy)" }}
          >
            <span className="text-2xl">🎉</span>
          </div>
          <p
            className="text-xl font-semibold"
            style={{ color: "var(--text-heading)" }}
          >
            All caught up!
          </p>
          <p style={{ color: "var(--text-muted)" }}>
            No words due for review right now.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 rounded-lg text-white font-medium"
            style={{ backgroundColor: "var(--accent-nav)" }}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen notebook-bg relative">
      {/* Ribbon bookmark */}
      <div className="ribbon-bookmark" />

      {/* Elastic band on right edge */}
      <div className="elastic-band fixed top-0 bottom-0 right-0 w-8 pointer-events-none z-30" />

      <div className="mx-auto max-w-md px-5 py-4">
        {/* Header */}
        <ReviewHeader
          current={currentIndex + 1}
          total={dueWords.length}
          onClose={handleClose}
        />

        {/* Progress bar */}
        <div
          className="mt-4 h-1 w-full rounded-full"
          style={{ backgroundColor: "var(--accent-nav-light)" }}
        >
          <div
            className="h-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor: "var(--accent-nav)",
              width: `${((currentIndex + 1) / dueWords.length) * 100}%`,
            }}
          />
        </div>

        {/* Mixed Practice Badge */}
        <div className="mt-4 flex justify-center">
          <Badge
            className="text-white"
            style={{ backgroundColor: "var(--accent-nav)" }}
          >
            REVIEW SESSION
          </Badge>
        </div>

        {/* Content */}
        <div className="mt-6 space-y-4">
          {/* Feedback Card (shown after grading) */}
          {reviewState === "feedback" && lastRating && (
            <FeedbackCard
              type={lastRating === "hard" ? "hard" : "success"}
              message={getFeedbackMessage()}
              nextReviewText={lastNextReviewText || "Soon"}
            />
          )}

          {/* Word Card */}
          {currentWord && (
            <SentenceCard
              sentence={currentWord.originalText}
              highlightedWords={[]}
              translation={currentWord.translation}
              showTranslation={reviewState !== "recall"}
              onPlayAudio={handlePlayAudio}
              isPlayingAudio={isPlaying}
              isLoadingAudio={audioLoading}
            />
          )}

          {/* Mastery Progress (shown after feedback) */}
          {reviewState === "feedback" && currentWord && (
            <div
              className="text-center text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              <span>Progress: </span>
              <span
                className="font-medium"
                style={{ color: "var(--accent-nav)" }}
              >
                {currentWord.consecutiveCorrectSessions || 0}/3 correct sessions
              </span>
              {currentWord.masteryStatus === "ready_to_use" && (
                <span
                  className="ml-2 px-2 py-0.5 rounded-full text-xs"
                  style={{
                    backgroundColor: "var(--state-easy)",
                    color: "white",
                  }}
                >
                  Mastered!
                </span>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {reviewState === "recall" && (
            <button
              onClick={handleReveal}
              className="w-full py-6 text-lg font-semibold rounded-lg text-white transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
              style={{ backgroundColor: "var(--accent-ribbon)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "var(--accent-ribbon-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--accent-ribbon)";
              }}
            >
              Reveal
            </button>
          )}

          {reviewState === "revealed" && (
            <GradingButtons onGrade={handleGrade} disabled={isLoading} />
          )}

          {reviewState === "feedback" && (
            <button
              onClick={handleContinue}
              className="w-full py-6 text-lg font-semibold rounded-lg text-white transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
              style={{ backgroundColor: "var(--accent-nav)" }}
            >
              {currentIndex >= dueWords.length - 1 ? "Finish" : "Continue"}
            </button>
          )}

          {/* Session Progress */}
          {reviewState !== "feedback" && (
            <p
              className="text-center text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              Reviewed: {wordsReviewed} of {dueWords.length}
            </p>
          )}

          {/* Report Issue */}
          <button
            className="flex w-full items-center justify-center gap-2 rounded-lg border py-3 text-sm transition-colors"
            style={{
              borderColor: "var(--notebook-stitch)",
              backgroundColor: "var(--surface-page)",
              color: "var(--text-muted)",
            }}
          >
            <AlertTriangle
              className="h-4 w-4"
              style={{ color: "var(--state-good)" }}
            />
            Report issue with this word
          </button>

          {/* Info indicator */}
          <div
            className="flex items-center justify-center gap-2 text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            <Lightbulb className="h-3 w-3" />
            FSRS spaced repetition - optimal timing for memory
          </div>
        </div>

        {/* Mastery Modal */}
        {showMastery && (
          <MasteryModal
            phrase={masteredPhrase}
            onContinue={handleMasteryContinue}
          />
        )}
      </div>
    </div>
  );
}
