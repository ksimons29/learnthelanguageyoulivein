#!/usr/bin/env node
/**
 * Test OpenAI API Integration
 *
 * Tests both translation (GPT-4o-mini) and TTS audio generation
 *
 * Usage: node scripts/test-openai.js
 */

require('dotenv').config({ path: '.env.local' });
const OpenAI = require('openai').default;

const apiKey = process.env.OPENAI_API_KEY;

console.log('🧪 Testing OpenAI API Integration...\n');

// Check environment variable
if (!apiKey) {
  console.error('❌ Missing OPENAI_API_KEY in .env.local');
  console.log('\nGet your API key at: https://platform.openai.com/api-keys');
  process.exit(1);
}

console.log('✓ API key found');
console.log(`  Key: ${apiKey.substring(0, 15)}...\n`);

const openai = new OpenAI({ apiKey });

async function testTranslation() {
  console.log('1️⃣  Testing Translation (GPT-4o-mini)...');

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional translator. Translate to English. Provide ONLY the translation.'
        },
        {
          role: 'user',
          content: 'Olá, como está?'
        }
      ],
      temperature: 0.3
    });

    const translation = response.choices[0].message.content.trim();
    console.log(`   Input: "Olá, como está?"`);
    console.log(`   Output: "${translation}"`);
    console.log('   ✅ Translation successful!\n');

    return true;
  } catch (error) {
    console.error('   ❌ Translation failed:', error.message);
    if (error.status === 401) {
      console.log('\n   Troubleshooting: Invalid API key');
      console.log('   Get a new key at: https://platform.openai.com/api-keys');
    } else if (error.status === 429) {
      console.log('\n   Troubleshooting: Rate limit or no credits');
      console.log('   Check usage: https://platform.openai.com/account/usage');
    }
    return false;
  }
}

async function testCategoryAssignment() {
  console.log('2️⃣  Testing Category Assignment (GPT-4o-mini)...');

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: `Categorize this word/phrase into exactly ONE category from this list:
- food, restaurant, shopping, work, home, transport, health, social, bureaucracy, emergency, weather, time, greetings, other

Word/Phrase: "Como posso ajudar?"

Respond with ONLY the category name in lowercase, nothing else.`
        }
      ],
      temperature: 0.2
    });

    const category = response.choices[0].message.content.trim().toLowerCase();
    console.log(`   Input: "Como posso ajudar?"`);
    console.log(`   Category: "${category}"`);
    console.log('   ✅ Category assignment successful!\n');

    return true;
  } catch (error) {
    console.error('   ❌ Category assignment failed:', error.message);
    return false;
  }
}

async function testTTS() {
  console.log('3️⃣  Testing TTS Audio Generation...');

  try {
    const response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'nova',
      input: 'Olá, como está?',
      response_format: 'mp3',
      speed: 1.0
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    const sizeKB = (buffer.length / 1024).toFixed(2);

    console.log(`   Input: "Olá, como está?"`);
    console.log(`   Voice: nova (Portuguese-optimized)`);
    console.log(`   Output: ${sizeKB} KB MP3 audio`);
    console.log('   ✅ TTS generation successful!\n');

    // Estimate cost
    const charCount = 'Olá, como está?'.length;
    const costPer1M = 15.00;
    const estimatedCost = (charCount / 1_000_000) * costPer1M;
    console.log(`   Cost estimate: $${estimatedCost.toFixed(6)} (${charCount} characters)\n`);

    return true;
  } catch (error) {
    console.error('   ❌ TTS failed:', error.message);
    if (error.status === 401) {
      console.log('\n   Troubleshooting: Invalid API key');
    } else if (error.status === 429) {
      console.log('\n   Troubleshooting: Rate limit or no credits');
      console.log('   Add payment method: https://platform.openai.com/account/billing');
    }
    return false;
  }
}

async function runTests() {
  const results = {
    translation: false,
    category: false,
    tts: false
  };

  results.translation = await testTranslation();
  results.category = await testCategoryAssignment();
  results.tts = await testTTS();

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Test Results:\n');
  console.log(`  Translation:        ${results.translation ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Category Assignment: ${results.category ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  TTS Audio:          ${results.tts ? '✅ PASS' : '❌ FAIL'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const allPassed = Object.values(results).every(r => r);

  if (allPassed) {
    console.log('🎉 All OpenAI tests passed!\n');
    console.log('Next steps:');
    console.log('  1. Create Supabase audio bucket');
    console.log('  2. Test word capture: npm run dev → http://localhost:3000/capture');
    console.log('  3. Check database: npm run db:studio');
  } else {
    console.log('⚠️  Some tests failed. Check errors above.\n');
    console.log('Common issues:');
    console.log('  - Invalid API key: Get new key at https://platform.openai.com/api-keys');
    console.log('  - No credits: Add payment at https://platform.openai.com/account/billing');
    console.log('  - Rate limit: Wait 60 seconds and try again');
    process.exit(1);
  }
}

runTests();
