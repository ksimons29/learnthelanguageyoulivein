"use client";

import { Check, AlertTriangle } from "lucide-react";

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

  const styles = isSuccess
    ? {
        bg: "var(--state-easy-bg)",
        border: "var(--state-easy)",
        text: "var(--state-easy)",
      }
    : {
        bg: "var(--state-hard-bg)",
        border: "var(--state-hard)",
        text: "var(--state-hard)",
      };

  return (
    <div
      className="rounded-lg border-2 p-4"
      style={{
        backgroundColor: styles.bg,
        borderColor: styles.border,
      }}
    >
      <div className="flex items-start gap-3">
        {isSuccess ? (
          <Check
            className="h-5 w-5 shrink-0 mt-0.5"
            style={{ color: styles.text }}
          />
        ) : (
          <AlertTriangle
            className="h-5 w-5 shrink-0 mt-0.5"
            style={{ color: styles.text }}
          />
        )}
        <div>
          <p className="font-semibold" style={{ color: styles.text }}>
            {message}
          </p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {nextReviewText}
          </p>
        </div>
      </div>
    </div>
  );
}
