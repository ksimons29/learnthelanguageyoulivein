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
import { Volume2, Loader2 as AudioLoader } from "lucide-react";
import { MasteryBadge } from "./mastery-badge";
import { useAudioPlayer } from "@/lib/hooks";
import { useWordsStore } from "@/lib/store/words-store";
import { getCategoryConfig, CATEGORY_CONFIG, type CategoryConfig } from "@/lib/config/categories";
import {
  hasMemoryContext,
  getSituationTag,
  formatTimeOfDay,
} from "@/lib/config/memory-context";
import {
  Trash2,
  Calendar,
  BarChart3,
  Flame,
  Loader2,
  MapPin,
  User,
  Heart,
  Users,
  Briefcase,
  ShoppingBag,
  UtensilsCrossed,
  TreePine,
  Frown,
  Trophy,
  ChevronDown,
  Check,
} from "lucide-react";

// Map icon names to components for situation tags
const SITUATION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  User,
  Heart,
  Users,
  Briefcase,
  ShoppingBag,
  UtensilsCrossed,
  TreePine,
  Frown,
  Trophy,
};
import { SentenceHistory } from "./sentence-history";
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
  const { deleteWord, updateWordCategory } = useWordsStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [isUpdatingCategory, setIsUpdatingCategory] = useState(false);

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

  const handleCategoryChange = async (newCategory: string) => {
    if (newCategory === word.category) {
      setShowCategoryPicker(false);
      return;
    }
    setIsUpdatingCategory(true);
    try {
      await updateWordCategory(word.id, newCategory);
      setShowCategoryPicker(false);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to update category");
    } finally {
      setIsUpdatingCategory(false);
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
          {/* Category badge - clickable to change category */}
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => setShowCategoryPicker(!showCategoryPicker)}
              disabled={isUpdatingCategory}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium transition-all hover:ring-2 hover:ring-offset-1"
              style={{
                backgroundColor: "var(--accent-nav-light)",
                color: "var(--accent-nav)",
                // @ts-expect-error CSS variable for ring color
                "--tw-ring-color": "var(--accent-nav)",
              }}
            >
              {isUpdatingCategory ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CategoryIcon className="h-3.5 w-3.5" />
              )}
              {categoryConfig.label}
              <ChevronDown className={`h-3 w-3 transition-transform ${showCategoryPicker ? "rotate-180" : ""}`} />
            </button>
            <MasteryBadge status={word.masteryStatus} size="sm" />
          </div>

          {/* Category picker dropdown */}
          {showCategoryPicker && (
            <div
              className="grid grid-cols-2 gap-2 p-3 rounded-xl mb-2"
              style={{ backgroundColor: "var(--surface-page)" }}
            >
              {Object.values(CATEGORY_CONFIG).map((cat: CategoryConfig) => {
                const CatIcon = cat.icon;
                const isSelected = cat.key === word.category;
                return (
                  <button
                    key={cat.key}
                    onClick={() => handleCategoryChange(cat.key)}
                    disabled={isUpdatingCategory}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{
                      backgroundColor: isSelected ? "var(--accent-nav)" : "transparent",
                      color: isSelected ? "white" : "var(--text-body)",
                    }}
                  >
                    <CatIcon className="h-4 w-4" />
                    <span className="flex-1 text-left">{cat.label}</span>
                    {isSelected && <Check className="h-4 w-4" />}
                  </button>
                );
              })}
            </div>
          )}

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
            aria-label={isThisPlaying ? "Stop audio" : "Play audio"}
          >
            {audioLoading && currentUrl === word.audioUrl ? (
              <AudioLoader className="h-5 w-5 animate-spin" />
            ) : (
              <Volume2 className={`h-5 w-5 ${isThisPlaying ? "animate-pulse" : ""}`} />
            )}
            <span>{isThisPlaying ? "Playing..." : "Play Audio"}</span>
          </button>
        </div>

        {/* Example Sentence - shows word in context */}
        {word.exampleSentence && (
          <div
            className="mb-6 p-4 rounded-xl"
            style={{ backgroundColor: "var(--surface-page)" }}
          >
            <p
              className="text-base italic leading-relaxed"
              style={{ color: "var(--text-body)" }}
            >
              &ldquo;{word.exampleSentence}&rdquo;
            </p>
            {word.exampleTranslation && (
              <p
                className="text-sm mt-2"
                style={{ color: "var(--text-muted)" }}
              >
                {word.exampleTranslation}
              </p>
            )}
          </div>
        )}

        {/* Statistics */}
        <div
          className="grid grid-cols-3 gap-4 p-4 rounded-xl mb-6"
          style={{ backgroundColor: "var(--surface-page)" }}
        >
          <StatItem
            icon={BarChart3}
            label="Practiced"
            value={word.reviewCount.toString()}
          />
          <StatItem
            icon={Flame}
            label="Correct"
            value={word.consecutiveCorrectSessions.toString()}
          />
          <StatItem icon={Calendar} label="Next Due" value={nextReviewDate} />
        </div>

        {/* Memory Section - Only show if there's context */}
        {hasMemoryContext(word) && (
          <div
            className="mb-6 p-4 rounded-r-xl"
            style={{
              backgroundColor: "var(--surface-page)",
              borderLeft: "3px solid var(--accent-nav)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <MapPin
                className="h-4 w-4"
                style={{ color: "var(--accent-nav)" }}
              />
              <h3
                className="text-sm font-semibold"
                style={{ color: "var(--text-heading)" }}
              >
                Context
              </h3>
            </div>

            {/* Location and time */}
            {(word.locationHint || word.timeOfDay) && (
              <p
                className="text-sm mb-2"
                style={{ color: "var(--text-body)" }}
              >
                {word.locationHint && <span>{word.locationHint}</span>}
                {word.locationHint && word.timeOfDay && <span> · </span>}
                {word.timeOfDay && (
                  <span>{formatTimeOfDay(word.timeOfDay as 'morning' | 'afternoon' | 'evening' | 'night')}</span>
                )}
              </p>
            )}

            {/* Situation tags */}
            {word.situationTags && word.situationTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {word.situationTags.map((tagId) => {
                  const tag = getSituationTag(tagId);
                  if (!tag) return null;
                  const IconComponent = SITUATION_ICONS[tag.icon];
                  return (
                    <span
                      key={tagId}
                      className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: "rgba(12, 107, 112, 0.15)",
                        color: "var(--accent-nav)",
                      }}
                    >
                      {IconComponent && <IconComponent className="h-3 w-3" />}
                      {tag.label}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Note */}
            {word.personalNote && (
              <p
                className="text-sm handwritten"
                style={{ color: "var(--text-body)" }}
              >
                {word.personalNote}
              </p>
            )}
          </div>
        )}

        {/* Practice Sentences */}
        <SentenceHistory wordId={word.id} />

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
