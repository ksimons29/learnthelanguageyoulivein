"use client";

import { cn } from "@/lib/utils";

type Rating = "hard" | "good" | "easy";

interface GradingButtonsProps {
  onGrade: (rating: Rating) => void;
  disabled?: boolean;
  /** Pre-highlight a grade (e.g., "hard" after incorrect answer) */
  suggestedGrade?: Rating;
}

const gradeStyles = {
  hard: {
    bg: "var(--state-hard-bg)",
    bgHover: "var(--state-hard)",
    text: "var(--state-hard)",
    border: "var(--state-hard)",
  },
  good: {
    bg: "var(--state-good-bg)",
    bgHover: "var(--state-good)",
    text: "var(--state-good)",
    border: "var(--state-good)",
  },
  easy: {
    bg: "var(--state-easy-bg)",
    bgHover: "var(--state-easy)",
    text: "var(--state-easy)",
    border: "var(--state-easy)",
  },
};

export function GradingButtons({
  onGrade,
  disabled,
  suggestedGrade,
}: GradingButtonsProps) {
  return (
    <div id="rating-buttons" className="space-y-3">
      <p className="text-center text-sm" style={{ color: "var(--text-muted)" }}>
        How well did you recall?
      </p>
      <div className="grid grid-cols-3 gap-3">
        {(["hard", "good", "easy"] as Rating[]).map((rating) => {
          const styles = gradeStyles[rating];
          const isSuggested = rating === suggestedGrade;

          return (
            <button
              key={rating}
              onClick={() => onGrade(rating)}
              disabled={disabled}
              className={cn(
                "rounded-lg border-2 py-4 text-base font-semibold transition-all active:scale-[0.98]",
                "hover:-translate-y-0.5",
                disabled && "opacity-50 cursor-not-allowed",
                // Add pulse animation for suggested grade
                isSuggested && "ring-2 ring-offset-2"
              )}
              style={{
                backgroundColor: isSuggested ? styles.bgHover : styles.bg,
                borderColor: styles.border,
                color: isSuggested ? "white" : styles.text,
                // Ring color matches the grade
                // @ts-expect-error - CSS custom properties
                "--tw-ring-color": styles.border,
              }}
              onMouseEnter={(e) => {
                if (!disabled) {
                  e.currentTarget.style.backgroundColor = styles.bgHover;
                  e.currentTarget.style.color = "white";
                }
              }}
              onMouseLeave={(e) => {
                if (!disabled) {
                  e.currentTarget.style.backgroundColor = isSuggested
                    ? styles.bgHover
                    : styles.bg;
                  e.currentTarget.style.color = isSuggested
                    ? "white"
                    : styles.text;
                }
              }}
            >
              {rating.charAt(0).toUpperCase() + rating.slice(1)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
