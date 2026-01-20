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

* URL: [https://web-eta-gold.vercel.app](https://web-eta-gold.vercel.app)

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

## 10. Release readiness checklist

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
