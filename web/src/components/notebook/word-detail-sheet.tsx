"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { AudioPlayButton } from "@/components/audio";
import { MasteryBadge } from "./mastery-badge";
import { useAudioPlayer } from "@/lib/hooks";
import { useWordsStore } from "@/lib/store/words-store";
import { getCategoryConfig } from "@/lib/config/categories";
import { Trash2, Calendar, BarChart3, Flame, Loader2 } from "lucide-react";
import type { Word } from "@/lib/db/schema";

interface WordDetailSheetProps {
  word: Word | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

/**
 * WordDetailSheet Component
 *
 * Bottom sheet displaying detailed information about a selected word.
 * Shows word content, audio playback, statistics, and delete option.
 *
 * Design: Slides up from bottom on mobile, follows Moleskine styling.
 */
export function WordDetailSheet({
  word,
  open,
  onOpenChange,
  onDeleted,
}: WordDetailSheetProps) {
  const { play, isPlaying, isLoading: audioLoading, currentUrl } = useAudioPlayer();
  const { deleteWord } = useWordsStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (!word) return null;

  const categoryConfig = getCategoryConfig(word.category);
  const CategoryIcon = categoryConfig.icon;
  const isThisPlaying = isPlaying && currentUrl === word.audioUrl;

  const handlePlay = () => {
    if (word.audioUrl) {
      play(word.audioUrl);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteWord(word.id);
      onOpenChange(false);
      onDeleted?.();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  // Format dates for display
  const createdDate = new Date(word.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const nextReviewDate = word.nextReviewDate
    ? new Date(word.nextReviewDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : "Now";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl max-h-[85vh] overflow-y-auto"
        style={{
          backgroundColor: "var(--surface-notebook)",
        }}
      >
        <SheetHeader className="text-left pb-4">
          {/* Category badge */}
          <div className="flex items-center gap-2 mb-2">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium"
              style={{
                backgroundColor: "var(--accent-nav-light)",
                color: "var(--accent-nav)",
              }}
            >
              <CategoryIcon className="h-3.5 w-3.5" />
              {categoryConfig.label}
            </div>
            <MasteryBadge status={word.masteryStatus} size="sm" />
          </div>

          {/* Word and translation */}
          <SheetTitle
            className="text-2xl heading-serif"
            style={{ color: "var(--text-heading)" }}
          >
            {word.originalText}
          </SheetTitle>
          <SheetDescription
            className="text-lg"
            style={{ color: "var(--text-muted)" }}
          >
            {word.translation}
          </SheetDescription>
        </SheetHeader>

        {/* Audio button - Prominent */}
        <div className="flex justify-center py-6">
          <button
            onClick={handlePlay}
            disabled={!word.audioUrl || audioLoading}
            className="flex items-center gap-3 px-6 py-3 rounded-full font-medium transition-all"
            style={{
              backgroundColor: isThisPlaying
                ? "var(--accent-ribbon)"
                : "var(--accent-nav)",
              color: "white",
              opacity: word.audioUrl ? 1 : 0.5,
            }}
          >
            <AudioPlayButton
              isPlaying={isThisPlaying}
              isLoading={audioLoading && currentUrl === word.audioUrl}
              hasAudio={!!word.audioUrl}
              onClick={handlePlay}
              size="md"
              className="!bg-transparent !text-white"
            />
            <span>{isThisPlaying ? "Playing..." : "Play Audio"}</span>
          </button>
        </div>

        {/* Statistics */}
        <div
          className="grid grid-cols-3 gap-4 p-4 rounded-xl mb-6"
          style={{ backgroundColor: "var(--surface-page)" }}
        >
          <StatItem
            icon={BarChart3}
            label="Reviews"
            value={word.reviewCount.toString()}
          />
          <StatItem
            icon={Flame}
            label="Correct"
            value={word.consecutiveCorrectSessions.toString()}
          />
          <StatItem icon={Calendar} label="Next Review" value={nextReviewDate} />
        </div>

        {/* Created date */}
        <p
          className="text-sm text-center mb-6"
          style={{ color: "var(--text-muted)" }}
        >
          Added {createdDate}
        </p>

        {/* Error message */}
        {deleteError && (
          <div
            className="p-3 rounded-lg text-center mb-4 text-sm"
            style={{
              backgroundColor: "rgba(232, 92, 74, 0.1)",
              color: "var(--accent-ribbon)",
            }}
          >
            {deleteError}
          </div>
        )}

        <SheetFooter className="flex-col gap-3 sm:flex-col">
          {/* Delete button */}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: "rgba(232, 92, 74, 0.1)",
              color: "var(--accent-ribbon)",
            }}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {isDeleting ? "Deleting..." : "Delete Phrase"}
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

interface StatItemProps {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  value: string;
}

function StatItem({ icon: Icon, label, value }: StatItemProps) {
  return (
    <div className="text-center">
      <Icon
        className="h-5 w-5 mx-auto mb-1"
        style={{ color: "var(--accent-nav)" }}
      />
      <p
        className="text-lg font-semibold"
        style={{ color: "var(--text-heading)" }}
      >
        {value}
      </p>
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
    </div>
  );
}
