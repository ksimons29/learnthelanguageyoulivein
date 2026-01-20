"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ChevronDown, ChevronUp, Volume2, Loader2 } from "lucide-react";
import { useAudioPlayer } from "@/lib/hooks";
import type { Word } from "@/lib/db/schema";

interface AttentionWord extends Word {
  sentence?: {
    text: string;
    translation: string | null;
  } | null;
}

interface AttentionData {
  words: Word[];
  sentences: Record<string, { text: string; translation: string | null } | null>;
}

interface AttentionSectionProps {
  className?: string;
}

/**
 * AttentionSection Component
 *
 * Shows words that need extra attention - words with 3+ lapses.
 * Red-tinted cards that expand to show sentence context.
 *
 * Design: Moleskine with warning styling for struggling words
 */
export function AttentionSection({ className }: AttentionSectionProps) {
  const router = useRouter();
  const [data, setData] = useState<AttentionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { play, isPlaying, currentUrl, isLoading: audioLoading } = useAudioPlayer();

  useEffect(() => {
    async function fetchAttentionWords() {
      try {
        const response = await fetch("/api/words/attention");
        if (response.ok) {
          const { data } = await response.json();
          setData(data);
        }
      } catch (error) {
        console.error("Failed to fetch attention words:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAttentionWords();
  }, []);

  const handleToggleExpand = (wordId: string) => {
    setExpandedId(expandedId === wordId ? null : wordId);
  };

  const handlePlayAudio = (e: React.MouseEvent, audioUrl: string | null) => {
    e.stopPropagation();
    if (audioUrl) {
      play(audioUrl);
    }
  };

  const handleReviewNow = () => {
    router.push("/review");
  };

  if (isLoading) {
    return (
      <div
        className={`animate-pulse rounded-lg p-4 ${className}`}
        style={{ backgroundColor: "rgba(140, 91, 82, 0.05)" }}
      >
        <div
          className="h-5 w-32 rounded mb-3"
          style={{ backgroundColor: "var(--state-hard-bg)" }}
        />
        <div
          className="h-20 rounded"
          style={{ backgroundColor: "var(--state-hard-bg)" }}
        />
      </div>
    );
  }

  // Don't show section if no struggling words
  if (!data || data.words.length === 0) {
    return null;
  }

  return (
    <section className={className}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle
            className="h-4 w-4"
            style={{ color: "var(--state-hard)" }}
          />
          <h2
            className="text-base font-semibold"
            style={{ color: "var(--text-heading)" }}
          >
            Need Attention
          </h2>
          <span
            className="text-xs px-1.5 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: "var(--state-hard)",
              color: "white",
            }}
          >
            {data.words.length}
          </span>
        </div>
        <button
          onClick={handleReviewNow}
          className="text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
          style={{
            backgroundColor: "var(--state-hard)",
            color: "white",
          }}
        >
          Review Now
        </button>
      </div>

      {/* Struggling Words List */}
      <div className="space-y-2">
        {data.words.slice(0, 5).map((word) => {
          const sentence = data.sentences[word.id];
          const isExpanded = expandedId === word.id;
          const isThisPlaying = isPlaying && currentUrl === word.audioUrl;

          return (
            <div
              key={word.id}
              className="rounded-r-lg rounded-l-none ml-4 overflow-hidden transition-all duration-200"
              style={{
                backgroundColor: "var(--surface-page)",
                boxShadow: "var(--shadow-page)",
                borderLeft: "3px solid var(--state-hard)",
              }}
            >
              {/* Main Row - Clickable to expand */}
              <button
                onClick={() => handleToggleExpand(word.id)}
                className="w-full p-3 text-left flex items-center gap-3"
              >
                {/* Expand indicator */}
                <div
                  className="shrink-0 h-6 w-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "var(--state-hard-bg)" }}
                >
                  {isExpanded ? (
                    <ChevronUp
                      className="h-4 w-4"
                      style={{ color: "var(--state-hard)" }}
                    />
                  ) : (
                    <ChevronDown
                      className="h-4 w-4"
                      style={{ color: "var(--state-hard)" }}
                    />
                  )}
                </div>

                {/* Word content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className="font-medium truncate"
                      style={{ color: "var(--text-heading)" }}
                    >
                      {word.originalText}
                    </p>
                    <span
                      className="text-sm shrink-0"
                      style={{ color: "var(--text-muted)" }}
                    >
                      → {word.translation}
                    </span>
                  </div>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--state-hard)" }}
                  >
                    {word.lapseCount} lapses · last seen{" "}
                    {word.lastReviewDate
                      ? formatRelativeDate(word.lastReviewDate)
                      : "never"}
                  </p>
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div
                  className="px-3 pb-3 pt-0"
                  style={{ borderTop: "1px dashed var(--notebook-stitch)" }}
                >
                  {/* Sentence example */}
                  {sentence ? (
                    <div className="mt-3">
                      <p
                        className="text-sm italic mb-1"
                        style={{ color: "var(--text-body)" }}
                      >
                        &ldquo;{sentence.text}&rdquo;
                      </p>
                      {sentence.translation && (
                        <p
                          className="text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {sentence.translation}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p
                      className="text-sm italic mt-3"
                      style={{ color: "var(--text-muted)" }}
                    >
                      No example sentence available yet
                    </p>
                  )}

                  {/* Audio button */}
                  {word.audioUrl && (
                    <button
                      onClick={(e) => handlePlayAudio(e, word.audioUrl)}
                      className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
                      style={{
                        backgroundColor: "var(--accent-nav-light)",
                        color: "var(--accent-nav)",
                      }}
                      disabled={audioLoading && currentUrl === word.audioUrl}
                    >
                      {audioLoading && currentUrl === word.audioUrl ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                      <span className="text-sm font-medium">
                        {isThisPlaying ? "Playing..." : "Listen"}
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Show more link if > 5 words */}
      {data.words.length > 5 && (
        <button
          onClick={() => router.push("/notebook?filter=attention")}
          className="mt-3 text-sm font-medium"
          style={{ color: "var(--state-hard)" }}
        >
          View all {data.words.length} struggling words →
        </button>
      )}
    </section>
  );
}

/**
 * Format a date as a relative string
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
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
}
