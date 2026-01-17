"use client";

import { cn } from "@/lib/utils";

type MasteryStatus = "learning" | "learned" | "ready_to_use";

interface MasteryBadgeProps {
  status: MasteryStatus;
  size?: "sm" | "md";
  className?: string;
}

/**
 * MasteryBadge Component
 *
 * Displays the mastery level of a word with appropriate color coding.
 *
 * Mastery Levels:
 * - learning: Brown/Sepia - Word is being learned (0-2 correct recalls)
 * - learned: Taupe - Word is learned (3+ correct recalls, not yet mastered)
 * - ready_to_use: Teal - Word is mastered and ready for active use
 *
 * Design: Uses muted colors from the Moleskine palette.
 */
export function MasteryBadge({
  status,
  size = "md",
  className,
}: MasteryBadgeProps) {
  const config = MASTERY_CONFIG[status];

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full whitespace-nowrap",
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: config.bgColor,
        color: config.textColor,
      }}
    >
      {config.label}
    </span>
  );
}

/**
 * Mastery status configuration
 */
const MASTERY_CONFIG: Record<
  MasteryStatus,
  { label: string; bgColor: string; textColor: string }
> = {
  learning: {
    label: "Learning",
    bgColor: "rgba(139, 90, 43, 0.15)", // Sepia/brown tint
    textColor: "#8B5A2B", // Sepia brown
  },
  learned: {
    label: "Learned",
    bgColor: "rgba(128, 115, 102, 0.15)", // Taupe tint
    textColor: "#6B5B4F", // Warm taupe
  },
  ready_to_use: {
    label: "Mastered",
    bgColor: "rgba(12, 107, 112, 0.15)", // Teal tint (accent-nav)
    textColor: "var(--accent-nav)", // Teal
  },
};

/**
 * Get mastery label for display
 */
export function getMasteryLabel(status: MasteryStatus): string {
  return MASTERY_CONFIG[status].label;
}
