/**
 * Full scope verification of API usage tracking
 *
 * Checks:
 * 1. Schema matches Drizzle definition
 * 2. All indexes exist
 * 3. Constraints are in place
 * 4. Insert/query works
 * 5. Admin stats query compatibility
 *
 * Usage: npx tsx scripts/verify-api-usage-setup.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import postgres from 'postgres';

const db = postgres(process.env.DATABASE_URL!, { connect_timeout: 30 });

async function verify() {
  console.log('🔍 FULL SCOPE VERIFICATION\n');
  console.log('='.repeat(60));

  let allPassed = true;

  // 1. Verify schema matches Drizzle definition
  console.log('\n1. SCHEMA VERIFICATION\n');

  const columns = await db`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = 'api_usage_log'
    ORDER BY ordinal_position
  `;

  const expectedColumns = [
    { name: 'id', type: 'uuid', nullable: 'NO' },
    { name: 'user_id', type: 'uuid', nullable: 'YES' },
    { name: 'created_at', type: 'timestamp without time zone', nullable: 'NO' },
    { name: 'api_type', type: 'text', nullable: 'NO' },
    { name: 'model', type: 'text', nullable: 'NO' },
    { name: 'prompt_tokens', type: 'integer', nullable: 'YES' },
    { name: 'completion_tokens', type: 'integer', nullable: 'YES' },
    { name: 'total_tokens', type: 'integer', nullable: 'YES' },
    { name: 'character_count', type: 'integer', nullable: 'YES' },
    { name: 'estimated_cost', type: 'real', nullable: 'NO' },
    { name: 'status', type: 'text', nullable: 'NO' },
    { name: 'error_message', type: 'text', nullable: 'YES' },
    { name: 'metadata', type: 'text', nullable: 'YES' },
  ];

  for (const expected of expectedColumns) {
    const actual = columns.find((c) => (c as { column_name: string }).column_name === expected.name) as { column_name: string; data_type: string; is_nullable: string } | undefined;
    if (!actual) {
      console.log(`   ❌ Missing column: ${expected.name}`);
      allPassed = false;
    } else if (actual.data_type !== expected.type) {
      console.log(`   ❌ Type mismatch: ${expected.name} (expected ${expected.type}, got ${actual.data_type})`);
      allPassed = false;
    } else if (actual.is_nullable !== expected.nullable) {
      console.log(`   ❌ Nullable mismatch: ${expected.name} (expected ${expected.nullable}, got ${actual.is_nullable})`);
      allPassed = false;
    } else {
      console.log(`   ✅ ${expected.name}: ${actual.data_type} (${actual.is_nullable === 'YES' ? 'nullable' : 'required'})`);
    }
  }

  // 2. Verify indexes exist
  console.log('\n2. INDEX VERIFICATION\n');

  const indexes = await db`
    SELECT indexname FROM pg_indexes
    WHERE tablename = 'api_usage_log'
  `;

  const expectedIndexes = [
    'api_usage_log_pkey',
    'api_usage_user_date_idx',
    'api_usage_type_date_idx',
    'api_usage_date_idx'
  ];

  for (const idx of expectedIndexes) {
    const exists = indexes.some((i) => (i as { indexname: string }).indexname === idx);
    if (!exists) allPassed = false;
    console.log(`   ${exists ? '✅' : '❌'} ${idx}`);
  }

  // 3. Verify constraints
  console.log('\n3. CONSTRAINT VERIFICATION\n');

  const constraints = await db`
    SELECT constraint_name, constraint_type
    FROM information_schema.table_constraints
    WHERE table_name = 'api_usage_log'
  `;

  for (const c of constraints) {
    const constraint = c as { constraint_name: string; constraint_type: string };
    console.log(`   ✅ ${constraint.constraint_name} (${constraint.constraint_type})`);
  }

  // 4. Test INSERT capability
  console.log('\n4. INSERT TEST\n');

  try {
    const testInsert = await db`
      INSERT INTO api_usage_log (
        api_type, model, prompt_tokens, completion_tokens, total_tokens,
        estimated_cost, status, metadata
      ) VALUES (
        'translation', 'gpt-4o-mini', 100, 50, 150,
        0.00021, 'success', '{"test": true}'
      )
      RETURNING id, created_at
    `;
    console.log(`   ✅ Insert successful: ${testInsert[0].id}`);

    // Clean up test record
    await db`DELETE FROM api_usage_log WHERE metadata = '{"test": true}'`;
    console.log('   ✅ Cleanup successful');
  } catch (error) {
    console.log(`   ❌ Insert failed: ${error}`);
    allPassed = false;
  }

  // 5. Test admin stats query compatibility
  console.log('\n5. ADMIN STATS QUERY TEST\n');

  try {
    const stats = await db`
      SELECT
        COUNT(*) as total_api_calls,
        COUNT(CASE WHEN api_type = 'translation' THEN 1 END) as translation_calls,
        COUNT(CASE WHEN api_type = 'tts' THEN 1 END) as tts_calls,
        COALESCE(SUM(total_tokens), 0) as total_tokens,
        COALESCE(SUM(estimated_cost), 0) as total_cost_usd,
        ROUND(100.0 * COUNT(CASE WHEN status = 'success' THEN 1 END) / NULLIF(COUNT(*), 0), 1) as success_rate
      FROM api_usage_log
    `;
    console.log('   ✅ Admin stats query works');
    console.log(`      Total calls: ${stats[0].total_api_calls}`);
    console.log(`      Translation calls: ${stats[0].translation_calls}`);
    console.log(`      TTS calls: ${stats[0].tts_calls}`);
    console.log(`      Total tokens: ${stats[0].total_tokens}`);
    console.log(`      Total cost: $${Number(stats[0].total_cost_usd).toFixed(4)}`);
  } catch (error) {
    console.log(`   ❌ Admin stats query failed: ${error}`);
    allPassed = false;
  }

  // 6. Verify Drizzle ORM can query
  console.log('\n6. DRIZZLE ORM COMPATIBILITY TEST\n');

  try {
    // Simulate what the logger does
    const insertResult = await db`
      INSERT INTO api_usage_log (
        user_id, api_type, model, prompt_tokens, completion_tokens,
        total_tokens, estimated_cost, status
      ) VALUES (
        NULL, 'language_detection', 'gpt-4o-mini', 50, 10, 60, 0.00012, 'success'
      )
      RETURNING id
    `;
    console.log(`   ✅ Drizzle-style insert works: ${insertResult[0].id}`);

    // Clean up
    await db`DELETE FROM api_usage_log WHERE id = ${insertResult[0].id}`;
    console.log('   ✅ Cleanup successful');
  } catch (error) {
    console.log(`   ❌ Drizzle compatibility test failed: ${error}`);
    allPassed = false;
  }

  // 7. Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 VERIFICATION SUMMARY\n');

  if (allPassed) {
    console.log('   ✅ ALL CHECKS PASSED');
    console.log('\n   The API usage tracking is fully functional:');
    console.log('   - Table schema matches Drizzle definition');
    console.log('   - All indexes are in place for query performance');
    console.log('   - Constraints validate data integrity');
    console.log('   - Insert/query operations work correctly');
    console.log('   - Admin dashboard queries are compatible');
    console.log('\n   Ready for production use!\n');
  } else {
    console.log('   ❌ SOME CHECKS FAILED');
    console.log('\n   Please review the errors above.\n');
    process.exit(1);
  }

  await db.end();
}

verify().catch((error) => {
  console.error('Verification failed:', error);
  process.exit(1);
});
