"use client";

import { useState, useEffect } from "react";

/**
 * Network Status Hook
 *
 * Tracks online/offline status using browser events.
 * Also tracks if user was recently offline (for "back online" messages).
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // Check initial status (only in browser)
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
    }

    function handleOnline() {
      setIsOnline(true);
      setWasOffline(true);
      // Reset wasOffline after showing "back online" message
      setTimeout(() => setWasOffline(false), 5000);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline, wasOffline };
}
