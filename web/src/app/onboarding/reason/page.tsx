"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ChevronLeft, ArrowRight, Check } from "lucide-react";
import {
  Home,
  Briefcase,
  Heart,
  Plane,
  Globe,
  TrendingUp,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { LEARNING_REASONS } from "@/lib/db/schema/user-profiles";

// Map icon names to Lucide components
const REASON_ICONS: Record<string, LucideIcon> = {
  Home,
  Briefcase,
  Heart,
  Plane,
  Globe,
  TrendingUp,
  Sparkles,
};

/**
 * Learning Reason Page
 *
 * Step 2 of onboarding - users select why they're learning (multi-select).
 * This helps personalize the experience and understand user goals.
 */
export default function ReasonPage() {
  const router = useRouter();
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleReason = (reasonId: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reasonId)
        ? prev.filter((id) => id !== reasonId)
        : [...prev, reasonId]
    );
  };

  const handleContinue = async () => {
    if (selectedReasons.length === 0) {
      setError("Please select at least one reason");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Save learning reasons
      const response = await fetch("/api/onboarding/reason", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          learningReasons: selectedReasons,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save preferences");
      }

      // Go to capture step
      router.push("/onboarding/capture");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start sm:justify-center px-3 sm:px-4 py-4 sm:py-8 overflow-y-auto notebook-bg"
    >
      {/* Logo */}
      <div className="mb-4 sm:mb-6 mt-2 sm:mt-0">
        <img
          src="/images/llyli-icon.png"
          alt="LLYLI"
          className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl shadow-md"
        />
      </div>

      {/* Card - Moleskine page style */}
      <div
        className="w-full max-w-[340px] sm:max-w-md rounded-r-lg p-4 sm:p-6 page-surface relative"
        style={{
          boxShadow: "var(--shadow-page)",
        }}
      >
        {/* Binding edge effect */}
        <div
          className="absolute left-0 top-0 bottom-0 w-3 rounded-l-sm"
          style={{
            background: "linear-gradient(90deg, var(--accent-nav) 0%, var(--accent-nav) 60%, rgba(12, 107, 112, 0.3) 100%)",
          }}
        />

        {/* Step indicator */}
        <div className="flex justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="relative">
              <div
                className="w-6 sm:w-8 h-1 sm:h-1.5 rounded-full transition-all duration-300"
                style={{
                  backgroundColor:
                    s <= 2
                      ? "var(--accent-ribbon)"
                      : "var(--notebook-stitch)",
                }}
              />
              {s === 1 && (
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] sm:text-[10px] whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
                  Languages
                </span>
              )}
              {s === 2 && (
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] sm:text-[10px] whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
                  Goals
                </span>
              )}
              {s === 3 && (
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] sm:text-[10px] whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
                  Words
                </span>
              )}
              {s === 4 && (
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] sm:text-[10px] whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
                  Ready
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Title */}
        <h1
          className="text-lg sm:text-xl font-serif text-center mb-1 mt-4 sm:mt-6"
          style={{
            color: "var(--text-heading)",
            fontFamily: "var(--font-heading)",
          }}
        >
          Why are you learning?
        </h1>
        <p
          className="text-center mb-4 sm:mb-6 text-xs sm:text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          Select all that apply
        </p>

        {/* Error message */}
        {error && (
          <div
            className="mb-4 p-3 rounded-lg text-center text-sm"
            style={{
              backgroundColor: "var(--accent-ribbon-light)",
              color: "var(--accent-ribbon)",
            }}
          >
            {error}
          </div>
        )}

        {/* Reasons grid */}
        <div className="space-y-2 mb-4 sm:mb-6">
          {LEARNING_REASONS.map((reason) => {
            const IconComponent = REASON_ICONS[reason.iconName];
            const isSelected = selectedReasons.includes(reason.id);

            return (
              <button
                key={reason.id}
                onClick={() => toggleReason(reason.id)}
                disabled={isSubmitting}
                className="w-full p-3 sm:p-4 rounded-lg border-2 text-left transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: isSelected
                    ? "var(--accent-nav-light)"
                    : "transparent",
                  borderColor: isSelected
                    ? "var(--accent-nav)"
                    : "var(--border)",
                }}
              >
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                    style={{
                      backgroundColor: isSelected
                        ? "var(--accent-nav)"
                        : "var(--surface-muted)",
                    }}
                  >
                    {IconComponent && (
                      <IconComponent
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        style={{
                          color: isSelected ? "white" : "var(--text-muted)",
                        }}
                        strokeWidth={1.5}
                      />
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <span
                      className="font-medium text-sm sm:text-base block"
                      style={{ color: "var(--text-heading)" }}
                    >
                      {reason.label}
                    </span>
                    <span
                      className="text-xs sm:text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {reason.description}
                    </span>
                  </div>

                  {/* Checkbox indicator */}
                  <div
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      borderColor: isSelected
                        ? "var(--accent-nav)"
                        : "var(--border)",
                      backgroundColor: isSelected
                        ? "var(--accent-nav)"
                        : "transparent",
                    }}
                  >
                    {isSelected && (
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/onboarding/languages")}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-1 px-4 py-3 rounded-lg font-medium transition-colors hover:opacity-80"
            style={{
              color: "var(--accent-nav)",
              backgroundColor: "transparent",
              border: "1px solid var(--border)",
            }}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          <button
            onClick={handleContinue}
            disabled={isSubmitting || selectedReasons.length === 0}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "var(--accent-ribbon)",
              color: "var(--text-on-ribbon)",
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {/* Selection count */}
        {selectedReasons.length > 0 && (
          <p
            className="text-center mt-4 text-xs"
            style={{ color: "var(--accent-nav)" }}
          >
            {selectedReasons.length} reason{selectedReasons.length > 1 ? "s" : ""} selected
          </p>
        )}
      </div>

      {/* Skip option */}
      <button
        onClick={() => router.push("/onboarding/capture")}
        className="mt-4 sm:mt-6 mb-4 text-xs sm:text-sm flex items-center gap-1 transition-colors hover:opacity-70"
        style={{
          color: "var(--text-muted)",
          fontStyle: "italic",
        }}
      >
        Skip for now <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
}
