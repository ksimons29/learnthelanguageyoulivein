import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { words } from '@/lib/db/schema';
import { deleteAudio } from '@/lib/audio/storage';
import { eq, and } from 'drizzle-orm';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/words/:id
 *
 * Get a specific word by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get word ID from params
    const { id } = await params;

    // 3. Query word
    const [word] = await db
      .select()
      .from(words)
      .where(and(eq(words.id, id), eq(words.userId, user.id)));

    if (!word) {
      return NextResponse.json({ error: 'Word not found' }, { status: 404 });
    }

    return NextResponse.json({
      data: { word },
    });
  } catch (error) {
    console.error('Word retrieval error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to retrieve word',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/words/:id
 *
 * Update a word (e.g., change category, add tags)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get word ID from params
    const { id } = await params;

    // 3. Parse request body
    const body = await request.json();
    const { category } = body;

    // 4. Build update object (only allow certain fields to be updated)
    const updates: Partial<typeof words.$inferInsert> = {};

    if (category) {
      updates.category = category;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid updates provided' },
        { status: 400 }
      );
    }

    // Add updatedAt timestamp
    updates.updatedAt = new Date();

    // 5. Update word
    const [updatedWord] = await db
      .update(words)
      .set(updates)
      .where(and(eq(words.id, id), eq(words.userId, user.id)))
      .returning();

    if (!updatedWord) {
      return NextResponse.json({ error: 'Word not found' }, { status: 404 });
    }

    return NextResponse.json({
      data: { word: updatedWord },
    });
  } catch (error) {
    console.error('Word update error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to update word',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/words/:id
 *
 * Delete a word and its associated audio
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get word ID from params
    const { id } = await params;

    // 3. Get word to check ownership and get audio URL
    const [word] = await db
      .select()
      .from(words)
      .where(and(eq(words.id, id), eq(words.userId, user.id)));

    if (!word) {
      return NextResponse.json({ error: 'Word not found' }, { status: 404 });
    }

    // 4. Delete audio from storage if exists
    if (word.audioUrl) {
      try {
        await deleteAudio(user.id, id);
      } catch (audioError) {
        console.error('Failed to delete audio (non-fatal):', audioError);
        // Continue with word deletion even if audio deletion fails
      }
    }

    // 5. Delete word from database
    await db.delete(words).where(eq(words.id, id));

    return NextResponse.json({
      data: { success: true },
    });
  } catch (error) {
    console.error('Word deletion error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to delete word',
      },
      { status: 500 }
    );
  }
}
