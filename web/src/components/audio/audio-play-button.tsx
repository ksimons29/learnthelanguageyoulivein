"use client";

import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioPlayButtonProps {
  isPlaying: boolean;
  isLoading: boolean;
  hasAudio: boolean;
  onClick: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
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

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        "flex items-center justify-center rounded-lg transition-all",
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
      aria-label={isPlaying ? "Stop audio" : "Play audio"}
    >
      {isLoading ? (
        <Loader2 className={cn(iconSizes[size], "animate-spin")} />
      ) : (
        <Volume2
          className={cn(iconSizes[size], isPlaying && "animate-pulse")}
        />
      )}
    </button>
  );
}
