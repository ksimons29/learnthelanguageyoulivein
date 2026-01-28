"use client";

// Error boundary for app-level errors (within root layout)

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Report to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">🤔</div>
        <h1 className="text-2xl font-bold text-ink mb-2">
          Oops, something broke
        </h1>
        <p className="text-muted mb-6">
          Don&apos;t worry, we&apos;ve been notified. Try refreshing or head
          back to the dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-teal text-white px-6 py-3 rounded-lg font-medium hover:bg-teal/90 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="bg-cream-dark text-ink px-6 py-3 rounded-lg font-medium hover:bg-cream-dark/80 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
        {error.digest && (
          <p className="mt-4 text-xs text-muted">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
