import { create } from 'zustand';
import type { Word } from '@/lib/db/schema';
import type { MemoryContext } from '@/lib/config/memory-context';

/**
 * Words Store
 *
 * Manages the collection of captured words and provides actions
 * for capturing, retrieving, updating, and deleting words.
 */

/**
 * Category statistics returned from the API
 */
export interface CategoryStats {
  category: string;
  totalWords: number;
  dueCount: number;
}

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

  // Audio generation tracking
  audioGeneratingIds: Set<string>;
  audioFailedIds: Set<string>;

  // Categories State
  categories: CategoryStats[];
  categoriesLoading: boolean;
  inboxCount: number;

  // Selected Word State (for detail view)
  selectedWord: Word | null;

  // Actions
  setWords: (words: Word[]) => void;
  addWord: (word: Word) => void;
  updateWord: (id: string, updates: Partial<Word>) => void;
  removeWord: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setFilter: (filter: Partial<WordsState['currentFilter']>) => void;
  setSelectedWord: (word: Word | null) => void;

  // API Actions
  fetchWords: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  captureWord: (
    text: string,
    options?: {
      context?: string;
      sourceLang?: string;
      targetLang?: string;
      memoryContext?: MemoryContext;
    }
  ) => Promise<Word>;
  deleteWord: (id: string) => Promise<void>;
  pollForAudio: (wordId: string) => void;
  isAudioGenerating: (wordId: string) => boolean;
  isAudioFailed: (wordId: string) => boolean;
  retryAudioGeneration: (wordId: string) => Promise<void>;
  clearAudioFailed: (wordId: string) => void;
}

export const useWordsStore = create<WordsState>((set, get) => ({
  // Initial State
  words: [],
  isLoading: false,
  error: null,
  currentFilter: {},

  // Audio generation tracking
  audioGeneratingIds: new Set<string>(),
  audioFailedIds: new Set<string>(),

  // Categories Initial State
  categories: [],
  categoriesLoading: false,
  inboxCount: 0,

  // Selected Word Initial State
  selectedWord: null,

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

  setSelectedWord: (word) => set({ selectedWord: word }),

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

  fetchCategories: async () => {
    set({ categoriesLoading: true, error: null });
    try {
      const response = await fetch('/api/words/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const { data } = await response.json();
      set({
        categories: data.categories,
        inboxCount: data.inboxCount,
        categoriesLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch categories',
        categoriesLoading: false,
      });
    }
  },

  captureWord: async (
    text: string,
    options?: {
      context?: string;
      sourceLang?: string;
      targetLang?: string;
      memoryContext?: MemoryContext;
    }
  ) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          context: options?.context,
          sourceLang: options?.sourceLang,
          targetLang: options?.targetLang,
          memoryContext: options?.memoryContext,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to capture word');
      }

      const { data } = await response.json();
      const word = data.word;
      const isGeneratingAudio = data.word.audioGenerating === true;

      set((state) => ({
        words: [word, ...state.words],
        isLoading: false,
      }));

      // Start polling for audio if it's being generated
      if (isGeneratingAudio) {
        get().pollForAudio(word.id);
      }

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

  pollForAudio: (wordId: string) => {
    // Add to tracking set
    set((state) => {
      const newSet = new Set(state.audioGeneratingIds);
      newSet.add(wordId);
      return { audioGeneratingIds: newSet };
    });

    // Exponential backoff polling:
    // - Total timeout: 60 seconds
    // - Intervals: 1s → 1.5s → 2.25s → 3.4s → 5s (cap)
    // - Early termination if server sets audioGenerationFailed=true
    const TOTAL_TIMEOUT_MS = 60000;
    const INITIAL_INTERVAL_MS = 1000;
    const BACKOFF_MULTIPLIER = 1.5;
    const MAX_INTERVAL_MS = 5000;

    const startTime = Date.now();
    let currentInterval = INITIAL_INTERVAL_MS;

    const poll = async () => {
      const elapsedMs = Date.now() - startTime;

      // Check if we've exceeded total timeout
      if (elapsedMs >= TOTAL_TIMEOUT_MS) {
        console.warn(`Audio generation timed out for word ${wordId} after ${TOTAL_TIMEOUT_MS / 1000}s`);
        set((state) => {
          const generatingSet = new Set(state.audioGeneratingIds);
          generatingSet.delete(wordId);
          const failedSet = new Set(state.audioFailedIds);
          failedSet.add(wordId);
          return {
            audioGeneratingIds: generatingSet,
            audioFailedIds: failedSet,
          };
        });
        return;
      }

      try {
        const response = await fetch(`/api/words/${wordId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch word');
        }

        const { data } = await response.json();
        const word = data.word;

        // Success: Audio is ready
        if (word.audioUrl) {
          set((state) => {
            const newSet = new Set(state.audioGeneratingIds);
            newSet.delete(wordId);
            return {
              audioGeneratingIds: newSet,
              words: state.words.map((w) =>
                w.id === wordId ? { ...w, audioUrl: word.audioUrl, audioGenerationFailed: false } : w
              ),
            };
          });
          return; // Stop polling
        }

        // Early termination: Server marked generation as failed
        if (word.audioGenerationFailed) {
          console.warn(`Server reported audio generation failed for word ${wordId}`);
          set((state) => {
            const generatingSet = new Set(state.audioGeneratingIds);
            generatingSet.delete(wordId);
            const failedSet = new Set(state.audioFailedIds);
            failedSet.add(wordId);
            return {
              audioGeneratingIds: generatingSet,
              audioFailedIds: failedSet,
              words: state.words.map((w) =>
                w.id === wordId ? { ...w, audioGenerationFailed: true } : w
              ),
            };
          });
          return; // Stop polling
        }

        // Continue polling with exponential backoff
        currentInterval = Math.min(currentInterval * BACKOFF_MULTIPLIER, MAX_INTERVAL_MS);
        setTimeout(poll, currentInterval);
      } catch (error) {
        console.error('Audio polling error:', error);
        // On network error, continue polling (might be transient)
        // Only stop if we've exceeded total timeout
        currentInterval = Math.min(currentInterval * BACKOFF_MULTIPLIER, MAX_INTERVAL_MS);
        setTimeout(poll, currentInterval);
      }
    };

    // Start polling after 1 second delay (give audio generation time to start)
    setTimeout(poll, INITIAL_INTERVAL_MS);
  },

  isAudioGenerating: (wordId: string) => {
    return get().audioGeneratingIds.has(wordId);
  },

  isAudioFailed: (wordId: string) => {
    return get().audioFailedIds.has(wordId);
  },

  clearAudioFailed: (wordId: string) => {
    set((state) => {
      const failedSet = new Set(state.audioFailedIds);
      failedSet.delete(wordId);
      return { audioFailedIds: failedSet };
    });
  },

  retryAudioGeneration: async (wordId: string) => {
    // Clear failed status
    get().clearAudioFailed(wordId);

    // Trigger audio regeneration via API
    try {
      const response = await fetch(`/api/words/${wordId}/regenerate-audio`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate audio');
      }

      // Start polling again
      get().pollForAudio(wordId);
    } catch (error) {
      console.error('Audio regeneration error:', error);
      // Mark as failed again
      set((state) => {
        const failedSet = new Set(state.audioFailedIds);
        failedSet.add(wordId);
        return { audioFailedIds: failedSet };
      });
    }
  },
}));
