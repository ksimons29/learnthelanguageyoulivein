/**
 * One-time migration script to create api_usage_log table
 *
 * This script safely creates the api_usage_log table for tracking
 * OpenAI API usage (translation, TTS, sentence generation).
 *
 * Features:
 * - Uses IF NOT EXISTS so it's safe to run multiple times
 * - Creates all indexes for efficient queries
 * - Validates environment before running
 *
 * Usage: npx tsx scripts/create-api-usage-table.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.error('   Make sure .env.local contains DATABASE_URL');
  process.exit(1);
}

const db = postgres(databaseUrl, {
  // Connection settings for reliability
  connect_timeout: 30,
  idle_timeout: 20,
  max_lifetime: 60 * 30,
});

async function main() {
  console.log('🔄 Creating api_usage_log table...\n');

  try {
    // Step 1: Check if table already exists
    const existingTable = await db`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'api_usage_log'
      ) as exists
    `;

    if (existingTable[0]?.exists) {
      console.log('✅ Table api_usage_log already exists - skipping creation');
    } else {
      // Step 2: Create table
      console.log('   Creating table...');
      await db.unsafe(`
        CREATE TABLE api_usage_log (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          api_type TEXT NOT NULL,
          model TEXT NOT NULL,
          prompt_tokens INTEGER,
          completion_tokens INTEGER,
          total_tokens INTEGER,
          character_count INTEGER,
          estimated_cost REAL NOT NULL,
          status TEXT NOT NULL,
          error_message TEXT,
          metadata TEXT,

          CONSTRAINT api_usage_log_api_type_check
            CHECK (api_type IN ('translation', 'tts', 'sentence_generation', 'language_detection')),
          CONSTRAINT api_usage_log_status_check
            CHECK (status IN ('success', 'failure', 'retry'))
        )
      `);
      console.log('   ✅ Table created');
    }

    // Step 3: Create indexes (IF NOT EXISTS handles duplicates)
    console.log('\n   Creating indexes...');

    await db.unsafe(`
      CREATE INDEX IF NOT EXISTS api_usage_user_date_idx
      ON api_usage_log (user_id, created_at)
    `);
    console.log('   ✅ Index api_usage_user_date_idx ready');

    await db.unsafe(`
      CREATE INDEX IF NOT EXISTS api_usage_type_date_idx
      ON api_usage_log (api_type, created_at)
    `);
    console.log('   ✅ Index api_usage_type_date_idx ready');

    await db.unsafe(`
      CREATE INDEX IF NOT EXISTS api_usage_date_idx
      ON api_usage_log (created_at)
    `);
    console.log('   ✅ Index api_usage_date_idx ready');

    // Step 4: Verify table structure
    console.log('\n   Verifying table structure...');
    const columns = await db`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'api_usage_log'
      ORDER BY ordinal_position
    `;

    console.log('\n   Columns:');
    for (const col of columns) {
      console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'required'})`);
    }

    // Step 5: Count existing rows (if any)
    const count = await db`SELECT COUNT(*)::int as count FROM api_usage_log`;
    console.log(`\n   Current rows: ${count[0]?.count || 0}`);

    console.log('\n✅ Migration complete! API usage tracking is ready.');
    console.log('\n   The admin dashboard will now display:');
    console.log('   - API call counts by type (translation, TTS, sentence generation)');
    console.log('   - Token usage and costs');
    console.log('   - Success/failure rates');
    console.log('   - Per-user cost analysis');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await db.end();
  }
}

main();
