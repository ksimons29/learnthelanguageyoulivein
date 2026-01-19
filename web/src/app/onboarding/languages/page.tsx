"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, ChevronLeft } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "@/lib/config/languages";
import { FlagStamp, type FlagCode } from "@/components/ui/flag-stamp";

// Target languages (what users can learn)
const TARGET_LANGUAGES: FlagCode[] = ["pt-PT", "sv", "es", "fr", "de", "nl"];

// Native languages (what users might speak)
const NATIVE_LANGUAGES: FlagCode[] = ["nl", "pt-PT", "de", "fr", "sv", "es"];

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

      // 3. Go to capture step - users add their own words after starter words injected
      router.push("/onboarding/capture");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsSubmitting(false);
    }
  };

  const currentLanguages = step === "target" ? TARGET_LANGUAGES : NATIVE_LANGUAGES;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8 notebook-bg"
    >
      {/* Logo */}
      <div className="mb-6">
        <img
          src="/images/llyli-icon.png"
          alt="LLYLI"
          className="h-16 w-16 rounded-xl shadow-md"
        />
      </div>

      {/* Card - Moleskine page style */}
      <div
        className="w-full max-w-sm rounded-r-lg p-6 page-surface relative"
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
        <div className="flex justify-center gap-3 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="relative"
            >
              <div
                className="w-8 h-1.5 rounded-full transition-all duration-300"
                style={{
                  backgroundColor:
                    s === 1 || (s === 2 && step === "native")
                      ? "var(--accent-ribbon)"
                      : "var(--notebook-stitch)",
                }}
              />
              {s === 1 && (
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px]" style={{ color: "var(--text-muted)" }}>
                  Learning
                </span>
              )}
              {s === 2 && (
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px]" style={{ color: "var(--text-muted)" }}>
                  Native
                </span>
              )}
              {s === 3 && (
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px]" style={{ color: "var(--text-muted)" }}>
                  Ready
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Title - Serif for Moleskine feel */}
        <h1
          className="text-xl font-serif text-center mb-1 mt-6"
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
          className="text-center mb-6 text-sm"
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
        <div className="grid grid-cols-3 gap-3 mb-6">
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
                className="flex flex-col items-center gap-2 p-2 rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="text-xs font-medium text-center leading-tight"
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

      {/* Skip option - subtle, like a notebook margin note */}
      <button
        onClick={() => router.push("/onboarding/complete")}
        className="mt-6 text-sm flex items-center gap-1 transition-colors hover:opacity-70"
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
