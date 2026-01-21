import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { generatedSentences } from "@/lib/db/schema/sentences";
import { getCurrentUser } from "@/lib/supabase/server";
import { sql, desc, isNotNull, and, eq } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/words/[id]/sentences
 *
 * Returns up to 3 most recent practice sentences that contain a specific word.
 * Only returns sentences that have been used (usedAt IS NOT NULL).
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: wordId } = await params;

    if (!wordId) {
      return NextResponse.json(
        { error: "Word ID is required" },
        { status: 400 }
      );
    }

    // Query sentences where word_ids contains this word ID
    // Using raw SQL for the array contains operator (@>)
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
          isNotNull(generatedSentences.usedAt),
          sql`${generatedSentences.wordIds} @> ARRAY[${wordId}]::uuid[]`
        )
      )
      .orderBy(desc(generatedSentences.usedAt))
      .limit(3);

    return NextResponse.json({
      sentences: sentences.map((s) => ({
        id: s.id,
        text: s.text,
        translation: s.translation,
        usedAt: s.usedAt?.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching sentences for word:", error);
    return NextResponse.json(
      { error: "Failed to fetch sentences" },
      { status: 500 }
    );
  }
}
