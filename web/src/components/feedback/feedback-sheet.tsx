"use client";

import * as React from "react";
import { Bug, Lightbulb, MessageCircle, Send, Check, BookOpen, HelpCircle, ChevronRight, Home, PenLine, Target, BookMarked, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { FEEDBACK_TYPES, type FeedbackType } from "@/lib/db/schema";
import { tourManager, type TourId } from "@/lib/tours/tour-manager";
import { registerTodayTour } from "@/lib/tours/tours/today-tour";
import { registerCaptureTour } from "@/lib/tours/tours/capture-tour";
import { registerReviewTour } from "@/lib/tours/tours/review-tour";
import { registerNotebookTour } from "@/lib/tours/tours/notebook-tour";
import { registerProgressTour } from "@/lib/tours/tours/progress-tour";

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
 * Tour menu items for replay functionality
 */
const TOUR_ITEMS = [
  {
    id: "today" as TourId,
    label: "Today Dashboard",
    icon: Home,
    register: registerTodayTour,
    path: "/",
  },
  {
    id: "capture" as TourId,
    label: "Capture Words",
    icon: PenLine,
    register: registerCaptureTour,
    path: "/capture",
  },
  {
    id: "review" as TourId,
    label: "Review Session",
    icon: Target,
    register: registerReviewTour,
    path: "/review",
  },
  {
    id: "notebook" as TourId,
    label: "Notebook Browser",
    icon: BookMarked,
    register: registerNotebookTour,
    path: "/notebook",
  },
  {
    id: "progress" as TourId,
    label: "Progress Tracking",
    icon: TrendingUp,
    register: registerProgressTour,
    path: "/progress",
  },
] as const;

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
  const [showTourMenu, setShowTourMenu] = React.useState(false);

  /**
   * Start a tour and close the feedback sheet
   * Navigates to the correct page if needed
   */
  const handleStartTour = (tourItem: typeof TOUR_ITEMS[number]) => {
    // Register the tour first
    tourItem.register();

    // Close the sheet
    onOpenChange(false);

    // Navigate to the correct page if not already there
    const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
    if (currentPath !== tourItem.path) {
      // Navigate and start tour after page loads
      window.location.href = tourItem.path + "?startTour=" + tourItem.id;
    } else {
      // Start tour immediately with a small delay for sheet close animation
      setTimeout(() => {
        tourManager.startTour(tourItem.id);
      }, 300);
    }

    // Reset menu state after close
    setTimeout(() => {
      setShowTourMenu(false);
    }, 300);
  };

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

            {/* Divider */}
            <div
              className="my-6 h-px"
              style={{ backgroundColor: "var(--notebook-stitch)" }}
            />

            {/* Help Section - Tour Replay */}
            <div>
              <button
                type="button"
                onClick={() => setShowTourMenu(!showTourMenu)}
                className="w-full flex items-center justify-between py-3 px-4 rounded-lg transition-colors"
                style={{
                  backgroundColor: "var(--surface-page-aged)",
                }}
              >
                <div className="flex items-center gap-3">
                  <HelpCircle
                    className="w-5 h-5"
                    style={{ color: "var(--accent-nav)" }}
                  />
                  <span
                    className="font-medium"
                    style={{ color: "var(--text-heading)" }}
                  >
                    Replay App Tours
                  </span>
                </div>
                <ChevronRight
                  className={cn(
                    "w-5 h-5 transition-transform",
                    showTourMenu && "rotate-90"
                  )}
                  style={{ color: "var(--text-muted)" }}
                />
              </button>

              {/* Tour Menu - Expandable */}
              {showTourMenu && (
                <div
                  className="mt-2 rounded-lg overflow-hidden"
                  style={{
                    backgroundColor: "var(--surface-page)",
                    border: "1px solid var(--notebook-stitch)",
                  }}
                >
                  {TOUR_ITEMS.map((tour, index) => {
                    const Icon = tour.icon;
                    return (
                      <button
                        key={tour.id}
                        type="button"
                        onClick={() => handleStartTour(tour)}
                        className={cn(
                          "w-full flex items-center gap-3 py-3 px-4 transition-colors",
                          "hover:bg-black/5",
                          index !== TOUR_ITEMS.length - 1 && "border-b"
                        )}
                        style={{
                          borderColor: "var(--notebook-stitch)",
                        }}
                      >
                        <Icon
                          className="w-4 h-4"
                          style={{ color: "var(--accent-nav)" }}
                        />
                        <span
                          className="text-sm"
                          style={{ color: "var(--text-body)" }}
                        >
                          {tour.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export { FeedbackSheet };
