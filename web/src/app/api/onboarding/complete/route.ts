import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { userProfiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * POST /api/onboarding/complete
 *
 * Marks onboarding as completed for the user.
 * Called after the user has captured their first words and seen their first sentence.
 *
 * Body: {
 *   firstSentenceId?: string  // Optional: ID of the first generated sentence
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { firstSentenceId } = body;

    // Update profile to mark onboarding complete
    const [profile] = await db
      .update(userProfiles)
      .set({
        onboardingCompleted: true,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, user.id))
      .returning();

    if (!profile) {
      // Profile doesn't exist - create one with onboarding complete
      const [newProfile] = await db
        .insert(userProfiles)
        .values({
          userId: user.id,
          onboardingCompleted: true,
        })
        .returning();

      return NextResponse.json({
        data: {
          profile: newProfile,
          firstSentenceId: firstSentenceId || null,
        },
      });
    }

    return NextResponse.json({
      data: {
        profile,
        firstSentenceId: firstSentenceId || null,
      },
    });
  } catch (error) {
    console.error('Onboarding complete error:', error);
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}
