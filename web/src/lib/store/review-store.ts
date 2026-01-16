import { create } from 'zustand';
import type { Word } from '@/lib/db/schema';

/**
 * Review Store
 *
 * Manages review session state including due words, current session,
 * and review progress.
 */

type ReviewState = 'recall' | 'revealed' | 'feedback';
type Rating = 'again' | 'hard' | 'good' | 'easy';

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
  incrementReviewed: () => void;
  incrementCorrect: () => void;
  resetSession: () => void;

  // API Actions
  startSession: () => Promise<void>;
  submitReview: (wordId: string, rating: 1 | 2 | 3 | 4) => Promise<void>;
  endSession: () => Promise<void>;
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
}));
