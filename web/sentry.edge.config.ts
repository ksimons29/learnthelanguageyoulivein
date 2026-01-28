// This file configures the initialization of Sentry for edge features (middleware, edge routes).
// The config you add here will be used whenever one of the edge features is loaded.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment tag for filtering in Sentry dashboard
  environment: process.env.NODE_ENV,

  // Performance Monitoring - sample 10% of transactions
  tracesSampleRate: 0.1,

  // Only send errors in production
  enabled: process.env.NODE_ENV === "production",

  // Add custom tags to all events
  initialScope: {
    tags: {
      app: "llyli-web",
      runtime: "edge",
    },
  },
});
