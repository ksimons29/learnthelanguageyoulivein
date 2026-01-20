"use client";

import { useEffect, useState } from "react";
import { BookOpen, Target, AlertTriangle, Sparkles } from "lucide-react";
import { getLanguageConfig } from "@/lib/config/languages";

interface JournalStats {
  totalWords: number;
  masteredCount: number;
  learningCount: number;
  dueToday: number;
  needsAttention: number;
  targetLanguage: string;
}

interface JournalHeaderProps {
  className?: string;
}

/**
 * JournalHeader Component
 *
 * Personal language journal header showing stats that make
 * the notebook feel like YOUR journey, not a generic app.
 *
 * Design: Moleskine inspired with personal stats
 */
export function JournalHeader({ className }: JournalHeaderProps) {
  const [stats, setStats] = useState<JournalStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/words/stats");
        if (response.ok) {
          const { data } = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch journal stats:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  // Get language display name (e.g., "Portuguese" from "pt-PT")
  const languageName = stats?.targetLanguage
    ? getLanguageConfig(stats.targetLanguage)?.name?.split(" ")[0] || "Language"
    : "Language";

  if (isLoading) {
    return (
      <div
        className={`animate-pulse rounded-r-lg rounded-l-none ml-4 p-6 ${className}`}
        style={{
          backgroundColor: "var(--surface-page)",
          boxShadow: "var(--shadow-page)",
        }}
      >
        <div
          className="h-8 w-48 rounded mb-3"
          style={{ backgroundColor: "var(--accent-nav-light)" }}
        />
        <div
          className="h-4 w-64 rounded mb-4"
          style={{ backgroundColor: "var(--accent-nav-light)" }}
        />
        <div className="flex gap-4">
          <div
            className="h-16 w-20 rounded"
            style={{ backgroundColor: "var(--accent-nav-light)" }}
          />
          <div
            className="h-16 w-20 rounded"
            style={{ backgroundColor: "var(--accent-nav-light)" }}
          />
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div
      className={`relative rounded-r-lg rounded-l-none ml-4 p-6 overflow-hidden ${className}`}
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

      {/* Decorative corner accent */}
      <div
        className="absolute top-0 right-0 w-16 h-16 opacity-10"
        style={{
          background:
            "radial-gradient(circle at top right, var(--accent-nav) 0%, transparent 70%)",
        }}
      />

      {/* Title */}
      <div className="relative z-10">
        <h1
          className="text-2xl heading-serif tracking-tight mb-1"
          style={{ color: "var(--text-heading)" }}
        >
          Your {languageName} Journal
        </h1>

        {/* Decorative divider */}
        <div className="flex items-center gap-2 mb-4">
          <div
            className="h-0.5 w-8 rounded-full"
            style={{ backgroundColor: "var(--accent-ribbon)" }}
          />
          <div
            className="h-0.5 w-2 rounded-full opacity-50"
            style={{ backgroundColor: "var(--accent-ribbon)" }}
          />
        </div>

        {/* Stats summary line */}
        <p
          className="text-sm mb-5"
          style={{ color: "var(--text-muted)" }}
        >
          <span style={{ color: "var(--text-body)" }} className="font-medium">
            {stats.totalWords} words
          </span>{" "}
          captured ·{" "}
          <span style={{ color: "var(--state-easy)" }} className="font-medium">
            {stats.masteredCount} mastered
          </span>
        </p>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Due Today */}
          <div
            className="p-3 rounded-lg"
            style={{ backgroundColor: "var(--accent-nav-light)" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Target
                className="h-4 w-4"
                style={{ color: "var(--accent-nav)" }}
              />
              <span
                className="text-xs font-medium uppercase tracking-wide"
                style={{ color: "var(--accent-nav)" }}
              >
                Due Today
              </span>
            </div>
            <p
              className="text-2xl font-semibold"
              style={{ color: "var(--text-heading)" }}
            >
              {stats.dueToday}
            </p>
          </div>

          {/* Needs Attention */}
          {stats.needsAttention > 0 ? (
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: "var(--state-hard-bg)" }}
            >
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle
                  className="h-4 w-4"
                  style={{ color: "var(--state-hard)" }}
                />
                <span
                  className="text-xs font-medium uppercase tracking-wide"
                  style={{ color: "var(--state-hard)" }}
                >
                  Need Help
                </span>
              </div>
              <p
                className="text-2xl font-semibold"
                style={{ color: "var(--text-heading)" }}
              >
                {stats.needsAttention}
              </p>
            </div>
          ) : (
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: "var(--state-easy-bg)" }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Sparkles
                  className="h-4 w-4"
                  style={{ color: "var(--state-easy)" }}
                />
                <span
                  className="text-xs font-medium uppercase tracking-wide"
                  style={{ color: "var(--state-easy)" }}
                >
                  On Track
                </span>
              </div>
              <p
                className="text-2xl font-semibold"
                style={{ color: "var(--text-heading)" }}
              >
                ✓
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
