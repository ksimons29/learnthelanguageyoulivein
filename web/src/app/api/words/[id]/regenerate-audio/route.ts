import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getUserLanguagePreference } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { words } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { generateVerifiedAudio } from '@/lib/audio/tts';
import { uploadAudio } from '@/lib/audio/storage';
import { getLanguageConfig } from '@/lib/config/languages';
import { withRetry } from '@/lib/utils/retry';
import { getRequestContext } from '@/lib/logger/api-logger';

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
  const startTime = Date.now();
  const { logRequest, logResponse, logError } = getRequestContext(request);

  try {
    logRequest();
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

    // 6. Generate audio with verification and retry logic
    // Issue #134: Use verified audio to track verification status
    const result = await withRetry(
      () => generateVerifiedAudio({
        text: audioText,
        languageCode: ttsLanguage,
        userId: user.id,
      }),
      2, // Fewer outer retries since verification has internal retries
      2000
    );

    // 7. Upload to storage with retry logic (2 retries, exponential backoff: 1s → 2s)
    const audioUrl = await withRetry(
      () => uploadAudio(user.id, wordId, result.buffer),
      2,
      1000
    );

    // 8. Update word with audio URL and clear/set flags
    const [updatedWord] = await db
      .update(words)
      .set({
        audioUrl,
        audioGenerationFailed: false,
        audioVerificationFailed: !result.verified,
        updatedAt: new Date(),
      })
      .where(eq(words.id, wordId))
      .returning();

    logResponse(200, Date.now() - startTime);
    return NextResponse.json({
      data: { word: updatedWord },
    });
  } catch (error) {
    logError(error, { endpoint: '/api/words/[id]/regenerate-audio' });
    logResponse(500, Date.now() - startTime);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to regenerate audio',
      },
      { status: 500 }
    );
  }
}
