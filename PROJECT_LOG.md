# LLYLI Project Log

> Single source of truth for project status and history.

## Quick Start
```bash
cd web && npm run dev     # localhost:3000
npm run build             # Production build
```

## Current Status

### Recently Completed
- [x] **Project Documentation + Onboarding Flow** - README.md, GitHub issue prioritization, restored capture step (Session 29)
- [x] **Auth Bug Fix + Starter Words** - Email confirmation UI, improved sign-in errors, 10 starter words per language (Session 28)
- [x] **User Research Synthesis** - Analyzed 24 survey responses, created product guide (Session 27)
- [x] **Language Filtering Fix** - Fixed #43 BLOCKER via shared helper function (Session 26)
- [x] **Multi-Language Support** - Schema, API, and validation for en→pt-PT, nl→pt-PT, nl→en, en→sv (Session 24)

### In Progress
- [ ] **Sentence generation** - Pre-gen works, review integration WIP
- [ ] **PWA offline caching** - Basic setup done, needs testing
- [ ] **iOS App Store** - Capacitor setup complete, needs submission

### Not Started
- **Stripe payments** - Post-MVP priority

## Key Files
| File | Purpose |
|------|---------|
| `README.md` | Project overview, tech stack, quick start guide |
| `docs/product/product_guide.md` | Comprehensive product explanation, onboarding, gamification |
| `docs/design/user_research_synthesis.md` | Survey analysis (24 respondents), personas, gap analysis |
| `web/src/lib/config/languages.ts` | Language config, SUPPORTED_DIRECTIONS, validation |
| `web/src/lib/db/schema/words.ts` | Words table with sourceLang, targetLang columns |
| `web/src/lib/data/starter-vocabulary.ts` | Curated starter words for 6 target languages |
| `web/src/app/api/onboarding/starter-words/route.ts` | API to inject starter words during onboarding |
| `web/src/lib/store/gamification-store.ts` | Gamification state management |
| `web/src/lib/db/schema/gamification.ts` | Daily progress, streaks, bingo tables |
| `web/src/app/api/gamification/` | Gamification API endpoints |
| `web/src/components/gamification/` | Bingo board, boss round UI |
| `web/src/app/review/page.tsx` | Review session (needs sentence integration) |
| `web/src/lib/sentences/generator.ts` | Sentence generation with Unicode validation |

## Open Bugs
| Issue | Status | Notes |
|-------|--------|-------|
| #29 | Low | Turbopack config warning - no impact (closed) |
| #23 | Open | iOS App Store submission |
| #20 | Open | Default categories |

### Closed This Session
- ~~#43~~ **BLOCKER** - Fixed: Language filtering via shared helper in all word queries

## Open Feature Issues
| Issue | Feature | Priority |
|-------|---------|----------|
| #50 | E2E User Flow Verification on Vercel | P0-critical |
| #44 | Progress API 500 error | P1-high |
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

---

## Session Log

### Session 29 - 2026-01-19 - Project Documentation + Onboarding Flow Fix
**Focus**: Create comprehensive README, organize GitHub issues, restore capture step in onboarding

**Documentation Created**
| File | Purpose |
|------|---------|
| `README.md` | Full project README with tech stack, structure, quick start guide |

**GitHub Issues Organization**
| Action | Details |
|--------|---------|
| Created priority labels | P0-critical, P1-high, P2-normal, P3-low, post-mvp |
| Created #50 | E2E Test: Full User Flow Verification on Vercel (P0-critical) |
| Prioritized all open issues | Applied labels to 12 open issues |

**Onboarding Flow Fixed**
| Before | After |
|--------|-------|
| Languages → Skip capture → Complete | Languages → Capture 3+ words → Complete |
| Users only got starter words | Users get 10 starter words + add their own |

**Key Change**: `languages/page.tsx` line 65 - route changed from `/onboarding/complete` to `/onboarding/capture`

**Files Modified**
| File | Type | Notes |
|------|------|-------|
| `README.md` | Created | Complete project documentation |
| `web/src/app/onboarding/languages/page.tsx` | Modified | Restore capture step route |

**Reminders Created**
- Apple Reminder: "Test LLYLI user flow on Vercel production" in Daily 5 (tomorrow 9am)

**Build**: ✅ Passed

---

### Session 28 - 2026-01-19 - Auth Bug Fix + Improved Onboarding
**Focus**: Fix email confirmation auth bug; improve onboarding with starter words

**Auth Bug Fix**
| Issue | Root Cause | Fix |
|-------|------------|-----|
| "Invalid login credentials" after signup | Email confirmation enabled in Supabase | Check `session` vs `user` in signup response |
| Users redirected before email confirmed | No session check | Show "Check Your Email" UI if `!session && user` |
| Unhelpful sign-in error | Generic Supabase message | Added hint about email confirmation |

**Onboarding Improvements**
| Change | Before | After |
|--------|--------|-------|
| Starter words | User captures 3+ manually | 10 curated words injected automatically |
| Flow | Languages → Capture → Complete | Languages → Complete (skips manual capture) |
| Empty state | User sees blank notebook | User sees 6 starter words immediately |

**Starter Vocabulary**
- 10 high-frequency phrases per target language
- Covers social, food_dining, transport, shopping categories
- Pre-translated to all supported native languages
- TTS generated asynchronously (non-blocking)

**Files Created**
| File | Type | Notes |
|------|------|-------|
| `web/src/lib/data/starter-vocabulary.ts` | Created | 60 words (6 languages × 10 phrases) |
| `web/src/app/api/onboarding/starter-words/route.ts` | Created | Idempotent injection API |

**Files Modified**
| File | Type | Notes |
|------|------|-------|
| `web/src/app/auth/sign-up/page.tsx` | Modified | Email confirmation UI, resend with cooldown |
| `web/src/app/auth/sign-in/page.tsx` | Modified | Better error message for unconfirmed users |
| `web/src/app/onboarding/languages/page.tsx` | Modified | Call starter-words API, skip to complete |
| `web/src/app/onboarding/complete/page.tsx` | Modified | Show starter words grid instead of sentences |

**E2E Test Results**
| Test | Result | Notes |
|------|--------|-------|
| Sign-up → Check Email UI | ✅ PASS | Email confirmation screen shows correctly |
| Sign-in improved error | ✅ PASS | Hints at email confirmation |
| Onboarding → Complete | ✅ PASS | Skips capture, shows starter words |
| Notebook categories | ✅ PASS | 11 phrases across 3 categories |
| Progress dashboard | ✅ PASS | Stats loading correctly |
| Daily Bingo gamification | ✅ PASS | 9 squares, 4/9 completed |

**Other Changes**
- Removed InstallBanner PWA prompt → Deferred to GitHub issue #49

**Deployment**
| Step | Status | Notes |
|------|--------|-------|
| Local build | ✅ Pass | `npm run build` succeeds |
| Git push | ✅ Pass | Pushed to origin/main |
| Vercel auto-deploy | ❌ Fail | 3 consecutive failures (webhook issue) |
| Vercel manual deploy | ✅ Pass | `vercel --prod` succeeded |
| Production verified | ✅ Live | InstallBanner removed, all changes live |

**Build**: ✅ Passed
**Commits**:
- `fbb2625` - fix: auth email confirmation + starter words onboarding
- `6bf274a` - docs: add E2E test results to Session 28

---

### Session 27 - 2026-01-19 - User Research Synthesis & Product Documentation
**Focus**: Analyze survey data (24 respondents) and LinkedIn feedback; create comprehensive product documentation

**User Research Key Findings**
| Finding | Frequency | Impact |
|---------|-----------|--------|
| "I think I'll remember it but don't write it down" | 75% | Validates frictionless capture |
| "I save them somewhere but never review" | 25% | Validates automatic FSRS scheduling |
| Staying motivated and consistent | 25% | Validates gamification MVP |
| Wrong Portuguese variant (Brazilian vs EU) | 15% | Validates pt-PT support as differentiator |

**LinkedIn Feedback (Ralf Fleuren - Swedish learner)**
> "But without a motivating structure to learn, repeat and apply them it is not doable."
- Validates gamification features
- Suggests yearly goal tracking (1000 words/year)

**Gap Analysis**
| Gap | Survey Evidence | LLYLI Solution | Status |
|-----|----------------|----------------|--------|
| EU Portuguese | "Duolingo doesn't offer EU Portuguese" | pt-PT explicit support | Solved |
| No review system | "I save but never review" | FSRS automatic scheduling | Solved |
| Motivation structure | "it is not doable" | Daily goals, streaks, bingo | Solved |
| Yearly goal tracking | "1000 words per year" | Daily goal exists | Enhancement opportunity |
| Widget for quick access | "widget on home screen" | PWA only | Future feature |

**Files Created**
| File | Type | Notes |
|------|------|-------|
| `docs/product/product_guide.md` | Created | Comprehensive product explanation |
| `docs/design/user_research_synthesis.md` | Created | Survey analysis with personas |

**Product Guide Contents**
- Problem statement with research evidence
- The Three-Step Loop (Capture → Review → Master)
- Onboarding flow (2 questions)
- Gamification features explained (daily goal, streaks, bingo, boss round)
- Scientific basis (FSRS, dynamic sentences, 3-recall rule)
- Exercise types and progression
- User persona (Sofia)

**GitHub Issues Created**
| Issue | Feature | Evidence |
|-------|---------|----------|
| #46 | Yearly goal tracking (1000 words/year) | "connected to a bigger challenge" |
| #47 | iOS Home Screen widget | "widget on my home screen" |
| #48 | Social accountability | "someone involved in the process" |

---

### Session 26 - 2026-01-19 - Go-Live Critical Bug Fixes
**Focus**: Fix BLOCKER #43 - words mixing between languages

**Bug Fixed**
| Issue | Title | Fix |
|-------|-------|-----|
| #43 | **BLOCKER** Words not filtered by target_language | Created shared helper + filter in 5 routes |

**Sustainable Solution**
Created `getUserLanguagePreference()` in `lib/supabase/server.ts` as **single source of truth**. All 5 API routes now import and use this shared function - no more copy-paste.

**Changes Made**
- `lib/supabase/server.ts` - NEW: Shared `getUserLanguagePreference()` helper
- `GET /api/words` - Imports shared helper, filters by `targetLang`
- `GET /api/words/categories` - Imports shared helper, filters stats + inbox
- `GET /api/reviews` - Imports shared helper, filters due words
- `GET /api/progress` - Imports shared helper, filters all 5 word queries
- `GET /api/sentences/next` - Imports shared helper, filters sentence words

**E2E Testing**
- ✅ Portuguese user sees only Portuguese words (11 words)
- ✅ Swedish user sees only Swedish words (10 test words created)
- ✅ Build passes, all routes compile

**Files**
| File | Type | Notes |
|------|------|-------|
| `web/src/lib/supabase/server.ts` | Modified | Added shared getUserLanguagePreference() |
| `web/src/app/api/words/route.ts` | Modified | Uses shared helper, removed duplicate |
| `web/src/app/api/words/categories/route.ts` | Modified | Language filter on stats |
| `web/src/app/api/reviews/route.ts` | Modified | Language filter on due words |
| `web/src/app/api/progress/route.ts` | Modified | Language filter on all queries |
| `web/src/app/api/sentences/next/route.ts` | Modified | Language filter on sentence words |

---

### Session 25 - 2026-01-19 - Go-Live E2E Testing
**Focus**: Comprehensive end-to-end testing before production launch

**Test Results Summary**
| Test Case | Status | Notes |
|-----------|--------|-------|
| TC1: Authentication | ✅ PASS | Sign-in, redirect, session working |
| TC2: Word Capture | ✅ PASS | Translation, audio, category assignment |
| TC3-5: Review Sessions | ✅ PASS | Fill-blank, multiple choice, type translation |
| TC6: FSRS Algorithm | ✅ PASS | Scheduling, mastery progression, day names |
| TC7: Notebook | ✅ PASS | Categories, word detail, search |
| TC10: Progress Dashboard | ❌ FAIL | 500 error - API bug |
| TC11: Daily Goal | ✅ PASS | 15/10 goal, completion state |
| TC12: Bingo Board | ✅ PASS | 4/9 squares, modal working |
| TC13: Boss Round | ✅ PASS | 5/5 perfect, timer, celebration |
| TC15: Multi-Language | ⚠️ PARTIAL | sv→en works, en→sv detection fails |

**Database Health**
- words: 924, user_profiles: 2, review_sessions: 11
- Mastery: learning (688), learned (34), ready_to_use (202)
- FSRS: avg difficulty 0.08, stability 22.47, retrievability 0.88
- Data integrity: No orphaned records, 528 duplicate words (expected from testing)

**Critical Bugs Found**
1. **BLOCKER**: Words not filtered by `target_language` - users see mixed Portuguese + Swedish
2. **High**: Progress API returns 500 (possible query issue)
3. **Medium**: English→Swedish translation detects English as Swedish

**Product Decisions Confirmed**
- User sets language at onboarding - fixed for account lifetime
- No language toggle for MVP
- One target language per user, no mixing

**Files**
| File | Type | Notes |
|------|------|-------|
| `scripts/update-lang-temp.mjs` | Created | Test script for language switching |
| `~/.claude/skills/reflect/SKILL.md` | Modified | Added LLYLI test account learning |

---

### Session 24 - 2026-01-19 - Multi-Language Support
**Focus**: Implement multi-language support infrastructure for app launch

**Done**
- Added `sourceLang`, `targetLang`, `translationProvider` columns to words schema
- Created `SUPPORTED_DIRECTIONS` config: en→pt-PT, nl→pt-PT, nl→en, en→sv
- Updated translation API to fetch user prefs from database
- Added direction validation and pt-PT regional variant enforcement
- Created LanguageSelector component (currently hidden, for future use)
- Created comprehensive test suite (`scripts/test-comprehensive.ts`)
- Fixed user profile with unsupported de→pt-PT direction
- Updated TESTING.md with Test Case 15: Multi-Language Support
- Created Multi_Language_Implementation.md documentation
- Created GitHub issues #40, #41, #42 for future enhancements

**Key Design Decisions**
- User's learning direction (native→target) set during onboarding
- Capture UI simplified to use profile settings (selector deferred as enhancement)
- Translation bidirectional within supported learning pairs
- pt-PT explicitly enforced with regional variant instructions

**Files**
| File | Type | Notes |
|------|------|-------|
| `web/src/lib/db/schema/words.ts` | Modified | Added language tracking columns |
| `web/src/lib/config/languages.ts` | Modified | Added SUPPORTED_DIRECTIONS, validation |
| `web/src/app/api/words/route.ts` | Modified | Fetch user prefs, validate direction |
| `web/src/components/capture/language-selector.tsx` | Created | For future multi-direction UI |
| `web/scripts/test-comprehensive.ts` | Created | Multi-language test suite |
| `docs/engineering/Multi_Language_Implementation.md` | Created | Implementation docs |
| `docs/engineering/TESTING.md` | Modified | Added Test Case 15 |

**GitHub Issues Created**
- #40: Add language direction selector to capture UI
- #41: Add more supported language pairs
- #42: Add German → Portuguese support

---

### Session 23 - 2026-01-19 - PROJECT_LOG Unification
**Focus**: Combine handoff and changelog into single PROJECT_LOG.md

**Done**
- Created unified PROJECT_LOG.md with dashboard + session history
- Archived sessions 1-14 to PROJECT_LOG_ARCHIVE.md
- Updated CLAUDE.md session workflow
- Updated pre-commit hook to check PROJECT_LOG.md
- Updated session-workflow.md references
- Cleaned up old CHANGELOG.md and HANDOFF*.md files

**Files**
| File | Type | Notes |
|------|------|-------|
| `PROJECT_LOG.md` | Created | Unified project documentation |
| `PROJECT_LOG_ARCHIVE.md` | Created | Sessions 1-14 archive |
| `.claude/CLAUDE.md` | Modified | Updated session workflow |
| `scripts/pre-commit` | Modified | Check PROJECT_LOG.md |
| `docs/engineering/session-workflow.md` | Modified | Updated references |

**Decisions**: Single source of truth reduces context hunting and prevents handoff doc loss

---

### Session 22 - 2026-01-19 - Gamification MVP Implementation
**Focus**: Implement core gamification features for MVP launch - daily completion state, streak tracking, bingo board, and boss round challenge.

**Done**
- Created gamification database schema (dailyProgress, streakState, bingoState)
- Built API endpoints for state, events, and boss round
- Created Zustand gamification store with optimistic updates
- Built BingoBoard, BossRound, and ProgressRing components
- Integrated gamification into home page and review complete page
- Fixed bugs #38 and #39 during E2E testing

**Files**
| File | Type | Notes |
|------|------|-------|
| `web/src/lib/db/schema/gamification.ts` | Created | Database tables and constants |
| `web/src/lib/store/gamification-store.ts` | Created | Zustand state management |
| `web/src/app/api/gamification/state/route.ts` | Created | State fetch endpoint |
| `web/src/app/api/gamification/event/route.ts` | Created | Event processing endpoint |
| `web/src/app/api/gamification/boss-round/route.ts` | Created | Boss round endpoints |
| `web/src/components/gamification/bingo-board.tsx` | Created | Bingo board UI |
| `web/src/components/gamification/boss-round.tsx` | Created | Boss round UI components |
| `web/src/app/page.tsx` | Modified | Gamification integration |
| `web/src/components/home/todays-progress.tsx` | Modified | Progress ring, daily goal |
| `web/src/app/review/complete/page.tsx` | Modified | Daily status section |

**Decisions**:
- Forgiving streak system with 1 free freeze (prevents punitive UX)
- 9 achievable bingo squares mixing review counts, exercise types, categories
- Boss round prioritizes high-lapse words, only after daily goal completion

**Issues**: Created #32-#37, Fixed #38 and #39

**Testing**: Full E2E verified - daily goal, streak, bingo squares, boss round

---

### Session 21 - 2026-01-19 - Issue Cleanup & DX Improvements
**Focus**: Close resolved issues, fix Turbopack warning, improve review feedback UX.

**Done**
- Closed 6 resolved issues (#27, #28, #30, #31, #18, #29)
- Fixed Turbopack config warning with empty `turbopack: {}` config
- Changed review feedback from "Tomorrow"/"In X days" to actual day names

**Files**
| File | Type | Notes |
|------|------|-------|
| `web/next.config.ts` | Modified | Added turbopack config |
| `web/src/lib/fsrs/index.ts` | Modified | Show day names in review feedback |

**Testing**: All 65 unit tests pass, Playwright smoke tests pass

---

### Session 20 - 2026-01-19 - Test Account Setup & Progress API Fix
**Focus**: Fix test account email confirmation and resolve Progress API 500 error.

**Done**
- Created and confirmed test account (claudetest20260119@gmail.com)
- Fixed Progress API Date handling for raw SQL templates
- Verified QA test cases through Playwright automation

**Files**
| File | Type | Notes |
|------|------|-------|
| `web/src/app/api/progress/route.ts` | Modified | Fixed Date handling |

**Issues**: Fixed Progress API 500 error (Date objects need string conversion for raw SQL)

---

### Session 19 - 2026-01-19 - Bug Verification, Icon Redesign & QA Updates
**Focus**: Verify bug fixes, redesign auth onboarding icons, update QA documentation.

**Done**
- Updated native language options (removed Brazil, added Portugal and Sweden)
- Replaced emoji icons with Lucide icons for Moleskine aesthetic
- Verified bugs #24-#28, #30 as fixed; #29 acknowledged

**Files**
| File | Type | Notes |
|------|------|-------|
| `web/src/app/onboarding/languages/page.tsx` | Modified | Updated native languages |
| `web/src/app/auth/onboarding/page.tsx` | Modified | Lucide icons |
| `web/src/lib/db/schema/user-profiles.ts` | Modified | Changed icon to iconName |
| `docs/qa/QA_REPORT_20260119.md` | Modified | Updated bug status |

---

### Session 18 - 2026-01-19 - Bug Fixes & Language Selection Redesign
**Focus**: Apply pending migrations, fix high-priority bugs, redesign language selection UI.

**Done**
- Created FlagStamp component with clean vinyl sticker appearance
- Fixed #27 nested button hydration error
- Fixed #28 Progress API slow query (10x faster with Promise.all)
- Fixed #30 sentence validation with Unicode-aware matching

**Files**
| File | Type | Notes |
|------|------|-------|
| `web/src/components/ui/flag-stamp.tsx` | Created | CSS-rendered flags |
| `web/src/app/globals.css` | Modified | Added .flag-sticker classes |
| `web/src/app/onboarding/languages/page.tsx` | Modified | Updated layout and copy |
| `web/src/components/notebook/word-detail-sheet.tsx` | Modified | Fixed nested button |
| `web/src/app/api/progress/route.ts` | Modified | Optimized to 8 parallel queries |
| `web/src/lib/sentences/generator.ts` | Modified | 4-strategy Unicode validation |

---

### Session 18a - 2026-01-19 - Bug Fixes: Storage RLS & Sentence Generation
**Focus**: Apply pending migrations and fix high-priority bugs from QA report.

**Done**
- Applied storage RLS migration for audio bucket
- Fixed duplicate sentence hash with onConflictDoNothing()

**Files**
| File | Type | Notes |
|------|------|-------|
| `web/src/app/api/sentences/generate/route.ts` | Modified | Race condition handling |

---

### Session 17 - 2026-01-19 - Comprehensive QA Testing + Bug Fixes
**Focus**: Automated QA testing with Playwright MCP, bug discovery, and critical fixes.

**Done**
- Tested all core user flows (13 scenarios, 4 phases)
- Discovered and documented 7 bugs (#24-#30)
- Fixed critical onboarding infinite loop (#24)
- Created storage RLS migration for #25

**Files**
| File | Type | Notes |
|------|------|-------|
| `web/src/app/onboarding/complete/page.tsx` | Modified | Fixed infinite loop |
| `supabase/migrations/20260119_fix_audio_storage_rls.sql` | Created | Storage RLS |
| `docs/qa/QA_REPORT_20260119.md` | Created | Full QA report |
| `docs/engineering/TESTING.md` | Modified | Added QA reports section |

**Issues**: Created #24-#31

---

### Session 16 - 2026-01-19 - Capacitor iOS Setup + Database Queries
**Focus**: Implement Capacitor for iOS, add pre-commit hook, create database validation queries.

**Done**
- Chose hybrid approach (iOS loads from Vercel URL)
- Installed Capacitor packages and created platform utilities
- Enhanced useAudioPlayer hook with progressive enhancement
- Created pre-commit hook for changelog enforcement
- Created 25+ database validation queries

**Files**
| File | Type | Notes |
|------|------|-------|
| `web/capacitor.config.ts` | Created | iOS app configuration |
| `web/ios/` | Created | Xcode project |
| `web/src/lib/capacitor/` | Created | Platform detection, native plugins |
| `docs/engineering/CAPACITOR_IOS_SETUP.md` | Created | Setup documentation |
| `scripts/pre-commit` | Created | Changelog enforcement hook |
| `scripts/database-queries.sql` | Created | 25+ validation queries |
| `docs/engineering/TESTING.md` | Created | Comprehensive testing guide |

---

### Session 15 - 2026-01-19 - Epic 7: PWA Implementation
**Focus**: Implement Progressive Web App capabilities for offline support, install prompt, and background sync.

**Done**
- Added Serwist for service worker generation
- Created manifest.json and caching strategies
- Built offline fallback page with Moleskine styling
- Created IndexedDB store for offline review queue
- Built install prompt banner and network status hook
- Created audio preloader for session start

**Files**
| File | Type | Notes |
|------|------|-------|
| `web/public/manifest.json` | Created | PWA manifest |
| `web/src/app/sw.ts` | Created | Service worker source |
| `web/src/app/~offline/page.tsx` | Created | Offline fallback page |
| `web/src/lib/hooks/use-network-status.ts` | Created | Network detection |
| `web/src/lib/hooks/use-install-prompt.ts` | Created | Install prompt hook |
| `web/src/lib/offline/review-queue.ts` | Created | IndexedDB queue |
| `web/src/lib/offline/sync-service.ts` | Created | Auto-sync service |
| `web/src/lib/audio/preload.ts` | Created | Audio preloader |
| `web/src/components/ui/offline-indicator.tsx` | Created | Status banner |
| `web/src/components/ui/install-banner.tsx` | Created | Install prompt UI |

---

> **Archive**: Sessions 1-14 in [PROJECT_LOG_ARCHIVE.md](./PROJECT_LOG_ARCHIVE.md)
