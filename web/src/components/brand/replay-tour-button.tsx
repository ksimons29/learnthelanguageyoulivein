"use client";

import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TourId } from "@/lib/tours";
import { useTour } from "@/lib/tours/hooks/use-tour";

interface ReplayTourButtonProps {
  tourId: TourId;
  className?: string;
}

/**
 * Replay Tour Button
 *
 * A small button that allows users to replay the page tour.
 * Styled to match the InfoButton aesthetic.
 */
export function ReplayTourButton({ tourId, className }: ReplayTourButtonProps) {
  const { startTour } = useTour(tourId);

  return (
    <button
      id="replay-tour-button"
      onClick={() => startTour()}
      className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center",
        "transition-all duration-200",
        "hover:scale-105 hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "shadow-[0_2px_8px_rgba(0,0,0,0.08)]",
        className
      )}
      style={{ backgroundColor: "var(--surface-page-aged)" }}
      aria-label="Replay page tour"
    >
      <HelpCircle className="h-5 w-5" style={{ color: "var(--accent-nav)" }} />
    </button>
  );
}
