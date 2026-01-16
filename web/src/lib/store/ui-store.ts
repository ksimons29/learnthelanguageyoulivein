import { create } from 'zustand';

/**
 * UI Store
 *
 * Manages UI state such as modals, toasts, and loading indicators.
 */

interface UIState {
  // Modal State
  isCaptureModalOpen: boolean;
  isMasteryModalOpen: boolean;
  masteredPhrase: string | null;

  // Toast State
  toast: {
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
  } | null;

  // Actions
  openCaptureModal: () => void;
  closeCaptureModal: () => void;
  openMasteryModal: (phrase: string) => void;
  closeMasteryModal: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Initial State
  isCaptureModalOpen: false,
  isMasteryModalOpen: false,
  masteredPhrase: null,
  toast: null,

  // Actions
  openCaptureModal: () => set({ isCaptureModalOpen: true }),
  closeCaptureModal: () => set({ isCaptureModalOpen: false }),

  openMasteryModal: (phrase) =>
    set({ isMasteryModalOpen: true, masteredPhrase: phrase }),
  closeMasteryModal: () =>
    set({ isMasteryModalOpen: false, masteredPhrase: null }),

  showToast: (message, type) =>
    set({ toast: { message, type, isVisible: true } }),
  hideToast: () =>
    set((state) => ({
      toast: state.toast ? { ...state.toast, isVisible: false } : null,
    })),
}));
