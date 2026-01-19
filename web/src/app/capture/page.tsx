"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PhraseInput } from "@/components/capture";
import { InfoButton } from "@/components/brand";
import { PenLine, X } from "lucide-react";
import { useWordsStore, useUIStore } from "@/lib/store";

export default function CapturePage() {
  const router = useRouter();
  const [phrase, setPhrase] = useState("");
  const { captureWord, isLoading } = useWordsStore();
  const { showToast } = useUIStore();

  const handleSave = async () => {
    if (!phrase.trim()) return;

    try {
      // Language direction is determined by user's profile settings
      // (set during onboarding) - no need to pass explicit languages
      await captureWord(phrase.trim());
      showToast("Phrase captured successfully!", "success");
      setPhrase("");
      router.push("/");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to capture phrase",
        "error"
      );
    }
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Dark overlay with close button */}
      <div
        className="flex-1 relative"
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 100%)",
        }}
        onClick={handleClose}
        aria-label="Close capture"
      >
        {/* Top bar with close and brand */}
        <div className="flex justify-between items-center p-4">
          <button
            onClick={handleClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
          <InfoButton />
        </div>
      </div>

      {/* Bottom sheet modal - styled like a notebook page */}
      <div
        className="rounded-t-3xl relative"
        style={{
          backgroundColor: "var(--surface-page)",
          boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.15), 0 -2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div
            className="h-1.5 w-14 rounded-full"
            style={{ backgroundColor: "var(--border)" }}
          />
        </div>

        {/* Binding edge accent at top */}
        <div
          className="absolute top-0 left-6 right-6 h-1 rounded-b-full"
          style={{ backgroundColor: "var(--accent-ribbon)" }}
        />

        <div className="px-6 pb-8 pt-2">
          {/* Header with icon */}
          <div className="mb-6 flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-xl"
              style={{
                backgroundColor: "var(--accent-ribbon)",
                boxShadow: "0 4px 12px rgba(232, 92, 74, 0.3)",
              }}
            >
              <PenLine className="h-7 w-7 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h1
                className="text-3xl heading-serif ink-text"
                style={{ color: "var(--text-heading)" }}
              >
                Quick Capture
              </h1>
              <p
                className="text-sm handwritten"
                style={{ color: "var(--text-muted)" }}
              >
                Add a phrase you want to remember
              </p>
            </div>
          </div>

          {/* Input with ruled lines */}
          <div
            className="mb-6 relative rounded-xl p-4"
            style={{
              backgroundColor: "var(--surface-page-aged)",
              boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.04)",
              border: "1px solid var(--border)",
            }}
          >
            {/* Ruled lines background */}
            <div
              className="absolute inset-0 rounded-xl pointer-events-none opacity-50 dark:opacity-20"
              style={{
                backgroundImage: "repeating-linear-gradient(to bottom, transparent 0px, transparent 27px, var(--notebook-ruling) 27px, var(--notebook-ruling) 28px)",
                backgroundPosition: "0 12px",
              }}
            />
            <PhraseInput
              value={phrase}
              onChange={setPhrase}
              placeholder="Type or paste a phrase..."
            />
          </div>

          {/* Save button - styled as ribbon tab */}
          <button
            onClick={handleSave}
            disabled={!phrase.trim() || isLoading}
            className="group relative w-full py-5 text-lg font-semibold rounded-r-xl rounded-l-none text-white transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            style={{
              backgroundColor: "var(--accent-ribbon)",
              boxShadow: "0 4px 12px rgba(232, 92, 74, 0.3)",
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = "var(--accent-ribbon-hover)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(232, 92, 74, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--accent-ribbon)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(232, 92, 74, 0.3)";
            }}
          >
            {/* Binding edge */}
            <div
              className="absolute left-0 top-0 bottom-0 w-5 rounded-l-sm"
              style={{
                background: "linear-gradient(90deg, #C04A3C 0%, #D94E3E 100%)",
              }}
            />
            <div
              className="absolute left-2 top-3 bottom-3 w-0.5"
              style={{
                backgroundImage: "repeating-linear-gradient(to bottom, transparent 0px, transparent 6px, rgba(255,255,255,0.3) 6px, rgba(255,255,255,0.3) 10px)",
              }}
            />
            <span className="relative z-10 text-xl">
              {isLoading ? "Capturing..." : "Save to Notebook"}
            </span>
          </button>

          {/* Helper text */}
          <p
            className="mt-5 text-center text-sm handwritten"
            style={{ color: "var(--text-muted)" }}
          >
            You can add translation and context later
          </p>
        </div>

        {/* Safe area for iOS */}
        <div className="h-safe-area-inset-bottom" />
      </div>
    </div>
  );
}
