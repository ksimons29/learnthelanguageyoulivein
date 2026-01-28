import { NextResponse } from 'next/server';
import { getCurrentUser, getUserLanguagePreference } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { words } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getStarterWords, getTranslation } from '@/lib/data/starter-vocabulary';
import { generateVerifiedAudio } from '@/lib/audio/tts';
import { uploadAudio } from '@/lib/audio/storage';
import { triggerSentencePreGeneration } from '@/lib/sentences';
import { withRetry, sleep } from '@/lib/utils/retry';
import { logger } from '@/lib/logger';

/**
 * POST /api/onboarding/starter-words
 *
 * Injects curated starter words for a new user based on their language preferences.
 * Called during onboarding after language selection.
 *
 * Features:
 * - Idempotent: Won't duplicate words if called multiple times
 * - Async TTS: Audio generation happens in background, non-blocking
 * - Uses user's actual language preferences from profile
 *
 * Returns:
 * - { data: { words: Word[], count: number } }
 */
export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's language preferences
    const prefs = await getUserLanguagePreference(user.id);
    const { targetLanguage, nativeLanguage } = prefs;

    // Get starter vocabulary for this target language
    const starterWords = getStarterWords(targetLanguage);
    if (!starterWords) {
      return NextResponse.json(
        { error: `No starter words available for ${targetLanguage}` },
        { status: 400 }
      );
    }

    // Check which starter words user already has (for idempotency)
    const existingWords = await db
      .select({ originalText: words.originalText })
      .from(words)
      .where(
        and(
          eq(words.userId, user.id),
          eq(words.sourceLang, targetLanguage)
        )
      );

    const existingTexts = new Set(
      existingWords.map((w) => w.originalText.toLowerCase())
    );

    // Filter to only new words
    const newStarterWords = starterWords.filter(
      (word) => !existingTexts.has(word.text.toLowerCase())
    );

    if (newStarterWords.length === 0) {
      // User already has all starter words
      const allUserWords = await db
        .select()
        .from(words)
        .where(eq(words.userId, user.id))
        .limit(10);

      return NextResponse.json({
        data: {
          words: allUserWords,
          count: 0,
          message: 'Starter words already exist',
        },
      });
    }

    // Insert starter words
    // Words with initialLapseCount > 0 simulate "struggling" words for Boss Round
    const insertedWords = await db
      .insert(words)
      .values(
        newStarterWords.map((word) => {
          const lapseCount = word.initialLapseCount ?? 0;
          // Words with lapses have lower stability (need more review)
          const stability = lapseCount > 0 ? Math.max(1, 10 - lapseCount * 2) : 1.0;
          const difficulty = lapseCount > 0 ? Math.min(10, 5 + lapseCount * 0.5) : 5.0;

          return {
            userId: user.id,
            originalText: word.text,
            translation: getTranslation(word, nativeLanguage),
            language: 'target' as const,
            sourceLang: targetLanguage,
            targetLang: nativeLanguage,
            translationProvider: 'starter-vocabulary',
            category: word.category,
            categoryConfidence: 1.0, // Pre-curated, high confidence
            difficulty,
            stability,
            retrievability: 1.0,
            nextReviewDate: new Date(),
            reviewCount: lapseCount > 0 ? lapseCount + 1 : 0, // Simulate some reviews
            lapseCount,
            consecutiveCorrectSessions: 0,
            masteryStatus: 'learning' as const,
          };
        })
      )
      .returning();

    // Generate TTS audio in the background (fire-and-forget)
    // Don't await - let it happen async to avoid blocking response
    generateTTSForWords(user.id, insertedWords, targetLanguage).catch((err) => {
      logger.error({ error: err instanceof Error ? err.message : String(err), userId: user.id }, 'Background TTS generation failed');
    });

    // Pre-generate sentences using the new starter words (fire-and-forget)
    // This ensures users can immediately do sentence-based reviews
    triggerSentencePreGeneration(user.id, { maxSentences: 5 }).catch((err) => {
      logger.error({ error: err instanceof Error ? err.message : String(err), userId: user.id }, 'Background sentence generation failed');
    });

    return NextResponse.json({
      data: {
        words: insertedWords,
        count: insertedWords.length,
      },
    });
  } catch (error) {
    logger.error({ error: error instanceof Error ? { message: error.message, stack: error.stack } : String(error), endpoint: '/api/onboarding/starter-words' }, 'Starter words error');
    return NextResponse.json(
      { error: 'Failed to add starter words' },
      { status: 500 }
    );
  }
}

/**
 * Generate TTS audio for starter words in background
 *
 * Features:
 * - Retry logic with exponential backoff (3 retries for TTS, 2 for upload)
 * - Batch processing to avoid rate limits (3 words at a time)
 * - Marks words as audioGenerationFailed=true on failure (enables retry button)
 * - Small delay between batches to respect API rate limits
 *
 * This matches the robust audio generation in /api/words/route.ts
 */
async function generateTTSForWords(
  userId: string,
  wordList: typeof words.$inferSelect[],
  languageCode: string
) {
  // Reduced batch size and increased delay to account for Whisper verification
  const BATCH_SIZE = 2; // Process 2 words at a time (verification adds latency)
  const BATCH_DELAY_MS = 1000; // 1s delay between batches

  const processWord = async (word: typeof words.$inferSelect) => {
    try {
      // TTS generation with verification (catches OpenAI reliability issues)
      // Issue #134: Now returns { buffer, verified } so we can flag unverified audio
      const result = await withRetry(
        () => generateVerifiedAudio({ text: word.originalText, languageCode }),
        2, // Fewer outer retries since verification has internal retries
        2000
      );

      // Storage upload with retry (2 retries, 1s base delay)
      const audioUrl = await withRetry(
        () => uploadAudio(userId, word.id, result.buffer),
        2,
        1000
      );

      // Success - update word with audio URL and verification status
      await db
        .update(words)
        .set({
          audioUrl,
          audioGenerationFailed: false,
          audioVerificationFailed: !result.verified,
        })
        .where(eq(words.id, word.id));

      return { wordId: word.id, success: true };
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : String(error), word: word.originalText }, 'TTS failed for starter word');
      // Mark word as failed so client can show retry button
      await db
        .update(words)
        .set({ audioGenerationFailed: true })
        .where(eq(words.id, word.id));

      return { wordId: word.id, success: false, error };
    }
  };

  // Process words in batches to avoid rate limits
  for (let i = 0; i < wordList.length; i += BATCH_SIZE) {
    const batch = wordList.slice(i, i + BATCH_SIZE);

    // Process batch in parallel
    const results = await Promise.allSettled(batch.map(processWord));

    // Log batch results
    const succeeded = results.filter(
      (r) => r.status === 'fulfilled' && r.value.success
    ).length;
    const failed = results.filter(
      (r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)
    ).length;

    if (failed > 0) {
      logger.warn({ batch: Math.floor(i / BATCH_SIZE) + 1, succeeded, failed }, 'Starter words TTS batch partial failure');
    }

    // Add delay before next batch (except for last batch)
    if (i + BATCH_SIZE < wordList.length) {
      await sleep(BATCH_DELAY_MS);
    }
  }
}
