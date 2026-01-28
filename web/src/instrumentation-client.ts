// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a user loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment tag for filtering in Sentry dashboard
  environment: process.env.NODE_ENV,

  // Performance Monitoring - sample 10% of transactions
  tracesSampleRate: 0.1,

  // Session Replay - capture 10% of sessions, 100% of sessions with errors
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Only send errors in production
  enabled: process.env.NODE_ENV === "production",

  // Integrations
  integrations: [
    Sentry.replayIntegration({
      // Mask all text content for privacy
      maskAllText: false,
      // Block all media for smaller payloads
      blockAllMedia: true,
    }),
  ],

  // Filter out noisy errors
  ignoreErrors: [
    // Browser extensions
    /chrome-extension/,
    /moz-extension/,
    // Network errors that aren't actionable
    "Failed to fetch",
    "Load failed",
    "NetworkError",
    // AbortController cancellations
    "AbortError",
  ],

  // Add custom tags to all events
  initialScope: {
    tags: {
      app: "llyli-web",
    },
  },
});
