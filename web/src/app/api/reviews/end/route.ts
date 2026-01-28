import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { reviewSessions } from '@/lib/db/schema';
import { eq, and, isNull, desc } from 'drizzle-orm';
import { getRequestContext } from '@/lib/logger/api-logger';

/**
 * POST /api/reviews/end
 *
 * End the current review session.
 * Marks the session as ended and returns session summary.
 *
 * Body (optional):
 * - sessionId: Specific session to end (defaults to most recent active session)
 *
 * Returns:
 * - session: The ended session with stats
 * - summary: Human-readable summary of the session
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const { logRequest, logResponse, logError } = getRequestContext(request);

  try {
    logRequest();

    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      logResponse(401, Date.now() - startTime);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse optional sessionId from body
    let sessionId: string | undefined;
    try {
      const body = await request.json();
      sessionId = body?.sessionId;
    } catch {
      // Empty body is fine
    }

    // 3. Find the session to end
    let session;
    if (sessionId) {
      // End specific session
      [session] = await db
        .select()
        .from(reviewSessions)
        .where(
          and(
            eq(reviewSessions.id, sessionId),
            eq(reviewSessions.userId, user.id)
          )
        );
    } else {
      // End most recent active session
      [session] = await db
        .select()
        .from(reviewSessions)
        .where(
          and(
            eq(reviewSessions.userId, user.id),
            isNull(reviewSessions.endedAt)
          )
        )
        .orderBy(desc(reviewSessions.startedAt))
        .limit(1);
    }

    if (!session) {
      return NextResponse.json(
        { error: 'No active session found' },
        { status: 404 }
      );
    }

    // 4. End the session
    const [endedSession] = await db
      .update(reviewSessions)
      .set({ endedAt: new Date() })
      .where(eq(reviewSessions.id, session.id))
      .returning();

    // 5. Calculate summary
    const accuracy =
      endedSession.wordsReviewed > 0
        ? Math.round(
            (endedSession.correctCount / endedSession.wordsReviewed) * 100
          )
        : 0;

    const durationMs =
      endedSession.endedAt!.getTime() - endedSession.startedAt.getTime();
    const durationMinutes = Math.round(durationMs / (1000 * 60));

    logResponse(200, Date.now() - startTime);
    return NextResponse.json({
      data: {
        session: endedSession,
        summary: {
          wordsReviewed: endedSession.wordsReviewed,
          correctCount: endedSession.correctCount,
          accuracy,
          durationMinutes,
        },
      },
    });
  } catch (error) {
    logError(error, { endpoint: 'POST /api/reviews/end' });
    logResponse(500, Date.now() - startTime);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to end session',
      },
      { status: 500 }
    );
  }
}
