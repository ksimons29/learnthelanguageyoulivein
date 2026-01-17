"use client";

import Link from "next/link";
import { CheckCircle2, ChevronRight, Volume2 } from "lucide-react";
import type { Word } from "@/lib/db/schema";
import { useAudioPlayer } from "@/lib/hooks/use-audio-player";

interface ReadyWordsCardProps {
  words: Word[];
  totalMastered: number;
}

/**
 * ReadyWordsCard Component
 *
 * Displays words that have reached "ready to use" (mastered) status.
 * These are words the user can confidently use in real life.
 *
 * Shows up to 10 words with audio playback option.
 */
export function ReadyWordsCard({ words, totalMastered }: ReadyWordsCardProps) {
  const { play, isPlaying, currentUrl } = useAudioPlayer();

  if (words.length === 0) {
    return (
      <div
        className="rounded-xl p-5 text-center"
        style={{
          backgroundColor: "var(--surface-page)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <CheckCircle2
          className="h-8 w-8 mx-auto mb-2"
          style={{ color: "var(--text-muted)" }}
        />
        <p style={{ color: "var(--text-muted)" }}>
          No mastered words yet
        </p>
        <p
          className="text-sm mt-1"
          style={{ color: "var(--text-muted)" }}
        >
          Keep reviewing to master words!
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: "var(--surface-page)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b" style={{ borderColor: "var(--surface-binding)" }}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" style={{ color: "var(--accent-nav)" }} />
          <h3
            className="text-sm font-semibold uppercase tracking-wide"
            style={{ color: "var(--text-muted)" }}
          >
            Ready to Use
          </h3>
        </div>
        <span
          className="text-sm font-medium px-2 py-1 rounded-full"
          style={{
            backgroundColor: "var(--accent-nav)",
            color: "white",
          }}
        >
          {totalMastered}
        </span>
      </div>

      {/* Word List */}
      <div className="divide-y" style={{ borderColor: "var(--surface-binding)" }}>
        {words.map((word) => (
          <div
            key={word.id}
            className="px-4 py-3 flex items-center justify-between hover:bg-[var(--surface-hover)] transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p
                className="font-medium truncate"
                style={{ color: "var(--text-heading)" }}
              >
                {word.originalText}
              </p>
              <p
                className="text-sm truncate"
                style={{ color: "var(--text-muted)" }}
              >
                {word.translation}
              </p>
            </div>

            {/* Audio Button */}
            {word.audioUrl && (
              <button
                onClick={() => play(word.audioUrl!)}
                className="ml-2 p-2 rounded-full transition-colors hover:bg-[var(--surface-binding)]"
                aria-label="Play audio"
              >
                <Volume2
                  className="h-4 w-4"
                  style={{
                    color:
                      isPlaying && currentUrl === word.audioUrl
                        ? "var(--accent-nav)"
                        : "var(--text-muted)",
                  }}
                />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* View All Link */}
      {totalMastered > words.length && (
        <Link
          href="/notebook?filter=mastered"
          className="block p-4 text-center border-t transition-colors hover:bg-[var(--surface-hover)]"
          style={{ borderColor: "var(--surface-binding)" }}
        >
          <span
            className="text-sm font-medium flex items-center justify-center gap-1"
            style={{ color: "var(--accent-nav)" }}
          >
            View all {totalMastered} mastered words
            <ChevronRight className="h-4 w-4" />
          </span>
        </Link>
      )}
    </div>
  );
}
