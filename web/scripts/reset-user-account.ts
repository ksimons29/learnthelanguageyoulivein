import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import postgres from 'postgres';

/**
 * Reset a user account to fresh state
 *
 * Usage: npx tsx scripts/reset-user-account.ts <email>
 *
 * This script:
 * 1. Finds the user by email
 * 2. Deletes ALL their data:
 *    - Words, sentences, review sessions
 *    - Gamification: daily progress, streaks, bingo, boss round history
 * 3. Resets onboarding status so they see the onboarding flow again
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

async function resetUserAccount(email: string) {
  console.log(`\n═══════════════════════════════════════════════`);
  console.log(`  Resetting account: ${email}`);
  console.log(`═══════════════════════════════════════════════\n`);

  // Find user by email
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const user = existingUsers?.users?.find(u => u.email === email);

  if (!user) {
    console.error(`❌ User not found: ${email}`);
    console.log(`\nAvailable users:`);
    existingUsers?.users?.slice(0, 10).forEach(u => {
      console.log(`  - ${u.email}`);
    });
    await db.end();
    process.exit(1);
  }

  const userId = user.id;
  console.log(`✅ Found user: ${userId}`);

  // Delete ALL existing data for clean state
  // Order matters: delete dependent tables first

  // 1. Delete generated sentences (references words via wordIds)
  const deletedSentences = await db`
    DELETE FROM generated_sentences WHERE user_id = ${userId}
    RETURNING id
  `;
  console.log(`  🗑️  Deleted ${deletedSentences.length} sentences`);

  // 2. Delete review sessions
  const deletedSessions = await db`
    DELETE FROM review_sessions WHERE user_id = ${userId}
    RETURNING id
  `;
  console.log(`  🗑️  Deleted ${deletedSessions.length} review sessions`);

  // 3. Delete gamification data
  const deletedDailyProgress = await db`
    DELETE FROM daily_progress WHERE user_id = ${userId}
    RETURNING id
  `;
  console.log(`  🗑️  Deleted ${deletedDailyProgress.length} daily_progress records`);

  const deletedStreakState = await db`
    DELETE FROM streak_state WHERE user_id = ${userId}
    RETURNING id
  `;
  console.log(`  🗑️  Deleted ${deletedStreakState.length} streak records`);

  const deletedBingoState = await db`
    DELETE FROM bingo_state WHERE user_id = ${userId}
    RETURNING id
  `;
  console.log(`  🗑️  Deleted ${deletedBingoState.length} bingo records`);

  const deletedBossRound = await db`
    DELETE FROM boss_round_history WHERE user_id = ${userId}
    RETURNING id
  `;
  console.log(`  🗑️  Deleted ${deletedBossRound.length} boss round records`);

  // 4. Delete words (after sentences that reference them)
  const deletedWords = await db`
    DELETE FROM words WHERE user_id = ${userId}
    RETURNING id
  `;
  console.log(`  🗑️  Deleted ${deletedWords.length} words`);

  // 5. Reset onboarding status
  const updatedProfile = await db`
    UPDATE user_profiles
    SET onboarding_completed = false,
        tour_today_completed = false,
        tour_capture_completed = false,
        tour_review_completed = false,
        tour_notebook_completed = false,
        tour_progress_completed = false
    WHERE user_id = ${userId}
    RETURNING user_id
  `;

  if (updatedProfile.length > 0) {
    console.log(`  ✅ Reset onboarding status`);
  } else {
    console.log(`  ⚠️  No profile found - user will create one on first login`);
  }

  console.log(`\n═══════════════════════════════════════════════`);
  console.log(`  ✅ Account reset complete!`);
  console.log(`═══════════════════════════════════════════════`);
  console.log(`\nNext steps:`);
  console.log(`  1. Check your email for password reset link`);
  console.log(`  2. Set a new password`);
  console.log(`  3. Sign in to see fresh onboarding flow`);
  console.log(`  4. You'll get 12 starter words after onboarding\n`);

  await db.end();
}

// Get email from command line
const email = process.argv[2];

if (!email) {
  console.error('Usage: npx tsx scripts/reset-user-account.ts <email>');
  console.error('Example: npx tsx scripts/reset-user-account.ts koossimons@gmail.com');
  process.exit(1);
}

resetUserAccount(email).catch(console.error);
