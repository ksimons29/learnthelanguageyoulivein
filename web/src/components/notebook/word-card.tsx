"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { AudioPlayButton } from "@/components/audio";
import { StatusBadge } from "./mastery-badge";
import { useAudioPlayer } from "@/lib/hooks";
import {
  formatMemoryContextShort,
  getSituationTag,
} from "@/lib/config/memory-context";
import { ChevronDown, ChevronUp, MapPin, Volume2, Loader2 } from "lucide-react";
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
  /** Optional sentence context for the word */
  sentence?: {
    text: string;
    translation: string | null;
  } | null;
  /** Whether the card is expandable (shows chevron and expanded content) */
  expandable?: boolean;
}

/**
 * WordCard Component
 *
 * Displays a word/phrase in the category detail list.
 * Now supports expandable mode to show sentence, memory context, and audio.
 *
 * Design: Moleskine notebook page styling with binding edge.
 * Implements the "Binding Rule" - rounded right, square left.
 */
export function WordCard({
  word,
  onClick,
  className,
  sentence,
  expandable = false,
}: WordCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
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

  const handleToggleExpand = (e: React.MouseEvent) => {
    if (expandable) {
      e.stopPropagation();
      setIsExpanded(!isExpanded);
    }
  };

  const handleCardClick = () => {
    if (expandable) {
      setIsExpanded(!isExpanded);
    } else if (onClick) {
      onClick();
    }
  };

  const memoryContext = formatMemoryContextShort(word);
  const situationTags = word.situationTags
    ?.map((tagId) => getSituationTag(tagId)?.label)
    .filter(Boolean);

  return (
    <div
      onClick={handleCardClick}
      role={onClick || expandable ? "button" : undefined}
      tabIndex={onClick || expandable ? 0 : undefined}
      onKeyDown={
        onClick || expandable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleCardClick();
              }
            }
          : undefined
      }
      className={cn(
        "ml-4 relative",
        "rounded-r-lg rounded-l-none",
        "transition-all duration-200",
        (onClick || expandable) && "cursor-pointer hover:-translate-y-0.5",
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

      {/* Main content row */}
      <div className="flex items-center gap-3 p-4">
        {/* Audio button */}
        <div className="shrink-0 relative z-10" onClick={handleAudioButtonClick}>
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
            <p
              className="text-sm truncate"
              style={{ color: "var(--text-muted)" }}
            >
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

        {/* Status badge */}
        <div className="shrink-0 relative z-10">
          <StatusBadge word={word} size="sm" />
        </div>

        {/* Expand chevron (if expandable) */}
        {expandable && (
          <button
            onClick={handleToggleExpand}
            className="shrink-0 relative z-10 p-1 rounded-full transition-colors"
            style={{ backgroundColor: "var(--accent-nav-light)" }}
          >
            {isExpanded ? (
              <ChevronUp
                className="h-4 w-4"
                style={{ color: "var(--accent-nav)" }}
              />
            ) : (
              <ChevronDown
                className="h-4 w-4"
                style={{ color: "var(--accent-nav)" }}
              />
            )}
          </button>
        )}
      </div>

      {/* Expanded content */}
      {expandable && isExpanded && (
        <div
          className="px-4 pb-4 pt-0 space-y-3"
          style={{ borderTop: "1px dashed var(--notebook-stitch)" }}
        >
          {/* Sentence example */}
          {sentence && (
            <div className="mt-3">
              <p
                className="text-sm italic mb-1"
                style={{ color: "var(--text-body)" }}
              >
                &ldquo;{sentence.text}&rdquo;
              </p>
              {sentence.translation && (
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {sentence.translation}
                </p>
              )}
            </div>
          )}

          {/* Memory context */}
          {(memoryContext || (situationTags && situationTags.length > 0)) && (
            <div
              className="flex items-start gap-2 p-2 rounded-lg"
              style={{ backgroundColor: "var(--accent-nav-light)" }}
            >
              <MapPin
                className="h-4 w-4 shrink-0 mt-0.5"
                style={{ color: "var(--accent-nav)" }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs" style={{ color: "var(--text-body)" }}>
                  {memoryContext}
                  {memoryContext && situationTags && situationTags.length > 0
                    ? " · "
                    : ""}
                  {situationTags?.join(", ")}
                </p>
              </div>
            </div>
          )}

          {/* Audio play button (full width when expanded) */}
          {word.audioUrl && (
            <button
              onClick={handleAudioButtonClick}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: "var(--accent-nav-light)",
                color: "var(--accent-nav)",
              }}
            >
              {isLoading && currentUrl === word.audioUrl ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">
                {isThisPlaying ? "Playing..." : "Listen to pronunciation"}
              </span>
            </button>
          )}

          {/* Review stats */}
          <div
            className="flex items-center justify-between text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            <span>
              Reviewed {word.reviewCount} times
              {word.lapseCount > 0 && ` · ${word.lapseCount} lapses`}
            </span>
            <span>
              {word.consecutiveCorrectSessions}/3 correct sessions
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
