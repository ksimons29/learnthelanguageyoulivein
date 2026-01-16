import { create } from 'zustand';
import type { Word } from '@/lib/db/schema';

/**
 * Words Store
 *
 * Manages the collection of captured words and provides actions
 * for capturing, retrieving, updating, and deleting words.
 */

interface WordsState {
  // State
  words: Word[];
  isLoading: boolean;
  error: string | null;
  currentFilter: {
    category?: string;
    masteryStatus?: string;
    search?: string;
  };

  // Actions
  setWords: (words: Word[]) => void;
  addWord: (word: Word) => void;
  updateWord: (id: string, updates: Partial<Word>) => void;
  removeWord: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setFilter: (filter: Partial<WordsState['currentFilter']>) => void;

  // API Actions
  fetchWords: () => Promise<void>;
  captureWord: (text: string, context?: string) => Promise<Word>;
  deleteWord: (id: string) => Promise<void>;
}

export const useWordsStore = create<WordsState>((set, get) => ({
  // Initial State
  words: [],
  isLoading: false,
  error: null,
  currentFilter: {},

  // Setters
  setWords: (words) => set({ words }),

  addWord: (word) => set((state) => ({ words: [word, ...state.words] })),

  updateWord: (id, updates) =>
    set((state) => ({
      words: state.words.map((word) =>
        word.id === id ? { ...word, ...updates } : word
      ),
    })),

  removeWord: (id) =>
    set((state) => ({
      words: state.words.filter((word) => word.id !== id),
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setFilter: (filter) =>
    set((state) => ({
      currentFilter: { ...state.currentFilter, ...filter },
    })),

  // API Actions
  fetchWords: async () => {
    set({ isLoading: true, error: null });
    try {
      const { currentFilter } = get();
      const params = new URLSearchParams();
      if (currentFilter.category) params.set('category', currentFilter.category);
      if (currentFilter.masteryStatus) params.set('masteryStatus', currentFilter.masteryStatus);
      if (currentFilter.search) params.set('search', currentFilter.search);

      const response = await fetch(`/api/words?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch words');
      }

      const { data } = await response.json();
      set({ words: data.words, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch words',
        isLoading: false,
      });
    }
  },

  captureWord: async (text: string, context?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, context }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to capture word');
      }

      const { data } = await response.json();
      const word = data.word;

      set((state) => ({
        words: [word, ...state.words],
        isLoading: false,
      }));

      return word;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to capture word',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteWord: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/words/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete word');
      }

      set((state) => ({
        words: state.words.filter((word) => word.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete word',
        isLoading: false,
      });
      throw error;
    }
  },
}));
