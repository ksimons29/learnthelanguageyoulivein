import { create } from 'zustand';
import type { Word, GeneratedSentence } from '@/lib/db/schema';
import type { ExerciseType } from '@/lib/sentences/exercise-type';
import { queueOfflineReview } from '@/lib/offline';

/**
 * Review Store
 *
 * Manages review session state including due words, sentences, current session,
 * and review progress. Supports both single-word and sentence-based review modes.
 */

type ReviewState = 'recall' | 'revealed' | 'feedback';
type Rating = 'again' | 'hard' | 'good' | 'easy';
type ReviewMode = 'word' | 'sentence';

interface ReviewStoreState {
  // Session State
  sessionId: string | null;
  dueWords: Word[];
  totalDue: number;
  currentIndex: number;
  reviewState: ReviewState;
  lastRating: Rating | null;
  lastNextReviewText: string | null;
  lastMasteryAchieved: boolean;

  // Sentence Review State
  reviewMode: ReviewMode;
  currentSentence: GeneratedSentence | null;
  sentenceTargetWords: Word[];

  // Session Stats
  wordsReviewed: number;
  correctCount: number;

  // Loading State
  isLoading: boolean;
  error: string | null;

  // Setters
  setSessionId: (sessionId: string) => void;
  setDueWords: (words: Word[]) => void;
  setCurrentIndex: (index: number) => void;
  setReviewState: (state: ReviewState) => void;
  setLastRating: (rating: Rating | null) => void;
  setReviewMode: (mode: ReviewMode) => void;
  incrementReviewed: () => void;
  incrementCorrect: () => void;
  resetSession: () => void;

  // API Actions
  startSession: () => Promise<void>;
  submitReview: (wordId: string, rating: 1 | 2 | 3 | 4) => Promise<void>;
  endSession: () => Promise<void>;

  // Sentence API Actions
  fetchNextSentence: () => Promise<boolean>;
  submitSentenceReview: (rating: 1 | 2 | 3 | 4) => Promise<void>;
}

export const useReviewStore = create<ReviewStoreState>((set, get) => ({
  // Initial State
  sessionId: null,
  dueWords: [],
  totalDue: 0,
  currentIndex: 0,
  reviewState: 'recall',
  lastRating: null,
  lastNextReviewText: null,
  lastMasteryAchieved: false,

  // Sentence Review State
  reviewMode: 'word',
  currentSentence: null,
  sentenceTargetWords: [],

  // Session Stats
  wordsReviewed: 0,
  correctCount: 0,
  isLoading: false,
  error: null,

  // Setters
  setSessionId: (sessionId) => set({ sessionId }),
  setDueWords: (words) => set({ dueWords: words }),
  setCurrentIndex: (index) => set({ currentIndex: index }),
  setReviewState: (state) => set({ reviewState: state }),
  setLastRating: (rating) => set({ lastRating: rating }),
  setReviewMode: (mode) => set({ reviewMode: mode }),
  incrementReviewed: () => set((state) => ({ wordsReviewed: state.wordsReviewed + 1 })),
  incrementCorrect: () => set((state) => ({ correctCount: state.correctCount + 1 })),

  resetSession: () =>
    set({
      sessionId: null,
      dueWords: [],
      totalDue: 0,
      currentIndex: 0,
      reviewState: 'recall',
      lastRating: null,
      lastNextReviewText: null,
      lastMasteryAchieved: false,
      reviewMode: 'word',
      currentSentence: null,
      sentenceTargetWords: [],
      wordsReviewed: 0,
      correctCount: 0,
      error: null,
    }),

  // API Actions
  startSession: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/reviews');
      if (!response.ok) {
        throw new Error('Failed to start session');
      }

      const { data } = await response.json();
      set({
        sessionId: data.sessionId,
        dueWords: data.words,
        totalDue: data.totalDue,
        currentIndex: 0,
        reviewState: 'recall',
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to start session',
        isLoading: false,
      });
      throw error;
    }
  },

  submitReview: async (wordId: string, rating: 1 | 2 | 3 | 4) => {
    const { sessionId } = get();
    set({ isLoading: true, error: null });

    // Map numeric rating to string
    const ratingMap: Record<number, Rating> = {
      1: 'again',
      2: 'hard',
      3: 'good',
      4: 'easy',
    };

    // Check if offline - queue for later sync
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      try {
        await queueOfflineReview(wordId, rating, sessionId);

        // Optimistic update - update local state immediately
        set((state) => ({
          lastRating: ratingMap[rating],
          lastNextReviewText: 'Syncing when online...',
          lastMasteryAchieved: false,
          wordsReviewed: state.wordsReviewed + 1,
          correctCount: rating >= 3 ? state.correctCount + 1 : state.correctCount,
          isLoading: false,
        }));

        return { offline: true };
      } catch (error) {
        set({
          error: 'Failed to queue offline review',
          isLoading: false,
        });
        throw error;
      }
    }

    // Online - normal API flow
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wordId, rating, sessionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      const { data } = await response.json();

      set((state) => ({
        lastRating: ratingMap[rating],
        lastNextReviewText: data.nextReviewText || null,
        lastMasteryAchieved: data.masteryAchieved || false,
        wordsReviewed: state.wordsReviewed + 1,
        correctCount: rating >= 3 ? state.correctCount + 1 : state.correctCount,
        isLoading: false,
      }));

      return data;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to submit review',
        isLoading: false,
      });
      throw error;
    }
  },

  endSession: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/reviews/end', {
        method: 'POST',
      });

      // 404 is OK - might happen if session already ended or never started
      if (!response.ok && response.status !== 404) {
        throw new Error('Failed to end session');
      }

      const { data } = response.status === 404 ? {} : await response.json();
      // Note: Don't reset session here - let the complete page handle it
      // This preserves wordsReviewed and correctCount for display
      set({ isLoading: false });
      return data;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to end session',
        isLoading: false,
      });
      throw error;
    }
  },

  // Sentence API Actions

  /**
   * Fetch the next sentence for review
   *
   * Returns true if a sentence was found, false otherwise.
   * When no sentence is available, falls back to word mode.
   */
  fetchNextSentence: async () => {
    const { sessionId } = get();
    set({ isLoading: true, error: null });

    try {
      const url = sessionId
        ? `/api/sentences/next?sessionId=${sessionId}`
        : '/api/sentences/next';

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch sentence');
      }

      const { data } = await response.json();

      if (data.sentence && data.targetWords.length > 0) {
        set({
          currentSentence: data.sentence,
          sentenceTargetWords: data.targetWords,
          reviewMode: 'sentence',
          reviewState: 'recall',
          isLoading: false,
        });
        return true;
      } else {
        // No sentence available, stay in word mode
        set({
          currentSentence: null,
          sentenceTargetWords: [],
          reviewMode: 'word',
          isLoading: false,
        });
        return false;
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch sentence',
        isLoading: false,
      });
      return false;
    }
  },

  /**
   * Submit review for all words in the current sentence
   *
   * Applies the same rating to all words in the sentence.
   * Each word's FSRS parameters are updated individually.
   * Uses batched submission with validation to prevent silent failures.
   */
  submitSentenceReview: async (rating: 1 | 2 | 3 | 4) => {
    const { sessionId, sentenceTargetWords } = get();
    set({ isLoading: true, error: null });

    try {
      // Submit all reviews in parallel using Promise.allSettled
      const reviewPromises = sentenceTargetWords.map((word) =>
        fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wordId: word.id, rating, sessionId }),
        }).then(async (response) => {
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Failed to submit review for word ${word.id}`);
          }
          return response.json();
        })
      );

      const results = await Promise.allSettled(reviewPromises);

      // Check for failures
      const failures = results.filter((r) => r.status === 'rejected');
      const successes = results.filter((r) => r.status === 'fulfilled');

      if (failures.length > 0) {
        // Some reviews failed - only count successes
        const failedCount = failures.length;
        const successCount = successes.length;

        if (successCount === 0) {
          // All failed - show error
          throw new Error(`Failed to submit review for all ${failedCount} words in sentence`);
        }

        // Partial success - warn user but continue
        console.error(`${failedCount} of ${sentenceTargetWords.length} word reviews failed`);
      }

      // Map numeric rating to string
      const ratingMap: Record<number, Rating> = {
        1: 'again',
        2: 'hard',
        3: 'good',
        4: 'easy',
      };

      // Update stats (only count successful submissions)
      const wordsReviewedCount = successes.length;
      const correctWords = rating >= 3 ? wordsReviewedCount : 0;

      set((state) => ({
        lastRating: ratingMap[rating],
        wordsReviewed: state.wordsReviewed + wordsReviewedCount,
        correctCount: state.correctCount + correctWords,
        reviewState: 'feedback',
        isLoading: false,
        error: failures.length > 0
          ? `${failures.length} word(s) failed to save. They will be reviewed again.`
          : null,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to submit sentence review',
        isLoading: false,
      });
      throw error;
    }
  },
}));
