"use client";

import { cn } from "@/lib/utils";

/**
 * NotebookSkeleton Component
 *
 * Animated loading placeholder for the notebook page.
 * Mimics the layout of category cards with subtle pulse animation.
 *
 * Design: Follows Moleskine aesthetic with binding edge styling.
 */
export function NotebookSkeleton() {
  return (
    <div className="space-y-3 animate-in fade-in duration-300">
      {/* Inbox skeleton */}
      <div className="mb-8">
        <SkeletonCard isInbox />
      </div>

      {/* Categories section header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-1 h-6 rounded-full animate-pulse"
          style={{ backgroundColor: "var(--accent-nav-light)" }}
        />
        <div
          className="h-6 w-24 rounded animate-pulse"
          style={{ backgroundColor: "var(--surface-binding)" }}
        />
      </div>

      {/* Category card skeletons */}
      {[1, 2, 3, 4, 5].map((i) => (
        <SkeletonCard key={i} delay={i * 100} />
      ))}
    </div>
  );
}

interface SkeletonCardProps {
  isInbox?: boolean;
  delay?: number;
}

function SkeletonCard({ isInbox = false, delay = 0 }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 ml-5 relative rounded-r-xl rounded-l-none",
        "dark:border dark:border-[rgba(200,195,184,0.04)]"
      )}
      style={{
        backgroundColor: "var(--surface-page)",
        boxShadow: "var(--shadow-page)",
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Binding edge */}
      <div
        className="absolute left-0 top-0 bottom-0 -ml-5 w-5 rounded-l-sm animate-pulse"
        style={{
          background: isInbox
            ? "linear-gradient(90deg, var(--surface-binding) 0%, var(--accent-ribbon-light) 40%, var(--surface-page) 40%, var(--surface-page) 100%)"
            : "linear-gradient(90deg, var(--surface-binding) 0%, var(--accent-nav-light) 40%, var(--surface-page) 40%, var(--surface-page) 100%)",
        }}
      />

      {/* Stitching placeholder */}
      <div
        className="absolute -ml-3 top-3 bottom-3 w-0.5 opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent 0px, transparent 8px, var(--notebook-stitch) 8px, var(--notebook-stitch) 14px)",
        }}
      />

      {/* Icon skeleton */}
      <div
        className="relative z-10 h-12 w-12 rounded-xl animate-pulse"
        style={{ backgroundColor: "var(--surface-binding)" }}
      />

      {/* Content skeleton */}
      <div className="relative z-10 flex-1 space-y-2">
        <div
          className="h-5 w-24 rounded animate-pulse"
          style={{ backgroundColor: "var(--surface-binding)" }}
        />
        <div
          className="h-4 w-16 rounded animate-pulse"
          style={{ backgroundColor: "var(--surface-binding)" }}
        />
      </div>

      {/* Badge skeleton */}
      <div
        className="relative z-10 h-8 w-8 rounded-full animate-pulse"
        style={{ backgroundColor: "var(--surface-binding)" }}
      />
    </div>
  );
}

/**
 * CategoryDetailSkeleton Component
 *
 * Loading placeholder for the category detail page (word list).
 */
export function CategoryDetailSkeleton() {
  return (
    <div className="space-y-3 animate-in fade-in duration-300">
      {/* Header skeleton */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className="h-10 w-10 rounded-lg animate-pulse"
          style={{ backgroundColor: "var(--surface-binding)" }}
        />
        <div className="space-y-2">
          <div
            className="h-6 w-32 rounded animate-pulse"
            style={{ backgroundColor: "var(--surface-binding)" }}
          />
          <div
            className="h-4 w-20 rounded animate-pulse"
            style={{ backgroundColor: "var(--surface-binding)" }}
          />
        </div>
      </div>

      {/* Word cards skeleton */}
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <WordCardSkeleton key={i} delay={i * 75} />
      ))}
    </div>
  );
}

function WordCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4 ml-4 relative",
        "rounded-r-lg rounded-l-none",
        "dark:border dark:border-[rgba(200,195,184,0.04)]"
      )}
      style={{
        backgroundColor: "var(--surface-page)",
        boxShadow: "var(--shadow-page)",
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Binding strip */}
      <div
        className="absolute left-0 top-0 bottom-0 -ml-4 w-4 rounded-l-sm animate-pulse"
        style={{
          backgroundColor: "var(--surface-notebook)",
          borderRight: "1px dashed var(--notebook-stitch)",
        }}
      />

      {/* Audio button skeleton */}
      <div
        className="relative z-10 h-9 w-9 rounded-lg animate-pulse"
        style={{ backgroundColor: "var(--surface-binding)" }}
      />

      {/* Content skeleton */}
      <div className="flex-1 min-w-0 relative z-10 space-y-2">
        <div
          className="h-5 w-3/4 rounded animate-pulse"
          style={{ backgroundColor: "var(--surface-binding)" }}
        />
        <div
          className="h-4 w-1/2 rounded animate-pulse"
          style={{ backgroundColor: "var(--surface-binding)" }}
        />
      </div>

      {/* Badge skeleton */}
      <div
        className="relative z-10 h-6 w-16 rounded-full animate-pulse"
        style={{ backgroundColor: "var(--surface-binding)" }}
      />
    </div>
  );
}
