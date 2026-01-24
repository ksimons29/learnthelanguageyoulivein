"use client";

import * as React from "react";
import { Bug, Lightbulb, MessageCircle, Send, Check, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { FEEDBACK_TYPES, type FeedbackType } from "@/lib/db/schema";

interface FeedbackSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const typeIcons = {
  bug_report: Bug,
  feature_request: Lightbulb,
  general_feedback: MessageCircle,
  word_issue: BookOpen,
} as const;

/**
 * Feedback Sheet Component
 *
 * A bottom sheet for submitting user feedback with Moleskine styling.
 * Supports bug reports, feature requests, and general feedback.
 */
function FeedbackSheet({ open, onOpenChange }: FeedbackSheetProps) {
  const [selectedType, setSelectedType] = React.useState<FeedbackType>("general_feedback");
  const [message, setMessage] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async () => {
    if (!message.trim()) {
      setError("Please enter your feedback");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          message: message.trim(),
          pageContext: typeof window !== "undefined" ? window.location.pathname : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit feedback");
      }

      setIsSuccess(true);

      // Close sheet after showing success
      setTimeout(() => {
        onOpenChange(false);
        // Reset state after close animation
        setTimeout(() => {
          setMessage("");
          setSelectedType("general_feedback");
          setIsSuccess(false);
        }, 300);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl px-6 pb-8"
        style={{ backgroundColor: "var(--surface-page)" }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-2 pb-4">
          <div
            className="h-1 w-12 rounded-full"
            style={{ backgroundColor: "var(--notebook-stitch)" }}
          />
        </div>

        {isSuccess ? (
          // Success state
          <div className="flex flex-col items-center py-8">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: "var(--state-good)", opacity: 0.1 }}
            >
              <Check
                className="w-8 h-8"
                style={{ color: "var(--state-good)" }}
              />
            </div>
            <h3
              className="text-lg heading-serif mb-1"
              style={{ color: "var(--text-heading)" }}
            >
              Thank you!
            </h3>
            <p
              className="text-sm text-center"
              style={{ color: "var(--text-muted)" }}
            >
              Your feedback helps us improve LLYLI
            </p>
          </div>
        ) : (
          <>
            {/* Title */}
            <div className="text-center mb-6">
              <h2
                className="text-xl heading-serif mb-1"
                style={{ color: "var(--text-heading)" }}
              >
                Give Feedback
              </h2>
              <p
                className="text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                Help us improve your experience
              </p>
            </div>

            {/* Type selector pills */}
            <div className="flex gap-2 mb-6 justify-center">
              {FEEDBACK_TYPES.map((type) => {
                const Icon = typeIcons[type.id];
                const isSelected = selectedType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedType(type.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    )}
                    style={{
                      backgroundColor: isSelected
                        ? "var(--accent-nav)"
                        : "var(--surface-page-aged)",
                      color: isSelected ? "white" : "var(--text-body)",
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{type.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Message textarea */}
            <div className="mb-4">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  selectedType === "bug_report"
                    ? "Describe what happened and what you expected..."
                    : selectedType === "feature_request"
                    ? "What feature would make LLYLI better for you?"
                    : selectedType === "word_issue"
                    ? "Which word has an issue? What's wrong with it?"
                    : "Share your thoughts with us..."
                }
                className={cn(
                  "w-full h-32 px-4 py-3 rounded-lg resize-none",
                  "text-sm placeholder:text-muted-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "border"
                )}
                style={{
                  backgroundColor: "var(--surface-page)",
                  borderColor: "var(--notebook-stitch)",
                  color: "var(--text-body)",
                }}
                maxLength={5000}
              />
              <div
                className="text-xs mt-1 text-right"
                style={{ color: "var(--text-muted)" }}
              >
                {message.length}/5000
              </div>
            </div>

            {/* Error message */}
            {error && (
              <p
                className="text-sm text-center mb-4"
                style={{ color: "var(--state-bad)" }}
              >
                {error}
              </p>
            )}

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !message.trim()}
              className={cn(
                "w-full py-3 rounded-lg flex items-center justify-center gap-2",
                "text-white font-medium transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              style={{
                backgroundColor: "var(--accent-ribbon)",
              }}
            >
              {isSubmitting ? (
                <span>Sending...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Feedback</span>
                </>
              )}
            </button>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export { FeedbackSheet };
