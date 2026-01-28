import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { generatedSentences, words } from "@/lib/db/schema";
import { getCurrentUser, getUserLanguagePreference } from "@/lib/supabase/server";
import { sql, desc, isNotNull, and, eq } from "drizzle-orm";
import { generateSentenceWithRetry } from "@/lib/sentences/generator";
import { generateWordIdsHash } from "@/lib/sentences/word-matcher";
import { getRequestContext } from "@/lib/logger/api-logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/words/[id]/sentences
 *
 * Returns up to 3 most recent practice sentences that contain a specific word.
 *
 * Query params:
 * - generate=true: Generate a sentence on-demand if none exists (for notebook display)
 *
 * Only returns sentences that have been used (usedAt IS NOT NULL), unless generate=true
 * which also returns the newly generated sentence.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const startTime = Date.now();
  const { logRequest, logResponse, logError } = getRequestContext(request);

  try {
    logRequest();
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: wordId } = await params;
    const { searchParams } = new URL(request.url);
    const shouldGenerate = searchParams.get("generate") === "true";

    if (!wordId) {
      return NextResponse.json(
        { error: "Word ID is required" },
        { status: 400 }
      );
    }

    // Query sentences where word_ids contains this word ID
    // Using raw SQL for the array contains operator (@>)
    // Include unused sentences too when generate=true (they might be pre-generated)
    const sentences = await db
      .select({
        id: generatedSentences.id,
        text: generatedSentences.text,
        translation: generatedSentences.translation,
        usedAt: generatedSentences.usedAt,
      })
      .from(generatedSentences)
      .where(
        and(
          eq(generatedSentences.userId, user.id),
          shouldGenerate ? undefined : isNotNull(generatedSentences.usedAt),
          sql`${generatedSentences.wordIds} @> ARRAY[${wordId}]::uuid[]`
        )
      )
      .orderBy(desc(generatedSentences.usedAt))
      .limit(3);

    // If no sentences exist and generate=true, create one on-demand
    if (sentences.length === 0 && shouldGenerate) {
      // Fetch the word to generate a sentence for it
      const [word] = await db
        .select()
        .from(words)
        .where(and(eq(words.id, wordId), eq(words.userId, user.id)))
        .limit(1);

      if (word) {
        const prefs = await getUserLanguagePreference(user.id);

        // Generate a sentence with just this word
        const result = await generateSentenceWithRetry({
          words: [word],
          targetLanguage: prefs.targetLanguage,
          nativeLanguage: prefs.nativeLanguage,
        });

        if (result) {
          // Store the generated sentence (marked as not used yet)
          const [newSentence] = await db
            .insert(generatedSentences)
            .values({
              userId: user.id,
              text: result.text,
              translation: result.translation,
              wordIds: [word.id],
              wordIdsHash: generateWordIdsHash([word.id]),
              exerciseType: "fill_blank", // Default type
              usedAt: null, // Not used in review yet
            })
            .returning();

          return NextResponse.json({
            sentences: [
              {
                id: newSentence.id,
                text: newSentence.text,
                translation: newSentence.translation,
                usedAt: null,
                generated: true, // Flag that this was just generated
              },
            ],
          });
        }
      }

      // Failed to generate - return empty
      return NextResponse.json({ sentences: [] });
    }

    logResponse(200, Date.now() - startTime);
    return NextResponse.json({
      sentences: sentences.map((s) => ({
        id: s.id,
        text: s.text,
        translation: s.translation,
        usedAt: s.usedAt?.toISOString(),
      })),
    });
  } catch (error) {
    logError(error, { endpoint: "/api/words/[id]/sentences" });
    logResponse(500, Date.now() - startTime);
    return NextResponse.json(
      { error: "Failed to fetch sentences" },
      { status: 500 }
    );
  }
}
