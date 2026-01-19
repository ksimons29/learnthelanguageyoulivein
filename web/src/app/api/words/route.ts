import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getUserLanguagePreference } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { words, generatedSentences } from '@/lib/db/schema';
import { generateAudio } from '@/lib/audio/tts';
import { uploadAudio, uploadSentenceAudio } from '@/lib/audio/storage';
import {
  DEFAULT_LANGUAGE_PREFERENCE,
  getTranslationName,
  isDirectionSupported,
} from '@/lib/config/languages';
import {
  getUnusedWordCombinations,
  generateSentenceWithRetry,
  generateWordIdsHash,
  determineExerciseType,
} from '@/lib/sentences';
import OpenAI from 'openai';
import { eq, and, or, ilike, sql } from 'drizzle-orm';

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      'OPENAI_API_KEY environment variable is not set. Please configure it in .env.local'
    );
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

/**
 * POST /api/words
 *
 * Capture a new word/phrase with auto-translation, category assignment, and TTS audio.
 *
 * Reference: /docs/engineering/implementation_plan.md (lines 201-208)
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Validate request body
    const body = await request.json();
    const { text, context, sourceLang: requestSourceLang, targetLang: requestTargetLang } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required and must be non-empty' },
        { status: 400 }
      );
    }

    // 3. Get user language preferences from database
    const languagePreference = await getUserLanguagePreference(user.id);

    // 4. Validate that the user's learning direction is supported
    // SUPPORTED_DIRECTIONS defines valid (nativeLanguage → targetLanguage) pairs
    if (
      !isDirectionSupported(
        languagePreference.nativeLanguage,
        languagePreference.targetLanguage
      )
    ) {
      return NextResponse.json(
        {
          error: `Learning ${languagePreference.targetLanguage} from ${languagePreference.nativeLanguage} is not supported. Supported: en→pt-PT, nl→en, en→sv`,
        },
        { status: 400 }
      );
    }

    // 5. Determine translation direction
    // Default behavior: text is in target language, translate to native
    // User captures phrases in language they're learning, gets translation in native
    const textLang = requestSourceLang || languagePreference.targetLanguage;
    const translationLang = requestTargetLang || languagePreference.nativeLanguage;

    // For the word record, store the language of original text and its translation
    const sourceLang = textLang;
    const targetLang = translationLang;

    // Determine if input text is in target language (for TTS voice selection)
    const isTargetLanguage = textLang === languagePreference.targetLanguage;
    const language: 'source' | 'target' = isTargetLanguage ? 'target' : 'source';

    // 6. Auto-translate using OpenAI
    const translation = await translateText(text, sourceLang, targetLang);

    // 7. Auto-assign category using OpenAI
    const { category, confidence } = await assignCategory(text, context);

    // 8. Create word in database (without audio URL initially)
    const [newWord] = await db
      .insert(words)
      .values({
        userId: user.id,
        originalText: text.trim(),
        translation,
        language,
        // Store actual language codes used for this translation
        sourceLang,
        targetLang,
        translationProvider: 'openai-gpt4o-mini',
        category,
        categoryConfidence: confidence,
        // FSRS initial values (from implementation_plan.md lines 147-154)
        difficulty: 5.0,
        stability: 1.0,
        retrievability: 1.0,
        nextReviewDate: new Date(), // Due immediately for first review
        reviewCount: 0,
        lapseCount: 0,
        consecutiveCorrectSessions: 0,
        masteryStatus: 'learning',
      })
      .returning();

    // 9. Generate TTS audio for the original text
    let audioUrl: string | null = null;
    try {
      // Use sourceLang for TTS since original text is in that language
      const audioBuffer = await generateAudio({ text, languageCode: sourceLang });

      // 9. Upload audio to Supabase Storage
      audioUrl = await uploadAudio(user.id, newWord.id, audioBuffer);

      // 10. Update word with audio URL
      await db
        .update(words)
        .set({ audioUrl })
        .where(eq(words.id, newWord.id));
    } catch (audioError) {
      console.error('Audio generation failed (non-fatal):', audioError);
      // Continue without audio - word is still captured
    }

    // 11. Trigger sentence pre-generation (fire-and-forget)
    // This opportunistically generates sentences that might include the new word
    triggerSentenceGeneration(user.id).catch(() => {
      // Silently fail - this is an optimization, not critical
    });

    // 12. Return created word
    return NextResponse.json({
      data: {
        word: { ...newWord, audioUrl },
      },
    });
  } catch (error) {
    console.error('Word capture error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to capture word',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/words
 *
 * List user's words with pagination and filtering.
 *
 * Query params: page, limit, category, masteryStatus, search
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const masteryStatus = searchParams.get('masteryStatus');
    const search = searchParams.get('search');
    const excludeId = searchParams.get('excludeId');

    // 4. Build query with filters - ALWAYS filter by user's target language
    const conditions = [
      eq(words.userId, user.id),
      eq(words.targetLang, languagePreference.targetLanguage),
    ];

    if (category) {
      conditions.push(eq(words.category, category));
    }

    if (excludeId) {
      conditions.push(sql`${words.id} != ${excludeId}`);
    }

    if (masteryStatus) {
      conditions.push(
        eq(
          words.masteryStatus,
          masteryStatus as 'learning' | 'learned' | 'ready_to_use'
        )
      );
    }

    if (search) {
      conditions.push(
        or(
          ilike(words.originalText, `%${search}%`),
          ilike(words.translation, `%${search}%`)
        )!
      );
    }

    // 4. Query words with pagination
    const offset = (page - 1) * limit;
    const userWords = await db
      .select()
      .from(words)
      .where(and(...conditions))
      .orderBy(sql`${words.createdAt} DESC`)
      .limit(limit)
      .offset(offset);

    // 5. Count total for pagination
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(words)
      .where(and(...conditions));

    return NextResponse.json({
      data: {
        words: userWords,
        total: count,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Words retrieval error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to retrieve words',
      },
      { status: 500 }
    );
  }
}

/**
 * Translate text using OpenAI GPT-4
 *
 * Takes explicit source and target language codes.
 * Enforces regional variants (e.g., pt-PT uses European Portuguese).
 */
async function translateText(
  text: string,
  sourceLangCode: string,
  targetLangCode: string
): Promise<string> {
  const sourceLangName = getTranslationName(sourceLangCode);
  const targetLangName = getTranslationName(targetLangCode);

  // Build additional instructions for regional variants
  let regionalInstructions = '';
  if (targetLangCode === 'pt-PT') {
    regionalInstructions = `
IMPORTANT: Use European Portuguese (Portugal) ONLY.
- Never use Brazilian Portuguese vocabulary, spelling, or expressions
- Use "tu" forms instead of "você" where appropriate
- Use European spelling (e.g., "facto" not "fato", "autocarro" not "ônibus")`;
  }

  const openai = getOpenAI();

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a professional translator specializing in ${sourceLangName}. Translate the given text to ${targetLangName}. Provide ONLY the translation, no explanations or additional text.${regionalInstructions}`,
      },
      {
        role: 'user',
        content: text,
      },
    ],
    temperature: 0.3,
  });

  return response.choices[0].message.content?.trim() || text;
}

/**
 * Assign category using OpenAI GPT-4
 *
 * Reference: /docs/engineering/implementation_plan.md (lines 321-335)
 */
async function assignCategory(
  text: string,
  context?: string
): Promise<{ category: string; confidence: number }> {
  const openai = getOpenAI();
  const categoryPrompt = `Categorize this word/phrase into exactly ONE category from this list:
- food_dining (food, restaurants, eating, cooking, meals)
- work (professional, office, bureaucracy, paperwork)
- daily_life (home, household, time, routines)
- social (interactions, greetings, conversations)
- shopping (retail, purchases, stores)
- transport (travel, vehicles, directions)
- health (medical, wellness, emergencies, safety)
- other (anything else)

Word/Phrase: "${text}"
${context ? `Context: "${context}"` : ''}

Respond with ONLY the category name in lowercase (e.g. "food_dining" or "work"), nothing else.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini', // Use mini for cost efficiency
    messages: [
      {
        role: 'user',
        content: categoryPrompt,
      },
    ],
    temperature: 0.2, // Low temperature for consistent categorization
  });

  const category =
    response.choices[0].message.content?.trim().toLowerCase() || 'other';

  // Validate category (8 consolidated categories following Miller's Law)
  const validCategories = [
    'food_dining',
    'work',
    'daily_life',
    'social',
    'shopping',
    'transport',
    'health',
    'other',
  ];

  const finalCategory = validCategories.includes(category) ? category : 'other';

  // For MVP, use fixed confidence
  // TODO: Implement confidence scoring based on multiple model runs
  const confidence = 0.8;

  return { category: finalCategory, confidence };
}

/**
 * Trigger sentence pre-generation after word capture
 *
 * Runs in the background to generate sentences that might include
 * the newly captured word. Fire-and-forget - failures are logged but
 * don't affect the word capture response.
 */
async function triggerSentenceGeneration(userId: string): Promise<void> {
  try {
    const languagePreference = DEFAULT_LANGUAGE_PREFERENCE;

    // Get a few unused word combinations
    const combinations = await getUnusedWordCombinations(
      userId,
      {
        minWordsPerSentence: 2,
        maxWordsPerSentence: 4,
        dueDateWindowDays: 7,
        retrievabilityThreshold: 0.9,
      },
      3 // Generate max 3 sentences after capture
    );

    if (combinations.length === 0) {
      return;
    }

    // Generate sentences for each combination
    for (const wordGroup of combinations) {
      const result = await generateSentenceWithRetry({
        words: wordGroup,
        targetLanguage: languagePreference.targetLanguage,
        nativeLanguage: languagePreference.nativeLanguage,
      });

      if (!result) {
        continue;
      }

      // Generate audio (optional, non-fatal)
      let audioUrl: string | null = null;
      try {
        const audioBuffer = await generateAudio({
          text: result.text,
          languageCode: languagePreference.targetLanguage,
        });
        audioUrl = await uploadSentenceAudio(userId, audioBuffer);
      } catch {
        // Continue without audio
      }

      // Determine exercise type
      const exerciseType = determineExerciseType(wordGroup);

      // Store sentence
      await db.insert(generatedSentences).values({
        userId,
        text: result.text,
        audioUrl,
        wordIds: wordGroup.map((w) => w.id),
        wordIdsHash: generateWordIdsHash(wordGroup.map((w) => w.id)),
        exerciseType,
        usedAt: null,
      });
    }
  } catch (error) {
    console.error('Background sentence generation failed:', error);
    // Don't rethrow - this is a background optimization
  }
}
