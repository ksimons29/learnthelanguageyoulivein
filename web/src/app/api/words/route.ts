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
  isLanguageSupported,
} from '@/lib/config/languages';
import { checkWordCaptureLimit, rateLimitResponse } from '@/lib/rate-limit';
import { getTimeOfDay, type MemoryContext } from '@/lib/config/memory-context';
import { getUnusedWordCombinations, generateWordIdsHash } from '@/lib/sentences/word-matcher';
import { generateSentenceWithRetry } from '@/lib/sentences/generator';
import { determineExerciseType } from '@/lib/sentences/exercise-type';
import OpenAI from 'openai';
import { eq, and, or, ilike, sql, gte } from 'drizzle-orm';

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
 * Retry helper with exponential backoff for transient API failures.
 * Handles OpenAI rate limits and temporary network issues.
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      console.warn(`OpenAI retry ${attempt}/${maxRetries} after ${delay}ms:`, error instanceof Error ? error.message : error);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error('Retry exhausted'); // TypeScript: unreachable but satisfies return type
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

    // 1b. Check rate limit (daily word capture limit)
    const rateLimit = await checkWordCaptureLimit(user.id);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        rateLimitResponse('words', rateLimit),
        { status: 429 }
      );
    }

    // 2. Validate request body
    const body = await request.json();
    const {
      text,
      context,
      sourceLang: requestSourceLang,
      targetLang: requestTargetLang,
      memoryContext,
    } = body as {
      text: string;
      context?: string;
      sourceLang?: string;
      targetLang?: string;
      memoryContext?: MemoryContext;
    };

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required and must be non-empty' },
        { status: 400 }
      );
    }

    // 2b. Enforce character limit (500 max)
    const MAX_TEXT_LENGTH = 500;
    if (text.trim().length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        {
          error: `Text is too long. Maximum ${MAX_TEXT_LENGTH} characters allowed.`,
          maxLength: MAX_TEXT_LENGTH,
          currentLength: text.trim().length,
        },
        { status: 400 }
      );
    }

    // 2c. Check for duplicate within last 24 hours (warn, not block)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [existingWord] = await db
      .select({ id: words.id, createdAt: words.createdAt })
      .from(words)
      .where(
        and(
          eq(words.userId, user.id),
          ilike(words.originalText, text.trim()),
          gte(words.createdAt, twentyFourHoursAgo)
        )
      )
      .limit(1);

    // Include duplicate warning in response but don't block
    const duplicateWarning = existingWord
      ? {
          isDuplicate: true,
          message: 'You captured this phrase recently. It will be added anyway.',
          existingWordId: existingWord.id,
        }
      : null;

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

    // 5. Determine translation direction using language detection
    // Smart detection: figure out which language the user typed in
    // Then translate TO the other language in their learning pair
    let textLang: string;
    let translationLang: string;

    if (requestSourceLang && requestTargetLang) {
      // Explicit languages provided - validate against SUPPORTED_LANGUAGES
      if (!isLanguageSupported(requestSourceLang)) {
        return NextResponse.json(
          { error: `Unsupported source language: ${requestSourceLang}` },
          { status: 400 }
        );
      }
      if (!isLanguageSupported(requestTargetLang)) {
        return NextResponse.json(
          { error: `Unsupported target language: ${requestTargetLang}` },
          { status: 400 }
        );
      }
      textLang = requestSourceLang;
      translationLang = requestTargetLang;
    } else {
      // Auto-detect: is the input in native or target language?
      const possibleLanguages = [
        languagePreference.nativeLanguage,
        languagePreference.targetLanguage,
      ];
      const detectedLang = await detectLanguage(text, possibleLanguages);

      if (
        detectedLang &&
        detectedLang.split('-')[0] ===
          languagePreference.nativeLanguage.split('-')[0]
      ) {
        // Input is in NATIVE language → translate TO target language
        // e.g., "Trainwreck" (English) → translate to Portuguese
        textLang = languagePreference.nativeLanguage;
        translationLang = languagePreference.targetLanguage;
      } else {
        // Input is in TARGET language (default) → translate TO native language
        // e.g., "bom dia" (Portuguese) → translate to English
        textLang = languagePreference.targetLanguage;
        translationLang = languagePreference.nativeLanguage;
      }
    }

    // For the word record, store the language of original text and its translation
    let sourceLang = textLang;
    let targetLang = translationLang;

    // Determine if input text is in target language (for TTS voice selection)
    const isTargetLanguage =
      textLang.split('-')[0] ===
      languagePreference.targetLanguage.split('-')[0];
    const language: 'source' | 'target' = isTargetLanguage ? 'target' : 'source';

    // 6. Auto-translate and auto-assign category in parallel
    // This saves 1-3 seconds compared to sequential calls
    // Wrapped in withRetry for resilience against transient OpenAI failures
    let [translation, { category, confidence }] = await Promise.all([
      withRetry(() => translateText(text, sourceLang, targetLang)),
      withRetry(() => assignCategory(text, context)),
    ]);

    // 6b. Safety check: If translation equals original, language detection was likely wrong
    // Try the opposite direction as a fallback
    if (translation.toLowerCase().trim() === text.toLowerCase().trim()) {
      console.log(
        `Translation equals original for "${text}", trying opposite direction`
      );
      // Swap directions
      const swappedSourceLang = targetLang;
      const swappedTargetLang = sourceLang;
      translation = await translateText(text, swappedSourceLang, swappedTargetLang);

      // If this worked (translation is different), update the language direction
      if (translation.toLowerCase().trim() !== text.toLowerCase().trim()) {
        // Language detection was wrong - swap the stored values
        sourceLang = swappedSourceLang;
        targetLang = swappedTargetLang;
      }
    }

    // 6c. Final check: If translation STILL equals original after trying both directions,
    // this is likely an untranslatable/culturally-specific word.
    // Add an explanatory note rather than showing identical text.
    if (translation.toLowerCase().trim() === text.toLowerCase().trim()) {
      console.log(
        `Word "${text}" appears untranslatable - adding explanatory note`
      );
      // Create an explanatory phrase based on the source language
      const langNames: Record<string, string> = {
        'nl': 'Dutch',
        'pt-PT': 'Portuguese',
        'sv': 'Swedish',
        'en': 'English',
      };
      const sourceLangName = langNames[sourceLang] || sourceLang;
      translation = `${text} (${sourceLangName} expression)`;
    }

    // 8. Create word in database (without audio URL initially)
    // Auto-detect time of day from server timestamp
    const captureTime = new Date();
    const timeOfDay = getTimeOfDay(captureTime);

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
        // Memory context (Personal Memory Journal)
        locationHint: memoryContext?.locationHint || null,
        timeOfDay: timeOfDay, // Auto-detected from capture time
        situationTags: memoryContext?.situationTags || null,
        personalNote: memoryContext?.personalNote || null,
      })
      .returning();

    // 9. Return word immediately (audio will be generated in background)
    // This reduces capture time from ~10s to ~2-4s
    const response = NextResponse.json({
      data: {
        word: { ...newWord, audioUrl: null, audioGenerating: true },
        ...(duplicateWarning && { duplicateWarning }),
      },
    });

    // 10. Fire-and-forget audio generation in background
    // IMPORTANT: Audio should ALWAYS be in the target language (the language being learned)
    // If user entered text in target language → use original text
    // If user entered text in native language → use translation (which is in target language)
    const isInputInTargetLanguage =
      sourceLang.split('-')[0] === languagePreference.targetLanguage.split('-')[0];
    const audioText = isInputInTargetLanguage ? text : translation;
    const audioLang = languagePreference.targetLanguage;

    generateAudioInBackground(user.id, newWord.id, audioText, audioLang).catch(
      (err) => console.error('Background audio generation failed:', err)
    );

    // 11. Trigger sentence pre-generation (fire-and-forget)
    // This opportunistically generates sentences that might include the new word
    triggerSentenceGeneration(user.id).catch(() => {
      // Silently fail - this is an optimization, not critical
    });

    return response;
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

    // 4. Build query with filters - filter by BOTH native and target language
    // This ensures only words from the user's configured language pair are included.
    const conditions = [
      eq(words.userId, user.id),
      or(
        // User captured in target language (sourceLang=target, targetLang=native)
        and(
          eq(words.sourceLang, languagePreference.targetLanguage),
          eq(words.targetLang, languagePreference.nativeLanguage)
        ),
        // User captured in native language (sourceLang=native, targetLang=target)
        and(
          eq(words.sourceLang, languagePreference.nativeLanguage),
          eq(words.targetLang, languagePreference.targetLanguage)
        )
      )!,
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

    // 5. Count total for pagination (safe destructuring to handle empty results)
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(words)
      .where(and(...conditions));
    const count = countResult[0]?.count ?? 0;

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
 * Detect the language of input text using OpenAI
 *
 * Returns a language code (e.g., 'en', 'pt', 'sv', 'nl') or null if uncertain.
 * Used to auto-detect whether user is entering text in their native or target language.
 */
async function detectLanguage(
  text: string,
  possibleLanguages: string[]
): Promise<string | null> {
  const openai = getOpenAI();

  // Map language codes to readable names for the prompt
  const langNames = possibleLanguages.map((code) => {
    const name = getTranslationName(code);
    return `${code}: ${name}`;
  });

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a language detection expert. Identify which language the text is written in.
Respond with ONLY the language code from this list: ${possibleLanguages.join(', ')}
If uncertain, respond with the most likely match.
Language codes: ${langNames.join(', ')}`,
      },
      {
        role: 'user',
        content: text,
      },
    ],
    temperature: 0,
    max_tokens: 10,
  });

  const detected = response.choices[0].message.content?.trim().toLowerCase();

  // Normalize pt-PT/pt-BR to just check the base
  const normalizedDetected = detected?.split('-')[0];

  // Find matching language from possible options
  for (const lang of possibleLanguages) {
    const normalizedLang = lang.split('-')[0];
    if (normalizedLang === normalizedDetected) {
      return lang;
    }
  }

  return null;
}

/**
 * Translate text using OpenAI GPT-4
 *
 * Takes explicit source and target language codes.
 * Handles idioms, slang, and colloquialisms by finding equivalent expressions.
 * Enforces regional variants (e.g., pt-PT uses European Portuguese).
 */
async function translateText(
  text: string,
  sourceLangCode: string,
  targetLangCode: string
): Promise<string> {
  const sourceLangName = getTranslationName(sourceLangCode);
  const targetLangName = getTranslationName(targetLangCode);

  // Core instructions for handling idioms, slang, and expressions
  const coreInstructions = `
TRANSLATION GUIDELINES:
- For idioms, slang, and colloquialisms: Find the equivalent expression in ${targetLangName} that conveys the same meaning and tone, rather than translating literally.
- For single words: Provide the most common, natural translation.
- For phrases: Translate naturally as a native speaker would say it.
- If no direct equivalent exists, provide the closest natural expression or a brief explanation.
- Keep the same register (formal/informal) as the original.

CRITICAL: NEVER return the original word unchanged as the translation.
- For culturally-specific or "untranslatable" words (like Dutch "gezellig", Swedish "lagom", Portuguese "saudade"):
  - Provide the closest equivalent expression or a brief explanation in ${targetLangName}
  - Example: "gezellig" → "cozy togetherness" or "warm and convivial"
  - Example: "saudade" → "nostalgic longing" or "bittersweet yearning"
  - Example: "lagom" → "just right" or "the perfect amount"
- If truly no equivalent exists, provide a concise explanatory phrase (2-4 words max)`;

  // Build language-specific instructions
  let languageInstructions = '';

  if (targetLangCode === 'pt-PT') {
    languageInstructions = `

EUROPEAN PORTUGUESE RULES:
- Use European Portuguese (Portugal) ONLY - never Brazilian Portuguese
- Use "tu" forms instead of "você" where appropriate
- Use European spelling (e.g., "facto" not "fato", "autocarro" not "ônibus", "comboio" not "trem")
- Use European vocabulary (e.g., "pequeno-almoço" not "café da manhã", "telemóvel" not "celular")
- For English slang/idioms, find Portuguese equivalents used in Portugal (e.g., "trainwreck" → "desastre", "piece of cake" → "canja")`;
  } else if (targetLangCode === 'sv') {
    languageInstructions = `

SWEDISH RULES:
- Use standard Swedish (rikssvenska)
- For English slang/idioms, find Swedish equivalents (e.g., "piece of cake" → "lätt som en plätt", "raining cats and dogs" → "det öser ner")
- Use natural Swedish word order and phrasing
- Keep informal expressions informal (e.g., use "kul" for "fun" in casual contexts)`;
  } else if (targetLangCode === 'en') {
    languageInstructions = `

ENGLISH RULES:
- Use natural, conversational English
- For Dutch idioms/expressions, find English equivalents (e.g., "Nu komt de aap uit de mouw" → "Now the cat's out of the bag")
- Preserve the tone and register of the original
- Use common expressions that native English speakers would actually use`;
  } else if (targetLangCode === 'nl') {
    languageInstructions = `

DUTCH RULES:
- Use standard Dutch (Nederlands)
- For English slang/idioms, find Dutch equivalents where they exist
- Use natural Dutch phrasing and word order
- Keep informal expressions informal`;
  }

  const openai = getOpenAI();

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a professional translator specializing in ${sourceLangName} to ${targetLangName}. Translate the given text. Provide ONLY the translation, no explanations or additional text.${coreInstructions}${languageInstructions}`,
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
 * Generate audio in background and update the word
 *
 * This runs after the word is returned to the user, so it doesn't
 * block the capture flow. The client polls for the audio URL.
 *
 * Uses retry logic with exponential backoff:
 * - TTS generation: 3 retries (2s → 4s → 8s)
 * - Storage upload: 2 retries (1s → 2s)
 *
 * If all retries fail, marks the word with audioGenerationFailed=true
 * so the client can stop polling and show a retry button.
 */
async function generateAudioInBackground(
  userId: string,
  wordId: string,
  text: string,
  languageCode: string
): Promise<void> {
  try {
    // TTS generation with retry (3 retries, 2s base delay)
    const audioBuffer = await withRetry(
      () => generateAudio({ text, languageCode }),
      3,
      2000
    );

    // Storage upload with retry (2 retries, 1s base delay)
    const audioUrl = await withRetry(
      () => uploadAudio(userId, wordId, audioBuffer),
      2,
      1000
    );

    // Success - update word with audio URL
    await db
      .update(words)
      .set({ audioUrl, audioGenerationFailed: false })
      .where(eq(words.id, wordId));
  } catch (error) {
    console.error('Background audio generation failed after retries:', error);
    // Mark word as failed so client can stop polling and show retry button
    await db
      .update(words)
      .set({ audioGenerationFailed: true })
      .where(eq(words.id, wordId));
  }
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
    const languagePreference = await getUserLanguagePreference(userId);

    // Get a few unused word combinations (filtered by language pair)
    const combinations = await getUnusedWordCombinations(
      userId,
      languagePreference.nativeLanguage,
      languagePreference.targetLanguage,
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
        translation: result.translation,
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
