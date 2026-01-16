'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/store';

/**
 * Auth Provider
 *
 * Initializes Supabase auth session and syncs with Zustand auth store.
 * Listens for auth state changes and updates the store accordingly.
 */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading, setError } = useAuthStore();

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setError(error.message);
      } else {
        setUser(session?.user ?? null);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser, setError]);

  return <>{children}</>;
}
