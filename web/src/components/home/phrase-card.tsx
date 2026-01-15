"use client";

import { Pencil, Volume2 } from "lucide-react";
import { Card } from "@/components/ui/card";
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
    <Card
      className={cn(
        "flex items-center justify-between gap-3 border-border bg-white p-4",
        className
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{phrase}</p>
        <p className="text-sm text-muted-foreground truncate">{translation}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-primary hover:bg-secondary transition-colors"
            aria-label="Edit phrase"
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}
        {onPlay && (
          <button
            onClick={onPlay}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-primary hover:bg-secondary transition-colors"
            aria-label="Play audio"
          >
            <Volume2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </Card>
  );
}
