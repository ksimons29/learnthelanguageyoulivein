"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, HelpCircle, Lightbulb, Loader2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  ReviewHeader,
  SentenceCard,
  GradingButtons,
  FeedbackCard,
  MasteryModal,
  FillBlankInput,
  MultipleChoiceOptions,
  AnswerFeedback,
} from "@/components/review";
import { useReviewStore } from "@/lib/store/review-store";
import { useAuthStore } from "@/lib/store/auth-store";
import { useGamificationStore } from "@/lib/store/gamification-store";
import { useAudioPlayer } from "@/lib/hooks";
import { preloadSessionAudio } from "@/lib/audio/preload";
import { setupAutoSync } from "@/lib/offline";
import {
  determineExerciseType,
  selectWordToBlank,
} from "@/lib/sentences/exercise-type";
import {
  prepareMultipleChoiceOptions,
  getNativeLanguageText,
  getTargetLanguageText,
  type MultipleChoiceOption,
} from "@/lib/review/distractors";
import type { Word } from "@/lib/db/schema";
import {
  hasMemoryContext,
  formatMemoryContextShort,
  getSituationTag,
} from "@/lib/config/memory-context";
import { MapPin } from "lucide-react";

type Rating = "hard" | "good" | "easy";

export default function ReviewPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const { emitItemAnswered } = useGamificationStore();
  const {
    sessionId,
    dueWords,
    currentIndex,
    reviewState,
    lastRating,
    lastNextReviewText,
    lastMasteryAchieved,
    wordsReviewed,
    isLoading,
    error,
    startSession,
    submitReview,
    setReviewState,
    setCurrentIndex,
    resetSession,
    // Sentence mode state
    reviewMode,
    currentSentence,
    sentenceTargetWords,
    fetchNextSentence,
    submitSentenceReview,
    // Language preferences for exercise generation
    nativeLanguage,
    targetLanguage,
  } = useReviewStore();

  const [showMastery, setShowMastery] = useState(false);
  const [masteredPhrase, setMasteredPhrase] = useState("");

  // Sentence exercise state
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  // Word mode active recall state
  const [wordModeAnswerCorrect, setWordModeAnswerCorrect] = useState<boolean | null>(null);
  const [multipleChoiceOptions, setMultipleChoiceOptions] = useState<
    MultipleChoiceOption[]
  >([]);
  const [correctOptionId, setCorrectOptionId] = useState<string>("");
  const [isLoadingDistractors, setIsLoadingDistractors] = useState(false);

  // Audio player for current word/sentence
  const currentWord = dueWords[currentIndex];
  const { isPlaying, isLoading: audioLoading, play, stop } = useAudioPlayer();

  // Determine exercise type and focus word for sentence mode
  // IMPORTANT: focusWord is the single word being tested in this exercise
  // It's used for:
  // - Blanking the word in fill_blank exercises
  // - Loading distractors in multiple_choice exercises
  // - Highlighting only the focus word (not all target words)
  const exerciseType =
    reviewMode === "sentence" && sentenceTargetWords.length > 0
      ? determineExerciseType(sentenceTargetWords)
      : "type_translation";

  // Focus word: the word with lowest mastery (most practice needed)
  // This ensures we're always testing the word that needs the most attention
  // FIX for Issue #61 & #62: Use selectWordToBlank for BOTH fill_blank AND multiple_choice
  const focusWord =
    reviewMode === "sentence" && sentenceTargetWords.length > 0
      ? selectWordToBlank(sentenceTargetWords)
      : null;

  // For fill_blank, blankedWord === focusWord
  // For multiple_choice, we still need focusWord for loading correct distractors
  const blankedWord = exerciseType === "fill_blank" ? focusWord : null;

  // Load distractors for multiple choice
  // IMPORTANT: nativeLanguage ensures all options are in the user's native language
  const loadDistractors = useCallback(async (targetWord: Word) => {
    setIsLoadingDistractors(true);
    try {
      const { options, correctOptionId: correctId } =
        await prepareMultipleChoiceOptions(targetWord, nativeLanguage);
      setMultipleChoiceOptions(options);
      setCorrectOptionId(correctId);
    } catch (err) {
      console.error("Failed to load distractors:", err);
      setMultipleChoiceOptions([]);
    } finally {
      setIsLoadingDistractors(false);
    }
  }, [nativeLanguage]);

  // Setup offline auto-sync on mount
  useEffect(() => {
    setupAutoSync();
  }, []);

  // Initialize session on mount
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/sign-in");
      return;
    }

    if (user && !sessionId && !isLoading) {
      startSession()
        .then(async () => {
          // Preload audio for offline access
          const store = useReviewStore.getState();
          if (store.dueWords.length > 0) {
            preloadSessionAudio(store.dueWords).catch((err) => {
              console.warn("Failed to preload audio:", err);
            });
          }

          // Try sentence mode first after session starts
          const hasSentence = await fetchNextSentence();
          if (hasSentence) {
            // Will load distractors in separate effect when sentenceTargetWords updates
          }
        })
        .catch((err) => {
          console.error("Failed to start session:", err);
        });
    }
  }, [user, authLoading, sessionId, isLoading, startSession, fetchNextSentence, router]);

  // Load distractors when we have a multiple choice sentence
  // FIX for Issue #61 & #62: Use focusWord instead of sentenceTargetWords[0]
  // This ensures options are generated for the word that is actually highlighted
  useEffect(() => {
    if (
      reviewMode === "sentence" &&
      focusWord &&
      exerciseType === "multiple_choice"
    ) {
      loadDistractors(focusWord);
    }
  }, [reviewMode, focusWord, exerciseType, loadDistractors]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  // Reset exercise state when moving to next item
  const resetExerciseState = () => {
    // Sentence mode state
    setIsAnswerCorrect(null);
    setSelectedOptionId(null);
    setMultipleChoiceOptions([]);
    setCorrectOptionId("");
    // Word mode state
    setWordModeAnswerCorrect(null);
  };

  const handleClose = () => {
    resetSession();
    router.push("/");
  };

  const handleReveal = () => {
    setReviewState("revealed");
  };

  // Handle fill-in-the-blank answer submission (sentence mode)
  const handleFillBlankSubmit = (userAnswer: string, isCorrect: boolean) => {
    setIsAnswerCorrect(isCorrect);
  };

  // Handle word mode active recall submission
  const handleWordModeRecallSubmit = (userAnswer: string, isCorrect: boolean) => {
    setWordModeAnswerCorrect(isCorrect);
  };

  // Handle multiple choice selection
  const handleMultipleChoiceSelect = (
    selectedId: string,
    isCorrect: boolean
  ) => {
    setSelectedOptionId(selectedId);
    setIsAnswerCorrect(isCorrect);
  };

  // Proceed to grading after answering
  const handleProceedToGrading = () => {
    setReviewState("revealed");
  };

  // Handle grading for word mode
  const handleGrade = async (rating: Rating) => {
    if (!currentWord || !sessionId) return;

    const ratingMap: Record<Rating, 1 | 2 | 3 | 4> = {
      hard: 2,
      good: 3,
      easy: 4,
    };

    const numericRating = ratingMap[rating];

    try {
      await submitReview(currentWord.id, numericRating);
      setReviewState("feedback");

      // Emit gamification event
      await emitItemAnswered({
        wordId: currentWord.id,
        rating: numericRating,
        exerciseType: "type_translation",
        category: currentWord.category,
      });

      if (lastMasteryAchieved) {
        setMasteredPhrase(currentWord.originalText);
        setShowMastery(true);
      }
    } catch (err) {
      console.error("Failed to submit review:", err);
    }
  };

  // Handle grading for sentence mode
  const handleSentenceGrade = async (rating: Rating) => {
    if (!sessionId || sentenceTargetWords.length === 0) return;

    const ratingMap: Record<Rating, 1 | 2 | 3 | 4> = {
      hard: 2,
      good: 3,
      easy: 4,
    };

    const numericRating = ratingMap[rating];

    try {
      await submitSentenceReview(numericRating);
      setReviewState("feedback");

      // Emit gamification events for all words in the sentence
      for (const word of sentenceTargetWords) {
        await emitItemAnswered({
          wordId: word.id,
          rating: numericRating,
          exerciseType,
          category: word.category,
        });
      }
    } catch (err) {
      console.error("Failed to submit sentence review:", err);
    }
  };

  const handleContinue = async () => {
    resetExerciseState();

    // Try to get next sentence
    const hasSentence = await fetchNextSentence();
    if (hasSentence) {
      setReviewState("recall");
      return;
    }

    // No more sentences, continue with word mode
    const isLastItem = currentIndex >= dueWords.length - 1;

    if (isLastItem) {
      router.push("/review/complete");
    } else {
      setCurrentIndex(currentIndex + 1);
      setReviewState("recall");
    }
  };

  const handleMasteryContinue = () => {
    setShowMastery(false);
    handleContinue();
  };

  const handlePlayAudio = () => {
    const audioUrl =
      reviewMode === "sentence" && currentSentence
        ? currentSentence.audioUrl
        : currentWord?.audioUrl;

    if (audioUrl) {
      if (isPlaying) {
        stop();
      } else {
        play(audioUrl);
      }
    }
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

  // Calculate total items (sentences count as 1 item each)
  const totalItems = dueWords.length;
  const currentPosition =
    reviewMode === "sentence" ? wordsReviewed + 1 : currentIndex + 1;

  // Loading state
  if (authLoading || (isLoading && !dueWords.length)) {
    return (
      <div className="min-h-screen notebook-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2
            className="h-8 w-8 animate-spin"
            style={{ color: "var(--accent-nav)" }}
          />
          <p style={{ color: "var(--text-muted)" }}>Loading review session...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen notebook-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <AlertTriangle
            className="h-12 w-12"
            style={{ color: "var(--state-hard)" }}
          />
          <p style={{ color: "var(--text-heading)" }}>Failed to load review</p>
          <p style={{ color: "var(--text-muted)" }}>{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 rounded-lg text-white"
            style={{ backgroundColor: "var(--accent-nav)" }}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // No words due - only show when user is authenticated and session loaded
  if (!dueWords.length && user && sessionId) {
    return (
      <div className="min-h-screen notebook-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <div
            className="h-16 w-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "var(--state-easy)" }}
          >
            <span className="text-2xl">🎉</span>
          </div>
          <p
            className="text-xl font-semibold"
            style={{ color: "var(--text-heading)" }}
          >
            All caught up!
          </p>
          <p style={{ color: "var(--text-muted)" }}>
            No words due for review right now.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 rounded-lg text-white font-medium"
            style={{ backgroundColor: "var(--accent-nav)" }}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // ========== SENTENCE MODE RENDER ==========
  if (reviewMode === "sentence" && currentSentence) {
    return (
      <div className="min-h-screen notebook-bg relative">
        <div className="ribbon-bookmark" />
        <div className="elastic-band fixed top-0 bottom-0 right-0 w-8 pointer-events-none z-30" />

        <div className="mx-auto max-w-md px-5 py-4">
          <ReviewHeader
            current={currentPosition}
            total={totalItems}
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
                width: `${(currentPosition / totalItems) * 100}%`,
              }}
            />
          </div>

          {/* Sentence Review Badge */}
          <div className="mt-4 flex justify-center">
            <Badge
              className="text-white"
              style={{ backgroundColor: "var(--accent-ribbon)" }}
            >
              SENTENCE REVIEW
            </Badge>
          </div>

          {/* Content */}
          <div className="mt-6 space-y-4">
            {/* Feedback Card (shown after grading) */}
            {reviewState === "feedback" && lastRating && (
              <FeedbackCard
                type={lastRating === "hard" ? "hard" : "success"}
                message={getFeedbackMessage()}
                nextReviewText={lastNextReviewText || "Soon"}
              />
            )}

            {/* Sentence Card */}
            {/* FIX for Issue #61 & #62: Only highlight the focus word, not all target words */}
            {/* This makes it clear which word the user is being tested on */}
            <SentenceCard
              sentence={currentSentence.text}
              highlightedWords={focusWord
                ? [getTargetLanguageText(focusWord, targetLanguage)]
                : []
              }
              translation={
                currentSentence.translation ||
                sentenceTargetWords
                  .map((w) => {
                    const targetText = getTargetLanguageText(w, targetLanguage);
                    const nativeText = getNativeLanguageText(w, nativeLanguage);
                    return `${targetText}: ${nativeText}`;
                  })
                  .join(" | ")
              }
              showTranslation={
                reviewState !== "recall" || isAnswerCorrect !== null
              }
              onPlayAudio={currentSentence.audioUrl ? handlePlayAudio : undefined}
              isPlayingAudio={isPlaying}
              isLoadingAudio={audioLoading}
              exerciseType={exerciseType}
              blankedWord={blankedWord ? getTargetLanguageText(blankedWord, targetLanguage) : undefined}
            >
              {/* Fill-in-the-blank input */}
              {exerciseType === "fill_blank" &&
                reviewState === "recall" &&
                blankedWord &&
                isAnswerCorrect === null && (
                  <FillBlankInput
                    correctAnswer={getTargetLanguageText(blankedWord, targetLanguage)}
                    onSubmit={handleFillBlankSubmit}
                  />
                )}

              {/* Multiple choice options */}
              {exerciseType === "multiple_choice" &&
                reviewState === "recall" &&
                !isLoadingDistractors &&
                multipleChoiceOptions.length > 0 && (
                  <MultipleChoiceOptions
                    options={multipleChoiceOptions}
                    correctOptionId={correctOptionId}
                    onSelect={handleMultipleChoiceSelect}
                    disabled={selectedOptionId !== null}
                    selectedId={selectedOptionId}
                  />
                )}

              {/* Loading distractors */}
              {exerciseType === "multiple_choice" &&
                reviewState === "recall" &&
                isLoadingDistractors && (
                  <div className="mt-4 flex justify-center">
                    <Loader2
                      className="h-6 w-6 animate-spin"
                      style={{ color: "var(--accent-nav)" }}
                    />
                  </div>
                )}
            </SentenceCard>

            {/* Answer Feedback (shown after answering, before grading) */}
            {/* FIX for Issue #61 & #62: Use focusWord for correct answer display */}
            {isAnswerCorrect !== null && reviewState === "recall" && (
              <AnswerFeedback
                isCorrect={isAnswerCorrect}
                correctAnswer={
                  !isAnswerCorrect && focusWord
                    ? getNativeLanguageText(focusWord, nativeLanguage)
                    : undefined
                }
              />
            )}

            {/* Proceed to grading button (after answering exercises) */}
            {isAnswerCorrect !== null && reviewState === "recall" && (
              <button
                onClick={handleProceedToGrading}
                className="w-full py-4 text-lg font-semibold rounded-lg text-white transition-all hover:shadow-md"
                style={{ backgroundColor: "var(--accent-nav)" }}
              >
                Rate Your Recall
              </button>
            )}

            {/* Reveal button for type_translation */}
            {exerciseType === "type_translation" && reviewState === "recall" && (
              <button
                onClick={handleReveal}
                className="w-full py-6 text-lg font-semibold rounded-lg text-white transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                style={{ backgroundColor: "var(--accent-ribbon)" }}
              >
                Reveal
              </button>
            )}

            {/* Grading buttons */}
            {reviewState === "revealed" && (
              <GradingButtons
                onGrade={handleSentenceGrade}
                disabled={isLoading}
                suggestedGrade={isAnswerCorrect === false ? "hard" : undefined}
              />
            )}

            {/* Continue button */}
            {reviewState === "feedback" && (
              <button
                onClick={handleContinue}
                className="w-full py-6 text-lg font-semibold rounded-lg text-white transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                style={{ backgroundColor: "var(--accent-nav)" }}
              >
                Continue
              </button>
            )}

            {/* Words in this sentence */}
            {reviewState !== "feedback" && (
              <p
                className="text-center text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                {sentenceTargetWords.length} words in this sentence
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
              Report issue with this sentence
            </button>

            {/* Info indicator */}
            <div
              className="flex items-center justify-center gap-2 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              <Lightbulb className="h-3 w-3" />
              Learning multiple words in context
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

  // ========== WORD MODE RENDER (Default) ==========
  return (
    <div className="min-h-screen notebook-bg relative">
      <div className="ribbon-bookmark" />
      <div className="elastic-band fixed top-0 bottom-0 right-0 w-8 pointer-events-none z-30" />

      <div className="mx-auto max-w-md px-5 py-4">
        <ReviewHeader
          current={currentIndex + 1}
          total={dueWords.length}
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
              width: `${((currentIndex + 1) / dueWords.length) * 100}%`,
            }}
          />
        </div>

        {/* Review Badge */}
        <div className="mt-4 flex justify-center">
          <Badge
            className="text-white"
            style={{ backgroundColor: "var(--accent-nav)" }}
          >
            REVIEW SESSION
          </Badge>
        </div>

        {/* Content */}
        <div className="mt-6 space-y-4">
          {/* Feedback Card */}
          {reviewState === "feedback" && lastRating && (
            <FeedbackCard
              type={lastRating === "hard" ? "hard" : "success"}
              message={getFeedbackMessage()}
              nextReviewText={lastNextReviewText || "Soon"}
            />
          )}

          {/* Word Card */}
          {/* FIX for Issue #68: Display TARGET language (what user is learning), expect NATIVE language answer */}
          {/* This ensures consistent behavior regardless of capture direction (target→native or native→target) */}
          {currentWord && (
            <SentenceCard
              sentence={getTargetLanguageText(currentWord, targetLanguage)}
              highlightedWords={[]}
              translation={getNativeLanguageText(currentWord, nativeLanguage)}
              showTranslation={reviewState !== "recall"}
              onPlayAudio={handlePlayAudio}
              isPlayingAudio={isPlaying}
              isLoadingAudio={audioLoading}
            />
          )}

          {/* Context Hint - shown after reveal if word has context */}
          {currentWord &&
            reviewState !== "recall" &&
            hasMemoryContext(currentWord) && (
              <div
                className="flex items-center gap-2 p-3 rounded-lg"
                style={{
                  backgroundColor: "var(--accent-nav-light)",
                  borderLeft: "3px solid var(--accent-nav)",
                }}
              >
                <MapPin
                  className="h-4 w-4 shrink-0"
                  style={{ color: "var(--accent-nav)" }}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className="text-xs font-medium"
                    style={{ color: "var(--accent-nav)" }}
                  >
                    Remember:
                  </p>
                  <p
                    className="text-sm truncate"
                    style={{ color: "var(--text-body)" }}
                  >
                    {formatMemoryContextShort(currentWord)}
                    {currentWord.situationTags &&
                      currentWord.situationTags.length > 0 && (
                        <span>
                          {formatMemoryContextShort(currentWord) ? " · " : ""}
                          {currentWord.situationTags
                            .map((tagId) => getSituationTag(tagId)?.label)
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      )}
                  </p>
                </div>
              </div>
            )}

          {/* Mastery Progress */}
          {reviewState === "feedback" && currentWord && (
            <Link
              href="/science#mastery"
              className="flex items-center justify-center gap-1.5 text-sm transition-opacity hover:opacity-80"
              style={{ color: "var(--text-muted)" }}
            >
              <span>Progress: </span>
              <span
                className="font-medium"
                style={{ color: "var(--accent-nav)" }}
              >
                {currentWord.consecutiveCorrectSessions || 0}/3
              </span>
              {currentWord.masteryStatus === "ready_to_use" ? (
                <span
                  className="ml-1 px-2 py-0.5 rounded-full text-xs"
                  style={{
                    backgroundColor: "var(--state-easy)",
                    color: "white",
                  }}
                >
                  Mastered!
                </span>
              ) : (
                <HelpCircle
                  className="h-3.5 w-3.5 ml-0.5"
                  style={{ color: "var(--text-muted)" }}
                />
              )}
            </Link>
          )}

          {/* Active Recall Input */}
          {reviewState === "recall" && wordModeAnswerCorrect === null && currentWord && (
            <FillBlankInput
              correctAnswer={getNativeLanguageText(currentWord, nativeLanguage)}
              onSubmit={handleWordModeRecallSubmit}
              autoFocus={true}
            />
          )}

          {/* Answer Feedback for word mode */}
          {/* FIX for Issue #69: Add null check to prevent crash when closing review mid-session */}
          {reviewState === "recall" && wordModeAnswerCorrect !== null && currentWord && (
            <AnswerFeedback
              isCorrect={wordModeAnswerCorrect}
              correctAnswer={getNativeLanguageText(currentWord, nativeLanguage)}
            />
          )}

          {/* Proceed to grading button (after answering) */}
          {/* FIX for Issue #69: Add null check to prevent crash when closing review mid-session */}
          {reviewState === "recall" && wordModeAnswerCorrect !== null && currentWord && (
            <button
              onClick={handleReveal}
              className="w-full py-3 mt-2 text-base font-semibold rounded-lg text-white transition-all hover:shadow-md"
              style={{ backgroundColor: "var(--accent-nav)" }}
            >
              Rate Your Recall
            </button>
          )}

          {/* Grading buttons */}
          {reviewState === "revealed" && (
            <GradingButtons onGrade={handleGrade} disabled={isLoading} />
          )}

          {reviewState === "feedback" && (
            <button
              onClick={handleContinue}
              className="w-full py-6 text-lg font-semibold rounded-lg text-white transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
              style={{ backgroundColor: "var(--accent-nav)" }}
            >
              {currentIndex >= dueWords.length - 1 ? "Finish" : "Continue"}
            </button>
          )}

          {/* Session Progress */}
          {reviewState !== "feedback" && (
            <p
              className="text-center text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              Reviewed: {wordsReviewed} of {dueWords.length}
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
            Report issue with this word
          </button>

          {/* Info indicator */}
          <div
            className="flex items-center justify-center gap-2 text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            <Lightbulb className="h-3 w-3" />
            FSRS spaced repetition - optimal timing for memory
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
