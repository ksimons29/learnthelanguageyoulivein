"use client";

import * as React from "react";
import { Send, Check, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface AudioReportSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Word ID to link the report to */
  wordId: string;
  /** The original text of the word */
  originalText: string;
  /** Optional translation */
  translation?: string | null;
}

/**
 * AudioReportSheet Component
 *
 * A simplified feedback sheet specifically for reporting audio issues.
 * Pre-filled with word context and linked to the specific word.
 */
export function AudioReportSheet({
  open,
  onOpenChange,
  wordId,
  originalText,
  translation,
}: AudioReportSheetProps) {
  const [message, setMessage] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "audio_issue",
          message: message.trim() || `Audio issue reported for "${originalText}"`,
          pageContext: typeof window !== "undefined" ? window.location.pathname : null,
          wordId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit report");
      }

      setIsSuccess(true);

      // Close sheet after showing success
      setTimeout(() => {
        onOpenChange(false);
        // Reset state after close animation
        setTimeout(() => {
          setMessage("");
          setIsSuccess(false);
        }, 300);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit report");
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
              Report Submitted
            </h3>
            <p
              className="text-sm text-center"
              style={{ color: "var(--text-muted)" }}
            >
              We&apos;ll look into the audio issue
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
                Report Audio Issue
              </h2>
              <p
                className="text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                Help us fix pronunciation problems
              </p>
            </div>

            {/* Word context */}
            <div
              className="flex items-center gap-3 p-4 rounded-lg mb-4"
              style={{ backgroundColor: "var(--surface-page-aged)" }}
            >
              <Volume2
                className="w-5 h-5 shrink-0"
                style={{ color: "var(--accent-nav)" }}
              />
              <div className="min-w-0">
                <p
                  className="font-medium truncate"
                  style={{ color: "var(--text-heading)" }}
                >
                  {originalText}
                </p>
                {translation && (
                  <p
                    className="text-sm truncate"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {translation}
                  </p>
                )}
              </div>
            </div>

            {/* Message textarea */}
            <div className="mb-4">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Optional: Describe what's wrong with the audio (cut off, wrong word, garbled, etc.)"
                className={cn(
                  "w-full h-24 px-4 py-3 rounded-lg resize-none",
                  "text-sm placeholder:text-muted-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "border"
                )}
                style={{
                  backgroundColor: "var(--surface-page)",
                  borderColor: "var(--notebook-stitch)",
                  color: "var(--text-body)",
                }}
                maxLength={1000}
              />
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
              disabled={isSubmitting}
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
                  <span>Report Issue</span>
                </>
              )}
            </button>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
