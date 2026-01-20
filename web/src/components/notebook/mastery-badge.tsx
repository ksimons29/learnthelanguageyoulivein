"use client";

import { cn } from "@/lib/utils";
import { CheckCircle, AlertTriangle, Clock, Sparkles, Circle } from "lucide-react";
import type { Word } from "@/lib/db/schema";

type MasteryStatus = "learning" | "learned" | "ready_to_use";

/**
 * Extended status that includes contextual states based on word data
 */
type DisplayStatus = "new" | "learning" | "due" | "mastered" | "struggling";

interface MasteryBadgeProps {
  status: MasteryStatus;
  size?: "sm" | "md";
  className?: string;
}

interface StatusBadgeProps {
  word: Word;
  size?: "sm" | "md";
  className?: string;
}

/**
 * MasteryBadge Component (Legacy)
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
 * StatusBadge Component (Enhanced)
 *
 * Displays contextual status based on the full word data:
 * - NEW: Never reviewed (blue outline)
 * - LEARNING: In progress (teal fill)
 * - DUE: Ready for review (coral dot)
 * - MASTERED: Ready to use (green check)
 * - STRUGGLING: 3+ lapses (red warning)
 */
export function StatusBadge({
  word,
  size = "md",
  className,
}: StatusBadgeProps) {
  const displayStatus = getDisplayStatus(word);
  const config = DISPLAY_STATUS_CONFIG[displayStatus];
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: "gap-1 px-2 py-0.5 text-xs",
    md: "gap-1.5 px-2.5 py-1 text-sm",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
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
        border: config.borderColor ? `1.5px solid ${config.borderColor}` : undefined,
      }}
    >
      <IconComponent className={iconSizes[size]} />
      {config.label}
    </span>
  );
}

/**
 * Determine the display status based on word data
 */
function getDisplayStatus(word: Word): DisplayStatus {
  // Struggling: 3+ lapses take priority
  if (word.lapseCount >= 3) {
    return "struggling";
  }

  // Mastered: ready_to_use status
  if (word.masteryStatus === "ready_to_use") {
    return "mastered";
  }

  // New: never reviewed
  if (word.reviewCount === 0) {
    return "new";
  }

  // Due: check if word needs review
  const now = new Date();
  const isDue = word.retrievability < 0.9 ||
    (word.nextReviewDate && new Date(word.nextReviewDate) <= now);

  if (isDue) {
    return "due";
  }

  // Default: learning
  return "learning";
}

/**
 * Mastery status configuration (legacy)
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
 * Display status configuration (enhanced)
 */
const DISPLAY_STATUS_CONFIG: Record<
  DisplayStatus,
  {
    label: string;
    bgColor: string;
    textColor: string;
    borderColor?: string;
    icon: typeof CheckCircle;
  }
> = {
  new: {
    label: "New",
    bgColor: "transparent",
    textColor: "var(--accent-nav)",
    borderColor: "var(--accent-nav)",
    icon: Sparkles,
  },
  learning: {
    label: "Learning",
    bgColor: "rgba(12, 107, 112, 0.15)",
    textColor: "var(--accent-nav)",
    icon: Circle,
  },
  due: {
    label: "Due",
    bgColor: "rgba(232, 92, 74, 0.15)",
    textColor: "var(--accent-ribbon)",
    icon: Clock,
  },
  mastered: {
    label: "Mastered",
    bgColor: "rgba(91, 121, 121, 0.15)",
    textColor: "var(--state-easy)",
    icon: CheckCircle,
  },
  struggling: {
    label: "Struggling",
    bgColor: "rgba(140, 91, 82, 0.15)",
    textColor: "var(--state-hard)",
    icon: AlertTriangle,
  },
};

/**
 * Get mastery label for display
 */
export function getMasteryLabel(status: MasteryStatus): string {
  return MASTERY_CONFIG[status].label;
}

/**
 * Get display status for a word
 */
export function getWordDisplayStatus(word: Word): DisplayStatus {
  return getDisplayStatus(word);
}
