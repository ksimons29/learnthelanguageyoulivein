"use client";

import Link from "next/link";
import { BookOpen, Clock } from "lucide-react";

interface ReviewDueButtonProps {
  dueCount: number;
}

export function ReviewDueButton({ dueCount }: ReviewDueButtonProps) {
  return (
    <Link
      href="/review"
      className="group relative flex w-full items-center gap-4 rounded-r-xl rounded-l-none py-5 px-6 transition-all hover:-translate-y-1 active:translate-y-0 dark:border dark:border-[rgba(200,195,184,0.08)]"
      style={{
        backgroundColor: "var(--surface-page)",
        boxShadow: "var(--shadow-page, 0 2px 8px rgba(0, 0, 0, 0.08))",
      }}
    >
      {/* Binding edge - teal with dark mode support */}
      <div
        className="absolute left-0 top-0 bottom-0 w-5 rounded-l-sm"
        style={{
          background: "linear-gradient(90deg, var(--surface-binding) 0%, var(--accent-nav) 100%)",
        }}
      />
      {/* Stitching on binding */}
      <div
        className="absolute left-2 top-3 bottom-3 w-0.5"
        style={{
          backgroundImage: "repeating-linear-gradient(to bottom, transparent 0px, transparent 6px, var(--notebook-stitch) 6px, var(--notebook-stitch) 10px)",
        }}
      />

      {/* Icon container */}
      <div
        className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl"
        style={{
          backgroundColor: "var(--accent-nav-light)",
          border: "2px solid var(--accent-nav)",
        }}
      >
        <BookOpen className="h-6 w-6" style={{ color: "var(--accent-nav)" }} strokeWidth={1.5} />
      </div>

      <div className="relative z-10 flex-1">
        <span
          className="text-xl font-semibold tracking-wide"
          style={{ color: "var(--text-heading)" }}
        >
          Due Today
        </span>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          <Clock className="inline h-3 w-3 mr-1" />
          {dueCount} phrases waiting
        </p>
      </div>

      {/* Due count badge */}
      {dueCount > 0 && (
        <div
          className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-white font-bold text-lg"
          style={{
            backgroundColor: "var(--accent-nav)",
            boxShadow: "0 2px 8px var(--accent-nav-glow, rgba(12, 107, 112, 0.4))",
          }}
        >
          {dueCount}
        </div>
      )}
    </Link>
  );
}
