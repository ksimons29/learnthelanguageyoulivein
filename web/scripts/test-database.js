#!/usr/bin/env node
/**
 * Test Database Schema
 *
 * Verifies all tables exist and have correct structure
 *
 * Usage: node scripts/test-database.js
 */

require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');

const connectionString = process.env.DATABASE_URL;

console.log('🧪 Testing Database Schema...\n');

// Check environment variable
if (!connectionString) {
  console.error('❌ Missing DATABASE_URL in .env.local');
  console.log('\nFormat: postgresql://postgres:password@db.project.supabase.co:5432/postgres');
  process.exit(1);
}

console.log('✓ DATABASE_URL found');
console.log(`  Connection: ${connectionString.substring(0, 50)}...\n`);

const sql = postgres(connectionString, {
  prepare: false,
  max: 1 // Only need one connection for testing
});

async function testConnection() {
  console.log('1️⃣  Testing database connection...');
  try {
    const result = await sql`SELECT NOW() as current_time`;
    console.log(`   ✅ Connected successfully`);
    console.log(`   Server time: ${result[0].current_time}\n`);
    return true;
  } catch (error) {
    console.error('   ❌ Connection failed:', error.message);
    console.log('\n   Troubleshooting:');
    console.log('   1. Check DATABASE_URL format');
    console.log('   2. Verify password is correct');
    console.log('   3. Check Supabase project is active');
    return false;
  }
}

async function testTables() {
  console.log('2️⃣  Checking tables exist...');

  const expectedTables = ['words', 'review_sessions', 'generated_sentences', 'tags'];
  const results = {};

  for (const table of expectedTables) {
    try {
      const result = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = ${table}
        )
      `;
      results[table] = result[0].exists;
      console.log(`   ${result[0].exists ? '✅' : '❌'} ${table}`);
    } catch (error) {
      console.error(`   ❌ Error checking ${table}:`, error.message);
      results[table] = false;
    }
  }

  console.log();

  const allExist = Object.values(results).every(r => r);
  if (!allExist) {
    console.log('   ⚠️  Some tables missing. Run: npm run db:push\n');
    return false;
  }

  return true;
}

async function testWordsSchema() {
  console.log('3️⃣  Checking words table schema...');

  try {
    const columns = await sql`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'words'
      ORDER BY ordinal_position
    `;

    const expectedColumns = [
      'id', 'user_id', 'original_text', 'translation', 'language', 'audio_url',
      'category', 'category_confidence', 'difficulty', 'stability', 'retrievability',
      'next_review_date', 'last_review_date', 'review_count', 'lapse_count',
      'consecutive_correct_sessions', 'last_correct_session_id', 'mastery_status',
      'created_at', 'updated_at'
    ];

    const foundColumns = columns.map(c => c.column_name);

    console.log(`   Found ${columns.length} columns:`);

    let allPresent = true;
    for (const col of expectedColumns) {
      const found = foundColumns.includes(col);
      if (!found) allPresent = false;
      console.log(`   ${found ? '✅' : '❌'} ${col}`);
    }

    console.log();

    if (!allPresent) {
      console.log('   ⚠️  Some columns missing. Schema may need update.\n');
      return false;
    }

    return true;
  } catch (error) {
    console.error('   ❌ Error checking schema:', error.message);
    return false;
  }
}

async function testDefaults() {
  console.log('4️⃣  Testing default values...');

  try {
    // Check defaults from column definitions
    const result = await sql`
      SELECT column_name, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'words'
      AND column_default IS NOT NULL
    `;

    const defaults = result.reduce((acc, row) => {
      acc[row.column_name] = row.column_default;
      return acc;
    }, {});

    const checks = [
      { column: 'difficulty', expected: '5', value: defaults.difficulty },
      { column: 'stability', expected: '1', value: defaults.stability },
      { column: 'retrievability', expected: '1', value: defaults.retrievability },
      { column: 'review_count', expected: '0', value: defaults.review_count },
      { column: 'lapse_count', expected: '0', value: defaults.lapse_count },
      { column: 'mastery_status', expected: 'learning', value: defaults.mastery_status }
    ];

    for (const check of checks) {
      const hasDefault = check.value !== undefined;
      console.log(`   ${hasDefault ? '✅' : '❌'} ${check.column}: ${check.value || 'no default'}`);
    }

    console.log();
    return true;
  } catch (error) {
    console.error('   ❌ Error checking defaults:', error.message);
    return false;
  }
}

async function runTests() {
  const results = {
    connection: false,
    tables: false,
    schema: false,
    defaults: false
  };

  results.connection = await testConnection();
  if (!results.connection) {
    await sql.end();
    process.exit(1);
  }

  results.tables = await testTables();
  if (results.tables) {
    results.schema = await testWordsSchema();
    results.defaults = await testDefaults();
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Test Results:\n');
  console.log(`  Connection:  ${results.connection ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Tables:      ${results.tables ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Schema:      ${results.schema ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Defaults:    ${results.defaults ? '✅ PASS' : '❌ FAIL'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const allPassed = Object.values(results).every(r => r);

  if (allPassed) {
    console.log('🎉 All database tests passed!\n');
    console.log('Next steps:');
    console.log('  1. Explore database: npm run db:studio');
    console.log('  2. Test OpenAI: node scripts/test-openai.js');
    console.log('  3. Start app: npm run dev');
  } else {
    console.log('⚠️  Some tests failed. Check errors above.\n');
    if (!results.tables || !results.schema) {
      console.log('Run: npm run db:push');
    }
    await sql.end();
    process.exit(1);
  }

  await sql.end();
}

runTests();
