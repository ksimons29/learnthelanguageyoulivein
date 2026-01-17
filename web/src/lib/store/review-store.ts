import { create } from 'zustand';
import type { Word, GeneratedSentence } from '@/lib/db/schema';
import type { ExerciseType } from '@/lib/sentences/exercise-type';

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

      // Map numeric rating to string
      const ratingMap: Record<number, Rating> = {
        1: 'again',
        2: 'hard',
        3: 'good',
        4: 'easy',
      };

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

      if (!response.ok) {
        throw new Error('Failed to end session');
      }

      const { data } = await response.json();
      get().resetSession();
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
   */
  submitSentenceReview: async (rating: 1 | 2 | 3 | 4) => {
    const { sessionId, sentenceTargetWords } = get();
    set({ isLoading: true, error: null });

    try {
      // Submit review for each word in the sentence
      for (const word of sentenceTargetWords) {
        const response = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wordId: word.id, rating, sessionId }),
        });

        if (!response.ok) {
          console.error(`Failed to submit review for word ${word.id}`);
        }
      }

      // Map numeric rating to string
      const ratingMap: Record<number, Rating> = {
        1: 'again',
        2: 'hard',
        3: 'good',
        4: 'easy',
      };

      // Update stats (count each word in sentence as reviewed)
      const wordsInSentence = sentenceTargetWords.length;
      const correctWords = rating >= 3 ? wordsInSentence : 0;

      set((state) => ({
        lastRating: ratingMap[rating],
        wordsReviewed: state.wordsReviewed + wordsInSentence,
        correctCount: state.correctCount + correctWords,
        reviewState: 'feedback',
        isLoading: false,
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
