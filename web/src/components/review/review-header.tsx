"use client";

import { X } from "lucide-react";
import { InfoButton } from "@/components/brand";

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
        className="flex h-10 w-10 items-center justify-center rounded-full transition-colors"
        style={{
          backgroundColor: "rgba(180, 170, 155, 0.2)",
          color: "var(--text-muted)",
        }}
        aria-label="Close practice"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-3">
        <span
          className="text-sm font-medium"
          style={{ color: "var(--text-muted)" }}
        >
          {current} / {total}
        </span>
      </div>

      <InfoButton />
    </div>
  );
}
