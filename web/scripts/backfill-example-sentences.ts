/**
 * Backfill Example Sentences Script
 *
 * This script generates example sentences for existing words that don't have them.
 * Processes words in batches to avoid rate limits.
 *
 * Usage: npx tsx scripts/backfill-example-sentences.ts [--user-email <email>] [--batch-size <n>] [--dry-run]
 *
 * Options:
 *   --user-email  Only backfill for a specific user
 *   --batch-size  Number of words to process per batch (default: 50)
 *   --dry-run     Preview what would be done without making changes
 *
 * Example:
 *   npx tsx scripts/backfill-example-sentences.ts
 *   npx tsx scripts/backfill-example-sentences.ts --user-email test-en-pt@llyli.test
 *   npx tsx scripts/backfill-example-sentences.ts --batch-size 10 --dry-run
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import postgres from 'postgres';
import OpenAI from 'openai';

const databaseUrl = process.env.DATABASE_URL!;
const openaiKey = process.env.OPENAI_API_KEY!;

if (!databaseUrl || !openaiKey) {
  console.error('❌ Missing required environment variables:');
  if (!databaseUrl) console.error('  - DATABASE_URL');
  if (!openaiKey) console.error('  - OPENAI_API_KEY');
  process.exit(1);
}

const db = postgres(databaseUrl);
const openai = new OpenAI({ apiKey: openaiKey });

// Parse command line arguments
const args = process.argv.slice(2);
const userEmailIndex = args.indexOf('--user-email');
const targetUserEmail = userEmailIndex !== -1 ? args[userEmailIndex + 1] : null;
const batchSizeIndex = args.indexOf('--batch-size');
const BATCH_SIZE = batchSizeIndex !== -1 ? parseInt(args[batchSizeIndex + 1], 10) : 50;
const DRY_RUN = args.includes('--dry-run');

interface WordWithoutSentence {
  id: string;
  user_id: string;
  original_text: string;
  translation: string;
  source_lang: string;
  target_lang: string;
  user_email?: string;
}

interface UserLanguagePreference {
  native_language: string;
  target_language: string;
}

/**
 * Language display names for prompts
 */
const LANGUAGE_NAMES: Record<string, string> = {
  'en': 'English',
  'pt-PT': 'European Portuguese',
  'sv': 'Swedish',
  'nl': 'Dutch',
};

/**
 * Generate an example sentence for a word
 */
async function generateExampleSentence(
  word: string,
  targetLanguage: string,
  nativeLanguage: string
): Promise<{ sentence: string; translation: string } | null> {
  const targetLangName = LANGUAGE_NAMES[targetLanguage] || targetLanguage;
  const nativeLangName = LANGUAGE_NAMES[nativeLanguage] || nativeLanguage;

  // Build language-specific instructions
  let languageInstructions = '';

  if (targetLanguage === 'pt-PT') {
    languageInstructions = `
EUROPEAN PORTUGUESE RULES:
- Use European Portuguese (Portugal) ONLY - never Brazilian Portuguese
- Use "tu" forms instead of "você" where appropriate
- Use European spelling and vocabulary`;
  } else if (targetLanguage === 'sv') {
    languageInstructions = `
SWEDISH RULES:
- Use standard Swedish (rikssvenska)
- Use natural Swedish word order and phrasing`;
  } else if (targetLanguage === 'en') {
    languageInstructions = `
ENGLISH RULES:
- Use natural, conversational English
- Use common expressions that native speakers would actually use`;
  }

  const systemPrompt = `You are a language learning sentence generator. Create a SHORT, natural example sentence in ${targetLangName}.

RULES:
1. The sentence MUST contain the word "${word}" exactly as written
2. Keep the sentence SHORT (maximum 8 words total)
3. Use everyday, practical language
4. The sentence should sound natural to a native speaker
5. Context should be a realistic daily situation
${languageInstructions}

OUTPUT FORMAT (JSON only, no markdown):
{
  "sentence": "The sentence in ${targetLangName}",
  "translation": "Translation in ${nativeLangName}"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate a short example sentence using: ${word}` },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
      max_tokens: 100,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      return null;
    }

    const parsed = JSON.parse(content) as {
      sentence: string;
      translation: string;
    };

    return {
      sentence: parsed.sentence,
      translation: parsed.translation,
    };
  } catch (error) {
    console.error(`  ❌ Failed to generate sentence for "${word}":`, error);
    return null;
  }
}

/**
 * Get user language preferences
 */
async function getUserLanguagePreference(userId: string): Promise<UserLanguagePreference | null> {
  const result = await db`
    SELECT native_language, target_language
    FROM user_profiles
    WHERE user_id = ${userId}
  `;

  if (result.length === 0) {
    return null;
  }

  return result[0] as unknown as UserLanguagePreference;
}

/**
 * Determine which text to use for sentence generation
 * We want the sentence to be in the TARGET language
 */
function getTextForSentence(
  word: WordWithoutSentence,
  langPref: UserLanguagePreference
): string {
  // If the original text is in target language, use it
  // Otherwise, use the translation (which is in target language)
  const isOriginalInTarget = word.source_lang.split('-')[0] === langPref.target_language.split('-')[0];
  return isOriginalInTarget ? word.original_text : word.translation;
}

async function main() {
  console.log('🔄 Backfill Example Sentences');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Batch size: ${BATCH_SIZE}`);
  console.log(`Dry run: ${DRY_RUN}`);
  if (targetUserEmail) {
    console.log(`Target user: ${targetUserEmail}`);
  }
  console.log('');

  // Find words without example sentences
  let query;
  if (targetUserEmail) {
    query = db`
      SELECT w.id, w.user_id, w.original_text, w.translation, w.source_lang, w.target_lang, u.email as user_email
      FROM words w
      JOIN auth.users u ON w.user_id = u.id
      WHERE w.example_sentence IS NULL
        AND u.email = ${targetUserEmail}
      ORDER BY w.created_at DESC
    `;
  } else {
    query = db`
      SELECT w.id, w.user_id, w.original_text, w.translation, w.source_lang, w.target_lang, u.email as user_email
      FROM words w
      JOIN auth.users u ON w.user_id = u.id
      WHERE w.example_sentence IS NULL
      ORDER BY w.created_at DESC
    `;
  }

  const wordsWithoutSentence = await query as unknown as WordWithoutSentence[];
  console.log(`📊 Found ${wordsWithoutSentence.length} words without example sentences\n`);

  if (wordsWithoutSentence.length === 0) {
    console.log('✅ All words already have example sentences!');
    await db.end();
    return;
  }

  if (DRY_RUN) {
    console.log('🔍 DRY RUN - Would process:');
    for (const word of wordsWithoutSentence.slice(0, 10)) {
      console.log(`  - "${word.original_text}" (${word.user_email || word.user_id})`);
    }
    if (wordsWithoutSentence.length > 10) {
      console.log(`  ... and ${wordsWithoutSentence.length - 10} more`);
    }
    await db.end();
    return;
  }

  // Cache for user language preferences
  const langPrefCache = new Map<string, UserLanguagePreference | null>();

  // Process in batches
  let processed = 0;
  let succeeded = 0;
  let failed = 0;

  for (let i = 0; i < wordsWithoutSentence.length; i += BATCH_SIZE) {
    const batch = wordsWithoutSentence.slice(i, i + BATCH_SIZE);
    console.log(`\n📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} words)...`);

    for (const word of batch) {
      // Get cached language preference or fetch it
      let langPref = langPrefCache.get(word.user_id);
      if (langPref === undefined) {
        langPref = await getUserLanguagePreference(word.user_id);
        langPrefCache.set(word.user_id, langPref);
      }

      if (!langPref) {
        console.log(`  ⚠️  Skipping "${word.original_text}" - no language preference for user`);
        failed++;
        continue;
      }

      const sentenceText = getTextForSentence(word, langPref);
      console.log(`  🔤 "${word.original_text}" → generating sentence for "${sentenceText}"...`);

      const result = await generateExampleSentence(
        sentenceText,
        langPref.target_language,
        langPref.native_language
      );

      if (result) {
        await db`
          UPDATE words
          SET example_sentence = ${result.sentence},
              example_translation = ${result.translation}
          WHERE id = ${word.id}
        `;
        console.log(`     ✅ "${result.sentence}"`);
        succeeded++;
      } else {
        failed++;
      }

      processed++;

      // Rate limiting: wait 200ms between requests
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Longer pause between batches
    if (i + BATCH_SIZE < wordsWithoutSentence.length) {
      console.log('\n⏳ Waiting 2 seconds before next batch...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Summary:');
  console.log(`   Processed: ${processed}`);
  console.log(`   ✅ Succeeded: ${succeeded}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await db.end();
}

main().catch(console.error);
