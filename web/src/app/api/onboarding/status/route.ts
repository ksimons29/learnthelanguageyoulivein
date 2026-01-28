import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { userProfiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '@/lib/logger';

/**
 * GET /api/onboarding/status
 *
 * Returns the user's onboarding status and language preferences.
 * Used to determine if user should be redirected to onboarding flow.
 *
 * Response: {
 *   data: {
 *     needsOnboarding: boolean,
 *     profile: UserProfile | null
 *   }
 * }
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has a profile
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.id))
      .limit(1);

    // User needs onboarding if:
    // 1. No profile exists, OR
    // 2. Profile exists but onboardingCompleted is false
    const needsOnboarding = !profile || !profile.onboardingCompleted;

    return NextResponse.json({
      data: {
        needsOnboarding,
        profile: profile || null,
      },
    });
  } catch (error) {
    logger.error({ error: error instanceof Error ? { message: error.message, stack: error.stack } : String(error), endpoint: '/api/onboarding/status' }, 'Onboarding status error');
    return NextResponse.json(
      { error: 'Failed to get onboarding status' },
      { status: 500 }
    );
  }
}
