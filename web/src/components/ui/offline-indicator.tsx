"use client";

import { WifiOff, RefreshCw } from "lucide-react";
import { useNetworkStatus } from "@/lib/hooks";

/**
 * Offline Indicator
 *
 * Shows a banner when the user is offline or just came back online.
 * Position: Fixed at top of screen, above main content.
 */
export function OfflineIndicator() {
  const { isOnline, wasOffline } = useNetworkStatus();

  // Show nothing if online and wasn't recently offline
  if (isOnline && !wasOffline) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 px-4 py-2 text-center text-sm font-medium transition-colors duration-300"
      style={{
        backgroundColor: isOnline ? "var(--accent-nav)" : "var(--text-muted)",
        color: isOnline ? "white" : "white",
      }}
    >
      <div className="flex items-center justify-center gap-2">
        {isOnline ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Back online! Syncing...</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span>Offline mode - reviews will sync when connected</span>
          </>
        )}
      </div>
    </div>
  );
}
