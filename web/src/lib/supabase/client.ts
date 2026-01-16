import { createBrowserClient } from '@supabase/ssr';

/**
 * Supabase Client (Client-Side)
 *
 * Creates a Supabase client for use in client components.
 * Handles authentication state and provides access to Supabase services.
 */

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
