import * as React from "react";
import { cn } from "@/lib/utils";

type GradeType = "hard" | "good" | "easy";

interface GradingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  grade: GradeType;
  /** Show as selected/active */
  selected?: boolean;
}

const gradeConfig: Record<
  GradeType,
  { bg: string; bgHover: string; text: string; border: string; label: string }
> = {
  hard: {
    bg: "var(--state-hard-bg)",
    bgHover: "var(--state-hard)",
    text: "var(--state-hard)",
    border: "var(--state-hard)",
    label: "Hard",
  },
  good: {
    bg: "var(--state-good-bg)",
    bgHover: "var(--state-good)",
    text: "var(--state-good)",
    border: "var(--state-good)",
    label: "Good",
  },
  easy: {
    bg: "var(--state-easy-bg)",
    bgHover: "var(--state-easy)",
    text: "var(--state-easy)",
    border: "var(--state-easy)",
    label: "Easy",
  },
};

const GradingButton = React.forwardRef<HTMLButtonElement, GradingButtonProps>(
  ({ className, grade, selected = false, children, ...props }, ref) => {
    const config = gradeConfig[grade];

    return (
      <button
        ref={ref}
        className={cn(
          // Base
          "relative flex-1 py-3 px-4",
          "font-medium text-base",
          "rounded-lg",
          "border-2",
          "transition-all duration-150",

          // Default state
          !selected && "hover:-translate-y-0.5",

          // Selected state
          selected && "translate-y-0 shadow-inner",

          // Focus
          "focus-visible:outline-none",
          "focus-visible:ring-2",
          "focus-visible:ring-offset-2",

          className
        )}
        style={{
          backgroundColor: selected ? config.bgHover : config.bg,
          borderColor: config.border,
          color: selected ? "white" : config.text,
        }}
        {...props}
      >
        {children || config.label}
      </button>
    );
  }
);
GradingButton.displayName = "GradingButton";

export { GradingButton };
export type { GradeType };
