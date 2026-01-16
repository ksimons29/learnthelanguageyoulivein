"use client";

import { Flame, PenLine, BookCheck } from "lucide-react";

interface TodaysProgressProps {
  captured: number;
  reviewed: number;
  streak: number;
}

export function TodaysProgress({
  captured,
  reviewed,
  streak,
}: TodaysProgressProps) {
  return (
    <div
      className="relative rounded-r-xl rounded-l-none p-6 ml-5 dark:border dark:border-[rgba(200,195,184,0.08)]"
      style={{
        backgroundColor: "var(--surface-page)",
        boxShadow: "var(--shadow-page, 0 2px 8px rgba(0, 0, 0, 0.08))",
      }}
    >
      {/* Binding edge - uses CSS variables for dark mode */}
      <div
        className="absolute left-0 top-0 bottom-0 -ml-5 w-5 rounded-l-sm"
        style={{
          background: "linear-gradient(90deg, var(--surface-binding) 0%, var(--accent-nav) 40%, var(--surface-page) 40%, var(--surface-page) 100%)",
        }}
      />
      {/* Stitching */}
      <div
        className="absolute -ml-3 top-3 bottom-3 w-0.5"
        style={{
          backgroundImage: "repeating-linear-gradient(to bottom, transparent 0px, transparent 8px, var(--notebook-stitch) 8px, var(--notebook-stitch) 14px)",
        }}
      />

      {/* Ruled lines background - hidden in dark mode */}
      <div
        className="absolute inset-0 rounded-r-xl pointer-events-none opacity-50 dark:opacity-20"
        style={{
          backgroundImage: "repeating-linear-gradient(to bottom, transparent 0px, transparent 27px, var(--notebook-ruling) 27px, var(--notebook-ruling) 28px)",
          backgroundPosition: "0 12px",
        }}
      />

      <div className="flex items-center justify-around relative z-10">
        {/* Captured */}
        <div className="text-center">
          <div
            className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: "var(--state-easy-bg)" }}
          >
            <PenLine className="h-5 w-5" style={{ color: "var(--state-easy)" }} />
          </div>
          <p
            className="text-3xl font-bold heading-serif"
            style={{ color: "var(--state-easy)" }}
          >
            {captured}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Captured
          </p>
        </div>

        {/* Divider */}
        <div
          className="h-16 w-px"
          style={{ backgroundColor: "var(--border)" }}
        />

        {/* Reviewed */}
        <div className="text-center">
          <div
            className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: "var(--accent-nav-light)" }}
          >
            <BookCheck className="h-5 w-5" style={{ color: "var(--accent-nav)" }} />
          </div>
          <p
            className="text-3xl font-bold heading-serif"
            style={{ color: "var(--accent-nav)" }}
          >
            {reviewed}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Reviewed
          </p>
        </div>

        {/* Divider */}
        <div
          className="h-16 w-px"
          style={{ backgroundColor: "var(--border)" }}
        />

        {/* Streak */}
        <div className="text-center">
          <div
            className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: "var(--accent-ribbon-light)" }}
          >
            <Flame
              className="h-5 w-5"
              fill="currentColor"
              style={{ color: "var(--accent-ribbon)" }}
            />
          </div>
          <p
            className="text-3xl font-bold heading-serif"
            style={{ color: "var(--accent-ribbon)" }}
          >
            {streak}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Day Streak
          </p>
        </div>
      </div>
    </div>
  );
}
