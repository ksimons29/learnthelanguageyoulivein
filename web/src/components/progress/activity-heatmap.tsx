"use client";

import { Calendar } from "lucide-react";

interface ActivityHeatmapProps {
  activityHeatmap: { date: string; count: number }[];
}

/**
 * ActivityHeatmap Component
 *
 * GitHub-style contribution heatmap showing review activity.
 * Inspired by Anki's Review Heatmap add-on.
 *
 * Shows last 12 weeks of activity with color intensity based on review count.
 */
export function ActivityHeatmap({ activityHeatmap }: ActivityHeatmapProps) {
  // Create a map for quick lookup
  const activityMap = new Map(
    activityHeatmap.map((d) => [d.date, d.count])
  );

  // Generate last 12 weeks of dates (84 days)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  // Start from 83 days ago
  for (let i = 83; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    currentWeek.push(date);

    // Start new week on Sunday
    if (date.getDay() === 6 || i === 0) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  }

  // Get color based on activity level
  const getColor = (count: number) => {
    if (count === 0) return "var(--surface-binding)";
    if (count < 5) return "rgba(12, 107, 112, 0.3)"; // Light teal
    if (count < 15) return "rgba(12, 107, 112, 0.5)"; // Medium teal
    if (count < 30) return "rgba(12, 107, 112, 0.7)"; // Dark teal
    return "var(--accent-nav)"; // Full teal
  };

  // Calculate totals
  const totalReviews = activityHeatmap.reduce((sum, d) => sum + d.count, 0);
  const daysActive = activityHeatmap.filter((d) => d.count > 0).length;

  return (
    <div
      className="rounded-xl p-5"
      style={{
        backgroundColor: "var(--surface-page)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5" style={{ color: "var(--accent-nav)" }} />
          <h3
            className="text-sm font-semibold uppercase tracking-wide"
            style={{ color: "var(--text-muted)" }}
          >
            Activity (12 weeks)
          </h3>
        </div>
        <span
          className="text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          {daysActive} days active
        </span>
      </div>

      {/* Heatmap Grid */}
      <div className="flex gap-1 overflow-x-auto pb-2">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((date) => {
              const dateStr = date.toISOString().split("T")[0];
              const count = activityMap.get(dateStr) ?? 0;
              const isToday = dateStr === today.toISOString().split("T")[0];

              return (
                <div
                  key={dateStr}
                  className="w-3 h-3 rounded-sm transition-colors"
                  style={{
                    backgroundColor: getColor(count),
                    outline: isToday ? "2px solid var(--accent-ribbon)" : "none",
                    outlineOffset: "1px",
                  }}
                  title={`${dateStr}: ${count} reviews`}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-3">
        <span
          className="text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          {totalReviews} reviews total
        </span>
        <div className="flex items-center gap-1">
          <span
            className="text-xs mr-1"
            style={{ color: "var(--text-muted)" }}
          >
            Less
          </span>
          {[0, 5, 15, 30, 50].map((level) => (
            <div
              key={level}
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: getColor(level) }}
            />
          ))}
          <span
            className="text-xs ml-1"
            style={{ color: "var(--text-muted)" }}
          >
            More
          </span>
        </div>
      </div>
    </div>
  );
}
