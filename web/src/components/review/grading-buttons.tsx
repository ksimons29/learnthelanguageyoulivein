"use client";

import { cn } from "@/lib/utils";

type Rating = "hard" | "good" | "easy";

interface GradingButtonsProps {
  onGrade: (rating: Rating) => void;
  disabled?: boolean;
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

export function GradingButtons({ onGrade, disabled }: GradingButtonsProps) {
  return (
    <div className="space-y-3">
      <p className="text-center text-sm" style={{ color: "var(--text-muted)" }}>
        How well did you recall?
      </p>
      <div className="grid grid-cols-3 gap-3">
        {(["hard", "good", "easy"] as Rating[]).map((rating) => {
          const styles = gradeStyles[rating];
          return (
            <button
              key={rating}
              onClick={() => onGrade(rating)}
              disabled={disabled}
              className={cn(
                "rounded-lg border-2 py-4 text-base font-semibold transition-all active:scale-[0.98]",
                "hover:-translate-y-0.5",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              style={{
                backgroundColor: styles.bg,
                borderColor: styles.border,
                color: styles.text,
              }}
              onMouseEnter={(e) => {
                if (!disabled) {
                  e.currentTarget.style.backgroundColor = styles.bgHover;
                  e.currentTarget.style.color = "white";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = styles.bg;
                e.currentTarget.style.color = styles.text;
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
