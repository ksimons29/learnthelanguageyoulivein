"use client";

import Link from "next/link";
import { type LucideIcon } from "lucide-react";

interface ContextReadinessCardProps {
  icon: LucideIcon;
  name: string;
  totalPhrases: number;
  dueCount: number;
}

export function ContextReadinessCard({
  icon: Icon,
  name,
  totalPhrases,
  dueCount,
}: ContextReadinessCardProps) {
  return (
    <div
      className="flex items-center justify-between p-4 rounded-r-xl rounded-l-none dark:border dark:border-[rgba(200,195,184,0.08)]"
      style={{
        backgroundColor: "var(--surface-page)",
        boxShadow: "var(--shadow-page)",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: "var(--accent-nav-light)" }}
        >
          <Icon
            className="h-5 w-5"
            style={{ color: "var(--accent-nav)" }}
            strokeWidth={1.5}
          />
        </div>
        <div>
          <h3
            className="font-medium"
            style={{ color: "var(--text-heading)" }}
          >
            {name}
          </h3>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {totalPhrases} phrases · {dueCount} due
          </p>
        </div>
      </div>
      <Link
        href={`/notebook/${name.toLowerCase()}`}
        className="px-4 py-2 rounded-lg font-medium transition-colors"
        style={{
          backgroundColor: "var(--accent-nav-light)",
          color: "var(--accent-nav)",
        }}
      >
        Practice
      </Link>
    </div>
  );
}
