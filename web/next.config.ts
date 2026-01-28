import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // Empty turbopack config acknowledges we're using webpack intentionally
  // (Serwist plugin requires webpack for service worker bundling)
  turbopack: {},
};

// Apply Serwist first, then wrap with Sentry
const configWithSerwist = withSerwist(nextConfig);

export default withSentryConfig(configWithSerwist, {
  // Sentry webpack plugin options
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only print warnings/errors during build
  silent: !process.env.CI,

  // Upload source maps for better stack traces
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a proxy to avoid ad blockers
  tunnelRoute: "/monitoring",

  // Disable Sentry telemetry
  telemetry: false,

  // Source map settings
  sourcemaps: {
    // Delete source maps after uploading to Sentry
    deleteSourcemapsAfterUpload: true,
  },
});
