import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import postgres from 'postgres';

/**
 * Seed comprehensive gamification test data
 *
 * Creates test users with:
 * - Words in various categories (work, social, travel, food)
 * - Words with different FSRS states (new, learning, mastered)
 * - Words with high lapse counts (for Boss Round testing)
 * - Daily progress records
 * - Streak state
 * - Bingo state
 *
 * Usage: npx tsx scripts/seed-gamification-test-data.ts
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

// Test words for EN→PT user with various categories and states
const TEST_WORDS_EN_PT = [
  // Work category words
  { original: 'reunião', translation: 'meeting', category: 'work', lapseCount: 3 },
  { original: 'prazo', translation: 'deadline', category: 'work', lapseCount: 2 },
  { original: 'relatório', translation: 'report', category: 'work', lapseCount: 1 },
  { original: 'colega', translation: 'colleague', category: 'work', lapseCount: 0 },

  // Social category words
  { original: 'obrigado', translation: 'thank you', category: 'social', lapseCount: 4 },
  { original: 'desculpa', translation: 'sorry', category: 'social', lapseCount: 3 },
  { original: 'bom dia', translation: 'good morning', category: 'social', lapseCount: 2 },
  { original: 'boa noite', translation: 'good night', category: 'social', lapseCount: 1 },
  { original: 'até logo', translation: 'see you later', category: 'social', lapseCount: 0 },

  // Travel category words
  { original: 'onde fica', translation: 'where is', category: 'travel', lapseCount: 5 },
  { original: 'casa de banho', translation: 'bathroom', category: 'travel', lapseCount: 2 },
  { original: 'estação', translation: 'station', category: 'travel', lapseCount: 1 },

  // Food category words
  { original: 'água', translation: 'water', category: 'food', lapseCount: 0 },
  { original: 'café', translation: 'coffee', category: 'food', lapseCount: 1 },
  { original: 'conta', translation: 'bill', category: 'food', lapseCount: 2 },

  // High lapse words for Boss Round testing (5 words with highest lapses)
  { original: 'muito obrigado', translation: 'thank you very much', category: 'social', lapseCount: 6 },
  { original: 'com licença', translation: 'excuse me', category: 'social', lapseCount: 5 },
  { original: 'preciso de ajuda', translation: 'I need help', category: 'travel', lapseCount: 4 },
];

interface TestUser {
  email: string;
  password: string;
  displayName: string;
  nativeLanguage: string;
  targetLanguage: string;
}

const TEST_USER: TestUser = {
  email: 'test-gamification@llyli.test',
  password: 'TestPassword123!',
  displayName: 'Gamification Tester',
  nativeLanguage: 'en',
  targetLanguage: 'pt-PT',
};

async function getOrCreateUser(): Promise<string> {
  console.log(`\n📦 Setting up user: ${TEST_USER.email}...`);

  // Check if user exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find(u => u.email === TEST_USER.email);

  let userId: string;

  if (existing) {
    console.log(`  ⚠️  User already exists: ${existing.id}`);
    userId = existing.id;

    // Update password
    await supabase.auth.admin.updateUserById(userId, {
      password: TEST_USER.password,
      email_confirm: true,
    });
  } else {
    // Create new user
    const { data, error } = await supabase.auth.admin.createUser({
      email: TEST_USER.email,
      password: TEST_USER.password,
      email_confirm: true,
      user_metadata: { display_name: TEST_USER.displayName },
    });

    if (error) {
      console.error(`  ❌ Failed to create user: ${error.message}`);
      process.exit(1);
    }

    userId = data.user.id;
    console.log(`  ✅ User created: ${userId}`);
  }

  // Create or update user profile
  await db`
    INSERT INTO user_profiles (user_id, native_language, target_language, display_name, onboarding_completed)
    VALUES (${userId}, ${TEST_USER.nativeLanguage}, ${TEST_USER.targetLanguage}, ${TEST_USER.displayName}, true)
    ON CONFLICT (user_id) DO UPDATE SET
      native_language = EXCLUDED.native_language,
      target_language = EXCLUDED.target_language,
      display_name = EXCLUDED.display_name,
      onboarding_completed = true
  `;
  console.log(`  ✅ Profile ready (onboarding completed)`);

  return userId;
}

async function cleanExistingData(userId: string) {
  console.log(`\n🧹 Cleaning existing data...`);

  // Delete in order to avoid FK constraints
  await db`DELETE FROM boss_round_history WHERE user_id = ${userId}`;
  await db`DELETE FROM bingo_state WHERE user_id = ${userId}`;
  await db`DELETE FROM daily_progress WHERE user_id = ${userId}`;
  await db`DELETE FROM streak_state WHERE user_id = ${userId}`;
  await db`DELETE FROM review_items WHERE session_id IN (SELECT id FROM review_sessions WHERE user_id = ${userId})`;
  await db`DELETE FROM review_sessions WHERE user_id = ${userId}`;
  await db`DELETE FROM sentences WHERE word_id IN (SELECT id FROM words WHERE user_id = ${userId})`;
  await db`DELETE FROM words WHERE user_id = ${userId}`;

  console.log(`  ✅ All existing test data cleaned`);
}

async function seedWords(userId: string) {
  console.log(`\n📝 Seeding ${TEST_WORDS_EN_PT.length} words...`);

  const now = new Date();
  const wordIds: string[] = [];

  for (const word of TEST_WORDS_EN_PT) {
    // Calculate FSRS parameters based on lapse count
    // Higher lapses = lower stability, scheduled sooner
    const stability = Math.max(1, 10 - word.lapseCount * 2);
    const difficulty = Math.min(10, 5 + word.lapseCount * 0.5);
    const retrievability = Math.max(0.3, 0.9 - word.lapseCount * 0.1);

    // Words with lapses are due today, others are due later
    const nextReviewDate = word.lapseCount > 0
      ? now // Due today for testing
      : new Date(now.getTime() + (stability * 24 * 60 * 60 * 1000));

    // Mastery status based on consecutive correct
    const consecutiveCorrect = word.lapseCount === 0 ? 3 : 0;
    const masteryStatus = consecutiveCorrect >= 3 ? 'ready_to_use' : 'learning';

    const [inserted] = await db`
      INSERT INTO words (
        user_id, original_text, translation, source_language, target_language,
        category, stability, difficulty, retrievability, lapse_count, reps,
        next_review_date, last_review_date, mastery_status, consecutive_correct_sessions,
        created_at
      ) VALUES (
        ${userId}, ${word.original}, ${word.translation}, 'pt-PT', 'en',
        ${word.category}, ${stability}, ${difficulty}, ${retrievability}, ${word.lapseCount}, ${word.lapseCount + 1},
        ${nextReviewDate.toISOString()}, ${now.toISOString()}, ${masteryStatus}, ${consecutiveCorrect},
        ${now.toISOString()}
      )
      RETURNING id
    `;

    wordIds.push(inserted.id);
  }

  console.log(`  ✅ Created ${wordIds.length} words with various states`);
  console.log(`     - ${TEST_WORDS_EN_PT.filter(w => w.category === 'work').length} work words`);
  console.log(`     - ${TEST_WORDS_EN_PT.filter(w => w.category === 'social').length} social words`);
  console.log(`     - ${TEST_WORDS_EN_PT.filter(w => w.lapseCount >= 3).length} words with high lapses (Boss Round candidates)`);

  return wordIds;
}

async function seedDailyProgress(userId: string) {
  console.log(`\n📊 Seeding daily progress...`);

  const today = new Date().toISOString().split('T')[0];
  const now = new Date();

  // Create today's progress - goal NOT yet completed (so we can test completion)
  await db`
    INSERT INTO daily_progress (user_id, date, target_reviews, completed_reviews, completed_at)
    VALUES (${userId}, ${today}, 10, 0, NULL)
    ON CONFLICT (user_id, date) DO UPDATE SET
      completed_reviews = 0,
      completed_at = NULL
  `;

  console.log(`  ✅ Daily progress reset (0/10 reviews)`);
}

async function seedStreakState(userId: string) {
  console.log(`\n🔥 Seeding streak state...`);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  await db`
    INSERT INTO streak_state (user_id, current_streak, longest_streak, last_completed_date, streak_freeze_count)
    VALUES (${userId}, 5, 10, ${yesterdayStr}, 1)
    ON CONFLICT (user_id) DO UPDATE SET
      current_streak = 5,
      longest_streak = 10,
      last_completed_date = ${yesterdayStr},
      streak_freeze_count = 1
  `;

  console.log(`  ✅ Streak: 5 days (longest: 10), 1 freeze available`);
}

async function seedBingoState(userId: string) {
  console.log(`\n🎯 Seeding bingo state...`);

  const today = new Date().toISOString().split('T')[0];

  // Default 9 squares
  const squareDefinitions = [
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

  await db`
    INSERT INTO bingo_state (user_id, date, squares_completed, square_definitions, bingo_achieved)
    VALUES (${userId}, ${today}, ${JSON.stringify([])}, ${JSON.stringify(squareDefinitions)}, false)
    ON CONFLICT (user_id, date) DO UPDATE SET
      squares_completed = ${JSON.stringify([])},
      bingo_achieved = false
  `;

  console.log(`  ✅ Bingo board reset (0/9 squares)`);
}

async function seedBossRoundHistory(userId: string) {
  console.log(`\n🏆 Seeding boss round history...`);

  // Create some historical boss round attempts for stats
  const attempts = [
    { score: 2, total: 5, timeUsed: 85, daysAgo: 7 },
    { score: 3, total: 5, timeUsed: 70, daysAgo: 5 },
    { score: 4, total: 5, timeUsed: 60, daysAgo: 3 },
  ];

  for (const attempt of attempts) {
    const date = new Date();
    date.setDate(date.getDate() - attempt.daysAgo);

    await db`
      INSERT INTO boss_round_history (
        user_id, total_words, correct_count, time_limit, time_used,
        accuracy, is_perfect, completed_at
      ) VALUES (
        ${userId}, ${attempt.total}, ${attempt.score}, 90, ${attempt.timeUsed},
        ${Math.round((attempt.score / attempt.total) * 100)}, ${attempt.score === attempt.total},
        ${date.toISOString()}
      )
    `;
  }

  console.log(`  ✅ Created ${attempts.length} historical boss round attempts`);
  console.log(`     - Best score: 4/5`);
}

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  LLYLI Gamification Test Data Seeder');
  console.log('═══════════════════════════════════════════════');

  try {
    const userId = await getOrCreateUser();
    await cleanExistingData(userId);
    await seedWords(userId);
    await seedDailyProgress(userId);
    await seedStreakState(userId);
    await seedBingoState(userId);
    await seedBossRoundHistory(userId);

    console.log('\n═══════════════════════════════════════════════');
    console.log('  Summary');
    console.log('═══════════════════════════════════════════════\n');

    console.log('Test Account Ready:\n');
    console.log(`  Email:    ${TEST_USER.email}`);
    console.log(`  Password: ${TEST_USER.password}`);
    console.log(`  Languages: ${TEST_USER.nativeLanguage} → ${TEST_USER.targetLanguage}`);
    console.log('');
    console.log('Test Data:');
    console.log(`  - ${TEST_WORDS_EN_PT.length} words (work, social, travel, food categories)`);
    console.log(`  - ${TEST_WORDS_EN_PT.filter(w => w.lapseCount >= 3).length} words with high lapses (Boss Round)`);
    console.log(`  - 5-day streak, 1 freeze available`);
    console.log(`  - 0/10 daily progress (ready to test completion)`);
    console.log(`  - Empty bingo board (ready to test all squares)`);
    console.log(`  - 3 historical boss round attempts (stats available)`);
    console.log('');
    console.log('✅ Ready for comprehensive gamification testing!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await db.end();
  }
}

main();
