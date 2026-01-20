import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { words } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { generateAudio } from '@/lib/audio/tts';
import { uploadAudio } from '@/lib/audio/storage';
import { getLanguageConfig } from '@/lib/config/languages';

/**
 * POST /api/words/[id]/regenerate-audio
 *
 * Regenerates TTS audio for a word when the original generation failed or timed out.
 * This is a retry mechanism for audio generation.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: wordId } = await params;

    // 2. Get the word and verify ownership
    const [word] = await db
      .select()
      .from(words)
      .where(and(eq(words.id, wordId), eq(words.userId, user.id)));

    if (!word) {
      return NextResponse.json(
        { error: 'Word not found or not owned by user' },
        { status: 404 }
      );
    }

    // 3. Skip if audio already exists
    if (word.audioUrl) {
      return NextResponse.json({
        data: { word, message: 'Audio already exists' },
      });
    }

    // 4. Determine which language to use for TTS
    // The original text could be in sourceLang or targetLang depending on capture flow
    const ttsLanguage = word.sourceLang;
    const languageConfig = getLanguageConfig(ttsLanguage);

    if (!languageConfig) {
      return NextResponse.json(
        { error: `Unsupported language: ${ttsLanguage}` },
        { status: 400 }
      );
    }

    // 5. Generate audio
    const audioBuffer = await generateAudio({
      text: word.originalText,
      languageCode: ttsLanguage,
    });

    // 6. Upload to storage
    const audioUrl = await uploadAudio(user.id, wordId, audioBuffer);

    // 7. Update word with audio URL
    const [updatedWord] = await db
      .update(words)
      .set({ audioUrl, updatedAt: new Date() })
      .where(eq(words.id, wordId))
      .returning();

    return NextResponse.json({
      data: { word: updatedWord },
    });
  } catch (error) {
    console.error('Audio regeneration error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to regenerate audio',
      },
      { status: 500 }
    );
  }
}
