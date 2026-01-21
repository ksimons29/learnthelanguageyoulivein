import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getUserLanguagePreference } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { generatedSentences } from '@/lib/db/schema';
import { getUnusedWordCombinations, generateWordIdsHash } from '@/lib/sentences/word-matcher';
import { generateSentenceWithRetry } from '@/lib/sentences/generator';
import { determineExerciseType } from '@/lib/sentences/exercise-type';
import { generateAudio } from '@/lib/audio/tts';
import { uploadSentenceAudio } from '@/lib/audio/storage';

/**
 * POST /api/sentences/generate
 *
 * Batch pre-generation of sentences for upcoming reviews.
 *
 * Should be triggered:
 * - On app foreground (via visibility change)
 * - After word capture
 * - On connectivity restoration
 *
 * Reference: /docs/engineering/implementation_plan.md (Epic 2)
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse request body
    const body = await request.json().catch(() => ({}));
    const lookaheadDays = body.lookaheadDays || 7;
    const maxSentences = Math.min(body.maxSentences || 20, 50); // Cap at 50

    // 3. Get user's language preference (needed for word filtering)
    const languagePreference = await getUserLanguagePreference(user.id);

    // 4. Get unused word combinations (filtered by target language)
    // IMPORTANT: This filter ensures sentences only contain words that
    // will be retrievable by sentences/next API (which uses same filter)
    const unusedCombinations = await getUnusedWordCombinations(
      user.id,
      languagePreference.targetLanguage,
      {
        minWordsPerSentence: 2,
        maxWordsPerSentence: 4,
        dueDateWindowDays: lookaheadDays,
        retrievabilityThreshold: 0.9,
      },
      maxSentences
    );

    if (unusedCombinations.length === 0) {
      return NextResponse.json({
        data: {
          sentencesGenerated: 0,
          combinationsAvailable: 0,
          message: 'No word combinations available. Capture more words or wait for reviews to become due.',
        },
      });
    }

    // 5. Generate sentences for each combination in parallel
    // Using Promise.allSettled to handle individual failures gracefully
    // Process in batches of 5 to avoid overwhelming OpenAI rate limits
    const BATCH_SIZE = 5;
    let sentencesGenerated = 0;
    const errors: string[] = [];

    const processSentence = async (wordGroup: typeof unusedCombinations[number]) => {
      // 5a. Generate sentence with GPT
      const result = await generateSentenceWithRetry({
        words: wordGroup,
        targetLanguage: languagePreference.targetLanguage,
        nativeLanguage: languagePreference.nativeLanguage,
      });

      if (!result) {
        throw new Error(`Failed to generate sentence for words: ${wordGroup.map((w) => w.originalText).join(', ')}`);
      }

      // 5b. Generate audio for sentence (non-fatal if fails)
      let audioUrl: string | null = null;
      try {
        const audioBuffer = await generateAudio({
          text: result.text,
          languageCode: languagePreference.targetLanguage,
        });
        audioUrl = await uploadSentenceAudio(user.id, audioBuffer);
      } catch (audioError) {
        console.error('Sentence audio generation failed (non-fatal):', audioError);
        // Continue without audio - sentence is still usable
      }

      // 5c. Determine exercise type based on word mastery
      const exerciseType = determineExerciseType(wordGroup);

      // 5d. Store generated sentence (use onConflictDoNothing to handle race conditions)
      const wordIdsHash = generateWordIdsHash(wordGroup.map((w) => w.id));
      const inserted = await db
        .insert(generatedSentences)
        .values({
          userId: user.id,
          text: result.text,
          translation: result.translation,
          audioUrl,
          wordIds: wordGroup.map((w) => w.id),
          wordIdsHash,
          exerciseType,
          usedAt: null, // Pre-generated, not yet shown
        })
        .onConflictDoNothing({ target: generatedSentences.wordIdsHash })
        .returning({ id: generatedSentences.id });

      return inserted.length > 0;
    };

    // Process in batches to respect rate limits while still parallelizing
    for (let i = 0; i < unusedCombinations.length; i += BATCH_SIZE) {
      const batch = unusedCombinations.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(batch.map(processSentence));

      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          sentencesGenerated++;
        } else if (result.status === 'rejected') {
          const errorMsg = result.reason instanceof Error ? result.reason.message : 'Unknown error';
          errors.push(`Error processing word group: ${errorMsg}`);
          console.error('Sentence generation error:', result.reason);
        }
      }
    }

    return NextResponse.json({
      data: {
        sentencesGenerated,
        combinationsAvailable: unusedCombinations.length,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error) {
    console.error('Sentence generation endpoint error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate sentences',
      },
      { status: 500 }
    );
  }
}
