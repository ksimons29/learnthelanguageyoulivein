"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";

interface CategoryCardProps {
  emoji: string;
  name: string;
  totalPhrases: number;
  dueCount: number;
  href: string;
}

export function CategoryCard({
  emoji,
  name,
  totalPhrases,
  dueCount,
  href,
}: CategoryCardProps) {
  return (
    <Link href={href}>
      <Card className="flex items-center justify-between border-border bg-white p-4 transition-all hover:shadow-md">
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
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </Card>
    </Link>
  );
}
