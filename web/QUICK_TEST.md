# Quick Testing Guide - LLYI Web MVP

**Time Required**: 15-20 minutes for basic tests, 30-45 minutes for thorough testing

---

## Prerequisites (Do These First)

### 1. Create Supabase Project (5 minutes)

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in:
   - Name: `llyi-web-mvp`
   - Database Password: (create strong password, save it!)
   - Region: (choose closest to you)
4. Wait 2 minutes for project creation
5. Get your credentials:
   - Go to Settings → API
   - Copy: `Project URL` and `anon public` key
   - Go to Settings → Database → Connection string → URI
   - Copy connection string, replace `[YOUR-PASSWORD]` with your password

### 2. Get OpenAI API Key (2 minutes)

1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-`)
4. (Optional) Add $5-10 credits at https://platform.openai.com/account/billing

### 3. Configure Environment (2 minutes)

```bash
cd web
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Database
DATABASE_URL=postgresql://postgres:your_password@db.your-project.supabase.co:5432/postgres

# OpenAI
OPENAI_API_KEY=sk-...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Initialize Database (1 minute)

```bash
npm run db:push
```

Expected output: "✓ Your database is now in sync with your Drizzle schema"

### 5. Create Audio Bucket in Supabase (2 minutes)

1. Go to your Supabase project → Storage
2. Click "New bucket"
3. Name: `audio`
4. Public bucket: ✅ **Yes**
5. File size limit: `5MB`
6. Click "Create bucket"

---

## Quick Test Suite (Run These In Order)

### Test 1: Database Connection (30 seconds)

```bash
node scripts/test-database.js
```

**Expected Output**:
```
✅ Connected successfully
✅ words
✅ review_sessions
✅ generated_sentences
✅ tags
🎉 All database tests passed!
```

**If it fails**:
- Check DATABASE_URL in .env.local
- Verify password is correct
- Run `npm run db:push` again

---

### Test 2: Supabase Authentication (30 seconds)

```bash
node scripts/test-supabase.js
```

**Expected Output**:
```
✅ Connection successful!
✓ Auth SDK working
🎉 All Supabase tests passed!
```

**If it fails**:
- Check NEXT_PUBLIC_SUPABASE_URL and ANON_KEY
- Verify credentials from Supabase dashboard

---

### Test 3: OpenAI Integration (1 minute)

```bash
node scripts/test-openai.js
```

**Expected Output**:
```
1️⃣  Testing Translation (GPT-4o-mini)...
   Input: "Olá, como está?"
   Output: "Hello, how are you?"
   ✅ Translation successful!

2️⃣  Testing Category Assignment (GPT-4o-mini)...
   Category: "social"
   ✅ Category assignment successful!

3️⃣  Testing TTS Audio Generation...
   Output: 45.23 KB MP3 audio
   ✅ TTS generation successful!

🎉 All OpenAI tests passed!
```

**If it fails**:
- Check OPENAI_API_KEY is correct
- Verify you have credits: https://platform.openai.com/account/usage
- Wait 60 seconds if rate limited

---

### Test 4: Build (1 minute)

```bash
npm run build
```

**Expected Output**:
```
✓ Compiled successfully
✓ Running TypeScript
✓ Collecting page data using 7 workers
✓ Generating static pages (10/10)
✓ Finalizing page optimization

Route (app)
├ ○ /
├ ƒ /api/words
├ ƒ /api/words/[id]
...
```

**If it fails**:
- Check error message for specific issue
- Most common: TypeScript errors or missing imports

---

### Test 5: Run Development Server (ongoing)

```bash
npm run dev
```

Open http://localhost:3000

**What to check**:
- [ ] Home page loads (shows mock data - expected)
- [ ] Can navigate to `/capture`
- [ ] Capture form displays
- [ ] No console errors in browser DevTools

---

## Visual Testing Checklist

### Home Page (http://localhost:3000)
- [ ] Moleskine design (cream background, ribbon bookmark)
- [ ] "Capture" and "Review Due" buttons visible
- [ ] "Captured Today" section shows mock phrases
- [ ] "Today's Progress" shows stats (5 captured, 8 reviewed, 7 day streak)
- [ ] Bottom navigation works (Today, Capture, Review, Notebook, Progress)

### Capture Page (http://localhost:3000/capture)
- [ ] Bottom sheet modal slides up
- [ ] "Quick Capture" heading with icon
- [ ] Text input field works
- [ ] "Save to Notebook" button present
- [ ] Clicking save attempts API call (will show auth error - expected)

### Notebook Page (http://localhost:3000/notebook)
- [ ] "Inbox" card visible
- [ ] Category list displays (Work, Social, Shopping, etc.)
- [ ] Search bar at top
- [ ] Mock word counts shown

### Review Page (http://localhost:3000/review)
- [ ] Shows sentence in Portuguese
- [ ] Translation visible after "Reveal"
- [ ] Grading buttons (Hard, Good, Easy) work
- [ ] Progress indicator shows (1/2)

### Progress Page (http://localhost:3000/progress)
- [ ] "Due Today" section with practice button
- [ ] "Struggling" section
- [ ] "Context Readiness" section
- [ ] Stats displayed

---

## Database Verification (Optional)

### View Database Contents

```bash
npm run db:studio
```

Opens http://localhost:4983

**What to check**:
- [ ] All 4 tables visible (words, review_sessions, generated_sentences, tags)
- [ ] Click "words" table - see columns
- [ ] Verify FSRS fields present (difficulty, stability, retrievability)
- [ ] Check defaults (difficulty=5.0, stability=1.0, review_count=0)

---

## Known Expected Issues

These are **NORMAL** at this stage:

### ❌ Authentication Required
- **Issue**: Capture form shows error when submitting
- **Why**: Sign-in page not built yet
- **Status**: Expected, will fix next session

### ❌ Home Page Shows Mock Data
- **Issue**: Captured words not real, audio doesn't play
- **Why**: Frontend not connected to API yet
- **Status**: Expected, will fix next session

### ❌ Protected Routes Redirect
- **Issue**: Going to /capture redirects to /auth/sign-in (404)
- **Why**: Auth pages not built yet
- **Status**: Expected, will fix next session

---

## Success Criteria

You're ready to proceed if:

✅ **Database Tests Pass**:
- Database connects successfully
- All tables exist
- Schema matches specification

✅ **OpenAI Tests Pass**:
- Translation works
- Category assignment works
- TTS generates audio

✅ **Build Succeeds**:
- `npm run build` completes
- No TypeScript errors
- All routes generated

✅ **Dev Server Runs**:
- App loads at http://localhost:3000
- All pages navigate
- No console errors

---

## Quick Troubleshooting

### "DATABASE_URL is not set"
**Fix**: Check `.env.local` file exists in `web/` directory with correct format

### "Missing Supabase credentials"
**Fix**:
1. Go to Supabase → Settings → API
2. Copy URL and anon key
3. Update `.env.local`

### "OpenAI API call failed"
**Fix**:
1. Check API key at https://platform.openai.com/api-keys
2. Verify credits at https://platform.openai.com/account/usage
3. Add payment method if needed

### "Tables not found"
**Fix**: Run `npm run db:push` to create database schema

### Build fails with type errors
**Fix**:
1. Ensure all dependencies installed: `npm install`
2. Check specific error message
3. Clear cache: `rm -rf .next && npm run build`

---

## Test Results Template

Copy this to track your progress:

```
Testing Results - [DATE]

Environment Setup:
[ ] Supabase project created
[ ] .env.local configured
[ ] Database initialized
[ ] Audio bucket created

Automated Tests:
[ ] Database connection: PASS / FAIL
[ ] Supabase auth: PASS / FAIL
[ ] OpenAI integration: PASS / FAIL
[ ] Build: PASS / FAIL

Visual Tests:
[ ] Home page loads
[ ] Capture page works
[ ] Notebook displays
[ ] Review flows
[ ] Progress shows

Database:
[ ] All tables exist
[ ] Schema correct
[ ] Defaults working

Status: READY / NEEDS WORK

Notes:
- [Any issues encountered]
- [Next steps]
```

---

## What's Next After Testing?

Once all tests pass, the next session will:

1. **Build Authentication Pages** (2-3 hours)
   - Create `/auth/sign-up` page
   - Create `/auth/sign-in` page
   - Test sign-up → capture → verify flow

2. **Connect Home Page** (1-2 hours)
   - Fetch real words from API
   - Display captured phrases
   - Add audio playback component

3. **End-to-End Test** (30 minutes)
   - Sign up → Capture word → See in database → Play audio
   - Verify full flow works

Then proceed to **Phase 2: Sentence Generation**!

---

## Need Help?

1. Check `TESTING_GUIDE.md` for detailed troubleshooting
2. Review `README.md` for setup instructions
3. Check `/docs/engineering/` for architecture details
4. Verify environment variables in `.env.local.example`

---

**Testing Time**: 15-20 minutes
**Setup Time**: 10-15 minutes (first time only)
**Total**: ~30 minutes to full verification

🎯 **Goal**: Verify Phase 1 foundation is solid before building on it!
