# LLYI Web MVP - Testing Guide

**Date**: 2026-01-16
**Status**: Phase 1 Testing
**Purpose**: Verify all Phase 1 implementations work correctly before proceeding

---

## Pre-Testing Checklist

### Environment Setup Required

Before testing, you need:

1. **Supabase Project** (5 minutes)
   - [ ] Created at https://app.supabase.com
   - [ ] Project name noted
   - [ ] Database password saved
   - [ ] Region selected

2. **Environment Variables** (5 minutes)
   - [ ] `.env.local` created from `.env.local.example`
   - [ ] All Supabase credentials added
   - [ ] OpenAI API key added
   - [ ] Variables verified with `cat .env.local`

3. **Database Initialized** (2 minutes)
   - [ ] `npm run db:push` executed successfully
   - [ ] Tables created in Supabase

4. **Dependencies Installed** (Already done)
   - [ ] `npm install` completed
   - [ ] No errors in installation

---

## Testing Plan Overview

We'll test in this order (dependencies first):

```
1. Environment & Configuration
   ↓
2. Database Connection
   ↓
3. Supabase Authentication
   ↓
4. OpenAI Integration (Translation & TTS)
   ↓
5. Word Capture API
   ↓
6. Frontend Integration
   ↓
7. Build & Deployment
```

---

## Test 1: Environment Configuration

### Objective
Verify all environment variables are correctly set.

### Steps

1. **Check .env.local exists**:
```bash
ls -la .env.local
```
Expected: File exists (not a directory)

2. **Verify all required variables are set**:
```bash
grep -E "NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_ANON_KEY|SUPABASE_SERVICE_ROLE_KEY|DATABASE_URL|OPENAI_API_KEY" .env.local
```
Expected: 5 lines, all with values (no empty strings)

3. **Check for common issues**:
```bash
# Check for trailing spaces or quotes issues
cat .env.local | grep -E "= |=\"|='"
```
Expected: No results (clean format)

### Success Criteria
- [x] `.env.local` file exists
- [x] All 5 required variables present
- [x] No formatting issues (spaces, quotes)

### Troubleshooting
- **File not found**: Run `cp .env.local.example .env.local`
- **Missing variables**: Check against `.env.local.example`
- **Format issues**: Ensure format is `KEY=value` (no spaces around =)

---

## Test 2: Database Connection

### Objective
Verify Drizzle can connect to Supabase PostgreSQL.

### Steps

1. **Test database connection**:
```bash
npm run db:studio
```
Expected: Drizzle Studio opens at http://localhost:4983
Navigate to http://localhost:4983 and verify:
- [ ] Connection successful
- [ ] Tables visible (words, review_sessions, generated_sentences, tags)

2. **Verify schema structure**:
In Drizzle Studio, click on `words` table and verify columns:
- [ ] id (uuid)
- [ ] user_id (uuid)
- [ ] original_text (text)
- [ ] translation (text)
- [ ] language (text)
- [ ] audio_url (text, nullable)
- [ ] category (text)
- [ ] category_confidence (real)
- [ ] difficulty (real, default 5.0)
- [ ] stability (real, default 1.0)
- [ ] retrievability (real, default 1.0)
- [ ] next_review_date (timestamp)
- [ ] last_review_date (timestamp, nullable)
- [ ] review_count (integer, default 0)
- [ ] lapse_count (integer, default 0)
- [ ] consecutive_correct_sessions (integer, default 0)
- [ ] last_correct_session_id (uuid, nullable)
- [ ] mastery_status (text, default 'learning')
- [ ] created_at (timestamp)
- [ ] updated_at (timestamp)

3. **Check indexes**:
Verify indexes on:
- [ ] user_id (for querying user's words)
- [ ] next_review_date (for due words query)
- [ ] category (for filtering)

### Success Criteria
- [x] Drizzle Studio launches successfully
- [x] All 4 tables present (words, review_sessions, generated_sentences, tags)
- [x] Words table has 20+ columns with correct types
- [x] Default values set correctly (difficulty=5.0, stability=1.0, etc.)

### Troubleshooting
- **Connection error**: Check DATABASE_URL format (should be `postgresql://...`)
- **Tables not found**: Run `npm run db:push` to create schema
- **Column mismatch**: Check if schema was modified; run `npm run db:push` again

---

## Test 3: Supabase Authentication

### Objective
Verify Supabase Auth is configured correctly.

### Steps

1. **Test Supabase connection from server**:
Create test file `web/test-supabase.js`:
```javascript
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Testing Supabase connection...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'MISSING')

const supabase = createClient(supabaseUrl, supabaseKey)

supabase.from('words').select('count').then(({ data, error }) => {
  if (error) {
    console.error('❌ Connection failed:', error.message)
  } else {
    console.log('✅ Connection successful!')
  }
})
```

Run:
```bash
node -r dotenv/config web/test-supabase.js dotenv_config_path=web/.env.local
```

Expected: "✅ Connection successful!"

2. **Verify auth configuration in Supabase Dashboard**:
- Go to Authentication → Settings in Supabase
- [ ] Email Auth enabled
- [ ] Confirm email setting noted (for testing, can disable)
- [ ] Site URL set to http://localhost:3000

3. **Check middleware configuration**:
```bash
cat web/middleware.ts | grep -A5 "protectedPaths"
```
Expected: Shows /capture, /review, /notebook, /progress

### Success Criteria
- [x] Supabase connection test passes
- [x] Auth provider configured in Supabase
- [x] Protected routes defined in middleware

### Troubleshooting
- **Connection failed**: Verify SUPABASE_URL and ANON_KEY are correct
- **Invalid API key**: Check key copied from Supabase dashboard (Settings → API)
- **CORS errors**: Add http://localhost:3000 to Supabase allowed origins

---

## Test 4: OpenAI Integration

### Objective
Verify OpenAI API key works for translation and TTS.

### Steps

1. **Test OpenAI API key validity**:
Create test file `web/test-openai.js`:
```javascript
const OpenAI = require('openai').default

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

console.log('Testing OpenAI API...')
console.log('Key:', process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 10)}...` : 'MISSING')

// Test translation
console.log('\n1. Testing translation (GPT-4o-mini)...')
openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    { role: 'system', content: 'Translate to English. Provide ONLY the translation.' },
    { role: 'user', content: 'Olá, como está?' }
  ]
}).then(response => {
  console.log('✅ Translation:', response.choices[0].message.content)
}).catch(error => {
  console.error('❌ Translation failed:', error.message)
})

// Test TTS
console.log('\n2. Testing TTS audio generation...')
openai.audio.speech.create({
  model: 'tts-1',
  voice: 'nova',
  input: 'Hello world'
}).then(async response => {
  const buffer = Buffer.from(await response.arrayBuffer())
  console.log('✅ TTS succeeded! Audio size:', buffer.length, 'bytes')
}).catch(error => {
  console.error('❌ TTS failed:', error.message)
})
```

Run:
```bash
node -r dotenv/config web/test-openai.js dotenv_config_path=web/.env.local
```

Expected output:
```
1. Testing translation (GPT-4o-mini)...
✅ Translation: Hello, how are you?

2. Testing TTS audio generation...
✅ TTS succeeded! Audio size: ~50000 bytes
```

2. **Check OpenAI account credits**:
- Go to https://platform.openai.com/account/usage
- [ ] Account has available credits
- [ ] Usage limits not exceeded

### Success Criteria
- [x] Translation API works (GPT-4o-mini responds)
- [x] TTS API works (generates audio buffer)
- [x] OpenAI account has credits

### Troubleshooting
- **Invalid API key**: Check key at https://platform.openai.com/api-keys
- **No credits**: Add payment method at https://platform.openai.com/account/billing
- **Rate limit**: Wait 60 seconds and try again

---

## Test 5: Word Capture API

### Objective
Verify POST /api/words endpoint works end-to-end.

### Steps

1. **Start development server**:
```bash
npm run dev
```
Expected: Server starts on http://localhost:3000

2. **Create test user in Supabase** (for API authentication):
   - Go to Supabase → Authentication → Users
   - Click "Add user"
   - Email: `test@example.com`
   - Password: `test123456`
   - [ ] User created successfully

3. **Get user session token**:
   - In browser, go to http://localhost:3000
   - Open DevTools → Console
   - Run:
   ```javascript
   // This would normally happen via sign-in page (to be built)
   // For now, we'll test the API directly with curl
   ```

4. **Test word capture with curl** (requires manual auth token):

For now, let's test the core logic without auth by temporarily modifying the API:

**Alternative: Test via Supabase SQL**:
```sql
-- In Supabase SQL Editor, insert test word directly
INSERT INTO words (
  user_id,
  original_text,
  translation,
  language,
  category,
  category_confidence,
  difficulty,
  stability,
  retrievability,
  next_review_date,
  created_at,
  updated_at
) VALUES (
  'test-user-id',
  'Como posso ajudar?',
  'How can I help?',
  'target',
  'social',
  0.8,
  5.0,
  1.0,
  1.0,
  NOW(),
  NOW(),
  NOW()
);

-- Verify insertion
SELECT * FROM words WHERE original_text = 'Como posso ajudar?';
```

Expected: 1 row returned with all fields populated

5. **Test via Drizzle Studio**:
   - Go to http://localhost:4983
   - Click "words" table
   - [ ] See the test word inserted
   - [ ] Verify FSRS initial values (difficulty=5.0, stability=1.0)

### Success Criteria
- [x] Server starts without errors
- [x] Database can be written to directly
- [x] Words table accepts test data
- [x] FSRS fields have correct defaults

### Note
Full API testing with authentication requires sign-in page (next step). For now, we've verified:
- Database writes work
- Schema is correct
- Defaults are applied

---

## Test 6: Audio Storage (Supabase Storage)

### Objective
Verify Supabase Storage can store audio files.

### Steps

1. **Create audio bucket in Supabase**:
   - Go to Supabase → Storage
   - Click "New bucket"
   - Name: `audio`
   - Public bucket: ✅ Yes
   - File size limit: 5MB
   - Click "Create bucket"
   - [ ] Bucket created successfully

2. **Test audio upload manually**:
   - In Supabase Storage → audio bucket
   - Click "Upload file"
   - Upload any small audio file (e.g., test.mp3)
   - [ ] Upload succeeds
   - Click on file → Copy URL
   - [ ] URL accessible in browser

3. **Test audio upload via code** (when auth is ready):
Create `web/test-audio-upload.js`:
```javascript
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for testing
)

// Create a dummy audio buffer
const dummyAudio = Buffer.from('fake audio data')

console.log('Testing audio upload...')

supabase.storage
  .from('audio')
  .upload('test-user/test-word.mp3', dummyAudio, {
    contentType: 'audio/mpeg',
    upsert: true
  })
  .then(({ data, error }) => {
    if (error) {
      console.error('❌ Upload failed:', error.message)
    } else {
      console.log('✅ Upload successful:', data.path)

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('audio')
        .getPublicUrl('test-user/test-word.mp3')

      console.log('Public URL:', urlData.publicUrl)
    }
  })
```

Run:
```bash
node -r dotenv/config web/test-audio-upload.js dotenv_config_path=web/.env.local
```

Expected:
```
✅ Upload successful: test-user/test-word.mp3
Public URL: https://[project].supabase.co/storage/v1/object/public/audio/test-user/test-word.mp3
```

### Success Criteria
- [x] Audio bucket created in Supabase
- [x] Manual upload works
- [x] Programmatic upload works (via service role key)
- [x] Public URL accessible

### Troubleshooting
- **Bucket creation fails**: Check Supabase project status
- **Upload fails**: Verify SUPABASE_SERVICE_ROLE_KEY is correct
- **URL not accessible**: Ensure bucket is public

---

## Test 7: Frontend Integration

### Objective
Verify capture form connects to backend (when ready).

### Steps

1. **Start dev server** (if not already running):
```bash
npm run dev
```

2. **Navigate to capture page**:
```bash
open http://localhost:3000/capture
```

3. **Inspect capture form**:
- [ ] Page loads without errors
- [ ] Form displays correctly
- [ ] Input field accepts text
- [ ] Save button present

4. **Check browser console for errors**:
- Open DevTools (F12)
- Go to Console tab
- [ ] No errors displayed
- [ ] No warnings about missing dependencies

5. **Test form submission (will fail without auth)**:
- Type "Olá, como está?" in the input
- Click "Save to Notebook"
- Expected: Error about authentication (this is correct!)
- [ ] Error handled gracefully
- [ ] No crash or white screen

### Success Criteria
- [x] Capture page loads
- [x] Form renders correctly
- [x] No console errors
- [x] Form submission fails gracefully (expected without auth)

---

## Test 8: Build & Deployment Readiness

### Objective
Verify project builds successfully for production.

### Steps

1. **Run production build**:
```bash
npm run build
```

Expected output:
```
✓ Compiled successfully
✓ Running TypeScript
✓ Collecting page data using 7 workers
✓ Generating static pages using 7 workers (10/10)
✓ Finalizing page optimization

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/words
├ ƒ /api/words/[id]
├ ○ /capture
├ ○ /notebook
├ ○ /progress
├ ○ /review
└ ○ /review/complete
```

2. **Verify build output**:
```bash
ls -la .next/
```
Expected: `.next/` directory exists with server/, static/, etc.

3. **Test production build locally**:
```bash
npm run start
```
Navigate to http://localhost:3000
- [ ] App loads
- [ ] No errors in console

4. **Check bundle size**:
```bash
npm run build 2>&1 | grep -A 20 "Route (app)"
```
Review sizes - all should be reasonable (<500KB for pages)

### Success Criteria
- [x] Build completes without errors
- [x] TypeScript compilation passes
- [x] All pages render in production mode
- [x] Bundle sizes reasonable

### Troubleshooting
- **Build fails**: Check error message, verify all imports correct
- **Type errors**: Run `npm run lint` to find issues
- **Large bundles**: Review dependencies, consider code splitting

---

## Test 9: End-to-End Manual Test Plan

### Once Auth is Implemented

This is the full flow to test after authentication pages are built:

1. **Sign Up**:
   - Go to /auth/sign-up
   - Create account: test@example.com / test123456
   - [ ] Account created
   - [ ] Redirected to home

2. **Capture Word**:
   - Click "Capture" button or go to /capture
   - Enter: "Como posso ajudar?"
   - Click "Save to Notebook"
   - Wait for processing (~5-10 seconds)
   - [ ] Success message shown
   - [ ] Redirected to home

3. **Verify Word in Database**:
   - Open Drizzle Studio: `npm run db:studio`
   - Go to words table
   - [ ] New word present
   - [ ] original_text = "Como posso ajudar?"
   - [ ] translation = "How can I help?" (or similar)
   - [ ] category assigned (likely "social" or "work")
   - [ ] audio_url present (Supabase Storage URL)
   - [ ] FSRS fields populated (difficulty=5.0, stability=1.0)

4. **Test Audio Playback**:
   - Copy audio_url from database
   - Paste URL in browser
   - [ ] Audio file downloads/plays
   - [ ] Sound quality good
   - [ ] Pronunciation clear

5. **Test Word List**:
   - Go to /notebook
   - [ ] Captured word displayed
   - [ ] Translation shown
   - [ ] Category badge present
   - [ ] Audio play button visible

6. **Sign Out & Sign In**:
   - Sign out
   - [ ] Redirected to sign-in
   - Sign in with same credentials
   - [ ] Successfully signed in
   - [ ] Words still present (persistent)

---

## Test Results Summary

Use this checklist to track progress:

### Environment & Config
- [ ] .env.local configured
- [ ] All credentials present
- [ ] No format issues

### Database
- [ ] Connection successful
- [ ] All tables created
- [ ] Schema matches specification
- [ ] Defaults work correctly

### Authentication
- [ ] Supabase connection works
- [ ] Auth provider configured
- [ ] Middleware protects routes

### OpenAI Integration
- [ ] Translation API works
- [ ] TTS API works
- [ ] Account has credits

### API Endpoints
- [ ] POST /api/words exists
- [ ] Database writes work
- [ ] FSRS defaults applied

### Audio Storage
- [ ] Bucket created
- [ ] Upload works
- [ ] Public URLs accessible

### Frontend
- [ ] Capture page loads
- [ ] Form renders
- [ ] No console errors

### Build
- [ ] Production build succeeds
- [ ] TypeScript passes
- [ ] All routes generated

---

## Known Issues / Expected Failures

These are **expected** to fail (not implemented yet):

1. **Authentication Required**:
   - Capture form will error without auth (expected)
   - Protected routes redirect to /auth/sign-in (404 until page built)

2. **Home Page Empty**:
   - Home page shows mock data (not yet connected to API)
   - Audio playback button not functional

3. **No Review Flow**:
   - Review page shows mock data
   - FSRS algorithm not yet integrated

These will be fixed in the next session!

---

## Next Steps After Testing

Once all tests pass:

1. **Create Authentication Pages** (2-3 hours)
   - Build /auth/sign-up
   - Build /auth/sign-in
   - Test full auth flow

2. **Connect Home Page** (1-2 hours)
   - Fetch real words from API
   - Display captured words
   - Add audio playback

3. **Full E2E Test** (30 minutes)
   - Sign up → Capture → Verify → Play audio
   - Confirm entire flow works

Then proceed to Phase 2 (Sentence Generation)!

---

**Testing Status**: Ready to begin
**Estimated Time**: 30-45 minutes for basic tests
**Estimated Time (Full)**: 1-2 hours with all validations
