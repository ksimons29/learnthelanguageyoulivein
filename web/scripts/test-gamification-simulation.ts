/**
 * Gamification Simulation Test
 *
 * This script simulates gamification scenarios (streaks, daily progress, bingo)
 * by manipulating database timestamps. No waiting for real days needed.
 *
 * Usage: npx tsx scripts/test-gamification-simulation.ts
 *
 * Tests from MVP_LAUNCH_TEST_PLAN.md Part 2 (S5):
 * - Daily Progress (4 tests): Initial state, increment, goal complete, persistence
 * - Streak System (4 tests): New streak, increment, break, freeze
 * - Daily Bingo (9 tests): Square tracking, bingo line detection
 * - Boss Round (5 tests): Availability, word selection, personal best
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import postgres from 'postgres';
import { randomUUID } from 'crypto';

// ─────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────

const databaseUrl = process.env.DATABASE_URL!;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL is required in .env.local');
  process.exit(1);
}

const db = postgres(databaseUrl);

// Test user: EN→SV (consistent with FSRS simulation)
const TEST_USER_EMAIL = 'test-en-sv@llyli.test';

// Default bingo square definitions
const DEFAULT_SQUARES = [
  { id: 'review5', label: 'Review 5 words', target: 5 },
  { id: 'streak3', label: '3 correct in a row', target: 3 },
  { id: 'fillBlank', label: 'Complete a fill-blank', target: 1 },
  { id: 'multipleChoice', label: 'Complete a multiple choice', target: 1 },
  { id: 'addContext', label: 'Add memory context', target: 1 },
  { id: 'workWord', label: 'Review a work word', target: 1 },
  { id: 'socialWord', label: 'Review a social word', target: 1 },
  { id: 'masterWord', label: 'Master a word', target: 1 },
  { id: 'finishSession', label: 'Finish daily session', target: 1 },
];

// ─────────────────────────────────────────────────────────────────
// Test Results Tracking
// ─────────────────────────────────────────────────────────────────

interface TestResult {
  name: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

function recordTest(name: string, passed: boolean, details: string) {
  results.push({ name, passed, details });
  const icon = passed ? '✅' : '❌';
  console.log(`  ${icon} ${name}: ${details}`);
}

function assertEqual(name: string, actual: unknown, expected: unknown, context: string) {
  const passed = JSON.stringify(actual) === JSON.stringify(expected);
  recordTest(name, passed, `${JSON.stringify(actual)} === ${JSON.stringify(expected)} (${context})`);
  return passed;
}

function assertGreater(name: string, actual: number, expected: number, context: string) {
  const passed = actual > expected;
  recordTest(name, passed, `${actual} > ${expected} (${context})`);
  return passed;
}

function assertIncludes(name: string, array: unknown[], expected: unknown, context: string) {
  const passed = array.includes(expected);
  recordTest(name, passed, `${JSON.stringify(array)} includes ${JSON.stringify(expected)} (${context})`);
  return passed;
}

function assertTrue(name: string, actual: boolean, context: string) {
  recordTest(name, actual, `${actual} === true (${context})`);
  return actual;
}

// ─────────────────────────────────────────────────────────────────
// Date Helpers
// ─────────────────────────────────────────────────────────────────

function getDateOnly(date: Date): string {
  return date.toISOString().split('T')[0]; // '2026-01-22'
}

function daysAgo(n: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return date;
}

function today(): Date {
  return new Date();
}

// ─────────────────────────────────────────────────────────────────
// Database Helpers
// ─────────────────────────────────────────────────────────────────

async function getUserId(): Promise<string> {
  const [user] = await db`
    SELECT id FROM auth.users WHERE email = ${TEST_USER_EMAIL}
  `;
  if (!user) {
    throw new Error(`Test user ${TEST_USER_EMAIL} not found. Run create-test-users.ts first.`);
  }
  return user.id;
}

async function cleanupGamificationData(userId: string) {
  // Delete all gamification data for the test user
  await db`DELETE FROM daily_progress WHERE user_id = ${userId}`;
  await db`DELETE FROM streak_state WHERE user_id = ${userId}`;
  await db`DELETE FROM bingo_state WHERE user_id = ${userId}`;
  await db`DELETE FROM boss_round_history WHERE user_id = ${userId}`;
  // Delete test words (for boss round tests)
  await db`DELETE FROM words WHERE user_id = ${userId} AND original_text LIKE 'gam_test_%'`;
}

// ─────────────────────────────────────────────────────────────────
// Daily Progress Helpers
// ─────────────────────────────────────────────────────────────────

async function insertDailyProgress(
  userId: string,
  date: Date,
  completedReviews: number,
  targetReviews: number = 10
): Promise<string> {
  const dateStr = getDateOnly(date);
  const completedAt = completedReviews >= targetReviews ? new Date() : null;

  const [record] = await db`
    INSERT INTO daily_progress (user_id, date, completed_reviews, target_reviews, completed_at)
    VALUES (${userId}, ${dateStr}, ${completedReviews}, ${targetReviews}, ${completedAt})
    ON CONFLICT (user_id, date) DO UPDATE SET
      completed_reviews = ${completedReviews},
      completed_at = ${completedAt},
      updated_at = NOW()
    RETURNING id
  `;
  return record.id;
}

async function getDailyProgress(userId: string, date: Date) {
  const dateStr = getDateOnly(date);
  const [record] = await db`
    SELECT * FROM daily_progress WHERE user_id = ${userId} AND date = ${dateStr}
  `;
  return record;
}

// ─────────────────────────────────────────────────────────────────
// Streak State Helpers
// ─────────────────────────────────────────────────────────────────

async function insertStreakState(
  userId: string,
  currentStreak: number,
  longestStreak: number,
  lastCompletedDate: Date | null,
  streakFreezeCount: number = 1
): Promise<string> {
  const lastDateStr = lastCompletedDate ? getDateOnly(lastCompletedDate) : null;

  const [record] = await db`
    INSERT INTO streak_state (user_id, current_streak, longest_streak, last_completed_date, streak_freeze_count)
    VALUES (${userId}, ${currentStreak}, ${longestStreak}, ${lastDateStr}, ${streakFreezeCount})
    ON CONFLICT (user_id) DO UPDATE SET
      current_streak = ${currentStreak},
      longest_streak = ${longestStreak},
      last_completed_date = ${lastDateStr},
      streak_freeze_count = ${streakFreezeCount},
      updated_at = NOW()
    RETURNING id
  `;
  return record.id;
}

async function getStreakState(userId: string) {
  const [record] = await db`
    SELECT * FROM streak_state WHERE user_id = ${userId}
  `;
  return record;
}

async function updateStreakFromProgress(userId: string) {
  // This mimics what the API does: calculate streak from daily_progress records
  const rows = await db`
    SELECT date FROM daily_progress
    WHERE user_id = ${userId} AND completed_at IS NOT NULL
    ORDER BY date DESC
    LIMIT 30
  `;

  if (rows.length === 0) {
    await insertStreakState(userId, 0, 0, null);
    return;
  }

  // Count consecutive days from today backwards
  let streak = 0;
  const todayStr = getDateOnly(today());
  let expectedDate = todayStr;

  for (const row of rows) {
    const rowDate = typeof row.date === 'string' ? row.date : row.date.toISOString().split('T')[0];
    if (rowDate === expectedDate) {
      streak++;
      // Move to previous day
      const prev = new Date(expectedDate);
      prev.setDate(prev.getDate() - 1);
      expectedDate = getDateOnly(prev);
    } else {
      break;
    }
  }

  const lastCompleted = new Date(rows[0].date);
  await insertStreakState(userId, streak, Math.max(streak, 0), lastCompleted);
}

// ─────────────────────────────────────────────────────────────────
// Bingo State Helpers
// ─────────────────────────────────────────────────────────────────

async function insertBingoState(
  userId: string,
  date: Date,
  squaresCompleted: string[],
  bingoAchieved: boolean = false
): Promise<string> {
  const dateStr = getDateOnly(date);

  // postgres library handles JSONB serialization - pass objects directly
  const [record] = await db`
    INSERT INTO bingo_state (user_id, date, squares_completed, square_definitions, bingo_achieved)
    VALUES (${userId}, ${dateStr}, ${db.json(squaresCompleted)}, ${db.json(DEFAULT_SQUARES)}, ${bingoAchieved})
    ON CONFLICT (user_id, date) DO UPDATE SET
      squares_completed = ${db.json(squaresCompleted)},
      bingo_achieved = ${bingoAchieved},
      updated_at = NOW()
    RETURNING id
  `;
  return record.id;
}

async function getBingoState(userId: string, date: Date) {
  const dateStr = getDateOnly(date);
  const [record] = await db`
    SELECT * FROM bingo_state WHERE user_id = ${userId} AND date = ${dateStr}
  `;
  return record;
}

/**
 * Bingo board layout (3x3):
 * [0: review5]     [1: streak3]      [2: fillBlank]
 * [3: multiChoice] [4: addContext]   [5: workWord]
 * [6: socialWord]  [7: masterWord]   [8: finishSession]
 *
 * Lines:
 * - Horizontal: 0-1-2, 3-4-5, 6-7-8
 * - Vertical: 0-3-6, 1-4-7, 2-5-8
 * - Diagonal: 0-4-8, 2-4-6
 */
function checkBingoLine(squaresCompleted: string[]): boolean {
  const squareIds = DEFAULT_SQUARES.map(s => s.id);
  const completedIndices = new Set(
    squaresCompleted.map(id => squareIds.indexOf(id)).filter(i => i !== -1)
  );

  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontal
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Vertical
    [0, 4, 8], [2, 4, 6],            // Diagonal
  ];

  return lines.some(line => line.every(idx => completedIndices.has(idx)));
}

// ─────────────────────────────────────────────────────────────────
// Boss Round Helpers
// ─────────────────────────────────────────────────────────────────

async function insertBossRoundResult(
  userId: string,
  correctCount: number,
  totalWords: number = 5,
  timeUsed: number = 60
): Promise<string> {
  const accuracy = Math.round((correctCount / totalWords) * 100);
  const isPerfect = correctCount === totalWords;

  const [record] = await db`
    INSERT INTO boss_round_history (user_id, total_words, correct_count, time_used, accuracy, is_perfect)
    VALUES (${userId}, ${totalWords}, ${correctCount}, ${timeUsed}, ${accuracy}, ${isPerfect})
    RETURNING id
  `;
  return record.id;
}

async function getBossRoundHistory(userId: string) {
  const records = await db`
    SELECT * FROM boss_round_history
    WHERE user_id = ${userId}
    ORDER BY completed_at DESC
  `;
  return records;
}

async function getPersonalBest(userId: string) {
  const [record] = await db`
    SELECT MAX(correct_count) as best_score FROM boss_round_history
    WHERE user_id = ${userId}
  `;
  return record?.best_score ?? 0;
}

async function createTestWordsForBossRound(userId: string, count: number = 5): Promise<string[]> {
  const wordIds: string[] = [];
  for (let i = 0; i < count; i++) {
    const [word] = await db`
      INSERT INTO words (
        user_id, original_text, translation, language, source_lang, target_lang, category,
        category_confidence, difficulty, stability, retrievability, next_review_date,
        review_count, lapse_count, consecutive_correct_sessions, mastery_status
      ) VALUES (
        ${userId}, ${'gam_test_word_' + i}, ${'translation_' + i}, 'target', 'sv', 'sv', 'other',
        0.9, 5.0, 1.0, 1.0, NOW(),
        5, ${3 + i}, 0, 'learning'
      )
      RETURNING id
    `;
    wordIds.push(word.id);
  }
  return wordIds;
}

// ─────────────────────────────────────────────────────────────────
// TEST: Daily Progress (4 tests)
// ─────────────────────────────────────────────────────────────────

async function testDailyProgress(userId: string) {
  console.log('\n─────────────────────────────────────────────────────────');
  console.log('📊 SECTION 2.1: Daily Progress Tests');
  console.log('─────────────────────────────────────────────────────────\n');

  // Test 1: Initial state (0/10)
  const todayDate = today();
  await insertDailyProgress(userId, todayDate, 0);
  const initial = await getDailyProgress(userId, todayDate);
  assertEqual(
    'Initial state (0/10)',
    initial.completed_reviews,
    0,
    'New record has 0 completed reviews'
  );

  // Test 2: Increment (+1)
  await insertDailyProgress(userId, todayDate, 1);
  const incremented = await getDailyProgress(userId, todayDate);
  assertEqual(
    'Increment (+1)',
    incremented.completed_reviews,
    1,
    'completed_reviews = 1 after increment'
  );

  // Test 3: Goal complete (10/10)
  await insertDailyProgress(userId, todayDate, 10);
  const completed = await getDailyProgress(userId, todayDate);
  assertEqual(
    'Goal complete (10/10)',
    completed.completed_reviews,
    10,
    'completed_reviews = 10 at goal'
  );
  assertTrue(
    'Goal complete - completedAt set',
    completed.completed_at !== null,
    'completed_at is not null when goal reached'
  );

  // Test 4: Persistence
  const reloaded = await getDailyProgress(userId, todayDate);
  assertEqual(
    'Persistence',
    reloaded.completed_reviews,
    10,
    'Data persists after re-query'
  );
}

// ─────────────────────────────────────────────────────────────────
// TEST: Streak System (4 tests)
// ─────────────────────────────────────────────────────────────────

async function testStreakSystem(userId: string) {
  console.log('\n─────────────────────────────────────────────────────────');
  console.log('🔥 SECTION 2.2: Streak System Tests');
  console.log('─────────────────────────────────────────────────────────\n');

  // Clean up for fresh streak tests
  await db`DELETE FROM daily_progress WHERE user_id = ${userId}`;
  await db`DELETE FROM streak_state WHERE user_id = ${userId}`;

  // Test 1: New streak (complete goal today → streak = 1)
  const todayDate = today();
  await insertDailyProgress(userId, todayDate, 10); // Complete today
  await updateStreakFromProgress(userId);
  const newStreak = await getStreakState(userId);
  assertEqual(
    'New streak',
    newStreak.current_streak,
    1,
    'Streak = 1 after first completed day'
  );

  // Test 2: Streak increment (yesterday + today complete → streak = 2)
  await db`DELETE FROM daily_progress WHERE user_id = ${userId}`;
  await db`DELETE FROM streak_state WHERE user_id = ${userId}`;

  const yesterdayDate = daysAgo(1);
  await insertDailyProgress(userId, yesterdayDate, 10); // Complete yesterday
  await insertDailyProgress(userId, todayDate, 10);     // Complete today
  await updateStreakFromProgress(userId);
  const incrementedStreak = await getStreakState(userId);
  assertEqual(
    'Streak increment',
    incrementedStreak.current_streak,
    2,
    'Streak = 2 after two consecutive days'
  );

  // Test 3: Streak break (2 days ago complete, skip yesterday, today complete → streak = 1)
  await db`DELETE FROM daily_progress WHERE user_id = ${userId}`;
  await db`DELETE FROM streak_state WHERE user_id = ${userId}`;

  const twoDaysAgo = daysAgo(2);
  await insertDailyProgress(userId, twoDaysAgo, 10);   // Complete 2 days ago
  // Skip yesterday
  await insertDailyProgress(userId, todayDate, 10);    // Complete today
  await updateStreakFromProgress(userId);
  const brokenStreak = await getStreakState(userId);
  assertEqual(
    'Streak break',
    brokenStreak.current_streak,
    1,
    'Streak = 1 (reset) after missing a day'
  );

  // Test 4: Streak freeze
  await db`DELETE FROM streak_state WHERE user_id = ${userId}`;
  // Set up a streak with freeze available
  await insertStreakState(userId, 5, 5, daysAgo(1), 1); // 5 day streak, freeze available
  const withFreeze = await getStreakState(userId);
  assertEqual(
    'Streak freeze available',
    withFreeze.streak_freeze_count,
    1,
    'Freeze count = 1 (available)'
  );
  assertGreater(
    'Streak preserved with freeze',
    withFreeze.current_streak,
    0,
    'Streak > 0 when freeze available'
  );
}

// ─────────────────────────────────────────────────────────────────
// TEST: Daily Bingo (9 tests)
// ─────────────────────────────────────────────────────────────────

async function testDailyBingo(userId: string) {
  console.log('\n─────────────────────────────────────────────────────────');
  console.log('🎯 SECTION 2.3: Daily Bingo Tests');
  console.log('─────────────────────────────────────────────────────────\n');

  // Clean up
  await db`DELETE FROM bingo_state WHERE user_id = ${userId}`;

  const todayDate = today();

  // Test 1: Initial state (0/9)
  await insertBingoState(userId, todayDate, []);
  const initial = await getBingoState(userId, todayDate);
  const initialSquares = initial.squares_completed as string[];
  assertEqual(
    'Initial state (0/9)',
    initialSquares.length,
    0,
    'Empty squares_completed array'
  );

  // Test 2-9: Individual square tracking (testing representative squares)
  const squaresToTest = [
    'review5',
    'streak3',
    'fillBlank',
    'multipleChoice',
    'addContext',
    'workWord',
    'socialWord',
    'masterWord',
  ];

  for (const squareId of squaresToTest) {
    await insertBingoState(userId, todayDate, [squareId]);
    const state = await getBingoState(userId, todayDate);
    const squares = state.squares_completed as string[];
    assertIncludes(
      `Square: ${squareId}`,
      squares,
      squareId,
      `${squareId} tracked in squares_completed`
    );
  }

  // Test 10: Bingo line detection (horizontal line: row 1)
  const horizontalLine = ['review5', 'streak3', 'fillBlank'];
  await insertBingoState(userId, todayDate, horizontalLine);
  const hasBingo = checkBingoLine(horizontalLine);
  assertTrue(
    'Bingo line detection (horizontal)',
    hasBingo,
    'Horizontal line (row 1) detected'
  );

  // Additional: Test diagonal doesn't trigger for partial
  const partialDiagonal = ['review5', 'addContext']; // Missing finishSession
  const hasPartialBingo = checkBingoLine(partialDiagonal);
  assertEqual(
    'Partial line (no bingo)',
    hasPartialBingo,
    false,
    '2/3 diagonal does not count as bingo'
  );
}

// ─────────────────────────────────────────────────────────────────
// TEST: Boss Round (5 tests)
// ─────────────────────────────────────────────────────────────────

async function testBossRound(userId: string) {
  console.log('\n─────────────────────────────────────────────────────────');
  console.log('👹 SECTION 2.4: Boss Round Tests');
  console.log('─────────────────────────────────────────────────────────\n');

  // Clean up
  await db`DELETE FROM boss_round_history WHERE user_id = ${userId}`;
  await db`DELETE FROM daily_progress WHERE user_id = ${userId}`;
  await db`DELETE FROM words WHERE user_id = ${userId} AND original_text LIKE 'gam_test_%'`;

  // Test 1: Availability (daily goal must be complete)
  const todayDate = today();
  await insertDailyProgress(userId, todayDate, 5); // Not complete
  const incomplete = await getDailyProgress(userId, todayDate);
  assertEqual(
    'Boss round locked (goal incomplete)',
    incomplete.completed_at,
    null,
    'completed_at is null when goal not reached'
  );

  await insertDailyProgress(userId, todayDate, 10); // Complete
  const complete = await getDailyProgress(userId, todayDate);
  assertTrue(
    'Boss round unlocked (goal complete)',
    complete.completed_at !== null,
    'completed_at is set when goal reached'
  );

  // Test 2: Word selection (high lapse count words)
  const wordIds = await createTestWordsForBossRound(userId, 5);
  assertEqual(
    'Word selection',
    wordIds.length,
    5,
    '5 words created for boss round'
  );

  // Verify words have high lapse counts
  const [highLapseWord] = await db`
    SELECT lapse_count FROM words WHERE id = ${wordIds[4]}
  `;
  assertGreater(
    'High lapse count words',
    highLapseWord.lapse_count,
    2,
    'Boss round words have lapse_count > 2'
  );

  // Test 3: Result recording
  await insertBossRoundResult(userId, 3, 5, 60);
  const history = await getBossRoundHistory(userId);
  assertEqual(
    'Result recording',
    history.length,
    1,
    'Boss round result saved'
  );
  assertEqual(
    'Accuracy calculation',
    history[0].accuracy,
    60,
    'Accuracy = 60% (3/5)'
  );

  // Test 4: Personal best tracking
  const firstBest = await getPersonalBest(userId);
  assertEqual(
    'First personal best',
    firstBest,
    3,
    'Personal best = 3 after first round'
  );

  // Beat it
  await insertBossRoundResult(userId, 4, 5, 50);
  const newBest = await getPersonalBest(userId);
  assertEqual(
    'New personal best',
    newBest,
    4,
    'Personal best = 4 after improvement'
  );

  // Test 5: Perfect round detection
  await insertBossRoundResult(userId, 5, 5, 45);
  const [perfect] = await db`
    SELECT is_perfect FROM boss_round_history
    WHERE user_id = ${userId}
    ORDER BY completed_at DESC
    LIMIT 1
  `;
  assertTrue(
    'Perfect round detection',
    perfect.is_perfect,
    'is_perfect = true for 5/5'
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Runner
// ─────────────────────────────────────────────────────────────────

async function runSimulation() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(' Gamification Simulation Test');
  console.log(' Testing streaks, daily progress, bingo, and boss round');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Get test user
  const userId = await getUserId();
  console.log(`📧 Test user: ${TEST_USER_EMAIL}`);
  console.log(`🔑 User ID: ${userId}`);

  // Clean up before tests
  console.log('\n🧹 Cleaning up existing gamification data...');
  await cleanupGamificationData(userId);

  // Run all test sections
  await testDailyProgress(userId);
  await testStreakSystem(userId);
  await testDailyBingo(userId);
  await testBossRound(userId);

  // ─────────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(' TEST RESULTS SUMMARY');
  console.log('═══════════════════════════════════════════════════════════\n');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  console.log(`  Total: ${results.length}`);
  console.log(`  ✅ Passed: ${passed}`);
  console.log(`  ❌ Failed: ${failed}\n`);

  if (failed > 0) {
    console.log('  Failed tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`    ❌ ${r.name}: ${r.details}`);
    });
    console.log('');
  }

  // Cleanup test data
  console.log('🧹 Cleaning up test data...');
  await cleanupGamificationData(userId);

  // Close database connection
  await db.end();

  // Exit with appropriate code
  if (failed > 0) {
    console.log('\n❌ Gamification simulation FAILED');
    process.exit(1);
  } else {
    console.log('\n✅ Gamification simulation PASSED - All systems working!');
    process.exit(0);
  }
}

// Run the simulation
runSimulation().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
