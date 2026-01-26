"use client";

import Link from "next/link";
import { Flame, Target, BookOpen, Clock, AlertTriangle, Sparkles, ChevronRight } from "lucide-react";
import type { Word } from "@/lib/db/schema";

interface CompactProgressCardProps {
  // Stats
  totalWords: number;
  wordsThisWeek: number;

  // Retention & Streak
  retentionRate: number;
  currentStreak: number;

  // Learning Status
  dueToday: number;
  needPractice: number;

  // Words
  strugglingWordsList: Word[];
  newCardsCount: number;
  masteredWords: number;
}

/**
 * CompactProgressCard Component
 *
 * Unified progress dashboard card using Moleskine design tokens.
 * Combines stats, learning status, and word overview in a compact layout.
 * Designed for iPhone-friendly single-screen viewing.
 */
export function CompactProgressCard({
  totalWords,
  wordsThisWeek,
  retentionRate,
  currentStreak,
  dueToday,
  needPractice,
  strugglingWordsList,
  newCardsCount,
  masteredWords,
}: CompactProgressCardProps) {
  return (
    <div
      className="rounded-xl overflow-hidden binding-edge-stitched"
      style={{
        backgroundColor: "var(--surface-page)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Header with Stats */}
      <div
        className="p-4 border-b"
        style={{ borderColor: "var(--notebook-ruling)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3
            className="text-sm font-semibold uppercase tracking-wide"
            style={{ color: "var(--text-muted)" }}
          >
            Your Progress
          </h3>
          <div id="streak-badges" className="flex items-center gap-3">
            {/* Streak */}
            <div className="flex items-center gap-1">
              <Flame
                className="h-4 w-4"
                style={{ color: currentStreak > 0 ? "var(--accent-ribbon)" : "var(--text-muted)" }}
              />
              <span
                className="text-sm font-bold"
                style={{ color: currentStreak > 0 ? "var(--accent-ribbon)" : "var(--text-muted)" }}
              >
                {currentStreak}
              </span>
            </div>
            {/* Retention */}
            <div className="flex items-center gap-1">
              <Target
                className="h-4 w-4"
                style={{ color: "var(--accent-nav)" }}
              />
              <span
                className="text-sm font-bold"
                style={{ color: "var(--accent-nav)" }}
              >
                {retentionRate}%
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div
            className="py-2 px-3 rounded-lg"
            style={{ backgroundColor: "var(--surface-page-aged)" }}
          >
            <p className="text-xl font-bold" style={{ color: "var(--text-heading)" }}>
              {totalWords}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Total
            </p>
          </div>
          <div
            className="py-2 px-3 rounded-lg"
            style={{ backgroundColor: "var(--surface-page-aged)" }}
          >
            <p className="text-xl font-bold" style={{ color: "var(--accent-nav)" }}>
              {wordsThisWeek}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              This Week
            </p>
          </div>
          <div
            className="py-2 px-3 rounded-lg"
            style={{ backgroundColor: "var(--surface-page-aged)" }}
          >
            <p className="text-xl font-bold" style={{ color: "var(--accent-nav)" }}>
              {masteredWords}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Mastered
            </p>
          </div>
        </div>
      </div>

      {/* Learning Status */}
      <div
        className="p-4 border-b"
        style={{ borderColor: "var(--notebook-ruling)" }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" style={{ color: "var(--accent-ribbon)" }} />
            <span style={{ color: "var(--text-body)" }}>Due Today</span>
          </div>
          <span className="font-bold" style={{ color: "var(--accent-ribbon)" }}>
            {dueToday}
          </span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
            <span style={{ color: "var(--text-body)" }}>Need Practice</span>
          </div>
          <span className="font-bold" style={{ color: "var(--text-body)" }}>
            {needPractice}
          </span>
        </div>
        {strugglingWordsList.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" style={{ color: "var(--state-hard)" }} />
              <span style={{ color: "var(--text-body)" }}>Struggling</span>
            </div>
            <span className="font-bold" style={{ color: "var(--state-hard)" }}>
              {strugglingWordsList.length}
            </span>
          </div>
        )}
      </div>

      {/* New Cards Preview */}
      {newCardsCount > 0 && (
        <div
          className="p-4 border-b"
          style={{ borderColor: "var(--notebook-ruling)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4" style={{ color: "var(--accent-nav)" }} />
            <span
              className="text-sm font-medium"
              style={{ color: "var(--text-muted)" }}
            >
              {newCardsCount} new cards to study
            </span>
          </div>
        </div>
      )}

      {/* Action Button */}
      {dueToday > 0 && (
        <div className="p-4">
          <Link
            href="/review"
            className="block w-full py-3 rounded-lg text-center font-semibold transition-all hover:opacity-90"
            style={{
              backgroundColor: "var(--accent-ribbon)",
              color: "var(--text-on-ribbon)",
            }}
          >
            Start practice ({dueToday} due)
          </Link>
        </div>
      )}

      {/* Empty State */}
      {dueToday === 0 && (
        <div className="p-4 text-center">
          <p style={{ color: "var(--text-muted)" }}>
            All caught up! 🎉
          </p>
          <Link
            href="/capture"
            className="inline-flex items-center gap-1 mt-2 text-sm font-medium"
            style={{ color: "var(--accent-nav)" }}
          >
            Capture more words
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
