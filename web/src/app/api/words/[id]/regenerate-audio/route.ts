import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getUserLanguagePreference } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { words } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { generateAudio } from '@/lib/audio/tts';
import { uploadAudio } from '@/lib/audio/storage';
import { getLanguageConfig } from '@/lib/config/languages';

/**
 * Retry helper with exponential backoff for transient API failures.
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      console.warn(`Retry ${attempt}/${maxRetries} after ${delay}ms:`, error instanceof Error ? error.message : error);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error('Retry exhausted');
}

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

    // 4. Get user's language preference to determine correct TTS language
    const languagePreference = await getUserLanguagePreference(user.id);

    // 5. Determine which text and language to use for TTS
    // Audio must ALWAYS be in the TARGET language (language being learned)
    // - If originalText is in target language → use originalText
    // - If originalText is in native language → use translation (which is in target language)
    const isInputInTargetLanguage =
      word.sourceLang.split('-')[0] === languagePreference.targetLanguage.split('-')[0];
    const audioText = isInputInTargetLanguage ? word.originalText : word.translation;
    const ttsLanguage = languagePreference.targetLanguage;

    const languageConfig = getLanguageConfig(ttsLanguage);

    if (!languageConfig) {
      return NextResponse.json(
        { error: `Unsupported language: ${ttsLanguage}` },
        { status: 400 }
      );
    }

    // 6. Generate audio with retry logic (3 retries, exponential backoff: 2s → 4s → 8s)
    const audioBuffer = await withRetry(
      () => generateAudio({ text: audioText, languageCode: ttsLanguage }),
      3,
      2000
    );

    // 7. Upload to storage with retry logic (2 retries, exponential backoff: 1s → 2s)
    const audioUrl = await withRetry(
      () => uploadAudio(user.id, wordId, audioBuffer),
      2,
      1000
    );

    // 8. Update word with audio URL and clear failure flag
    const [updatedWord] = await db
      .update(words)
      .set({ audioUrl, audioGenerationFailed: false, updatedAt: new Date() })
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
