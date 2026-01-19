import type { NextConfig } from "next";
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

export default withSerwist(nextConfig);
