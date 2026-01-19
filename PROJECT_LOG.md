# LLYLI Project Log

> Single source of truth for project status and history.

## Quick Start
```bash
cd web && npm run dev     # localhost:3000
npm run build             # Production build
```

## Current Status

### Recently Completed
- [x] **Gamification MVP** - Daily goals, streaks, bingo board, boss round (Session 22)
- [x] **Issue Cleanup** - Closed 6 resolved issues, improved review feedback UX (Session 21)
- [x] **Test Account Setup** - Fixed Progress API 500 error (Session 20)
- [x] **Bug Verification** - Auth icon redesign, QA updates (Session 19)
- [x] **Bug Fixes** - Language selection redesign, Storage RLS, Progress API optimization (Session 18)

### In Progress
- [ ] **Sentence generation** - Pre-gen works, review integration WIP
- [ ] **PWA offline caching** - Basic setup done, needs testing
- [ ] **iOS App Store** - Capacitor setup complete, needs submission

### Not Started
- **Stripe payments** - Post-MVP priority

## Key Files
| File | Purpose |
|------|---------|
| `web/src/lib/store/gamification-store.ts` | Gamification state management |
| `web/src/lib/db/schema/gamification.ts` | Daily progress, streaks, bingo tables |
| `web/src/app/api/gamification/` | Gamification API endpoints |
| `web/src/components/gamification/` | Bingo board, boss round UI |
| `web/src/app/review/page.tsx` | Review session (needs sentence integration) |
| `web/src/lib/sentences/generator.ts` | Sentence generation with Unicode validation |

## Open Bugs
| Issue | Status | Notes |
|-------|--------|-------|
| #29 | Open | Turbopack config warning - low priority, no impact |
| #23 | Open | iOS App Store submission |
| #20 | Open | Default categories |

## Open Feature Issues
| Issue | Feature | Priority |
|-------|---------|----------|
| #32 | Daily Completion State & Streak Display | Pre-MVP |
| #33 | Bingo Board | Pre-MVP |
| #34 | Boss Round | Pre-MVP |
| #35 | Story Run Frame | Post-MVP |
| #36 | Category Hunt | Post-MVP |
| #37 | Real Life Mission Check-in | Post-MVP |

---

## Session Log

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
