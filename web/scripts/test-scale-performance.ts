/**
 * R-03: Scale Performance Test
 *
 * Tests app performance with 500+ words to ensure:
 * - Notebook loads without timeout
 * - API responses remain fast
 * - No memory issues
 *
 * Usage: npx tsx scripts/test-scale-performance.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { words, userProfiles } from '../src/lib/db/schema';
import { eq, sql, inArray } from 'drizzle-orm';

// Configuration - Use existing test user to avoid signup rate limits
const TEST_EMAIL = 'test-en-pt@llyli.test';
const TEST_PASSWORD = 'TestPassword123!';
const WORD_COUNT = 550; // Target 550 words to exceed 500 threshold

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const DATABASE_URL = process.env.DATABASE_URL!;

// Sample Portuguese words for seeding
const SAMPLE_WORDS = [
  { pt: 'casa', en: 'house' },
  { pt: 'carro', en: 'car' },
  { pt: 'água', en: 'water' },
  { pt: 'comida', en: 'food' },
  { pt: 'livro', en: 'book' },
  { pt: 'mesa', en: 'table' },
  { pt: 'cadeira', en: 'chair' },
  { pt: 'janela', en: 'window' },
  { pt: 'porta', en: 'door' },
  { pt: 'telefone', en: 'phone' },
  { pt: 'computador', en: 'computer' },
  { pt: 'trabalho', en: 'work' },
  { pt: 'escola', en: 'school' },
  { pt: 'hospital', en: 'hospital' },
  { pt: 'restaurante', en: 'restaurant' },
  { pt: 'supermercado', en: 'supermarket' },
  { pt: 'farmácia', en: 'pharmacy' },
  { pt: 'banco', en: 'bank' },
  { pt: 'praia', en: 'beach' },
  { pt: 'montanha', en: 'mountain' },
  { pt: 'rio', en: 'river' },
  { pt: 'floresta', en: 'forest' },
  { pt: 'cidade', en: 'city' },
  { pt: 'rua', en: 'street' },
  { pt: 'avenida', en: 'avenue' },
  { pt: 'praça', en: 'square' },
  { pt: 'jardim', en: 'garden' },
  { pt: 'parque', en: 'park' },
  { pt: 'aeroporto', en: 'airport' },
  { pt: 'estação', en: 'station' },
  { pt: 'hotel', en: 'hotel' },
  { pt: 'cinema', en: 'cinema' },
  { pt: 'teatro', en: 'theater' },
  { pt: 'museu', en: 'museum' },
  { pt: 'biblioteca', en: 'library' },
  { pt: 'igreja', en: 'church' },
  { pt: 'mercado', en: 'market' },
  { pt: 'padaria', en: 'bakery' },
  { pt: 'café', en: 'coffee shop' },
  { pt: 'bar', en: 'bar' },
  { pt: 'loja', en: 'store' },
  { pt: 'escritório', en: 'office' },
  { pt: 'fábrica', en: 'factory' },
  { pt: 'empresa', en: 'company' },
  { pt: 'governo', en: 'government' },
  { pt: 'polícia', en: 'police' },
  { pt: 'bombeiro', en: 'firefighter' },
  { pt: 'médico', en: 'doctor' },
  { pt: 'enfermeiro', en: 'nurse' },
  { pt: 'professor', en: 'teacher' },
];

const CATEGORIES = [
  'food_dining',
  'social',
  'shopping',
  'transport',
  'work',
  'home',
  'health',
  'other',
];

interface TestResult {
  test: string;
  duration: number;
  success: boolean;
  details?: string;
}

const results: TestResult[] = [];

function log(message: string) {
  console.log(`[Scale Test] ${message}`);
}

function logResult(test: string, duration: number, success: boolean, details?: string) {
  results.push({ test, duration, success, details });
  const status = success ? '✅' : '❌';
  const time = `${duration}ms`;
  console.log(`  ${status} ${test}: ${time}${details ? ` - ${details}` : ''}`);
}

async function main() {
  log('Starting R-03 Scale Performance Test');
  log(`Target: ${WORD_COUNT} words\n`);

  // Initialize clients
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const client = postgres(DATABASE_URL);
  const db = drizzle(client);

  try {
    // Step 1: Sign in with existing test user
    log('Step 1: Signing in test user...');

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    if (signInError) {
      throw new Error(`Failed to sign in: ${signInError.message}`);
    }

    const userId = signInData.user!.id;
    log(`  Signed in as: ${userId}`);

    // Step 2: Check current word count
    log('\nStep 2: Checking current word count...');
    const existingWords = await db.select({ count: sql<number>`count(*)::int` })
      .from(words)
      .where(eq(words.userId, userId));

    const currentCount = existingWords[0]?.count || 0;
    log(`  Current words: ${currentCount}`);

    // Step 3: Seed words if needed
    if (currentCount < WORD_COUNT) {
      const wordsToAdd = WORD_COUNT - currentCount;
      log(`\nStep 3: Seeding ${wordsToAdd} additional words...`);

      const startSeed = Date.now();
      const batchSize = 100;
      let added = 0;

      for (let batch = 0; added < wordsToAdd; batch++) {
        const batchWords = [];
        const batchCount = Math.min(batchSize, wordsToAdd - added);

        for (let i = 0; i < batchCount; i++) {
          const wordIndex = (currentCount + added + i) % SAMPLE_WORDS.length;
          const word = SAMPLE_WORDS[wordIndex];
          const suffix = Math.floor((currentCount + added + i) / SAMPLE_WORDS.length);
          const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

          batchWords.push({
            userId,
            originalText: suffix > 0 ? `${word.pt} ${suffix}` : word.pt,
            translation: suffix > 0 ? `${word.en} ${suffix}` : word.en,
            language: 'target' as const, // Portuguese words are in target language for EN→PT user
            sourceLang: 'pt',
            targetLang: 'en',
            category,
            stability: 1 + Math.random() * 5,
            difficulty: 0.3 + Math.random() * 0.4,
            reviewCount: Math.floor(Math.random() * 10),
            lapseCount: Math.floor(Math.random() * 3),
            consecutiveCorrectSessions: Math.floor(Math.random() * 3),
            nextReviewDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
          });
        }

        await db.insert(words).values(batchWords);
        added += batchCount;
        process.stdout.write(`\r  Progress: ${added}/${wordsToAdd} words`);
      }

      const seedDuration = Date.now() - startSeed;
      console.log('');
      logResult('Seed 500+ words', seedDuration, true, `${wordsToAdd} words in ${batchSize}-word batches`);
    } else {
      log('\nStep 3: Skipped - already have enough words');
    }

    // Step 4: Performance tests
    log('\nStep 4: Running performance tests...\n');

    // Note: Thresholds account for ~100-200ms network latency to remote Supabase

    // Test 4a: Count all words (simple query)
    const startCount = Date.now();
    const countResult = await db.select({ count: sql<number>`count(*)::int` })
      .from(words)
      .where(eq(words.userId, userId));
    const countDuration = Date.now() - startCount;
    logResult('COUNT query', countDuration, countDuration < 600, `${countResult[0]?.count} words`);

    // Test 4b: Fetch all words with pagination (like notebook)
    const startFetchAll = Date.now();
    const allWords = await db.select()
      .from(words)
      .where(eq(words.userId, userId))
      .limit(100);
    const fetchAllDuration = Date.now() - startFetchAll;
    logResult('FETCH 100 words', fetchAllDuration, fetchAllDuration < 1000, `${allWords.length} rows`);

    // Test 4c: Fetch words by category (notebook category view)
    const startCategory = Date.now();
    const categoryWords = await db.select()
      .from(words)
      .where(eq(words.userId, userId))
      .orderBy(words.category);
    const categoryDuration = Date.now() - startCategory;
    logResult('FETCH all by category', categoryDuration, categoryDuration < 2000, `${categoryWords.length} rows`);

    // Test 4d: Count by category (notebook summary)
    const startGroupBy = Date.now();
    const categoryCounts = await db.select({
      category: words.category,
      count: sql<number>`count(*)::int`,
    })
      .from(words)
      .where(eq(words.userId, userId))
      .groupBy(words.category);
    const groupByDuration = Date.now() - startGroupBy;
    logResult('GROUP BY category', groupByDuration, groupByDuration < 600, `${categoryCounts.length} categories`);

    // Test 4e: Fetch due words (review queue)
    const startDue = Date.now();
    const dueWords = await db.select()
      .from(words)
      .where(eq(words.userId, userId))
      .orderBy(words.nextReviewDate)
      .limit(50);
    const dueDuration = Date.now() - startDue;
    logResult('FETCH due words (limit 50)', dueDuration, dueDuration < 1000, `${dueWords.length} rows`);

    // Test 4f: Search words (notebook search)
    const startSearch = Date.now();
    const searchResults = await db.select()
      .from(words)
      .where(eq(words.userId, userId))
      .orderBy(words.originalText)
      .limit(500);
    // Filter in JS to simulate LIKE search
    const filtered = searchResults.filter(w =>
      w.originalText.toLowerCase().includes('casa') ||
      w.translation?.toLowerCase().includes('house')
    );
    const searchDuration = Date.now() - startSearch;
    logResult('SEARCH words', searchDuration, searchDuration < 2000, `${filtered.length} matches`);

    // Test 4g: Complex stats query (progress page)
    const startStats = Date.now();
    const stats = await db.select({
      total: sql<number>`count(*)::int`,
      mastered: sql<number>`count(*) filter (where consecutive_correct_sessions >= 3)::int`,
      struggling: sql<number>`count(*) filter (where lapse_count >= 3)::int`,
      dueToday: sql<number>`count(*) filter (where next_review_date <= now())::int`,
    })
      .from(words)
      .where(eq(words.userId, userId));
    const statsDuration = Date.now() - startStats;
    logResult('STATS aggregation', statsDuration, statsDuration < 1000,
      `total=${stats[0]?.total}, mastered=${stats[0]?.mastered}, struggling=${stats[0]?.struggling}`);

    // Test 4h: Bulk update (simulate batch review)
    const startUpdate = Date.now();
    const wordsToUpdate = dueWords.slice(0, 10).map(w => w.id);
    if (wordsToUpdate.length > 0) {
      await db.update(words)
        .set({
          reviewCount: sql`review_count + 1`,
          lastReviewDate: new Date(),
        })
        .where(inArray(words.id, wordsToUpdate));
    }
    const updateDuration = Date.now() - startUpdate;
    logResult('BULK UPDATE 10 words', updateDuration, updateDuration < 1000, `${wordsToUpdate.length} updated`);

    // Summary
    log('\n========================================');
    log('PERFORMANCE TEST SUMMARY');
    log('========================================\n');

    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`Total tests: ${results.length}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌`);

    if (failed > 0) {
      console.log('\nFailed tests:');
      results.filter(r => !r.success).forEach(r => {
        console.log(`  - ${r.test}: ${r.duration}ms`);
      });
    }

    // Performance thresholds (adjusted for remote Supabase ~100-200ms network latency)
    log('\nPerformance Thresholds (with network latency):');
    log('  - COUNT query: < 600ms');
    log('  - FETCH 100 rows: < 1000ms');
    log('  - FETCH all rows: < 2000ms');
    log('  - GROUP BY: < 600ms');
    log('  - FETCH due: < 1000ms');
    log('  - SEARCH: < 2000ms');
    log('  - STATS: < 1000ms');
    log('  - BULK UPDATE: < 1000ms');

    const allPassed = failed === 0;
    log(`\nR-03 Scale Test: ${allPassed ? '✅ PASSED' : '❌ FAILED'}`);

    await client.end();
    process.exit(allPassed ? 0 : 1);

  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    await client.end();
    process.exit(1);
  }
}

main();
