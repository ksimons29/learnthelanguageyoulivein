"use client";

import { cn } from "@/lib/utils";
import { AudioPlayButton } from "@/components/audio";
import { MasteryBadge } from "./mastery-badge";
import { useAudioPlayer } from "@/lib/hooks";
import type { Word } from "@/lib/db/schema";

/**
 * Format a date as a relative string (e.g., "today", "2d ago", "Jan 15")
 */
function formatRelativeDate(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "today";
  } else if (diffDays === 1) {
    return "yesterday";
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks}w ago`;
  } else {
    // Show month and day for older dates
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
}

interface WordCardProps {
  word: Word;
  onClick?: () => void;
  className?: string;
}

/**
 * WordCard Component
 *
 * Displays a word/phrase in the category detail list.
 * Shows audio button, original text, translation, and mastery status.
 *
 * Design: Moleskine notebook page styling with binding edge.
 */
export function WordCard({ word, onClick, className }: WordCardProps) {
  const { play, isPlaying, isLoading, currentUrl } = useAudioPlayer();

  const isThisPlaying = isPlaying && currentUrl === word.audioUrl;

  const handleAudioClick = () => {
    if (word.audioUrl) {
      play(word.audioUrl);
    }
  };

  const handleAudioButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Don't trigger card click
    handleAudioClick();
  };

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={cn(
        "flex items-center gap-3 p-4 ml-4 relative",
        "rounded-r-lg rounded-l-none",
        "transition-all duration-200",
        onClick && "cursor-pointer hover:-translate-y-0.5",
        "dark:border dark:border-[rgba(200,195,184,0.06)]",
        className
      )}
      style={{
        backgroundColor: "var(--surface-page)",
        boxShadow: "var(--shadow-page)",
      }}
    >
      {/* Binding strip */}
      <div
        className="absolute left-0 top-0 bottom-0 -ml-4 w-4 rounded-l-sm"
        style={{
          backgroundColor: "var(--surface-notebook)",
          borderRight: "1px dashed var(--notebook-stitch)",
        }}
      />

      {/* Audio button */}
      <div
        className="shrink-0 relative z-10"
        onClick={handleAudioButtonClick}
      >
        <AudioPlayButton
          isPlaying={isThisPlaying}
          isLoading={isLoading && currentUrl === word.audioUrl}
          hasAudio={!!word.audioUrl}
          onClick={handleAudioClick}
          size="md"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 relative z-10">
        <p
          className="font-medium truncate"
          style={{ color: "var(--text-heading)" }}
        >
          {word.originalText}
        </p>
        <div className="flex items-center gap-2">
          <p className="text-sm truncate" style={{ color: "var(--text-muted)" }}>
            {word.translation}
          </p>
          <span
            className="text-xs shrink-0"
            style={{ color: "var(--text-muted)", opacity: 0.7 }}
          >
            · {formatRelativeDate(word.createdAt)}
          </span>
        </div>
      </div>

      {/* Mastery badge */}
      <div className="shrink-0 relative z-10">
        <MasteryBadge status={word.masteryStatus} size="sm" />
      </div>
    </div>
  );
}
