#!/usr/bin/env node
/**
 * Test Supabase Connection
 *
 * Usage: node scripts/test-supabase.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🧪 Testing Supabase Connection...\n');

// Check environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.log('\nRequired variables:');
  console.log('  - NEXT_PUBLIC_SUPABASE_URL');
  console.log('  - NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

console.log('✓ Environment variables found');
console.log(`  URL: ${supabaseUrl}`);
console.log(`  Key: ${supabaseKey.substring(0, 20)}...\n`);

// Create client
const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection
async function testConnection() {
  try {
    console.log('Testing database connection...');
    const { data, error } = await supabase.from('words').select('count');

    if (error) {
      console.error('❌ Connection failed:', error.message);
      console.log('\nTroubleshooting:');
      console.log('  1. Verify Supabase credentials in .env.local');
      console.log('  2. Ensure tables are created: npm run db:push');
      console.log('  3. Check Supabase project status in dashboard');
      process.exit(1);
    }

    console.log('✅ Connection successful!\n');

    // Test auth
    console.log('Testing authentication setup...');
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError) {
      console.log('⚠️  Auth check failed (expected if not signed in):', authError.message);
    } else {
      console.log('✓ Auth SDK working');
      console.log(`  Session: ${session ? 'Active' : 'None (expected)'}\n`);
    }

    console.log('🎉 All Supabase tests passed!\n');
    console.log('Next steps:');
    console.log('  1. Run: npm run db:push (if not done yet)');
    console.log('  2. Create audio bucket in Supabase Storage');
    console.log('  3. Test OpenAI: node scripts/test-openai.js');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

testConnection();
