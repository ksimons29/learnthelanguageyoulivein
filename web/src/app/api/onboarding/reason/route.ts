import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { userProfiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { LEARNING_REASONS } from '@/lib/db/schema/user-profiles';
import { getRequestContext } from '@/lib/logger/api-logger';

/**
 * POST /api/onboarding/reason
 *
 * Saves user's learning reasons during onboarding.
 * Supports multi-select by storing as JSON array string.
 *
 * Body: {
 *   learningReasons: string[] // Array of reason IDs
 * }
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const { logRequest, logResponse, logError } = getRequestContext(request);

  try {
    logRequest();
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { learningReasons } = body;

    // Validate learning reasons
    if (!learningReasons || !Array.isArray(learningReasons)) {
      return NextResponse.json(
        { error: 'learningReasons must be an array' },
        { status: 400 }
      );
    }

    // Validate each reason ID
    const validReasonIds = LEARNING_REASONS.map((r) => r.id) as string[];
    const invalidReasons = learningReasons.filter(
      (r: string) => !validReasonIds.includes(r)
    );

    if (invalidReasons.length > 0) {
      return NextResponse.json(
        { error: `Invalid reason IDs: ${invalidReasons.join(', ')}` },
        { status: 400 }
      );
    }

    // Store as JSON array string for multi-select support
    const reasonsJson = JSON.stringify(learningReasons);

    // Update user profile
    const [profile] = await db
      .update(userProfiles)
      .set({
        learningReason: reasonsJson,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, user.id))
      .returning();

    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found. Please complete language selection first.' },
        { status: 404 }
      );
    }

    logResponse(200, Date.now() - startTime);
    return NextResponse.json({
      data: { profile },
    });
  } catch (error) {
    logError(error, { endpoint: '/api/onboarding/reason' });
    logResponse(500, Date.now() - startTime);
    return NextResponse.json(
      { error: 'Failed to save learning reasons' },
      { status: 500 }
    );
  }
}
