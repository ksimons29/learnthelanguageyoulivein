"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { AudioReportSheet } from "./audio-report-sheet";

interface AudioReportButtonProps {
  /** Word ID to link the report to */
  wordId: string;
  /** The original text of the word (for context) */
  originalText: string;
  /** Optional translation (for context) */
  translation?: string | null;
  /** Button size */
  size?: "sm" | "md" | "lg";
  /** Additional CSS classes */
  className?: string;
}

/**
 * AudioReportButton Component
 *
 * Small flag icon button shown when audio verification failed.
 * Opens a pre-filled feedback sheet for reporting audio issues.
 */
export function AudioReportButton({
  wordId,
  originalText,
  translation,
  size = "md",
  className,
}: AudioReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-7 w-7",
    lg: "h-8 w-8",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        className={cn(
          "flex items-center justify-center rounded-lg transition-colors",
          sizeClasses[size],
          className
        )}
        style={{ color: "var(--state-bad)" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
        aria-label="Report audio issue"
        title="Report audio issue"
      >
        <Flag className={iconSizes[size]} />
      </button>

      <AudioReportSheet
        open={isOpen}
        onOpenChange={setIsOpen}
        wordId={wordId}
        originalText={originalText}
        translation={translation}
      />
    </>
  );
}
