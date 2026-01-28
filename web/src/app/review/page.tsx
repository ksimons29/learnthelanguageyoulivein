"use client";

import { Suspense, useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, HelpCircle, Lightbulb, Loader2 } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
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
  getNativeLanguageText,
  getTargetLanguageText,
} from "@/lib/review/distractors";
import type { AnswerEvaluation } from "@/lib/review/answer-evaluation";
import {
  hasMemoryContext,
  formatMemoryContextShort,
  getSituationTag,
} from "@/lib/config/memory-context";
import { MapPin } from "lucide-react";
import { useTour } from "@/lib/tours/hooks/use-tour";
import { registerReviewTour } from "@/lib/tours/tours/review-tour";
import { tourManager } from "@/lib/tours/tour-manager";

type Rating = "hard" | "good" | "easy";

function ReviewPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuthStore();
  const { emitItemAnswered } = useGamificationStore();

  // FIX for Issue #130: Use granular Zustand selectors to prevent unnecessary re-renders
  // Previously, destructuring 20+ properties caused re-render on ANY state change
  // Now, each selector group only triggers re-render when its specific state changes

  // Session state (stable during session)
  const { sessionId, dueWords, nativeLanguage, targetLanguage } = useReviewStore(
    useShallow((state) => ({
      sessionId: state.sessionId,
      dueWords: state.dueWords,
      nativeLanguage: state.nativeLanguage,
      targetLanguage: state.targetLanguage,
    }))
  );

  // Current item state (changes on each card transition)
  const { currentIndex, reviewMode, currentSentence, sentenceTargetWords, multipleChoiceOptions, correctOptionId } = useReviewStore(
    useShallow((state) => ({
      currentIndex: state.currentIndex,
      reviewMode: state.reviewMode,
      currentSentence: state.currentSentence,
      sentenceTargetWords: state.sentenceTargetWords,
      multipleChoiceOptions: state.multipleChoiceOptions,
      correctOptionId: state.correctOptionId,
    }))
  );

  // UI state (changes frequently during interactions)
  const { reviewState, isLoading, error } = useReviewStore(
    useShallow((state) => ({
      reviewState: state.reviewState,
      isLoading: state.isLoading,
      error: state.error,
    }))
  );

  // Feedback state (changes after grading)
  const { lastRating, lastNextReviewText, lastMasteryAchieved, wordsReviewed } = useReviewStore(
    useShallow((state) => ({
      lastRating: state.lastRating,
      lastNextReviewText: state.lastNextReviewText,
      lastMasteryAchieved: state.lastMasteryAchieved,
      wordsReviewed: state.wordsReviewed,
    }))
  );

  // Actions (stable references, never cause re-renders)
  const {
    startSession,
    submitReview,
    setReviewState,
    setCurrentIndex,
    resetSession,
    fetchNextSentence,
    submitSentenceReview,
    clearMultipleChoiceOptions,
  } = useReviewStore(
    useShallow((state) => ({
      startSession: state.startSession,
      submitReview: state.submitReview,
      setReviewState: state.setReviewState,
      setCurrentIndex: state.setCurrentIndex,
      resetSession: state.resetSession,
      fetchNextSentence: state.fetchNextSentence,
      submitSentenceReview: state.submitSentenceReview,
      clearMultipleChoiceOptions: state.clearMultipleChoiceOptions,
    }))
  );

  const [showMastery, setShowMastery] = useState(false);
  const [masteredPhrase, setMasteredPhrase] = useState("");

  // FIX for Issue #69: Track when we're closing to prevent race condition
  // This prevents the useEffect from starting a new session after resetSession()
  const [isClosing, setIsClosing] = useState(false);

  // Sentence exercise state
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [answerEvaluation, setAnswerEvaluation] = useState<AnswerEvaluation | null>(null);

  // Word mode active recall state
  const [wordModeAnswerCorrect, setWordModeAnswerCorrect] = useState<boolean | null>(null);
  const [wordModeEvaluation, setWordModeEvaluation] = useState<AnswerEvaluation | null>(null);

  // Audio player for current word/sentence
  const currentWord = dueWords[currentIndex];
  const { isPlaying, isLoading: audioLoading, play, stop } = useAudioPlayer();

  // Tour state
  const { isCompleted: tourCompleted, isLoading: tourLoading, startTour, markTourComplete } = useTour("review");
  const tourStartedRef = useRef(false);

  // Register review tour with completion callback
  useEffect(() => {
    registerReviewTour(markTourComplete);
  }, [markTourComplete]);

  // Auto-start tour for first-time visitors (only once per session)
  useEffect(() => {
    if (
      !tourLoading &&
      !tourCompleted &&
      !tourStartedRef.current &&
      user &&
      sessionId &&
      dueWords.length > 0 &&
      reviewState === "recall"
    ) {
      tourStartedRef.current = true;
      // Small delay to ensure DOM elements are rendered
      const timer = setTimeout(() => {
        startTour();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [tourLoading, tourCompleted, user, sessionId, dueWords.length, reviewState, startTour]);

  // Handle tour replay via query param (from feedback sheet)
  useEffect(() => {
    const startTourParam = searchParams.get("startTour");
    if (startTourParam === "review" && user && sessionId && !tourManager.isActive()) {
      // Register tour and start after small delay for DOM to render
      registerReviewTour(markTourComplete);
      const timer = setTimeout(() => {
        tourManager.startTour("review");
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchParams, user, sessionId, markTourComplete]);

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

  // FIX for Issue #131: Distractors are now pre-fetched in fetchNextSentence
  // No more loadDistractors callback or useEffect - options are ready when sentence loads

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

    // FIX for Issue #69: Don't start new session if we're closing
    // This prevents race condition where resetSession clears sessionId
    // and this effect tries to start a new session during navigation
    if (isClosing) {
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
  }, [user, authLoading, sessionId, isLoading, isClosing, startSession, fetchNextSentence, router]);

  // FIX for Issue #131: Removed useEffect that loaded distractors
  // Distractors are now pre-fetched inline in fetchNextSentence before state is set
  // This eliminates the loading spinner delay on multiple_choice exercises

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  // FIX for Issue #130: Memoize handlers to prevent unnecessary child re-renders
  // When handlers are recreated on every render, child components receiving them as props re-render too

  // Reset exercise state when moving to next item
  const resetExerciseState = useCallback(() => {
    // Sentence mode state
    setIsAnswerCorrect(null);
    setSelectedOptionId(null);
    clearMultipleChoiceOptions(); // FIX for Issue #131: Use store's clear function
    setAnswerEvaluation(null);
    // Word mode state
    setWordModeAnswerCorrect(null);
    setWordModeEvaluation(null);
  }, [clearMultipleChoiceOptions]);

  const handleClose = useCallback(() => {
    // FIX for Issue #69: Set closing flag BEFORE reset to prevent race condition
    // This stops the useEffect from trying to start a new session
    setIsClosing(true);
    resetSession();
    router.push("/");
  }, [resetSession, router]);

  const handleReveal = useCallback(() => {
    setReviewState("revealed");
  }, [setReviewState]);

  // Handle fill-in-the-blank answer submission (sentence mode)
  const handleFillBlankSubmit = useCallback((userAnswer: string, isCorrect: boolean, evaluation: AnswerEvaluation) => {
    setIsAnswerCorrect(isCorrect);
    setAnswerEvaluation(evaluation);
  }, []);

  // Handle word mode active recall submission
  const handleWordModeRecallSubmit = useCallback((userAnswer: string, isCorrect: boolean, evaluation: AnswerEvaluation) => {
    setWordModeAnswerCorrect(isCorrect);
    setWordModeEvaluation(evaluation);
  }, []);

  // Handle multiple choice selection
  const handleMultipleChoiceSelect = useCallback((
    selectedId: string,
    isCorrect: boolean
  ) => {
    setSelectedOptionId(selectedId);
    setIsAnswerCorrect(isCorrect);
  }, []);

  // Proceed to grading after answering
  const handleProceedToGrading = useCallback(() => {
    setReviewState("revealed");
  }, [setReviewState]);

  // Handle grading for word mode
  const handleGrade = useCallback(async (rating: Rating) => {
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
  }, [currentWord, sessionId, submitReview, setReviewState, emitItemAnswered, lastMasteryAchieved]);

  // Handle grading for sentence mode
  const handleSentenceGrade = useCallback(async (rating: Rating) => {
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
  }, [sessionId, sentenceTargetWords, submitSentenceReview, setReviewState, emitItemAnswered, exerciseType]);

  const handleContinue = useCallback(async () => {
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
  }, [resetExerciseState, fetchNextSentence, setReviewState, currentIndex, dueWords.length, router, setCurrentIndex]);

  const handleMasteryContinue = useCallback(() => {
    setShowMastery(false);
    handleContinue();
  }, [handleContinue]);

  const handlePlayAudio = useCallback(() => {
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
  }, [reviewMode, currentSentence, currentWord?.audioUrl, isPlaying, stop, play]);

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
          <p style={{ color: "var(--text-muted)" }}>Loading practice...</p>
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
            You are done for today.
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
          {/* Progress indicator for tour */}
          <div id="progress-indicator">
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
            <div id="sentence-display">
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
                {/* Answer section for tour */}
                <div id="answer-section">
                  {/* Fill-in-the-blank input */}
                  {/* FIX for Issue #119: User sees Portuguese word, types English meaning */}
                  {exerciseType === "fill_blank" &&
                    reviewState === "recall" &&
                    blankedWord &&
                    isAnswerCorrect === null && (
                      <FillBlankInput
                        correctAnswer={getNativeLanguageText(blankedWord, nativeLanguage)}
                        onSubmit={handleFillBlankSubmit}
                      />
                    )}

                  {/* Multiple choice options */}
                  {/* FIX for Issue #131: Options are now pre-fetched - no loading spinner needed */}
                  {exerciseType === "multiple_choice" &&
                    reviewState === "recall" &&
                    multipleChoiceOptions.length > 0 && (
                      <MultipleChoiceOptions
                        options={multipleChoiceOptions}
                        correctOptionId={correctOptionId}
                        onSelect={handleMultipleChoiceSelect}
                        disabled={selectedOptionId !== null}
                        selectedId={selectedOptionId}
                      />
                    )}
                </div>
              </SentenceCard>
            </div>

            {/* Answer Feedback (shown after answering, before grading) */}
            {/* FIX for Issue #61 & #62: Use focusWord for correct answer display */}
            {isAnswerCorrect !== null && reviewState === "recall" && (
              <AnswerFeedback
                status={answerEvaluation?.status || (isAnswerCorrect ? 'correct' : 'incorrect')}
                correctAnswer={
                  !isAnswerCorrect && focusWord
                    ? getNativeLanguageText(focusWord, nativeLanguage)
                    : undefined
                }
                correctedSpelling={answerEvaluation?.correctedSpelling}
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
        {/* Progress indicator for tour */}
        <div id="progress-indicator">
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
        </div>

        {/* Review Badge */}
        <div className="mt-4 flex justify-center">
          <Badge
            className="text-white"
            style={{ backgroundColor: "var(--accent-nav)" }}
          >
            PRACTICE SESSION
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
            <div id="sentence-display">
              <SentenceCard
                sentence={getTargetLanguageText(currentWord, targetLanguage)}
                highlightedWords={[]}
                translation={getNativeLanguageText(currentWord, nativeLanguage)}
                showTranslation={reviewState !== "recall"}
                onPlayAudio={handlePlayAudio}
                isPlayingAudio={isPlaying}
                isLoadingAudio={audioLoading}
              />
            </div>
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
              status={wordModeEvaluation?.status || (wordModeAnswerCorrect ? 'correct' : 'incorrect')}
              correctAnswer={
                !wordModeAnswerCorrect
                  ? getNativeLanguageText(currentWord, nativeLanguage)
                  : undefined
              }
              correctedSpelling={wordModeEvaluation?.correctedSpelling}
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
              Practiced: {wordsReviewed} of {dueWords.length}
            </p>
          )}

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

/**
 * Loading fallback for Suspense boundary
 */
function ReviewPageFallback() {
  return (
    <div className="min-h-screen notebook-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2
          className="h-8 w-8 animate-spin"
          style={{ color: "var(--accent-nav)" }}
        />
        <p style={{ color: "var(--text-muted)" }}>Loading practice...</p>
      </div>
    </div>
  );
}

/**
 * ReviewPage with Suspense boundary for useSearchParams
 * Required by Next.js 16+ for client-side rendering bailout
 */
export default function ReviewPage() {
  return (
    <Suspense fallback={<ReviewPageFallback />}>
      <ReviewPageContent />
    </Suspense>
  );
}
