"use client";

import Link from "next/link";

interface DueTodayCardProps {
  count: number;
}

export function DueTodayCard({ count }: DueTodayCardProps) {
  return (
    <div
      className="flex items-center justify-between p-5 rounded-r-xl rounded-l-none relative ml-5 dark:border dark:border-[rgba(200,195,184,0.08)]"
      style={{
        backgroundColor: "var(--surface-page)",
        boxShadow: "var(--shadow-page)",
      }}
    >
      {/* Binding edge */}
      <div
        className="absolute left-0 top-0 bottom-0 -ml-5 w-5 rounded-l-sm"
        style={{
          background: "linear-gradient(90deg, var(--surface-binding) 0%, var(--accent-ribbon) 100%)",
        }}
      />
      {/* Stitching */}
      <div
        className="absolute -ml-3 top-3 bottom-3 w-0.5"
        style={{
          backgroundImage: "repeating-linear-gradient(to bottom, transparent 0px, transparent 6px, var(--notebook-stitch) 6px, var(--notebook-stitch) 10px)",
        }}
      />

      <div className="relative z-10">
        <p
          className="text-4xl font-bold"
          style={{ color: "var(--accent-ribbon)" }}
        >
          {count}
        </p>
        <p style={{ color: "var(--text-muted)" }}>phrases ready</p>
      </div>
      <Link
        href="/review"
        className="relative z-10 px-6 py-3 rounded-lg text-white font-semibold transition-all hover:-translate-y-0.5"
        style={{
          backgroundColor: "var(--accent-ribbon)",
          boxShadow: "0 4px 12px var(--accent-ribbon-glow, rgba(232, 92, 74, 0.3))",
        }}
      >
        Practice Now
      </Link>
    </div>
  );
}
