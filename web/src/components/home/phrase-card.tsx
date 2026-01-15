"use client";

import { Pencil, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhraseCardProps {
  phrase: string;
  translation: string;
  onEdit?: () => void;
  onPlay?: () => void;
  className?: string;
}

export function PhraseCard({
  phrase,
  translation,
  onEdit,
  onPlay,
  className,
}: PhraseCardProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 p-4 ml-4 relative",
        "rounded-r-lg rounded-l-none",
        "transition-all duration-200 hover:-translate-y-0.5",
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
        {onPlay && (
          <button
            onClick={onPlay}
            className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
            style={{ color: "var(--accent-nav)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--accent-nav-light)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            aria-label="Play audio"
          >
            <Volume2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
