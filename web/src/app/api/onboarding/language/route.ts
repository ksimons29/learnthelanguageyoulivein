import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { userProfiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { SUPPORTED_LANGUAGES } from '@/lib/config/languages';

/**
 * POST /api/onboarding/language
 *
 * Saves user's language preferences during onboarding.
 * Creates a new user_profile if one doesn't exist.
 *
 * Body: {
 *   targetLanguage: 'pt-PT' | 'es' | 'sv' | ...,
 *   nativeLanguage: 'en' | 'nl' | ...
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { targetLanguage, nativeLanguage } = body;

    // Validate languages
    if (!targetLanguage || !nativeLanguage) {
      return NextResponse.json(
        { error: 'Both targetLanguage and nativeLanguage are required' },
        { status: 400 }
      );
    }

    // Validate target language is supported
    const validTargetLanguages = Object.keys(SUPPORTED_LANGUAGES);
    if (!validTargetLanguages.includes(targetLanguage)) {
      return NextResponse.json(
        { error: `Invalid target language. Supported: ${validTargetLanguages.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if profile exists
    const [existingProfile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.id))
      .limit(1);

    let profile;

    if (existingProfile) {
      // Update existing profile
      [profile] = await db
        .update(userProfiles)
        .set({
          targetLanguage,
          nativeLanguage,
          updatedAt: new Date(),
        })
        .where(eq(userProfiles.userId, user.id))
        .returning();
    } else {
      // Create new profile
      [profile] = await db
        .insert(userProfiles)
        .values({
          userId: user.id,
          targetLanguage,
          nativeLanguage,
        })
        .returning();
    }

    return NextResponse.json({
      data: { profile },
    });
  } catch (error) {
    console.error('Language preferences error:', error);
    return NextResponse.json(
      { error: 'Failed to save language preferences' },
      { status: 500 }
    );
  }
}
