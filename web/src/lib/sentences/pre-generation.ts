/**
 * Sentence Pre-Generation Utility
 *
 * Triggers background sentence generation for a user's words.
 * Used after word capture and starter word injection to ensure
 * users have sentences ready for review mode.
 *
 * Reference: /docs/engineering/implementation_plan.md (Epic 2)
 */

import { db } from '@/lib/db';
import { generatedSentences } from '@/lib/db/schema';
import { getUserLanguagePreference } from '@/lib/supabase/server';
import { generateAudio } from '@/lib/audio/tts';
import { uploadAudio } from '@/lib/audio/storage';
import { getUnusedWordCombinations, generateWordIdsHash } from './word-matcher';
import { generateSentenceWithRetry } from './generator';
import { determineExerciseType } from './exercise-type';

/**
 * Configuration for sentence pre-generation
 */
export interface SentencePreGenerationConfig {
  /** Maximum number of sentences to generate */
  maxSentences?: number;
  /** Minimum number of words per sentence */
  minWordsPerSentence?: number;
}

const DEFAULT_CONFIG: Required<SentencePreGenerationConfig> = {
  maxSentences: 3,
  minWordsPerSentence: 2, // Need at least 2 words to make a sentence interesting
};

/**
 * Trigger sentence pre-generation for a user
 *
 * Runs in the background to generate sentences from unused word combinations.
 * Fire-and-forget - failures are logged but don't affect the caller.
 *
 * @param userId - The user's ID
 * @param config - Optional configuration for generation limits
 */
export async function triggerSentencePreGeneration(
  userId: string,
  config: SentencePreGenerationConfig = {}
): Promise<void> {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  try {
    const languagePreference = await getUserLanguagePreference(userId);

    // Get a few unused word combinations (filtered by language pair)
    // Note: getUnusedWordCombinations expects (userId, nativeLanguage, targetLanguage, config, max)
    const combinations = await getUnusedWordCombinations(
      userId,
      languagePreference.nativeLanguage,
      languagePreference.targetLanguage,
      {
        minWordsPerSentence: mergedConfig.minWordsPerSentence,
        maxWordsPerSentence: 4,
        dueDateWindowDays: 7,
        retrievabilityThreshold: 0.9,
      },
      mergedConfig.maxSentences
    );

    if (combinations.length === 0) {
      console.log(`[SentencePreGen] No unused combinations for user ${userId}`);
      return;
    }

    console.log(
      `[SentencePreGen] Generating ${combinations.length} sentences for user ${userId}`
    );

    // Generate sentences for each combination
    for (const wordGroup of combinations) {
      const result = await generateSentenceWithRetry({
        words: wordGroup,
        targetLanguage: languagePreference.targetLanguage,
        nativeLanguage: languagePreference.nativeLanguage,
      });

      if (!result || !result.isValid) {
        console.error(
          `[SentencePreGen] Invalid sentence generated for words: ${wordGroup.map((w) => w.originalText).join(', ')}`
        );
        continue;
      }

      // Generate audio for the sentence
      let audioUrl: string | null = null;
      try {
        const audioBuffer = await generateAudio({
          text: result.text,
          languageCode: languagePreference.targetLanguage,
        });
        audioUrl = await uploadAudio(userId, 'sentence', audioBuffer);
      } catch {
        // Audio is optional - continue without it
        console.warn('[SentencePreGen] Audio generation failed, continuing without audio');
      }

      const exerciseType = determineExerciseType(wordGroup);

      // Store sentence
      await db.insert(generatedSentences).values({
        userId,
        text: result.text,
        translation: result.translation,
        audioUrl,
        wordIds: wordGroup.map((w) => w.id),
        wordIdsHash: generateWordIdsHash(wordGroup.map((w) => w.id)),
        exerciseType,
      });
    }

    console.log(
      `[SentencePreGen] Successfully generated ${combinations.length} sentences for user ${userId}`
    );
  } catch (error) {
    console.error('[SentencePreGen] Background sentence generation failed:', error);
    // Don't rethrow - this is a background optimization
  }
}
