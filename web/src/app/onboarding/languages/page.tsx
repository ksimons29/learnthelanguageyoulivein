"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ChevronLeft } from "lucide-react";
import {
  SUPPORTED_LANGUAGES,
  SUPPORTED_DIRECTIONS,
  getValidSourcesForTarget,
} from "@/lib/config/languages";
import { FlagStamp, type FlagCode } from "@/components/ui/flag-stamp";

// Derive available target languages from SUPPORTED_DIRECTIONS
// This ensures only languages with actual learning paths are shown
const TARGET_LANGUAGES: FlagCode[] = [
  ...new Set(SUPPORTED_DIRECTIONS.map((d) => d.target)),
] as FlagCode[];

/**
 * Language Selection Page
 *
 * Step 1 of onboarding - users select their target and native languages.
 * Features vintage postage stamp-styled flags fitting the Moleskine aesthetic.
 */
export default function LanguagesPage() {
  const router = useRouter();
  const [step, setStep] = useState<"target" | "native">("target");
  const [targetLanguage, setTargetLanguage] = useState<FlagCode | null>(null);
  const [nativeLanguage, setNativeLanguage] = useState<FlagCode | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTargetSelect = (code: FlagCode) => {
    setTargetLanguage(code);
    setStep("native");
  };

  const handleNativeSelect = async (code: FlagCode) => {
    setNativeLanguage(code);
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Save language preferences
      const langResponse = await fetch("/api/onboarding/language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetLanguage,
          nativeLanguage: code,
        }),
      });

      if (!langResponse.ok) {
        const data = await langResponse.json();
        throw new Error(data.error || "Failed to save preferences");
      }

      // 2. Inject starter words (fire-and-forget, don't block on errors)
      fetch("/api/onboarding/starter-words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }).catch((err) => {
        console.warn("Starter words injection failed:", err);
        // Continue anyway - user can capture words manually
      });

      // 3. Go to reason step - users select why they're learning
      router.push("/onboarding/reason");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsSubmitting(false);
    }
  };

  // Derive native languages based on selected target
  // Only show source languages that have a valid direction to the chosen target
  const nativeLanguages = useMemo<FlagCode[]>(() => {
    if (!targetLanguage) return [];
    return getValidSourcesForTarget(targetLanguage) as FlagCode[];
  }, [targetLanguage]);

  const currentLanguages = step === "target" ? TARGET_LANGUAGES : nativeLanguages;

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
        className="w-full max-w-[340px] sm:max-w-sm rounded-r-lg p-4 sm:p-6 page-surface relative"
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

        {/* Step indicator - like notebook page tabs */}
        <div className="flex justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className="relative"
            >
              <div
                className="w-6 sm:w-8 h-1 sm:h-1.5 rounded-full transition-all duration-300"
                style={{
                  backgroundColor:
                    s === 1 || (s === 2 && step === "native")
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

        {/* Title - Serif for Moleskine feel */}
        <h1
          className="text-lg sm:text-xl font-serif text-center mb-1 mt-4 sm:mt-6"
          style={{
            color: "var(--text-heading)",
            fontFamily: "var(--font-heading)",
          }}
        >
          {step === "target"
            ? "What language fills your days?"
            : "And your mother tongue?"}
        </h1>
        <p
          className="text-center mb-4 sm:mb-6 text-xs sm:text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          {step === "target"
            ? "The one you hear on streets and in shops"
            : "For translations that feel like home"}
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

        {/* Language grid - Clean layout */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
          {currentLanguages.map((code) => {
            const lang = SUPPORTED_LANGUAGES[code];
            const isSelected =
              step === "target"
                ? targetLanguage === code
                : nativeLanguage === code;

            return (
              <button
                key={code}
                onClick={() =>
                  step === "target"
                    ? handleTargetSelect(code)
                    : handleNativeSelect(code)
                }
                disabled={isSubmitting}
                className="flex flex-col items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: isSelected
                    ? "var(--accent-nav-light)"
                    : "transparent",
                }}
              >
                {/* Flag */}
                <FlagStamp
                  code={code}
                  size="lg"
                  selected={isSelected}
                />

                {/* Language name */}
                <span
                  className="text-[10px] sm:text-xs font-medium text-center leading-tight"
                  style={{ color: "var(--text-heading)" }}
                >
                  {lang?.name || code}
                </span>
              </button>
            );
          })}
        </div>

        {/* Back button for native step */}
        {step === "native" && (
          <button
            onClick={() => setStep("target")}
            className="w-full flex items-center justify-center gap-1 text-sm py-2 transition-colors hover:opacity-80"
            style={{ color: "var(--accent-nav)" }}
          >
            <ChevronLeft className="h-4 w-4" />
            Back to language selection
          </button>
        )}

        {/* Loading state */}
        {isSubmitting && (
          <div className="flex flex-col items-center gap-2 mt-4">
            <Loader2
              className="h-6 w-6 animate-spin"
              style={{ color: "var(--accent-nav)" }}
            />
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
              Saving your preferences...
            </span>
          </div>
        )}
      </div>

    </div>
  );
}
