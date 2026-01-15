"use client";

import { X } from "lucide-react";
import { BrandWidget } from "@/components/brand";

interface ReviewHeaderProps {
  current: number;
  total: number;
  onClose: () => void;
}

export function ReviewHeader({ current, total, onClose }: ReviewHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <button
        onClick={onClose}
        className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary transition-colors"
        aria-label="Close review"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">
          {current} / {total}
        </span>
      </div>

      <BrandWidget size="xs" variant="ghost" tooltipText="About LLYLI" />
    </div>
  );
}
