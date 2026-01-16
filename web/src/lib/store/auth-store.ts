import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';

/**
 * Auth Store
 *
 * Manages authentication state and user session information.
 */

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  error: null,

  setUser: (user) => set({ user, isLoading: false }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),

  signOut: async () => {
    set({ isLoading: true });
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      await supabase.auth.signOut();
      set({ user: null, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to sign out',
        isLoading: false,
      });
    }
  },
}));
