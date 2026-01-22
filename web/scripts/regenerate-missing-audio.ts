/**
 * Regenerate Missing Audio Script
 *
 * This script finds all words that are missing audio and regenerates them.
 * Useful for:
 * - Fixing test users who have words without audio
 * - Recovery mechanism for production users
 *
 * Usage: npx tsx scripts/regenerate-missing-audio.ts [--user-email <email>]
 *
 * Options:
 *   --user-email  Only regenerate audio for a specific user
 *
 * Example:
 *   npx tsx scripts/regenerate-missing-audio.ts
 *   npx tsx scripts/regenerate-missing-audio.ts --user-email test-en-pt@llyli.test
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import postgres from 'postgres';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const databaseUrl = process.env.DATABASE_URL!;
const openaiKey = process.env.OPENAI_API_KEY!;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!databaseUrl || !openaiKey || !supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  if (!databaseUrl) console.error('  - DATABASE_URL');
  if (!openaiKey) console.error('  - OPENAI_API_KEY');
  if (!supabaseUrl) console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  if (!supabaseServiceKey) console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const db = postgres(databaseUrl);
const openai = new OpenAI({ apiKey: openaiKey });
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Parse command line arguments
const args = process.argv.slice(2);
const userEmailIndex = args.indexOf('--user-email');
const targetUserEmail = userEmailIndex !== -1 ? args[userEmailIndex + 1] : null;

interface WordWithoutAudio {
  id: string;
  user_id: string;
  original_text: string;
  translation: string;
  source_lang: string;
  target_lang: string;
  user_email?: string;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 2000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      console.warn(`  Retry ${attempt}/${maxRetries} after ${delay}ms...`);
      await sleep(delay);
    }
  }
  throw new Error('Retry exhausted');
}

async function generateAudio(text: string, languageCode: string): Promise<Buffer> {
  const response = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'nova',
    input: text,
    response_format: 'mp3',
  });

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function uploadAudio(userId: string, wordId: string, audioBuffer: Buffer): Promise<string> {
  const filePath = `${userId}/${wordId}.mp3`;

  const { error } = await supabase.storage
    .from('audio')
    .upload(filePath, audioBuffer, {
      contentType: 'audio/mpeg',
      upsert: true,
      cacheControl: '31536000',
    });

  if (error) {
    throw new Error(`Failed to upload audio: ${error.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('audio')
    .getPublicUrl(filePath);

  return publicUrl;
}

async function getWordsWithoutAudio(): Promise<WordWithoutAudio[]> {
  let query = `
    SELECT w.id, w.user_id, w.original_text, w.translation, w.source_lang, w.target_lang,
           u.email as user_email
    FROM words w
    LEFT JOIN auth.users u ON w.user_id::uuid = u.id
    WHERE w.audio_url IS NULL
  `;

  if (targetUserEmail) {
    query += ` AND u.email = $1`;
    return db.unsafe(query, [targetUserEmail]) as unknown as WordWithoutAudio[];
  }

  return db.unsafe(query) as unknown as WordWithoutAudio[];
}

async function regenerateAudioForWord(word: WordWithoutAudio): Promise<boolean> {
  try {
    // Determine which text to use for TTS (target language text)
    // If source_lang matches target_lang pattern, use original_text
    // Otherwise, use translation (which should be in target language)
    const isOriginalInTargetLang = word.source_lang.startsWith(word.target_lang.split('-')[0]);
    const audioText = isOriginalInTargetLang ? word.original_text : word.translation;
    const ttsLanguage = word.target_lang || word.source_lang;

    console.log(`  Generating audio for "${audioText}" (${ttsLanguage})...`);

    // Generate audio with retry
    const audioBuffer = await withRetry(
      () => generateAudio(audioText, ttsLanguage),
      3,
      2000
    );

    // Upload audio with retry
    const audioUrl = await withRetry(
      () => uploadAudio(word.user_id, word.id, audioBuffer),
      2,
      1000
    );

    // Update word with audio URL
    await db`
      UPDATE words
      SET audio_url = ${audioUrl}, audio_generation_failed = false
      WHERE id = ${word.id}
    `;

    console.log(`  ✅ Audio generated and saved`);
    return true;
  } catch (error) {
    console.error(`  ❌ Failed:`, error instanceof Error ? error.message : error);

    // Mark as failed
    await db`
      UPDATE words
      SET audio_generation_failed = true
      WHERE id = ${word.id}
    `;

    return false;
  }
}

async function main() {
  console.log('🔊 Regenerating Missing Audio\n');

  if (targetUserEmail) {
    console.log(`Filtering to user: ${targetUserEmail}\n`);
  }

  // Get words without audio
  const wordsWithoutAudio = await getWordsWithoutAudio();

  if (wordsWithoutAudio.length === 0) {
    console.log('✅ All words have audio! Nothing to regenerate.');
    await db.end();
    return;
  }

  console.log(`Found ${wordsWithoutAudio.length} words without audio\n`);

  // Group by user for better logging
  const byUser = new Map<string, WordWithoutAudio[]>();
  for (const word of wordsWithoutAudio) {
    const key = word.user_email || word.user_id;
    if (!byUser.has(key)) byUser.set(key, []);
    byUser.get(key)!.push(word);
  }

  let totalSucceeded = 0;
  let totalFailed = 0;

  // Process each user's words
  for (const [userKey, words] of byUser) {
    console.log(`\n👤 User: ${userKey} (${words.length} words)`);

    // Process in batches of 3 to avoid rate limits
    const BATCH_SIZE = 3;
    const BATCH_DELAY_MS = 500;

    for (let i = 0; i < words.length; i += BATCH_SIZE) {
      const batch = words.slice(i, i + BATCH_SIZE);

      const results = await Promise.all(
        batch.map(word => regenerateAudioForWord(word))
      );

      const succeeded = results.filter(Boolean).length;
      const failed = results.length - succeeded;
      totalSucceeded += succeeded;
      totalFailed += failed;

      // Add delay between batches
      if (i + BATCH_SIZE < words.length) {
        await sleep(BATCH_DELAY_MS);
      }
    }
  }

  console.log('\n' + '─'.repeat(50));
  console.log('📊 Summary:');
  console.log(`   ✅ Succeeded: ${totalSucceeded}`);
  console.log(`   ❌ Failed: ${totalFailed}`);
  console.log('─'.repeat(50));

  await db.end();
}

main().catch(console.error);
