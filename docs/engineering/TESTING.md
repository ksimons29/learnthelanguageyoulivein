# LLYLI End to End Testing Guide

This file is the single source of truth for how to test the full LLYLI application end to end.

Goal

* Catch regressions across auth, onboarding, capture, review, FSRS, notebook, progress, gamification, offline mode, and the iOS wrapper
* Make it easy for Claude Code to run manual QA using Playwright MCP plus quick database checks

Scope

* Web app on local dev, local production build, and Vercel production
* Supabase Auth and database integrity
* OpenAI translation and TTS behavior
* Capacitor iOS wrapper basic sanity

Non goals

* Full automated test suite design
* Performance benchmarking beyond basic sanity

---

## 0. Production-First Testing Philosophy

**CRITICAL: Treat Vercel PRODUCTION as the source of truth, not localhost.**

### Why Production First?

- "Works on my machine" doesn't mean it works for users
- Local dev mode (`npm run dev`) behaves differently than production
- Environment variable differences can cause bugs
- Edge caching and serverless behavior differs

### Testing Priority Order

1. **Production** (`https://llyli.vercel.app`) - Always verify here FIRST
2. **Local Production Build** (`npm run start:prod`) - For debugging prod issues
3. **Local Dev** (`npm run dev`) - Only for active development

### Quick Commands

```bash
# Production-like local testing (USE THIS for bug verification)
cd web && npm run start:prod
# This runs: npm run build && npm run start

# Check what's deployed to production
vercel ls --prod
vercel inspect <deployment-url>

# Check production logs
vercel logs https://llyli.vercel.app --since 30m
```

### Before Claiming "Fixed"

1. Verify the fix on **production** (deployed)
2. NOT just local dev
3. NOT just "build passes"
4. Take a screenshot or record the verification

---

## 1. Environments

You will test in three environments.

A. Local dev

* URL: [http://localhost:3000](http://localhost:3000)
* Command: `cd web && npm run dev`

B. Local production build

* Command:

  * `cd web && npm run build`
  * `cd web && npm start`
* URL: [http://localhost:3000](http://localhost:3000)

C. Production

* URL: [https://llyli.vercel.app](https://llyli.vercel.app)

Rule

* Run the full Smoke Test in all three environments
* Run the Full Functional Suite at least on local production build and production

---

## 2. Preconditions and setup

### 2.1 Required environment variables

Confirm `web/.env.local` exists and includes:

* NEXT_PUBLIC_SUPABASE_URL
* NEXT_PUBLIC_SUPABASE_ANON_KEY
* SUPABASE_SERVICE_KEY
* OPENAI_API_KEY
* DATABASE_URL

Preflight commands

```bash
cd web
node -v
npm -v
cat .env.local | sed -n '1,200p'
```

Expected

* No missing keys for the test you are running
* If OPENAI_API_KEY is missing, translation and TTS should fail gracefully and show a user facing error. You will test this later as a negative case.

### 2.1.1 Build verification (required before E2E tests)

Always run a build before E2E testing to catch TypeScript errors early:

```bash
cd web
npm run build
```

Expected: Build completes without errors.

If build fails, common fixes:
* **TypeScript literal type errors in scripts/**: Add `as const` to literal string values (e.g., `type: 'bullet' as const`)
* **Missing imports**: Check for deleted files or moved exports
* **Type mismatches**: Ensure API response types match component expectations

### 2.2 Test accounts

Use the pre confirmed test users.

* test en to pt

  * Email: [test-en-pt@llyli.test](mailto:test-en-pt@llyli.test)
  * Password: TestPassword123!
* test en to sv

  * Email: [test-en-sv@llyli.test](mailto:test-en-sv@llyli.test)
  * Password: TestPassword123!
* test nl to en

  * Email: [test-nl-en@llyli.test](mailto:test-nl-en@llyli.test)
  * Password: TestPassword123!

Provisioning script

```bash
cd web
npx tsx scripts/create-test-users.ts
```

Warning

* This script resets onboarding and deletes existing words for those users.
* Do not run it against a production Supabase project unless you are 100 percent sure these are isolated test accounts.


## 2.3 Required coverage: 3 user types by target language

You must test the core flows with 3 different user types. The user type is defined by the language they want to learn (their target language).

### User types and accounts

| User type (target language) | Test account                                          | Native language | Target language    | Why this user type exists                               |
| --------------------------- | ----------------------------------------------------- | --------------- | ------------------ | ------------------------------------------------------- |
| Portuguese learner          | [test-en-pt@llyli.test](mailto:test-en-pt@llyli.test) | English         | Portuguese (pt-PT) | Primary path and highest product focus                  |
| Swedish learner             | [test-en-sv@llyli.test](mailto:test-en-sv@llyli.test) | English         | Swedish (sv)       | Second language path and supported direction            |
| English learner             | [test-nl-en@llyli.test](mailto:test-nl-en@llyli.test) | Dutch           | English (en)       | Catches edge cases where English is the target language |

### 2.3 Coverage gate for each user type

For each user type above, run all items below and record PASS or FAIL.

A Auth

1. Sign in
2. Refresh page, still signed in
3. Sign out

B Onboarding

1. Reset onboarding with the provisioning script if needed
2. Complete onboarding for that user type

   * Portuguese learner: target Portuguese, native English
   * Swedish learner: target Swedish, native English
   * English learner: target English, native Dutch

3. Verify starter vocabulary was injected (12 words per language)
   * Check Notebook shows correct journal title:
     - Portuguese learner: "Your Portuguese Journal"
     - Swedish learner: "Your Swedish Journal"
     - English learner: "Your English Journal"
   * Verify Work category exists with 2 phrases (for bingo squares)
   * Verify words show correct language direction (target → native translation)

C Capture in both directions (this is critical)

1. Capture one word in the target language

   * Portuguese learner: capture “obrigado”
   * Swedish learner: capture “tack”
   * English learner: capture “thank you”
2. Capture one word in the native language

   * Portuguese learner: capture “thanks”
   * Swedish learner: capture “thanks”
   * English learner: capture “dankjewel”
3. Confirm both appear in notebook and can become due in review

D Notebook

1. Category grid loads
2. Word appears in correct category
3. Word detail audio plays
4. Delete one word, counts update

E Review

1. Start a review session with due words present
2. Complete 3 reviews
3. Confirm scheduling updates and next review dates move forward

### Why capture both directions is mandatory

Users can enter words in either language. A user learning Portuguese can capture a Portuguese word and get an English translation, which means sourceLang equals pt-PT and targetLang equals en. Your word queries must include both sourceLang and targetLang logic, otherwise words vanish from notebook and review. This is a known failure mode and must be tested for each user type.

### 2.4 Make sure you have due words for review

If review shows all caught up, force due words for the test user:

Supabase SQL

```sql
UPDATE words
SET next_review_date = NOW() - INTERVAL '1 day'
WHERE user_id = 'YOUR-USER-ID';
```

---

## 3. How to run this as a Claude Code manual QA run

Recommended flow for Claude Code

1. Start a fresh session
2. Open this file and run the tests top to bottom
3. Use Playwright MCP for browser steps
4. Use terminal commands only for build and unit tests
5. For each failure, capture:

   * screenshot
   * console error
   * network request details
   * the SQL query result if relevant

Result logging

* Create a test run note in your PR or in PROJECT_LOG with this format:

```text
Test Run: YYYY-MM-DD
Environment: local dev or local prod or production
Tester: name
Result: PASS or FAIL

Failures
1. title
   Repro steps
   Expected
   Actual
   Screenshot path
   Logs

Notes
* anything odd
```

---

## 4. Mandatory checks after every code change

**CRITICAL: Run these after EVERY build, bug fix, or new feature.**

Run these before any manual QA.

### 4.1 Build (ALWAYS RUN)

```bash
cd web && npm run build
```

Expected

* Passes with no TypeScript errors

### 4.2 Unit tests (ALWAYS RUN)

```bash
cd web && npm run test:run
```

Expected

* All tests pass

### 4.2.1 Unit Test Coverage (293 tests)

The test suite covers core business logic. Tests run automatically via GitHub Actions CI on every push to `main` and on pull requests.

| Test File | Tests | What It Covers |
|-----------|-------|----------------|
| `gamification.test.ts` | 44 | Bingo board logic (rows, columns, diagonals), streak calculations, daily progress, consecutive correct tracking, Boss Round word selection, user persona scenarios (Sofia, Ralf, Maria), exercise type normalization |
| `starter-vocabulary.test.ts` | 79 | Language coverage (pt-PT, sv, es, fr, de, nl), work/social category availability for bingo, Boss Round candidates (lapse counts), category distribution, translation coverage, word uniqueness |
| `fsrs.test.ts` | 53 | FSRS-4.5 algorithm implementation, spaced repetition scheduling, mastery progression (3 correct sessions rule), interval calculations, stability/difficulty updates |
| `categories.test.ts` | 26 | Category assignment logic, category validation, category mapping |
| `distractors.test.ts` | 25 | Multiple choice option generation, shuffle algorithm, bidirectional capture handling, focus word selection, null safety for text helpers |
| `shuffle.test.ts` | 19 | Fisher-Yates shuffle, priority band shuffling (overdue > due > new), review queue deduplication |
| `categories-cognitive.test.ts` | 17 | Cognitive load balancing, category mixing in review sessions |
| `exercise-type.test.ts` | 13 | Exercise type determination based on mastery level |
| `sentence-card.test.tsx` | 9 | Sentence card component rendering, fill-in-blank display, answer validation |
| `due-count.test.ts` | 8 | Due word calculation, new card limits, review scheduling |

**Total: 293 tests**

#### Key Test Categories

**Gamification (44 tests)**
- Bingo win detection: 8 winning patterns (3 rows, 3 columns, 2 diagonals)
- Streak logic: increment, reset, freeze behavior
- Daily progress: goal completion, exceeding targets
- Boss Round: selects words by highest lapse count

**FSRS Algorithm (53 tests)**
- Core mastery rule: 3 correct recalls on SEPARATE sessions (>2hrs apart)
- Wrong answer after mastery resets counter to 0
- Same-session reviews don't count toward mastery
- Stability and difficulty calculations match FSRS-4.5 spec

**Starter Vocabulary (79 tests)**
- All 6 languages have 10+ starter words
- Each language has work + social category words (for bingo)
- Boss Round candidates exist (words with lapse counts > 0)
- No duplicate words within a language

### 4.2.2 GitHub Actions CI Pipeline

CI runs automatically on:
- Every push to `main`
- Every pull request targeting `main`

**Pipeline steps:**
1. **Lint** - ESLint checks (warnings allowed, errors block)
2. **Build** - Next.js production build
3. **Test** - Vitest unit tests (293 tests)

**Configuration:** `.github/workflows/ci.yml`

**Required secrets (configured in GitHub):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `OPENAI_API_KEY`

**Monitoring:** https://github.com/ksimons29/learnthelanguageyoulivein/actions

### 4.3 Integration test scripts (run when changing related systems)

```bash
cd web

# Database connection and schema validation
npx tsx scripts/test-database.js

# Supabase auth connection
npx tsx scripts/test-supabase.js

# OpenAI translation and TTS
npx tsx scripts/test-openai.js

# Comprehensive integration test
npx tsx scripts/test-comprehensive.ts
```

Run the relevant script when making changes to:
* Database schema or queries → `test-database.js`
* Authentication flow → `test-supabase.js`
* Translation, categorization, or audio → `test-openai.js`
* Any major feature → `test-comprehensive.ts`

### 4.4 Quick database health check

Supabase SQL

```sql
SELECT 'words' as table_name, COUNT(*) as row_count FROM words
UNION ALL
SELECT 'user_profiles', COUNT(*) FROM user_profiles
UNION ALL
SELECT 'review_sessions', COUNT(*) FROM review_sessions
UNION ALL
SELECT 'generated_sentences', COUNT(*) FROM generated_sentences;
```

Expected

* user_profiles non zero
* words non zero for active test accounts
* no sudden drop to zero unless you intentionally reset test users

### 4.5 Feature-Specific E2E Tests

Detailed E2E test documentation for specific features:

| Feature | Test File | When to Run |
|---------|-----------|-------------|
| Product Tours | `docs/engineering/e2e-tests/product-tours.md` | Changes to tours, Driver.js config, or feedback widget |
| Memory Context | `docs/engineering/e2e-tests/memory-context.md` | Changes to capture, notebook, or memory fields |

Each document contains:
- Step-by-step test scenarios
- Expected results
- Screenshots
- Console log verification
- Known issues

---

## 5. Smoke Test

Run this in local dev, local production build, and production.

### 5.1 Page load sanity

Steps

1. Open home `/`
2. Open sign in `/auth/sign-in`
3. Open capture `/capture` while signed out
4. Open review `/review` while signed out
5. Open notebook `/notebook` while signed out
6. Open progress `/progress` while signed out

Expected

* No blank screens
* Clear signed out state
* No misleading all caught up state for signed out users

  * If this still occurs, log it as a regression or as a known open issue

### 5.2 Auth sanity

Steps

1. Sign in using test en to pt
2. Confirm redirect to home
3. Confirm user is still signed in after refresh
4. Sign out
5. Confirm redirected to sign in

Expected

* Clean sign in and sign out behavior
* Session persists across refresh

### 5.3 Capture sanity

Steps

1. Sign in
2. Go to `/capture`
3. Capture one word: obrigado
4. Confirm translation appears
5. Confirm audio plays

Expected

* Capture completes within a few seconds
* Audio button present and plays

### 5.4 Review sanity

Steps

1. Ensure at least 3 due words exist
2. Go to `/review`
3. Complete 3 review items
4. Finish session

Expected

* Feedback on correctness works
* Rating step works
* Session completes and shows done for today

---

## 6. Full Functional Suite

Run this fully at least on local production build and production.

---

## 6A. Authentication full coverage

### A1 Sign up and email confirmation UI

Two ways to test depending on whether you want real email delivery.

Option 1 UI only plus manual confirm in Supabase
Steps

1. Go to `/auth/sign-up`
2. Create a new user with a unique email you control
3. Confirm you see the check email UI state
4. In Supabase dashboard, manually confirm the user email
5. Return to sign in and sign in successfully

Expected

* If Supabase returns user without session, you show a clear check email UI
* After confirmation, sign in succeeds

Option 2 Full email delivery
Steps

1. Use a dedicated test inbox provider
2. Sign up
3. Open the confirmation link
4. Confirm you land in the correct app state

Expected

* Confirmation link works
* App redirects correctly

### A2 Sign in failures and messaging

Steps

1. Try wrong password
2. Try non existing email
3. Try unconfirmed user if you can reproduce

Expected

* User friendly error messages
* Unconfirmed user shows specific guidance

### A3 Password reset

Steps

1. Go to password reset page if available
2. Request reset
3. Complete reset via email link or via Supabase flow
4. Sign in with new password

Expected

* No dead links
* Reset results in successful sign in

### A4 Protected routes behavior

Steps

1. Sign out
2. Visit `/capture`, `/review`, `/notebook`, `/progress`

Expected

* Either redirect to sign in or show a clear sign in required state
* No leakage of another user data
* No misleading success states while signed out

### A5 Auth redirect for unauthenticated users (CRITICAL)

This test verifies that unauthenticated users cannot access protected pages.

Steps

1. Open a fresh incognito/private browser window (no existing session)
2. Navigate directly to the production URL: `https://llyli.vercel.app/`
3. Wait 2-3 seconds for any client-side redirects

Expected

* URL changes from `/` to `/auth/sign-in`
* Sign-in page displays with "Welcome Back" heading
* No flash of homepage content before redirect

Additional protected route tests

4. Navigate directly to `https://llyli.vercel.app/capture`
5. Navigate directly to `https://llyli.vercel.app/review`
6. Navigate directly to `https://llyli.vercel.app/notebook`
7. Navigate directly to `https://llyli.vercel.app/progress`

Expected for each

* Redirects to `/auth/sign-in`
* No homepage or protected content visible

Verification with curl

```bash
curl -sI "https://llyli.vercel.app/" | grep -E "(HTTP|location|x-vercel)"
```

Expected headers

* `Cache-Control: no-store, must-revalidate` (prevents edge caching)
* Either 302/307 redirect to `/auth/sign-in` OR 200 with client-side redirect

Known implementation details

* Server-side redirect handled by Next.js middleware (`web/src/lib/supabase/middleware.ts`)
* Client-side fallback redirect in `web/src/app/page.tsx` useEffect
* Cache-Control headers prevent Vercel edge from caching protected pages

---

## 6B. Onboarding full coverage

### B1 Fresh onboarding flow

Precondition

* test user has onboarding_completed false

Steps

1. Sign in with test user
2. Confirm redirect to `/onboarding/languages`
3. Select target language
4. Select native language
5. Confirm redirect to `/onboarding/capture`
6. Add at least 3 captures
7. Continue to completion
8. Confirm onboarding_completed true in user_profiles

Expected

* Continue button disabled until minimum captures met
* Completion screen shows success state
* User sees starter words plus captured words if starter injection is enabled

Supabase verification SQL

```sql
SELECT onboarding_completed, target_language, native_language
FROM user_profiles
WHERE user_id = 'YOUR-USER-ID';
```

### B2 Onboarding recovery scenarios

Steps

1. Refresh on each onboarding page
2. Use back button between steps
3. Close tab and reopen after sign in

Expected

* Flow remains consistent
* No loops
* No ability to skip required capture step unless intentionally allowed

### B3 Unsupported language pairs

Steps

1. Open language selection
2. Attempt to select any combination not in supported directions

Expected

* Unsupported options show coming soon messaging
* No ability to proceed into invalid pair

---

## 6C. Capture full coverage

### C1 Capture a word in target language

Example for en to pt user
Steps

1. On `/capture`, enter Portuguese word: aquecimento
2. Save
3. Confirm translation is in English
4. Confirm source_lang is pt-PT and target_lang is en or the expected mapping

Expected

* The app supports capturing in either language
* The word appears in notebook and review for the user

Verification SQL

```sql
SELECT original_text, translation, source_lang, target_lang, audio_url, category
FROM words
WHERE user_id = 'YOUR-USER-ID'
ORDER BY created_at DESC
LIMIT 10;
```

### C2 Capture a word in native language

Steps

1. Enter English word: heating
2. Save
3. Confirm translation is Portuguese

Expected

* Correct direction based on user profile

### C3 Capture a multi word phrase

Steps

1. Enter phrase: preciso de assinar o recibo
2. Save

Expected

* Saved successfully if phrases are allowed
* Category assigned
* Audio generated

If phrases are not supported, expected

* Clear validation message

### C4 Input cleanup and validation

Test each input below:

* leading and trailing spaces
* uppercase
* punctuation
* diacritics
* very long input

Expected

* Clean handling
* Clear error for invalid input
* No crashes

### C5 Duplicate capture

Steps

1. Capture the same original_text twice

Expected

* Either prevents duplicates or handles them consistently
* No broken notebook counts

### C6 Failure modes

Do each failure test once.

OpenAI failure
Steps

1. Temporarily remove OPENAI_API_KEY locally
2. Attempt capture

Expected

* User sees a clear error
* No partial corrupted word rows

Network failure mid capture
Steps

1. Toggle browser offline right after pressing save

Expected

* User sees failure state
* No double insert on retry

---

## 6C-2. Memory Context (Personal Memory Journal)

This feature allows users to add WHERE and WHEN context when capturing phrases, turning vocabulary into personal memories.

### C7 Capture with memory context

Steps

1. Go to `/capture`
2. Enter a phrase: "bom dia"
3. Tap "Add memory context" to expand the accordion
4. Fill in location: "at the bakery"
5. Select 1-2 situation tags (e.g., "Nervous", "Alone")
6. Add a personal note: "My first time ordering alone!"
7. Save

Expected

* Capture completes successfully
* Toast shows "Phrase captured successfully!"
* All context fields are saved to database

Verification SQL

```sql
SELECT original_text, translation, location_hint, time_of_day, situation_tags, personal_note
FROM words
WHERE user_id = 'YOUR-USER-ID'
ORDER BY created_at DESC
LIMIT 5;
```

Expected results

* location_hint contains "at the bakery"
* time_of_day is auto-detected (morning/afternoon/evening/night)
* situation_tags is an array like `["nervous", "alone"]`
* personal_note contains the note text

### C8 Capture without memory context

Steps

1. Go to `/capture`
2. Enter a phrase without expanding context accordion
3. Save

Expected

* Capture works normally
* Context fields are NULL in database
* Fast capture experience preserved

### C9 Memory context display in notebook

Steps

1. Go to `/notebook`
2. Find the word with memory context
3. Check the word card shows context line (e.g., "at the bakery · evening")
4. Tap to open word detail sheet
5. Confirm Memory section appears with:
   * Location and time
   * Situation tags as pills
   * Personal note in italic/handwritten style

Expected

* Context line shows on word cards that have context
* Memory section appears in detail sheet only when context exists
* Margin-note aesthetic with teal left border

### C10 Memory context in review

Steps

1. Go to `/review`
2. Review a word that has memory context
3. Reveal the answer

Expected

* After reveal, memory hint appears: "Remember: at the bakery · evening · Nervous, Alone"
* Hint styled with MapPin icon and teal border

### C11 Memory context bingo square

Steps

1. Check the bingo board before capturing
2. Capture a phrase WITH memory context (at least one field filled)
3. Check the bingo board after capturing

Expected

* "Add memory context" square (center square with 📍) marks complete
* Only triggers when capturing WITH context, not without

Verification SQL

```sql
SELECT squares_completed
FROM bingo_state
WHERE user_id = 'YOUR-USER-ID' AND date = CURRENT_DATE;
```

Expected: `addContext` appears in the completed squares array

### C12 Situation tags limit

Steps

1. Go to `/capture`
2. Expand memory context
3. Try to select more than 3 situation tags

Expected

* Maximum 3 tags can be selected
* Selecting a 4th tag does nothing
* UI provides visual feedback

---

## 6D. Notebook full coverage

### D1 Category grid and counts

Steps

1. Go to `/notebook`
2. Confirm category grid loads
3. Confirm each category shows a word count and due count

Expected

* Counts match database

Verification SQL example

```sql
SELECT category, COUNT(*) as count
FROM words
WHERE user_id = 'YOUR-USER-ID'
GROUP BY category
ORDER BY count DESC;
```

### D2 Category detail and word detail

Steps

1. Open a category
2. Open a word detail
3. Play audio
4. Delete the word

Expected

* Audio plays
* Delete removes word and updates counts

### D3 Language filtering regression test

This is critical because of the prior bug.

Steps

1. For a user learning Portuguese, capture a Portuguese word so source_lang equals pt-PT and target_lang equals en
2. Confirm it appears in notebook and review queues

Expected

* Words are not excluded based only on target_lang equals user target language

### D4 Search within category

Steps

1. Go to `/notebook/social` (or any category with words)
2. Enter search term matching a word's originalText
3. Enter search term matching a word's translation

Expected

* Words matching search appear
* Non-matching words hidden
* Clear search returns all words

### D5 Global notebook search

Steps

1. Go to `/notebook`
2. Search for a word you know exists (e.g., "obrigado" for Portuguese learner)
3. Search for a translation (e.g., "thank")

Expected

* Matching words appear in "Search Results" section
* Categories section hides during search
* Tapping a result navigates to the category page with word highlighted
* Result count shows number found (e.g., "3 found")

### D6 Search no results

Steps

1. Go to `/notebook`
2. Search for "xyznonexistent123"

Expected

* Clear "No words match" message appears
* "Clear search" button visible and functional
* Clicking clear search returns to categories view

---

## 6E. Review and learning full coverage

### E1 Review session starts only when due

Steps

1. Ensure due words exist
2. Go to `/review`

Expected

* Session starts with a due item
* If no due words, all caught up UI appears only when signed in and truly no due items

### E2 Exercise type coverage

You must see at least one of each:

* multiple choice
* fill blank
* type translation

Expected

* Multiple choice options are translations, not original text
* Correct answer shows green, wrong shows red
* After answering, options lock
* Rating step updates scheduling

### E3 Dynamic sentence generation

Steps

1. During review, capture the sentence shown and the words included
2. Complete several items

Expected

* Sentences vary across reviews
* Sentences include 2 to 4 due words if designed that way
* Sentence length stays reasonable and not overwhelming

Negative test

* Force sentence generation to fail by removing OPENAI_API_KEY locally

Expected

* Graceful fallback UI
* No broken session loop

### E4 FSRS updates and mastery rule

Steps

1. Review the same word across three separate sessions with correct answers
2. Confirm it becomes ready to use or the equivalent final state

Verification SQL

```sql
SELECT original_text, mastery_status, review_count, consecutive_correct_sessions,
       stability, difficulty, retrievability, next_review_date, lapse_count
FROM words
WHERE user_id = 'YOUR-USER-ID'
ORDER BY updated_at DESC
LIMIT 20;
```

Expected

* lapse_count increments after Again or after wrong answer depending on design
* next_review_date moves forward based on stability
* After three correct sessions, status becomes ready to use

### E5 Session completion behavior

Steps

1. Finish daily goal of 10 reviews
2. Confirm completion screen
3. Confirm boss round prompt appears

Expected

* Done for today screen shows correct stats
* Boss round prompt appears only after goal completion

---

## 6E-2. FSRS & Due Calculation Verification (CRITICAL)

These tests verify the spaced repetition algorithm shows realistic due counts.

### E6 Due count sanity check

The "Due Today" count must be realistic for healthy learning (not showing 700+ words).

Steps

1. Create a fresh test user
2. Add 50 words via capture or starter words
3. Check Due Today count on notebook page
4. Check Due Today on progress page

Expected

* Due Today shows MAX 15-20 for a fresh account (new card limit)
* NOT showing hundreds of words due
* New cards and review cards should be separated in the calculation

Verification SQL

```sql
-- New cards (never reviewed)
SELECT COUNT(*) as new_cards
FROM words
WHERE user_id = 'YOUR-USER-ID' AND review_count = 0;

-- Review cards due (reviewed before, now due)
SELECT COUNT(*) as review_due
FROM words
WHERE user_id = 'YOUR-USER-ID'
  AND review_count > 0
  AND next_review_date <= NOW();

-- Due Today should be: MIN(new_cards, 15) + review_due
```

### E7 Session word limit

Steps

1. Ensure user has 50+ words due
2. Start review session
3. Complete 25 words

Expected

* Session completes at 25 (or configured limit)
* "Session Complete" page appears
* User can start new session if more due
* Stats on completion page are correct

### E8 Multiple choice language consistency

Steps

1. Sign in as Portuguese learner
2. Capture words in BOTH directions:
   * Portuguese word "folgar" → English translation
   * English word "timeless" → Portuguese translation
3. Start review in sentence mode
4. For "Choose correct meaning" exercise, check all options

Expected

* ALL options in the same language (user's native language)
* NO mixing Portuguese sentences with English words as options
* Correct answer is the meaning of the highlighted word in native language

Failure signature

* Options show mix of "A feira de emprego..." (Portuguese) and "Timeless" (English)

### E9 Session completion triggers

Steps

1. Start review
2. Complete reviews until one of:
   a. Session limit reached (25 words)
   b. Daily goal reached (10 reviews)
   c. All session words reviewed

Expected for each trigger

* Complete page appears
* Stats show correctly
* Can start new session

### E10 Sentence mode priority

Steps

1. Ensure user has pre-generated sentences
2. Start review

Expected

* Sentence mode shown first if sentences available
* Falls back to word mode only when no sentences
* Sentence combines 2-4 words per the app design

Verification SQL

```sql
SELECT COUNT(*) as unused_sentences
FROM generated_sentences
WHERE user_id = 'YOUR-USER-ID' AND used_at IS NULL;
```

---

## 6E-3. Word Detail & Display Tests

### E11 Word detail shows translation

Steps

1. Go to notebook
2. Tap any word to open detail sheet
3. Check the SheetDescription area below the word

Expected

* Word shows in large text (e.g., "folgar")
* Translation shows below (e.g., "to relax / take time off")
* Both are clearly visible, not hidden

### E12 Word detail shows both word AND context

Steps

1. Open word detail for a word that has memory context

Expected

* Word and translation visible at top
* Memory context section shows if context exists
* Personal note, location hint, situation tags displayed

---

## 6F. Gamification full coverage

### F1 Daily goal increments correctly

Steps

1. Start at 0 of 10
2. Complete 10 reviews

Expected

* Counter increments
* Completion triggers celebration

Verify SQL

```sql
SELECT completed_reviews, target_reviews, completed_at
FROM daily_progress
WHERE user_id = 'YOUR_USER_ID' AND date = CURRENT_DATE;
```

### F2 Bingo squares

Steps

1. Complete actions that trigger squares:

   * review 5 words
   * 3 correct in a row
   * complete each exercise type
   * review category specific words if implemented
   * master a word
   * finish session

Expected

* Correct squares tick
* Full board view matches preview

### F3 Boss round

Steps

1. Start boss round
2. Confirm timer
3. Confirm selection of 5 hardest words

Expected

* Words chosen from highest lapse_count then low retrievability
* Results modal appears

Verification SQL

```sql
SELECT original_text, translation, lapse_count, retrievability
FROM words
WHERE user_id = 'YOUR_USER_ID'
ORDER BY lapse_count DESC, retrievability ASC
LIMIT 5;
```

### F4 Freeze behavior

Steps

1. Complete daily goal today
2. Skip tomorrow
3. Complete day after

Expected

* Streak continues if freeze available
* Freeze count decrements

Verification SQL

```sql
SELECT current_streak, streak_freeze_count, last_freeze_used_date
FROM streak_state
WHERE user_id = 'YOUR_USER_ID';
```

---

## 6F-2. Gamification Automated Testing

### Automated Test Scripts

The gamification system has comprehensive automated tests covering bingo logic, streak calculations, Boss Round selection, and starter vocabulary.

#### F5 Run gamification unit tests

```bash
cd web && npm run test:run
```

Expected

* All tests pass (186+ tests)
* Tests cover:
  - Bingo board winning conditions (rows, columns, diagonals)
  - Streak calculation logic
  - Daily progress state management
  - Consecutive correct tracking
  - Boss Round word selection
  - User persona scenarios (Sofia, Ralf, Maria)
  - Starter vocabulary coverage

#### F6 Seed gamification test data

Use this script to create a test user with comprehensive gamification data:

```bash
cd web && npx tsx scripts/seed-gamification-test-data.ts
```

This creates:
* Test account: `test-gamification@llyli.test` / `TestPassword123!`
* 18 words with varied categories (work, social, travel, food)
* Words with lapse counts 0-6 for Boss Round testing
* 5-day streak with 1 freeze available
* Fresh daily progress (0/10)
* Empty bingo board
* 3 historical Boss Round attempts

#### F7 Run gamification integration tests

After seeding test data, run integration tests:

```bash
cd web && npx tsx scripts/test-gamification-api.ts
```

Tests include:
* Database state verification
* Gamification state structure
* Boss Round data and selection logic
* Daily goal completion flow
* Bingo square completion

### F8 Starter vocabulary gamification readiness

Each supported language (pt-PT, sv, es, fr, de, nl) now includes:
* 12 starter words (10 original + 2 work category)
* Work category words enable "Review work word" bingo square
* Words with `initialLapseCount` (2-3) for Boss Round testing
* Social category words for "Review social word" bingo square

Verify with SQL:

```sql
-- Check work category exists for a user
SELECT COUNT(*) as work_words
FROM words
WHERE user_id = 'YOUR-USER-ID' AND category = 'work';

-- Check high lapse words exist for Boss Round
SELECT COUNT(*) as boss_round_candidates
FROM words
WHERE user_id = 'YOUR-USER-ID' AND lapse_count >= 2;
```

Expected:
* At least 2 work category words per user
* At least 2 words with lapse_count >= 2

### F9 Manual gamification testing checklist

For comprehensive manual testing, verify:

- [ ] Daily progress increments on each review answer
- [ ] Daily goal completion triggers celebration modal
- [ ] Streak increments after daily goal completion
- [ ] Streak freeze protects against 1 missed day
- [ ] Bingo squares complete correctly:
  - [ ] review5: After reviewing 5 words
  - [ ] streak3: After 3 correct answers in a row
  - [ ] fillBlank: After completing fill-in-the-blank exercise
  - [ ] multipleChoice: After completing multiple choice exercise
  - [ ] addContext: After capturing a word with memory context
  - [ ] workWord: After reviewing a work category word
  - [ ] socialWord: After reviewing a social category word
  - [ ] masterWord: After mastering a word (3 correct sessions)
  - [ ] finishSession: After completing daily session
- [ ] Bingo lines detected (rows, columns, diagonals)
- [ ] Bingo celebration shows when line completed
- [ ] Boss Round appears after daily goal completion
- [ ] Boss Round selects 5 words with highest lapse counts
- [ ] Boss Round timer works correctly (90 seconds)
- [ ] Boss Round results show score and personal best
- [ ] Boss Round history persists across sessions

---

## 6G. Progress dashboard full coverage

Steps

1. Go to `/progress`
2. Validate each metric appears
3. Compare key counts to database

Expected

* No 500 errors
* Counts match words table breakdown

Mastery distribution SQL

```sql
SELECT mastery_status, COUNT(*) as count
FROM words
WHERE user_id = 'YOUR-USER-ID'
GROUP BY mastery_status;
```

---

## 6H. Multi language directions full coverage

Run at least one capture and one review per direction.

### H1 en to pt-PT

Steps

1. Use test en to pt user
2. Capture hello
3. Confirm translation uses European Portuguese spellings

Expected examples

* autocarro preferred over onibus
* spelling matches pt-PT conventions

### H2 nl to en

Steps

1. Use test nl to en user
2. Capture hallo
3. Confirm English translation

### H3 en to sv

Steps

1. Use test en to sv user
2. Capture thank you
3. Confirm Swedish translation

Database check

```sql
SELECT original_text, translation, source_lang, target_lang
FROM words
WHERE user_id = 'YOUR-USER-ID'
ORDER BY created_at DESC
LIMIT 10;
```

---

## 6I. Offline mode and PWA

Run this only on local production build, not dev.

Steps

1. `cd web && npm run build && npm start`
2. Open app and sign in
3. DevTools network offline
4. Refresh
5. Navigate to notebook
6. Start review if cached data exists
7. Go online again

Expected

* Offline page or cached content loads
* No data corruption
* When back online, sync occurs and UI reflects it

---

## 6J. iOS Capacitor wrapper sanity

This is a basic checklist, not a full App Store readiness suite.

Preconditions

* iOS project exists under `ios/`
* You can open in Xcode and run simulator

Steps

1. Build the web app
2. Sync Capacitor if needed
3. Run in iOS simulator
4. Confirm:

   * app boots to home
   * sign in works
   * capture works
   * audio plays
   * navigation works with safe area
   * keyboard input works well in capture and review

Expected

* No blank white screen
* No broken audio
* No blocked navigation

---

## 7. Playwright MCP scripts for Claude Code

Use these building blocks.

Sign in

1. browser_navigate to {BASE_URL}/auth/sign-in
2. browser_snapshot
3. browser_fill_form

   * email
   * password
4. browser_click Sign In
5. browser_wait_for navigation
6. browser_snapshot

Capture

1. browser_navigate to {BASE_URL}/capture
2. browser_fill input with a word
3. browser_click Add Word
4. browser_wait_for completion UI
5. browser_take_screenshot capture_result

Review

1. browser_navigate to {BASE_URL}/review
2. browser_snapshot
3. complete one exercise
4. proceed to next
5. screenshot end state

---

## 8. Data integrity checks

Run these after major changes.

All should return 0.

```sql
SELECT COUNT(*) FROM words w
LEFT JOIN user_profiles up ON w.user_id = up.user_id
WHERE up.id IS NULL;

SELECT COUNT(*) FROM review_sessions rs
LEFT JOIN user_profiles up ON rs.user_id = up.user_id
WHERE up.id IS NULL;

SELECT COUNT(*) FROM words
WHERE mastery_status = 'ready_to_use' AND consecutive_correct_sessions < 3;

SELECT COUNT(*) FROM (
  SELECT user_id, original_text
  FROM words
  GROUP BY user_id, original_text
  HAVING COUNT(*) > 1
) duplicates;
```

---

## 9. Bug report template

Title

* Short and specific

Environment

* local dev or local production build or production
* user email
* browser and device

Repro steps
1.
2.
3.

Expected

* what should happen

Actual

* what happened

Evidence

* screenshot
* console logs
* network request payload and response
* SQL query results if relevant

---

## 10. Audit-Based Tests (Session 52)

These tests verify fixes from the comprehensive application audit. Run after any changes to the affected systems.

### 10.1 Capture Performance (P0)

**Requirement:** Capture must complete in ≤ 3 seconds (user-facing latency)

Steps

1. Sign in with test account
2. Navigate to `/capture`
3. Set up JavaScript timing measurement:
   ```javascript
   window._captureTimings = [];
   const originalFetch = window.fetch;
   window.fetch = async function(...args) {
     if (args[0]?.includes?.('/api/words')) {
       const start = performance.now();
       const result = await originalFetch.apply(this, args);
       window._captureTimings.push({ url: args[0], duration: performance.now() - start });
       return result;
     }
     return originalFetch.apply(this, args);
   };
   ```
4. Capture a phrase
5. Check `window._captureTimings`

Expected

* POST /api/words completes in < 3000ms
* Typical performance: 2-2.5 seconds

### 10.2 Database Indexes (P0)

Verify indexes exist for performance-critical queries.

Supabase SQL

```sql
-- Check words table indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'words'
ORDER BY indexname;
```

Expected indexes

* `words_user_next_review_idx` on (user_id, next_review_date)
* `words_user_target_lang_idx` on (user_id, target_lang)
* `words_user_source_lang_idx` on (user_id, source_lang)
* `words_user_mastery_idx` on (user_id, mastery_status)
* `words_user_created_idx` on (user_id, created_at)
* `words_user_category_idx` on (user_id, category)

### 10.3 Rate Limiting (P1)

Test subscription-based limits enforcement.

Steps

1. Sign in with test account (free tier)
2. Capture 50 words in a session
3. Attempt to capture word #51

Expected

* 429 response returned
* Error message: "You've reached your daily word capture limit"
* `retryAfter` header or field present

Manual test (curl)

```bash
# After exceeding limit
curl -X POST https://llyli.vercel.app/api/words \
  -H "Content-Type: application/json" \
  -H "Cookie: [auth-cookie]" \
  -d '{"text":"test"}' -w "%{http_code}"
```

Expected: HTTP 429

### 10.4 Language Validation (P1)

Test that unsupported language codes are rejected.

Steps

1. Sign in with test account
2. Manually call the API with invalid language:
   ```bash
   curl -X POST /api/words \
     -H "Content-Type: application/json" \
     -d '{"text":"test", "sourceLang":"xx-XX", "targetLang":"en"}'
   ```

Expected

* 400 response
* Error message mentioning unsupported language

### 10.5 Network Timeout (P1)

Test that capture requests timeout after 10 seconds.

Steps

1. Use browser DevTools to throttle network to "Slow 3G"
2. Attempt to capture a phrase
3. Wait 10+ seconds

Expected

* Request aborts after ~10 seconds
* User sees error: "Request timed out. Please check your connection and try again."
* UI returns to input state (not stuck on "Capturing...")

### 10.6 401 Redirect (P1)

Test that expired sessions redirect to login.

Steps

1. Sign in with test account
2. Clear the auth cookie in DevTools (Application > Cookies)
3. Attempt to capture a phrase

Expected

* User is redirected to `/auth/sign-in`
* No generic error shown to user

### 10.7 Session Race Condition Prevention (P0)

Test that concurrent review starts don't create duplicate sessions.

Steps

1. Sign in with test account that has due words
2. Open two browser tabs
3. Navigate both to `/review` simultaneously
4. Check database for duplicate active sessions

Verification SQL

```sql
SELECT COUNT(*) as active_sessions
FROM review_sessions
WHERE user_id = 'YOUR-USER-ID' AND ended_at IS NULL;
```

Expected

* Exactly 1 active session (not 2+)
* Transaction wrapping prevents race condition

### 10.8 N+1 Query Fix Verification (P2)

Verify sentences endpoint uses batch loading.

Steps

1. Ensure test user has 5+ pre-generated sentences
2. Navigate to `/review`
3. Check server logs or add timing

Expected

* Single words query regardless of sentence count
* No sequential queries per sentence

### 10.9 Polling Cleanup (P2)

Test that audio polling doesn't leak memory.

Steps

1. Capture 5 words rapidly (within 10 seconds)
2. Wait for all audio to complete
3. Check browser memory usage
4. Navigate away and back

Expected

* No lingering poll intervals
* Memory stable after completion
* AbortControllers cleaned up

### 10.10 Admin Query Performance (P2)

Test admin dashboard loads efficiently.

Steps

1. Access admin dashboard with authorized account
2. Measure load time

Expected

* Dashboard loads in < 5 seconds
* Queries run in parallel (check server logs)

---

## 11. Release readiness checklist

Before you call a release ready:

* Build passes
* Unit tests pass
* Smoke test passes in all environments
* Full functional suite passes at least on local production build and production
* No critical open issues in:

  * auth and onboarding
  * capture and review
  * progress and gamification
  * language direction correctness
  * offline sanity
  * iOS wrapper sanity if shipping iOS

---

## 12. Quick Regression Checklist (5-Minute Sanity)

Run this BEFORE every deploy and AFTER every deploy to production.

### Pre-Deploy Checklist

```bash
cd web
npm run build                    # Must pass
npm run test:run                 # All tests must pass
npm run log:check                # PROJECT_LOG not too large
```

### Post-Deploy Verification (Production)

Use Playwright MCP or manual browser testing on `https://llyli.vercel.app`:

| Test | Steps | Expected |
|------|-------|----------|
| **Auth** | Sign in as `test-en-pt@llyli.test` | Redirects to Today page |
| **Today Page** | Check "Review Due" count | Shows a number (not blank/error) |
| **Capture** | Capture "obrigado" | Shows translation "thank you", audio button appears |
| **Review** | Start review, answer one question | Feedback appears, can rate recall |
| **Notebook** | Open notebook, check journal title | Shows "Your Portuguese Journal" |
| **Progress** | Open progress page | Loads without 500 error |

### Multi-Language Spot Check

Test at least 2 of 3 language pairs:

| Account | Target Lang | Quick Test |
|---------|-------------|------------|
| `test-en-pt@llyli.test` | Portuguese | Capture "café", see Portuguese audio |
| `test-en-sv@llyli.test` | Swedish | Capture "tack", see Swedish audio |
| `test-nl-en@llyli.test` | English | Capture "hello", see English audio |

Password for all: `TestPassword123!`

### Red Flags (Stop and Investigate)

- [ ] 500 errors on any page
- [ ] "All caught up" when user has due words
- [ ] Wrong language shown (e.g., Dutch for Portuguese learner)
- [ ] Review submission fails
- [ ] Due count mismatch between pages
- [ ] Console errors mentioning "undefined" or "null"

### If Regression Found

1. **Do NOT deploy more changes** until fixed
2. Create GitHub issue immediately with:
   - Production URL where bug occurs
   - Exact steps to reproduce
   - Expected vs actual behavior
   - Console errors (if any)
   - Screenshot
3. Roll back if critical (Vercel: promote previous deployment)
