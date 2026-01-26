#!/usr/bin/env node
/**
 * Apply Unique Constraint for Duplicate Word Prevention
 *
 * Related to Issue #128: Race Condition in Duplicate Word Detection
 *
 * Usage: node scripts/apply-unique-constraint.js
 */

require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');

const connectionString = process.env.DATABASE_URL;

console.log('🔧 Applying Unique Constraint...\n');

if (!connectionString) {
  console.error('❌ Missing DATABASE_URL in .env.local');
  process.exit(1);
}

const sql = postgres(connectionString, {
  prepare: false,
  max: 1
});

async function dropOldIndex() {
  console.log('1️⃣  Dropping old non-unique index (if exists)...\n');

  try {
    await sql`DROP INDEX IF EXISTS words_user_original_text_idx`;
    console.log('   ✅ Old index dropped (or did not exist)\n');
    return true;
  } catch (error) {
    console.error('   ❌ Error dropping old index:', error.message);
    return false;
  }
}

async function createUniqueIndex() {
  console.log('2️⃣  Creating unique index on (user_id, lower(original_text))...\n');

  try {
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS words_user_original_text_unique_idx
      ON words (user_id, lower(original_text))
    `;
    console.log('   ✅ Unique index created successfully!\n');
    return true;
  } catch (error) {
    if (error.message.includes('duplicate key')) {
      console.error('   ❌ Cannot create unique index - duplicates exist!');
      console.log('   Run: node scripts/cleanup-duplicate-words.js first\n');
    } else {
      console.error('   ❌ Error creating unique index:', error.message);
    }
    return false;
  }
}

async function verifyIndex() {
  console.log('3️⃣  Verifying unique index exists...\n');

  try {
    const indexes = await sql`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'words'
      AND indexname = 'words_user_original_text_unique_idx'
    `;

    if (indexes.length > 0) {
      console.log('   ✅ Index verified:');
      console.log(`   ${indexes[0].indexdef}\n`);
      return true;
    } else {
      console.log('   ❌ Index not found\n');
      return false;
    }
  } catch (error) {
    console.error('   ❌ Error verifying index:', error.message);
    return false;
  }
}

async function run() {
  const dropped = await dropOldIndex();
  if (!dropped) {
    await sql.end();
    process.exit(1);
  }

  const created = await createUniqueIndex();
  if (!created) {
    await sql.end();
    process.exit(1);
  }

  const verified = await verifyIndex();

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Result: ${verified ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (verified) {
    console.log('🎉 Race condition fix applied! Run verification:');
    console.log('   node scripts/check-duplicate-words.js\n');
  }

  await sql.end();
}

run();
