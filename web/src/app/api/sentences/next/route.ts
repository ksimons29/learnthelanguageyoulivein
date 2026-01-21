import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getUserLanguagePreference } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { generatedSentences, words } from '@/lib/db/schema';
import { eq, and, isNull, inArray, or } from 'drizzle-orm';

/**
 * GET /api/sentences/next
 *
 * Get the next sentence for review.
 *
 * IMPORTANT: We return any UNUSED sentence, regardless of whether all words
 * are "due". This is intentional because:
 *
 * 1. Sentences are the PRIMARY learning mode - they provide context
 * 2. The old "allWordsDue" check caused a cascade bug:
 *    - If word A was reviewed individually, it wasn't "due" anymore
 *    - This blocked ALL sentences containing word A
 *    - With 900 words, this quickly orphaned ALL sentences
 * 3. Reviewing a sentence reviews ALL its words together anyway
 * 4. Word mode is the fallback when no sentences are available
 *
 * GUARDRAIL: Self-healing orphaned sentences
 * If a sentence references words that no longer exist (user deleted them),
 * we automatically delete the orphaned sentence. This prevents stale data
 * from accumulating and ensures the system self-heals over time.
 *
 * Query params:
 * - sessionId: Current review session ID (optional)
 *
 * Reference: /docs/engineering/implementation_plan.md (Epic 2)
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get user's language preference for filtering
    const languagePreference = await getUserLanguagePreference(user.id);

    // 3. Parse query parameters
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    // 4. Find unused sentences (get a few in case some have missing words)
    const now = new Date();

    const unusedSentences = await db
      .select()
      .from(generatedSentences)
      .where(
        and(
          eq(generatedSentences.userId, user.id),
          isNull(generatedSentences.usedAt)
        )
      )
      .limit(5);

    // Early exit if no sentences
    if (unusedSentences.length === 0) {
      return NextResponse.json({
        data: {
          sentence: null,
          targetWords: [],
          message: 'No pre-generated sentences available. Generate more with POST /api/sentences/generate.',
        },
      });
    }

    // 5. OPTIMIZATION: Batch fetch all words for all sentences in ONE query
    // This fixes the N+1 query problem (was: 1 query per sentence)
    const allWordIds = new Set<string>();
    const validSentences: typeof unusedSentences = [];
    const orphanedSentenceIds: string[] = [];

    // Collect all word IDs and filter out sentences with empty wordIds
    for (const sentence of unusedSentences) {
      if (!sentence.wordIds || sentence.wordIds.length === 0) {
        console.warn(
          `[GUARDRAIL] Sentence ${sentence.id} has empty wordIds. Marking for deletion.`
        );
        orphanedSentenceIds.push(sentence.id);
      } else {
        validSentences.push(sentence);
        for (const wordId of sentence.wordIds) {
          allWordIds.add(wordId);
        }
      }
    }

    // Fetch ALL words for all sentences in a single query
    const allWords = allWordIds.size > 0
      ? await db
          .select()
          .from(words)
          .where(
            and(
              eq(words.userId, user.id),
              or(
                eq(words.sourceLang, languagePreference.targetLanguage),
                eq(words.targetLang, languagePreference.targetLanguage)
              ),
              inArray(words.id, Array.from(allWordIds))
            )
          )
      : [];

    // Create a lookup map for quick word retrieval
    const wordsMap = new Map(allWords.map(w => [w.id, w]));

    // 6. Find the first valid sentence with all words intact
    for (const sentence of validSentences) {
      // Get words for this sentence from the map
      const sentenceWords = sentence.wordIds
        .map(id => wordsMap.get(id))
        .filter((w): w is typeof allWords[0] => w !== undefined);

      // Verify we found all words (data integrity check)
      // GUARDRAIL: Auto-delete orphaned sentences (words were deleted)
      if (sentenceWords.length !== sentence.wordIds.length) {
        console.warn(
          `[GUARDRAIL] Sentence ${sentence.id} has missing words. Expected ${sentence.wordIds.length}, found ${sentenceWords.length}. Marking for deletion.`
        );
        orphanedSentenceIds.push(sentence.id);
        continue;
      }

      // Found a valid sentence with all words! Mark as used and return.
      // NOTE: We no longer check if words are "due" - see docstring above.
      await db
        .update(generatedSentences)
        .set({
          usedAt: now,
          sessionId: sessionId || null,
        })
        .where(eq(generatedSentences.id, sentence.id));

      return NextResponse.json({
        data: {
          sentence: {
            ...sentence,
            usedAt: now,
          },
          targetWords: sentenceWords,
        },
      });
    }

    // 7. GUARDRAIL: Clean up any orphaned sentences we found
    if (orphanedSentenceIds.length > 0) {
      console.log(`[GUARDRAIL] Auto-deleting ${orphanedSentenceIds.length} orphaned sentences`);
      await db
        .delete(generatedSentences)
        .where(inArray(generatedSentences.id, orphanedSentenceIds));
    }

    // 8. No valid sentence found
    return NextResponse.json({
      data: {
        sentence: null,
        targetWords: [],
        orphanedSentencesDeleted: orphanedSentenceIds.length > 0 ? orphanedSentenceIds.length : undefined,
        message: 'No pre-generated sentences available. Generate more with POST /api/sentences/generate.',
      },
    });
  } catch (error) {
    console.error('Get next sentence error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get next sentence',
      },
      { status: 500 }
    );
  }
}
