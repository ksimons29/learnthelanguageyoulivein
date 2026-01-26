"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Check, Sparkles, ArrowRight } from "lucide-react";

interface CapturedWord {
  id: string;
  originalText: string;
  translation: string;
  category: string;
  audioUrl?: string;
}

/**
 * Guided Capture Page
 *
 * Step 2 of onboarding - users capture their first 3+ words.
 * Minimum 3 words required, but users are encouraged to add more.
 * Guides them toward same-category words for better sentence generation.
 */
export default function CapturePage() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const [capturedWords, setCapturedWords] = useState<CapturedWord[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryHint, setCategoryHint] = useState<string | null>(null);

  const minWords = 3;

  // Determine if we have enough same-category words
  const categoryCounts = capturedWords.reduce((acc, word) => {
    acc[word.category] = (acc[word.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const bestCategory = Object.entries(categoryCounts).sort(
    ([, a], [, b]) => b - a
  )[0];
  const hasSameCategoryPair = bestCategory && bestCategory[1] >= 2;

  // Show hint after first capture
  useEffect(() => {
    if (capturedWords.length === 1) {
      setCategoryHint(
        `Great! Try adding another ${capturedWords[0].category} word for better sentences.`
      );
    } else if (capturedWords.length >= 2 && !hasSameCategoryPair) {
      setCategoryHint(
        "Tip: Words in the same category make better sentences together!"
      );
    } else {
      setCategoryHint(null);
    }
  }, [capturedWords, hasSameCategoryPair]);

  const handleCapture = async () => {
    if (!inputValue.trim()) return;

    setIsCapturing(true);
    setError(null);

    try {
      const response = await fetch("/api/words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputValue.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to capture word");
      }

      const { data } = await response.json();
      const word = data.word;

      setCapturedWords((prev) => [
        ...prev,
        {
          id: word.id,
          originalText: word.originalText,
          translation: word.translation,
          category: word.category,
          audioUrl: word.audioUrl,
        },
      ]);

      setInputValue("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsCapturing(false);
    }
  };

  const handleContinue = async () => {
    // Mark onboarding as complete and go to celebration
    router.push("/onboarding/complete");
  };

  const canContinue = capturedWords.length >= minWords;

  return (
    <div
      className="min-h-screen flex flex-col items-center px-4 sm:px-6 py-6 sm:py-12 overflow-y-auto"
      style={{ backgroundColor: "var(--surface-notebook)" }}
    >
      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-4 sm:mb-8">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: "var(--accent-nav)" }}
        />
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: "var(--accent-ribbon)" }}
        />
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: "var(--notebook-stitch)" }}
        />
      </div>

      {/* Card */}
      <div
        className="w-full max-w-[340px] sm:max-w-md rounded-lg p-4 sm:p-8"
        style={{
          backgroundColor: "var(--surface-page)",
          boxShadow: "var(--shadow-page)",
        }}
      >
        {/* Title */}
        <h1
          className="text-xl sm:text-2xl font-serif text-center mb-2"
          style={{ color: "var(--text-heading)" }}
        >
          Add your first words
        </h1>
        <p
          className="text-center mb-3 sm:mb-4 text-sm sm:text-base"
          style={{ color: "var(--text-muted)" }}
        >
          What words have you seen or heard recently?
          <br />
          <span className="text-xs">
            From a sign, menu, conversation, message...
          </span>
        </p>

        {/* Progress indicator - shows count and minimum */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div
            className="py-2 px-4 rounded-full inline-flex items-center gap-2"
            style={{
              backgroundColor: capturedWords.length >= minWords
                ? "var(--accent-nav-light)"
                : "var(--surface-page-aged)",
            }}
          >
          <span
            className="text-2xl font-bold"
            style={{
              color: capturedWords.length >= minWords
                ? "var(--accent-nav)"
                : "var(--text-heading)",
            }}
          >
            {capturedWords.length}
          </span>
          <span
            className="text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            {capturedWords.length >= minWords
              ? "words added"
              : `of ${minWords} minimum`}
          </span>
          {capturedWords.length >= minWords && (
            <Check className="h-4 w-4" style={{ color: "var(--accent-nav)" }} />
          )}
          </div>
        </div>

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

        {/* Input */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isCapturing) {
                handleCapture();
              }
            }}
            placeholder="Type a word or phrase..."
            disabled={isCapturing}
            className="flex-1 px-4 py-3 rounded-lg border-2 outline-none transition-colors"
            style={{
              backgroundColor: "var(--surface-page-aged)",
              borderColor: "transparent",
              color: "var(--text-heading)",
            }}
            autoFocus
          />
          <button
            onClick={handleCapture}
            disabled={isCapturing || !inputValue.trim()}
            className="px-4 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
            style={{
              backgroundColor: "var(--accent-ribbon)",
              color: "var(--text-on-ribbon)",
            }}
          >
            {isCapturing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Plus className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Category hint */}
        {categoryHint && (
          <p
            className="text-xs text-center mb-4 flex items-center justify-center gap-1"
            style={{ color: "var(--accent-nav)" }}
          >
            <Sparkles className="h-3 w-3" />
            {categoryHint}
          </p>
        )}

        {/* Captured words list */}
        {capturedWords.length > 0 && (
          <div className="space-y-2 mb-6">
            {capturedWords.map((word) => (
              <div
                key={word.id}
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{ backgroundColor: "var(--surface-page-aged)" }}
              >
                <Check
                  className="h-4 w-4 shrink-0"
                  style={{ color: "var(--accent-nav)" }}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className="font-medium truncate"
                    style={{ color: "var(--text-heading)" }}
                  >
                    {word.originalText}
                  </p>
                  <p
                    className="text-sm truncate"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {word.translation}
                  </p>
                </div>
                <span
                  className="text-xs px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: "var(--accent-nav-light)",
                    color: "var(--accent-nav)",
                  }}
                >
                  {word.category}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        {canContinue ? (
          <div className="space-y-3">
            {/* Encouragement message */}
            <p
              className="text-center text-sm flex items-center justify-center gap-1"
              style={{ color: "var(--accent-nav)" }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              The more you add, the better your practice sessions!
            </p>

            {/* Dual buttons when minimum reached */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  // Focus the input to add more
                  const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                  input?.focus();
                }}
                className="flex-1 py-3 rounded-lg font-medium transition-all duration-200"
                style={{
                  backgroundColor: "var(--surface-page-aged)",
                  color: "var(--text-heading)",
                  border: "2px solid var(--accent-nav)",
                }}
              >
                <Plus className="h-4 w-4 inline mr-1" />
                Add more
              </button>
              <button
                onClick={handleContinue}
                className="flex-1 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-1"
                style={{
                  backgroundColor: "var(--accent-ribbon)",
                  color: "var(--text-on-ribbon)",
                }}
              >
                I&apos;m done
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            disabled
            className="w-full py-3 rounded-lg font-medium opacity-50"
            style={{
              backgroundColor: "var(--notebook-stitch)",
              color: "var(--text-muted)",
            }}
          >
            Add {minWords - capturedWords.length} more word{minWords - capturedWords.length > 1 ? "s" : ""} to continue
          </button>
        )}
      </div>
    </div>
  );
}
