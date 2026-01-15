"use client";

import { Volume2 } from "lucide-react";

interface SentenceCardProps {
  sentence: string;
  highlightedWords: string[];
  translation?: string;
  showTranslation: boolean;
  onPlayAudio?: () => void;
}

export function SentenceCard({
  sentence,
  highlightedWords,
  translation,
  showTranslation,
  onPlayAudio,
}: SentenceCardProps) {
  // Split sentence and mark highlighted words
  const renderSentence = () => {
    const words = sentence.split(" ");
    return words.map((word, index) => {
      const cleanWord = word.replace(/[.,!?]/g, "").toLowerCase();
      const isHighlighted = highlightedWords.some(
        (hw) => hw.toLowerCase() === cleanWord
      );
      const punctuation = word.match(/[.,!?]/)?.[0] || "";
      const wordWithoutPunct = word.replace(/[.,!?]/g, "");

      return (
        <span key={index}>
          {isHighlighted ? (
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
      className="p-5 ml-4 relative rounded-r-lg rounded-l-none"
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
          Recall the meaning:
        </p>

        <p
          className="mb-4 text-xl leading-relaxed"
          style={{ color: "var(--text-heading)" }}
        >
          {renderSentence()}
        </p>

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
            onClick={onPlayAudio}
            className="mt-4 flex h-12 w-12 items-center justify-center rounded-full text-white transition-transform hover:scale-105 active:scale-95"
            style={{ backgroundColor: "var(--accent-nav)" }}
            aria-label="Play audio"
          >
            <Volume2 className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
