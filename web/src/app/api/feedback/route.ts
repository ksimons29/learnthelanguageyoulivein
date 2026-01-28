import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { userFeedback, FEEDBACK_TYPES, type FeedbackType } from '@/lib/db/schema';
import { getRequestContext } from '@/lib/logger/api-logger';

/**
 * POST /api/feedback
 *
 * Submit user feedback (bug reports, feature requests, or general feedback).
 * Requires authentication.
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const { logRequest, logResponse, logError } = getRequestContext(request);

  try {
    logRequest();
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Validate request body
    const body = await request.json();
    const { type, message, pageContext } = body as {
      type: string;
      message: string;
      pageContext?: string;
    };

    // Validate type
    const validTypes = FEEDBACK_TYPES.map((t) => t.id);
    if (!type || !validTypes.includes(type as FeedbackType)) {
      return NextResponse.json(
        { error: `Invalid feedback type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required and must be non-empty' },
        { status: 400 }
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { error: 'Message must be less than 5000 characters' },
        { status: 400 }
      );
    }

    // 3. Insert feedback
    const [feedback] = await db
      .insert(userFeedback)
      .values({
        userId: user.id,
        type: type as FeedbackType,
        message: message.trim(),
        pageContext: pageContext || null,
      })
      .returning();

    logResponse(200, Date.now() - startTime);
    return NextResponse.json({
      data: { feedback },
    });
  } catch (error) {
    logError(error, { endpoint: '/api/feedback' });
    logResponse(500, Date.now() - startTime);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to submit feedback',
      },
      { status: 500 }
    );
  }
}
