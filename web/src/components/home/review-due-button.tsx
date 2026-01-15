"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface ReviewDueButtonProps {
  dueCount: number;
}

export function ReviewDueButton({ dueCount }: ReviewDueButtonProps) {
  return (
    <Link
      href="/review"
      className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-primary bg-[var(--llyli-teal-light)] py-4 text-lg font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground active:scale-[0.98]"
    >
      Review Due
      {dueCount > 0 && (
        <Badge className="bg-warning text-white hover:bg-warning">
          {dueCount}
        </Badge>
      )}
    </Link>
  );
}
