"use client";

import { cn } from "@/lib/utils";

type Rating = "hard" | "good" | "easy";

interface GradingButtonsProps {
  onGrade: (rating: Rating) => void;
  disabled?: boolean;
}

export function GradingButtons({ onGrade, disabled }: GradingButtonsProps) {
  return (
    <div className="space-y-3">
      <p className="text-center text-sm text-muted-foreground">
        How well did you recall?
      </p>
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => onGrade("hard")}
          disabled={disabled}
          className={cn(
            "rounded-xl border-2 py-4 text-base font-semibold transition-all active:scale-[0.98]",
            "border-danger bg-danger-light text-danger hover:bg-danger hover:text-white",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          Hard
        </button>
        <button
          onClick={() => onGrade("good")}
          disabled={disabled}
          className={cn(
            "rounded-xl border-2 py-4 text-base font-semibold transition-all active:scale-[0.98]",
            "border-warning bg-warning-light text-warning hover:bg-warning hover:text-white",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          Good
        </button>
        <button
          onClick={() => onGrade("easy")}
          disabled={disabled}
          className={cn(
            "rounded-xl border-2 py-4 text-base font-semibold transition-all active:scale-[0.98]",
            "border-success bg-success text-white hover:bg-success/90",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          Easy
        </button>
      </div>
    </div>
  );
}
