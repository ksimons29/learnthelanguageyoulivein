"use client";

import { CalendarClock } from "lucide-react";

interface ForecastChartProps {
  forecast: { date: string; count: number }[];
}

/**
 * ForecastChart Component
 *
 * Shows a 7-day review forecast as a bar chart.
 * Uses Moleskine design tokens for consistent styling.
 */
export function ForecastChart({ forecast }: ForecastChartProps) {
  // Find max count for scaling bars
  const maxCount = Math.max(...forecast.map((d) => d.count), 1);

  // Format date to show day name (Mon, Tue, etc.)
  const formatDay = (dateStr: string, index: number) => {
    if (index === 0) return "Today";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  // Calculate total for the week
  const weekTotal = forecast.reduce((sum, d) => sum + d.count, 0);

  return (
    <div
      className="rounded-xl p-4 binding-edge-stitched"
      style={{
        backgroundColor: "var(--surface-page)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4" style={{ color: "var(--accent-nav)" }} />
          <h3
            className="text-sm font-semibold uppercase tracking-wide"
            style={{ color: "var(--text-muted)" }}
          >
            Upcoming
          </h3>
        </div>
        <span
          className="text-xs font-medium px-2 py-1 rounded-full"
          style={{
            backgroundColor: "var(--accent-nav-light)",
            color: "var(--accent-nav)",
          }}
        >
          {weekTotal} this week
        </span>
      </div>

      {/* Compact Bar Chart */}
      <div className="flex items-end justify-between gap-1.5 h-16">
        {forecast.map((day, index) => {
          const heightPercent = (day.count / maxCount) * 100;
          const isToday = index === 0;

          return (
            <div
              key={day.date}
              className="flex-1 flex flex-col items-center"
            >
              {/* Count label - only show if > 0 */}
              {day.count > 0 && (
                <span
                  className="text-xs font-medium mb-0.5"
                  style={{
                    color: isToday ? "var(--accent-ribbon)" : "var(--text-muted)",
                  }}
                >
                  {day.count}
                </span>
              )}

              {/* Bar */}
              <div
                className="w-full rounded-t-sm transition-all"
                style={{
                  height: `${Math.max(heightPercent, 8)}%`,
                  backgroundColor: isToday
                    ? "var(--accent-ribbon)"
                    : "var(--accent-nav)",
                  opacity: isToday ? 1 : 0.4 + (0.4 * (7 - index)) / 7,
                }}
              />

              {/* Day label */}
              <span
                className="text-[10px] mt-1"
                style={{
                  color: isToday ? "var(--accent-ribbon)" : "var(--text-muted)",
                  fontWeight: isToday ? 600 : 400,
                }}
              >
                {formatDay(day.date, index)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
