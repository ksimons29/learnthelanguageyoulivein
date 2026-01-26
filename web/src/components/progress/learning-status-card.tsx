"use client";

import Link from "next/link";
import { Clock, BrainCircuit, AlertTriangle } from "lucide-react";

interface LearningStatusCardProps {
  dueToday: number;
  needPractice: number;
  strugglingWords: number;
}

/**
 * LearningStatusCard Component
 *
 * Displays learning indicators similar to Anki's dashboard:
 * - Due for Review (words scheduled for today)
 * - Need Practice (retrievability < 90%)
 * - Struggling (3+ lapses)
 *
 * Clicking "Practice Now" goes to /review
 */
export function LearningStatusCard({
  dueToday,
  needPractice,
  strugglingWords,
}: LearningStatusCardProps) {
  return (
    <div
      className="rounded-xl p-5 relative overflow-hidden"
      style={{
        backgroundColor: "var(--surface-page)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Binding edge */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl"
        style={{
          background: "linear-gradient(180deg, var(--accent-ribbon) 0%, var(--state-warning) 100%)",
        }}
      />

      <div className="pl-3">
        <h3
          className="text-sm font-semibold uppercase tracking-wide mb-4"
          style={{ color: "var(--text-muted)" }}
        >
          Learning Status
        </h3>

        <div className="space-y-3">
          {/* Due Today */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" style={{ color: "var(--accent-nav)" }} />
              <span style={{ color: "var(--text-body)" }}>Due Today</span>
            </div>
            <span
              className="font-bold text-lg"
              style={{ color: "var(--accent-nav)" }}
            >
              {dueToday}
            </span>
          </div>

          {/* Need Practice */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
              <span style={{ color: "var(--text-body)" }}>Need Practice</span>
            </div>
            <span
              className="font-bold text-lg"
              style={{ color: "var(--text-body)" }}
            >
              {needPractice}
            </span>
          </div>

          {/* Struggling */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" style={{ color: "var(--state-warning)" }} />
              <span style={{ color: "var(--text-body)" }}>Struggling (3+ fails)</span>
            </div>
            <span
              className="font-bold text-lg"
              style={{ color: "var(--state-warning)" }}
            >
              {strugglingWords}
            </span>
          </div>
        </div>

        {/* Practice Button */}
        {dueToday > 0 && (
          <Link
            href="/review"
            className="mt-4 block w-full py-3 rounded-lg text-white font-semibold text-center transition-all hover:-translate-y-0.5"
            style={{
              backgroundColor: "var(--accent-ribbon)",
              boxShadow: "0 4px 12px var(--accent-ribbon-glow, rgba(232, 92, 74, 0.3))",
            }}
          >
            Practice Now
          </Link>
        )}
      </div>
    </div>
  );
}
