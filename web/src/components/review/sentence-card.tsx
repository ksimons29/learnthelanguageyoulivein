"use client";

import { Volume2, Loader2, VolumeX } from "lucide-react";
import type { ExerciseType } from "@/lib/sentences/exercise-type";

interface SentenceCardProps {
  sentence: string;
  highlightedWords: string[];
  translation?: string;
  showTranslation: boolean;
  onPlayAudio?: () => void;
  isPlayingAudio?: boolean;
  isLoadingAudio?: boolean;
  /** Exercise type determines display mode */
  exerciseType?: ExerciseType;
  /** Word to blank out for fill_blank exercises */
  blankedWord?: string;
  /** Render exercise input/options below the sentence */
  children?: React.ReactNode;
}

export function SentenceCard({
  sentence,
  highlightedWords,
  translation,
  showTranslation,
  onPlayAudio,
  isPlayingAudio = false,
  isLoadingAudio = false,
  exerciseType = "type_translation",
  blankedWord,
  children,
}: SentenceCardProps) {
  // Split sentence and mark highlighted words (and blanked word for fill_blank)
  const renderSentence = () => {
    const words = sentence.split(" ");
    return words.map((word, index) => {
      const cleanWord = word.replace(/[.,!?;:]/g, "").toLowerCase();
      const isHighlighted = highlightedWords.some(
        (hw) => hw.toLowerCase() === cleanWord
      );
      // FIX for Finding #16: Handle multi-word phrases like "Bom dia"
      // Split blankedWord into parts and check if cleanWord matches ANY part
      // This ensures all words in a multi-word phrase are blanked
      const isBlanked =
        exerciseType === "fill_blank" &&
        blankedWord &&
        blankedWord.toLowerCase().split(' ').some(
          part => part.replace(/[.,!?;:]/g, '') === cleanWord
        );
      const punctuation = word.match(/[.,!?;:]/)?.[0] || "";
      const wordWithoutPunct = word.replace(/[.,!?;:]/g, "");

      return (
        <span key={index}>
          {isBlanked ? (
            // Blanked word for fill_blank exercises
            <span
              className="inline-block rounded px-2 py-0.5 font-medium border-b-2 border-dashed"
              style={{
                borderColor: "var(--accent-nav)",
                minWidth: "4rem",
                color: "transparent",
                backgroundColor: "var(--accent-nav-light)",
              }}
            >
              {/* Show underscores as placeholder */}
              {"_".repeat(Math.max(wordWithoutPunct.length, 5))}
            </span>
          ) : isHighlighted ? (
            // Highlighted target word
            <span
              className="inline-block rounded px-1 py-0.5 font-medium"
              style={{
                backgroundColor: "var(--accent-nav-light)",
                color: "var(--accent-nav)",
              }}
            >
              {wordWithoutPunct}
            </span>
          ) : (
            wordWithoutPunct
          )}
          {punctuation}
          {index < words.length - 1 ? " " : ""}
        </span>
      );
    });
  };

  return (
    <div
      className="p-5 ml-4 relative rounded-r-lg rounded-l-none dark:border dark:border-[rgba(200,195,184,0.08)]"
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

      <div className="relative z-10">
        <p className="mb-2 text-sm" style={{ color: "var(--text-muted)" }}>
          {exerciseType === "fill_blank"
            ? "Fill in the blank:"
            : exerciseType === "multiple_choice"
            ? "Choose the correct meaning:"
            : "Recall the meaning:"}
        </p>

        <p
          className="mb-4 text-xl leading-relaxed"
          style={{ color: "var(--text-heading)" }}
        >
          {renderSentence()}
        </p>

        {/* Exercise input/options rendered via children */}
        {children}

        {showTranslation && translation && (
          <>
            <div
              className="my-4 h-px"
              style={{ backgroundColor: "var(--notebook-stitch)" }}
            />
            <p style={{ color: "var(--text-muted)" }}>{translation}</p>
          </>
        )}

        {onPlayAudio && (
          <button
            id="audio-button"
            onClick={onPlayAudio}
            disabled={isLoadingAudio}
            className="mt-4 flex h-12 w-12 items-center justify-center rounded-full text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: isPlayingAudio ? "var(--accent-ribbon)" : "var(--accent-nav)" }}
            aria-label={isPlayingAudio ? "Stop audio" : "Play audio"}
          >
            {isLoadingAudio ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isPlayingAudio ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
