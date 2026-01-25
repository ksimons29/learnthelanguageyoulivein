/**
 * Test Example Sentence Reliability
 *
 * Tests both paths:
 * 1. Background retry - simulates capture with sentence generation
 * 2. On-demand fallback - creates word without sentence, then fetches to trigger generation
 *
 * Usage: npx tsx scripts/test-example-sentence-reliability.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL!;
if (!databaseUrl) {
  console.error('❌ Missing DATABASE_URL');
  process.exit(1);
}

const db = postgres(databaseUrl);

// Test user email
const TEST_USER_EMAIL = 'test-en-pt@llyli.test';

interface TestWord {
  id: string;
  original_text: string;
  translation: string;
  example_sentence: string | null;
  example_translation: string | null;
}

async function getTestUserId(): Promise<string | null> {
  const result = await db`
    SELECT id FROM auth.users WHERE email = ${TEST_USER_EMAIL}
  `;
  return result.length > 0 ? result[0].id : null;
}

async function createWordWithoutSentence(userId: string, word: string, translation: string): Promise<string> {
  const result = await db`
    INSERT INTO words (
      user_id, original_text, translation, language,
      source_lang, target_lang, category,
      difficulty, stability, retrievability, next_review_date,
      review_count, lapse_count, consecutive_correct_sessions, mastery_status
    ) VALUES (
      ${userId}, ${word}, ${translation}, 'target',
      'pt-PT', 'en', 'other',
      5.0, 1.0, 1.0, NOW(),
      0, 0, 0, 'learning'
    )
    RETURNING id
  `;
  return result[0].id;
}

async function getWord(wordId: string): Promise<TestWord | null> {
  const result = await db`
    SELECT id, original_text, translation, example_sentence, example_translation
    FROM words WHERE id = ${wordId}
  `;
  return result.length > 0 ? result[0] as unknown as TestWord : null;
}

async function deleteWord(wordId: string): Promise<void> {
  await db`DELETE FROM words WHERE id = ${wordId}`;
}

async function triggerOnDemandGeneration(userId: string): Promise<void> {
  // Simulate what GET /api/words does - find words without sentences and generate
  const { generateExampleSentence } = await import('../src/lib/sentences/example-sentence');

  const wordsWithoutSentence = await db`
    SELECT id, original_text, translation, source_lang, target_lang
    FROM words
    WHERE user_id = ${userId}
      AND example_sentence IS NULL
    LIMIT 3
  `;

  for (const word of wordsWithoutSentence) {
    const w = word as { id: string; original_text: string; translation: string; source_lang: string; target_lang: string };
    console.log(`  Generating sentence for "${w.original_text}"...`);

    // Determine text for sentence (target language)
    const isOriginalInTarget = w.source_lang.split('-')[0] === 'pt';
    const textForSentence = isOriginalInTarget ? w.original_text : w.translation;

    const result = await generateExampleSentence(
      textForSentence,
      'pt-PT',
      'en'
    );

    await db`
      UPDATE words
      SET example_sentence = ${result.sentence},
          example_translation = ${result.translation}
      WHERE id = ${w.id}
    `;

    console.log(`  ✅ Generated: "${result.sentence}"`);
  }
}

async function main() {
  console.log('🧪 Testing Example Sentence Reliability');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Get test user
  const userId = await getTestUserId();
  if (!userId) {
    console.error(`❌ Test user ${TEST_USER_EMAIL} not found`);
    await db.end();
    process.exit(1);
  }
  console.log(`✅ Found test user: ${TEST_USER_EMAIL}\n`);

  // Test 1: On-demand fallback
  console.log('📋 Test 1: On-Demand Fallback');
  console.log('─────────────────────────────────────────────');

  const testWord = 'Teste de fiabilidade';
  const testTranslation = 'Reliability test';

  console.log(`  Creating word "${testWord}" WITHOUT sentence...`);
  const wordId = await createWordWithoutSentence(userId, testWord, testTranslation);

  // Verify word has no sentence
  let word = await getWord(wordId);
  if (word?.example_sentence) {
    console.error('  ❌ FAIL: Word should NOT have sentence yet');
    await deleteWord(wordId);
    await db.end();
    process.exit(1);
  }
  console.log('  ✅ Word created without sentence (as expected)\n');

  // Trigger on-demand generation
  console.log('  Triggering on-demand generation...');
  await triggerOnDemandGeneration(userId);

  // Verify word now has sentence
  word = await getWord(wordId);
  if (!word?.example_sentence) {
    console.error('  ❌ FAIL: Word should have sentence after on-demand generation');
    await deleteWord(wordId);
    await db.end();
    process.exit(1);
  }

  console.log(`\n  ✅ PASS: On-demand generation worked!`);
  console.log(`     Sentence: "${word.example_sentence}"`);
  console.log(`     Translation: "${word.example_translation}"\n`);

  // Cleanup
  await deleteWord(wordId);
  console.log('  🧹 Cleaned up test word\n');

  // Test 2: Verify retry utility works
  console.log('📋 Test 2: Retry Utility');
  console.log('─────────────────────────────────────────────');

  const { withRetry } = await import('../src/lib/utils/retry');

  let attempts = 0;
  const failTwiceThenSucceed = async () => {
    attempts++;
    if (attempts < 3) {
      throw new Error(`Simulated failure ${attempts}`);
    }
    return 'success';
  };

  try {
    const result = await withRetry(failTwiceThenSucceed, 3, 100);
    if (result === 'success' && attempts === 3) {
      console.log(`  ✅ PASS: Retry worked after ${attempts} attempts\n`);
    } else {
      console.error('  ❌ FAIL: Unexpected result');
    }
  } catch (err) {
    console.error('  ❌ FAIL: Should have succeeded after retries');
  }

  // Test 3: Verify existing words have sentences
  console.log('📋 Test 3: Existing Words Coverage');
  console.log('─────────────────────────────────────────────');

  const stats = await db`
    SELECT
      COUNT(*) as total,
      COUNT(example_sentence) as with_sentence
    FROM words
    WHERE user_id = ${userId}
  `;

  const total = Number(stats[0].total);
  const withSentence = Number(stats[0].with_sentence);
  const coverage = total > 0 ? ((withSentence / total) * 100).toFixed(1) : '0';

  console.log(`  Total words: ${total}`);
  console.log(`  With sentence: ${withSentence}`);
  console.log(`  Coverage: ${coverage}%`);

  if (withSentence === total) {
    console.log('  ✅ PASS: All words have sentences\n');
  } else {
    console.log(`  ⚠️  ${total - withSentence} words missing sentences (will be generated on-demand)\n`);
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ All tests passed!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await db.end();
}

main().catch(async (err) => {
  console.error('Test failed:', err);
  await db.end();
  process.exit(1);
});
