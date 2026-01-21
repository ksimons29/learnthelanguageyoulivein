import { NextResponse } from 'next/server';
import { getCurrentUser, getUserLanguagePreference } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { words } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getStarterWords, getTranslation } from '@/lib/data/starter-vocabulary';
import { generateAudio } from '@/lib/audio/tts';
import { uploadAudio } from '@/lib/audio/storage';

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
      console.error('Background TTS generation failed:', err);
    });

    return NextResponse.json({
      data: {
        words: insertedWords,
        count: insertedWords.length,
      },
    });
  } catch (error) {
    console.error('Starter words error:', error);
    return NextResponse.json(
      { error: 'Failed to add starter words' },
      { status: 500 }
    );
  }
}

/**
 * Generate TTS audio for words in background
 * Non-blocking, errors are logged but don't affect the user
 */
async function generateTTSForWords(
  userId: string,
  wordList: typeof words.$inferSelect[],
  languageCode: string
) {
  for (const word of wordList) {
    try {
      const audioBuffer = await generateAudio({
        text: word.originalText,
        languageCode,
      });

      const audioUrl = await uploadAudio(userId, word.id, audioBuffer);

      await db
        .update(words)
        .set({ audioUrl })
        .where(eq(words.id, word.id));
    } catch (err) {
      console.error(`TTS failed for word ${word.id}:`, err);
      // Continue with other words
    }
  }
}
