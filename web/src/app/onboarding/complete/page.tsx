"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Volume2, Sparkles, ArrowRight } from "lucide-react";
import { useAudioPlayer } from "@/lib/hooks";

interface GeneratedSentence {
  id: string;
  text: string;
  audioUrl?: string;
  words: { originalText: string; translation: string }[];
}

/**
 * Onboarding Complete Page
 *
 * Step 3 of onboarding - celebrate with the first generated sentence.
 * Shows the user's words combined into a real sentence with audio.
 */
export default function CompletePage() {
  const router = useRouter();
  const [sentence, setSentence] = useState<GeneratedSentence | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { play, isPlaying, isLoading: audioLoading } = useAudioPlayer();

  useEffect(() => {
    generateFirstSentence();
  }, []);

  const generateFirstSentence = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // First, trigger sentence generation
      const generateResponse = await fetch("/api/sentences/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lookaheadDays: 1 }),
      });

      if (!generateResponse.ok) {
        // Sentence generation might fail if not enough same-category words
        // That's okay, we'll still complete onboarding
        console.warn("Sentence generation warning:", await generateResponse.text());
      }

      // Try to get a sentence
      let firstSentenceId: string | undefined;
      const nextResponse = await fetch("/api/sentences/next?sessionId=onboarding");

      if (nextResponse.ok) {
        const { data } = await nextResponse.json();
        if (data?.sentence) {
          firstSentenceId = data.sentence.id;
          setSentence({
            id: data.sentence.id,
            text: data.sentence.text,
            audioUrl: data.sentence.audioUrl,
            words: data.targetWords?.map((w: { originalText: string; translation: string }) => ({
              originalText: w.originalText,
              translation: w.translation,
            })) || [],
          });
        }
      }

      // Mark onboarding as complete
      await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstSentenceId,
        }),
      });
    } catch (err) {
      console.error("Error during completion:", err);
      setError("We had trouble generating your first sentence, but you're all set!");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = () => {
    if (sentence?.audioUrl) {
      play(sentence.audioUrl);
    }
  };

  const handleContinue = () => {
    router.push("/");
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6"
        style={{ backgroundColor: "var(--surface-notebook)" }}
      >
        <Loader2
          className="h-12 w-12 animate-spin mb-4"
          style={{ color: "var(--accent-nav)" }}
        />
        <p style={{ color: "var(--text-muted)" }}>
          Creating your first sentence...
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center px-6 py-12"
      style={{ backgroundColor: "var(--surface-notebook)" }}
    >
      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-8">
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
        className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: "var(--accent-ribbon-light)" }}
      >
        <Sparkles
          className="h-8 w-8"
          style={{ color: "var(--accent-ribbon)" }}
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
        {/* Title */}
        <h1
          className="text-2xl font-serif text-center mb-2"
          style={{ color: "var(--text-heading)" }}
        >
          {sentence ? "Your first sentence!" : "You're all set!"}
        </h1>

        {error && (
          <p
            className="text-center text-sm mb-4"
            style={{ color: "var(--text-muted)" }}
          >
            {error}
          </p>
        )}

        {sentence ? (
          <>
            {/* Sentence display */}
            <div
              className="p-6 rounded-lg mb-6"
              style={{ backgroundColor: "var(--surface-page-aged)" }}
            >
              <p
                className="text-xl font-serif text-center mb-4"
                style={{ color: "var(--text-heading)" }}
              >
                "{sentence.text}"
              </p>

              {/* Audio button */}
              {sentence.audioUrl && (
                <div className="flex justify-center">
                  <button
                    onClick={handlePlayAudio}
                    disabled={audioLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200"
                    style={{
                      backgroundColor: isPlaying
                        ? "var(--accent-nav)"
                        : "var(--accent-nav-light)",
                      color: isPlaying
                        ? "var(--text-on-binding)"
                        : "var(--accent-nav)",
                    }}
                  >
                    {audioLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">
                      {isPlaying ? "Playing..." : "Listen"}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Words used */}
            {sentence.words.length > 0 && (
              <div className="mb-6">
                <p
                  className="text-xs text-center mb-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  Made from your words:
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {sentence.words.map((word, i) => (
                    <span
                      key={i}
                      className="text-sm px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: "var(--accent-ribbon-light)",
                        color: "var(--accent-ribbon)",
                      }}
                    >
                      {word.originalText}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Explanation */}
            <p
              className="text-center text-sm mb-6"
              style={{ color: "var(--text-muted)" }}
            >
              Every review session will show you fresh sentences made from{" "}
              <strong>your words</strong>. This is how you'll truly remember
              them.
            </p>
          </>
        ) : (
          <p
            className="text-center mb-6"
            style={{ color: "var(--text-muted)" }}
          >
            We'll generate sentences from your words during review sessions.
            The more words you add, the better your sentences will be!
          </p>
        )}

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

      {/* Subtitle */}
      <p
        className="mt-6 text-sm text-center max-w-xs"
        style={{ color: "var(--text-muted)" }}
      >
        Welcome to LLYLI - your personal language notebook
      </p>
    </div>
  );
}
