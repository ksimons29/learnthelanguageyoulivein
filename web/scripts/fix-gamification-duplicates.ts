/**
 * Fix Gamification Duplicates
 *
 * This script fixes the missing unique index on daily_progress table
 * and cleans up duplicate records that were created due to the bug.
 *
 * The bug: Drizzle schema defines uniqueIndex('daily_progress_user_date_idx')
 * but the migration was never applied, allowing duplicate records per user/date.
 *
 * Run: npx tsx scripts/fix-gamification-duplicates.ts
 */

import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { ssl: 'require' });

async function fixGamificationDuplicates() {
  console.log('🔧 Fixing Gamification Duplicates\n');

  // Step 1: Check current state
  console.log('1️⃣  Checking current duplicate counts...');
  const duplicateCounts = await sql`
    SELECT user_id, date, COUNT(*) as cnt,
           MAX(completed_reviews) as max_reviews,
           SUM(completed_reviews) as total_reviews
    FROM daily_progress
    GROUP BY user_id, date
    HAVING COUNT(*) > 1
    ORDER BY cnt DESC
  `;

  console.log(`   Found ${duplicateCounts.length} user/date combinations with duplicates\n`);

  if (duplicateCounts.length === 0) {
    console.log('   No duplicates found. Skipping cleanup.\n');
  } else {
    // Show sample
    console.log('   Sample duplicates:');
    for (const dup of duplicateCounts.slice(0, 5)) {
      console.log(`   - User ${dup.user_id.substring(0, 8)}... on ${dup.date.toISOString().split('T')[0]}: ${dup.cnt} records, max=${dup.max_reviews}, total=${dup.total_reviews}`);
    }
    console.log('');

    // Step 2: Consolidate duplicates
    console.log('2️⃣  Consolidating duplicate records...');

    // Strategy: For each duplicate set, keep the record with highest completed_reviews
    // and SUM all completed_reviews into it, then delete the others
    for (const dup of duplicateCounts) {
      // Get all records for this user/date
      const records = await sql`
        SELECT id, completed_reviews, completed_at
        FROM daily_progress
        WHERE user_id = ${dup.user_id} AND date = ${dup.date}
        ORDER BY completed_reviews DESC, completed_at DESC NULLS LAST
      `;

      // Keep the first one (highest completed_reviews), sum all reviews into it
      const keepId = records[0].id;
      const totalReviews = records.reduce((sum, r) => sum + r.completed_reviews, 0);
      const anyCompleted = records.some(r => r.completed_at !== null);

      // Update the keeper with summed reviews
      await sql`
        UPDATE daily_progress
        SET completed_reviews = ${totalReviews},
            completed_at = ${anyCompleted ? records.find(r => r.completed_at)?.completed_at : null},
            updated_at = NOW()
        WHERE id = ${keepId}
      `;

      // Delete the duplicates
      const deleteIds = records.slice(1).map(r => r.id);
      if (deleteIds.length > 0) {
        await sql`
          DELETE FROM daily_progress
          WHERE id = ANY(${deleteIds})
        `;
      }

      console.log(`   ✓ Consolidated ${records.length} records for ${dup.date.toISOString().split('T')[0]}: ${totalReviews} total reviews`);
    }
    console.log('');
  }

  // Step 3: Check if unique index exists
  console.log('3️⃣  Checking for unique index...');
  const indexes = await sql`
    SELECT indexname FROM pg_indexes
    WHERE tablename = 'daily_progress' AND indexname = 'daily_progress_user_date_idx'
  `;

  if (indexes.length > 0) {
    console.log('   ✓ Unique index already exists\n');
  } else {
    console.log('   ⚠ Unique index missing. Creating...\n');

    // Create the unique index
    await sql`
      CREATE UNIQUE INDEX daily_progress_user_date_idx
      ON daily_progress (user_id, date)
    `;
    console.log('   ✓ Created unique index: daily_progress_user_date_idx\n');
  }

  // Step 4: Do the same for bingo_state
  console.log('4️⃣  Checking bingo_state for duplicates...');
  const bingoDuplicates = await sql`
    SELECT user_id, date, COUNT(*) as cnt
    FROM bingo_state
    GROUP BY user_id, date
    HAVING COUNT(*) > 1
  `;

  if (bingoDuplicates.length > 0) {
    console.log(`   Found ${bingoDuplicates.length} bingo duplicates. Cleaning up...`);

    for (const dup of bingoDuplicates) {
      const records = await sql`
        SELECT id FROM bingo_state
        WHERE user_id = ${dup.user_id} AND date = ${dup.date}
        ORDER BY updated_at DESC
        LIMIT 1
      `;
      const keepId = records[0].id;

      await sql`
        DELETE FROM bingo_state
        WHERE user_id = ${dup.user_id}
        AND date = ${dup.date}
        AND id != ${keepId}
      `;
    }
    console.log('   ✓ Cleaned up bingo duplicates\n');
  } else {
    console.log('   ✓ No bingo duplicates\n');
  }

  // Check/create bingo unique index
  const bingoIndexes = await sql`
    SELECT indexname FROM pg_indexes
    WHERE tablename = 'bingo_state' AND indexname = 'bingo_state_user_date_idx'
  `;

  if (bingoIndexes.length === 0) {
    console.log('   Creating bingo_state unique index...');
    await sql`
      CREATE UNIQUE INDEX bingo_state_user_date_idx
      ON bingo_state (user_id, date)
    `;
    console.log('   ✓ Created bingo_state_user_date_idx\n');
  }

  // Step 5: Verify fix
  console.log('5️⃣  Verifying fix...');
  const remainingDuplicates = await sql`
    SELECT COUNT(*) as cnt FROM (
      SELECT user_id, date FROM daily_progress GROUP BY user_id, date HAVING COUNT(*) > 1
    ) t
  `;

  if (parseInt(remainingDuplicates[0].cnt) === 0) {
    console.log('   ✓ No duplicate daily_progress records remain\n');
  } else {
    console.log(`   ⚠ ${remainingDuplicates[0].cnt} duplicates remain!\n`);
  }

  // Final index verification
  const finalIndexes = await sql`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE tablename IN ('daily_progress', 'bingo_state')
  `;

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Final State - Indexes:');
  for (const idx of finalIndexes) {
    console.log(`  ${idx.indexname}`);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('✅ Gamification fix complete!\n');

  await sql.end();
}

fixGamificationDuplicates().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
