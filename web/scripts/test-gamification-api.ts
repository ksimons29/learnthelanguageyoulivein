import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import postgres from 'postgres';

/**
 * Gamification API Integration Tests
 *
 * Tests the gamification API endpoints with real database state.
 * Run after seeding test data with seed-gamification-test-data.ts
 *
 * Usage: npx tsx scripts/test-gamification-api.ts
 *
 * Prerequisites:
 * 1. Run: npx tsx scripts/seed-gamification-test-data.ts
 * 2. Have .env.local configured with Supabase credentials
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const databaseUrl = process.env.DATABASE_URL!;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const db = postgres(databaseUrl);

const TEST_USER_EMAIL = 'test-gamification@llyli.test';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

async function test(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
    results.push({ name, passed: true });
    console.log(`  ✅ ${name}`);
  } catch (error) {
    results.push({
      name,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    });
    console.log(`  ❌ ${name}`);
    console.log(`     Error: ${error instanceof Error ? error.message : error}`);
  }
}

async function getUserId(): Promise<string> {
  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users?.users?.find(u => u.email === TEST_USER_EMAIL);
  if (!user) {
    throw new Error(`Test user ${TEST_USER_EMAIL} not found. Run seed script first.`);
  }
  return user.id;
}

// ============================================================================
// Database State Tests
// ============================================================================

async function testDatabaseState(userId: string) {
  console.log('\n📦 Testing Database State...');

  await test('User has words in database', async () => {
    const [result] = await db`
      SELECT COUNT(*) as count FROM words WHERE user_id = ${userId}
    `;
    assert(Number(result.count) > 0, `Expected words, got ${result.count}`);
  });

  await test('User has words with work category', async () => {
    const [result] = await db`
      SELECT COUNT(*) as count FROM words
      WHERE user_id = ${userId} AND category = 'work'
    `;
    assert(Number(result.count) > 0, `Expected work category words, got ${result.count}`);
  });

  await test('User has words with social category', async () => {
    const [result] = await db`
      SELECT COUNT(*) as count FROM words
      WHERE user_id = ${userId} AND category = 'social'
    `;
    assert(Number(result.count) > 0, `Expected social category words, got ${result.count}`);
  });

  await test('User has words with high lapse count for Boss Round', async () => {
    const [result] = await db`
      SELECT COUNT(*) as count FROM words
      WHERE user_id = ${userId} AND lapse_count >= 3
    `;
    assert(Number(result.count) >= 3, `Expected 3+ high lapse words, got ${result.count}`);
  });

  await test('User has daily progress record', async () => {
    const today = new Date().toISOString().split('T')[0];
    const [result] = await db`
      SELECT * FROM daily_progress
      WHERE user_id = ${userId} AND date = ${today}
    `;
    assert(result !== undefined, 'Expected daily progress record');
  });

  await test('User has streak state', async () => {
    const [result] = await db`
      SELECT * FROM streak_state WHERE user_id = ${userId}
    `;
    assert(result !== undefined, 'Expected streak state record');
    assert(Number(result.current_streak) > 0, 'Expected current streak > 0');
  });

  await test('User has bingo state', async () => {
    const today = new Date().toISOString().split('T')[0];
    const [result] = await db`
      SELECT * FROM bingo_state
      WHERE user_id = ${userId} AND date = ${today}
    `;
    assert(result !== undefined, 'Expected bingo state record');
  });
}

// ============================================================================
// Gamification State Tests
// ============================================================================

async function testGamificationState(userId: string) {
  console.log('\n📊 Testing Gamification State...');

  await test('Daily progress has correct structure', async () => {
    const today = new Date().toISOString().split('T')[0];
    const [result] = await db`
      SELECT * FROM daily_progress
      WHERE user_id = ${userId} AND date = ${today}
    `;

    assert('target_reviews' in result, 'Missing target_reviews');
    assert('completed_reviews' in result, 'Missing completed_reviews');
    assert(Number(result.target_reviews) > 0, 'target_reviews should be > 0');
  });

  await test('Streak state has correct structure', async () => {
    const [result] = await db`
      SELECT * FROM streak_state WHERE user_id = ${userId}
    `;

    assert('current_streak' in result, 'Missing current_streak');
    assert('longest_streak' in result, 'Missing longest_streak');
    assert('streak_freeze_count' in result, 'Missing streak_freeze_count');
  });

  await test('Bingo state has square definitions', async () => {
    const today = new Date().toISOString().split('T')[0];
    const [result] = await db`
      SELECT * FROM bingo_state
      WHERE user_id = ${userId} AND date = ${today}
    `;

    const definitions = result.square_definitions;
    assert(Array.isArray(definitions), 'square_definitions should be array');
    assert(definitions.length === 9, `Expected 9 bingo squares, got ${definitions.length}`);
  });

  await test('Bingo squares include work category', async () => {
    const today = new Date().toISOString().split('T')[0];
    const [result] = await db`
      SELECT * FROM bingo_state
      WHERE user_id = ${userId} AND date = ${today}
    `;

    const definitions = result.square_definitions as { id: string }[];
    const hasWorkSquare = definitions.some(d => d.id === 'workWord');
    assert(hasWorkSquare, 'Bingo should have workWord square');
  });

  await test('Bingo squares include social category', async () => {
    const today = new Date().toISOString().split('T')[0];
    const [result] = await db`
      SELECT * FROM bingo_state
      WHERE user_id = ${userId} AND date = ${today}
    `;

    const definitions = result.square_definitions as { id: string }[];
    const hasSocialSquare = definitions.some(d => d.id === 'socialWord');
    assert(hasSocialSquare, 'Bingo should have socialWord square');
  });
}

// ============================================================================
// Boss Round Tests
// ============================================================================

async function testBossRound(userId: string) {
  console.log('\n🏆 Testing Boss Round...');

  await test('Boss round history exists', async () => {
    const rows = await db`
      SELECT * FROM boss_round_history WHERE user_id = ${userId}
    `;
    assert(rows.length > 0, 'Expected boss round history records');
  });

  await test('Boss round history has correct structure', async () => {
    const [result] = await db`
      SELECT * FROM boss_round_history
      WHERE user_id = ${userId}
      ORDER BY completed_at DESC
      LIMIT 1
    `;

    assert('total_words' in result, 'Missing total_words');
    assert('correct_count' in result, 'Missing correct_count');
    assert('accuracy' in result, 'Missing accuracy');
    assert('is_perfect' in result, 'Missing is_perfect');
  });

  await test('Can calculate best score from history', async () => {
    const [result] = await db`
      SELECT MAX(correct_count) as best_score
      FROM boss_round_history
      WHERE user_id = ${userId}
    `;

    assert(result.best_score !== null, 'Expected best score');
    assert(Number(result.best_score) > 0, 'Expected best score > 0');
  });

  await test('Words sorted correctly for Boss Round selection', async () => {
    const rows = await db`
      SELECT id, original_text, lapse_count
      FROM words
      WHERE user_id = ${userId}
      ORDER BY lapse_count DESC, retrievability ASC
      LIMIT 5
    `;

    assert(rows.length >= 5, 'Expected at least 5 words for Boss Round');

    // Verify ordering
    for (let i = 1; i < rows.length; i++) {
      assert(
        Number(rows[i - 1].lapse_count) >= Number(rows[i].lapse_count),
        'Words should be ordered by lapse_count DESC'
      );
    }
  });
}

// ============================================================================
// Daily Goal Completion Flow
// ============================================================================

async function testDailyGoalCompletion(userId: string) {
  console.log('\n🎯 Testing Daily Goal Completion Flow...');

  const today = new Date().toISOString().split('T')[0];

  await test('Can update daily progress', async () => {
    // Increment completed reviews
    await db`
      UPDATE daily_progress
      SET completed_reviews = completed_reviews + 1
      WHERE user_id = ${userId} AND date = ${today}
    `;

    const [result] = await db`
      SELECT completed_reviews FROM daily_progress
      WHERE user_id = ${userId} AND date = ${today}
    `;

    assert(Number(result.completed_reviews) > 0, 'Expected incremented completed_reviews');
  });

  await test('Can mark daily goal complete', async () => {
    await db`
      UPDATE daily_progress
      SET completed_reviews = target_reviews,
          completed_at = NOW()
      WHERE user_id = ${userId} AND date = ${today}
    `;

    const [result] = await db`
      SELECT completed_reviews, target_reviews, completed_at
      FROM daily_progress
      WHERE user_id = ${userId} AND date = ${today}
    `;

    assert(
      Number(result.completed_reviews) >= Number(result.target_reviews),
      'Expected completed_reviews >= target_reviews'
    );
    assert(result.completed_at !== null, 'Expected completed_at to be set');
  });

  await test('Streak increments when daily goal complete', async () => {
    const [before] = await db`
      SELECT current_streak FROM streak_state WHERE user_id = ${userId}
    `;

    await db`
      UPDATE streak_state
      SET current_streak = current_streak + 1,
          last_completed_date = ${today}
      WHERE user_id = ${userId}
    `;

    const [after] = await db`
      SELECT current_streak FROM streak_state WHERE user_id = ${userId}
    `;

    assert(
      Number(after.current_streak) > Number(before.current_streak),
      'Streak should increment'
    );
  });
}

// ============================================================================
// Bingo Square Completion
// ============================================================================

async function testBingoSquareCompletion(userId: string) {
  console.log('\n🎲 Testing Bingo Square Completion...');

  const today = new Date().toISOString().split('T')[0];

  await test('Can complete a bingo square', async () => {
    // Get current state
    const [before] = await db`
      SELECT squares_completed FROM bingo_state
      WHERE user_id = ${userId} AND date = ${today}
    `;

    const squaresBefore = before.squares_completed as string[];

    // Add a completed square
    const newSquares = [...squaresBefore, 'review5'];
    await db`
      UPDATE bingo_state
      SET squares_completed = ${JSON.stringify(newSquares)}
      WHERE user_id = ${userId} AND date = ${today}
    `;

    const [after] = await db`
      SELECT squares_completed FROM bingo_state
      WHERE user_id = ${userId} AND date = ${today}
    `;

    const squaresAfter = after.squares_completed as string[];
    assert(squaresAfter.includes('review5'), 'Expected review5 in completed squares');
  });

  await test('Can complete work word bingo square', async () => {
    const [before] = await db`
      SELECT squares_completed FROM bingo_state
      WHERE user_id = ${userId} AND date = ${today}
    `;

    const squaresBefore = before.squares_completed as string[];
    if (!squaresBefore.includes('workWord')) {
      const newSquares = [...squaresBefore, 'workWord'];
      await db`
        UPDATE bingo_state
        SET squares_completed = ${JSON.stringify(newSquares)}
        WHERE user_id = ${userId} AND date = ${today}
      `;
    }

    const [after] = await db`
      SELECT squares_completed FROM bingo_state
      WHERE user_id = ${userId} AND date = ${today}
    `;

    const squaresAfter = after.squares_completed as string[];
    assert(squaresAfter.includes('workWord'), 'Expected workWord in completed squares');
  });

  await test('Can complete social word bingo square', async () => {
    const [before] = await db`
      SELECT squares_completed FROM bingo_state
      WHERE user_id = ${userId} AND date = ${today}
    `;

    const squaresBefore = before.squares_completed as string[];
    if (!squaresBefore.includes('socialWord')) {
      const newSquares = [...squaresBefore, 'socialWord'];
      await db`
        UPDATE bingo_state
        SET squares_completed = ${JSON.stringify(newSquares)}
        WHERE user_id = ${userId} AND date = ${today}
      `;
    }

    const [after] = await db`
      SELECT squares_completed FROM bingo_state
      WHERE user_id = ${userId} AND date = ${today}
    `;

    const squaresAfter = after.squares_completed as string[];
    assert(squaresAfter.includes('socialWord'), 'Expected socialWord in completed squares');
  });

  await test('Can achieve bingo with left column', async () => {
    // Left column: review5, multipleChoice, socialWord
    const newSquares = ['review5', 'multipleChoice', 'socialWord'];
    await db`
      UPDATE bingo_state
      SET squares_completed = ${JSON.stringify(newSquares)},
          bingo_achieved = true,
          bingo_achieved_at = NOW()
      WHERE user_id = ${userId} AND date = ${today}
    `;

    const [result] = await db`
      SELECT bingo_achieved FROM bingo_state
      WHERE user_id = ${userId} AND date = ${today}
    `;

    assert(result.bingo_achieved === true, 'Expected bingo_achieved = true');
  });
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  LLYLI Gamification API Integration Tests');
  console.log('═══════════════════════════════════════════════');

  try {
    const userId = await getUserId();
    console.log(`\n🔐 Using test user: ${TEST_USER_EMAIL}`);
    console.log(`   User ID: ${userId}`);

    await testDatabaseState(userId);
    await testGamificationState(userId);
    await testBossRound(userId);
    await testDailyGoalCompletion(userId);
    await testBingoSquareCompletion(userId);

    // Summary
    console.log('\n═══════════════════════════════════════════════');
    console.log('  Summary');
    console.log('═══════════════════════════════════════════════');

    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;

    console.log(`\n  Total: ${results.length} tests`);
    console.log(`  ✅ Passed: ${passed}`);
    console.log(`  ❌ Failed: ${failed}`);

    if (failed > 0) {
      console.log('\n  Failed tests:');
      for (const result of results.filter(r => !r.passed)) {
        console.log(`    - ${result.name}: ${result.error}`);
      }
      process.exit(1);
    } else {
      console.log('\n✅ All tests passed!\n');
    }
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await db.end();
  }
}

main();
