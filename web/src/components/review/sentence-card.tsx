"use client";

import { Volume2 } from "lucide-react";
import { Card } from "@/components/ui/card";

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
            <span className="inline-block rounded bg-[var(--llyli-teal-light)] px-1 py-0.5 font-medium text-primary">
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
    <Card className="border-border bg-white p-5">
      <p className="mb-2 text-sm text-muted-foreground">Recall the meaning:</p>

      <p className="mb-4 text-xl leading-relaxed text-foreground">
        {renderSentence()}
      </p>

      {showTranslation && translation && (
        <>
          <div className="my-4 h-px bg-border" />
          <p className="text-muted-foreground">{translation}</p>
        </>
      )}

      {onPlayAudio && (
        <button
          onClick={onPlayAudio}
          className="mt-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 active:scale-95"
          aria-label="Play audio"
        >
          <Volume2 className="h-5 w-5" />
        </button>
      )}
    </Card>
  );
}
