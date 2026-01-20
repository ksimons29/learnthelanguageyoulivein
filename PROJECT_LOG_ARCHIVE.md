# LLYLI Project Log - Archive

> Archived sessions 1-41. For current sessions, see [PROJECT_LOG.md](./PROJECT_LOG.md)

---

## Sessions 15-41 (2026-01-19 to 2026-01-20)

### Session 41 - Pre-Launch Review: Search, Science, UX Polish
Added debounced word search to notebook (searches both originalText and translation), added "Words That Connect" section to Science page explaining LLYLI's unique differentiator, updated starter words messaging, added D4-D6 test cases to TESTING.md.
**Files**: `notebook/page.tsx`, `science/page.tsx`, `onboarding/complete/page.tsx`, `TESTING.md`

### Session 40 - Launch Plan Implementation: Bug Fixes + Notebook Journal
Fixed 4 ship-blocking bugs: (1) race condition in review stats with atomic SQL increment, (2) wrong language sentences via getUserLanguagePreference, (3) silent review failures with Promise.allSettled, (4) auth state on review page. Transformed notebook into personal journal with JournalHeader, AttentionSection, and StatusBadge components. Added audio timeout tracking with retry.
**Files**: `api/reviews/route.ts`, `api/sentences/generate/route.ts`, `review-store.ts`, `review/page.tsx`, `journal-header.tsx`, `attention-section.tsx`, `mastery-badge.tsx`, `words-store.ts`

### Session 39 - Bug Fixes: Capture Speed, Bingo Navigation, Sentence Translations
Optimized capture flow from ~10s to ~2-4s by parallelizing translation+category and making audio non-blocking. Added click handlers to Bingo squares with SQUARE_ACTIONS mapping. Added translation column to sentences schema.
**Files**: `api/words/route.ts`, `words-store.ts`, `phrase-card.tsx`, `bingo-board.tsx`, `sentences.ts`, `api/sentences/generate/route.ts`

### Session 38 - Global Feedback Button + OAuth Setup Docs
Added coral ribbon-style FeedbackButton to all main pages, positioned on left side. Created AUTH_SETUP.md documenting Google/Apple OAuth setup for future implementation. Created issues #53-#55.
**Files**: `feedback-button.tsx`, `layout.tsx`, `info-button.tsx`, `docs/engineering/AUTH_SETUP.md`

### Session 37 - Auth Fix + Documentation Cleanup + E2E Testing
Fixed #52 auth redirect by enabling protectedPaths in middleware. Consolidated documentation (README.md 217→102 lines, web/README.md 408→56 lines). Removed outdated files. E2E verified all 3 test users.
**Files**: `middleware.ts`, `page.tsx`, `README.md`, `.gitignore`, `TESTING.md`

### Session 36 - Go-Live Preparation
Created go-live documentation with 13-slide PowerPoint presentation, 11 app screenshots, and comprehensive GitHub documentation. Added trust indicators to sign-up and onboarding complete pages.
**Files**: `docs/go-live/`, `LLYLI-App-Journey.pptx`, `sign-up/page.tsx`, `onboarding/complete/page.tsx`, `generate-presentation.ts`

### Session 35 - User Feedback Form
Implemented in-app feedback form with user_feedback table (type enum: bug_report, feature_request, general_feedback), POST /api/feedback endpoint, FeedbackSheet bottom sheet component, and "Give Feedback" button in About LLYLI sheet.
**Files**: `user-feedback.ts`, `api/feedback/route.ts`, `feedback-sheet.tsx`, `info-button.tsx`

### Session 34 - Personal Memory Journal Feature
Added Memory Context feature with 4 new columns (location_hint, time_of_day, situation_tags, personal_note). Created collapsible accordion in capture page, context display in word cards/details/review. Updated Bingo to "Add memory context" square. Added Encoding Specificity research note to Science page.
**Files**: `words.ts`, `memory-context.ts`, `capture/page.tsx`, `api/words/route.ts`, `word-card.tsx`, `word-detail-sheet.tsx`, `review/page.tsx`, `bingo-board.tsx`, `science/page.tsx`

### Session 33 - Science Page + Forecast Chart Fix
Created `/science` page explaining FSRS algorithm and learning science. Fixed forecast chart to use actual weekday names instead of "Tmrw". Documented date formatting conventions.
**Files**: `science/page.tsx`, `info-button.tsx`, `forecast-chart.tsx`, `design-system.md`, `CLAUDE.md`

### Session 32 - Deep E2E Testing, Sign Out, Progress Streak Fix
Added Sign Out button to About LLYLI sheet. Fixed Bingo labels ("MC"→"Pick", "Fill"→"Fill in the blank"). Fixed Progress streak to use streakState table. Consolidated testing docs to TESTING.md.
**Files**: `info-button.tsx`, `bingo-board.tsx`, `api/progress/route.ts`, `TESTING.md`

### Session 31 - Vercel Deployment Fix + Sentence Generation Verification
Fixed duplicate Vercel deployments by setting Root Directory = `web` in dashboard. Verified sentence generation working with ~5s average time.
**Files**: `.gitignore`

### Session 30 - Language Filtering Fix + Testing Infrastructure
Fixed critical bug where words captured in target language weren't appearing. Changed query to OR logic (sourceLang = target OR targetLang = target). Added "en" to TARGET_LANGUAGES. Created test account provisioning script.
**Files**: `api/words/route.ts`, `api/words/categories/route.ts`, `api/reviews/route.ts`, `api/progress/route.ts`, `onboarding/languages/page.tsx`, `create-test-users.ts`

### Session 29 - Project Documentation + Onboarding Flow Fix
Created comprehensive README.md. Organized GitHub issues with priority labels. Restored capture step in onboarding (was skipping to complete). Found and documented bugs #51, #52.
**Files**: `README.md`, `onboarding/languages/page.tsx`

### Session 28 - Auth Bug Fix + Improved Onboarding
Fixed email confirmation auth bug by checking session vs user in signup response. Added "Check Your Email" UI. Created starter vocabulary system with 10 curated words per language injected during onboarding.
**Files**: `sign-up/page.tsx`, `sign-in/page.tsx`, `starter-vocabulary.ts`, `api/onboarding/starter-words/route.ts`, `onboarding/languages/page.tsx`, `onboarding/complete/page.tsx`

### Session 27 - User Research Synthesis & Product Documentation
Analyzed 24-respondent survey: 75% "think I'll remember", 25% "save but never review", 25% motivation issues. Created product_guide.md and user_research_synthesis.md. Created issues #46-#48.
**Files**: `docs/product/product_guide.md`, `docs/design/user_research_synthesis.md`

### Session 26 - Go-Live Critical Bug Fixes
Fixed BLOCKER #43 (words not filtered by target_language). Created shared `getUserLanguagePreference()` helper in lib/supabase/server.ts used by 5 API routes.
**Files**: `lib/supabase/server.ts`, `api/words/route.ts`, `api/words/categories/route.ts`, `api/reviews/route.ts`, `api/progress/route.ts`, `api/sentences/next/route.ts`

### Session 25 - Go-Live E2E Testing
Comprehensive E2E testing. Found BLOCKER: words not filtered by target_language. Progress API 500 error. Database health: 924 words, 0.88 avg retrievability. Confirmed product decision: one target language per user.
**Files**: `scripts/update-lang-temp.mjs`

### Session 24 - Multi-Language Support
Added sourceLang, targetLang, translationProvider columns to words schema. Created SUPPORTED_DIRECTIONS config (en→pt-PT, nl→pt-PT, nl→en, en→sv). Created comprehensive test suite. Created issues #40-#42.
**Files**: `words.ts`, `languages.ts`, `api/words/route.ts`, `language-selector.tsx`, `test-comprehensive.ts`, `Multi_Language_Implementation.md`

### Session 23 - PROJECT_LOG Unification
Combined handoff and changelog into single PROJECT_LOG.md. Archived sessions 1-14. Updated pre-commit hook.
**Files**: `PROJECT_LOG.md`, `PROJECT_LOG_ARCHIVE.md`, `CLAUDE.md`, `pre-commit`, `session-workflow.md`

### Session 22 - Gamification MVP Implementation
Created gamification database schema (dailyProgress, streakState, bingoState). Built API endpoints for state, events, boss round. Created BingoBoard, BossRound, ProgressRing components. Fixed bugs #38, #39.
**Files**: `gamification.ts`, `gamification-store.ts`, `api/gamification/`, `bingo-board.tsx`, `boss-round.tsx`, `todays-progress.tsx`, `review/complete/page.tsx`

### Session 21 - Issue Cleanup & DX Improvements
Closed 6 resolved issues. Fixed Turbopack warning. Changed review feedback to show actual day names.
**Files**: `next.config.ts`, `lib/fsrs/index.ts`

### Session 20 - Test Account Setup & Progress API Fix
Fixed Progress API Date handling for raw SQL templates. Created and confirmed test account.
**Files**: `api/progress/route.ts`

### Session 19 - Bug Verification, Icon Redesign & QA Updates
Updated native language options. Replaced emoji icons with Lucide icons. Verified bugs #24-#28, #30.
**Files**: `onboarding/languages/page.tsx`, `auth/onboarding/page.tsx`, `user-profiles.ts`

### Session 18 - Bug Fixes & Language Selection Redesign
Created FlagStamp component with vinyl sticker appearance. Fixed #27 nested button hydration. Fixed #28 Progress API slow query (10x faster). Fixed #30 sentence validation with Unicode-aware matching.
**Files**: `flag-stamp.tsx`, `globals.css`, `word-detail-sheet.tsx`, `api/progress/route.ts`, `generator.ts`

### Session 18a - Bug Fixes: Storage RLS & Sentence Generation
Applied storage RLS migration for audio bucket. Fixed duplicate sentence hash with onConflictDoNothing().
**Files**: `api/sentences/generate/route.ts`

### Session 17 - Comprehensive QA Testing + Bug Fixes
Tested 13 scenarios across 4 phases. Discovered 7 bugs (#24-#30). Fixed critical onboarding infinite loop (#24).
**Files**: `onboarding/complete/page.tsx`, `20260119_fix_audio_storage_rls.sql`, `QA_REPORT_20260119.md`

### Session 16 - Capacitor iOS Setup + Database Queries
Implemented Capacitor for iOS with hybrid approach (loads from Vercel URL). Created 25+ database validation queries. Enhanced useAudioPlayer hook.
**Files**: `capacitor.config.ts`, `ios/`, `lib/capacitor/`, `CAPACITOR_IOS_SETUP.md`, `database-queries.sql`, `TESTING.md`

### Session 15 - Epic 7: PWA Implementation
Added Serwist for service worker generation. Created manifest.json, offline fallback page, IndexedDB review queue, install prompt banner, audio preloader.
**Files**: `manifest.json`, `sw.ts`, `~offline/page.tsx`, `use-network-status.ts`, `use-install-prompt.ts`, `review-queue.ts`, `sync-service.ts`, `audio/preload.ts`, `offline-indicator.tsx`, `install-banner.tsx`

---

## Sessions 1-14 (2026-01-14 to 2026-01-16)

### Session 7 - Dynamic Sentence Generation & Anki Import (Epic 2)
Implemented word-matching algorithm with getDueWordsGroupedByCategory(), generateWordCombinations(), kCombinations(). Created sentence generator with GPT-4o-mini (~$0.00006/sentence). Built API endpoints POST /api/sentences/generate and GET /api/sentences/next. Created Anki import tools. Successfully tested with 903 real words.
**Files**: `word-matcher.ts`, `generator.ts`, `exercise-type.ts`, `api/sentences/`, `review-store.ts`

### Session 6 - FSRS Review System Implementation (Epic 3)
Installed ts-fsrs library. Created FSRS utility functions (calculateRetrievability, isDue, wordToCard, processReview, getNextReviewText). Built review API endpoints. 2-hour session boundary for mastery rule.
**Files**: `lib/fsrs/index.ts`, `api/reviews/route.ts`, `api/reviews/end/route.ts`

### Session 5 - Dark Mode Polish & App-Wide Consistency
Fixed PhraseInput Component, BrandWidget Modal, applied dark mode to all auth pages.

### Session 4 - Dark Mode Implementation
Created dark theme with "leather Moleskine at night" aesthetic using warm charcoals (#1C1F21, #2A2D30). Installed next-themes, added theme toggle to bottom nav.
**Files**: `ThemeProvider`, `globals.css`, `bottom-nav.tsx`

### Session 3 - Home Page Real Data & Audio Playback
Created useAudioPlayer hook and AudioPlayButton component. Connected home page to live API.
**Files**: `use-audio-player.ts`, `audio-play-button.tsx`, `phrase-card.tsx`

### Session 2 - Authentication Pages & FSRS Documentation
Created complete auth UI (Sign In, Sign Up, Onboarding, Reset/Update Password). Created FSRS_IMPLEMENTATION.md.

### Session 1 - Phase 1 Implementation: Backend Foundation & Word Capture
Database Setup (Drizzle + Supabase), Authentication (Supabase Auth), State Management (Zustand), API Endpoints (CRUD for words), OpenAI Integration (TTS, translation, categorization), Audio Storage (Supabase Storage).

### Sessions before numbering (2026-01-14 to 2026-01-15)
- Progress & Review Pages Alignment with Moleskine aesthetic
- Moleskine Design Enhancement with paper textures
- Brand Widget Integration with CVA-based variants
- Next.js Web App Implementation (8 MVP screens, ~25 components)
- Frame0 Mockups Update (6 iOS screens)
- Brand Colors, Missing Screens, Scientific Aesthetic
- Strategic Platform Reorganization: Web-First MVP (shifted from iOS-first)

---

> For current sessions, see [PROJECT_LOG.md](./PROJECT_LOG.md)
