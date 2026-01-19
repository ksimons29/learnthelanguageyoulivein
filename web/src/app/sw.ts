/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, CacheFirst, NetworkFirst, StaleWhileRevalidate, ExpirationPlugin } from "serwist";

// This declares the value of `injectionPoint` to TypeScript.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope & typeof globalThis;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Audio files from Supabase - Cache First, 1 year
    {
      matcher: ({ url }) => {
        return url.hostname.includes("supabase") && url.pathname.includes(".mp3");
      },
      handler: new CacheFirst({
        cacheName: "audio-cache",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 500,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
          }),
        ],
      }),
    },

    // Static assets - Cache First, 30 days
    {
      matcher: ({ request }) => {
        return request.destination === "image" ||
               request.destination === "font" ||
               request.destination === "style";
      },
      handler: new CacheFirst({
        cacheName: "static-cache",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          }),
        ],
      }),
    },

    // API routes for words and reviews - Network First, 1 day fallback
    {
      matcher: ({ url }) => {
        return url.pathname.startsWith("/api/words") ||
               url.pathname.startsWith("/api/reviews");
      },
      handler: new NetworkFirst({
        cacheName: "api-cache",
        networkTimeoutSeconds: 10,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60, // 1 day
          }),
        ],
      }),
    },

    // Categories and progress - Stale While Revalidate, 1 day
    {
      matcher: ({ url }) => {
        return url.pathname.startsWith("/api/categories") ||
               url.pathname.startsWith("/api/progress");
      },
      handler: new StaleWhileRevalidate({
        cacheName: "data-cache",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 20,
            maxAgeSeconds: 24 * 60 * 60, // 1 day
          }),
        ],
      }),
    },

    // Default cache for everything else
    ...defaultCache,
  ],
  // Fallback to offline page for navigation requests
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher: ({ request }) => request.mode === "navigate",
      },
    ],
  },
});

serwist.addEventListeners();
