"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Volume2, Sparkles, ArrowRight, BookOpen, Cloud } from "lucide-react";
import { useAudioPlayer } from "@/lib/hooks";

interface StarterWord {
  id: string;
  originalText: string;
  translation: string;
  audioUrl?: string | null;
}

/**
 * Onboarding Complete Page
 *
 * Final step of onboarding - shows user their starter words.
 * Fetches words that were injected during language selection.
 * Marks onboarding as complete.
 */
export default function CompletePage() {
  const router = useRouter();
  const [starterWords, setStarterWords] = useState<StarterWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const { play, isPlaying } = useAudioPlayer();

  // Prevent double-execution in React Strict Mode
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    async function loadAndComplete() {
      try {
        // 1. Fetch user's words (starter words should already be there)
        const wordsResponse = await fetch("/api/words?limit=10");
        if (wordsResponse.ok) {
          const { data } = await wordsResponse.json();
          if (data?.words) {
            setStarterWords(data.words.slice(0, 6)); // Show up to 6
          }
        }

        // 2. Mark onboarding as complete
        await fetch("/api/onboarding/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
      } catch (err) {
        console.error("Error during completion:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadAndComplete();
  }, []);

  const handlePlayAudio = (word: StarterWord) => {
    if (word.audioUrl) {
      setPlayingId(word.id);
      play(word.audioUrl);
    }
  };

  const handleContinue = () => {
    router.push("/");
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6"
        style={{ backgroundColor: "var(--surface-notebook)" }}
      >
        <Loader2
          className="h-10 w-10 sm:h-12 sm:w-12 animate-spin mb-4"
          style={{ color: "var(--accent-nav)" }}
        />
        <p className="text-sm sm:text-base" style={{ color: "var(--text-muted)" }}>
          Preparing your notebook...
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center px-4 sm:px-6 py-6 sm:py-12 overflow-y-auto"
      style={{ backgroundColor: "var(--surface-notebook)" }}
    >
      {/* Progress indicator - 4 steps, step 4 active */}
      <div className="flex justify-center gap-2 mb-4 sm:mb-8">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: "var(--accent-nav)" }}
        />
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: "var(--accent-nav)" }}
        />
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: "var(--accent-nav)" }}
        />
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: "var(--accent-ribbon)" }}
        />
      </div>

      {/* Celebration icon */}
      <div
        className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-4 sm:mb-6"
        style={{ backgroundColor: "var(--accent-ribbon-light)" }}
      >
        <Sparkles
          className="h-6 w-6 sm:h-8 sm:w-8"
          style={{ color: "var(--accent-ribbon)" }}
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
          Your notebook is ready!
        </h1>

        <p
          className="text-center text-xs sm:text-sm mb-4 sm:mb-6"
          style={{ color: "var(--text-muted)" }}
        >
          {starterWords.length > 0
            ? "We've added 10 starter phrases – from everyday situations to local essentials you'll use right away."
            : "Start capturing phrases you hear in your daily life!"}
        </p>

        {/* Starter Words Grid */}
        {starterWords.length > 0 && (
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
            {starterWords.map((word) => (
              <button
                key={word.id}
                onClick={() => handlePlayAudio(word)}
                className="p-3 rounded-lg text-left transition-all duration-200 hover:scale-[1.02]"
                style={{
                  backgroundColor: "var(--surface-page-aged)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-medium text-sm truncate"
                      style={{ color: "var(--text-heading)" }}
                    >
                      {word.originalText}
                    </p>
                    <p
                      className="text-xs truncate mt-0.5"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {word.translation}
                    </p>
                  </div>
                  {word.audioUrl && (
                    <Volume2
                      className={`h-4 w-4 flex-shrink-0 ${
                        isPlaying && playingId === word.id ? "animate-pulse" : ""
                      }`}
                      style={{
                        color:
                          isPlaying && playingId === word.id
                            ? "var(--accent-ribbon)"
                            : "var(--text-muted)",
                      }}
                    />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No words state */}
        {starterWords.length === 0 && (
          <div
            className="p-6 rounded-lg mb-6 flex flex-col items-center"
            style={{ backgroundColor: "var(--surface-page-aged)" }}
          >
            <BookOpen
              className="h-12 w-12 mb-3"
              style={{ color: "var(--text-muted)" }}
            />
            <p
              className="text-center text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              Your notebook is empty. Capture your first phrase by tapping the +
              button on the home screen!
            </p>
          </div>
        )}

        {/* Explanation */}
        <p
          className="text-center text-xs sm:text-sm mb-4 sm:mb-6"
          style={{ color: "var(--text-muted)" }}
        >
          {starterWords.length > 0 ? (
            <>
              Tap any phrase to hear it spoken. During practice, we&apos;ll create
              sentences using <strong>your words</strong> to help you remember
              them.
            </>
          ) : (
            "The more phrases you add, the better your practice sessions will be!"
          )}
        </p>

        {/* Continue button */}
        <button
          onClick={handleContinue}
          className="w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-200"
          style={{
            backgroundColor: "var(--accent-ribbon)",
            color: "var(--text-on-ribbon)",
          }}
        >
          Start Learning <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Data safety assurance */}
      <div
        className="mt-4 sm:mt-6 flex items-center justify-center gap-2 text-[10px] sm:text-xs"
        style={{ color: "var(--text-muted)" }}
      >
        <Cloud className="w-3 h-3 sm:w-3.5 sm:h-3.5" style={{ color: "var(--accent-nav)" }} />
        <span>Your progress is safely synced to your account</span>
      </div>

      {/* Subtitle */}
      <p
        className="mt-2 sm:mt-3 mb-4 text-xs sm:text-sm text-center max-w-xs"
        style={{ color: "var(--text-muted)" }}
      >
        Welcome to LLYLI - your personal language notebook
      </p>
    </div>
  );
}
