"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Timer, Zap, Trophy, X, ChevronRight } from "lucide-react";
import type { Word } from "@/lib/db/schema";

/**
 * Boss Round Component
 *
 * A time-limited challenge featuring the user's most challenging words.
 * Appears as a prompt after completing daily goal, can be skipped.
 */

interface BossRoundPromptProps {
  onStart: () => void;
  onSkip: () => void;
}

export function BossRoundPrompt({ onStart, onSkip }: BossRoundPromptProps) {
  return (
    <div
      className="rounded-xl p-6 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, var(--accent-ribbon-light) 0%, var(--surface-page) 100%)",
        border: "2px solid var(--accent-ribbon)",
      }}
    >
      {/* Icon */}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ backgroundColor: "var(--accent-ribbon)" }}
      >
        <Zap className="h-7 w-7 text-white" fill="currentColor" />
      </div>

      {/* Title */}
      <h3
        className="text-xl font-bold heading-serif mb-2"
        style={{ color: "var(--text-heading)" }}
      >
        Boss Round Challenge
      </h3>

      {/* Description */}
      <p
        className="text-sm mb-4"
        style={{ color: "var(--text-muted)" }}
      >
        Test yourself with your 5 toughest words in 90 seconds. Ready for the challenge?
      </p>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onStart}
          className="flex-1 py-3 px-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0"
          style={{
            backgroundColor: "var(--accent-ribbon)",
            boxShadow: "0 4px 12px rgba(232, 92, 74, 0.3)",
          }}
        >
          <Zap className="h-4 w-4" />
          Let&apos;s go!
        </button>
        <button
          onClick={onSkip}
          className="py-3 px-4 rounded-xl font-medium transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}

/**
 * Boss Round Timer Component
 */
function BossRoundTimer({
  timeLeft,
  totalTime,
}: {
  timeLeft: number;
  totalTime: number;
}) {
  const progress = timeLeft / totalTime;
  const isLow = timeLeft <= 15;

  return (
    <div className="flex items-center gap-3">
      {/* Circular progress */}
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 transform -rotate-90">
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="var(--accent-ribbon-light)"
            strokeWidth="4"
            fill="none"
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke={isLow ? "var(--accent-ribbon)" : "var(--accent-nav)"}
            strokeWidth="4"
            fill="none"
            strokeDasharray={125.6}
            strokeDashoffset={125.6 * (1 - progress)}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Timer
            className={`h-5 w-5 ${isLow ? "animate-pulse" : ""}`}
            style={{ color: isLow ? "var(--accent-ribbon)" : "var(--accent-nav)" }}
          />
        </div>
      </div>

      {/* Time display */}
      <div>
        <p
          className={`text-2xl font-bold ${isLow ? "text-[var(--accent-ribbon)]" : ""}`}
          style={!isLow ? { color: "var(--text-heading)" } : undefined}
        >
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
        </p>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          remaining
        </p>
      </div>
    </div>
  );
}

/**
 * Boss Round Game Component
 */
interface BossRoundGameProps {
  words: Word[];
  timeLimit: number;
  onComplete: (score: number, timeUsed: number) => void;
  onCancel: () => void;
}

export function BossRoundGame({
  words,
  timeLimit,
  onComplete,
  onCancel,
}: BossRoundGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const currentWord = words[currentIndex];

  // Timer
  useEffect(() => {
    if (isFinished) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isFinished]);

  // Auto-complete when finished
  useEffect(() => {
    if (isFinished) {
      onComplete(score, timeLimit - timeLeft);
    }
  }, [isFinished, score, timeLeft, timeLimit, onComplete]);

  const handleCorrect = useCallback(() => {
    setScore((prev) => prev + 1);
    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowAnswer(false);
    } else {
      setIsFinished(true);
    }
  }, [currentIndex, words.length]);

  const handleIncorrect = useCallback(() => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowAnswer(false);
    } else {
      setIsFinished(true);
    }
  }, [currentIndex, words.length]);

  if (!currentWord) {
    return null;
  }

  return (
    <div className="min-h-screen notebook-bg relative flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--surface-notebook)] border-b border-[var(--notebook-ruling)] px-5 py-4">
        <div className="flex items-center justify-between">
          <BossRoundTimer timeLeft={timeLeft} totalTime={timeLimit} />

          <div className="flex items-center gap-4">
            {/* Progress */}
            <div className="text-right">
              <p className="text-sm font-medium" style={{ color: "var(--text-heading)" }}>
                {currentIndex + 1}/{words.length}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Score: {score}
              </p>
            </div>

            {/* Cancel */}
            <button
              onClick={onCancel}
              className="p-2 rounded-lg hover:bg-[var(--surface-elevated)] transition-colors"
            >
              <X className="h-5 w-5" style={{ color: "var(--text-muted)" }} />
            </button>
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center p-5">
        <div
          className="w-full max-w-md rounded-r-xl rounded-l-sm p-8 relative"
          style={{
            backgroundColor: "var(--surface-page)",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
          }}
        >
          {/* Binding edge */}
          <div
            className="absolute left-0 top-0 bottom-0 w-4 rounded-l-sm"
            style={{
              background: "linear-gradient(90deg, var(--accent-ribbon) 0%, var(--accent-ribbon-hover) 100%)",
            }}
          />

          {/* Question */}
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-wide mb-3" style={{ color: "var(--text-muted)" }}>
              Translate
            </p>
            <p className="text-2xl font-bold heading-serif" style={{ color: "var(--text-heading)" }}>
              {currentWord.originalText}
            </p>
          </div>

          {/* Answer */}
          {showAnswer ? (
            <div className="space-y-6">
              <div
                className="p-4 rounded-xl text-center"
                style={{ backgroundColor: "var(--accent-nav-light)" }}
              >
                <p className="text-lg font-medium" style={{ color: "var(--accent-nav)" }}>
                  {currentWord.translation}
                </p>
              </div>

              {/* Self-grade buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleIncorrect}
                  className="flex-1 py-4 rounded-xl font-semibold transition-all hover:-translate-y-0.5"
                  style={{
                    backgroundColor: "var(--state-hard-bg)",
                    color: "var(--state-hard)",
                    border: "2px solid var(--state-hard)",
                  }}
                >
                  Didn&apos;t know
                </button>
                <button
                  onClick={handleCorrect}
                  className="flex-1 py-4 rounded-xl font-semibold text-white transition-all hover:-translate-y-0.5"
                  style={{
                    backgroundColor: "var(--state-good)",
                    boxShadow: "0 4px 12px rgba(58, 141, 66, 0.3)",
                  }}
                >
                  Got it!
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAnswer(true)}
              className="w-full py-4 rounded-xl font-semibold text-white transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
              style={{
                backgroundColor: "var(--accent-nav)",
                boxShadow: "0 4px 12px rgba(12, 107, 112, 0.3)",
              }}
            >
              Reveal Answer
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Boss Round Results Component
 */
interface BossRoundResultsProps {
  score: number;
  total: number;
  timeUsed: number;
  onClose: () => void;
}

export function BossRoundResults({
  score,
  total,
  timeUsed,
  onClose,
}: BossRoundResultsProps) {
  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
  const isPerfect = score === total;
  const isPassing = score >= Math.ceil(total / 2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Results Card */}
      <div
        className="relative mx-4 max-w-sm w-full rounded-r-2xl rounded-l-sm p-8 text-center animate-in zoom-in-95 duration-300"
        style={{
          backgroundColor: "var(--surface-page)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
      >
        {/* Binding edge */}
        <div
          className="absolute left-0 top-0 bottom-0 w-4 rounded-l-sm"
          style={{
            background: isPerfect
              ? "linear-gradient(90deg, var(--accent-ribbon) 0%, var(--accent-ribbon-hover) 100%)"
              : "linear-gradient(90deg, var(--accent-nav) 0%, rgba(12, 107, 112, 0.7) 100%)",
          }}
        />

        {/* Icon */}
        <div
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6"
          style={{
            backgroundColor: isPerfect ? "var(--accent-ribbon)" : "var(--accent-nav)",
          }}
        >
          <Trophy className="h-10 w-10 text-white" />
        </div>

        {/* Title */}
        <h2
          className="text-3xl font-bold heading-serif mb-2"
          style={{ color: "var(--text-heading)" }}
        >
          {isPerfect ? "Perfect!" : isPassing ? "Well done!" : "Nice try!"}
        </h2>

        {/* Score */}
        <p
          className="text-5xl font-bold mb-2"
          style={{ color: isPerfect ? "var(--accent-ribbon)" : "var(--accent-nav)" }}
        >
          {score}/{total}
        </p>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          {accuracy}% accuracy in {Math.floor(timeUsed / 60)}:{(timeUsed % 60).toString().padStart(2, "0")}
        </p>

        {/* Message */}
        <p className="text-base mb-6" style={{ color: "var(--text-muted)" }}>
          {isPerfect
            ? "You conquered the boss round! Every word mastered."
            : isPassing
            ? "You passed the challenge. Keep practicing!"
            : "Those words need more practice. You'll get them!"}
        </p>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-4 text-lg font-semibold rounded-xl text-white transition-all hover:-translate-y-0.5 active:translate-y-0"
          style={{
            backgroundColor: isPerfect ? "var(--accent-ribbon)" : "var(--accent-nav)",
            boxShadow: isPerfect
              ? "0 4px 12px rgba(232, 92, 74, 0.3)"
              : "0 4px 12px rgba(12, 107, 112, 0.3)",
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
}
