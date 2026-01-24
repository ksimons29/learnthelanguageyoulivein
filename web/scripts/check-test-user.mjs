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
    console.log('❌ User not found');
    await sql.end();
    return;
  }

  const authId = authUsers[0].id;
  console.log(`Auth ID: ${authId}`);

  // Find profile
  const profiles = await sql`
    SELECT id, native_language, target_language FROM user_profiles WHERE user_id = ${authId}
  `;

  if (profiles.length === 0) {
    console.log('❌ No profile found');
    await sql.end();
    return;
  }

  const profile = profiles[0];
  console.log(`Profile ID: ${profile.id}`);
  console.log(`Native: ${profile.native_language}, Target: ${profile.target_language}`);
  console.log();

  // Check words - look for language mismatches
  const words = await sql`
    SELECT id, original_text, translation, source_lang, target_lang, created_at
    FROM words
    WHERE user_id = ${profile.id}
    ORDER BY created_at DESC
    LIMIT 30
  `;

  console.log(`Found ${words.length} recent words:\n`);

  // Group by language pairs
  const byLangPair = {};
  for (const w of words) {
    const pair = `${w.source_lang}→${w.target_lang}`;
    if (!byLangPair[pair]) byLangPair[pair] = [];
    byLangPair[pair].push(w);
  }

  for (const [pair, ws] of Object.entries(byLangPair)) {
    const count = ws.length;
    console.log(`\n=== ${pair} (${count} words) ===`);
    for (const w of ws.slice(0, 5)) {
      console.log(`  ${w.original_text} → ${w.translation}`);
    }
    if (count > 5) console.log(`  ... and ${count - 5} more`);
  }

  // Check if there are nl (Dutch) words
  const dutchWords = await sql`
    SELECT COUNT(*) as count FROM words
    WHERE user_id = ${profile.id}
    AND (source_lang = 'nl' OR target_lang = 'nl')
  `;

  console.log(`\n\n⚠️ Dutch words in this account: ${dutchWords[0].count}`);

  // Check expected language pair words
  const expectedWords = await sql`
    SELECT COUNT(*) as count FROM words
    WHERE user_id = ${profile.id}
    AND ((source_lang = 'en' AND target_lang = 'pt') OR (source_lang = 'pt' AND target_lang = 'en'))
  `;

  console.log(`✓ EN↔PT words in this account: ${expectedWords[0].count}`);

  await sql.end();
}

checkTestUser().catch(e => { console.error(e); process.exit(1); });
