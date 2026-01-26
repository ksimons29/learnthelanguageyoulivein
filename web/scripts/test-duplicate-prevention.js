#!/usr/bin/env node
/**
 * Test Duplicate Word Prevention
 *
 * Related to Issue #128: Race Condition in Duplicate Word Detection
 * Tests that the unique constraint prevents duplicate words.
 *
 * Usage: node scripts/test-duplicate-prevention.js
 */

require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');

const connectionString = process.env.DATABASE_URL;

console.log('🧪 Testing Duplicate Word Prevention...\n');

if (!connectionString) {
  console.error('❌ Missing DATABASE_URL in .env.local');
  process.exit(1);
}

const sql = postgres(connectionString, {
  prepare: false,
  max: 1
});

// Test user IDs (we'll look these up)
const TEST_USERS = [
  { email: 'test-en-pt@llyli.test', language: 'Portuguese', targetLang: 'pt-PT' },
  { email: 'test-en-sv@llyli.test', language: 'Swedish', targetLang: 'sv' },
  { email: 'test-nl-en@llyli.test', language: 'English', targetLang: 'en' },
];

async function getUserId(email) {
  const result = await sql`
    SELECT id FROM auth.users WHERE email = ${email}
  `;
  return result[0]?.id;
}

async function countUserWords(userId) {
  const result = await sql`
    SELECT COUNT(*) as count FROM words WHERE user_id = ${userId}
  `;
  return parseInt(result[0].count);
}

async function testDuplicateInsert(userId, testWord) {
  console.log(`   Testing duplicate insert with "${testWord}"...`);

  // First, check if word exists and delete it for clean test
  await sql`
    DELETE FROM words
    WHERE user_id = ${userId}
    AND lower(original_text) = lower(${testWord})
  `;

  // Insert the word first time
  try {
    await sql`
      INSERT INTO words (user_id, original_text, translation, language, source_lang, target_lang)
      VALUES (${userId}, ${testWord}, 'test translation', 'target', 'en', 'pt-PT')
    `;
    console.log(`      ✅ First insert succeeded`);
  } catch (error) {
    console.log(`      ❌ First insert failed: ${error.message}`);
    return false;
  }

  // Try to insert duplicate (exact match)
  try {
    await sql`
      INSERT INTO words (user_id, original_text, translation, language, source_lang, target_lang)
      VALUES (${userId}, ${testWord}, 'test translation 2', 'target', 'en', 'pt-PT')
    `;
    console.log(`      ❌ FAIL: Duplicate insert succeeded (should have failed!)`);
    return false;
  } catch (error) {
    if (error.message.includes('unique') || error.message.includes('duplicate')) {
      console.log(`      ✅ Duplicate blocked: unique constraint violation`);
    } else {
      console.log(`      ❌ Unexpected error: ${error.message}`);
      return false;
    }
  }

  // Try to insert duplicate with different case
  const upperWord = testWord.toUpperCase();
  try {
    await sql`
      INSERT INTO words (user_id, original_text, translation, language, source_lang, target_lang)
      VALUES (${userId}, ${upperWord}, 'test translation 3', 'target', 'en', 'pt-PT')
    `;
    console.log(`      ❌ FAIL: Case-variant "${upperWord}" inserted (should have failed!)`);
    return false;
  } catch (error) {
    if (error.message.includes('unique') || error.message.includes('duplicate')) {
      console.log(`      ✅ Case-variant blocked: "${upperWord}" detected as duplicate`);
    } else {
      console.log(`      ❌ Unexpected error: ${error.message}`);
      return false;
    }
  }

  // Clean up test word
  await sql`
    DELETE FROM words
    WHERE user_id = ${userId}
    AND lower(original_text) = lower(${testWord})
  `;

  return true;
}

async function testRaceConditionSimulation(userId) {
  console.log(`   Simulating race condition with concurrent inserts...`);

  const testWord = `race_test_${Date.now()}`;

  // Clean up any previous test
  await sql`
    DELETE FROM words
    WHERE user_id = ${userId}
    AND original_text LIKE 'race_test_%'
  `;

  // Simulate two concurrent inserts
  const insert1 = sql`
    INSERT INTO words (user_id, original_text, translation, language, source_lang, target_lang)
    VALUES (${userId}, ${testWord}, 'translation 1', 'target', 'en', 'pt-PT')
    RETURNING id
  `;

  const insert2 = sql`
    INSERT INTO words (user_id, original_text, translation, language, source_lang, target_lang)
    VALUES (${userId}, ${testWord}, 'translation 2', 'target', 'en', 'pt-PT')
    RETURNING id
  `;

  let results = { success: 0, failed: 0 };

  try {
    // Run both in parallel to simulate race condition
    const [result1, result2] = await Promise.allSettled([insert1, insert2]);

    if (result1.status === 'fulfilled') results.success++;
    if (result1.status === 'rejected') results.failed++;
    if (result2.status === 'fulfilled') results.success++;
    if (result2.status === 'rejected') results.failed++;

    if (results.success === 1 && results.failed === 1) {
      console.log(`      ✅ Race condition handled: 1 succeeded, 1 blocked`);

      // Clean up
      await sql`DELETE FROM words WHERE user_id = ${userId} AND original_text = ${testWord}`;
      return true;
    } else {
      console.log(`      ❌ FAIL: ${results.success} succeeded, ${results.failed} failed`);

      // Clean up any that got through
      await sql`DELETE FROM words WHERE user_id = ${userId} AND original_text = ${testWord}`;
      return false;
    }
  } catch (error) {
    console.log(`      ❌ Unexpected error: ${error.message}`);
    return false;
  }
}

async function testUserPersona(user) {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Testing: ${user.email} (${user.language} learner)`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  const userId = await getUserId(user.email);
  if (!userId) {
    console.log(`   ⚠️  User not found: ${user.email}`);
    console.log(`   Skipping tests for this user.\n`);
    return { passed: false, skipped: true };
  }

  console.log(`   User ID: ${userId.slice(0, 8)}...`);
  const wordCount = await countUserWords(userId);
  console.log(`   Current word count: ${wordCount}\n`);

  // Test 1: Duplicate insert prevention
  const test1 = await testDuplicateInsert(userId, 'duplicate_test_word');

  // Test 2: Race condition simulation
  const test2 = await testRaceConditionSimulation(userId);

  const passed = test1 && test2;
  console.log(`\n   Result: ${passed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

  return { passed, skipped: false };
}

async function run() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Duplicate Word Prevention Test Suite');
  console.log('Issue #128: Race Condition Fix');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const results = [];

  for (const user of TEST_USERS) {
    const result = await testUserPersona(user);
    results.push({ user: user.email, ...result });
  }

  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let allPassed = true;
  for (const result of results) {
    const status = result.skipped ? '⏭️  SKIPPED' : (result.passed ? '✅ PASS' : '❌ FAIL');
    console.log(`  ${status} - ${result.user}`);
    if (!result.passed && !result.skipped) allPassed = false;
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Final Result: ${allPassed ? '🎉 ALL PERSONAS PASSED' : '❌ SOME TESTS FAILED'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await sql.end();
  process.exit(allPassed ? 0 : 1);
}

run();
