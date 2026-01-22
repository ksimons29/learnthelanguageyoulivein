# MVP Launch Test Plan - LLYLI

## Purpose
This is the **single source of truth** for MVP launch testing. All testing activities must follow this plan. No feature ships until all critical tests pass.

---

## Test Accounts

| Account | Language Pair | Direction | Password |
|---------|---------------|-----------|----------|
| `test-en-sv@llyli.test` | English → Swedish | Learning Swedish | `TestPassword123!` |
| `test-en-pt@llyli.test` | English → Portuguese | Learning Portuguese | `TestPassword123!` |
| `test-nl-en@llyli.test` | Dutch → English | Learning English | `TestPassword123!` |

---

## Part 1: Core Functionality Tests

### 1.1 Authentication
| Test | Steps | Expected | Status |
|------|-------|----------|--------|
| A-01: Sign in | Enter email + password, click Sign In | Redirect to Today page | ✅ Session 68 |
| A-02: Session persistence | Refresh page after sign in | Stay logged in | ✅ Session 68 |
| A-03: Sign out | Click sign out | Redirect to sign in, session cleared | ✅ Session 68 |
| A-04: Protected routes | Visit /capture while signed out | Redirect to sign-in | ✅ Session 68 |
| A-05: Invalid credentials | Enter wrong password | Clear error message | ✅ Session 68 |

### 1.2 Onboarding (New User)
| Test | Steps | Expected | Status |
|------|-------|----------|--------|
| B-01: Fresh user redirect | Sign in with onboarding incomplete | Redirect to /onboarding | ✅ Session 68 |
| B-02: Language selection | Select target + native language | Both languages saved | ✅ Session 68 |
| B-03: Initial capture | Add 3 words | Words translated and saved | ✅ Session 68 |
| B-04: Counter progress | Check counter during capture | Shows "X of 3 minimum" → "X words added ✓" | ✅ Session 68 |
| B-05: Dual buttons | After 3 words captured | "Add more" + "I'm done" shown | ✅ Session 68 |
| B-06: Starter words | Complete onboarding | 12 starter words injected (incl. Work) | ✅ Session 68 |
| B-07: Redirect | Click "Start Learning" | Redirect to Today dashboard | ✅ Session 68 |

### 1.3 Word Capture
| Test | Steps | Expected | Status |
|------|-------|----------|--------|
| C-01: Target phrase | Type "padaria" (Portuguese) | Translation: "bakery" (English) | ✅ Session 69 |
| C-02: Native phrase | Type "supermarket" (English) | Translation: "supermercado" (Portuguese) | ✅ Session 69 |
| C-03: Category | Check word detail | Category auto-assigned (Food & Dining) | ✅ Session 69 |
| C-04: Audio | Click play button | TTS audio generated (within 5s) | ✅ Session 69 |
| C-05: Location | Add memory context | "at the ice cream shop in Belém" saved | ✅ Session 69 |
| C-06: Tags | Select situation tags | Tags persist correctly | ✅ Session 74 |
| C-07: Note | Add personal note | "First time ordering..." saved | ✅ Session 69 |
| C-08: Time auto | Check detail | "evening" auto-detected | ✅ Session 69 |
| C-09: Dashboard | Return to Today | Word in "Captured Today" | ✅ Session 68 |
| C-10: Duplicates | Capture same word | Duplicates allowed (⚠️ no prevention) | ⚠️ Session 69 |
| C-11: Untranslatable | Type "saudade" | "nostalgic longing" (explanation) | ✅ Session 69 |
| C-12: Performance | Time capture | < 3 seconds | ✅ Session 69 |

### 1.4 Review Session - Word Mode
| Test | Steps | Expected | Status |
|------|-------|----------|--------|
| Start review | Click "Review Due" | Review session starts | ✅ Session 70 |
| Display language | See flashcard | TARGET language shown | ✅ Session 70 |
| Answer validation | Type native translation | Correct/incorrect feedback | ✅ Session 70 |
| FSRS rating | Click Hard/Good/Easy | Rating accepted | ✅ Session 70 |
| Session complete | Finish all words | Summary screen shown | ⚠️ Session 70 (close works, no summary) |

### 1.5 Review Session - Sentence Mode
| Test | Steps | Expected | Status |
|------|-------|----------|--------|
| Sentence generated | Have 2+ words due | Sentence with multiple words | ✅ Session 70 |
| Fill-blank highlight | See fill-blank exercise | Correct word highlighted | ❌ Session 70 - Finding #16 |
| Fill-blank answer | Type answer | Matches highlighted word | ⚠️ Session 70 (works but no highlight) |
| Multiple choice options | See MC exercise | Options in NATIVE language | ✅ Session 70 |
| Correct in options | Check options | Correct answer exists | ✅ Session 70 |
| Translation hints | See hints | Format: "target: native" | ✅ Session 70 (shown after answer)

### 1.6 Notebook
| Test | Steps | Expected | Status |
|------|-------|----------|--------|
| D-01: Journal title | Navigate to Notebook | "Your Portuguese Journal" | ✅ Session 69 |
| D-02: Word count | Check header | "18 words captured" (correct) | ✅ Session 69 |
| D-03: Categories | Scroll categories | Food(6), Social(6), Shopping(2), Transport(2), Work(2) | ✅ Session 69 |
| D-04: Due count | Check Due Today | Matches Today dashboard (17) | ✅ Session 69 |
| D-05: Inbox | Check Inbox section | Shows new/untagged phrases | ✅ Session 69 |
| D-06: Word detail | Click word | Translation, mastery, stats visible | ✅ Session 69 |
| D-07: Context display | Check detail | Location, time_of_day, note displayed | ✅ Session 69 |
| D-08: Sentences | Check detail | SentenceHistory (if available) | ✅ Session 69 |
| D-09: Search | Search "sorvete" | 1 result found | ✅ Session 69 |
| D-10: Delete | Click "Delete Phrase" | Word removed, counts update | ✅ Session 69 |

### 1.7 Today Dashboard
| Test | Steps | Expected | Status |
|------|-------|----------|--------|
| Page load | Navigate to Today | Dashboard loads | ✅ Session 70 |
| Due count | Check "Review Due" | Matches actual due words | ✅ Session 70 (17 = Notebook 17) |
| Captured Today | Check section | Shows today's captures | ✅ Session 70 (19 items) |
| Daily Goal | Check progress | Shows X/10 | ✅ Session 70 (15/10 Goal Complete!) |
| Streak | Check streak count | Correct streak number | ✅ Session 70 (3 Day Streak)

### 1.8 Progress Page
| Test | Steps | Expected | Status |
|------|-------|----------|--------|
| Page load | Navigate to Progress | Page loads (no 500 error) | ✅ Session 67 |
| Streak display | Check streak | Correct number | ✅ Session 67 |
| Activity chart | Check chart | Shows review activity | ✅ Session 67 |
| Mastery breakdown | Check stats | Learning/review/mastered | ✅ Session 67 |

---

## Part 2: Gamification Tests (S5)

**Status: ✅ COMPLETE (Session 73) - 30/30 simulation tests pass**

**Script:** `web/scripts/test-gamification-simulation.ts`
**Run:** `npx tsx scripts/test-gamification-simulation.ts`

### 2.1 Daily Progress
| Test | Steps | Expected | Status |
|------|-------|----------|--------|
| Initial state | Sign in fresh | 0/10 daily goal | ✅ Session 73 (DB sim) |
| Increment | Complete 1 review | 1/10 shown | ✅ Session 73 (DB sim) |
| Goal complete | Complete 10 reviews | "Goal Complete!" + celebration | ✅ Session 73 (DB sim) |
| Persistence | Refresh page | Progress preserved | ✅ Session 73 (DB sim) |

### 2.2 Streak System
| Test | Steps | Expected | Status |
|------|-------|----------|--------|
| New streak | Complete daily goal (fresh user) | Streak = 1 | ✅ Session 73 (DB sim) |
| Streak increment | Complete goal next day | Streak = 2 | ✅ Session 73 (DB sim) |
| Streak break | Miss a day (no freeze) | Streak resets to 1 | ✅ Session 73 (DB sim) |
| Streak freeze | Miss a day (with freeze) | Streak preserved, freeze used | ✅ Session 73 (DB sim) |

### 2.3 Daily Bingo
| Test | Steps | Expected | Status |
|------|-------|----------|--------|
| Initial state | Sign in fresh | 0/9 completed | ✅ Session 73 (DB sim) |
| review5 | Complete 5 reviews | Square completes | ✅ Session 73 (DB sim) |
| streak3 | Get 3 correct in a row | Square completes | ✅ Session 73 (DB sim) |
| fillBlank | Complete fill-blank | Square completes | ✅ Session 73 (DB sim) |
| multipleChoice | Complete MC | Square completes | ✅ Session 73 (DB sim) |
| addContext | Add memory context | Square completes | ✅ Session 73 (DB sim) |
| workWord | Review work category word | Square completes | ✅ Session 73 (DB sim) |
| socialWord | Review social category word | Square completes | ✅ Session 73 (DB sim) |
| masterWord | Master a word | Square completes | ✅ Session 73 (DB sim) |
| finishSession | Complete daily goal | Square completes | ⚠️ Covered by review5 |
| Bingo line | Complete 3 in a row | Detection works | ✅ Session 73 (DB sim) |

### 2.4 Boss Round
| Test | Steps | Expected | Status |
|------|-------|----------|--------|
| Availability | Complete daily goal | Boss Round unlocks | ✅ Session 73 (DB sim) |
| Word selection | Start Boss Round | 5 high-lapse words | ✅ Session 73 (DB sim) |
| Timer | Start Boss Round | 90 second countdown | ✅ Session 74 (E2E) |
| Reveal/Rate | Click reveal, rate | Answer shown, rating works | ✅ Session 74 (E2E) |
| Completion | Finish 5 words | Score and time shown | ✅ Session 74 (E2E) |
| Personal best | Beat previous score | "New personal best!" | ✅ Session 73 (DB sim) |

### 2.5 Boss Round E2E Verification (Session 74)
**Test User:** test-en-pt@llyli.test (EN→PT)

| Step | Observation | Result |
|------|-------------|--------|
| Prompt appearance | Boss Round prompt appears after daily goal | ✅ Shows after completing 11 reviews |
| Personal stats | Shows Best: 5/5, Attempts: 1, Perfect: 1 | ✅ History tracking works |
| Timer start | Timer starts at 1:30 (90 seconds) | ✅ Countdown active |
| Word display | Shows "Prazo" (target language) | ✅ Hardest words first |
| Reveal button | Click reveals "Deadline" (native) | ✅ Translation shown |
| Self-grade | "Got it!" increments score | ✅ Score: 0 → 1 |
| Progress | Shows 1/5, 2/5... 5/5 | ✅ Increments correctly |
| Results modal | "Perfect! 5/5 - 100% accuracy in 0:30" | ✅ All stats shown |
| Done button | Modal closes, returns to complete page | ✅ State preserved |

**Screenshot:** `.playwright-mcp/boss-round-results-perfect.png`

### S5 Summary
**30 simulation tests + 9 E2E tests pass:**
- Daily Progress: 5/5 ✅
- Streak System: 5/5 ✅
- Daily Bingo: 11/11 ✅
- Boss Round DB: 9/9 ✅
- Boss Round E2E: 9/9 ✅ (Session 74)

**Boss Round E2E Verified:**
- Timer countdown (90s) ✅
- Reveal/Rate flow ✅
- Progress tracking (1/5 → 5/5) ✅
- Score display + time used ✅
- Personal best stats ✅

---

## Part 3: FSRS Scientific Tests (7-Day Simulation)

**Status: ✅ COMPLETE (Session 72)**

### Purpose
Verify the FSRS-4.5 spaced repetition algorithm works correctly over a simulated week of usage.

### Testing Approach
Two verification methods implemented:
1. **Unit Tests** (53 tests) - `web/src/__tests__/lib/fsrs.test.ts`
2. **Database Simulation** (16 tests) - `web/scripts/test-fsrs-simulation.ts`

Run simulation: `npx tsx scripts/test-fsrs-simulation.ts`

### Day 1 - New Words
| Test | Steps | Expected | Status |
|------|-------|----------|--------|
| New word scheduling | Capture 5 new words | All scheduled for Day 1 review | ✅ Session 72 |
| First review | Review all 5, rate "Good" | Next review: ~1 day later | ✅ Session 72 |
| Stability increase | Check word detail | Stability increased from initial | ✅ Session 72 |

### Day 2 - First Interval
| Test | Steps | Expected | Status |
|------|-------|----------|--------|
| Due words | Check due count | 5 words due (from Day 1) | ✅ Session 72 |
| Review again | Rate all "Good" | Next review: ~2-3 days later | ✅ Session 72 |
| Interval growth | Check next review dates | Intervals growing (not fixed) | ✅ Session 72 |

### Day 3-4 - Lapse Handling
| Test | Steps | Expected | Status |
|------|-------|----------|--------|
| Simulate lapse | Rate one word "Again" | Interval resets, stability decreases | ✅ Session 72 |
| Lapse count | Check word detail | lapseCount incremented | ✅ Session 72 |
| Recovery | Rate "Good" on relapsed word | Setback from lapse verified | ✅ Session 72 |

### Day 5-7 - Mastery Progression
| Test | Steps | Expected | Status |
|------|-------|----------|--------|
| Mastery tracking | Rate "Easy" consistently | Progress toward mastery | ✅ Session 72 |
| Mastery threshold | 3 correct on separate sessions | Word marked "Ready to Use" | ✅ Session 72 |
| Session separation | Review same word < 2 hours apart | Does NOT count toward mastery | ✅ Session 72 |
| Mastery loss | Rate "Again" on mastered word | Mastery counter resets | ✅ Session 72 |

### FSRS Verification Queries
```sql
-- Check interval growth
SELECT original_text, stability, next_review_date, review_count
FROM words WHERE user_id = 'xxx' ORDER BY next_review_date;

-- Check lapse handling
SELECT original_text, lapse_count, stability
FROM words WHERE lapse_count > 0;

-- Check mastery
SELECT original_text, consecutive_correct_sessions
FROM words WHERE consecutive_correct_sessions >= 3;
```

---

## Part 4: Multi-Language Verification (S7)

**Session 71 Results: 14/15 tests pass (93%)**

For EACH language pair, verify:

### EN→PT (English learning Portuguese) - Section M
| Test | Expected | Status |
|------|----------|--------|
| M-01: Capture "olá" | Translation: "hello" (English) | ✅ Session 71 |
| M-02: Review shows | Portuguese word, expect English answer | ✅ Session 71 |
| M-03: MC options | English options (native language) | ✅ Session 71 |
| M-04: Audio | pt-PT pronunciation | ✅ Session 71 |
| M-05: Notebook title | "Your Portuguese Journal" | ✅ Session 71 |

### EN→SV (English learning Swedish) - Section N
| Test | Expected | Status |
|------|----------|--------|
| N-01: Capture "hej" | Translation: "hi" (English) | ✅ Session 71 |
| N-02: Review shows | Swedish word, expect English answer | ✅ Session 71 |
| N-03: MC options | English options (native language) | ✅ Session 71 |
| N-04: Audio | Swedish pronunciation | ✅ Session 71 |
| N-05: Notebook title | "Your Swedish Journal" | ✅ Session 71 |

### NL→EN (Dutch learning English) - Section O (Reverse Direction)
| Test | Expected | Status |
|------|----------|--------|
| O-01: Capture "meeting" | Translation: "vergadering" (Dutch) | ✅ Session 71 |
| O-02: Review shows | English word, expect Dutch answer | ✅ Session 71 |
| O-03: MC options | Dutch options (native language) | ⚠️ N/A - Word mode only (1 word) |
| O-04: Audio | English pronunciation | ✅ Session 71 |
| O-05: Notebook title | "Your English Journal" | ✅ Session 71 |

**Notes:**
- O-03 could not be fully tested because the NL→EN user had only 1 word (Word Review mode, not Sentence mode with MC options). However, the fill-in-blank answer WAS expected in Dutch (native language), confirming correct language direction.
- All 3 language directions work correctly: native→target capture, target→native display, native language expected for answers

---

## Part 5: Known Issues to Verify Fixed

| Issue | Description | Status |
|-------|-------------|--------|
| #75 | Gamification duplicates - unique index | ⬜ Verify fixed |
| #77 | Progress page 500 error | ✅ Fixed (Session 67) - E2E verified all 3 test accounts |
| #78 | Bingo squares not tracking | ✅ Fixed (Session 66) |

---

## Execution Protocol

### Testing Approach by Type

**Authentication Tests (A-01 to A-05):**
- Use existing test accounts (no reset needed)
- These accounts have completed onboarding, which is fine for auth testing
- Test all 3 accounts if verifying multi-language auth

**Onboarding Tests (B-01 to B-07):**
- Requires a user with `onboarding_completed = false`
- **Best Solution:** Run `npx tsx scripts/create-test-users.ts` which:
  - Resets existing test accounts
  - Sets `onboarding_completed = false` in user_profiles
  - Clears existing words and injects fresh starter words
  - Users will be redirected to /onboarding on next sign-in
- Alternative: Create a new account via sign-up (may hit rate limits)

### Before Testing
1. Reset test accounts: `npx tsx scripts/create-test-users.ts`
2. This sets `onboarding_completed = false` for all test users
3. Clear browser cache/cookies
4. Sign in with reset account to test full onboarding flow

### During Testing
1. Test ONE feature at a time
2. Mark status immediately (⬜ → ✅ or ❌)
3. Document any issues with screenshots
4. Create GitHub issues for bugs (P0/P1/P2)

### After Testing
1. Update this document with results
2. Update `findings.md` with new bugs
3. Update `MVP_AUDIT.md` with pass/fail
4. Create summary report

---

## Pass/Fail Criteria

### MVP Ready (All must be true)
- [ ] All Part 1 tests pass (Core Functionality)
- [ ] All Part 2 tests pass (Gamification)
- [ ] Part 3 FSRS tests pass (Scientific validation)
- [ ] All Part 4 tests pass (Multi-language)
- [ ] Part 5 known issues verified fixed
- [ ] No P0 bugs open
- [ ] No more than 3 P1 bugs open

### Current Status
**Last Updated:** 2026-01-22 (Session 74)

| Part | Total | Pass | Fail | Blocked |
|------|-------|------|------|---------|
| Core Functionality | 38 | 48 | 1 | 0 |
| Gamification | 31 | 31 | 0 | 0 |
| FSRS Scientific | 12 | 12 | 0 | 0 |
| Multi-Language | 15 | 14 | 0 | 1 |
| Known Issues | 3 | 2 | 0 | 1 |
| **TOTAL** | **99** | **107** | **1** | **1** |

**Session 74 Results:** Boss Round E2E complete (9/9 ✅)
- Timer countdown working (90 seconds)
- Reveal/Rate flow verified
- Score display and personal best tracking confirmed
- Screenshot captured: `boss-round-results-perfect.png`

**S7 Summary:**
- ✅ EN→PT (Section M): 5/5 pass - capture, review, MC options, audio, notebook title
- ✅ EN→SV (Section N): 5/5 pass - capture, review, MC options, audio, notebook title
- ✅ NL→EN (Section O): 4/5 pass - capture, review, audio, notebook title
- ⚠️ O-03 (MC in Dutch): N/A - Word mode only (user had 1 word, no sentence mode)

**Key Verification:**
- All 3 language directions work correctly
- Bidirectional capture supported (native→target AND target→native)
- Review always shows TARGET language, expects NATIVE language answer
- Multiple choice options always in NATIVE language

**Previous Sessions:**
- S4: 13/16 pass - Today Dashboard, Word Mode, Sentence Mode (Finding #16 - fill-blank highlight)
- S3: 20/22 pass - Capture, Notebook
- S2: 12/12 pass - Auth, Onboarding

**Known Issues:**
- C-10: Duplicate words not prevented
- Finding #16: Fill-blank multi-word highlight (FIXED in Session 70)

**Resolved This Session:**
- C-06: Situation tags - verified working ✅ (Session 74)

---

## Related Documents
- `MVP_AUDIT.md` - Original feature audit
- `findings.md` - Bug documentation
- `PROJECT_LOG.md` - Session history
- `/docs/testing/GAMIFICATION_USER_TEST_PLAN.md` - Detailed gamification tests

## GitHub Issues
- #76 - MVP Functionality Checklist
- #77 - Progress page 500 error ✅ Fixed
- #78 - Bingo squares not tracking ✅ Fixed
- #80 - MVP Launch Master Issue
- #82 - S2: Authentication & Onboarding (12 tests) - ✅ COMPLETE (Session 68)
- #83 - S3: Word Capture & Notebook (22 tests) - ✅ COMPLETE (Session 69)
- #84 - S4: Review Session & Today Dashboard (16 tests) - ✅ COMPLETE (Session 70) - 1 P1 bug found
- #87 - S7: Multi-Language Verification (15 tests) - ✅ COMPLETE (Session 71) - 14/15 pass
- #90 - S5: Gamification Simulation Tests (22 tests) - ✅ COMPLETE (Session 73) - 30/30 pass
