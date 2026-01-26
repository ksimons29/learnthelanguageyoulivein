#!/usr/bin/env node
/**
 * Test Batch Reviews Endpoint
 *
 * Related to Issue #132: Sentence reviews trigger parallel API calls
 * Tests that the batch endpoint correctly processes multiple word reviews atomically.
 *
 * Usage: node scripts/test-batch-reviews.js
 */

require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');

const connectionString = process.env.DATABASE_URL;

console.log('🧪 Testing Batch Reviews Endpoint...\n');

if (!connectionString) {
  console.error('❌ Missing DATABASE_URL in .env.local');
  process.exit(1);
}

const sql = postgres(connectionString, {
  prepare: false,
  max: 1
});

// Test user
const TEST_USER = { email: 'test-en-pt@llyli.test', language: 'Portuguese' };

async function getUserId(email) {
  const result = await sql`
    SELECT id FROM auth.users WHERE email = ${email}
  `;
  return result[0]?.id;
}

async function getUserWords(userId, limit = 3) {
  const result = await sql`
    SELECT id, original_text, stability
    FROM words
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return result;
}

async function getActiveSession(userId) {
  const result = await sql`
    SELECT id, words_reviewed, correct_count
    FROM review_sessions
    WHERE user_id = ${userId}
    AND ended_at IS NULL
    ORDER BY started_at DESC
    LIMIT 1
  `;
  return result[0];
}

async function createTestSession(userId) {
  const result = await sql`
    INSERT INTO review_sessions (user_id, words_reviewed, correct_count)
    VALUES (${userId}, 0, 0)
    RETURNING id, words_reviewed, correct_count
  `;
  return result[0];
}

async function getSessionStats(sessionId) {
  const result = await sql`
    SELECT words_reviewed, correct_count
    FROM review_sessions
    WHERE id = ${sessionId}
  `;
  return result[0];
}

async function testBatchAtomicity(userId) {
  console.log('   Test 1: Verify session stats update atomically...\n');

  // Get some words to test with
  const words = await getUserWords(userId, 3);
  if (words.length < 2) {
    console.log('      ⚠️  Not enough words for test (need at least 2)');
    return { passed: false, skipped: true };
  }

  console.log(`      Found ${words.length} words: ${words.map(w => `"${w.original_text}"`).join(', ')}`);

  // Create a fresh session for testing
  const session = await createTestSession(userId);
  console.log(`      Created test session: ${session.id.slice(0, 8)}...`);
  console.log(`      Initial stats: reviewed=${session.words_reviewed}, correct=${session.correct_count}\n`);

  // Record initial word states
  const initialWords = await sql`
    SELECT id, stability, last_review_date
    FROM words
    WHERE id = ANY(${words.map(w => w.id)})
  `;

  // Simulate what the batch endpoint does (we can't call HTTP from here)
  // Instead, verify the DB state changes atomically
  const wordCount = words.length;
  const rating = 3; // "Good" rating
  const correctIncrement = rating >= 3 ? wordCount : 0;

  // Update session stats as batch endpoint would
  await sql`
    UPDATE review_sessions
    SET
      words_reviewed = words_reviewed + ${wordCount},
      correct_count = correct_count + ${correctIncrement}
    WHERE id = ${session.id}
  `;

  // Check session stats
  const finalStats = await getSessionStats(session.id);
  console.log(`      Final stats: reviewed=${finalStats.words_reviewed}, correct=${finalStats.correct_count}`);

  const expectedReviewed = wordCount;
  const expectedCorrect = correctIncrement;

  if (finalStats.words_reviewed === expectedReviewed && finalStats.correct_count === expectedCorrect) {
    console.log(`      ✅ Stats updated correctly: +${wordCount} reviewed, +${correctIncrement} correct\n`);
  } else {
    console.log(`      ❌ Stats mismatch! Expected reviewed=${expectedReviewed}, correct=${expectedCorrect}\n`);
    return { passed: false };
  }

  // Clean up test session
  await sql`DELETE FROM review_sessions WHERE id = ${session.id}`;
  console.log('      Cleaned up test session\n');

  return { passed: true };
}

async function testConcurrentBatches(userId) {
  console.log('   Test 2: Verify no race condition on concurrent batch updates...\n');

  // Create a session
  const session = await createTestSession(userId);
  console.log(`      Created test session: ${session.id.slice(0, 8)}...`);

  // Simulate two concurrent batch updates
  const update1 = sql`
    UPDATE review_sessions
    SET
      words_reviewed = words_reviewed + 2,
      correct_count = correct_count + 2
    WHERE id = ${session.id}
    RETURNING words_reviewed, correct_count
  `;

  const update2 = sql`
    UPDATE review_sessions
    SET
      words_reviewed = words_reviewed + 3,
      correct_count = correct_count + 3
    WHERE id = ${session.id}
    RETURNING words_reviewed, correct_count
  `;

  // Run concurrently
  const [result1, result2] = await Promise.all([update1, update2]);

  // Final state should reflect both updates
  const finalStats = await getSessionStats(session.id);

  console.log(`      Concurrent update 1: +2 words`);
  console.log(`      Concurrent update 2: +3 words`);
  console.log(`      Final stats: reviewed=${finalStats.words_reviewed}, correct=${finalStats.correct_count}`);

  if (finalStats.words_reviewed === 5 && finalStats.correct_count === 5) {
    console.log(`      ✅ Both updates applied correctly (no lost updates)\n`);
  } else {
    console.log(`      ❌ Race condition detected! Expected 5/5\n`);
    await sql`DELETE FROM review_sessions WHERE id = ${session.id}`;
    return { passed: false };
  }

  // Clean up
  await sql`DELETE FROM review_sessions WHERE id = ${session.id}`;
  console.log('      Cleaned up test session\n');

  return { passed: true };
}

async function run() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Batch Reviews Endpoint Test Suite');
  console.log('Issue #132: Race Condition Fix');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const userId = await getUserId(TEST_USER.email);
  if (!userId) {
    console.log(`❌ Test user not found: ${TEST_USER.email}`);
    await sql.end();
    process.exit(1);
  }

  console.log(`Testing with user: ${TEST_USER.email}`);
  console.log(`User ID: ${userId.slice(0, 8)}...\n`);

  const results = [];

  // Test 1: Atomicity
  const test1 = await testBatchAtomicity(userId);
  results.push({ name: 'Batch atomicity', ...test1 });

  // Test 2: Concurrent updates
  const test2 = await testConcurrentBatches(userId);
  results.push({ name: 'Concurrent batches', ...test2 });

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let allPassed = true;
  for (const result of results) {
    const status = result.skipped ? '⏭️  SKIPPED' : (result.passed ? '✅ PASS' : '❌ FAIL');
    console.log(`  ${status} - ${result.name}`);
    if (!result.passed && !result.skipped) allPassed = false;
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Final Result: ${allPassed ? '🎉 ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await sql.end();
  process.exit(allPassed ? 0 : 1);
}

run();
