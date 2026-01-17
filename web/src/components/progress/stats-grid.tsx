"use client";

import { BookOpen, CalendarDays, CalendarRange, FolderOpen } from "lucide-react";

interface StatsGridProps {
  totalWords: number;
  wordsThisWeek: number;
  wordsThisMonth: number;
  categoryCount: number;
}

/**
 * StatsGrid Component
 *
 * Displays key vocabulary statistics in a 4-card grid layout.
 * Inspired by the Anki Portuguese Dashboard stats section.
 *
 * Shows: Total Words | This Week | This Month | Categories
 */
export function StatsGrid({
  totalWords,
  wordsThisWeek,
  wordsThisMonth,
  categoryCount,
}: StatsGridProps) {
  const stats = [
    {
      icon: BookOpen,
      value: totalWords,
      label: "Total Words",
      color: "var(--accent-ribbon)",
    },
    {
      icon: CalendarDays,
      value: wordsThisWeek,
      label: "This Week",
      color: "var(--accent-nav)",
    },
    {
      icon: CalendarRange,
      value: wordsThisMonth,
      label: "This Month",
      color: "var(--text-body)",
    },
    {
      icon: FolderOpen,
      value: categoryCount,
      label: "Categories",
      color: "var(--state-warning)",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl p-4 text-center transition-transform hover:scale-[1.02]"
          style={{
            backgroundColor: "var(--surface-page)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div className="flex justify-center mb-2">
            <stat.icon
              className="h-5 w-5"
              style={{ color: stat.color }}
            />
          </div>
          <p
            className="text-2xl font-bold mb-1"
            style={{ color: stat.color }}
          >
            {stat.value}
          </p>
          <p
            className="text-xs uppercase tracking-wide"
            style={{ color: "var(--text-muted)" }}
          >
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}
