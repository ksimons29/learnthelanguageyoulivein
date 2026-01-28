"use client";

import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { AudioPlayButton, AudioRetryButton, AudioReportButton } from "@/components/audio";
import { useAudioPlayer } from "@/lib/hooks";

interface PhraseCardProps {
  phrase: string;
  translation: string;
  audioUrl?: string | null;
  audioGenerating?: boolean;
  audioFailed?: boolean;
  isRetryingAudio?: boolean;
  onRetryAudio?: () => void;
  onEdit?: () => void;
  className?: string;
  /** Issue #134: Audio verification failed - show warning indicator */
  audioVerificationFailed?: boolean;
  /** Issue #135: Audio is taking longer than expected (>15s) */
  audioWarning?: boolean;
  /** Issue #135: Show early retry option (>20s) */
  showEarlyRetry?: boolean;
  /** Word ID for audio issue reporting (optional, only needed when verification failed) */
  wordId?: string;
}

export function PhraseCard({
  phrase,
  translation,
  audioUrl,
  audioGenerating = false,
  audioFailed = false,
  isRetryingAudio = false,
  onRetryAudio,
  onEdit,
  className,
  audioVerificationFailed = false,
  audioWarning = false,
  showEarlyRetry = false,
  wordId,
}: PhraseCardProps) {
  const { play, isPlaying, isLoading, currentUrl } = useAudioPlayer();

  const isThisPlaying = isPlaying && currentUrl === audioUrl;

  const handlePlay = () => {
    if (audioUrl) {
      play(audioUrl);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 p-4 ml-4 relative",
        "rounded-r-lg rounded-l-none",
        "transition-all duration-200 hover:-translate-y-0.5",
        "dark:border dark:border-[rgba(200,195,184,0.06)]",
        className
      )}
      style={{
        backgroundColor: "var(--surface-page)",
        boxShadow: "var(--shadow-page)",
      }}
    >
      {/* Binding strip */}
      <div
        className="absolute left-0 top-0 bottom-0 -ml-4 w-4 rounded-l-sm"
        style={{
          backgroundColor: "var(--surface-notebook)",
          borderRight: "1px dashed var(--notebook-stitch)",
        }}
      />

      <div className="flex-1 min-w-0 relative z-10">
        <p
          className="font-medium truncate"
          style={{ color: "var(--text-heading)" }}
        >
          {phrase}
        </p>
        <p className="text-sm truncate" style={{ color: "var(--text-muted)" }}>
          {translation}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0 relative z-10">
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
            style={{ color: "var(--accent-nav)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--accent-nav-light)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            aria-label="Edit phrase"
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}
        {/* Show retry button when audio generation failed, otherwise show play button */}
        {audioFailed && onRetryAudio ? (
          <AudioRetryButton
            isRetrying={isRetryingAudio}
            onRetry={onRetryAudio}
            size="md"
          />
        ) : (
          <>
            <AudioPlayButton
              isPlaying={isThisPlaying}
              isLoading={audioGenerating || (isLoading && currentUrl === audioUrl)}
              hasAudio={!!audioUrl || audioGenerating}
              onClick={handlePlay}
              size="md"
              verificationFailed={audioVerificationFailed}
              showWarning={audioWarning}
            />
            {/* Show report button when verification failed and we have a word ID */}
            {audioVerificationFailed && wordId && (
              <AudioReportButton
                wordId={wordId}
                originalText={phrase}
                translation={translation}
                size="sm"
              />
            )}
            {/* Issue #135: Show early retry button alongside play button after 20s */}
            {showEarlyRetry && audioGenerating && onRetryAudio && (
              <AudioRetryButton
                isRetrying={isRetryingAudio}
                onRetry={onRetryAudio}
                size="md"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
