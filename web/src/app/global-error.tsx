"use client";

// Global error boundary for root layout errors
// This must include html/body tags since the root layout may have failed

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="en">
      <body className="bg-[#f5efe0] min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold text-[#1D262A] mb-2">
            Something went wrong
          </h1>
          <p className="text-[#5C6970] mb-6">
            We hit an unexpected error. Our team has been notified and is
            looking into it.
          </p>
          <button
            onClick={reset}
            className="bg-[#0C6B70] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#095457] transition-colors"
          >
            Try again
          </button>
          {error.digest && (
            <p className="mt-4 text-xs text-[#8B9399]">
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
