"use client";

import { Play } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StrugglingCardProps {
  phrase: string;
  failCount: number;
  onPractice: () => void;
}

export function StrugglingCard({
  phrase,
  failCount,
  onPractice,
}: StrugglingCardProps) {
  return (
    <Card className="flex items-center justify-between border-2 border-danger-light bg-white p-4">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{phrase}</p>
        <p className="text-sm text-danger">Failed {failCount}x</p>
      </div>
      <button
        onClick={onPractice}
        className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform hover:scale-105 active:scale-95 shrink-0 ml-3"
        aria-label="Practice this phrase"
      >
        <Play className="h-4 w-4" fill="currentColor" />
      </button>
    </Card>
  );
}
