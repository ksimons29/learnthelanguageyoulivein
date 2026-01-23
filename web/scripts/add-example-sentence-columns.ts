/**
 * One-time migration script to add example_sentence columns to words table
 *
 * Usage: npx tsx scripts/add-example-sentence-columns.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL!;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

const db = postgres(databaseUrl);

async function main() {
  console.log('🔄 Adding example_sentence columns to words table...');

  try {
    await db.unsafe(`
      ALTER TABLE words
      ADD COLUMN IF NOT EXISTS example_sentence TEXT,
      ADD COLUMN IF NOT EXISTS example_translation TEXT
    `);
    console.log('✅ Columns added successfully');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await db.end();
  }
}

main();
