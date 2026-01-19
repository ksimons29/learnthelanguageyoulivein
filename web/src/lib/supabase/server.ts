import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { userProfiles } from '@/lib/db/schema/user-profiles';
import { eq } from 'drizzle-orm';
import {
  DEFAULT_LANGUAGE_PREFERENCE,
  type UserLanguagePreference,
} from '@/lib/config/languages';

/**
 * Supabase Client (Server-Side)
 *
 * Creates a Supabase client for use in Server Components, Server Actions, and API Routes.
 * Properly handles cookie-based authentication for server-side rendering.
 */

export async function createClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}

/**
 * Get current authenticated user from server-side context
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Get user's language preference from the database
 * Falls back to DEFAULT_LANGUAGE_PREFERENCE if no profile exists
 *
 * This is the SINGLE SOURCE OF TRUTH for language preferences.
 * All API routes should use this function for filtering words by language.
 */
export async function getUserLanguagePreference(
  userId: string
): Promise<UserLanguagePreference> {
  const [profile] = await db
    .select({
      nativeLanguage: userProfiles.nativeLanguage,
      targetLanguage: userProfiles.targetLanguage,
    })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  if (profile) {
    return {
      nativeLanguage: profile.nativeLanguage,
      targetLanguage: profile.targetLanguage,
    };
  }

  return DEFAULT_LANGUAGE_PREFERENCE;
}
