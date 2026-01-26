#!/usr/bin/env node
/**
 * Clean up Duplicate Words
 *
 * Related to Issue #128: Race Condition in Duplicate Word Detection
 * Keeps the oldest entry, deletes newer duplicates.
 *
 * Usage: node scripts/cleanup-duplicate-words.js
 */

require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');

const connectionString = process.env.DATABASE_URL;

console.log('🧹 Cleaning up Duplicate Words...\n');

if (!connectionString) {
  console.error('❌ Missing DATABASE_URL in .env.local');
  process.exit(1);
}

const sql = postgres(connectionString, {
  prepare: false,
  max: 1
});

async function previewDuplicates() {
  console.log('1️⃣  Finding duplicates to delete...\n');

  const duplicates = await sql`
    WITH duplicate_rows AS (
      SELECT id, user_id, original_text, created_at,
        ROW_NUMBER() OVER (PARTITION BY user_id, lower(original_text) ORDER BY created_at) as rn
      FROM words
    )
    SELECT id, user_id, original_text, created_at
    FROM duplicate_rows
    WHERE rn > 1
    ORDER BY user_id, original_text
  `;

  if (duplicates.length === 0) {
    console.log('   ✅ No duplicates found!\n');
    return [];
  }

  console.log(`   Found ${duplicates.length} duplicate entries to delete:\n`);
  for (const dup of duplicates) {
    console.log(`   - "${dup.original_text}" (created: ${dup.created_at.toISOString().slice(0, 10)})`);
  }
  console.log();

  return duplicates;
}

async function deleteDuplicates() {
  console.log('2️⃣  Deleting duplicate entries (keeping oldest)...\n');

  const result = await sql`
    WITH duplicates AS (
      SELECT id,
        ROW_NUMBER() OVER (PARTITION BY user_id, lower(original_text) ORDER BY created_at) as rn
      FROM words
    )
    DELETE FROM words
    WHERE id IN (SELECT id FROM duplicates WHERE rn > 1)
    RETURNING id, original_text
  `;

  if (result.length === 0) {
    console.log('   ✅ No duplicates to delete.\n');
  } else {
    console.log(`   ✅ Deleted ${result.length} duplicate entries:\n`);
    for (const deleted of result) {
      console.log(`   - "${deleted.original_text}" (id: ${deleted.id.slice(0, 8)}...)`);
    }
    console.log();
  }

  return result.length;
}

async function verifyNoDuplicates() {
  console.log('3️⃣  Verifying no duplicates remain...\n');

  const remaining = await sql`
    SELECT user_id, lower(original_text) as text_lower, count(*) as count
    FROM words
    GROUP BY user_id, lower(original_text)
    HAVING count(*) > 1
  `;

  if (remaining.length === 0) {
    console.log('   ✅ No duplicates remain!\n');
    return true;
  } else {
    console.log(`   ❌ ${remaining.length} duplicate sets still exist\n`);
    return false;
  }
}

async function run() {
  const duplicates = await previewDuplicates();

  if (duplicates.length === 0) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Database is clean - no duplicates!\n');
    await sql.end();
    return;
  }

  const deleted = await deleteDuplicates();
  const clean = await verifyNoDuplicates();

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Deleted: ${deleted} duplicate entries`);
  console.log(`Clean:   ${clean ? '✅ YES' : '❌ NO'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (clean) {
    console.log('🎉 Ready to apply the unique constraint migration!\n');
    console.log('Run: Apply supabase/migrations/20260126_fix_word_duplicate_race_condition.sql\n');
  }

  await sql.end();
}

run();
