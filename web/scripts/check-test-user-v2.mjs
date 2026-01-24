#!/usr/bin/env node
import postgres from 'postgres';
import { config } from 'dotenv';

config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ Missing DATABASE_URL');
  process.exit(1);
}

const sql = postgres(connectionString, { prepare: false, max: 1 });

async function checkTestUser() {
  console.log('🔍 Checking test-en-pt@llyli.test\n');

  // Find the auth user
  const authUsers = await sql`
    SELECT id, email FROM auth.users WHERE email = 'test-en-pt@llyli.test'
  `;

  if (authUsers.length === 0) {
    console.log('❌ User not found in auth.users');
    await sql.end();
    return;
  }

  const authId = authUsers[0].id;
  console.log(`Auth ID: ${authId}`);

  // Find profile
  const profiles = await sql`
    SELECT id, user_id, native_language, target_language FROM user_profiles WHERE user_id = ${authId}
  `;

  if (profiles.length === 0) {
    console.log('❌ No profile found');
    // Check if words exist with auth ID directly
    const wordsWithAuthId = await sql`
      SELECT COUNT(*) as count FROM words WHERE user_id = ${authId}
    `;
    console.log(`Words with auth ID directly: ${wordsWithAuthId[0].count}`);
    await sql.end();
    return;
  }

  const profile = profiles[0];
  console.log(`Profile ID: ${profile.id}`);
  console.log(`Profile user_id: ${profile.user_id}`);
  console.log(`Native: ${profile.native_language}, Target: ${profile.target_language}`);
  console.log();

  // Check words with PROFILE ID
  const wordsWithProfileId = await sql`
    SELECT COUNT(*) as count FROM words WHERE user_id = ${profile.id}
  `;
  console.log(`Words with profile.id: ${wordsWithProfileId[0].count}`);

  // Check words with AUTH ID
  const wordsWithAuthId = await sql`
    SELECT COUNT(*) as count FROM words WHERE user_id = ${authId}
  `;
  console.log(`Words with auth.id: ${wordsWithAuthId[0].count}`);

  // Sample words with auth ID
  if (parseInt(wordsWithAuthId[0].count) > 0) {
    const sampleWords = await sql`
      SELECT original_text, translation, source_lang, target_lang
      FROM words
      WHERE user_id = ${authId}
      ORDER BY created_at DESC
      LIMIT 5
    `;
    console.log('\nSample words (auth ID):');
    for (const w of sampleWords) {
      console.log(`  ${w.original_text} → ${w.translation} (${w.source_lang}→${w.target_lang})`);
    }
  }

  await sql.end();
}

checkTestUser().catch(e => { console.error(e); process.exit(1); });
