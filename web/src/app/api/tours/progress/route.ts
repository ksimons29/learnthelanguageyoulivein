import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { userProfiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { type TourId } from '@/lib/tours';
import { getRequestContext } from '@/lib/logger/api-logger';
import { logger } from '@/lib/logger';

/**
 * Valid tour IDs that can be tracked
 */
const VALID_TOUR_IDS: TourId[] = ['today', 'capture', 'review', 'notebook', 'progress'];

/**
 * Map tour IDs to their corresponding database column names
 */
const TOUR_COLUMN_MAP: Record<TourId, keyof typeof userProfiles.$inferSelect> = {
  today: 'tourTodayCompleted',
  capture: 'tourCaptureCompleted',
  review: 'tourReviewCompleted',
  notebook: 'tourNotebookCompleted',
  progress: 'tourProgressCompleted',
};

/**
 * GET /api/tours/progress
 *
 * Returns the tour completion status for the authenticated user.
 *
 * Response: {
 *   data: {
 *     today: boolean,
 *     capture: boolean,
 *     review: boolean,
 *     notebook: boolean,
 *     progress: boolean
 *   }
 * }
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user profile to get tour completion status
    const [profile] = await db
      .select({
        tourTodayCompleted: userProfiles.tourTodayCompleted,
        tourCaptureCompleted: userProfiles.tourCaptureCompleted,
        tourReviewCompleted: userProfiles.tourReviewCompleted,
        tourNotebookCompleted: userProfiles.tourNotebookCompleted,
        tourProgressCompleted: userProfiles.tourProgressCompleted,
      })
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.id))
      .limit(1);

    // If no profile exists, return all tours as not completed
    if (!profile) {
      return NextResponse.json({
        data: {
          today: false,
          capture: false,
          review: false,
          notebook: false,
          progress: false,
        },
      });
    }

    return NextResponse.json({
      data: {
        today: profile.tourTodayCompleted ?? false,
        capture: profile.tourCaptureCompleted ?? false,
        review: profile.tourReviewCompleted ?? false,
        notebook: profile.tourNotebookCompleted ?? false,
        progress: profile.tourProgressCompleted ?? false,
      },
    });
  } catch (error) {
    logger.error({ error: error instanceof Error ? { message: error.message, stack: error.stack } : String(error), endpoint: '/api/tours/progress GET' }, 'Tour progress GET error');
    return NextResponse.json(
      { error: 'Failed to get tour progress' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tours/progress
 *
 * Marks a specific tour as completed for the authenticated user.
 *
 * Body: { tourId: 'today' | 'capture' | 'review' | 'notebook' | 'progress' }
 *
 * Response: {
 *   data: {
 *     tourId: string,
 *     completed: true
 *   }
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

    // Parse request body
    const body = await request.json().catch(() => ({}));
    const { tourId } = body as { tourId?: string };

    // Validate tourId
    if (!tourId || !VALID_TOUR_IDS.includes(tourId as TourId)) {
      return NextResponse.json(
        {
          error: 'Invalid tourId',
          message: `tourId must be one of: ${VALID_TOUR_IDS.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const validTourId = tourId as TourId;
    const columnName = TOUR_COLUMN_MAP[validTourId];

    // Update the tour completion status
    // Use .returning({ id }) to check if update affected any rows
    const result = await db
      .update(userProfiles)
      .set({
        [columnName]: true,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, user.id))
      .returning({ id: userProfiles.id });

    if (result.length === 0) {
      // Profile doesn't exist - create one with the tour marked complete
      await db.insert(userProfiles).values({
        userId: user.id,
        [columnName]: true,
      });
    }

    logResponse(200, Date.now() - startTime);
    return NextResponse.json({
      data: {
        tourId: validTourId,
        completed: true,
      },
    });
  } catch (error) {
    logError(error, { endpoint: '/api/tours/progress POST' });
    logResponse(500, Date.now() - startTime);
    return NextResponse.json(
      { error: 'Failed to update tour progress' },
      { status: 500 }
    );
  }
}
