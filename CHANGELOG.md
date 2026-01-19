# LLYLI Project Changelog

This changelog tracks all Claude Code sessions and major changes to the LLYLI project. After each session, add a brief summary of work completed.

---

## 2026-01-19 - Native Language Options Update

Updated native language selection in onboarding to better reflect European expat demographics:

| Removed | Added |
|---------|-------|
| Portuguese (Brazil) 🇧🇷 | Portuguese (Portugal) 🇵🇹 |
| English 🇬🇧 | Swedish 🇸🇪 |

**Final native languages**: Dutch, Portuguese (Portugal), German, French, Swedish, Spanish

**Rationale**: Portugal and Sweden are popular expat destinations (Lisbon, Stockholm). English speakers typically don't need translations.

**File modified**: `web/src/app/onboarding/languages/page.tsx`

---

## 2026-01-19 (Session 18) - Bug Fixes & Language Selection Redesign

**Session Focus**: Apply pending migrations, fix high-priority bugs, and redesign language selection UI.

### Language Selection Redesign

Redesigned the onboarding language selection page to better match the Moleskine aesthetic:

#### Visual Changes
- Created new `FlagStamp` component with clean, premium vinyl sticker appearance
- Removed gimmicky effects (tape, worn edges, country code labels)
- Subtle box-shadows for depth against notebook paper background
- Clean 3-column grid layout
- Teal highlight on selection state

#### Copy Updates
- Step 1: "What language fills your days?" / "The one you hear on streets and in shops"
- Step 2: "And your mother tongue?" / "For translations that feel like home"
- Natural, emotionally resonant language that reflects the immigrant/expat experience

#### Files Added/Modified
| File | Changes |
|------|---------|
| `web/src/components/ui/flag-stamp.tsx` | New component with CSS-rendered flags |
| `web/src/app/globals.css` | Added `.flag-sticker` CSS classes |
| `web/src/app/onboarding/languages/page.tsx` | Updated layout and copy |
| `web/src/components/ui/index.ts` | Export FlagStamp component |

### Bug Fixes

#### #27: Nested Button Hydration Error - FIXED
- **Location**: `web/src/components/notebook/word-detail-sheet.tsx`
- **Problem**: `AudioPlayButton` component (a `<button>`) was wrapped inside another `<button>`, causing React hydration errors
- **Fix**: Replaced nested component with direct icon usage (`Volume2`, `Loader2`)

#### #28: Progress API Slow Query - FIXED
- **Location**: `web/src/app/api/progress/route.ts`
- **Problem**: ~20 sequential database queries caused 15+ second response times
- **Fix**: Optimized to 8 parallel queries using `Promise.all` and conditional aggregation
  - Combined 10 count queries into 1 using `count(*) filter (where ...)`
  - Replaced 7 sequential forecast queries with 1 grouped query
  - Expected improvement: ~10x faster (15s → <2s)

#### #29: Turbopack Config Warning - Acknowledged
- Low priority - `@serwist/next` service worker plugin not fully Turbopack-compatible
- Already disabled in development, no user impact

#### #30: Sentence Validation False Negatives - FIXED
- **Location**: `web/src/lib/sentences/generator.ts`
- **Problem**: `\b` word boundaries fail with Unicode characters (ã, é, etc.)
- **Fix**: Added 4-strategy validation:
  1. Unicode-aware word boundaries with lookbehind/lookahead
  2. Normalized text comparison (remove diacritics)
  3. Simple includes check
  4. Word stem matching (70% prefix match)

### Bug Status Update

| Bug | Status |
|-----|--------|
| #24 | ✅ FIXED (Session 17) |
| #25 | ✅ FIXED (Session 18a) |
| #26 | ✅ FIXED (Session 18a) |
| #27 | ✅ FIXED (this session) |
| #28 | ✅ FIXED (this session) |
| #29 | ⚠️ Acknowledged (low priority) |
| #30 | ✅ FIXED (this session) |

---

## 2026-01-19 (Session 18a) - Bug Fixes: Storage RLS & Sentence Generation

**Session Focus**: Apply pending migrations and fix high-priority bugs from QA report.

### What Was Done

#### Storage RLS Migration Applied (#25)
- Applied `supabase/migrations/20260119_fix_audio_storage_rls.sql` via Node.js
- Created 4 RLS policies for audio bucket:
  - INSERT: Users can upload to their own folder
  - UPDATE: Users can update their own files
  - DELETE: Users can delete their own files
  - SELECT: Public read access
- Verified audio uploads now work (3 new files uploaded post-migration)
- Confirmed public URL access returns HTTP 200

#### Duplicate Sentence Hash Fix (#26)
- **Problem**: Race condition caused unique constraint violations when concurrent requests tried to insert the same word combination
- **Solution**: Added `onConflictDoNothing()` to sentence insert query
- Uses `.returning()` to detect if insert actually happened vs was skipped
- Database-level test confirmed duplicates are gracefully skipped

### Files Modified

| File | Changes |
|------|---------|
| `web/src/app/api/sentences/generate/route.ts` | Added `onConflictDoNothing()` for race condition handling |
| `docs/qa/QA_REPORT_20260119.md` | Updated #25 and #26 status to FIXED |

### Bug Status Update

| Bug | Status |
|-----|--------|
| #24 | ✅ FIXED (Session 17) |
| #25 | ✅ FIXED (this session) |
| #26 | ✅ FIXED (this session) |
| #27 | 🔴 Open |
| #28 | 🔴 Open |
| #29 | 🔴 Open |
| #30 | 🔴 Open |

---

## 2026-01-19 (Session 17) - Comprehensive QA Testing + Bug Fixes

**Session Focus**: Automated QA testing with Playwright MCP, bug discovery, and critical fixes.

### What Was Done

#### QA Testing
- Tested all core user flows using Playwright browser automation
- 13 test scenarios across 4 phases: Core flows, Auth flows, Interactive flows, Error handling
- **All tests passed**, but discovered **7 bugs**

#### Bugs Discovered & Documented
| Issue | Severity | Description |
|-------|----------|-------------|
| #24 | Critical | Onboarding completion infinite retry loop |
| #25 | Critical | Storage RLS policy blocks audio uploads |
| #26 | High | Duplicate sentence hash constraint violation |
| #27 | Medium | Nested button hydration error |
| #28 | Medium | Progress API slow (15s for 900+ words) |
| #29 | Low | Turbopack config warning |
| #30 | Low | Sentence validation false negatives |

#### Critical Fixes Applied
1. **Onboarding infinite loop** (#24):
   - Added `MAX_RETRIES = 2` with exponential backoff
   - Added `useRef` guards against React Strict Mode double-execution
   - Added "Skip this step" button during loading
   - Added error state UI with retry/continue options

2. **Storage RLS policy** (#25):
   - Created SQL migration for proper storage bucket policies
   - Policies allow authenticated users to manage files in their folder

### Files Created/Modified

| File | Change |
|------|--------|
| `web/src/app/onboarding/complete/page.tsx` | Fixed infinite loop bug |
| `supabase/migrations/20260119_fix_audio_storage_rls.sql` | Storage RLS migration |
| `docs/qa/QA_REPORT_20260119.md` | Full QA test report |
| `docs/engineering/TESTING.md` | Added QA reports section |

### GitHub Issues Created
- #24, #25, #26, #27, #28, #29, #30 (bugs)
- #31 (handoff documentation)

### Next Steps for Engineer
1. **Apply storage RLS migration** (required for audio)
2. Review and merge onboarding fix
3. Address #26 (duplicate sentence hash) next

---

## 2026-01-19 (Session 16) - Capacitor iOS Setup + Database Queries

**Session Focus**: Implement Capacitor for iOS App Store distribution, add pre-commit hook for changelog enforcement, create database validation queries.

### What Was Done

#### Architecture Decision
Chose **hybrid approach** where iOS app loads from deployed Vercel URL instead of bundled static files:
- No code duplication between web and iOS
- API routes stay secure server-side
- Updates deploy instantly without App Store review
- Native plugins enhance the WebView experience

#### Capacitor Installation
Installed core packages:
- `@capacitor/core`, `@capacitor/cli`, `@capacitor/ios` - Core runtime
- `@capacitor/network` - Reliable network status detection
- `@capacitor/push-notifications` - iOS push notifications (APNs)
- `@capacitor-community/native-audio` - Native audio playback

#### Platform Utilities Created
| File | Purpose |
|------|---------|
| `web/src/lib/capacitor/platform.ts` | Platform detection (`isNative()`, `isIOS()`, etc.) |
| `web/src/lib/capacitor/native-audio.ts` | Native audio playback wrapper |
| `web/src/lib/capacitor/network.ts` | Enhanced network status service |
| `web/src/lib/capacitor/push-notifications.ts` | Push notification service |
| `web/src/lib/capacitor/index.ts` | Barrel exports |

#### Audio Player Enhancement
Updated `useAudioPlayer` hook with progressive enhancement:
- Native iOS: Uses Capacitor native audio (no autoplay restrictions)
- Web: Falls back to HTML5 Audio element
- Same API surface for components

#### iOS Project Initialized
- Created `capacitor.config.ts` with hybrid server configuration
- Generated `ios/` Xcode project via `npx cap add ios`
- Added Capacitor scripts to package.json

### Files Created (7)

| File | Purpose |
|------|---------|
| `web/capacitor.config.ts` | iOS app configuration |
| `web/ios/` | Xcode project (auto-generated) |
| `web/src/lib/capacitor/platform.ts` | Platform detection |
| `web/src/lib/capacitor/native-audio.ts` | Native audio wrapper |
| `web/src/lib/capacitor/network.ts` | Network status service |
| `web/src/lib/capacitor/push-notifications.ts` | Push notifications |
| `web/src/lib/capacitor/index.ts` | Barrel exports |
| `docs/engineering/CAPACITOR_IOS_SETUP.md` | Setup documentation |

### Files Modified (4)

| File | Changes |
|------|---------|
| `web/package.json` | Added Capacitor deps and scripts |
| `web/src/lib/hooks/use-audio-player.ts` | Progressive enhancement for native audio |
| `web/.gitignore` | iOS build artifact exclusions |
| `.claude/CLAUDE.md` | Updated tech stack and docs reference |

### npm Scripts Added

```bash
npm run cap:sync        # Sync web assets to iOS
npm run cap:open:ios    # Open Xcode project
npm run cap:build:ios   # Full iOS build
```

### Next Steps for App Store

1. Update production URL in `capacitor.config.ts`
2. Open Xcode: `npm run cap:open:ios`
3. Add app icons to `ios/App/App/Assets.xcassets/`
4. Configure signing with Apple Developer account
5. Enable Push Notifications capability
6. Test in simulator and on device
7. Submit to TestFlight

### Key Technical Decisions

**Hybrid over Static Export**: App has API routes that need server. Hybrid approach loads from Vercel URL, keeping API routes functional.

**Native Audio Plugin**: Bypasses iOS Safari autoplay restrictions. Audio plays immediately without user gesture requirement.

**Platform Detection at Runtime**: `isNative()` check determines which audio backend to use. Components don't need to know platform.

#### Pre-commit Hook for Changelog
Added git hook that warns when committing >2 files without updating CHANGELOG.md:
- `scripts/pre-commit` - The hook script
- `scripts/install-hooks.sh` - Installation for new clones
- Updated `session-workflow.md` with setup instructions

#### Database Validation Queries
Created `scripts/database-queries.sql` with 25+ queries organized into 7 sections:
1. Data Overview (health checks, user profiles)
2. Word Data Validation (categories, mastery status)
3. FSRS Algorithm Validation (parameter distribution, anomalies)
4. Review Sessions (recent sessions, statistics)
5. Sentence Generation (usage, exercise types)
6. Data Integrity Checks (orphans, duplicates)
7. Admin Queries (reset data, testing helpers)

#### Comprehensive Testing Guide
Created `docs/engineering/TESTING.md` with:
- Unit test instructions (Vitest)
- 10 manual QA test cases with step-by-step tables
- Essential database queries with expected results
- API testing curl commands
- Troubleshooting guide

---

## 2026-01-19 (Session 15) - Epic 7: PWA Implementation

**Session Focus**: Implement Progressive Web App capabilities for offline support, install prompt, and background sync.

**GitHub Issue**: #22 (Epic 7: PWA Implementation)

### What Was Done

#### PWA Foundation
- Added Serwist (modern next-pwa fork) for service worker generation
- Created `manifest.json` with app name, icons, theme colors
- Updated `next.config.ts` with Serwist wrapper
- Added `--webpack` flag to build script (Serwist requires webpack)

#### Service Worker Caching Strategies
| Content | Strategy | TTL |
|---------|----------|-----|
| Audio (mp3 from Supabase) | Cache-first | 1 year |
| Static assets (images, fonts) | Cache-first | 30 days |
| API /words, /reviews | Network-first | 1 day fallback |
| Categories/progress | Stale-while-revalidate | 1 day |

#### Offline Experience
- Created `/~offline` fallback page (Moleskine styled)
- Added `useNetworkStatus` hook for online/offline detection
- Created `OfflineIndicator` component showing status banner
- Banner shows "Offline mode" when disconnected, "Back online! Syncing..." on reconnect

#### Offline Review Queue
- Created IndexedDB store for pending reviews (`idb` library)
- `queueOfflineReview()` stores reviews when offline
- `syncPendingReviews()` POSTs queued reviews when back online
- Auto-sync triggered on browser `online` event
- Modified `review-store.ts` for offline-aware submission

#### Install Prompt
- Created `useInstallPrompt` hook capturing `beforeinstallprompt` event
- Created `InstallBanner` component above bottom nav
- Shows "Install LLYLI - Add to home screen for offline access"
- Respects localStorage dismissal

#### Audio Preloading
- Created `preloadSessionAudio()` using Cache API
- Preloads audio for due words at session start
- Ensures audio available offline before user starts reviewing

### Files Created (10)

| File | Purpose |
|------|---------|
| `web/public/manifest.json` | PWA manifest |
| `web/src/app/sw.ts` | Service worker source |
| `web/src/app/~offline/page.tsx` | Offline fallback page |
| `web/src/lib/hooks/use-network-status.ts` | Network detection hook |
| `web/src/lib/hooks/use-install-prompt.ts` | Install prompt hook |
| `web/src/lib/offline/review-queue.ts` | IndexedDB queue |
| `web/src/lib/offline/sync-service.ts` | Auto-sync service |
| `web/src/lib/offline/index.ts` | Barrel export |
| `web/src/lib/audio/preload.ts` | Audio preloader |
| `web/src/components/ui/offline-indicator.tsx` | Status banner |
| `web/src/components/ui/install-banner.tsx` | Install prompt UI |

### Files Modified (6)

| File | Changes |
|------|---------|
| `web/next.config.ts` | Added Serwist wrapper |
| `web/package.json` | Added `--webpack` flag, new dependencies |
| `web/src/app/layout.tsx` | Added OfflineIndicator, InstallBanner |
| `web/src/app/review/page.tsx` | Audio preloading, auto-sync setup |
| `web/src/lib/store/review-store.ts` | Offline-aware review submission |
| `web/src/lib/hooks/index.ts` | Export new hooks |
| `web/src/components/ui/index.ts` | Export new components |

### Testing Instructions

See GitHub Issue #18 Section 9 for detailed verification steps:
1. Build: `npm run build` then `npm start`
2. DevTools → Application → Manifest/Service Workers
3. Test offline mode with Network → Offline checkbox
4. Verify install banner on mobile Chrome

### Key Technical Decisions

**Serwist over manual SW**: Serwist handles cache invalidation complexity with simple config. Built on Google's Workbox.

**IndexedDB over localStorage**: IndexedDB stores complex objects and handles larger data than localStorage's 5MB string-only limit.

**Optimistic updates when offline**: Local state updates immediately, syncs in background when online. Better UX than blocking on network.

---

## 2026-01-19 (Session 14) - CLAUDE.md Optimization & Session Workflow

**Session Focus**: Review Vibecodelisboa transcripts, compare to LLYLI implementation, optimize CLAUDE.md

### What Was Done

#### Transcript Review
- Analyzed Claude Code 101 video transcripts (videos 5-9)
- Compared tutorial dog adoption app workflow to LLYLI implementation
- Identified best practices missing from project documentation

#### CLAUDE.md Optimization
- **Reduced from ~387 lines to ~104 lines** for faster context loading
- Fixed inaccurate tech stack (was listing NextAuth/Clerk, actually uses Supabase Auth)
- Added current implementation status (what's built vs pending)
- Linked to detailed docs instead of inlining everything

#### New Documentation
Created `/docs/engineering/session-workflow.md` with:
- Session start/end workflows (based on Vibecodelisboa methodology)
- Handoff doc template for session continuity
- MCP server configurations (Context7, Chrome DevTools)
- GitHub integration and commit conventions
- Database inspection tools
- Testing guidelines

### Files Changed
| File | Change |
|------|--------|
| `.claude/CLAUDE.md` | Slimmed down, fixed tech stack, added status |
| `docs/engineering/session-workflow.md` | New - detailed workflow guide |

### Key Insight
LLYLI is significantly more advanced than the tutorial app - it's a production-ready MVP with real data flows, not a stub with mock data. The video teaches process; LLYLI has already applied the product.

---

## 2026-01-19 (Session 13) - Engineering Docs Audit & Cleanup

**Session Focus**: Audit engineering documentation, identify outdated docs, create accurate TODO and archive.

### What Was Done

#### Documentation Audit
Verified all engineering docs against actual codebase implementation:
- Discovered `Missing Features.MD` was completely outdated (all "missing" features are implemented)
- Found 6 documents describing completed work, not future work

#### New Documents Created

| Document | Purpose |
|----------|---------|
| `docs/engineering/TODO.md` | Remaining work organized by P0/P1/P2 priority |
| `docs/engineering/IMPLEMENTATION_ARCHIVE.md` | Complete record of implemented features |
| `docs/engineering/archive/README.md` | Explains why each doc was archived |

#### Documents Archived
Moved 6 outdated/completed docs to `/docs/engineering/archive/`:

| Document | Reason Archived |
|----------|-----------------|
| `Missing Features.MD` | All claimed "missing" features now implemented |
| `NEXT_IMPLEMENTATION_PHASE.md` | Phase 1 complete |
| `llyli_default_categories_and_packs.md` | Lists 12 categories (now 8) |
| `FSRS_IMPLEMENTATION.md` | Algorithm implemented in code |
| `dependency_graph.md` | All P0 epics complete |
| `PLATFORM_STRATEGY_2026-01-15.md` | Web pivot executed |

### Key Findings

**MVP Status: ~85% complete**

All core learning loop features are implemented:
- Epic 0: Technical Foundation (Next.js, Supabase, Drizzle)
- Epic 1: Word Capture with translation + TTS
- Epic 2: Dynamic Sentence Generation
- Epic 3: FSRS Review System
- Epic 4: Notebook view (partial - no tags UI)
- Epic 5: Progress Dashboard

**Remaining P0 work:**
- PWA implementation (manifest, service worker)
- End-to-end testing

### Files Created/Modified

| File | Changes |
|------|---------|
| `docs/engineering/TODO.md` | NEW - 11 remaining items by priority |
| `docs/engineering/IMPLEMENTATION_ARCHIVE.md` | NEW - Complete feature reference |
| `docs/engineering/archive/README.md` | NEW - Archive index |
| 6 docs moved to `archive/` | Reorganization |

---

## 2026-01-18 (Session 12) - Issue #21: Category Consolidation (Miller's Law)

**Session Focus**: Reduce categories from 14 to 8 following Miller's Law for optimal cognitive load.

### What Was Done

#### Category Consolidation
Merged 14 categories into 8 for better UX:

| New Category | Merged From | Label |
|--------------|-------------|-------|
| `food_dining` | food + restaurant | "Food & Dining" |
| `work` | work + bureaucracy | "Work" |
| `daily_life` | home + time | "Daily Life" |
| `social` | social + greetings | "Social" |
| `shopping` | (unchanged) | "Shopping" |
| `transport` | (unchanged) | "Getting Around" |
| `health` | health + emergency | "Health" |
| `other` | weather + other | "Other" |

#### Backward Compatibility
- Added `CATEGORY_MIGRATION_MAP` to map legacy keys to new categories
- Added `normalizeCategory()` helper function
- `getCategoryConfig()` now handles legacy category keys transparently
- Old URLs like `/notebook/food` continue to work

#### GPT-4 Prompt Update
Updated category assignment prompt with 8 categories + descriptions for better context

#### Test Suite Updates
- Rewrote `categories.test.ts` with 26 tests for new system + backward compatibility
- Updated `categories-cognitive.test.ts` - enabled Miller's Law compliance test (17 tests)
- Updated `distractors.test.ts` mock category from `food` → `food_dining`
- All 65 tests passing

### Files Modified

| File | Changes |
|------|---------|
| `web/src/lib/config/categories.ts` | New 8-category config, migration map, normalizeCategory() |
| `web/src/app/api/words/route.ts` | Updated GPT-4 prompt with 8 categories |
| `web/src/lib/db/schema/words.ts` | Updated schema comment |
| `web/src/__tests__/lib/categories.test.ts` | Rewritten for new system |
| `web/src/__tests__/lib/categories-cognitive.test.ts` | Enabled Miller's Law test |
| `web/src/__tests__/lib/distractors.test.ts` | Updated mock category |

### Key Design Decisions

**Decision 1: Soft migration via application layer**
Used `CATEGORY_MIGRATION_MAP` instead of immediate database migration. Old category values continue to work, allowing gradual transition.

**Decision 2: Snake_case keys for new categories**
Used `food_dining` and `daily_life` for URL-safety and consistency across the codebase.

**Decision 3: Category stored as text, not enum**
Database schema uses plain text for category field, so no Drizzle migration needed - just SQL UPDATE.

### Database Migration (Completed)

Ran SQL migration to consolidate existing words:
```sql
UPDATE words SET category = 'food_dining' WHERE category IN ('food', 'restaurant');
UPDATE words SET category = 'work' WHERE category = 'bureaucracy';
UPDATE words SET category = 'daily_life' WHERE category IN ('home', 'time');
UPDATE words SET category = 'social' WHERE category = 'greetings';
UPDATE words SET category = 'health' WHERE category = 'emergency';
UPDATE words SET category = 'other' WHERE category = 'weather';
UPDATE words SET category = 'health' WHERE category = 'fitness';  -- Added: fitness is health/wellness
```

**Final category distribution:**
| Category | Count |
|----------|-------|
| other | 500 |
| work | 166 |
| daily_life | 116 |
| health | 61 |
| social | 60 |

### QA Testing Consolidation

Expanded Issue #18 (Manual QA Testing) to be comprehensive test checklist:

#### Added Test Sections
- **Section 6**: Category Consolidation Testing - 8 categories, legacy URLs, new captures
- **Section 7**: Onboarding Flow Testing (from Issue #19) - language selection, word capture, completion
- **Section 8**: Additional Coverage - auth flow, home/progress pages, InfoButton, mobile responsiveness, error states

#### Testing Coverage Summary
| Area | Status |
|------|--------|
| Sentence Generation API | ✅ |
| Review Flow (3 exercise types) | ✅ |
| Word Capture | ✅ |
| Notebook/Vocabulary | ✅ |
| Category Consolidation | ✅ |
| Onboarding Flow | ✅ |
| Auth/Home/Progress | ✅ |
| Mobile/Error Handling | ✅ |

### Next Actions
- [ ] Complete manual QA testing (Issue #18) - Reminder set for 19 Jan

---

## 2026-01-18 (Session 11) - Epic 6: Guided Onboarding Implementation

**Session Focus**: Implement guided onboarding flow for new users - language selection, word capture, and first sentence generation.

### What Was Done

#### 1. Testing Infrastructure (Added earlier in session)
- Set up Vitest with React Testing Library and jsdom
- Created 33 tests covering exercise-type, categories, distractors, and cognitive load
- Fixed bugs discovered during testing (date handling, duplicate "Other" categories)

#### 2. Word Card Enhancement
- Added relative date display ("today", "2d ago", "1w ago") to notebook word cards
- Created `formatRelativeDate()` utility function

#### 3. InfoButton Alignment Fix
- Fixed misaligned feature list in InfoButton sheet (used on 6 pages)
- Replaced flex layout with CSS Grid (`grid-cols-[36px_1fr]`) for guaranteed column alignment
- Added `max-w-sm mx-auto` container for centered, constrained width

#### 4. Onboarding API Endpoints
- **GET /api/onboarding/status**: Checks if user needs onboarding (no profile OR `onboardingCompleted: false`)
- **POST /api/onboarding/language**: Saves target + native language preferences to `user_profiles`
- **POST /api/onboarding/complete**: Marks onboarding done, optionally records first sentence ID

#### 5. Onboarding Pages (4-step flow)
- **/onboarding**: Entry point, redirects to `/onboarding/languages`
- **/onboarding/languages**: 2-step language selection (target first, then native) with flag emojis
- **/onboarding/capture**: Guided word capture with minimum 3 words, category hints for better sentences
- **/onboarding/complete**: Celebration page showing first AI-generated sentence with audio

#### 6. Routing & Redirect Logic
- Created `useOnboardingStatus` hook for client-side onboarding checks
- Home page checks onboarding status and redirects new users to `/onboarding`
- Navigation components (BottomNav, FAB) hide on `/onboarding` and `/auth` paths
- Onboarding layout ensures auth protection

### Files Created

```
web/src/lib/hooks/use-onboarding-status.ts       # Onboarding status hook
web/src/app/api/onboarding/status/route.ts       # Status check API
web/src/app/api/onboarding/language/route.ts     # Language save API
web/src/app/api/onboarding/complete/route.ts     # Completion API
web/src/app/onboarding/page.tsx                  # Entry redirect
web/src/app/onboarding/layout.tsx                # Auth protection
web/src/app/onboarding/languages/page.tsx        # Language selection
web/src/app/onboarding/capture/page.tsx          # Word capture
web/src/app/onboarding/complete/page.tsx         # Celebration
web/vitest.config.ts                             # Test configuration
web/src/__tests__/setup.tsx                      # Test setup
web/src/__tests__/lib/*.test.ts                  # Unit tests
```

### Files Modified

| File | Changes |
|------|---------|
| `web/src/lib/hooks/index.ts` | Export useOnboardingStatus |
| `web/src/app/page.tsx` | Added onboarding redirect check |
| `web/src/components/navigation/bottom-nav.tsx` | Hide on onboarding/auth paths |
| `web/src/components/navigation/fab.tsx` | Hide on onboarding/auth paths |
| `web/src/components/notebook/word-card.tsx` | Added relative date display |
| `web/src/app/api/words/categories/route.ts` | Fixed date handling bug |

### Key Design Decisions

**Decision 1: Client-side onboarding check via hook (not middleware)**
- Rationale: Middleware runs on every request and would require server-side session validation. The hook pattern gracefully integrates with the existing Zustand auth flow and only fires when the user is authenticated.
- Trade-off: Brief loading state while checking status vs. server-side redirect complexity.

**Decision 2: 2-step language selection (target first, then native)**
- Rationale: Reduces cognitive load by focusing on one decision at a time. Target language is the primary choice ("what am I learning?"), native language is secondary context.
- UX benefit: Users see their target language highlighted before moving on, creating a sense of progress.

**Decision 3: Minimum 3 words with category hints**
- Rationale: 3 words is the minimum for meaningful sentence generation. Category hints ("Try adding another food word") encourage same-category words which produce better sentences.
- Trade-off: Slightly more friction vs. better first-sentence quality.

**Decision 4: Navigation hidden via path checks (not CSS override)**
- Rationale: Cleaner than CSS hacks. Nav components already had path-based visibility logic for review sessions. Adding `/onboarding` and `/auth` to the list maintains consistency.
- Benefit: No style conflicts, easier to maintain.

**Decision 5: Local variable for sentence ID (not React state)**
- Bug fix: `setSentence()` is async, so `sentence?.id` would be undefined when calling the complete API. Capturing the ID in a local variable before calling the API prevents this race condition.
- This is a common React pitfall with async state updates.

### Technical Notes

- Uses existing `user_profiles` schema (targetLanguage, nativeLanguage, onboardingCompleted fields)
- Language codes follow ISO format: pt-PT (Portugal), pt-BR (Brazil), sv (Swedish), etc.
- Sentence generation may fail silently if not enough same-category words - graceful degradation

### Next Actions

- [ ] Manual QA testing of full onboarding flow
- [ ] Verify redirect logic works for brand-new users
- [ ] Test edge cases: skip button, back navigation, auth timeout
- [ ] Close Epic 6 GitHub issue (#19) after verification

---

## 2026-01-17 (Session 10) - Epic 4: Word Organization Implementation

**Session Focus**: Connect the notebook to real data from the 903 imported Anki words, add category browsing, and create word detail view.

### What Was Done

#### 1. Category Configuration
- **categories.ts** (`/lib/config/categories.ts`): Maps 14 database categories to Lucide icons and display labels
  - Icons: Utensils (food), UtensilsCrossed (restaurant), Briefcase (work), etc.
  - Utility functions: `getCategoryConfig()`, `getCategoryIcon()`, `getCategoryLabel()`

#### 2. Categories API Endpoint
- **GET /api/words/categories**: Returns category statistics for user's word collection
  - Total word count per category
  - Due count (words with retrievability < 0.9 OR nextReviewDate <= now)
  - Inbox count (words created in last 24h without review)
  - Uses Drizzle ORM conditional aggregation for efficient single query

#### 3. Words Store Updates
- Added categories state: `categories`, `categoriesLoading`, `inboxCount`
- Added `selectedWord` for detail view
- Added `fetchCategories()` API action
- Added `setSelectedWord()` setter

#### 4. UI Components
- **NotebookSkeleton** + **CategoryDetailSkeleton**: Animated loading placeholders with staggered pulse animations
- **MasteryBadge**: Color-coded status indicator (Learning=sepia, Learned=taupe, Mastered=teal)
- **WordCard**: Word list item with audio button, text, translation, and mastery badge
- **WordDetailSheet**: Bottom sheet with full word details, stats, audio playback, and delete option

#### 5. Pages
- **Updated /notebook page**: Now fetches real category data from API, handles loading/error/empty states
- **New /notebook/[category] page**: Category detail view with word list, search, and detail sheet integration

### Files Created

```
web/src/lib/config/categories.ts              # Category icon mapping
web/src/app/api/words/categories/route.ts     # Categories API endpoint
web/src/app/notebook/[category]/page.tsx      # Category detail page
web/src/components/notebook/word-card.tsx     # Word list item
web/src/components/notebook/word-detail-sheet.tsx  # Detail bottom sheet
web/src/components/notebook/mastery-badge.tsx # Status indicator
web/src/components/notebook/notebook-skeleton.tsx  # Loading states
```

### Files Modified

| File | Changes |
|------|---------|
| `web/src/lib/store/words-store.ts` | Added categories state and fetchCategories action |
| `web/src/app/notebook/page.tsx` | Replaced mock data with real API calls |
| `web/src/components/notebook/index.ts` | Exported new components |

### Key Design Decisions

1. **Single query for categories**: Uses SQL conditional aggregation (`count(*) filter (where ...)`) to get both total and due counts in one database round-trip
2. **Mastery color scheme**: Semantic colors matching Moleskine aesthetic (sepia for learning, teal for mastered)
3. **Bottom sheet pattern**: Uses Radix Sheet `side="bottom"` for mobile-friendly word detail view
4. **Event bubbling prevention**: Audio button clicks use `stopPropagation()` to prevent triggering card navigation

### Next Actions

- Test all flows with real 903-word dataset at http://localhost:3000/notebook
- Verify audio playback works correctly
- Consider adding pagination for large categories
- Optional: Implement custom tags CRUD (T4.4)

---

## 2026-01-17 (Session 9) - Epic 2 UI: Sentence-Based Review Integration

**Session Focus**: Complete Epic 2 UI work by integrating sentence-based exercises into the review flow

### What Was Done

#### 1. Created Exercise Input Components
- **FillBlankInput** (`fill-blank-input.tsx`): Text input for typing blanked words
  - Case-insensitive validation
  - Green/red border feedback on correct/incorrect
  - Submit on Enter or button click
- **MultipleChoiceOptions** (`multiple-choice-options.tsx`): 2x2 grid of translation choices
  - 4 options (1 correct + 3 distractors from same category)
  - Visual feedback highlighting correct/incorrect after selection
- **AnswerFeedback** (`answer-feedback.tsx`): Shows "Correct!" or "Not quite. The answer was: X"

#### 2. Created Distractors Utility
- **distractors.ts** (`/lib/review/distractors.ts`): Utilities for multiple choice exercises
  - `fetchDistractors()`: Gets same-category words via `/api/words?excludeId=`
  - `shuffleArray()`: Fisher-Yates shuffle
  - `buildMultipleChoiceOptions()`: Combines correct + distractors
  - `prepareMultipleChoiceOptions()`: Convenience wrapper

#### 3. Enhanced Existing Components
- **SentenceCard**: Added `children` prop to render exercise inputs below sentence
- **GradingButtons**: Added `suggestedGrade` prop to pre-highlight after wrong answer
- **/api/words**: Added `excludeId` query parameter for distractor filtering

#### 4. Full Review Page Integration
- Dual-mode architecture: sentence mode (lines 348-548) vs word mode (lines 551-716)
- Session initialization tries `fetchNextSentence()` first
- Exercise type determined dynamically based on target words' mastery levels
- Three exercise types supported:
  - `fill_blank`: Type the missing word
  - `multiple_choice`: Choose correct translation from 4 options
  - `type_translation`: Existing reveal flow (no new input needed)
- Wrong answers still show grading, but pre-select "Hard"

### Files Created

```
web/src/components/review/fill-blank-input.tsx      # Fill-in-blank text input
web/src/components/review/multiple-choice-options.tsx # 4-option grid
web/src/components/review/answer-feedback.tsx       # Correct/incorrect feedback
web/src/lib/review/distractors.ts                   # Distractor fetching utilities
```

### Files Modified

| File | Changes |
|------|---------|
| `web/src/components/review/sentence-card.tsx` | Added `children` prop for exercise inputs |
| `web/src/components/review/grading-buttons.tsx` | Added `suggestedGrade` prop |
| `web/src/components/review/index.ts` | Exported new components |
| `web/src/app/api/words/route.ts` | Added `excludeId` query param |
| `web/src/app/review/page.tsx` | Full sentence mode integration |

### Key Decisions

1. **Distractors from user's vocabulary** - Same-category words fetched client-side
2. **Client-side answer validation** - Correct answer already in `sentenceTargetWords`
3. **Wrong answer = still show grading** - Pre-select "Hard" but let user override
4. **Progressive difficulty** - Exercise type based on mastery (multiple_choice → fill_blank → type_translation)

### Next Actions

- [ ] Manual QA testing of all three exercise types
- [ ] Verify sentence grading applies to ALL words in sentence
- [ ] Test fallback to word mode when no sentences available
- [ ] Consider closing Epic 2 GitHub issue (#17)

---

## 2026-01-17 (Session 8) - InfoButton Component & Auth Page Styling

**Session Focus**: Replace BrandWidget logo with InfoButton across app, improve auth page styling

### What Was Done

#### 1. Created InfoButton Component
- New component `info-button.tsx` replaces BrandWidget across all app screens
- Uses small LLYLI logo (40px) as trigger with Moleskine notebook styling
- Opens bottom Sheet (not Dialog) with full brand experience:
  - Logo, title, subtitle
  - 4 feature cards: Capture Phrases, Native Audio, Smart Reviews, Real Context
  - Footer with version info

#### 2. Updated All App Pages to Use InfoButton
Replaced BrandWidget with InfoButton on:
- Home page (`/page.tsx`)
- Notebook page (`/notebook/page.tsx`)
- Progress page (`/progress/page.tsx`)
- Capture page (`/capture/page.tsx`)
- Review Complete page (`/review/complete/page.tsx`)
- Review Header component (`review-header.tsx`)

#### 3. Enhanced Auth Pages
- Added LLYLI logo (88px) to sign-in and sign-up pages
- Fixed text readability issues:
  - Used `.heading-serif` class from design system
  - Pure black (#000000) color with fontWeight 700
  - Darker subtitle gray (#5A6268)

#### 4. Created GitHub Issues
- Issue #18: Manual QA Testing at localhost:3000
- Issue #19: Epic 6 - Guided Onboarding for New Users

### Files Created

```
web/src/components/brand/info-button.tsx   # New InfoButton component
```

### Files Modified

| File | Changes |
|------|---------|
| `web/src/components/brand/index.ts` | Export InfoButton |
| `web/src/app/auth/sign-in/page.tsx` | Added logo, fixed heading styling |
| `web/src/app/auth/sign-up/page.tsx` | Added logo, fixed heading styling |
| `web/src/app/page.tsx` | BrandWidget → InfoButton |
| `web/src/app/notebook/page.tsx` | BrandWidget → InfoButton |
| `web/src/app/progress/page.tsx` | BrandWidget → InfoButton |
| `web/src/app/capture/page.tsx` | BrandWidget → InfoButton |
| `web/src/app/review/complete/page.tsx` | BrandWidget → InfoButton |
| `web/src/components/review/review-header.tsx` | BrandWidget → InfoButton |

### Key Design Decisions

**Decision 1: Keep LLYLI logo as trigger (not generic info icon)**
User preferred Moleskine aesthetic over generic Lucide info icon. Small logo serves as recognizable brand touch.

**Decision 2: Bottom Sheet over Dialog**
Sheet slides up from bottom, feels more native on mobile, less intrusive than centered dialog.

**Decision 3: Strategic logo placement**
- Auth pages: Large (88px) for brand introduction
- In-app: Small (40px) as subtle info trigger
- Info sheet: Medium (72px) for full brand experience

### Next Steps
- Replace InfoButton trigger icon with Moleskine-styled info icon (user requested)

---


---

> **Older sessions**: See [CHANGELOG-ARCHIVE.md](./CHANGELOG-ARCHIVE.md) for sessions 1-7
