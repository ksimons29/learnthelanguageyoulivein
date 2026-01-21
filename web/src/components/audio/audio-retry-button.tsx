"use client";

import { AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioRetryButtonProps {
  isRetrying: boolean;
  onRetry: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * AudioRetryButton Component
 *
 * Shows when audio generation has failed, allowing user to retry.
 * Uses orange/warning styling to indicate error state.
 *
 * Design: Orange dashed border (state-hard color) with alert icon.
 */
export function AudioRetryButton({
  isRetrying,
  onRetry,
  size = "md",
  className,
}: AudioRetryButtonProps) {
  const sizeClasses = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-11 w-11",
  };

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <button
      onClick={onRetry}
      disabled={isRetrying}
      className={cn(
        "flex items-center justify-center rounded-lg transition-all",
        "border border-dashed",
        sizeClasses[size],
        className
      )}
      style={{
        color: "var(--state-hard)",
        borderColor: "var(--state-hard)",
      }}
      onMouseEnter={(e) => {
        if (!isRetrying) {
          e.currentTarget.style.backgroundColor = "rgba(234, 88, 12, 0.1)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}
      aria-label={isRetrying ? "Retrying audio generation" : "Retry audio generation"}
      title="Audio generation failed. Tap to retry."
    >
      {isRetrying ? (
        <Loader2 className={cn(iconSizes[size], "animate-spin")} />
      ) : (
        <AlertCircle className={iconSizes[size]} />
      )}
    </button>
  );
}
