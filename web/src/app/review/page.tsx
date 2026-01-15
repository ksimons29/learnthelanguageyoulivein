"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  ReviewHeader,
  SentenceCard,
  GradingButtons,
  FeedbackCard,
  MasteryModal,
} from "@/components/review";

// Mock data - will be replaced with real data
const mockReviewItems = [
  {
    id: "1",
    sentence: "Vou verificar com o cliente e depois posso ajudar você.",
    translation: "I'll check with the client and then I can help you.",
    highlightedWords: ["verificar", "ajudar"],
    wordsProgress: [
      { word: "verificar", current: 2, total: 3 },
      { word: "ajudar", current: 1, total: 3 },
    ],
  },
  {
    id: "2",
    sentence: "Como posso ajudar com o problema?",
    translation: "How can I help with the problem?",
    highlightedWords: ["ajudar", "problema"],
    wordsProgress: [
      { word: "ajudar", current: 1, total: 3 },
      { word: "problema", current: 0, total: 3 },
    ],
  },
];

type ReviewState = "recall" | "revealed" | "feedback";
type Rating = "hard" | "good" | "easy";

export default function ReviewPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [state, setState] = useState<ReviewState>("recall");
  const [lastRating, setLastRating] = useState<Rating | null>(null);
  const [showMastery, setShowMastery] = useState(false);
  const [masteredPhrase, setMasteredPhrase] = useState("");

  const currentItem = mockReviewItems[currentIndex];
  const isLastItem = currentIndex === mockReviewItems.length - 1;

  const handleClose = () => {
    router.push("/");
  };

  const handleReveal = () => {
    setState("revealed");
  };

  const handleGrade = (rating: Rating) => {
    setLastRating(rating);
    setState("feedback");

    // Check if any word reached mastery (mock logic)
    if (rating === "easy" && Math.random() > 0.7) {
      setMasteredPhrase(currentItem.highlightedWords[0]);
      setShowMastery(true);
    }
  };

  const handleContinue = () => {
    if (isLastItem) {
      router.push("/review/complete");
    } else {
      setCurrentIndex(currentIndex + 1);
      setState("recall");
      setLastRating(null);
    }
  };

  const handleMasteryContinue = () => {
    setShowMastery(false);
    handleContinue();
  };

  const getFeedbackMessage = () => {
    switch (lastRating) {
      case "easy":
        return "Good recall!";
      case "good":
        return "Nice work!";
      case "hard":
        return "Keep practicing!";
      default:
        return "";
    }
  };

  const getNextReviewText = () => {
    switch (lastRating) {
      case "easy":
        return "You'll see this again in 4 days";
      case "good":
        return "You'll see this again in 2 days";
      case "hard":
        return "You'll see this again tomorrow";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen notebook-bg relative">
      {/* Ribbon bookmark */}
      <div className="ribbon-bookmark" />

      <div className="mx-auto max-w-md px-5 py-4">
      {/* Header */}
      <ReviewHeader
        current={currentIndex + 1}
        total={mockReviewItems.length}
        onClose={handleClose}
      />

      {/* Progress bar */}
      <div
        className="mt-4 h-1 w-full rounded-full"
        style={{ backgroundColor: "var(--accent-nav-light)" }}
      >
        <div
          className="h-1 rounded-full transition-all duration-300"
          style={{
            backgroundColor: "var(--accent-nav)",
            width: `${((currentIndex + 1) / mockReviewItems.length) * 100}%`,
          }}
        />
      </div>

      {/* Mixed Practice Badge */}
      <div className="mt-4 flex justify-center">
        <Badge
          className="text-white"
          style={{ backgroundColor: "var(--accent-nav)" }}
        >
          MIXED PRACTICE
        </Badge>
      </div>

      {/* Content */}
      <div className="mt-6 space-y-4">
        {/* Feedback Card (shown after grading) */}
        {state === "feedback" && lastRating && (
          <FeedbackCard
            type={lastRating === "hard" ? "hard" : "success"}
            message={getFeedbackMessage()}
            nextReviewText={getNextReviewText()}
          />
        )}

        {/* Sentence Card */}
        <SentenceCard
          sentence={currentItem.sentence}
          highlightedWords={currentItem.highlightedWords}
          translation={currentItem.translation}
          showTranslation={state !== "recall"}
          onPlayAudio={() => console.log("Play audio")}
        />

        {/* Words Progress (shown after feedback) */}
        {state === "feedback" && (
          <div
            className="text-center text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            <span>Words practiced: </span>
            {currentItem.wordsProgress.map((wp, index) => (
              <span
                key={wp.word}
                className="font-medium"
                style={{ color: "var(--accent-nav)" }}
              >
                {wp.word} ({wp.current}/{wp.total})
                {index < currentItem.wordsProgress.length - 1 && " | "}
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        {state === "recall" && (
          <button
            onClick={handleReveal}
            className="w-full py-6 text-lg font-semibold rounded-lg text-white transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
            style={{ backgroundColor: "var(--accent-ribbon)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                "var(--accent-ribbon-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--accent-ribbon)";
            }}
          >
            Reveal
          </button>
        )}

        {state === "revealed" && <GradingButtons onGrade={handleGrade} />}

        {state === "feedback" && (
          <button
            onClick={handleContinue}
            className="w-full py-6 text-lg font-semibold rounded-lg text-white transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
            style={{ backgroundColor: "var(--accent-nav)" }}
          >
            Continue
          </button>
        )}

        {/* Mastery Progress */}
        {state !== "feedback" && (
          <p
            className="text-center text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            Today: {currentIndex + 1} of 3 correct
          </p>
        )}

        {/* Report Issue */}
        <button
          className="flex w-full items-center justify-center gap-2 rounded-lg border py-3 text-sm transition-colors"
          style={{
            borderColor: "var(--notebook-stitch)",
            backgroundColor: "var(--surface-page)",
            color: "var(--text-muted)",
          }}
        >
          <AlertTriangle
            className="h-4 w-4"
            style={{ color: "var(--state-good)" }}
          />
          Report sentence issue
        </button>

        {/* Mode indicator */}
        <div
          className="flex items-center justify-center gap-2 text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          <Lightbulb className="h-3 w-3" />
          Mixing 2 due words per sentence
        </div>
      </div>

      {/* Mastery Modal */}
      {showMastery && (
        <MasteryModal
          phrase={masteredPhrase}
          onContinue={handleMasteryContinue}
        />
      )}
      </div>
    </div>
  );
}
