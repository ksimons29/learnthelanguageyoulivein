import 'dotenv/config';
import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL || '');

const SUPPORTED_DIRECTIONS = [
  { source: 'en', target: 'pt-PT' },
  { source: 'nl', target: 'pt-PT' },
  { source: 'nl', target: 'en' },
  { source: 'en', target: 'sv' },
];

function isSupported(native: string, target: string): boolean {
  return SUPPORTED_DIRECTIONS.some(d => d.source === native && d.target === target);
}

async function testProfileValidation() {
  console.log('\n═══════════════════════════════════════════════');
  console.log('TEST 1: Profile Validation');
  console.log('═══════════════════════════════════════════════');

  const profiles = await client`
    SELECT user_id, display_name, native_language, target_language
    FROM user_profiles
  `;

  let passed = true;
  profiles.forEach(p => {
    const supported = isSupported(p.native_language, p.target_language);
    const status = supported ? '✓ PASS' : '✗ FAIL';
    console.log(`  ${p.display_name || p.user_id.slice(0, 8)}: ${p.native_language}→${p.target_language} ${status}`);
    if (!supported) passed = false;
  });

  console.log(passed ? '\n✓ All profiles use supported directions' : '\n✗ Some profiles have unsupported directions');
  return passed;
}

async function testBackwardsCompatibility() {
  console.log('\n═══════════════════════════════════════════════');
  console.log('TEST 2: Backwards Compatibility');
  console.log('═══════════════════════════════════════════════');

  const result = await client`
    SELECT
      COUNT(*) as total,
      COUNT(CASE WHEN source_lang IS NOT NULL AND source_lang != '' THEN 1 END) as with_source,
      COUNT(CASE WHEN target_lang IS NOT NULL AND target_lang != '' THEN 1 END) as with_target
    FROM words
  `;

  const r = result[0];
  const allHaveLanguages = r.with_source === r.total && r.with_target === r.total;

  console.log(`  Total words: ${r.total}`);
  console.log(`  With source_lang: ${r.with_source} (${Math.round((r.with_source / r.total) * 100)}%)`);
  console.log(`  With target_lang: ${r.with_target} (${Math.round((r.with_target / r.total) * 100)}%)`);
  console.log(allHaveLanguages ? '\n✓ All words have language codes' : '\n✗ Some words missing language codes');

  return allHaveLanguages;
}

async function testWordLanguageDistribution() {
  console.log('\n═══════════════════════════════════════════════');
  console.log('TEST 3: Word Language Distribution');
  console.log('═══════════════════════════════════════════════');

  const result = await client`
    SELECT source_lang, target_lang, COUNT(*) as count
    FROM words
    GROUP BY source_lang, target_lang
    ORDER BY count DESC
  `;

  result.forEach(r => {
    const supported = SUPPORTED_DIRECTIONS.some(
      d => d.source === r.target_lang && d.target === r.source_lang // Reversed for word storage
    ) || r.source_lang === 'en' && r.target_lang === 'pt-PT'; // Default

    const status = supported ? '✓' : '⚠️';
    console.log(`  ${r.source_lang}→${r.target_lang}: ${r.count} words ${status}`);
  });

  return true;
}

async function testRecentWords() {
  console.log('\n═══════════════════════════════════════════════');
  console.log('TEST 4: Recent Words Sample');
  console.log('═══════════════════════════════════════════════');

  const words = await client`
    SELECT original_text, translation, source_lang, target_lang, translation_provider, created_at
    FROM words
    ORDER BY created_at DESC
    LIMIT 5
  `;

  console.log('  Most recent captures:');
  words.forEach(w => {
    console.log(`    "${w.original_text}" → "${w.translation}"`);
    console.log(`      [${w.source_lang}→${w.target_lang}] via ${w.translation_provider || 'legacy'}`);
  });

  return true;
}

async function testSchemaColumns() {
  console.log('\n═══════════════════════════════════════════════');
  console.log('TEST 5: Schema Column Check');
  console.log('═══════════════════════════════════════════════');

  try {
    const result = await client`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'words'
        AND column_name IN ('source_lang', 'target_lang', 'translation_provider')
      ORDER BY column_name
    `;

    if (result.length === 3) {
      console.log('  Required columns exist:');
      result.forEach(c => console.log(`    ${c.column_name}: ${c.data_type} (default: ${c.column_default || 'none'})`));
      console.log('\n✓ Schema has all required columns');
      return true;
    } else {
      console.log(`  ✗ Expected 3 columns, found ${result.length}`);
      return false;
    }
  } catch (error) {
    console.log('  ✗ Error checking schema:', error);
    return false;
  }
}

async function testSupportedDirectionsConfig() {
  console.log('\n═══════════════════════════════════════════════');
  console.log('TEST 6: Supported Directions Config');
  console.log('═══════════════════════════════════════════════');

  console.log('  Configured directions:');
  SUPPORTED_DIRECTIONS.forEach(d => {
    console.log(`    ${d.source} → ${d.target}`);
  });

  // Check that expected directions are present
  const hasEnPtPT = isSupported('en', 'pt-PT');
  const hasNlPtPT = isSupported('nl', 'pt-PT');
  const hasNlEn = isSupported('nl', 'en');
  const hasEnSv = isSupported('en', 'sv');

  console.log('\n  Expected directions:');
  console.log(`    en→pt-PT: ${hasEnPtPT ? '✓' : '✗'}`);
  console.log(`    nl→pt-PT: ${hasNlPtPT ? '✓' : '✗'}`);
  console.log(`    nl→en: ${hasNlEn ? '✓' : '✗'}`);
  console.log(`    en→sv: ${hasEnSv ? '✓' : '✗'}`);

  const allPresent = hasEnPtPT && hasNlPtPT && hasNlEn && hasEnSv;
  console.log(allPresent ? '\n✓ All expected directions configured' : '\n✗ Missing some directions');
  return allPresent;
}

async function main() {
  console.log('╔═══════════════════════════════════════════════╗');
  console.log('║  LLYLI Multi-Language Implementation Tests   ║');
  console.log('╚═══════════════════════════════════════════════╝');

  const results: boolean[] = [];

  try {
    results.push(await testProfileValidation());
    results.push(await testBackwardsCompatibility());
    results.push(await testWordLanguageDistribution());
    results.push(await testRecentWords());
    results.push(await testSchemaColumns());
    results.push(await testSupportedDirectionsConfig());

    console.log('\n═══════════════════════════════════════════════');
    console.log('SUMMARY');
    console.log('═══════════════════════════════════════════════');

    const passed = results.filter(Boolean).length;
    const total = results.length;

    console.log(`  Tests passed: ${passed}/${total}`);

    if (passed === total) {
      console.log('\n✅ ALL TESTS PASSED');
    } else {
      console.log('\n❌ SOME TESTS FAILED');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ TEST ERROR:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
