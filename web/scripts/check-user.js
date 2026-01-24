#!/usr/bin/env node
/**
 * Check user data for koossimons91@gmail.com
 */

require('dotenv').config({ path: '.env.pulled' });
const postgres = require('postgres');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Missing DATABASE_URL');
  process.exit(1);
}

const sql = postgres(connectionString, {
  prepare: false,
  max: 1
});

async function checkUser() {
  console.log('🔍 Looking for user: koossimons91@gmail.com\n');

  // Try to query auth.users
  try {
    const authUsers = await sql`
      SELECT id, email, created_at
      FROM auth.users
      WHERE email = 'koossimons91@gmail.com'
    `;

    if (authUsers.length === 0) {
      console.log('User not found in auth.users');
      console.log('\nListing all auth users:');
      const allAuth = await sql`SELECT id, email FROM auth.users`;
      allAuth.forEach(u => console.log(`  - ${u.email} (${u.id})`));
      await sql.end();
      return;
    }

    const authUser = authUsers[0];
    console.log('Auth user found:');
    console.log(`  Auth ID: ${authUser.id}`);
    console.log(`  Email: ${authUser.email}`);
    console.log(`  Created: ${authUser.created_at}\n`);

    // Now find the profile
    const profiles = await sql`
      SELECT *
      FROM user_profiles
      WHERE user_id = ${authUser.id}
    `;

    if (profiles.length === 0) {
      console.log('No user_profile found for this auth user');
      await sql.end();
      return;
    }

    const profile = profiles[0];
    console.log('Profile found:');
    console.log(`  Profile ID: ${profile.id}`);
    console.log(`  Native: ${profile.native_language}`);
    console.log(`  Target: ${profile.target_language}`);
    console.log(`  Onboarding completed: ${profile.onboarding_completed}`);
    console.log();

    // Count words
    const words = await sql`
      SELECT COUNT(*) as count FROM words WHERE user_id = ${profile.id}
    `;
    console.log(`Words: ${words[0].count}`);

    // Sample some words if there are any
    if (parseInt(words[0].count) > 0) {
      const sampleWords = await sql`
        SELECT native_word, target_word, category, mastery_level
        FROM words
        WHERE user_id = ${profile.id}
        ORDER BY created_at DESC
        LIMIT 5
      `;
      console.log('  Sample words:');
      sampleWords.forEach(w => console.log(`    - ${w.native_word} → ${w.target_word} (${w.category}, mastery: ${w.mastery_level})`));
    }

    // Count generated sentences
    const sentences = await sql`
      SELECT COUNT(*) as count FROM generated_sentences WHERE user_id = ${profile.id}
    `;
    console.log(`Generated sentences: ${sentences[0].count}`);

    // Count review sessions
    const sessions = await sql`
      SELECT COUNT(*) as count FROM review_sessions WHERE user_id = ${profile.id}
    `;
    console.log(`Review sessions: ${sessions[0].count}`);

    // Gamification stats
    const streaks = await sql`
      SELECT * FROM streak_state WHERE user_id = ${profile.id}
    `;
    console.log(`Streak state: ${streaks.length > 0 ? `exists (current: ${streaks[0].current_streak})` : 'none'}`);

    const bingo = await sql`
      SELECT * FROM bingo_state WHERE user_id = ${profile.id}
    `;
    console.log(`Bingo state: ${bingo.length > 0 ? 'exists' : 'none'}`);

    const daily = await sql`
      SELECT * FROM daily_progress WHERE user_id = ${profile.id} ORDER BY date DESC LIMIT 1
    `;
    console.log(`Daily progress: ${daily.length > 0 ? `exists (last: ${daily[0].date})` : 'none'}`);

  } catch (error) {
    console.error('Error querying auth.users:', error.message);
  }

  await sql.end();
}

checkUser().catch(console.error);
