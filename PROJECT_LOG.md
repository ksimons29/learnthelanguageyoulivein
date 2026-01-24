# LLYLI Project Log

> Single source of truth for project status and history.

**📋 Archiving Rule**: Keep only the **10 most recent sessions** in this file. When adding a new session pushes the count above 10, archive the oldest sessions to `PROJECT_LOG_ARCHIVE.md` in compressed format (one paragraph per session, key files list).

## Quick Start
```bash
cd web && npm run dev     # localhost:3000
npm run build             # Production build
```

## Current Status

### Recently Completed
- [x] **NL→EN Starter Vocabulary** - Dutch speakers learning English now receive 12 starter words during onboarding (Session 80, Issue #97)
- [x] **API Usage Analytics Dashboard** - Full OpenAI cost tracking for translation, TTS, language detection, and sentence generation. Table + indexes created, all API calls instrumented (Session 78)
- [x] **Duplicate Word Capture Prevention** - API returns 409 Conflict if word already in notebook, case-insensitive check (Session 77)
- [x] **MVP E2E Testing Complete** - 48/70 steps verified (69%), all critical flows pass (Session 76-77)
- [x] **Gamification Data Reset Fix** - Test user script now clears all gamification data (daily_progress, streaks, bingo, boss_round) (Session 75)
- [x] **Sentence Pre-Generation for Starter Words** - Background sentence generation after starter word injection, Work category fix (Session 64)
- [x] **Sentence Display in Word Detail** - SentenceHistory component shows practice sentences in Notebook word details (Session 61)
- [x] **Memory Context E2E Tests** - 5 test cases verified, documentation created (Session 61)
- [x] **Comprehensive Audit Implementation** - Database indexes, session race condition fix, rate limiting, language validation, network timeout, N+1 query fix, admin query parallelization, polling memory leak fix (Session 52)
- [x] **Gamification Automated Testing** - 186+ tests, work category starter words, Boss Round ready data (Session 50)
- [x] **API 500 Error Fixes** - Safe destructuring, empty array guard, OpenAI retry logic, TOCTOU race conditions (Session 49)
- [x] **UX Review Bug Fixes** - Duplicate MC options, untranslatable words, PROJECT_LOG archiving (Session 48)
- [x] **Critical Review System Fixes** - 6 major bugs: due count, sentence priority, language consistency, active recall, session limits, UI polish (Session 45)
- [x] **Language Auto-Detection + B2 Level** - Smart language detection, idiom handling, B2-level sentences (Session 43)
- [x] **E2E Bug Fixes** - Fixed sentence generation language bug, added /capture auth protection (Session 42)
- [x] **Pre-Launch Review** - Added notebook word search, "Words That Connect" science section, updated starter words messaging, D4-D6 test cases (Session 41)
- [x] **Launch Plan Implementation** - Fixed 4 bugs, transformed notebook into personal journal, added audio timeout/retry, input validation (Session 40)
- [x] **Global Feedback Button** - Coral ribbon-style feedback button visible on all main pages, removed from info menu (Session 38)
- [x] **User Feedback Form** - In-app feedback form with bug reports, feature requests, and general feedback accessible via About sheet (Session 35)
- [x] **Personal Memory Journal** - Memory context feature lets users add WHERE/WHEN context to captures, with display in notebook and review (Session 34)
- [x] **Science Page** - Added `/science` page explaining LLYLI's research-backed approach, accessible via InfoButton sheet (Session 33)
- [x] **Sign Out + Bug Fixes** - Added Sign Out to About sheet, fixed Bingo labels, synced Progress streak with gamification (Session 32)
- [x] **Vercel Deployment Fix** - Root Directory config fixed, no more duplicate/failing deployments (Session 31)
- [x] **Language Filtering + E2E Testing** - Fixed OR logic for word queries, added English to target languages, verified all 3 test users (Session 30)
- [x] **Project Documentation + Onboarding Flow** - README.md, GitHub issue prioritization, restored capture step (Session 29)

### In Progress
- [ ] **Product Tours (Driver.js)** - Planned and broken into 12 issues (#102-#113). Blocked by #91. Start with infrastructure (#102) after bug fix. Track via #114.
- [ ] **Sentence generation** - Backend works, review integration exists, needs E2E testing
- [ ] **PWA offline caching** - Basic setup done, needs testing
- [ ] **iOS App Store** - Capacitor setup complete, needs submission

### Not Started
- **Stripe payments** - Post-MVP priority
- **Speech input** - Voice capture for iOS app (post-MVP)

## Key Files
| File | Purpose |
|------|---------|
| `README.md` | Project overview, tech stack, quick start guide |
| `docs/go-live/README.md` | **★ Go-live documentation with screenshots** |
| `docs/go-live/LLYLI-App-Journey.pptx` | PowerPoint presentation (13 slides) |
| `docs/product/product_guide.md` | Comprehensive product explanation, onboarding, gamification |
| `docs/design/user_research_synthesis.md` | Survey analysis (24 respondents), personas, gap analysis |
| `web/src/lib/config/languages.ts` | Language config, SUPPORTED_DIRECTIONS, validation |
| `web/src/lib/config/memory-context.ts` | Memory context types, situation tags, helpers |
| `web/src/components/notebook/sentence-history.tsx` | Practice sentences display in word detail |
| `web/src/app/api/words/[id]/sentences/route.ts` | API for fetching sentences containing a word |
| `docs/product/features/MEMORY_CONTEXT.md` | Memory Context feature documentation |
| `web/src/lib/db/schema/user-feedback.ts` | User feedback schema for bug reports and feature requests |
| `web/src/lib/db/schema/words.ts` | Words table with sourceLang, targetLang columns |
| `web/src/lib/data/starter-vocabulary.ts` | Curated starter words for 7 target languages (pt-PT, sv, es, fr, de, nl, en) |
| `web/src/app/api/onboarding/starter-words/route.ts` | API to inject starter words during onboarding |
| `web/src/lib/store/gamification-store.ts` | Gamification state management |
| `web/src/lib/db/schema/gamification.ts` | Daily progress, streaks, bingo tables |
| `web/src/app/api/gamification/` | Gamification API endpoints |
| `web/src/components/gamification/` | Bingo board, boss round UI |
| `web/src/app/review/page.tsx` | Review session (needs sentence integration) |
| `web/src/lib/sentences/generator.ts` | Sentence generation with Unicode validation |
| `web/src/lib/tours/hooks/use-tour.ts` | React hook for tour state management |

## Open Bugs

### Priority: Next Session
| Issue | Description | Priority | Notes |
|-------|-------------|----------|-------|
| #91 | Report issue button for words in review | P1-High | **BLOCKING** product tours implementation |

### Under Investigation
| Issue | Description | Status | Notes |
|-------|-------------|--------|-------|
| - | - | - | No other bugs under investigation |

### Recently Closed Bugs
| Issue | Description | Fixed In |
|-------|-------------|----------|
| #97 | NL→EN has no starter vocabulary | Session 80, `2076213` |
| #95 | Gamification data not reset with test users | Session 75 |
| #77 | Progress 500 error | Session 67, `86523a0` |
| #78 | Bingo squares not tracking | Session 66, `5e661fe` |

| Issue | Description | Fixed In |
|-------|-------------|----------|
| #60-62 | Language direction, focus word, missing options | Sessions 54-55 |
| #63-66 | Due count, duplicates, inbox, captured today | Sessions 57-60 |
| #68-69 | Same-word answer, crash on close | Sessions 56, 58 |
| #44 | Progress API 500 error | Session 20 (verified) |

### Open Enhancements (Not Bugs)
| Issue | Priority | Notes |
|-------|----------|-------|
| #67 | P2 | Word selection capped at 2 - enhancement |
| #23 | P1-high | iOS App Store submission |
| #20 | P2 | Default categories |

### Closed This Session (Session 60)
- ~~#66~~ **P1-High** - Fixed: Notebook Inbox was passing 'inbox' as category filter but inbox isn't a DB category. Added special handling in /api/words to filter by reviewCount=0 + createdAt >= 24h ago
- ~~#65~~ **P1-High** - Verified working: Captured Today persists correctly after navigation. No bug found during E2E testing

### Closed Previous Session (Session 59)
- ~~#64~~ **P1-High** - Fixed: Review queue shuffle - added priority band shuffling for variety while maintaining FSRS priority

### Closed Session 58
- ~~#69~~ **P0-Critical** - Fixed: Crash on close review - null guards + race condition fix
- ~~#63~~ **Closed** - Due count mismatch (closed on GitHub this session, fixed Session 57)

### Previously Closed (Session 57)
- ~~#63~~ **P0-Critical** - Fixed: Due count mismatch - Today page now fetches from `/api/words/stats` (same source as Notebook)

### Previously Closed (Session 56)
- ~~#68~~ **P0-BLOCKER** - Fixed: Word review showed same word as answer for native→target captures

### Previously Closed (Session 55)
- ~~#61~~ **P0-BLOCKER** - Fixed: Focus word mismatch - created single source of truth for which word is being tested
- ~~#62~~ **P0-BLOCKER** - Fixed: Correct answer missing from options - now loads distractors for focusWord

### Older Fixes
- ~~#60~~ **P0-BLOCKER** - Fixed: Language direction via language-aware text helpers (Session 54)
- ~~#57~~ **P2-normal** - Fixed: Audio generation reliability (~15% failure rate) - retry logic, language bug, timeout handling (Session 51)
- ~~#52~~ **P3-low** - Fixed: Auth redirect - unauthenticated users now redirect to sign-in (Session 37)
- ~~#43~~ **BLOCKER** - Fixed: Language filtering via shared helper in all word queries
- ~~#50~~ **P0-critical** - Fixed: E2E User Flow Verification - all 3 test users pass (Session 30)

## Open Feature Issues

### Product Tours (In Progress)
| Issue | Feature | Priority | Status |
|-------|---------|----------|--------|
| #114 | **Master tracker** for product tours | P2-normal | ⬜ Blocked by #91 |
| #102 | Tours-1: Core infrastructure (Driver.js) | P2-normal | ✅ Done |
| #103 | Tours-2: DB columns for completion | P2-normal | ✅ Done |
| #104 | Tours-3: API routes for progress | P2-normal | ✅ Done |
| #105 | Tours-4: useTour React hook | P2-normal | ✅ Done (Session 81) |
| #106-#113 | Tours-5 to Tours-12 (page tours) | P2-normal | ⬜ Ready |

### Other Features
| Issue | Feature | Priority |
|-------|---------|----------|
| #73 | Memory Context improvements (gamification, visual feedback) | P3-low |
| #51 | Review page misleading for unauth users | P2-normal |
| #23 | iOS App Store submission | P1-high |
| #49 | PWA Install Banner | P2-normal |
| #42 | German → Portuguese support | P2-normal |
| #20 | Default Categories | P2-normal |
| #46 | Yearly goal tracking (1000 words/year) | P3-low/post-mvp |
| #47 | iOS Home Screen widget | P3-low/post-mvp |
| #48 | Social accountability features | P3-low/post-mvp |
| #35 | Story Run Frame | post-mvp |
| #36 | Category Hunt | post-mvp |
| #37 | Real Life Mission Check-in | post-mvp |
| #41 | More language pairs | P3-low/post-mvp |
| - | Speech input for iOS capture | post-mvp |

---

## Session Log

### Session 81 - 2026-01-24 - Create useTour Hook (Issue #105)

**Focus:** Implement React hook for tour state management as part of Driver.js product tours infrastructure.

**Tasks Completed:**
1. ✅ Created `useTour` hook at `web/src/lib/tours/hooks/use-tour.ts`
2. ✅ Hook fetches tour completion status from `/api/tours/progress` on mount
3. ✅ Provides `startTour()` to trigger tour via `tourManager`
4. ✅ Provides `markTourComplete()` to persist completion to database
5. ✅ Loading/error state handling following `useOnboardingStatus` pattern
6. ✅ Updated `web/src/lib/tours/index.ts` to export hook
7. ✅ Build passes, 317 unit tests pass

**Files Changed:**
- `web/src/lib/tours/hooks/use-tour.ts` (NEW)
- `web/src/lib/tours/index.ts` (updated exports)

**Unblocks:** Issues #106-#113 (page-specific tour implementations)

---

### Session 80 - 2026-01-23 - Fix NL→EN Starter Vocabulary (Issue #97)

**Focus:** Production-first bug fix for Dutch speakers learning English who received no starter words.

**Root Cause:** `TargetLanguage` type in `starter-vocabulary.ts` excluded `'en'`, so `getStarterWords('en')` returned `undefined`.

**Tasks Completed:**
1. ✅ Verified production gate (test-en-pt user: "Your Portuguese Journal" ✓)
2. ✅ Confirmed bug: `TargetLanguage` type missing `'en'`
3. ✅ Added 12 English starter words with Dutch translations
4. ✅ Added `'en'` to test suite `supportedLanguages` array
5. ✅ Added 3 regression tests for Issue #97
6. ✅ E2E verified: test-nl-en shows "Your English Journal" + Work category
7. ✅ Updated TESTING.md with starter vocabulary verification steps

**Files Changed:**
| File | Change |
|------|--------|
| `web/src/lib/data/starter-vocabulary.ts` | Added `'en'` to type, added 12 English words |
| `web/src/__tests__/lib/starter-vocabulary.test.ts` | Added English to test coverage (+15 tests) |
| `docs/engineering/TESTING.md` | Added starter vocabulary verification steps |

**Test Results:**
- Build: ✅ PASSED
- Unit tests: ✅ 317 passing (was 302)
- E2E: ✅ NL→EN user verified on production

**Commits:**
- `2076213` - fix(#97): add English starter vocabulary for NL→EN users
- `faca944` - docs: add starter vocabulary verification to testing guide

**Issues Closed:** #97

---

### Session 79 - 2026-01-23 - Product Tours Planning & Issue Breakdown

**Focus:** Plan Driver.js product tour implementation to address Issue #93 (UX-04: App explanation/intro section).

**Tasks Completed:**
1. ✅ Analyzed PRD, MVP audit, existing onboarding flow, and design system
2. ✅ Evaluated Driver.js vs alternatives (Shepherd.js, Intro.js, Reactour)
3. ✅ Created comprehensive technical specification in Issue #101
4. ✅ Broke down epic into 12 focused, Claude-optimized issues (#102-#113)
5. ✅ Created master tracker issue (#114) with progress dashboard
6. ✅ Closed epic #101 with breakdown comment linking to all sub-issues

**Issues Created:**
| Issue | Title | Time | Phase |
|-------|-------|------|-------|
| #102 | Setup Driver.js core infrastructure | 1h | Infrastructure |
| #103 | Add database schema | 30m | Infrastructure |
| #104 | Create API routes | 45m | Infrastructure |
| #105 | Create React hook | 45m | Infrastructure |
| #106 | Today Dashboard tour | 1h | Tours |
| #107 | Capture tour | 45m | Tours |
| #108 | Review tour | 1h | Tours |
| #109 | Notebook tour | 45m | Tours |
| #110 | Progress tour | 30m | Tours |
| #111 | Feedback widget integration | 1h | Integration |
| #112 | E2E testing | 2h | QA |
| #113 | Documentation updates | 30m | QA |
| #114 | Master tracker | - | Meta |

**Decision Rationale:**
- **Driver.js selected** over alternatives for: 5KB size, mobile-first design, Moleskine customization, MIT license
- **Feedback widget integration** instead of separate help button for cleaner UX
- **Progressive disclosure** strategy - tours appear as users explore, not all at once
- **Basics only** approach - core loop explanation, skip advanced features

**Implementation Strategy:**
- Phase 1 (Infrastructure): #102-#105 sequential (3 hours)
- Phase 2 (Tours): #106-#110 parallel (4 hours, can run simultaneously)
- Phase 3 (Integration): #111 (1 hour)
- Phase 4 (QA): #112-#113 sequential (2.5 hours)
- **Total:** ~10.5 hours

**Blocking Issue:**
- Issue #91 must be fixed first (P1-High: Report issue button for words in review)

**Next Steps:**
1. Close this session
2. Start next session with Issue #91
3. After #91 fixed, proceed with tours starting at #102
4. Track progress using GitHub issues and #114 master tracker

**Files Created:**
- None (planning only - no code written this session)

**Related Issues:**
- Addresses #93 (UX-04: App explanation/intro section)
- Supersedes #101 (original epic, closed in favor of breakdown)

---

### Session 78 - 2026-01-23 - API Usage Analytics Dashboard

**Focus:** Implement comprehensive API usage tracking for cost monitoring.

**Tasks Completed:**
1. ✅ Created `api_usage_log` table with proper schema and indexes
2. ✅ Instrumented translation API with `withGPTUsageTracking()`
3. ✅ Instrumented language detection API with `withGPTUsageTracking()`
4. ✅ Instrumented TTS API with `withTTSUsageTracking()`
5. ✅ Instrumented sentence generation API with `withGPTUsageTracking()`
6. ✅ Full end-to-end verification passed

**Files Changed/Created:**
| File | Change |
|------|--------|
| `web/src/lib/db/schema/api-usage.ts` | New schema for API usage tracking |
| `web/src/lib/api-usage/logger.ts` | Helper functions for usage tracking |
| `web/src/app/api/words/route.ts` | Instrumented translation, language detection, TTS |
| `web/src/lib/audio/tts.ts` | Instrumented TTS generation |
| `web/src/lib/sentences/generator.ts` | Instrumented sentence generation |
| `web/src/app/api/sentences/generate/route.ts` | Pass userId for tracking |
| `web/src/app/api/admin/stats/route.ts` | Already had queries (from Session 77) |
| `web/scripts/create-api-usage-table.ts` | Safe migration script |
| `web/scripts/verify-api-usage-setup.ts` | End-to-end verification script |

**Technical Notes:**
- Used direct postgres migration instead of drizzle-kit push (timeout issues)
- Fire-and-forget logging pattern - won't crash on errors
- Cost calculated using Jan 2025 pricing: GPT-4o-mini $0.15/$0.60 per 1M tokens, TTS-1 $15/1M chars

**Admin Dashboard Features:**
- Total API calls by type (translation, TTS, sentence generation, language detection)
- Token usage breakdown
- Cost tracking (today, 7d, 30d, total)
- Success/failure rates
- Per-user average cost

---

### Session 77 - 2026-01-23 - MVP E2E Completion + Bug Fixes

**Focus:** Complete MVP E2E testing, fix remaining P2 issues, prepare for launch.

**Tasks Completed:**
1. ✅ E2E testing - 48/70 steps verified (69%), all critical flows pass
2. ✅ Fixed P2 #15 - Duplicate word capture now blocked with 409 Conflict
3. ✅ Created GitHub #99 for P1 #7a distractor quality (deferred post-MVP)
4. ✅ P2 #6 (word limit) confirmed as intentional design per GitHub #67

**E2E Test Results (Session 76-77):**
| Flow | Status |
|------|--------|
| Authentication | ✅ 3/4 pass |
| Phrase Capture | ✅ 6/7 pass |
| Basic Flashcard Review | ✅ 7/8 pass |
| Sentence Review | ⚠️ 5/9 pass (2 known P2s) |
| Notebook Browser | ✅ 7/8 pass |
| Today Dashboard | ✅ 5/5 pass |
| Progress Tracking | ✅ 5/5 pass |
| Audio Playback | ✅ 3/5 pass |
| Gamification | ✅ 7/10 pass |

**Files Changed:**
| File | Change |
|------|--------|
| `web/src/app/api/words/route.ts` | Block duplicates with 409 Conflict |
| `findings.md` | Marked #15 as fixed |
| `MVP_AUDIT.md` | Updated status, session notes |

**MVP Status:** Ready for launch - 0 blockers, 2 known P2 enhancements

---

### Session 75 - 2026-01-23 - Fix Gamification Data Reset (#95) + E2E Verification

**Focus:** Fix test user reset script to clear gamification data, verify Finding #16 (multi-word fill-blank).

**Issues Fixed:**
- **#95** - Gamification data not reset with test users

**Root Cause:**
`create-test-users.ts` script deleted words but not gamification tables. Test accounts had stale gamification state (streaks, bingo progress, boss round history) from previous sessions.

**Fix Applied:**
Added DELETE statements for all gamification tables in `create-test-users.ts`:
- `daily_progress` - Daily goal progress
- `streak_state` - Streak info
- `bingo_state` - Bingo board state
- `boss_round_history` - Boss round history
- `review_sessions` - Review session history
- `generated_sentences` - Sentences (reference deleted words)

**E2E Verification:**
- ✅ Script cleans all gamification data (verified via DB query)
- ✅ Test accounts reset: 0/10 daily goal, 0 streak, 0/9 bingo
- ✅ Multi-word phrases work in word review: "Bom dia", "Um café", "A conta, por favor"
- ✅ Sentence multiple-choice exercises work correctly
- ✅ Finding #16 unit tests (9 tests) pass - multi-word blanking logic verified

**Files Changed:**
| File | Change |
|------|--------|
| `web/scripts/create-test-users.ts` | Added gamification data cleanup |

**Tests:**
- ✅ Build passes
- ✅ 302 unit tests pass
- ✅ Script execution verified

**Closes:** #95

---

### Session 73 - 2026-01-22 - S5: Gamification Simulation Tests (#90)

**Focus:** Create comprehensive database simulation tests for gamification features (streaks, daily progress, bingo, boss round).

**Problem Statement:**
From MVP_LAUNCH_TEST_PLAN.md: "S5 Gamification tests are BLOCKED - requires simulation tests" because they need:
- Fresh users with no history
- Time passage (24-48+ hours)
- Specific state conditions (streak breaks, bingo lines)

**Solution: Time Manipulation via Backdated Records**

Created `web/scripts/test-gamification-simulation.ts` following the pattern from `test-fsrs-simulation.ts`.

**Test Categories (30 tests):**

| Section | Tests | Description |
|---------|-------|-------------|
| 2.1 Daily Progress | 5 | Initial state, increment, goal complete, completedAt, persistence |
| 2.2 Streak System | 5 | New streak, increment, break after miss, freeze available, preservation |
| 2.3 Daily Bingo | 11 | Initial state, 8 square types, bingo line detection, partial line rejection |
| 2.4 Boss Round | 9 | Lock/unlock, word selection, high lapse count, results, accuracy, personal best, improvement, perfect |

**Key Implementation Details:**
- Uses raw `postgres` client (not Drizzle ORM) for direct SQL
- Proper JSONB handling with `db.json()` helper for PostgreSQL arrays
- Date manipulation via `getDateOnly()` and `daysAgo()` helpers
- Test user: `test-en-sv@llyli.test` (consistent with FSRS simulation)
- Cleanup before/after to ensure test isolation

**Bug Fix During Implementation:**
Initial JSONB insertion used `JSON.stringify()` causing double-stringification. Fixed by using `db.json()` helper from postgres library.

**Files Created:**
| File | Description |
|------|-------------|
| `web/scripts/test-gamification-simulation.ts` | 30 gamification simulation tests |

**Test Results:**
- ✅ Build passes
- ✅ 293 unit tests pass
- ✅ 30/30 simulation tests pass

**Documentation Updated:**
| File | Change |
|------|--------|
| `docs/testing/MVP_LAUNCH_TEST_PLAN.md` | Updated Part 2 with all results, status summary |

**S5 Status Update:**
| Metric | Before | After |
|--------|--------|-------|
| Gamification tests | 0/18 (blocked) | 22/22 ✅ |
| Total MVP tests | 76/86 pass | 98/90 pass |

**E2E Verification (All 3 User Personas):**

| User | Direction | Daily Goal | Streak | Bingo | Boss Round |
|------|-----------|------------|--------|-------|------------|
| test-en-pt | EN→PT | 36/10 ✅ | 3 days | 8/9 (Bingo!) | 5/5 best |
| test-en-sv | EN→SV | 0/10 | 0 | 0/9 | N/A |
| test-nl-en | NL→EN | 5/10 | 0 | 3/9 | N/A |

All gamification features render correctly across all language directions.

**Closes:** #90

---

### Session 74 - 2026-01-22 - Boss Round E2E + C-06 Investigation

**Focus:** E2E verification of Boss Round UI and C-06 situation tags investigation.

**Test User:** test-en-pt@llyli.test (EN→PT)

#### Part 1: Boss Round E2E

**Test Flow:**
1. Sign in → Complete 11-word review session
2. Reach /review/complete → Daily goal complete (11/10)
3. Boss Round prompt appears with personal stats
4. Start Boss Round → Test full flow

**Boss Round E2E Results:**

| Test | Observation | Result |
|------|-------------|--------|
| Prompt appearance | Shows after daily goal complete | ✅ |
| Personal stats | Best: 5/5, Attempts: 1, Perfect: 1 | ✅ |
| Timer start | Starts at 1:30 (90 seconds) | ✅ |
| Timer countdown | Updates every second (1:28, 1:19...) | ✅ |
| Word display | Shows "Prazo" (target language) | ✅ |
| Reveal button | Click reveals "Deadline" (native) | ✅ |
| Self-grade | "Got it!" increments score (0 → 1) | ✅ |
| Progress tracking | 1/5 → 2/5 → ... → 5/5 | ✅ |
| Results modal | "Perfect! 5/5 - 100% accuracy in 0:30" | ✅ |

**Screenshot:** `.playwright-mcp/boss-round-results-perfect.png`

#### Part 2: C-06 Situation Tags Investigation

**Issue:** C-06 marked as "⚠️ investigate" - situation tags may not persist

**Test Procedure:**
1. Capture "biblioteca" with memory context
2. Select location: "at the university"
3. Select situation tags: "Alone" + "Outdoor"
4. Save word → Navigate to Notebook
5. Open word detail sheet

**Result: Situation tags ARE persisting correctly!**

Word detail shows:
- Context: "at the university · evening"
- Tags: "Alone" and "Outdoor" ✅

**Conclusion:** C-06 was a false positive. Feature working correctly.

**Screenshot:** `.playwright-mcp/situation-tags-persisted.png`

**Files Updated:**
| File | Change |
|------|--------|
| `docs/testing/MVP_LAUNCH_TEST_PLAN.md` | Boss Round E2E, C-06 verified ✅ |

**Test Status Update:**
| Metric | Before | After |
|--------|--------|-------|
| Boss Round E2E | 0/9 | 9/9 ✅ |
| Gamification total | 22/22 | 31/31 ✅ |
| C-06 Tags | ⚠️ investigate | ✅ verified |

---

### Session 72 - 2026-01-22 - S6: FSRS Scientific Verification Tests

**Focus:** Create comprehensive tests for FSRS-4.5 spaced repetition algorithm - the scientific foundation of LLYLI.

**Problem Statement:**
From status update feedback: "S6 (FSRS) is untested - This is the scientific claim of your app. '36 years newer than most apps' means nothing if you haven't verified the algorithm actually works."

**Solution: Two-Pronged Testing Approach**

**1. Unit Tests (53 tests) - `web/src/__tests__/lib/fsrs.test.ts`**
| Test Category | Tests | What's Verified |
|---------------|-------|-----------------|
| calculateRetrievability | 6 | Forgetting curve math: R(t) = (1 + t/(9·S))^(-1) |
| daysBetween | 5 | Date utility edge cases |
| isDue | 5 | Due word detection at 90% threshold |
| toFsrsRating | 4 | Rating enum conversion |
| wordToCard | 5 | Word → FSRS card transformation |
| processReview - stability | 3 | Stability increases/decreases |
| processReview - lapse | 3 | lapseCount tracking |
| processReview - mastery | 8 | Session separation, 3-session rule |
| processReview - dates | 2 | Next review scheduling |
| getNextReviewText | 5 | Human-readable intervals |
| Scientific Properties | 6 | End-to-end FSRS behavior |

**2. Database Simulation Script - `web/scripts/test-fsrs-simulation.ts`**
Simulates 7-day learning cycle by backdating timestamps:
| Simulated Day | Tests |
|---------------|-------|
| Day 1 | New word scheduling, first review, stability increase |
| Day 2 | Due words appear, interval growth verification |
| Day 3-4 | Lapse handling (Again), stability decrease, recovery |
| Day 5-7 | Mastery progression, session separation, mastery loss |

**Key Scientific Properties Verified:**
1. ✅ R = 90% when elapsed days = stability (forgetting curve)
2. ✅ Stability increases on Good/Easy ratings
3. ✅ Stability decreases on Again rating (lapse)
4. ✅ Intervals grow (not fixed) with repeated Good ratings
5. ✅ Mastery requires 3 correct sessions (not same session)
6. ✅ Hard rating resets mastery (treated as incorrect)
7. ✅ Lapse resets mastery completely

**Files Created:**
| File | Description |
|------|-------------|
| `web/src/__tests__/lib/fsrs.test.ts` | 53 unit tests for FSRS algorithm |
| `web/scripts/test-fsrs-simulation.ts` | 7-day database simulation |

**Test Results:**
- ✅ Build passes
- ✅ 293 unit tests pass (53 new FSRS tests)
- ✅ 16/16 simulation tests pass

**S6 Status Update:**
| Test | Previous | Now |
|------|----------|-----|
| FSRS unit tests | ⬜ 0 | ✅ 53 |
| Interval growth verification | ⬜ | ✅ |
| Mastery session separation | ⬜ | ✅ |
| Lapse handling | ⬜ | ✅ |

**S5 Gamification: Instructions Created**
- Instructions: `docs/testing/GAMIFICATION_SIMULATION_INSTRUCTIONS.md`
- GitHub Issue: #90
- Next session: Implement `test-gamification-simulation.ts`

---

### Session 70 - 2026-01-22 - Fix Fill-in-Blank Multi-Word Blanking (Finding #16)

**Focus:** Fix P1 bug where fill-in-blank exercises didn't show blanked words for multi-word phrases.

**Root Cause:**
Multi-word phrases like "Bom dia" were not blanked because the comparison `blankedWord === cleanWord`
fails when comparing `"bom dia"` (phrase) to `"bom"` (single word from sentence split).

**Fix Applied:**
Changed blanking logic in `sentence-card.tsx` to split the blanked phrase and check if ANY part matches:
```typescript
blankedWord.toLowerCase().split(' ').some(
  part => part.replace(/[.,!?;:]/g, '') === cleanWord
)
```

**Files Changed:**
| File | Change |
|------|--------|
| `web/src/components/review/sentence-card.tsx` | Fixed multi-word blanking logic |
| `web/src/__tests__/components/sentence-card.test.tsx` | NEW: 9 unit tests for blanking |
| `findings.md` | Updated #16 status to FIXED |

**Tests:**
- ✅ Build passes
- ✅ 240 unit tests pass (9 new)
- New tests cover: "Bom dia", "Quanto custa?", "A conta, por favor", case-insensitivity

**Closes:** Finding #16

---

### Session 69 - 2026-01-22 - S3: Word Capture & Notebook Tests (#83)

**Focus:** MVP Launch Testing - Section C (Word Capture) and Section D (Notebook).

**Test Results:**

**Section C: Word Capture (10/12 ✅, 2 ⚠️)**
| Test | Result |
|------|--------|
| C-01: Target phrase (PT→EN) | ✅ "padaria" → "bakery" |
| C-02: Native phrase (EN→PT) | ✅ "supermarket" → "supermercado" |
| C-03: Auto-categorization | ✅ Food & Dining assigned |
| C-04: TTS audio | ✅ Generated within 5s |
| C-05: Location context | ✅ "at the ice cream shop in Belém" |
| C-06: Situation tags | ⚠️ May not persist (investigate) |
| C-07: Personal note | ✅ Saved and displayed |
| C-08: Time auto-detect | ✅ "evening" detected |
| C-10: Duplicate handling | ⚠️ Duplicates allowed (no prevention) |
| C-11: Untranslatable | ✅ "saudade" → "nostalgic longing" |
| C-12: Performance | ✅ < 3 seconds |

**Section D: Notebook (10/10 ✅)**
| Test | Result |
|------|--------|
| D-01: Journal title | ✅ "Your Portuguese Journal" |
| D-02: Word count | ✅ Correct (18 words) |
| D-03: Category counts | ✅ All categories accurate |
| D-04: Due count | ✅ Matches Today (17) |
| D-05: Inbox | ✅ New phrases shown |
| D-06: Word detail | ✅ Full details visible |
| D-07: Memory context | ✅ Location, time, note |
| D-08: Sentences | ✅ (if available) |
| D-09: Search | ✅ Found "sorvete" |
| D-10: Delete | ✅ Word removed, counts updated |

**Bonus:** Bingo went 5/9 → 6/9 (addContext square completed!)

**Known Issues Found:**
1. **C-06**: Situation tags may not persist after selection
2. **C-10**: Duplicate words not prevented - no deduplication

**Files Changed:**
| File | Change |
|------|--------|
| `docs/testing/MVP_LAUNCH_TEST_PLAN.md` | Updated with S3 results |

**Closes:** #83

---

### Session 68 - 2026-01-22 - S2: Authentication & Onboarding Tests (#82)

**Focus:** MVP Launch Testing - Section A (Authentication) and Section B (Onboarding).

**Test Results:**
- Authentication (5/5 ✅): Sign in, persistence, sign out, protected routes, invalid credentials
- Onboarding (7/7 ✅): Fresh redirect, language selection, initial capture, counter, dual buttons, starter words, redirect

**Closes:** #82 (details in MVP_LAUNCH_TEST_PLAN.md)

---

> **Archive**: Sessions 1-67 in [PROJECT_LOG_ARCHIVE.md](./PROJECT_LOG_ARCHIVE.md)
