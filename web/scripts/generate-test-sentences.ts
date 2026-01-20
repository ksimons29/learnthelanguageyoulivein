/**
 * Script to generate sentences for test user
 * Run with: npx tsx scripts/generate-test-sentences.ts
 */
import 'dotenv/config';

async function generateSentences() {
  // This needs to be run through the API with proper auth
  // For testing, you can:
  // 1. Sign in as test user in browser
  // 2. Open browser console
  // 3. Run this fetch command:
  
  console.log(`
To generate sentences for test user:

1. Go to https://llyli.vercel.app
2. Sign in with test-en-pt@llyli.test / TestPassword123!
3. Open browser console (F12 or Cmd+Option+I)
4. Paste and run:

fetch('/api/sentences/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ maxSentences: 10 })
}).then(r => r.json()).then(console.log)

5. You should see: { data: { sentencesGenerated: X, ... } }
6. Now go to Review page - sentence mode should appear!
`);
}

generateSentences();
