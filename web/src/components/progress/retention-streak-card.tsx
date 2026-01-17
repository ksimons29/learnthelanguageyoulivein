"use client";

import { Flame, Target } from "lucide-react";

interface RetentionStreakCardProps {
  retentionRate: number;
  currentStreak: number;
  longestStreak: number;
}

/**
 * RetentionStreakCard Component
 *
 * Combines retention rate and streak display in a compact card.
 * - Retention: % of correct answers (Good/Easy ratings)
 * - Streak: Consecutive days with reviews
 *
 * Design uses Moleskine aesthetic with split layout.
 */
export function RetentionStreakCard({
  retentionRate,
  currentStreak,
  longestStreak,
}: RetentionStreakCardProps) {
  // Color-code retention based on performance
  const getRetentionColor = (rate: number) => {
    if (rate >= 90) return "var(--accent-nav)"; // Excellent - teal
    if (rate >= 70) return "var(--state-warning)"; // Good - amber
    return "var(--accent-ribbon)"; // Needs work - coral
  };

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: "var(--surface-page)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div className="grid grid-cols-2 divide-x" style={{ borderColor: "var(--surface-binding)" }}>
        {/* Streak Section */}
        <div className="p-4 text-center">
          <div className="flex justify-center mb-2">
            <Flame
              className="h-6 w-6"
              style={{
                color: currentStreak > 0 ? "var(--accent-ribbon)" : "var(--text-muted)",
              }}
            />
          </div>
          <p
            className="text-3xl font-bold"
            style={{
              color: currentStreak > 0 ? "var(--accent-ribbon)" : "var(--text-muted)",
            }}
          >
            {currentStreak}
          </p>
          <p
            className="text-xs uppercase tracking-wide mt-1"
            style={{ color: "var(--text-muted)" }}
          >
            Day Streak
          </p>
          {longestStreak > currentStreak && (
            <p
              className="text-xs mt-1"
              style={{ color: "var(--text-muted)" }}
            >
              Best: {longestStreak}
            </p>
          )}
        </div>

        {/* Retention Section */}
        <div className="p-4 text-center">
          <div className="flex justify-center mb-2">
            <Target
              className="h-6 w-6"
              style={{ color: getRetentionColor(retentionRate) }}
            />
          </div>
          <p
            className="text-3xl font-bold"
            style={{ color: getRetentionColor(retentionRate) }}
          >
            {retentionRate}%
          </p>
          <p
            className="text-xs uppercase tracking-wide mt-1"
            style={{ color: "var(--text-muted)" }}
          >
            Retention
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: "var(--text-muted)" }}
          >
            Target: 90%
          </p>
        </div>
      </div>
    </div>
  );
}
