"use client";

import { Volume2, VolumeX, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioPlayButtonProps {
  isPlaying: boolean;
  isLoading: boolean;
  hasAudio: boolean;
  onClick: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Issue #134: Audio verification failed - show warning indicator */
  verificationFailed?: boolean;
  /** Issue #135: Show "Taking longer..." warning (still generating) */
  showWarning?: boolean;
}

/**
 * AudioPlayButton Component
 *
 * A reusable button for triggering audio playback with visual states.
 * Shows different icons based on playback state (playing, loading, idle).
 *
 * Design: Follows Moleskine aesthetic with teal accent colors.
 */
export function AudioPlayButton({
  isPlaying,
  isLoading,
  hasAudio,
  onClick,
  size = "md",
  className,
  verificationFailed = false,
  showWarning = false,
}: AudioPlayButtonProps) {
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

  // Smaller sizes for warning badge
  const badgeSizes = {
    sm: "h-2.5 w-2.5",
    md: "h-3 w-3",
    lg: "h-3.5 w-3.5",
  };

  // No audio available
  if (!hasAudio) {
    return (
      <button
        disabled
        className={cn(
          "flex items-center justify-center rounded-lg transition-colors cursor-not-allowed opacity-40",
          sizeClasses[size],
          className
        )}
        style={{ color: "var(--text-muted)" }}
        aria-label="No audio available"
      >
        <VolumeX className={iconSizes[size]} />
      </button>
    );
  }

  // Determine if we should show any warning indicator
  const hasWarning = verificationFailed || showWarning;

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        "flex items-center justify-center rounded-lg transition-all relative",
        sizeClasses[size],
        isPlaying && "ring-2 ring-offset-1",
        className
      )}
      style={{
        color: isPlaying ? "var(--accent-ribbon)" : "var(--accent-nav)",
        // Use CSS custom property for ring color when playing
        ["--tw-ring-color" as string]: isPlaying ? "var(--accent-ribbon)" : undefined,
      }}
      onMouseEnter={(e) => {
        if (!isLoading) {
          e.currentTarget.style.backgroundColor = isPlaying
            ? "var(--accent-ribbon-light)"
            : "var(--accent-nav-light)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}
      aria-label={
        verificationFailed
          ? "Play audio (quality uncertain)"
          : isPlaying
          ? "Stop audio"
          : "Play audio"
      }
      title={
        verificationFailed
          ? "Audio quality may be uncertain - verification failed"
          : showWarning
          ? "Taking longer than expected..."
          : undefined
      }
    >
      {isLoading ? (
        <Loader2 className={cn(iconSizes[size], "animate-spin")} />
      ) : (
        <Volume2
          className={cn(iconSizes[size], isPlaying && "animate-pulse")}
        />
      )}
      {/* Issue #134/#135: Warning indicator badge */}
      {hasWarning && !isLoading && (
        <AlertTriangle
          className={cn(
            badgeSizes[size],
            "absolute -top-0.5 -right-0.5 text-amber-500"
          )}
        />
      )}
    </button>
  );
}
