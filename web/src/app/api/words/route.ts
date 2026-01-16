import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { words } from '@/lib/db/schema';
import { generateAudio } from '@/lib/audio/tts';
import { uploadAudio } from '@/lib/audio/storage';
import {
  DEFAULT_LANGUAGE_PREFERENCE,
  getTranslationName,
  type UserLanguagePreference,
} from '@/lib/config/languages';
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
    const { text, context } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required and must be non-empty' },
        { status: 400 }
      );
    }

    // 3. Get user language preferences
    // TODO: Fetch from user settings in database
    // For now, use default (English ↔ Portuguese PT-PT)
    const languagePreference = DEFAULT_LANGUAGE_PREFERENCE;

    // 4. Detect if text is in target language (what user is learning)
    // For MVP, we assume user captures phrases in their target language
    const isTargetLanguage = true;
    const language: 'source' | 'target' = 'target';

    // 5. Auto-translate using OpenAI
    const translation = await translateText(text, isTargetLanguage, languagePreference);

    // 6. Auto-assign category using OpenAI
    const { category, confidence } = await assignCategory(text, context);

    // 7. Create word in database (without audio URL initially)
    const [newWord] = await db
      .insert(words)
      .values({
        userId: user.id,
        originalText: text.trim(),
        translation,
        language,
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

    // 8. Generate TTS audio
    let audioUrl: string | null = null;
    try {
      // Use target language code for TTS voice selection
      const targetLangCode = languagePreference.targetLanguage;
      const audioBuffer = await generateAudio({ text, languageCode: targetLangCode });

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

    // 11. Return created word
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

    // 2. Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const masteryStatus = searchParams.get('masteryStatus');
    const search = searchParams.get('search');

    // 3. Build query with filters
    const conditions = [eq(words.userId, user.id)];

    if (category) {
      conditions.push(eq(words.category, category));
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
 * Uses user's language preferences to determine translation direction.
 * Default: Portuguese (Portugal) → English
 */
async function translateText(
  text: string,
  isTargetLanguage: boolean,
  languagePreference: UserLanguagePreference = DEFAULT_LANGUAGE_PREFERENCE
): Promise<string> {
  // isTargetLanguage: true = text is in target language (what user is learning)
  // isTargetLanguage: false = text is in native language
  const sourceLang = isTargetLanguage
    ? getTranslationName(languagePreference.targetLanguage)
    : getTranslationName(languagePreference.nativeLanguage);
  const targetLang = isTargetLanguage
    ? getTranslationName(languagePreference.nativeLanguage)
    : getTranslationName(languagePreference.targetLanguage);

  const openai = getOpenAI();

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini', // Use mini for cost efficiency
    messages: [
      {
        role: 'system',
        content: `You are a professional translator specializing in ${sourceLang}. Translate the given text to ${targetLang}. Provide ONLY the translation, no explanations or additional text.`,
      },
      {
        role: 'user',
        content: text,
      },
    ],
    temperature: 0.3, // Lower temperature for consistent translations
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
- food
- restaurant
- shopping
- work
- home
- transport
- health
- social
- bureaucracy
- emergency
- weather
- time
- greetings
- other

Word/Phrase: "${text}"
${context ? `Context: "${context}"` : ''}

Respond with ONLY the category name in lowercase, nothing else.`;

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

  // Validate category
  const validCategories = [
    'food',
    'restaurant',
    'shopping',
    'work',
    'home',
    'transport',
    'health',
    'social',
    'bureaucracy',
    'emergency',
    'weather',
    'time',
    'greetings',
    'other',
  ];

  const finalCategory = validCategories.includes(category) ? category : 'other';

  // For MVP, use fixed confidence
  // TODO: Implement confidence scoring based on multiple model runs
  const confidence = 0.8;

  return { category: finalCategory, confidence };
}
