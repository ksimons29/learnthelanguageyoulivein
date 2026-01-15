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
      <div
        className="rounded-r-lg rounded-l-none border border-dashed p-6 text-center ml-4 relative"
        style={{
          borderColor: "var(--notebook-stitch)",
          backgroundColor: "var(--surface-page-aged)",
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
        <p style={{ color: "var(--text-muted)" }}>
          No phrases captured today yet.
        </p>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
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
