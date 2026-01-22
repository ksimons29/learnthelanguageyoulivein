import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import postgres from 'postgres';
import { getStarterWords, getTranslation } from '../src/lib/data/starter-vocabulary';

/**
 * Create pre-confirmed test users for E2E testing
 *
 * Usage: npx tsx scripts/create-test-users.ts
 *
 * This script:
 * 1. Creates/updates test user accounts in Supabase Auth
 * 2. Creates/updates user profiles with language preferences
 * 3. Deletes existing words for clean state
 * 4. Injects ALL starter words (including work category) directly
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const databaseUrl = process.env.DATABASE_URL!;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const db = postgres(databaseUrl);

interface TestUser {
  email: string;
  password: string;
  displayName: string;
  nativeLanguage: string;
  targetLanguage: string;
}

const TEST_USERS: TestUser[] = [
  {
    email: 'test-en-pt@llyli.test',
    password: 'TestPassword123!',
    displayName: 'Test EN→PT',
    nativeLanguage: 'en',
    targetLanguage: 'pt-PT',
  },
  {
    email: 'test-en-sv@llyli.test',
    password: 'TestPassword123!',
    displayName: 'Test EN→SV',
    nativeLanguage: 'en',
    targetLanguage: 'sv',
  },
  {
    email: 'test-nl-en@llyli.test',
    password: 'TestPassword123!',
    displayName: 'Test NL→EN',
    nativeLanguage: 'nl',
    targetLanguage: 'en',
  },
];

// Note: These combinations match SUPPORTED_DIRECTIONS in languages.ts:
// - en → pt-PT (English speakers learning Portuguese)
// - en → sv (English speakers learning Swedish)
// - nl → en (Dutch speakers learning English)

async function createTestUser(user: TestUser) {
  console.log(`\n Creating ${user.displayName} (${user.email})...`);

  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find(u => u.email === user.email);

  let userId: string;

  if (existing) {
    console.log(`  ⚠️  User already exists, updating...`);
    userId = existing.id;

    // Update password
    await supabase.auth.admin.updateUserById(userId, {
      password: user.password,
      email_confirm: true,
    });
  } else {
    // Create new user with email pre-confirmed
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        display_name: user.displayName,
      },
    });

    if (error) {
      console.error(`  ❌ Failed to create user: ${error.message}`);
      return null;
    }

    userId = data.user.id;
    console.log(`  ✅ User created: ${userId}`);
  }

  // Create or update user profile
  const existingProfile = await db`
    SELECT user_id FROM user_profiles WHERE user_id = ${userId}
  `;

  if (existingProfile.length > 0) {
    await db`
      UPDATE user_profiles
      SET native_language = ${user.nativeLanguage},
          target_language = ${user.targetLanguage},
          display_name = ${user.displayName},
          onboarding_completed = false
      WHERE user_id = ${userId}
    `;
    console.log(`  ✅ Profile updated`);
  } else {
    await db`
      INSERT INTO user_profiles (user_id, native_language, target_language, display_name, onboarding_completed)
      VALUES (${userId}, ${user.nativeLanguage}, ${user.targetLanguage}, ${user.displayName}, false)
    `;
    console.log(`  ✅ Profile created`);
  }

  // Delete any existing words for clean test state
  const deleted = await db`
    DELETE FROM words WHERE user_id = ${userId}
    RETURNING id
  `;
  if (deleted.length > 0) {
    console.log(`  🧹 Cleaned ${deleted.length} existing words`);
  }

  // Inject starter words directly (including work category)
  const starterCount = await injectStarterWords(userId, user.targetLanguage, user.nativeLanguage);
  console.log(`  📚 Injected ${starterCount} starter words`);

  return { userId, ...user };
}

/**
 * Inject starter words directly into the database
 * This ensures test accounts have all starter words including work category
 */
async function injectStarterWords(
  userId: string,
  targetLanguage: string,
  nativeLanguage: string
): Promise<number> {
  const starterWords = getStarterWords(targetLanguage);
  if (!starterWords) {
    console.log(`  ⚠️  No starter words for ${targetLanguage}`);
    return 0;
  }

  // Insert all starter words
  for (const word of starterWords) {
    const lapseCount = word.initialLapseCount ?? 0;
    // Words with lapses have lower stability (need more review)
    const stability = lapseCount > 0 ? Math.max(1, 10 - lapseCount * 2) : 1.0;
    const difficulty = lapseCount > 0 ? Math.min(10, 5 + lapseCount * 0.5) : 5.0;

    await db`
      INSERT INTO words (
        user_id,
        original_text,
        translation,
        language,
        source_lang,
        target_lang,
        translation_provider,
        category,
        category_confidence,
        difficulty,
        stability,
        retrievability,
        next_review_date,
        review_count,
        lapse_count,
        consecutive_correct_sessions,
        mastery_status
      ) VALUES (
        ${userId},
        ${word.text},
        ${getTranslation(word, nativeLanguage)},
        'target',
        ${targetLanguage},
        ${nativeLanguage},
        'starter-vocabulary',
        ${word.category},
        1.0,
        ${difficulty},
        ${stability},
        1.0,
        ${new Date().toISOString()},
        ${lapseCount > 0 ? lapseCount + 1 : 0},
        ${lapseCount},
        0,
        'learning'
      )
    `;
  }

  return starterWords.length;
}

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  LLYLI Test User Provisioning');
  console.log('═══════════════════════════════════════════════');

  const results = [];

  for (const user of TEST_USERS) {
    const result = await createTestUser(user);
    if (result) results.push(result);
  }

  console.log('\n═══════════════════════════════════════════════');
  console.log('  Summary');
  console.log('═══════════════════════════════════════════════\n');

  console.log('Test Accounts Ready:\n');
  console.log('| Email | Password | Languages |');
  console.log('|-------|----------|-----------|');
  for (const r of results) {
    console.log(`| ${r.email} | ${r.password} | ${r.nativeLanguage}→${r.targetLanguage} |`);
  }

  console.log('\n✅ All test users ready for E2E testing');
  console.log('   Onboarding is set to incomplete so you can test the full flow.\n');

  await db.end();
}

main().catch(console.error);
