import { create } from 'zustand';
import type { Word } from '@/lib/db/schema';
import type { MemoryContext } from '@/lib/config/memory-context';
import {
  AUDIO_POLLING_TIMEOUT_MS,
  AUDIO_POLLING_INITIAL_INTERVAL_MS,
  AUDIO_POLLING_BACKOFF_MULTIPLIER,
  AUDIO_POLLING_MAX_INTERVAL_MS,
  AUDIO_SHOW_WARNING_MS,
  AUDIO_SHOW_EARLY_RETRY_MS,
} from '@/lib/audio/polling-config';

/**
 * Timeout for network requests in milliseconds
 * Capture should complete within 10 seconds per UX requirements
 */
const NETWORK_TIMEOUT_MS = 10000;

/**
 * Helper to fetch with timeout using AbortController
 * Prevents UI from showing "Capturing..." indefinitely on network issues
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = NETWORK_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Check if error is a network timeout (AbortError)
 */
function isTimeoutError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

/**
 * Redirect to login page (used on 401 errors)
 */
function redirectToLogin(): void {
  if (typeof window !== 'undefined') {
    window.location.href = '/auth/sign-in';
  }
}

/**
 * Words Store
 *
 * Manages the collection of captured words and provides actions
 * for capturing, retrieving, updating, and deleting words.
 */

/**
 * Module-level storage for polling AbortControllers
 * Prevents memory leaks by allowing cancellation of pending poll requests
 */
const pollingControllers = new Map<string, AbortController>();

/**
 * Cancel any existing polling for a word
 */
function cancelPolling(wordId: string): void {
  const controller = pollingControllers.get(wordId);
  if (controller) {
    controller.abort();
    pollingControllers.delete(wordId);
  }
}

/**
 * Category statistics returned from the API
 */
export interface CategoryStats {
  category: string;
  totalWords: number;
  dueCount: number;
}

/**
 * @deprecated Sentence data is now stored directly on Word entity (exampleSentence, exampleTranslation)
 * This type is kept for backwards compatibility
 */
export interface WordSentence {
  text: string;
  translation: string | null;
}

/**
 * @deprecated Example sentences are now on Word entity directly (exampleSentence, exampleTranslation)
 * This type alias is kept for backwards compatibility
 */
export type WordWithSentence = Word;

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
  // Issue #135: Track warning states during polling
  audioWarningIds: Set<string>;      // Words past 15s - show "Taking longer..."
  audioShowRetryIds: Set<string>;    // Words past 20s - show early retry option

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
  // Issue #135: New selectors for warning states
  isAudioWarning: (wordId: string) => boolean;
  showEarlyRetry: (wordId: string) => boolean;
  retryAudioGeneration: (wordId: string) => Promise<void>;
  clearAudioFailed: (wordId: string) => void;
  updateWordCategory: (wordId: string, category: string) => Promise<void>;
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
  // Issue #135: Warning state tracking
  audioWarningIds: new Set<string>(),
  audioShowRetryIds: new Set<string>(),

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
      // Note: includeSentences param is deprecated - sentences are now on word entity

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
      const response = await fetchWithTimeout('/api/words', {
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

      // Handle 401 errors by redirecting to login
      if (response.status === 401) {
        redirectToLogin();
        throw new Error('Session expired. Please sign in again.');
      }

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
      // Provide user-friendly message for timeout errors
      const errorMessage = isTimeoutError(error)
        ? 'Request timed out. Please check your connection and try again.'
        : error instanceof Error
        ? error.message
        : 'Failed to capture word';

      set({
        error: errorMessage,
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
    // Cancel any existing polling for this word (prevents memory leak)
    cancelPolling(wordId);

    // Create new AbortController for this polling session
    const controller = new AbortController();
    pollingControllers.set(wordId, controller);

    // Add to tracking set
    set((state) => {
      const newSet = new Set(state.audioGeneratingIds);
      newSet.add(wordId);
      return { audioGeneratingIds: newSet };
    });

    // Exponential backoff polling (config from @/lib/audio/polling-config):
    // - Total timeout: 30 seconds (reduced from 60s per Issue #129)
    // - Intervals: 1s → 1.5s → 2.25s → 3.4s → 5s (cap)
    // - Early termination if server sets audioGenerationFailed=true
    const TOTAL_TIMEOUT_MS = AUDIO_POLLING_TIMEOUT_MS;
    const INITIAL_INTERVAL_MS = AUDIO_POLLING_INITIAL_INTERVAL_MS;
    const BACKOFF_MULTIPLIER = AUDIO_POLLING_BACKOFF_MULTIPLIER;
    const MAX_INTERVAL_MS = AUDIO_POLLING_MAX_INTERVAL_MS;

    const startTime = Date.now();
    let currentInterval = INITIAL_INTERVAL_MS;

    // Issue #135: Track whether we've set warning states to avoid redundant updates
    let warningSet = false;
    let showRetrySet = false;

    const poll = async () => {
      // Check if polling was cancelled
      if (controller.signal.aborted) {
        return;
      }

      const elapsedMs = Date.now() - startTime;

      // Issue #135: Set warning states at thresholds
      if (!warningSet && elapsedMs >= AUDIO_SHOW_WARNING_MS) {
        warningSet = true;
        set((state) => {
          const warningIds = new Set(state.audioWarningIds);
          warningIds.add(wordId);
          return { audioWarningIds: warningIds };
        });
      }
      if (!showRetrySet && elapsedMs >= AUDIO_SHOW_EARLY_RETRY_MS) {
        showRetrySet = true;
        set((state) => {
          const showRetryIds = new Set(state.audioShowRetryIds);
          showRetryIds.add(wordId);
          return { audioShowRetryIds: showRetryIds };
        });
      }

      // Check if we've exceeded total timeout
      if (elapsedMs >= TOTAL_TIMEOUT_MS) {
        console.warn(`Audio generation timed out for word ${wordId} after ${TOTAL_TIMEOUT_MS / 1000}s`);
        cancelPolling(wordId);
        set((state) => {
          const generatingSet = new Set(state.audioGeneratingIds);
          generatingSet.delete(wordId);
          const failedSet = new Set(state.audioFailedIds);
          failedSet.add(wordId);
          // Clear warning states on timeout
          const warningIds = new Set(state.audioWarningIds);
          warningIds.delete(wordId);
          const showRetryIds = new Set(state.audioShowRetryIds);
          showRetryIds.delete(wordId);
          return {
            audioGeneratingIds: generatingSet,
            audioFailedIds: failedSet,
            audioWarningIds: warningIds,
            audioShowRetryIds: showRetryIds,
          };
        });
        return;
      }

      try {
        const response = await fetch(`/api/words/${wordId}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error('Failed to fetch word');
        }

        const { data } = await response.json();
        const word = data.word;

        // Success: Audio is ready
        if (word.audioUrl) {
          cancelPolling(wordId); // Clean up controller
          set((state) => {
            const newSet = new Set(state.audioGeneratingIds);
            newSet.delete(wordId);
            // Clear warning states on success
            const warningIds = new Set(state.audioWarningIds);
            warningIds.delete(wordId);
            const showRetryIds = new Set(state.audioShowRetryIds);
            showRetryIds.delete(wordId);
            return {
              audioGeneratingIds: newSet,
              audioWarningIds: warningIds,
              audioShowRetryIds: showRetryIds,
              words: state.words.map((w) =>
                w.id === wordId ? {
                  ...w,
                  audioUrl: word.audioUrl,
                  audioGenerationFailed: false,
                  // Issue #134: Update verification status from server
                  audioVerificationFailed: word.audioVerificationFailed ?? false,
                } : w
              ),
            };
          });
          return; // Stop polling
        }

        // Early termination: Server marked generation as failed
        if (word.audioGenerationFailed) {
          console.warn(`Server reported audio generation failed for word ${wordId}`);
          cancelPolling(wordId); // Clean up controller
          set((state) => {
            const generatingSet = new Set(state.audioGeneratingIds);
            generatingSet.delete(wordId);
            const failedSet = new Set(state.audioFailedIds);
            failedSet.add(wordId);
            // Clear warning states on failure
            const warningIds = new Set(state.audioWarningIds);
            warningIds.delete(wordId);
            const showRetryIds = new Set(state.audioShowRetryIds);
            showRetryIds.delete(wordId);
            return {
              audioGeneratingIds: generatingSet,
              audioFailedIds: failedSet,
              audioWarningIds: warningIds,
              audioShowRetryIds: showRetryIds,
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
        // If polling was aborted, stop silently (not an error)
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
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

  // Issue #135: Selectors for warning states
  isAudioWarning: (wordId: string) => {
    return get().audioWarningIds.has(wordId);
  },

  showEarlyRetry: (wordId: string) => {
    return get().audioShowRetryIds.has(wordId);
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

  updateWordCategory: async (wordId: string, category: string) => {
    try {
      const response = await fetch(`/api/words/${wordId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category }),
      });

      if (response.status === 401) {
        redirectToLogin();
        throw new Error('Session expired. Please sign in again.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update category');
      }

      const { data } = await response.json();

      // Update local state with the returned word
      set((state) => ({
        words: state.words.map((w) =>
          w.id === wordId ? { ...w, category: data.word.category } : w
        ),
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update category',
      });
      throw error;
    }
  },
}));
