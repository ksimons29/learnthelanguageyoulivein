"use client";

import { Play } from "lucide-react";

interface StrugglingCardProps {
  phrase: string;
  failCount: number;
  onPractice: () => void;
}

export function StrugglingCard({
  phrase,
  failCount,
  onPractice,
}: StrugglingCardProps) {
  return (
    <div
      className="flex items-center justify-between p-4 rounded-r-xl rounded-l-none dark:border dark:border-[rgba(200,195,184,0.08)]"
      style={{
        backgroundColor: "var(--surface-page)",
        boxShadow: "var(--shadow-page)",
        borderLeft: "3px solid var(--state-hard)",
      }}
    >
      <div className="flex-1 min-w-0">
        <p
          className="font-medium truncate"
          style={{ color: "var(--text-heading)" }}
        >
          {phrase}
        </p>
        <p className="text-sm" style={{ color: "var(--state-hard)" }}>
          Failed {failCount}x
        </p>
      </div>
      <button
        onClick={onPractice}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-white transition-transform hover:scale-105 active:scale-95 shrink-0 ml-3"
        style={{ backgroundColor: "var(--accent-nav)" }}
        aria-label="Practice this phrase"
      >
        <Play className="h-4 w-4" fill="currentColor" />
      </button>
    </div>
  );
}
