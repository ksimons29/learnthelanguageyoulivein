"use client";

import Link from "next/link";
import { BookOpen, Sparkles, ChevronRight } from "lucide-react";
import type { Word } from "@/lib/db/schema";

interface WordsOverviewCardProps {
  wordsToFocusOn: number;
  newCardsCount: number;
  newCardsList: Word[];
  masteredWords: number;
}

/**
 * WordsOverviewCard Component
 *
 * Matches the "Words Overview" section from the Anki dashboard.
 * Green gradient header with focus badge and new cards preview.
 */
export function WordsOverviewCard({
  wordsToFocusOn,
  newCardsCount,
  newCardsList,
  masteredWords,
}: WordsOverviewCardProps) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
      {/* Green gradient header */}
      <div
        className="px-5 py-4"
        style={{
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        }}
      >
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-white" />
          <h3 className="text-white font-semibold">Words Overview</h3>
        </div>

        {/* Focus badge */}
        <div
          className="inline-block mt-3 px-4 py-2 rounded-full text-sm font-semibold"
          style={{
            backgroundColor: "#dc2626",
            color: "white",
          }}
        >
          {wordsToFocusOn} words to focus on
        </div>
      </div>

      {/* Content section */}
      <div className="bg-white">
        {/* New Cards Section */}
        {newCardsCount > 0 && (
          <div className="px-5 py-4 border-b" style={{ borderColor: "#e2e8f0" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" style={{ color: "#10b981" }} />
                <span className="text-sm font-medium text-gray-600">
                  New Cards (Not Yet Studied)
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {newCardsCount} total
              </span>
            </div>

            {/* Preview of new cards */}
            <div className="space-y-2">
              {newCardsList.slice(0, 5).map((word) => (
                <div
                  key={word.id}
                  className="flex items-center justify-between px-4 py-3 rounded-lg border"
                  style={{ borderColor: "#d1fae5", backgroundColor: "#f0fdf4" }}
                >
                  <div>
                    <p className="font-medium text-gray-800">{word.originalText}</p>
                    <p className="text-sm text-gray-500">{word.translation}</p>
                  </div>
                  <span
                    className="text-xs font-medium px-3 py-1 rounded-full text-white"
                    style={{ backgroundColor: "#10b981" }}
                  >
                    New
                  </span>
                </div>
              ))}
            </div>

            {/* See all link */}
            {newCardsCount > 5 && (
              <Link
                href="/notebook"
                className="flex items-center justify-center gap-1 mt-3 text-sm font-medium"
                style={{ color: "#10b981" }}
              >
                See all {newCardsCount} new cards
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        )}

        {/* Mastered summary */}
        {masteredWords > 0 && (
          <Link
            href="/notebook?filter=mastered"
            className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-gray-700">Ready to Use</span>
              <span
                className="text-xs font-medium px-2 py-1 rounded-full text-white"
                style={{ backgroundColor: "#0c6b70" }}
              >
                {masteredWords}
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </Link>
        )}

        {/* Empty state */}
        {newCardsCount === 0 && masteredWords === 0 && (
          <div className="px-5 py-8 text-center">
            <p className="text-gray-500">No words yet. Start capturing!</p>
            <Link
              href="/capture"
              className="inline-block mt-3 px-6 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: "#10b981" }}
            >
              Capture Words
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
