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

/**
 * POST /api/dev/test-sentences
 *
 * DEVELOPMENT ONLY - Test sentence generation for a specific user.
 * Bypasses authentication for testing purposes.
 */

const IS_DEV = process.env.NODE_ENV === 'development';

export async function POST(request: NextRequest) {
  if (!IS_DEV) {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  try {
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

    console.log(`Total words for user: ${wordCount[0]?.count}`);

    // Get words by category
    const categoryStats = await db
      .select({
        category: words.category,
        count: sql<number>`count(*)`,
      })
      .from(words)
      .where(eq(words.userId, userId))
      .groupBy(words.category);

    console.log('Words by category:', categoryStats);

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

    console.log(`Found ${unusedCombinations.length} unused combinations`);

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
      console.log(`Generating sentence for: ${wordGroup.map(w => w.originalText).join(', ')}`);

      const result = await generateSentenceWithRetry({
        words: wordGroup,
        targetLanguage: languagePreference.targetLanguage,
        nativeLanguage: languagePreference.nativeLanguage,
      });

      if (!result) {
        console.log('Failed to generate sentence');
        continue;
      }

      console.log(`Generated: "${result.text}"`);

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
          console.error('Audio generation failed:', audioError);
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
    console.error('Test sentences error:', error);
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
  if (!IS_DEV) {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  try {
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

    return NextResponse.json({
      data: {
        deletedCount: deleted.length,
        message: `Deleted ${deleted.length} sentences for user ${userId}`,
      },
    });
  } catch (error) {
    console.error('Delete sentences error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete sentences' },
      { status: 500 }
    );
  }
}
