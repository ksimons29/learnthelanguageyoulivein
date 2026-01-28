"use client";

import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";

interface CategoryCardProps {
  icon: LucideIcon;
  name: string;
  totalPhrases: number;
  dueCount: number;
  href: string;
  id?: string;
}

export function CategoryCard({
  icon: Icon,
  name,
  totalPhrases,
  dueCount,
  href,
  id,
}: CategoryCardProps) {
  return (
    <Link href={href}>
      <div
        id={id}
        className="group flex items-center gap-4 p-4 ml-5 relative rounded-r-xl rounded-l-none transition-all duration-200 hover:-translate-y-1 dark:border dark:border-[rgba(200,195,184,0.08)]"
        style={{
          backgroundColor: "var(--surface-page)",
          boxShadow: "var(--shadow-page)",
        }}
      >
        {/* Binding edge */}
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

        {/* Icon in a "stamp" style container */}
        <div
          className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl transition-colors"
          style={{
            backgroundColor: "var(--accent-nav-light)",
            border: "2px solid var(--accent-nav)",
          }}
        >
          <Icon
            className="h-6 w-6"
            style={{ color: "var(--accent-nav)" }}
            strokeWidth={1.5}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1">
          <h3
            className="font-semibold text-lg"
            style={{ color: "var(--text-heading)" }}
          >
            {name}
          </h3>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {totalPhrases} phrases
          </p>
        </div>

        {/* Due count badge */}
        {dueCount > 0 && (
          <div
            className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-white text-sm font-bold"
            style={{
              backgroundColor: "var(--accent-nav)",
              boxShadow: "0 2px 4px rgba(12, 107, 112, 0.3)",
            }}
          >
            {dueCount}
          </div>
        )}

        {/* Chevron */}
        <ChevronRight
          className="h-5 w-5 relative z-10 transition-transform group-hover:translate-x-1"
          style={{ color: "var(--text-muted)" }}
        />
      </div>
    </Link>
  );
}
