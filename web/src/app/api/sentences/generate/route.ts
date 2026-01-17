import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { generatedSentences } from '@/lib/db/schema';
import {
  getUnusedWordCombinations,
  generateSentenceWithRetry,
  generateWordIdsHash,
  determineExerciseType,
} from '@/lib/sentences';
import { generateAudio } from '@/lib/audio/tts';
import { uploadSentenceAudio } from '@/lib/audio/storage';
import { DEFAULT_LANGUAGE_PREFERENCE } from '@/lib/config/languages';

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

    // 3. Get unused word combinations
    const unusedCombinations = await getUnusedWordCombinations(
      user.id,
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

    // 4. Get language preference (default for now)
    // TODO: Fetch from user profile
    const languagePreference = DEFAULT_LANGUAGE_PREFERENCE;

    // 5. Generate sentences for each combination
    let sentencesGenerated = 0;
    const errors: string[] = [];

    for (const wordGroup of unusedCombinations) {
      try {
        // 5a. Generate sentence with GPT
        const result = await generateSentenceWithRetry({
          words: wordGroup,
          targetLanguage: languagePreference.targetLanguage,
          nativeLanguage: languagePreference.nativeLanguage,
        });

        if (!result) {
          errors.push(`Failed to generate sentence for words: ${wordGroup.map((w) => w.originalText).join(', ')}`);
          continue;
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

        // 5d. Store generated sentence
        await db.insert(generatedSentences).values({
          userId: user.id,
          text: result.text,
          audioUrl,
          wordIds: wordGroup.map((w) => w.id),
          wordIdsHash: generateWordIdsHash(wordGroup.map((w) => w.id)),
          exerciseType,
          usedAt: null, // Pre-generated, not yet shown
        });

        sentencesGenerated++;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Error processing word group: ${errorMsg}`);
        console.error('Sentence generation error:', error);
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
