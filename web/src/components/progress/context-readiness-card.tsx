"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ContextReadinessCardProps {
  emoji: string;
  name: string;
  totalPhrases: number;
  dueCount: number;
}

export function ContextReadinessCard({
  emoji,
  name,
  totalPhrases,
  dueCount,
}: ContextReadinessCardProps) {
  return (
    <Card className="flex items-center justify-between border-border bg-white p-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl" role="img" aria-label={name}>
          {emoji}
        </span>
        <div>
          <h3 className="font-medium text-foreground">{name}</h3>
          <p className="text-sm text-muted-foreground">
            {totalPhrases} phrases · {dueCount} due
          </p>
        </div>
      </div>
      <Link href={`/notebook/${name.toLowerCase()}`}>
        <Button
          variant="secondary"
          className="bg-[var(--llyli-teal-light)] text-primary hover:bg-primary hover:text-primary-foreground"
        >
          Practice
        </Button>
      </Link>
    </Card>
  );
}
