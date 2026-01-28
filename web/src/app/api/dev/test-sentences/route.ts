import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generatedSentences, words } from '@/lib/db/schema';
import { getUnusedWordCombinations, generateWordIdsHash } from '@/lib/sentences/word-matcher';
import { generateSentenceWithRetry } from '@/lib/sentences/generator';
import { determineExerciseType } from '@/lib/sentences/exercise-type';
import { generateAudio } from '@/lib/audio/tts';
import { uploadSentenceAudio } from '@/lib/audio/storage';
import { DEFAULT_LANGUAGE_PREFERENCE } from '@/lib/config/languages';
import { eq, sql } from 'drizzle-orm';
import { getRequestContext } from '@/lib/logger/api-logger';

/**
 * POST /api/dev/test-sentences
 *
 * DEVELOPMENT ONLY - Test sentence generation for a specific user.
 * Bypasses authentication for testing purposes.
 */

const IS_DEV = process.env.NODE_ENV === 'development';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const { log, logRequest, logResponse, logError } = getRequestContext(request);

  if (!IS_DEV) {
    logResponse(403, Date.now() - startTime);
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  try {
    logRequest();
    const body = await request.json();
    const {
      userId,
      nativeLanguage = 'en', // Default to English for testing
      targetLanguage = 'pt-PT', // Default to Portuguese for testing
      lookaheadDays = 30,
      maxSentences = 5,
      skipAudio = true
    } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // First, let's see what words we have
    const wordCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(words)
      .where(eq(words.userId, userId));

    log.info({ wordCount: wordCount[0]?.count }, 'Total words for user');

    // Get words by category
    const categoryStats = await db
      .select({
        category: words.category,
        count: sql<number>`count(*)`,
      })
      .from(words)
      .where(eq(words.userId, userId))
      .groupBy(words.category);

    log.info({ categoryStats }, 'Words by category');

    // Get unused word combinations (filtered by language pair)
    const unusedCombinations = await getUnusedWordCombinations(
      userId,
      nativeLanguage,
      targetLanguage,
      {
        minWordsPerSentence: 2,
        maxWordsPerSentence: 5, // Increased for more challenging sentences
        dueDateWindowDays: lookaheadDays,
        retrievabilityThreshold: 0.9,
      },
      maxSentences
    );

    log.info({ count: unusedCombinations.length }, 'Found unused combinations');

    if (unusedCombinations.length === 0) {
      return NextResponse.json({
        data: {
          message: 'No word combinations available',
          wordCount: wordCount[0]?.count,
          categoryStats,
          sentencesGenerated: 0,
        },
      });
    }

    // Generate sentences
    const languagePreference = DEFAULT_LANGUAGE_PREFERENCE;
    let sentencesGenerated = 0;
    const generatedResults: Array<{
      words: string[];
      sentence: string;
      translation: string;
      exerciseType: string;
    }> = [];

    for (const wordGroup of unusedCombinations) {
      log.info({ words: wordGroup.map(w => w.originalText) }, 'Generating sentence');

      const result = await generateSentenceWithRetry({
        words: wordGroup,
        targetLanguage: languagePreference.targetLanguage,
        nativeLanguage: languagePreference.nativeLanguage,
      });

      if (!result) {
        log.warn({ words: wordGroup.map(w => w.originalText) }, 'Failed to generate sentence');
        continue;
      }

      log.info({ sentence: result.text }, 'Sentence generated');

      // Generate audio (optional)
      let audioUrl: string | null = null;
      if (!skipAudio) {
        try {
          const audioBuffer = await generateAudio({
            text: result.text,
            languageCode: languagePreference.targetLanguage,
          });
          audioUrl = await uploadSentenceAudio(userId, audioBuffer);
        } catch (audioError) {
          log.error({ error: audioError instanceof Error ? audioError.message : String(audioError) }, 'Audio generation failed');
        }
      }

      // Determine exercise type
      const exerciseType = determineExerciseType(wordGroup);

      // Store in database
      await db.insert(generatedSentences).values({
        userId,
        text: result.text,
        audioUrl,
        wordIds: wordGroup.map(w => w.id),
        wordIdsHash: generateWordIdsHash(wordGroup.map(w => w.id)),
        exerciseType,
        usedAt: null,
      });

      sentencesGenerated++;
      generatedResults.push({
        words: wordGroup.map(w => w.originalText),
        sentence: result.text,
        translation: result.translation,
        exerciseType,
      });
    }

    logResponse(200, Date.now() - startTime);
    return NextResponse.json({
      data: {
        userId,
        wordCount: wordCount[0]?.count,
        categoryStats,
        combinationsFound: unusedCombinations.length,
        sentencesGenerated,
        sentences: generatedResults,
      },
    });
  } catch (error) {
    logError(error, { endpoint: '/api/dev/test-sentences' });
    logResponse(500, Date.now() - startTime);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate sentences' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/dev/test-sentences
 *
 * DEVELOPMENT ONLY - Delete all unused sentences for a user.
 * Use this to clean up sentences generated with bad language filtering.
 */
export async function DELETE(request: NextRequest) {
  const startTime = Date.now();
  const { log, logRequest, logResponse, logError } = getRequestContext(request);

  if (!IS_DEV) {
    logResponse(403, Date.now() - startTime);
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  try {
    logRequest();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Delete all unused sentences (usedAt IS NULL) for this user
    const deleted = await db
      .delete(generatedSentences)
      .where(eq(generatedSentences.userId, userId))
      .returning({ id: generatedSentences.id });

    logResponse(200, Date.now() - startTime);
    return NextResponse.json({
      data: {
        deletedCount: deleted.length,
        message: `Deleted ${deleted.length} sentences for user ${userId}`,
      },
    });
  } catch (error) {
    logError(error, { endpoint: '/api/dev/test-sentences DELETE' });
    logResponse(500, Date.now() - startTime);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete sentences' },
      { status: 500 }
    );
  }
}
