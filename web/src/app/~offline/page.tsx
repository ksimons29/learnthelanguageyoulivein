"use client";

import { WifiOff, RefreshCw, BookOpen } from "lucide-react";

/**
 * Offline Fallback Page
 *
 * Shown when user navigates to an uncached page while offline.
 * Uses Moleskine design tokens for consistent styling.
 */
export default function OfflinePage() {
  return (
    <div className="min-h-screen notebook-bg flex items-center justify-center px-5">
      <div
        className="text-center p-8 rounded-xl max-w-sm w-full"
        style={{
          backgroundColor: "var(--surface-page)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        {/* Icon */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: "var(--surface-notebook)" }}
        >
          <WifiOff
            className="w-8 h-8"
            style={{ color: "var(--text-muted)" }}
          />
        </div>

        {/* Heading */}
        <h1
          className="text-2xl heading-serif mb-2"
          style={{ color: "var(--text-heading)" }}
        >
          You&apos;re Offline
        </h1>

        {/* Message */}
        <p
          className="text-sm mb-6"
          style={{ color: "var(--text-muted)" }}
        >
          This page isn&apos;t available offline yet. Your cached reviews and audio
          will still work!
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Continue Reviewing - Primary action */}
          <a
            href="/review"
            className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-lg font-medium transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "var(--accent-ribbon)",
              color: "var(--text-on-ribbon)",
            }}
          >
            <BookOpen className="w-5 h-5" />
            Continue Reviewing
          </a>

          {/* Try Again - Secondary action */}
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-lg font-medium transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "transparent",
              color: "var(--accent-nav)",
              border: "2px solid var(--accent-nav)",
            }}
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
