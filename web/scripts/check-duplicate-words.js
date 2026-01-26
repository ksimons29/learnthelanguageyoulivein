#!/usr/bin/env node
/**
 * Check for Duplicate Words and Verify Unique Constraint
 *
 * Related to Issue #128: Race Condition in Duplicate Word Detection
 *
 * Usage: node scripts/check-duplicate-words.js
 */

require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');

const connectionString = process.env.DATABASE_URL;

console.log('🔍 Checking for Duplicate Words...\n');

if (!connectionString) {
  console.error('❌ Missing DATABASE_URL in .env.local');
  process.exit(1);
}

const sql = postgres(connectionString, {
  prepare: false,
  max: 1
});

async function checkDuplicates() {
  console.log('1️⃣  Checking for existing duplicates...\n');

  try {
    const duplicates = await sql`
      SELECT user_id, lower(original_text) as text_lower, count(*) as count
      FROM words
      GROUP BY user_id, lower(original_text)
      HAVING count(*) > 1
      ORDER BY count DESC
      LIMIT 20
    `;

    if (duplicates.length === 0) {
      console.log('   ✅ No duplicate words found!\n');
      return true;
    } else {
      console.log(`   ⚠️  Found ${duplicates.length} sets of duplicates:\n`);
      for (const dup of duplicates) {
        console.log(`   - "${dup.text_lower}" (user: ${dup.user_id.slice(0, 8)}..., count: ${dup.count})`);
      }
      console.log('\n   To clean up, run:');
      console.log('   WITH duplicates AS (');
      console.log('     SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id, lower(original_text) ORDER BY created_at) as rn');
      console.log('     FROM words');
      console.log('   )');
      console.log('   DELETE FROM words WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);\n');
      return false;
    }
  } catch (error) {
    console.error('   ❌ Error checking duplicates:', error.message);
    return false;
  }
}

async function checkUniqueIndex() {
  console.log('2️⃣  Checking unique index exists...\n');

  try {
    const indexes = await sql`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'words'
      AND indexname LIKE '%unique%'
    `;

    if (indexes.length === 0) {
      console.log('   ⚠️  No unique index found on words table');
      console.log('   Apply the migration: supabase/migrations/20260126_fix_word_duplicate_race_condition.sql\n');
      return false;
    }

    const hasCorrectIndex = indexes.some(idx =>
      idx.indexdef.includes('lower(original_text)') &&
      idx.indexdef.includes('user_id')
    );

    if (hasCorrectIndex) {
      console.log('   ✅ Unique index on (user_id, lower(original_text)) exists!\n');
      for (const idx of indexes) {
        console.log(`   Index: ${idx.indexname}`);
        console.log(`   Definition: ${idx.indexdef}\n`);
      }
      return true;
    } else {
      console.log('   ⚠️  Unique index exists but may not be correctly defined');
      for (const idx of indexes) {
        console.log(`   Found: ${idx.indexdef}`);
      }
      console.log();
      return false;
    }
  } catch (error) {
    console.error('   ❌ Error checking index:', error.message);
    return false;
  }
}

async function getTotalCounts() {
  console.log('3️⃣  Database summary...\n');

  try {
    const counts = await sql`
      SELECT
        (SELECT COUNT(*) FROM words) as total_words,
        (SELECT COUNT(DISTINCT user_id) FROM words) as unique_users
    `;

    console.log(`   Total words: ${counts[0].total_words}`);
    console.log(`   Unique users: ${counts[0].unique_users}\n`);
    return true;
  } catch (error) {
    console.error('   ❌ Error getting counts:', error.message);
    return false;
  }
}

async function run() {
  const noDuplicates = await checkDuplicates();
  const hasIndex = await checkUniqueIndex();
  await getTotalCounts();

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Results:\n');
  console.log(`  No duplicates: ${noDuplicates ? '✅ PASS' : '❌ FAIL (clean up required)'}`);
  console.log(`  Unique index:  ${hasIndex ? '✅ PASS' : '⚠️  MISSING (apply migration)'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (noDuplicates && hasIndex) {
    console.log('🎉 Race condition fix is ready!\n');
  } else if (!noDuplicates) {
    console.log('⚠️  Clean up duplicates before applying the unique constraint.\n');
  } else {
    console.log('⚠️  Apply the migration to add the unique constraint.\n');
  }

  await sql.end();
}

run();
