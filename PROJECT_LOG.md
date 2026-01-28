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
- [x] **Semantic Multiple Choice Distractors + Onboarding Text Fix (#99, #166) (Session 112)** - Implemented AI-generated semantic distractors for multiple choice exercises. New words now get 4-5 semantically related alternatives generated at capture time via GPT-4o-mini (e.g., "stamps" → ["letters", "envelopes", "postcards", "packages"]). Added `distractors` text array column to words table. Background generation follows fire-and-forget pattern matching example sentences. Review logic checks for stored distractors first, falls back to category-based for older words. Also fixed #166: Updated onboarding completion text from "greetings, thanks, and common requests" to "from everyday situations to local essentials you'll use right away" to match actual starter vocabulary. E2E verified: capture → distractors stored → review flow works. 459 tests pass.
- [x] **Memory Context Overflow on Mobile Fix (#168) (Session 111)** - Fixed capture sheet overflow on mobile (375x667 viewport) when memory context accordion is expanded. Previously, "What will help you remember?" field and "Save to Notebook" button were cut off with no scroll. Fix: Added `max-h-[80vh] overflow-y-auto` to `#capture-sheet` container in `capture/page.tsx:219`, matching established pattern from `word-detail-sheet.tsx:125`. E2E verified via Playwright: accordion expansion at mobile viewport shows all content scrollable, Save button accessible after scrolling (scrollHeight 890px, scrollTop 356px). Build passes.
- [x] **Today Tour Missing Steps and Wrong Targets Fix (#165) (Session 110)** - Fixed three issues in Today dashboard tour: (1) **Capture step wrong target**: Changed from `#nav-capture` (bottom nav) to `#tour-capture-fab` (red FAB button), updated description to "Tap the red + button...". (2) **Added Feedback step**: New step 6 targeting `#feedback-button` with "Share Your Feedback" - helps users discover bug reporting. (3) **Added Progress step**: New step 9 targeting `#nav-progress` with "Track Your Progress" - explains learning stats. Tour now has 10 steps (was 8). E2E verified all steps via Playwright: Welcome → Words to Practice → Daily Goal → Daily Bingo → Learn About LLYLI → Share Your Feedback → Capture Words Anytime → Practice with AI Sentences → Track Your Progress → Navigate Your Notebook. All target elements confirmed present. Build passes, 459 tests pass.
- [x] **Audio Issues Investigation & Fix (Session 109)** - Implemented Phase 1 audio quality improvements: (1) **Duration Validation**: Added `validateAudioDuration()` in `tts.ts` to catch truncated audio before expensive Whisper verification (~16KB/sec estimation with 50% margin). (2) **Audio Issue Reporting**: New `audio_issue` feedback type with optional `wordId` FK. Created `AudioReportButton` and `AudioReportSheet` components - flag icon appears when `audioVerificationFailed=true`, opens pre-filled report sheet. (3) **Dashboard Integration**: Admin dashboard now shows audio issues with orange badge/icon. Database migration applied via script. Phase 2 items (MP3 validation, sentence verification, enhanced logging) tracked on GitHub #118. Updated #122 with testing checklist. 459 tests pass.
- [x] **Memory Context Auto-open + Structured Logging (#92, #139) (Session 108)** - Implemented two improvements: (1) **#92 Memory Context Quick Capture**: Added localStorage persistence for capture context accordion - user preference now remembered across sessions (collapsed by default for first visit, then persists user choice). (2) **#139 Structured Logging with Pino**: Created `lib/logger/` module with request context helpers, migrated all 28 API routes from `console.log/error/warn` to structured Pino logging with request IDs, user IDs, durations, and structured error objects. Pretty-print in dev, JSON in production for Vercel logs. Sensitive headers (authorization, cookie) redacted. Build passes, 459 tests pass.
- [x] **Production E2E Test - Issues #162, #163 Verified Fixed (Session 107)** - Comprehensive production E2E test for Portuguese learner (test-en-pt@llyli.test). Captured 5 English phrases that translated correctly to Portuguese. Reviewed sentences and verified: **Issue #162 FIXED** - All 5 generated sentences were 100% Portuguese with NO English mixed in (e.g., "A comida estava deliciosa, traz a conta, por favor"). **Issue #163 FIXED** - All 5 sentences were unique with no repetition. Session stats: 14 words practiced, 86% accuracy, daily goal complete. Verified Boss Round API returns expected 400 when daily goal incomplete (not a bug - UI handles gracefully). Audio timeouts are expected OpenAI TTS latency (retry button shown per #134/#135).
- [x] **Mixed Languages & Repeated Sentences Fix + Vocabulary Upgrade (Session 106)** - Fixed two P1-High bugs: #162 (mixed languages in flashcards - Portuguese sentences contained English phrases when user captured in English) and #163 (same sentences repeated consecutively). Root causes: generator used `originalText` which could be either language; `deduplicateCombinations()` existed but was never called; sentence selection was deterministic. Fixes: select correct language text based on `sourceLang`, wire up deduplication, add `ORDER BY RANDOM()`. Also increased `maxWordsPerSentence` from 4→5 for more challenging sentences. Upgraded all 7 starter vocabularies from basic tourist phrases to advanced words: discourse markers (aliás, förresten), country-specific terms (Multibanco, NIF, Swish, Personnummer), professional vocabulary, informal greetings exposing tu/du forms. 10 files changed, 459 tests pass.
- [x] **Admin Dashboard Enhancements (Session 105)** - Added metric explanations and user feedback list to admin dashboard for daily CEO/PM review. Each of 6 metrics now has "What's this?" toggle showing what it measures, how to interpret it, and when to take action. Added scrollable user feedback section with color-coded categories (Bug/Feature/Feedback/Word Issue), page context, and timestamps. Updated README with admin dashboard documentation.
- [x] **Onboarding Routing Fix (Session 104)** - Fixed redirect logic to correctly route new users through the unified onboarding flow: Languages (flags) → Reason (multi-select) → Capture → Complete (starter words). Ensures users aren't incorrectly routed to deprecated flows.
- [x] **Unit Test Coverage Expansion (Session 103)** - Added 79 new unit tests (380 → 459 total). New test files: generator-validation.test.ts (30 tests for sentence validation, Unicode/diacritics), tts-validation.test.ts (16 tests), word-matcher.test.ts (19 tests), rate-limit-check.test.ts (14 tests). Coverage: lib/fsrs 100%, lib/review 82%, lib/security 57%, exercise-type.ts 100%. Updated TESTING.md with coverage tables and "What's NOT Tested" documentation explaining why API routes and React components aren't unit tested (E2E coverage instead). GitHub issues #142, #80, #140 updated.
- [x] **Enhanced Tour Coverage (#156)** - Implemented 3 new tour enhancements: (1) Today tour: added Practice button step (#nav-practice), now 8 steps; (2) Capture tour: enhanced memory context description with actionable "Tap to expand" text; (3) Notebook tour: added first category card step (#first-category-card), now 6 steps. Added `id` prop to CategoryCard component. E2E verified all tours in production via Playwright MCP. Updated TESTING.md with mandatory Claude Code testing requirements (must read TESTING.md before every commit, must verify in production). (Session 102)
- [x] **Tour UI Improvements (#153, #154)** - Fixed tour persistence race condition with localStorage cache (tours no longer reappear after completion). Moved "Replay Tour" button inside LLYLI info sheet (cleaner UX). Added Daily Bingo tour step to Today dashboard (7 steps total). Created #156 for enhanced tour coverage (Practice, Capture memory context, Notebook card details). (Session 101)
- [x] **Rate Limit Fix for Page Loads + Test Account Reset** - Fixed middleware applying 10 req/min limit to ALL API routes, causing 429 errors on normal page loads (5-6 concurrent GET requests). Fix: Only rate-limit mutating requests (POST/PUT/DELETE/PATCH). Reset all 4 test accounts to fresh state. Updated GitHub Issue #122 with comprehensive testing personas and per-persona testing guide. (Session 100)
- [x] **Onboarding Flow Unification (#152)** - Fixed critical bug where new users were routed to wrong onboarding flow (`/auth/onboarding` instead of `/onboarding`). Unified to single 4-step flow: Languages (flags) → Goals (multi-select reasons) → Capture (3+ words) → Complete (starter words). Created `/onboarding/reason` page with multi-select "Why are you learning?". Deleted deprecated `/auth/onboarding` (484 lines). E2E verified full flow in production. (Session 99)
- [x] **Rate Limiting Production Fix (#136 cont.)** - Fixed middleware not executing: moved `middleware.ts` from `web/` to `web/src/` (Next.js requires middleware in `src/` when using `src/` directory structure). Set up Upstash Redis credentials in Vercel (fixed trailing newline in URL that caused silent failures). Verified 429 responses after 10 requests/min with proper headers. (Session 98)
- [x] **DDoS/Brute Force Rate Limiting (#136)** - Added Upstash Redis security rate limiting with 4 tiers: unauthenticated (10/min), expensive (30/min), write (60/min), read (120/min). IP-based limiting in middleware catches abuse before auth. User-based limiting in route handlers for authenticated requests. Fail-open strategy when Redis unavailable. Added 23 unit tests. (Session 97)
- [x] **Review Tour Fix + Full Mobile E2E (#147 continued)** - Fixed Review tour targeting non-existent elements (`#answer-section`, `#rating-buttons` only appear after user answers). Removed Steps 3 & 4, merged rating guidance into progress step. E2E tested all 5 tours on mobile (375×667): Review (4 steps), Today (6), Capture (4), Notebook (5), Progress (3). All tours pass on production. (Session 96)
- [x] **Progress Tour Element Targeting (#147)** - Fixed Step 3 to highlight actual streak/retention badges instead of redundant wrapper div. Added `id="streak-badges"` to CompactProgressCard, removed nested wrapper from page, updated tour to target badges with proper positioning. Verified on production at 375px viewport. (Session 95)
- [x] **Responsive Tour Fixes (#146)** - Fixed 4 tour bugs: (1) Tour shown every time → added tourStartedRef guard to all pages; (2) Mobile overlap → element scrolls to TOP, popover fixed at BOTTOM; (3) Notebook button not visible → added nav-notebook step; (4) Info button missing → added tour step. E2E verified on production. (Session 94)
- [x] **Issue #145 Portuguese (Portugal) Native Language + Alphabetical Sort** - Added pt-PT to native language selection (was hidden as default target). Languages now sorted alphabetically: Dutch, English, French, German, Portuguese (Brazil), Portuguese (Portugal), Spanish, Swedish. (Session 93)
- [x] **50-User Beta Prep** - Disabled email confirmation in Supabase to bypass 2/hour email limit. Tested new user signup flow—instant account creation, straight to onboarding. Created GitHub issues for Resend SMTP (#144) and backend scaling evaluation (#143). (Session 93)
- [x] **Issues #134 + #135 Audio Verification & Polling UX** - Combined fix for audio quality and UX issues. #134: Added `audioVerificationFailed` column to track when Whisper verification fails; shows amber warning icon on audio button. #135: Added warning thresholds at 15s ("Taking longer...") and 20s (early retry button) during audio polling. E2E verified on production: capture → timeout → retry → audio plays. (Session 92)
- [x] **Issue #130 Zustand Selector Optimization** - Fixed review page sluggishness caused by full store subscriptions. Now uses granular `useShallow` selectors grouped by update frequency (session/item/UI/feedback/actions) and `useCallback` for memoized handlers. Reduces unnecessary re-renders significantly. (Session 91)
- [x] **Issue #131 Distractor Loading Delay** - Fixed 100-500ms loading spinner on multiple-choice exercises. Distractors now pre-fetched inline in `fetchNextSentence` before state update, eliminating the async waterfall: fetch sentence → render → detect MC → fetch distractors → render. Options are now ready immediately when exercise renders. (Session 91)
- [x] **Issue #132 Batch Reviews Fix** - Fixed race condition in sentence reviews. Created `POST /api/reviews/batch` endpoint that processes all word reviews in a single transaction. Updated `submitSentenceReview` to use batch endpoint instead of 2-4 parallel calls. Benefits: single network round-trip, atomic session stats update, no partial failures. (Session 90)
- [x] **Issue #128 Race Condition Fix** - Fixed TOCTOU race condition in duplicate word detection. Added UNIQUE constraint on `(user_id, lower(original_text))` to prevent concurrent requests from creating duplicates. Cleaned 4 existing duplicates from production. Verified all 3 personas pass duplicate/case-insensitive/race tests. (Session 89)
- [x] **P0 Mobile Accessibility Fixes** - Fixed 3 critical mobile/WCAG issues from independent audit. #125: Viewport zoom enabled (maximumScale=5, userScalable=true). #126: Safe area bottom support via CSS env() for iPhone home indicator. #127: Onboarding responsive for iPhone SE (340px max-width, overflow-y-auto, mobile-first padding). Build passes, 345 tests pass. Deployed to production, verified via curl, GitHub issues closed. (Session 88)
- [x] **Issue #123 Example Sentence Display** - Fixed missing example sentences in notebook word detail sheet. Added UI display, retry logic for background generation, on-demand fallback in GET /api/words, and verified TTS for onboarding. Tested all 3 user personas on production. (Session 87)
- [x] **Issue #121 Post-Deployment Verification** - Verified fix works in production across all user personas. EN→SV confirmed working: sentence with "notan" (bill) + "vatten" (water) correctly excludes second word from options. Screenshots captured. (Session 86)
- [x] **Multiple-Choice Distractor Fix** - Fixed bug where multiple-choice options could include two valid answers when a sentence contains multiple vocabulary words from the same category (e.g., "prazo" and "reunião"). Now excludes all sentence words from distractors. E2E verified in production. (#121, Session 85)
- [x] **Fill-in-the-Blank Fix + Fuzzy Matching** - Fixed broken fill_blank UX (word now highlighted, user types English meaning) and added typo-tolerant answer validation using Levenshtein distance (1 typo/5 chars). Three-state feedback: correct (green), correct_with_typo (amber), incorrect (red). (#119, #120, Session 84)
- [x] **Product Tours Complete** - Moleskine-styled onboarding with Driver.js. 5 contextual tours (Today, Capture, Review, Notebook, Progress). Tour replay via Feedback widget. Visual polish: coral spotlight highlights, proper element targeting, nav glow effects. E2E tested all 5 steps. (#101-#116, Sessions 81-83)
- [x] **findings.md Archived** - All 18 bug findings resolved. Moved to `docs/archive/findings-2026-01-21-CLOSED.md`. Only #99 (distractor quality) remains open as post-MVP enhancement (Session 82)
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
- [ ] **Sentence generation** - Backend works, review integration exists, needs E2E testing
- [ ] **PWA offline caching** - Basic setup done, needs testing
- [ ] **iOS App Store** - Capacitor setup complete, needs submission
- [ ] **50-User Beta Test** - Ready! Email confirmation disabled. Resend SMTP setup optional ([#144](https://github.com/ksimons29/learnthelanguageyoulivein/issues/144))

### Not Started
- **Stripe payments** - Post-MVP priority
- **Speech input** - Voice capture for iOS app (post-MVP)
- **Backend scaling evaluation** - Analyze Supabase Pro vs alternatives for iOS launch ([#143](https://github.com/ksimons29/learnthelanguageyoulivein/issues/143))

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
| `web/src/lib/db/schema/user-feedback.ts` | User feedback schema (bug_report, feature_request, audio_issue, word_issue) |
| `web/src/components/audio/audio-report-button.tsx` | Flag button for reporting audio issues on words |
| `web/src/lib/audio/tts.ts` | TTS generation with Whisper verification and duration validation |
| `web/src/lib/logger/index.ts` | Pino logger configuration with request ID generation |
| `web/src/lib/logger/api-logger.ts` | API route logging helper with request context |
| `web/src/app/admin/page.tsx` | Admin dashboard with metrics, explanations, and feedback list |
| `web/src/lib/db/schema/words.ts` | Words table with sourceLang, targetLang columns |
| `web/src/lib/data/starter-vocabulary.ts` | Curated starter words for 7 target languages (pt-PT, sv, es, fr, de, nl, en) |
| `web/src/app/api/onboarding/starter-words/route.ts` | API to inject starter words during onboarding |
| `web/src/lib/store/gamification-store.ts` | Gamification state management |
| `web/src/lib/db/schema/gamification.ts` | Daily progress, streaks, bingo tables |
| `web/src/app/api/gamification/` | Gamification API endpoints |
| `web/src/components/gamification/` | Bingo board, boss round UI |
| `web/src/app/review/page.tsx` | Review session (needs sentence integration) |
| `web/src/lib/review/answer-evaluation.ts` | Fuzzy answer matching with Levenshtein distance |
| `web/src/lib/sentences/generator.ts` | Sentence generation with Unicode validation |
| `web/src/lib/tours/hooks/use-tour.ts` | React hook for tour state management |
| `web/src/lib/audio/tts.ts` | TTS with verified audio generation (Whisper transcription check) |
| `web/src/lib/sentences/example-sentence.ts` | Example sentence generation for word captures |
| `web/scripts/backfill-example-sentences.ts` | Backfill script for missing example sentences |
| `web/scripts/test-example-sentence-reliability.ts` | Reliability test for sentence generation |
| `web/src/middleware.ts` | Next.js middleware: rate limiting for mutations, session handling |
| `web/src/lib/security/rate-limiter.ts` | Upstash Redis rate limiter with 4 tiers |
| `web/src/lib/security/rate-limit-check.ts` | API helper for rate limit checks, 429 responses |
| `web/scripts/reset-user-account.ts` | Reset test account to fresh state (words, sentences, gamification) |

## Open Bugs

### Priority: Next Session
| Issue | Description | Priority | Notes |
|-------|-------------|----------|-------|
| #146 | Responsive tour - element and popover visible together on mobile | P1-high | May still have edge cases on small screens |

### Under Investigation
| Issue | Description | Status | Notes |
|-------|-------------|--------|-------|
| - | - | - | No bugs under investigation |

### Recently Closed Bugs
| Issue | Description | Fixed In |
|-------|-------------|----------|
| #165 | Today tour missing Feedback/Progress steps, Capture targets wrong element | Session 110 |
| #147 | Review tour targeting non-existent elements (answer-section, rating-buttons) | Session 96 |
| #130 | Review page sluggish (Zustand full subscriptions) | Session 91 |
| #131 | Distractor loading delay (100-500ms spinner) | Session 91 |
| #128 | Race condition in duplicate word detection | Session 89 |
| #125 | Viewport zoom disabled (WCAG violation) | Session 88 |
| #126 | Bottom nav missing safe area (iPhone home indicator) | Session 88 |
| #127 | Onboarding breaks on iPhone SE (375px) | Session 88 |
| #123 | Example sentences not showing in notebook word detail sheet | Session 87 |
| #121 | Multiple valid answers in sentence-based multiple-choice | Session 85, verified Session 86 |
| #119 | Fill-in-the-blank shows invisible word, expects Portuguese answer | Session 84 |
| #120 | No typo tolerance in answer validation | Session 84 |
| #117 | Tour dialog doesn't close after clicking "Got it!" | Session 83 |
| #116 | Bottom nav highlights need better visibility | Session 83 |
| #115 | Tour overlay highlights wrong elements, button text unclear | Session 83 |
| #91 | Report issue button for words in review | Session 81 |
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

**P0-Critical (MVP Blocking):**
| Issue | Title | Notes |
|-------|-------|-------|
| #138 | 📱 Complete Mobile Device Testing | iPhone 16 Chrome is primary target |
| #142 | 🗺️ MVP Launch Master Roadmap | Tracking issue |

**P1-High (Pre-Launch):**
| Issue | Title | Notes |
|-------|-------|-------|
| #122 | 📋 Manual Testing Checklist | Post bug-fix verification |
| #137 | 📊 Add Error Telemetry (Sentry) | Post-launch monitoring |
| #141 | 🍎 iOS Pre-Submission Checklist | Week 3+ |
| #99 | Distractor quality | Semantic relevance (post-MVP) |
| #23 | iOS App Store Submission | Epic |

**P2-Normal:**
| Issue | Title |
|-------|-------|
| #139 | Structured Logging (Pino/Winston) |
| #140 | Playwright E2E Test Suite |
| #158 | PWA Offline Behavior Audit |
| #92 | Memory context quick capture UX |
| #42 | German → Portuguese support |
| #20 | Default Categories |

**P3-Low / Post-MVP:**
| Issue | Title |
|-------|-------|
| #155 | Reposition info icon |
| #154 | Tour replay button |
| #151 | Configurable sentence length |
| #144 | Resend SMTP for beta |
| #143 | Backend scaling options |
| #118 | Hybrid TTS for iOS |
| #98 | Notifications/nudges |
| #73 | Memory Context Improvements |
| #54 | Apple Sign-In |
| #53 | Google Sign-In |
| #48, #47, #46 | Social features, widget, yearly goals |
| #41, #35-37 | More languages, gamification expansions |

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
| #114 | **Master tracker** for product tours | P2-normal | 🔄 In Progress (9/12 done) |
| #102 | Tours-1: Core infrastructure (Driver.js) | P2-normal | ✅ Done |
| #103 | Tours-2: DB columns for completion | P2-normal | ✅ Done |
| #104 | Tours-3: API routes for progress | P2-normal | ✅ Done |
| #105 | Tours-4: useTour React hook | P2-normal | ✅ Done (Session 81) |
| #106 | Tours-5: Today Dashboard tour | P2-normal | ✅ Done (Session 81) |
| #107 | Tours-6: Capture tour | P2-normal | ✅ Done (Session 82) |
| #108 | Tours-7: Review tour | P2-normal | ✅ Done (Session 82) |
| #109 | Tours-8: Notebook tour | P2-normal | ✅ Done (Session 82) |
| #110 | Tours-9: Progress tour | P2-normal | ✅ Done (Session 82) |
| #111-#113 | Tours-10 to Tours-12 (remaining) | P2-normal | ⬜ Ready |

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

### Session 86 - 2026-01-25 - Post-Deployment Verification (#121)

**Focus:** Verify Issue #121 fix works in production across all user personas.

**Verification Results:**

| Persona | Account | Review Mode | Fix Verified |
|---------|---------|-------------|--------------|
| EN→PT | test-en-pt@llyli.test | Recall only (11 items) | ⚠️ No sentence-mode MC available |
| **EN→SV** | test-en-sv@llyli.test | **Sentence + MC (15 items)** | **✅ Fix confirmed!** |
| NL→EN | test-nl-en@llyli.test | Recall only (3 items) | ⚠️ Too few words for sentence-mode |

**Evidence from EN→SV:**

**Example 1:** "Här är notan, tack. Kan jag få ett vatten?"
- Contains: "notan" (bill) + "vatten" (water)
- Options shown: "coffee break...", "A coffee", "The bill, please"
- **"A water" correctly excluded** ✅

**Example 2:** "Kan vi dela notan efter vår fika, tack?"
- Contains: "notan" (bill) + "fika" (coffee break)
- Options shown: "coffee break...", "A water", "A coffee"
- **"The bill, please" correctly excluded** ✅

**Screenshots:**
- `fix-verified-en-sv-no-duplicate-answers.png`
- `fix-verified-en-sv-second-example.png`

**Conclusion:** Issue #121 fix confirmed working in production. Sentence words are correctly excluded from multiple-choice distractors.

---

---

### Session 89 - 2026-01-26 - Race Condition Fix (#128)

**Focus:** Fix TOCTOU race condition that allowed duplicate words under concurrent requests.

**Issue #128 - Race Condition in Duplicate Word Detection:**
- **Problem:** Check-then-insert pattern had a gap where two concurrent requests could both pass the duplicate check before either inserted
- **Evidence:** Found 4 existing duplicates in production: "obrigado", "bom dia", "tack" (x2)
- **Root Cause:** Application-level check (SELECT) and INSERT weren't atomic

**Fix:**
| Change | File |
|--------|------|
| Add `uniqueIndex` on `(user_id, lower(original_text))` | `web/src/lib/db/schema/words.ts` |
| Wrap INSERT in try-catch, return 409 on constraint violation | `web/src/app/api/words/route.ts` |
| SQL migration for production | `supabase/migrations/20260126_fix_word_duplicate_race_condition.sql` |

**Database Work:**
- Cleaned 4 existing duplicates (92 → 88 words)
- Applied unique constraint via custom script

**Test Results (All Personas):**
| Persona | Duplicate Block | Case-Insensitive | Race Condition |
|---------|-----------------|------------------|----------------|
| EN→PT | ✅ | ✅ | ✅ |
| EN→SV | ✅ | ✅ | ✅ |
| NL→EN | ✅ | ✅ | ✅ |

**Scripts Created:**
- `scripts/check-duplicate-words.js` - Verify no duplicates exist
- `scripts/cleanup-duplicate-words.js` - Clean up duplicates
- `scripts/apply-unique-constraint.js` - Apply unique index
- `scripts/test-duplicate-prevention.js` - Test all scenarios

**Commits:**
- `1034e8b` - fix(#128): prevent duplicate words with database constraint

**Closes:** #128

---

---

### Session 90 - 2026-01-26 - Batch Reviews Fix (#132)

**Focus:** Fix race condition in sentence reviews by batching all word reviews in a single transaction.

**Issue #132 - Sentence Reviews Race Condition:**
- **Problem:** Sentence reviews submitted 2-4 parallel POST requests (one per word), causing race conditions on session stats
- **Fix:** Created `POST /api/reviews/batch` endpoint for atomic batch processing

**Commits:**
- `9bbb714` - fix(#132): batch sentence reviews to prevent race conditions

**Closes:** #132

---

---

### Session 91 - 2026-01-26 - Review Performance Fixes (#130, #131)

**Focus:** Two performance fixes for the review page - eliminate distractor loading delay and reduce unnecessary re-renders.

**Issue #131 - Distractor Loading Delay:**
- **Problem:** Multiple-choice options were fetched on-demand via useEffect after sentence loaded, causing 100-500ms delay and visible spinner
- **Root Cause:** Async waterfall: `fetchNextSentence` → state update → render → useEffect detects MC → `loadDistractors` → state update → render
- **Fix:** Inline distractor fetch in `fetchNextSentence` before state update

**Issue #130 - Zustand Subscription Performance:**
- **Problem:** Review page destructured 20+ properties from `useReviewStore()`, causing full re-render on ANY state change
- **Root Cause:** Zustand creates a subscription that triggers re-render when any selected state changes
- **Fix:** Use `useShallow` selectors grouped by update frequency + `useCallback` for handlers

**Changes:**

| Change | File |
|--------|------|
| Add `multipleChoiceOptions`, `correctOptionId` to store | `web/src/lib/store/review-store.ts` |
| Inline distractor fetch in `fetchNextSentence` | `web/src/lib/store/review-store.ts` |
| Use `useShallow` selectors (5 groups) | `web/src/app/review/page.tsx` |
| Memoize handlers with `useCallback` | `web/src/app/review/page.tsx` |

**Selector Groups:**
1. Session state (stable during session): sessionId, dueWords, languages
2. Current item state (changes per card): currentIndex, reviewMode, sentence, options
3. UI state (frequent changes): reviewState, isLoading, error
4. Feedback state (after grading): lastRating, mastery, wordsReviewed
5. Actions (stable references): all store functions

**Verification:**
- Build passes
- 357 tests pass
- Manual E2E test: full review flow working

**Commits:**
- `ffbc824` - fix(#131): prefetch distractors inline to eliminate loading delay
- `c0df168` - perf(#130): use Zustand selectors to reduce review page re-renders

**Closes:** #130, #131

---

---

### Session 92 - 2026-01-26 - Audio Verification & Polling UX (#134, #135)

**Focus:** Combined fix for two audio-related issues from the review session bug list.

**Issue #134 - Audio Verification Failure Silent:**
- **Problem:** When Whisper verification fails after 3 attempts, `generateVerifiedAudio` returned unverified audio without any indication
- **Root Cause:** Function returned `Buffer` directly, silently degrading quality without flagging it
- **Fix:** Changed return type to `{ buffer, verified }`, added `audioVerificationFailed` column to track status, show amber warning icon in UI

**Issue #135 - Audio Polling UX:**
- **Problem:** Users waited up to 30s with just a spinner before seeing any feedback
- **Fix:** Added warning thresholds: 15s shows "Taking longer...", 20s shows early retry button while still polling

**Changes:**

| Change | File |
|--------|------|
| Add `audioVerificationFailed` column | `web/src/lib/db/schema/words.ts` |
| Return `{ buffer, verified }` from TTS | `web/src/lib/audio/tts.ts` |
| Store verification status in DB | `web/src/app/api/words/route.ts` + 2 other routes |
| Add warning thresholds (15s, 20s) | `web/src/lib/audio/polling-config.ts` |
| Track `audioWarningIds`, `audioShowRetryIds` | `web/src/lib/store/words-store.ts` |
| Show warning badge on AudioPlayButton | `web/src/components/audio/audio-play-button.tsx` |
| Pass verification/warning props | `phrase-card.tsx`, `word-card.tsx` |

**E2E Testing:**
- Captured test word "computador" on production
- Observed timeout → retry button appeared
- Clicked retry → audio generated successfully
- Verified playback works

---

---

### Session 94 - 2026-01-26 - Responsive Tour Fixes (#146)

**Focus:** Fixed 4 tour bugs that degraded mobile onboarding experience.

**Issues Fixed:**

1. **Tour shown every time** (not just first sign-in)
   - Root cause: Missing `useRef` guard in page components
   - Fix: Added `tourStartedRef` pattern to capture, notebook, progress, review pages

2. **Mobile overlap - element and popover not visible together**
   - Root cause: Driver.js positions popover relative to element, but on mobile there's not enough room
   - Fix: Two-part responsive strategy:
     - JS: Elements scroll to TOP on mobile (`block: "start"`), CENTER on desktop
     - CSS: Popover becomes fixed bottom sheet on mobile (<640px)

3. **Notebook button not visible during explanation**
   - Fix: Added `#nav-notebook` step as first step of notebook tour

4. **Info button explanation missing**
   - Fix: Added `#tour-info-button` ID and "Learn About LLYLI" tour step

**Changes:**

| Change | File |
|--------|------|
| tourStartedRef guard | `capture/page.tsx`, `notebook/page.tsx`, `progress/page.tsx`, `review/page.tsx` |
| Auto-enhance steps with scroll | `tour-manager.ts` |
| isMobileScreen(), responsive scroll | `driver-config.ts` |
| Mobile bottom sheet CSS | `driver-moleskine.css` |
| Nav item IDs | `bottom-nav.tsx` |
| Info button ID | `info-button.tsx` |
| Updated tour steps | `today-tour.ts`, `notebook-tour.ts`, `progress-tour.ts` |

**E2E Testing:**
- Verified on production at 375px (iPhone SE) viewport
- Step 2 "Words to Review": Element at TOP, popover below, both visible ✅
- All 357 unit tests passing

---

---

### Session 95 - 2026-01-26 - Progress Tour Element Targeting (#147)

**Focus:** Fix Progress tour Step 3 to highlight actual streak badges instead of redundant wrapper.

**Issue #147 - Progress Tour Element Targeting:**
- **Problem:** Step 3 targeted `#streak-section` which was a wrapper div around the entire card, not the actual streak badges
- **Root Cause:** The `#streak-section` ID was on a redundant nested div, making the tour highlight unclear
- **Fix:** Target `#streak-badges` - the actual streak count and retention percentage badges in the card header

**Changes:**

| Change | File |
|--------|------|
| Add `id="streak-badges"` to badge container | `compact-progress-card.tsx` |
| Remove redundant `#streak-section` wrapper | `progress/page.tsx` |
| Update Step 3 element selector + positioning | `progress-tour.ts` |

**Tour Step 3 Updates:**
- Element: `#streak-section` → `#streak-badges`
- Title: "Build Consistency" → "Track Your Consistency"
- Side: `top` → `bottom` (badges are at top of card)
- Align: `center` → `end` (badges are right-aligned)

**Verification:**
- ✅ Build: PASSED
- ✅ Unit tests: 357 passing
- ✅ Production: `#streak-badges` exists with correct content (streak "1", retention "73%")
- ✅ Old `#streak-section` wrapper removed

**Commits:**
- `0c47723` - fix(#147): improve Progress tour streak badge targeting

**Closes:** #147

---

---

### Session 97 - 2026-01-27 - DDoS/Brute Force Rate Limiting (#136)

**Focus:** Add frequency-based rate limiting using Upstash Redis to protect against DDoS attacks and brute force attempts.

**Architecture:**
- **Hybrid approach:** Per-route helper function (primary) + middleware fallback
- **Separate from subscription limits:** This is security rate limiting, not the existing 50 words/day quota
- **Fail-open strategy:** When Redis unavailable, requests allowed through (subscription limits still apply)

**Rate Limit Tiers:**
| Tier | Requests/min | Use Cases |
|------|-------------|-----------|
| `unauthenticated` | 10 | IP-based, catches brute force before auth |
| `expensive` | 30 | POST /api/words (OpenAI ~$0.02/call) |
| `write` | 60 | POST /api/reviews, /api/feedback |
| `read` | 120 | All GET endpoints |

**Files Created:**
| File | Purpose |
|------|---------|
| `web/src/lib/security/rate-limiter.ts` | Core rate limiter with Upstash Redis, tier configs, sliding window |
| `web/src/lib/security/rate-limit-check.ts` | API helper, builds 429 responses with X-RateLimit-* headers |
| `web/src/__tests__/lib/security/rate-limiter.test.ts` | 23 unit tests for fail-open, tier configs, response format |

**Files Modified:**
| File | Change |
|------|--------|
| `web/middleware.ts` | Added IP-based rate check before auth |
| `web/src/app/api/words/route.ts` | Added `expensive` tier check after auth |
| `web/src/app/api/reviews/route.ts` | Added `write` tier check after auth |
| `web/package.json` | Added `@upstash/ratelimit`, `@upstash/redis` |

**Response Format (matches existing rateLimitResponse):**
```json
{
  "error": "Too many requests",
  "code": "RATE_LIMIT_EXCEEDED",
  "details": { "limit": 30, "remaining": 0, "resetsAt": "..." }
}
```
Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After`

**Environment Variables Required:**
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

**Verification:**
- ✅ Build: PASSED
- ✅ Unit tests: 380 passing (23 new rate limiter tests)
- ⬜ Production: Needs Upstash env vars added to Vercel

**Commits:**
- `848db79` - feat(#136): add DDoS/brute force rate limiting with Upstash Redis

**Closes:** #136

---

---

### Session 99 - 2026-01-27 - Onboarding Flow Unification (#152)

**Focus:** Fix critical bug where new users were routed to wrong onboarding flow, missing flags, capture step, and starter words.

**Root Cause:**
Two separate onboarding flows existed in parallel:
- `/auth/onboarding` - OLD: text lists, no capture, no starter words
- `/onboarding/languages` - NEW: flag stamps, capture step, starter words

Entry points (`auth/callback`, `sign-up`) were never updated to point to the new flow.

**Changes:**

| File | Change |
|------|--------|
| `auth/callback/route.ts` | Redirect `/auth/onboarding` → `/onboarding` |
| `auth/sign-up/page.tsx` | Redirect `/auth/onboarding` → `/onboarding` |
| `onboarding/reason/page.tsx` | **NEW** - Multi-select "Why are you learning?" |
| `api/onboarding/reason/route.ts` | **NEW** - Stores reasons as JSON array |
| `onboarding/languages/page.tsx` | Updated flow: languages → reason (was → capture) |
| `onboarding/capture/page.tsx` | Updated step indicators (4 steps) |
| `onboarding/complete/page.tsx` | Updated step indicators (4 steps) |
| `lib/supabase/middleware.ts` | Removed `/auth/onboarding` from allowlist |
| `auth/onboarding/page.tsx` | **DELETED** - 484 lines removed |

**New Flow (4 steps):**
1. Languages (flag stamps) → 2. Goals (multi-select) → 3. Words (capture 3+) → 4. Ready (celebration)

**Verification:**
- ✅ Build passes (380 tests)
- ✅ E2E tested full signup → onboarding → home flow in production
- ✅ Multi-select reasons working (stores as JSON array)
- ✅ Starter words seeded (12 phrases)
- ✅ User captured words + starter = 15 phrases ready

**Commits:**
- `5168478` - fix(#152): unify onboarding flow with flags, capture, starter words, multi-select reasons
- `de73681` - chore: delete deprecated /auth/onboarding page

**Closes:** #152

---

---

### Session 100 - 2026-01-27 - Rate Limit Fix + Test Account Reset

**Focus:** Fix 429 rate limit errors on page load and reset all test accounts for beta testing.

**Problem:**
The middleware applied IP-based rate limiting (10 req/min) to ALL API routes. A single page load fires 5-6 concurrent GET requests:
- `/api/onboarding/status`
- `/api/words?...`
- `/api/words/stats`
- `/api/tours/progress`
- `/api/gamification/state`

This instantly consumed half the rate limit, causing 429 errors on normal page navigation.

**Root Cause:**
The middleware's `unauthenticated` tier was designed for brute force protection but was being applied to all requests, not just auth-related write operations.

**Fix:**
Only apply middleware rate limiting to mutating requests (POST/PUT/DELETE/PATCH):
- GET requests are read-only and cheaper
- Route-level rate limiting handles authenticated reads
- DDoS protection preserved for write endpoints

**Test Account Reset:**
Reset all 4 test accounts to fresh state:
| Account | Data Deleted |
|---------|--------------|
| test-en-pt@llyli.test | 21 words, 7 sentences, 5 sessions |
| test-en-sv@llyli.test | 16 words, 8 sentences, 3 sessions |
| test-nl-en@llyli.test | 6 words, 1 sentence, 5 sessions |
| koossimons91@gmail.com | gamification data |

**GitHub Issue #122 Updated:**
- Added 3 test personas (Koos, Ralf, automated accounts)
- Per-persona testing guide with step-by-step instructions
- Account credentials table with reset status
- Complete testing flow (6 steps)
- Bug reporting instructions

**Files Modified:**
| File | Change |
|------|--------|
| `web/src/middleware.ts` | Only rate-limit POST/PUT/DELETE/PATCH requests |

**Verification:**
- ✅ Build: PASSED
- ✅ Unit tests: 380 passing (23 rate limiter tests)
- ⏳ Production: Needs deployment to verify

**Commits:**
- `1733f54` - fix: rate limit only mutating requests to prevent 429 on page load

---
