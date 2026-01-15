"use client";

import { PhraseCard } from "./phrase-card";

interface CapturedPhrase {
  id: string;
  phrase: string;
  translation: string;
}

interface CapturedTodayListProps {
  phrases: CapturedPhrase[];
}

export function CapturedTodayList({ phrases }: CapturedTodayListProps) {
  if (phrases.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-white/50 p-6 text-center">
        <p className="text-muted-foreground">
          No phrases captured today yet.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Tap the capture button to add your first phrase!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {phrases.map((item) => (
        <PhraseCard
          key={item.id}
          phrase={item.phrase}
          translation={item.translation}
          onEdit={() => console.log("Edit", item.id)}
          onPlay={() => console.log("Play", item.id)}
        />
      ))}
    </div>
  );
}
