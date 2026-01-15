"use client";

import { Check, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type FeedbackType = "success" | "hard";

interface FeedbackCardProps {
  type: FeedbackType;
  message: string;
  nextReviewText: string;
}

export function FeedbackCard({
  type,
  message,
  nextReviewText,
}: FeedbackCardProps) {
  const isSuccess = type === "success";

  return (
    <div
      className={cn(
        "rounded-xl border-2 p-4",
        isSuccess
          ? "border-success bg-success-light"
          : "border-warning bg-warning-light"
      )}
    >
      <div className="flex items-start gap-3">
        {isSuccess ? (
          <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
        )}
        <div>
          <p
            className={cn(
              "font-semibold",
              isSuccess ? "text-success" : "text-warning"
            )}
          >
            {message}
          </p>
          <p className="text-sm text-muted-foreground">{nextReviewText}</p>
        </div>
      </div>
    </div>
  );
}
