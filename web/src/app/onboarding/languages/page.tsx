"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "@/lib/config/languages";

// Language flags mapping
const FLAGS: Record<string, string> = {
  "pt-PT": "🇵🇹",
  "pt-BR": "🇧🇷",
  "en": "🇬🇧",
  "sv": "🇸🇪",
  "es": "🇪🇸",
  "fr": "🇫🇷",
  "de": "🇩🇪",
  "nl": "🇳🇱",
};

// Target languages (what users can learn)
const TARGET_LANGUAGES = ["pt-PT", "sv", "es", "fr", "de", "nl"];

// Native languages (what users might speak)
const NATIVE_LANGUAGES = ["en", "nl", "pt-BR", "de", "fr", "es"];

/**
 * Language Selection Page
 *
 * Step 1 of onboarding - users select their target and native languages.
 * Uses a two-step selection: target first, then native.
 */
export default function LanguagesPage() {
  const router = useRouter();
  const [step, setStep] = useState<"target" | "native">("target");
  const [targetLanguage, setTargetLanguage] = useState<string | null>(null);
  const [nativeLanguage, setNativeLanguage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTargetSelect = (code: string) => {
    setTargetLanguage(code);
    setStep("native");
  };

  const handleNativeSelect = async (code: string) => {
    setNativeLanguage(code);
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/onboarding/language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetLanguage,
          nativeLanguage: code,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save preferences");
      }

      // Move to capture step
      router.push("/onboarding/capture");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsSubmitting(false);
    }
  };

  const currentLanguages = step === "target" ? TARGET_LANGUAGES : NATIVE_LANGUAGES;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ backgroundColor: "var(--surface-notebook)" }}
    >
      {/* Logo */}
      <div className="mb-8">
        <img
          src="/llyli-logo.svg"
          alt="LLYLI"
          className="h-16 w-auto"
        />
      </div>

      {/* Card */}
      <div
        className="w-full max-w-md rounded-lg p-8"
        style={{
          backgroundColor: "var(--surface-page)",
          boxShadow: "var(--shadow-page)",
        }}
      >
        {/* Step indicator */}
        <div className="flex justify-center gap-2 mb-8">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: "var(--accent-ribbon)",
            }}
          />
          <div
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor:
                step === "native" ? "var(--accent-ribbon)" : "var(--notebook-stitch)",
            }}
          />
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: "var(--notebook-stitch)" }}
          />
        </div>

        {/* Title */}
        <h1
          className="text-2xl font-serif text-center mb-2"
          style={{ color: "var(--text-heading)" }}
        >
          {step === "target"
            ? "What language are you learning?"
            : "What's your native language?"}
        </h1>
        <p
          className="text-center mb-8"
          style={{ color: "var(--text-muted)" }}
        >
          {step === "target"
            ? "Select the language you're immersed in"
            : "So we know how to translate for you"}
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

        {/* Language grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
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
                className="flex items-center gap-3 p-4 rounded-lg border-2 transition-all duration-200 hover:scale-[1.02] disabled:opacity-50"
                style={{
                  backgroundColor: isSelected
                    ? "var(--accent-nav-light)"
                    : "var(--surface-page-aged)",
                  borderColor: isSelected
                    ? "var(--accent-nav)"
                    : "transparent",
                }}
              >
                <span className="text-2xl">{FLAGS[code] || "🌍"}</span>
                <div className="text-left">
                  <p
                    className="font-medium text-sm"
                    style={{ color: "var(--text-heading)" }}
                  >
                    {lang?.name || code}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {lang?.nativeName || ""}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Back button for native step */}
        {step === "native" && (
          <button
            onClick={() => setStep("target")}
            className="w-full text-center text-sm py-2"
            style={{ color: "var(--text-muted)" }}
          >
            ← Back to language selection
          </button>
        )}

        {/* Loading state */}
        {isSubmitting && (
          <div className="flex justify-center mt-4">
            <Loader2
              className="h-6 w-6 animate-spin"
              style={{ color: "var(--accent-nav)" }}
            />
          </div>
        )}
      </div>

      {/* Skip option */}
      <button
        onClick={() => router.push("/onboarding/capture?skip=true")}
        className="mt-6 text-sm flex items-center gap-1"
        style={{ color: "var(--text-muted)" }}
      >
        Skip for now <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
}
