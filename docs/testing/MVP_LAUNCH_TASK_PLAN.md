# MVP Launch Task Plan - LLYLI

> **Single source of truth** for MVP launch readiness. Consolidates all test plans, feature requirements, and open issues.

**Version:** 1.0
**Created:** 2026-01-22
**Status:** ACTIVE
**Master GitHub Issue:** #80

### Session Issues
| Session | Issue | Focus | Tests |
|---------|-------|-------|-------|
| S1 | #81 | Bug Fixes (#77, #78) | 3 |
| S2 | #82 | Auth + Onboarding | 12 |
| S3 | #83 | Capture + Notebook | 22 |
| S4 | #84 | Review System | 20 |
| S5 | #85 | Gamification | 26 |
| S6 | #86 | FSRS Scientific | 10 |
| S7 | #87 | Multi-Language | 15 |
| S8 | #88 | Integration + Final | 23 |

---

## Executive Summary

### Current State
| Metric | Value | Notes |
|--------|-------|-------|
| Feature steps defined | 115 | Consolidated from all test plans |
| Verified passing | 10 | From MVP_AUDIT.md |
| Known failing | 2 | #77 Progress 500, #78 Bingo tracking |
| Untested | 103 | Requires E2E verification |
| P0 bugs | 0 | All resolved (Sessions 54-66) |
| P1 bugs | 3 | #77, #78, #23 (iOS submission) |
| P2 enhancements | 5 | See backlog |
| Unit tests | 228 | All passing |

### MVP Launch Criteria (All Must Pass)
- [ ] All P0 bugs resolved (✅ Done)
- [ ] All P1 bugs resolved (3 open)
- [ ] All 115 feature steps verified
- [ ] Multi-language verification complete (EN→PT, EN→SV, NL→EN)
- [ ] Gamification E2E complete
- [ ] FSRS scientific validation complete
- [ ] Production deployment stable
- [ ] No critical security issues

---

## Phase 1: Bug Fixes (Must Complete First)

### P1-BLOCKER: Progress Page 500 Error (#77)
**Status:** OPEN
**Priority:** P1-High
**Blocks:** Progress dashboard, stats verification

**Evidence:**
```
GET /api/progress => 500
Error: Failed query: select date("next_review_date"), count(*)::int from "words"
```

**Investigation Needed:**
- [ ] Check PostgreSQL date function compatibility
- [ ] Verify query on local with Supabase console
- [ ] Add error boundary for graceful degradation

**Acceptance Criteria:**
- Progress page loads without error
- Stats display correctly
- Activity chart renders

---

### P1-BLOCKER: Bingo Squares Not Tracking (#78)
**Status:** OPEN
**Priority:** P1-High
**Blocks:** Gamification system, MVP goal

**Evidence:**
```json
{
  "bingo": {
    "squaresCompleted": [],  // Should NOT be empty after 18 reviews
    "bingoAchieved": false
  }
}
```

**Expected After 18 Reviews:**
- `review5` ✓
- `fillBlank` ✓
- `multipleChoice` ✓
- `finishSession` ✓

**Investigation Needed:**
- [ ] Trace event flow from review completion to bingo update
- [ ] Check if events are being emitted correctly
- [ ] Verify bingo state persistence

**Acceptance Criteria:**
- Bingo squares update in real-time
- `squaresCompleted` array populates correctly
- Bingo line detection works

---

### P1: iOS App Store Submission (#23)
**Status:** OPEN
**Priority:** P1-High
**Timeline:** Post-E2E verification

**Prerequisites:**
- [ ] All E2E tests pass
- [ ] Capacitor build succeeds
- [ ] TestFlight internal testing complete

**Tasks:**
- [ ] App Store Connect setup
- [ ] Screenshots and metadata
- [ ] Privacy policy URL
- [ ] Review submission

---

## Phase 2: Core Feature Verification

### Section A: Authentication (5 tests)

| ID | Test | Expected | Status |
|----|------|----------|--------|
| A-01 | Sign in with email/password | Redirect to Today page | ⬜ |
| A-02 | Session persistence (refresh) | Stay logged in | ⬜ |
| A-03 | Sign out | Clear session, redirect to sign-in | ⬜ |
| A-04 | Protected routes (unauthorized) | Redirect to sign-in | ⬜ |
| A-05 | Invalid credentials | Clear error message | ⬜ |

### Section B: Onboarding (7 tests)

| ID | Test | Expected | Status |
|----|------|----------|--------|
| B-01 | Fresh user sees onboarding | Redirect to /onboarding | ⬜ |
| B-02 | Language selection | Both languages saved | ⬜ |
| B-03 | Initial capture (3 minimum) | Words saved with translation | ⬜ |
| B-04 | Counter shows progress | "X of 3 minimum" → "X words added ✓" | ⬜ |
| B-05 | Dual buttons after minimum | "Add more" + "I'm done" shown | ⬜ |
| B-06 | Starter words injected | 12 words including Work category | ⬜ |
| B-07 | Onboarding complete | Redirect to Today | ⬜ |

### Section C: Word Capture (12 tests)

| ID | Test | Expected | Status |
|----|------|----------|--------|
| C-01 | Enter target language phrase | Translation in native language | ⬜ |
| C-02 | Enter native language phrase | Translation in target language | ⬜ |
| C-03 | Auto-categorization | Category assigned | ⬜ |
| C-04 | TTS audio generated | Audio playable | ⬜ |
| C-05 | Memory context - location | Location saved | ⬜ |
| C-06 | Memory context - tags | Tags saved (max 3) | ⬜ |
| C-07 | Memory context - note | Note saved | ⬜ |
| C-08 | Time of day auto-detected | morning/afternoon/evening/night | ⬜ |
| C-09 | Captured Today updates | Word appears in dashboard list | ✅ (Session 60) |
| C-10 | Duplicate handling | Graceful handling | ⬜ |
| C-11 | Untranslatable words | Explanation provided, not identical | ⬜ |
| C-12 | Capture < 3 seconds | Performance target met | ⬜ |

### Section D: Notebook (10 tests)

| ID | Test | Expected | Status |
|----|------|----------|--------|
| D-01 | Journal title correct | "Your [Language] Journal" | ⬜ |
| D-02 | Total word count | Matches database | ⬜ |
| D-03 | Category counts | Each category accurate | ⬜ |
| D-04 | Due today count | Matches Today dashboard | ✅ (Session 57) |
| D-05 | Inbox shows new words | Words < 24h, reviewCount=0 | ✅ (Session 60) |
| D-06 | Word detail sheet | Translation, audio, mastery visible | ⬜ |
| D-07 | Memory context in detail | Location, tags, note displayed | ⬜ |
| D-08 | Practice sentences in detail | SentenceHistory component shows sentences | ⬜ |
| D-09 | Global search | Find by word or translation | ⬜ |
| D-10 | Delete word | Word removed, counts update | ⬜ |

### Section E: Review Session - Word Mode (8 tests)

| ID | Test | Expected | Status |
|----|------|----------|--------|
| E-01 | Start review with due words | Session starts | ⬜ |
| E-02 | Display target language | Word shown in learning language | ⬜ |
| E-03 | Active recall input | Type answer before rating | ⬜ |
| E-04 | Correct answer feedback | Green check, correct translation | ⬜ |
| E-05 | Incorrect answer feedback | Red X, correct answer shown | ⬜ |
| E-06 | Rating buttons | Again/Hard/Good/Easy work | ⬜ |
| E-07 | Memory hint shown | After reveal, context displayed | ⬜ |
| E-08 | Close review mid-session | No crash, navigates home | ✅ (Session 58) |

### Section F: Review Session - Sentence Mode (12 tests)

| ID | Test | Expected | Status |
|----|------|----------|--------|
| F-01 | Sentence mode priority | Sentences shown before word mode | ⬜ |
| F-02 | Word picker language | Native language displayed | ✅ (Session 54) |
| F-03 | Word selection (2+ words) | Can select multiple | ⬜ |
| F-04 | Fill-blank highlight | Correct word highlighted | ✅ (Session 55) |
| F-05 | Fill-blank answer | Matches highlighted word | ✅ (Session 55) |
| F-06 | Multiple choice options | Native language | ✅ (Session 54) |
| F-07 | Correct answer in options | Always present | ✅ (Session 55) |
| F-08 | Translation hints | Format: "target: native" | ✅ |
| F-09 | No duplicate options | All options unique | ⬜ |
| F-10 | Exercise difficulty progression | MC → Fill-blank → Type | ⬜ |
| F-11 | Session limit (25 words) | Session completes at limit | ⬜ |
| F-12 | Session summary | Accuracy, words reviewed shown | ⬜ |

### Section G: Today Dashboard (8 tests)

| ID | Test | Expected | Status |
|----|------|----------|--------|
| G-01 | Page loads | No errors | ⬜ |
| G-02 | Due count accurate | Matches notebook | ✅ (Session 57) |
| G-03 | Captured Today shows | Today's captures visible | ✅ (Session 60) |
| G-04 | Daily goal progress | X/10 shown | ⬜ |
| G-05 | Streak display | Current streak count | ⬜ |
| G-06 | Review Due navigation | Goes to /review | ⬜ |
| G-07 | Capture button | Goes to /capture | ⬜ |
| G-08 | Bingo preview | Mini 3x3 grid visible | ⬜ |

---

## Phase 3: Gamification Verification

### Section H: Daily Progress (5 tests)

| ID | Test | Expected | Status |
|----|------|----------|--------|
| H-01 | Initial state 0/10 | Fresh day shows 0 | ⚠️ Can't test (users have data) |
| H-02 | Progress increments | Each review adds 1 | ✅ (Session 70) EN→PT: 36/10, EN→SV: 20/10, NL→EN: 5/10 |
| H-03 | Goal completion (10/10) | "Goal Complete!" + celebration | ✅ (Session 70) Shows checkmark + "Goal Complete!" |
| H-04 | Progress persists | Survives navigation/refresh | ✅ (Session 70) Verified across all 3 users |
| H-05 | New day resets | Resets at midnight UTC | ⚠️ Can't test (needs time travel) |

### Section I: Streak System (5 tests)

| ID | Test | Expected | Status |
|----|------|----------|--------|
| I-01 | First completion | Streak = 1 | ✅ (Session 70) EN→SV shows 1 Day Streak |
| I-02 | Consecutive days | Streak increments | ✅ (Session 70) EN→PT shows 3 Day Streak |
| I-03 | Freeze protection | Miss 1 day, streak preserved | ⚠️ Can't test (needs multi-day) |
| I-04 | Freeze used | Freeze count decrements | ⚠️ Can't test (needs multi-day) |
| I-05 | No freeze = reset | Miss day without freeze, streak = 0 | ⚠️ Can't test (needs multi-day) |

### Section J: Bingo Board (13 tests)

| ID | Test | Expected | Status |
|----|------|----------|--------|
| J-01 | Board displays 3x3 | 9 squares visible | ✅ (Session 70) All 3 users show 3x3 grid |
| J-02 | Square labels readable | All labels clear | ✅ (Session 70) All 9 labels visible and clear |
| J-03 | review5 triggers | After 5 reviews | ✅ (Session 70) All 3 users have this square |
| J-04 | streak3 triggers | After 3 correct in a row | ✅ (Session 70) EN→PT, NL→EN have this |
| J-05 | fillBlank triggers | After fill-blank exercise | ✅ (Session 70) EN→PT has this square |
| J-06 | multipleChoice triggers | After MC exercise | ✅ (Session 70) EN→PT has this square |
| J-07 | addContext triggers | Capture with memory context | ✅ (Session 70) EN→PT has this square |
| J-08 | workWord triggers | Review work category word | ✅ (Session 70) EN→PT, NL→EN have this |
| J-09 | socialWord triggers | Review social category word | ✅ (Session 70) EN→PT, EN→SV have this |
| J-10 | masterWord triggers | Word reaches 3 correct sessions | ⚠️ Can't test (needs 3 sessions >2h apart) |
| J-11 | finishSession triggers | Complete daily goal | ✅ (Session 70) EN→PT has this square |
| J-12 | Bingo line detection | Row/column/diagonal highlighted | ✅ (Session 70) EN→PT shows "You completed a line today" |
| J-13 | Daily reset | Board resets at midnight | ⚠️ Can't test (needs time travel) |

### Section K: Boss Round (8 tests)

| ID | Test | Expected | Status |
|----|------|----------|--------|
| K-01 | Not available before goal | Hidden when < 10 reviews | ⚠️ Can't test (goals complete) |
| K-02 | Appears after goal | Prompt visible | ✅ (Session 70) "Let's go!" button visible |
| K-03 | Shows 5 hardest words | Sorted by lapseCount | ✅ (Session 70) Shows 1/5 to 5/5 progression |
| K-04 | 90-second timer | Countdown visible | ✅ (Session 70) Timer shows 1:29 → countdown |
| K-05 | Reveal/rate flow | Answer shown, score updates | ✅ (Session 70) Reveal → "Didn't know"/"Got it!" |
| K-06 | Results display | Score, time, accuracy | ✅ (Session 70) "Perfect! 5/5, 100% in 1:08" |
| K-07 | Personal best tracking | Updates when beaten | ✅ (Session 70) EN→SV shows "Best: 5/5" |
| K-08 | Cancel mid-round | Returns to prompt | ⚠️ Not tested

---

## Phase 4: FSRS Scientific Validation

### Section L: FSRS Algorithm (10 tests)

| ID | Test | Expected | Status |
|----|------|----------|--------|
| L-01 | New word scheduling | Due immediately | ⬜ |
| L-02 | First review "Good" | Interval ~1 day | ⬜ |
| L-03 | Interval growth | Each "Good" increases interval | ⬜ |
| L-04 | "Again" resets | Stability decreases, short interval | ⬜ |
| L-05 | Lapse count increments | After wrong answer | ⬜ |
| L-06 | Mastery progress | consecutiveCorrectSessions tracks | ⬜ |
| L-07 | 3 sessions to master | Different sessions > 2h apart | ⬜ |
| L-08 | Session separation | Same-day doesn't count double | ⬜ |
| L-09 | Mastery loss | Wrong after mastered resets | ⬜ |
| L-10 | Daily new card limit | Max 15 new cards/day | ⬜ |

---

## Phase 5: Multi-Language Verification

### Section M: EN→PT (Portuguese Learner)

| ID | Test | Expected | Status |
|----|------|----------|--------|
| M-01 | Capture "olá" | Translation: "hello" | ⬜ |
| M-02 | Review shows Portuguese | Word in PT, answer in EN | ⬜ |
| M-03 | MC options in English | Native language options | ⬜ |
| M-04 | EU Portuguese audio | pt-PT pronunciation | ⬜ |
| M-05 | Notebook title | "Your Portuguese Journal" | ⬜ |

### Section N: EN→SV (Swedish Learner)

| ID | Test | Expected | Status |
|----|------|----------|--------|
| N-01 | Capture "hej" | Translation: "hi" | ⬜ |
| N-02 | Review shows Swedish | Word in SV, answer in EN | ⬜ |
| N-03 | MC options in English | Native language options | ⬜ |
| N-04 | Swedish audio | SV pronunciation | ⬜ |
| N-05 | Notebook title | "Your Swedish Journal" | ⬜ |

### Section O: NL→EN (English Learner)

| ID | Test | Expected | Status |
|----|------|----------|--------|
| O-01 | Capture "meeting" | Translation: "vergadering" | ⬜ |
| O-02 | Review shows English | Word in EN, answer in NL | ⬜ |
| O-03 | MC options in Dutch | Native language options | ⬜ |
| O-04 | English audio | EN pronunciation | ⬜ |
| O-05 | Notebook title | "Your English Journal" | ⬜ |

---

## Phase 6: Integration & Edge Cases

### Section P: Audio System (5 tests)

| ID | Test | Expected | Status |
|----|------|----------|--------|
| P-01 | Audio generates on capture | Audio URL stored | ⬜ |
| P-02 | Audio plays in notebook | Playback works | ⬜ |
| P-03 | Audio plays in review | Playback works | ⬜ |
| P-04 | Audio retry on failure | Retry button visible | ⬜ |
| P-05 | Audio caching | Offline playback (PWA) | ⬜ |

### Section Q: Error Handling (5 tests)

| ID | Test | Expected | Status |
|----|------|----------|--------|
| Q-01 | Network timeout | Clear error message | ⬜ |
| Q-02 | 401 redirect | Goes to sign-in | ⬜ |
| Q-03 | Rate limit (429) | "Limit reached" message | ⬜ |
| Q-04 | Invalid language | Validation error | ⬜ |
| Q-05 | Empty review queue | "All caught up" shown | ⬜ |

### Section R: Performance (5 tests)

| ID | Test | Expected | Status |
|----|------|----------|--------|
| R-01 | Capture latency | < 3 seconds | ⬜ |
| R-02 | Review page load | < 2 seconds | ⬜ |
| R-03 | Notebook with 500+ words | No timeout | ⬜ |
| R-04 | Session race condition | No duplicate sessions | ⬜ |
| R-05 | Concurrent tab safety | No duplicate records | ⬜ |

---

## Test Execution Protocol

### Pre-Test Setup
```bash
# 1. Reset test accounts (clears existing data)
cd web && npx tsx scripts/create-test-users.ts

# 2. Verify build passes
npm run build

# 3. Run unit tests
npm run test:run
```

### Test Accounts
| Account | Direction | Password |
|---------|-----------|----------|
| `test-en-pt@llyli.test` | EN→PT | `TestPassword123!` |
| `test-en-sv@llyli.test` | EN→SV | `TestPassword123!` |
| `test-nl-en@llyli.test` | NL→EN | `TestPassword123!` |

### During Testing
1. Test ONE section at a time
2. Mark status: ⬜ → ✅ (pass) or ❌ (fail)
3. Screenshot failures
4. Document blockers in `findings.md`

### After Testing
1. Update this document
2. Update `MVP_AUDIT.md`
3. Create GitHub issues for failures
4. Update `PROJECT_LOG.md`

---

## Related GitHub Issues

### Session Issues
| Session | Issue | Description |
|---------|-------|-------------|
| Master | #80 | MVP Launch Master Tracker |
| S1 | #81 | Bug Fixes (#77, #78) |
| S2 | #82 | Auth + Onboarding |
| S3 | #83 | Capture + Notebook |
| S4 | #84 | Review System |
| S5 | #85 | Gamification |
| S6 | #86 | FSRS Scientific |
| S7 | #87 | Multi-Language |
| S8 | #88 | Integration + Final |

### Must Fix Before MVP
| Issue | Title | Priority | Status |
|-------|-------|----------|--------|
| #77 | Progress Page 500 Error | P1 | OPEN |
| #78 | Bingo Squares Not Tracking | P1 | OPEN |

### Post-MVP Backlog
| Issue | Title | Priority |
|-------|-------|----------|
| #23 | iOS App Store Submission | P1 |
| #67 | Sentence word selection cap | P2 |
| #73 | Memory Context Improvements | P3 |
| #49 | PWA Install Banner | P2 |
| #42 | German→Portuguese support | P2 |
| #20 | Default Categories | P2 |
| #53 | Google Sign-In | P2 |
| #54 | Apple Sign-In | P2 |

---

## Definition of Done

### Test PASSES when:
1. Action completes successfully
2. Expected result matches actual
3. No console errors
4. Works across all 3 language pairs
5. Works on mobile viewport

### Test FAILS when:
1. Action fails or errors
2. Expected ≠ actual result
3. Console errors present
4. Language-specific failure
5. Mobile viewport broken

### MVP is READY when:
- [ ] 100% of Phase 1 bugs fixed
- [ ] 100% of Phase 2-3 tests pass
- [ ] 80%+ of Phase 4-6 tests pass
- [ ] All 3 language pairs verified
- [ ] No P0/P1 bugs open

---

## Summary Statistics

| Phase | Tests | Pass | Fail | Can't Test | Notes |
|-------|-------|------|------|------------|-------|
| 1. Bug Fixes | 3 | 3 | 0 | 0 | S1 complete |
| 2. Core Features | 62 | 54 | 0 | 0 | S2, S3, S4 complete |
| 3. Gamification | 31 | 19 | 0 | 7 | S5 complete (7 need time/multi-day) |
| 4. FSRS Scientific | 10 | 0 | 0 | 10 | S6 pending |
| 5. Multi-Language | 15 | 0 | 0 | 15 | S7 pending |
| 6. Integration | 15 | 0 | 0 | 15 | S8 pending |
| **TOTAL** | **136** | **76** | **0** | **47** | **Sessions 1-5 complete** |

**Current Readiness: ~56% verified (76/136 tests pass)**

### S5 Gamification Multi-User Results (Session 70)

| User | Goal | Streak | Bingo | Boss Round |
|------|------|--------|-------|------------|
| EN→PT | 36/10 ✅ | 3 days | 8/9 | 5/5 Perfect |
| EN→SV | 20/10 ✅ | 1 day | 2/9 | 5/5 Best |
| NL→EN | 5/10 | 0 days | 3/9 | N/A |

---

## Claude Session Breakdown

To maximize effectiveness, the MVP verification is broken into **8 focused sessions**. Each session has a specific goal, estimated time, and clear deliverables.

---

### Session S1: Bug Fixes (#77, #78)
**Estimated Time:** 1-2 hours
**Prerequisite:** None
**Focus:** Fix blocking bugs before E2E testing

**Tasks:**
1. Investigate and fix Progress Page 500 error (#77)
   - Check SQL query compatibility
   - Add error handling
   - Test with all 3 accounts
2. Investigate and fix Bingo tracking (#78)
   - Trace event emission flow
   - Verify bingo state persistence
   - Test all 9 square triggers

**Deliverables:**
- [ ] #77 closed
- [ ] #78 closed
- [ ] findings.md updated

**Completion Command:**
```bash
cd web && npm run build && npm run test:run
# Then E2E verify both fixes
```

---

### Session S2: Authentication & Onboarding (12 tests)
**Estimated Time:** 45 minutes
**Prerequisite:** S1 complete
**Focus:** Section A + B

**Tasks:**
1. Test auth flow for all 3 accounts (A-01 to A-05)
2. Reset one account and test full onboarding (B-01 to B-07)
3. Verify starter words injection

**Test Accounts to Use:**
- Auth tests: All 3 accounts
- Onboarding: Reset `test-en-pt@llyli.test`

**Deliverables:**
- [ ] 12 tests marked ✅/❌
- [ ] Screenshots of any failures

---

### Session S3: Word Capture & Notebook (22 tests)
**Estimated Time:** 1 hour
**Prerequisite:** S2 complete
**Focus:** Section C + D

**Tasks:**
1. Capture words in both directions (C-01 to C-12)
2. Verify memory context capture
3. Test notebook features (D-01 to D-10)
4. Test search functionality

**Test Accounts to Use:**
- Capture: `test-en-pt@llyli.test`
- Verify bidirectional: All 3 accounts

**Deliverables:**
- [ ] 22 tests marked ✅/❌
- [ ] Memory context flow verified
- [ ] Notebook screenshots

---

### Session S4: Review System (20 tests)
**Estimated Time:** 1 hour
**Prerequisite:** S3 complete (words exist)
**Focus:** Section E + F

**Tasks:**
1. Word mode review (E-01 to E-08)
2. Sentence mode review (F-01 to F-12)
3. Verify exercise difficulty progression
4. Test session limits

**Test Accounts to Use:**
- `test-en-pt@llyli.test` (has most words)

**Pre-Test Setup:**
```sql
-- Force words to be due
UPDATE words
SET next_review_date = NOW() - INTERVAL '1 day'
WHERE user_id = 'YOUR-USER-ID';
```

**Deliverables:**
- [ ] 20 tests marked ✅/❌
- [ ] Review flow screenshots

---

### Session S5: Gamification System (26 tests)
**Estimated Time:** 1-1.5 hours
**Prerequisite:** S4 complete
**Focus:** Section H + I + J + K

**Tasks:**
1. Daily progress (H-01 to H-05)
2. Streak system (I-01 to I-05)
3. Bingo board - all 9 squares (J-01 to J-13)
4. Boss Round (K-01 to K-08)

**Test Accounts to Use:**
- Primary: `test-en-pt@llyli.test`
- Streak tests may need date manipulation or waiting

**Special Requirements:**
- Complete full daily goal (10 reviews)
- Trigger each bingo square individually
- Complete Boss Round after goal

**Deliverables:**
- [ ] 26 tests marked ✅/❌
- [ ] Bingo completion screenshots
- [ ] Boss Round results

---

### Session S6: FSRS Scientific Validation (10 tests)
**Estimated Time:** 1 hour (or simulated)
**Prerequisite:** S4 complete
**Focus:** Section L

**Tasks:**
1. New word scheduling (L-01)
2. Interval growth (L-02 to L-03)
3. Lapse handling (L-04 to L-05)
4. Mastery progression (L-06 to L-09)
5. Daily new card limit (L-10)

**Test Approach:**
Can be done via:
1. **Manual multi-day testing** - Ideal but time-consuming
2. **Database inspection** - Query FSRS parameters after reviews
3. **Unit test verification** - Check ts-fsrs logic

**Database Verification:**
```sql
SELECT original_text, stability, difficulty,
       retrievability, next_review_date,
       review_count, consecutive_correct_sessions,
       lapse_count, mastery_status
FROM words
WHERE user_id = 'YOUR-USER-ID'
ORDER BY next_review_date;
```

**Deliverables:**
- [ ] 10 tests marked ✅/❌
- [ ] FSRS parameter screenshots

---

### Session S7: Multi-Language Verification (15 tests)
**Estimated Time:** 45 minutes
**Prerequisite:** S2 complete
**Focus:** Section M + N + O

**Tasks:**
1. EN→PT verification (M-01 to M-05)
2. EN→SV verification (N-01 to N-05)
3. NL→EN verification (O-01 to O-05)

**Critical Checks:**
- Correct language shown in each case
- No language mixing
- Native language = user's first language
- Target language = language being learned

**Test Flow per Account:**
1. Sign in
2. Capture one word in each direction
3. Verify translations
4. Start review, check languages
5. Check notebook title

**Deliverables:**
- [ ] 15 tests marked ✅/❌
- [ ] Language direction verification screenshots
- [ ] Audio playback verified

---

### Session S8: Integration, Edge Cases & Final Verification (23 tests)
**Estimated Time:** 1 hour
**Prerequisite:** S1-S7 complete
**Focus:** Section P + Q + R + Today Dashboard (G)

**Tasks:**
1. Audio system (P-01 to P-05)
2. Error handling (Q-01 to Q-05)
3. Performance tests (R-01 to R-05)
4. Today dashboard (G-01 to G-08)
5. Final pass through all pages

**Special Tests:**
- Offline mode (PWA)
- Rate limit testing
- Large dataset performance

**Deliverables:**
- [ ] 23 tests marked ✅/❌
- [ ] Performance timing documented
- [ ] Final MVP readiness report

---

## Session Dependency Chart

```
S1 (Bug Fixes)
    ↓
S2 (Auth + Onboarding)
    ↓
S3 (Capture + Notebook)
    ↓
S4 (Review System)
    ↓
 ┌──┴──┐
S5    S6
(Gamification) (FSRS)
 └──┬──┘
    ↓
S7 (Multi-Language)
    ↓
S8 (Integration + Final)
```

---

## Session Tracking Table

| Session | Issue | Focus | Tests | Est. Time | Status |
|---------|-------|-------|-------|-----------|--------|
| S1 | #81 | Bug Fixes | 3 | 1-2h | ✅ CLOSED |
| S2 | #82 | Auth + Onboarding | 12 | 45m | ✅ CLOSED |
| S3 | #83 | Capture + Notebook | 22 | 1h | ✅ CLOSED |
| S4 | #84 | Review System | 20 | 1h | ✅ CLOSED |
| S5 | #85 | Gamification | 26 | 1-1.5h | ✅ CLOSED (Session 70) |
| S6 | #86 | FSRS Scientific | 10 | 1h | ⬜ NEXT |
| S7 | #87 | Multi-Language | 15 | 45m | ⬜ |
| S8 | #88 | Integration | 23 | 1h | ⬜ |
| **Total** | | | **131** | **~8h** | **5/8 complete** |

---

## Quick Start for Each Session

### Starting a Session
```
User: "Let's run session S[X] from MVP_LAUNCH_TASK_PLAN.md"

Claude should:
1. Read docs/testing/MVP_LAUNCH_TASK_PLAN.md
2. Focus on the specific section tests
3. Use Playwright MCP for E2E
4. Update test statuses in the document
5. Create GitHub issues for failures
```

### Session Completion Checklist
After EACH session:
- [ ] All tests for that session marked ✅ or ❌
- [ ] Any failures documented in findings.md
- [ ] GitHub issues created for blockers
- [ ] Session status updated in tracking table
- [ ] PROJECT_LOG.md entry added

---

*Document created: 2026-01-22*
*Last updated: 2026-01-22*
