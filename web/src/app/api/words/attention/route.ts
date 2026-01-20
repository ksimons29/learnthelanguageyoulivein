import { NextResponse } from 'next/server';
import { getCurrentUser, getUserLanguagePreference } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { words, generatedSentences } from '@/lib/db/schema';
import { eq, and, or, gte, desc, inArray } from 'drizzle-orm';

/**
 * GET /api/words/attention
 *
 * Returns words that need extra attention - struggling words with 3+ lapses.
 * These are words the user keeps forgetting and need reinforcement.
 *
 * Response: {
 *   data: {
 *     words: Word[],
 *     sentences: Map<wordId, GeneratedSentence | null>
 *   }
 * }
 */
export async function GET() {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get user's language preference
    const languagePreference = await getUserLanguagePreference(user.id);

    // 3. Fetch struggling words (lapseCount >= 3)
    // ALWAYS filter by user's target language
    const strugglingWords = await db
      .select()
      .from(words)
      .where(
        and(
          eq(words.userId, user.id),
          or(
            eq(words.sourceLang, languagePreference.targetLanguage),
            eq(words.targetLang, languagePreference.targetLanguage)
          ),
          gte(words.lapseCount, 3)
        )
      )
      .orderBy(desc(words.lapseCount))
      .limit(10);

    // 4. For each struggling word, try to find a sentence that includes it
    const wordSentences: Record<string, {
      text: string;
      translation: string | null;
    } | null> = {};

    if (strugglingWords.length > 0) {
      const wordIds = strugglingWords.map((w) => w.id);

      // Find sentences that contain any of these words
      const sentences = await db
        .select()
        .from(generatedSentences)
        .where(eq(generatedSentences.userId, user.id))
        .limit(50);

      // Map words to their sentences
      for (const word of strugglingWords) {
        const matchingSentence = sentences.find((s) =>
          s.wordIds.includes(word.id)
        );
        wordSentences[word.id] = matchingSentence
          ? { text: matchingSentence.text, translation: matchingSentence.translation }
          : null;
      }
    }

    return NextResponse.json({
      data: {
        words: strugglingWords,
        sentences: wordSentences,
      },
    });
  } catch (error) {
    console.error('Attention words retrieval error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to retrieve attention words',
      },
      { status: 500 }
    );
  }
}
