# LLYLI Project Log

> Single source of truth for project status and history.

## Quick Start
```bash
cd web && npm run dev     # localhost:3000
npm run build             # Production build
```

## Current Status

### Recently Completed
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
- [x] **Auth Bug Fix + Starter Words** - Email confirmation UI, improved sign-in errors, 10 starter words per language (Session 28)

### In Progress
- [ ] **Sentence generation** - Backend works, review integration exists, needs E2E testing
- [ ] **PWA offline caching** - Basic setup done, needs testing
- [ ] **iOS App Store** - Capacitor setup complete, needs submission

### Not Started
- **Stripe payments** - Post-MVP priority

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
| `web/src/lib/db/schema/user-feedback.ts` | User feedback schema for bug reports and feature requests |
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
- ~~#52~~ **P3-low** - Fixed: Auth redirect - unauthenticated users now redirect to sign-in (Session 37)
- ~~#43~~ **BLOCKER** - Fixed: Language filtering via shared helper in all word queries
- ~~#50~~ **P0-critical** - Fixed: E2E User Flow Verification - all 3 test users pass (Session 30)

## Open Feature Issues
| Issue | Feature | Priority |
|-------|---------|----------|
| #51 | Review page misleading for unauth users | P2-normal |
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

### Session 41 - 2026-01-20 - Pre-Launch Review: Search, Science, UX Polish

**Focus**: Implement pre-launch review plan covering user journey, gamification verification, journal search, and theory presentation.

#### Changes Made

**1. Journal Search Enhancement (P1)** (`web/src/app/notebook/page.tsx`)
- Added debounced word search (300ms delay, min 2 chars)
- Search queries `/api/words?search=` which searches both `originalText` and `translation`
- Shows "Search Results" section with match count when searching
- Hides categories and attention sections during search
- Results link to category page with `?highlight=wordId` param
- Clear search button on no results
- Updated search placeholder: "Search words & categories..."

**2. Science Page Addition (P2)** (`web/src/app/science/page.tsx`)
- Added new "Words That Connect" section between "Less Grinding" and "Your Life, Your Words"
- Explains LLYLI's unique differentiator: combining 2-4 words in fresh sentences
- Includes "Interleaved Practice" research note
- Stat callout: "4-6× faster acquisition from varied contexts"

**3. Onboarding Copy Update (P2)** (`web/src/app/onboarding/complete/page.tsx`)
- Updated starter words message: "We've added 10 starter phrases – essentials like greetings, thanks, and common requests."

**4. Testing Documentation (P1)** (`docs/engineering/TESTING.md`)
- Added D4: Search within category
- Added D5: Global notebook search
- Added D6: Search no results

#### Gamification Status Verified
All MVP gamification features confirmed production-ready:
- ✅ Daily goals (10 reviews/day with celebration)
- ✅ Streak system (consecutive days + 1 free freeze)
- ✅ Bingo board (3×3 with 9 squares, win detection)
- ✅ Boss round (unlocks after daily goal, 5 hardest words, 90s timer)

Post-MVP features scoped out: Story Run, Category Hunt, Real Life Missions

#### Testing
- `npm run build` ✓
- `npm run test:run` ✓ (65 tests)
- E2E via Playwright: Notebook search verified (3 results for "obrigado")
- Science page "Words That Connect" section verified

#### Files Modified
- `web/src/app/notebook/page.tsx` - Word search functionality
- `web/src/app/science/page.tsx` - New science section
- `web/src/app/onboarding/complete/page.tsx` - Updated copy
- `docs/engineering/TESTING.md` - D4, D5, D6 test cases

---

### Session 40 - 2026-01-20 - Launch Plan Implementation: Bug Fixes + Notebook Journal

**Focus**: Implement the LLYLI Launch Plan - fix 4 critical bugs and transform notebook into a personal language journal

#### Phase 1: Bug Fixes (4 ship-blocking bugs)

**Bug 1: Race Condition in Review Stats** (`web/src/app/api/reviews/route.ts`)
- Problem: Multiple async calls to `getSessionStats()` could interleave, corrupting `wordsReviewed` count
- Fix: Atomic SQL increment using `sql` template: `sql\`${reviewSessions.wordsReviewed} + 1\``

**Bug 2: Wrong Language Sentences** (`web/src/app/api/sentences/generate/route.ts`)
- Problem: Hardcoded `DEFAULT_LANGUAGE_PREFERENCE` meant Swedish learners got Portuguese sentences
- Fix: Use `getUserLanguagePreference(user.id)` like other routes

**Bug 3: Silent Review Failures** (`web/src/lib/store/review-store.ts`)
- Problem: Sentence review submitted words one-by-one; if word 2 failed, user saw success but stats were wrong
- Fix: `Promise.allSettled()` batches all submissions, validates all succeed before updating store

**Bug 4: Auth State on Review Page** (`web/src/app/review/page.tsx`)
- Problem: Showed "All caught up!" to logged-out users
- Fix: Only show completion when `user && sessionId` are present

#### Phase 3: Notebook as Personal Journal

**New Components:**
| Component | File | Purpose |
|-----------|------|---------|
| `JournalHeader` | `web/src/components/notebook/journal-header.tsx` | "Your Portuguese Journal" with personal stats |
| `AttentionSection` | `web/src/components/notebook/attention-section.tsx` | Words with 3+ lapses that need extra help |
| `StatusBadge` | `web/src/components/notebook/mastery-badge.tsx` | NEW/LEARNING/DUE/MASTERED/STRUGGLING badges |

**New APIs:**
| Endpoint | Purpose |
|----------|---------|
| `/api/words/stats` | Total words, mastered count, due today, needs attention |
| `/api/words/attention` | Struggling words (3+ lapses) with sentence context |

**Updated:**
- `WordCard` - Now expandable with sentence, memory context, audio, review stats
- `NotebookPage` - JournalHeader + AttentionSection + categories

#### Phase 4: Polish

**Audio Timeout** (`web/src/lib/store/words-store.ts`)
- Added `audioFailedIds` tracking for words that timeout
- `retryAudioGeneration()` method to retry via `/api/words/[id]/regenerate-audio`
- UI can now show error state with retry button

**Input Limits** (`web/src/app/api/words/route.ts`)
- Max 500 characters (hard limit, blocks submission)
- Duplicate warning within 24h (soft warning, allows but notifies)

#### Files Changed

| File | Change |
|------|--------|
| `web/src/app/api/reviews/route.ts` | Atomic SQL increment for stats |
| `web/src/app/api/sentences/generate/route.ts` | Use user's language preference |
| `web/src/lib/store/review-store.ts` | Batch sentence review with Promise.allSettled |
| `web/src/app/review/page.tsx` | Auth state check for completion |
| `web/src/app/api/words/stats/route.ts` | NEW - Journal stats endpoint |
| `web/src/app/api/words/attention/route.ts` | NEW - Struggling words endpoint |
| `web/src/app/api/words/[id]/regenerate-audio/route.ts` | NEW - Audio retry endpoint |
| `web/src/components/notebook/journal-header.tsx` | NEW - Personal stats header |
| `web/src/components/notebook/attention-section.tsx` | NEW - Struggling words section |
| `web/src/components/notebook/mastery-badge.tsx` | Added StatusBadge component |
| `web/src/components/notebook/word-card.tsx` | Expandable cards with context |
| `web/src/components/notebook/index.ts` | Export new components |
| `web/src/app/notebook/page.tsx` | Integrated new components |
| `web/src/lib/store/words-store.ts` | Audio failure tracking + retry |
| `web/src/app/api/words/route.ts` | Input limits (500 chars, duplicate check) |

**Build:** ✓ Passed
**Tests:** ✓ 65 tests passed

#### Deployment

**Issue Found**: Initial `vercel --prod` deployed old code because changes weren't committed. Vercel auto-deploys from `main` branch only.

**Resolution**:
```bash
git add -A
git commit -m "feat: LLYLI Launch Plan - bugs, notebook journal, polish"
git push origin main  # Triggers Vercel auto-deploy
```

**Commit**: `7d80fcd` (19 files, 1405 insertions)

#### Production E2E Verification

| Feature | Status | Details |
|---------|--------|---------|
| JournalHeader | ✅ | "Your Portuguese Journal" with stats |
| Stats API | ✅ | `/api/words/stats` returns correct data |
| StatusBadge | ✅ | New/Due/Learning badges on word cards |
| Word Detail | ✅ | Expandable with stats, audio, review date |
| Review Page | ✅ | Session working, 9 due words |

**Production URL**: https://web-eta-gold.vercel.app

---

### Session 39 - 2026-01-20 - Bug Fixes: Capture Speed, Bingo Navigation, Sentence Translations

**Focus**: Fix three bugs impacting user experience

**Bug 1: Slow Capture Flow** (~10s → ~2-4s)
- Root cause: Sequential API calls blocking response
- Fix: Parallelize translation + category assignment, make audio generation non-blocking
- User sees word immediately, audio button shows spinner until audio is ready

| File | Change |
|------|--------|
| `web/src/app/api/words/route.ts` | `Promise.all()` for translate+category, background audio generation |
| `web/src/lib/store/words-store.ts` | Added `pollForAudio()` and `isAudioGenerating()` for client-side polling |
| `web/src/components/home/phrase-card.tsx` | Added `audioGenerating` prop for loading state |
| `web/src/components/home/captured-today-list.tsx` | Pass `audioGenerating` to PhraseCard |

**Bug 2: Bingo Cards Don't Navigate**
- Root cause: Squares were plain `<div>` elements with no click handlers
- Fix: Added `SQUARE_ACTIONS` mapping with routes and tooltips

| File | Change |
|------|--------|
| `web/src/components/gamification/bingo-board.tsx` | Added `SQUARE_ACTIONS` config, click handlers, hover tooltips, visual affordances |

**Bug 3: Sentences Missing Translations**
- Root cause: Schema missing `translation` column, API not saving it
- Fix: Added column, save translation on generation, display with fallback

| File | Change |
|------|--------|
| `web/src/lib/db/schema/sentences.ts` | Added `translation` column |
| `web/src/app/api/sentences/generate/route.ts` | Save `result.translation` |
| `web/src/app/api/words/route.ts` | Save `result.translation` in background sentence gen |
| `web/src/app/review/page.tsx` | Display sentence translation with word-by-word fallback |

**Migration**: `ALTER TABLE "generated_sentences" ADD COLUMN "translation" text;`

---

### Session 38 - 2026-01-20 - Global Feedback Button + OAuth Setup Docs

**Focus**: Add visible feedback button to all pages, document OAuth setup for future implementation

**UI Changes**
| Component | Change |
|-----------|--------|
| `FeedbackButton` | New coral ribbon-style button on left side of screen |
| `layout.tsx` | Added `<FeedbackButton />` globally alongside FAB and BottomNav |
| `info-button.tsx` | Removed duplicate feedback button from LLYLI info menu |

**Design Decisions**
- Button positioned on left side (mirrors FAB on right) for visual balance
- Uses coral (`--accent-ribbon`) ribbon style consistent with Moleskine aesthetic
- Expands slightly on hover, shows "Feedback" text on larger screens
- Hidden on auth/onboarding/review-session pages (same as other nav elements)

**Documentation Added**
| File | Purpose |
|------|---------|
| `docs/engineering/AUTH_SETUP.md` | Complete guide for Google/Apple OAuth + iOS Capacitor setup |

**GitHub Issues Created**
| Issue | Title |
|-------|-------|
| #53 | Enable Google Sign-In |
| #54 | Enable Apple Sign-In (requires $99/yr Apple Developer) |
| #55 | Fix email confirmation / disable for MVP |

**Note**: Email confirmation disabled in Supabase dashboard (SMTP delivery bug). OAuth code ready but needs Supabase provider configuration.

---

### Session 37 - 2026-01-20 - Auth Fix + Documentation Cleanup + E2E Testing

**Focus**: Fix critical auth redirect bug, consolidate documentation, E2E testing with 3 users

**Bug Fixed**
- **#52 Auth redirect**: Unauthenticated users were seeing the homepage instead of being redirected to sign-in. Fixed by enabling route protection in middleware (was intentionally disabled during development).

**Code Changes**
| File | Change |
|------|--------|
| `web/src/lib/supabase/middleware.ts` | Enabled `protectedPaths` array + cache control headers to prevent edge caching |
| `web/src/app/page.tsx` | Enabled client-side auth redirect (was commented out during dev) |
| `web/scripts/generate-presentation.ts` | Fixed TypeScript literal type error (`as const`) |

**Documentation Cleanup**
| Action | Files |
|--------|-------|
| Consolidated | `README.md` (217→102 lines), `web/README.md` (408→56 lines) |
| Removed | `web/START_HERE.md` (outdated), `docs/active/` (empty templates) |
| Archived | `docs/SESSION_SUMMARY_2026-01-16.md` → `docs/engineering/archive/` |
| Updated | `docs/engineering/TESTING.md` - Added build verification section |
| Added | `.gitignore` - Added `.playwright-mcp/` for test artifacts |

**E2E Testing Results**
| User | Language | Sign In | Capture | Review | Notebook | Progress |
|------|----------|---------|---------|--------|----------|----------|
| test-en-pt | EN→PT | ✅ | ✅ (saudade→longing) | ✅ | ✅ | ✅ |
| test-en-sv | EN→SV | ✅ | ✅ (lagom→just right) | ✅ | ✅ | ✅ |
| test-nl-en | NL→EN | ✅ | ✅ (gezellig) | ✅ | ✅ | ✅ |

**Auth Redirect Fix Verified**: Unauthenticated users are now correctly redirected to `/auth/sign-in`.

---

### Session 36 - 2026-01-20 - Go-Live Preparation

**Focus**: Create go-live documentation including account security verification, app journey presentation, and user-facing materials

**Deliverables Created**
| Deliverable | Location | Purpose |
|-------------|----------|---------|
| PowerPoint presentation | `docs/go-live/LLYLI-App-Journey.pptx` | 13-slide deck with speaker notes |
| GitHub documentation | `docs/go-live/README.md` | Comprehensive page with embedded screenshots |
| Technical documentation | `docs/go-live/GO_LIVE_PREPARATION.md` | Security details and data persistence |
| Screenshots | `docs/go-live/screenshots/` | 11 app screenshots for presentations |
| Generation script | `web/scripts/generate-presentation.ts` | Regenerate PPTX if needed |

**Code Changes**
| File | Change |
|------|--------|
| `web/src/app/auth/sign-up/page.tsx` | Added "Your progress is securely saved to the cloud" trust indicator |
| `web/src/app/onboarding/complete/page.tsx` | Added "Your progress is safely synced to your account" message |

**Screenshots Captured**
| Screenshot | Description |
|------------|-------------|
| 01-today-dashboard.png | Main home screen with daily progress |
| 02-capture-page.png | Phrase capture interface |
| 03-review-question.png | Review mode - question |
| 04-review-answer.png | Review mode - answer with ratings |
| 05-notebook.png | Notebook browser with categories |
| 06-progress.png | Progress tracking dashboard |
| 07-sign-up.png | Account creation page |
| 08-onboarding-language.png | Target language selection |
| 09-onboarding-native.png | Native language selection |
| 10-onboarding-capture.png | Initial word capture |
| 11-onboarding-complete.png | Onboarding celebration |

**Presentation Slides (13 total)**
1. Welcome to LLYLI / Sign-up
2. Choose Your Target Language
3. Set Your Native Language
4. Add Your First Words
5. Your Notebook is Ready
6. Your Daily Dashboard
7. Capturing Phrases
8. Review: The Question
9. Review: The Answer
10. Your Notebook
11. Track Your Progress
12. Daily Usage
13. The LLYLI Promise

**Security Verification**
- Supabase Auth with bcrypt password hashing
- JWT tokens in HTTP-only cookies
- User data isolation via userId filtering on all queries
- Cloud-synced progress with automatic backups

**Build & Tests**
- `npm run build` ✅ Pass
- `npm run test:run` ✅ Pass

**Dependencies Added**
- `pptxgenjs` (dev) - PowerPoint generation

---

### Session 35 - 2026-01-20 - User Feedback Form

**Focus**: Implement in-app feedback form for bug reports, feature requests, and general feedback

**Feature Overview**
Allow users to submit feedback directly within the app. Accessible via "Give Feedback" button in the About LLYLI sheet. Supports three feedback types: Bug Report, Feature Request, and General Feedback.

**Schema Changes**
| Column | Type | Purpose |
|--------|------|---------|
| `id` | uuid | Primary key |
| `user_id` | uuid | References Supabase auth user |
| `type` | text enum | 'bug_report', 'feature_request', 'general_feedback' |
| `message` | text | Feedback content (max 5000 chars) |
| `page_context` | text | Auto-captured: which page user was on |
| `created_at` | timestamp | When feedback was submitted |

**Changes Made**
| Change | Details |
|--------|---------|
| Database schema | Created `user_feedback` table with type enum and message |
| API endpoint | `POST /api/feedback` with auth, validation, max length check |
| Feedback sheet | Bottom sheet with type selector pills, textarea, character counter |
| Info button | Added "Give Feedback" button between Science and Sign Out |
| Success state | Checkmark animation with "Thank you!" message |

**Files Created**
| File | Purpose |
|------|---------|
| `web/src/lib/db/schema/user-feedback.ts` | Database schema + FEEDBACK_TYPES constant |
| `web/src/app/api/feedback/route.ts` | POST endpoint with validation |
| `web/src/components/feedback/feedback-sheet.tsx` | Bottom sheet UI component |
| `web/src/components/feedback/index.ts` | Barrel export |

**Files Modified**
| File | Change |
|------|--------|
| `web/src/lib/db/schema/index.ts` | Export user-feedback schema |
| `web/src/components/brand/info-button.tsx` | Added MessageSquare icon, feedback state, button |

**Build & Tests**
- `npm run build` ✅ Pass
- `npm run test:run` ✅ Pass (65/65 tests)
- `npm run db:push --force` ✅ Pass (table created)

**E2E Verification** (Playwright MCP on localhost)
| Step | Result |
|------|--------|
| Open About LLYLI sheet | ✅ "Give Feedback" button visible |
| Click "Give Feedback" | ✅ Feedback sheet opens |
| Select type (Feature Request) | ✅ Placeholder updates dynamically |
| Enter message | ✅ Character counter shows 46/5000 |
| Submit feedback | ✅ Success state: "Thank you!" with checkmark |

---

### Session 34 - 2026-01-20 - Personal Memory Journal Feature

**Focus**: Implement Memory Context feature - turning vocabulary capture into a personal memory journal by adding WHERE/WHEN context to phrases

**Feature Overview**
Transform the notebook from a vocabulary list into a memory journal where each phrase is tied to WHERE and WHEN it was captured. This makes reviewing feel like revisiting memories, not just flashcards.

**Schema Changes**
| Column | Type | Purpose |
|--------|------|---------|
| `location_hint` | text | Where you heard/used the phrase (e.g., "at the bakery") |
| `time_of_day` | text enum | Auto-detected: morning/afternoon/evening/night |
| `situation_tags` | text[] | Social/emotional context (e.g., ["nervous", "alone"]) |
| `personal_note` | text | Margin-note style memory (e.g., "My first time ordering alone!") |

**Changes Made**
| Change | Details |
|--------|---------|
| Database schema | Added 4 new columns to words table |
| Capture page | Added collapsible "Add memory context" accordion with location, tags, note fields |
| API update | Words API accepts memoryContext, auto-detects timeOfDay from server timestamp |
| Words store | Updated captureWord to accept memoryContext option |
| Word card | Subtle context line below translation (e.g., "at the bakery · evening") |
| Word detail sheet | New "Context" section with teal left border (margin-note aesthetic) |
| Review page | Memory hint appears after answer reveal ("Remember: at the bakery · Nervous, Alone") |
| Bingo board | Replaced "Type translation" with "Add memory context" square (📍) |
| Gamification | New `word_captured_with_context` event type triggers bingo square |
| Science page | Added "Retrieval anchors" bullet and Encoding Specificity research note |
| Testing docs | Added comprehensive Memory Context testing section (C7-C12) |

**Situation Tags Available** (Lucide icons, Moleskine styling)
| Tag | Icon | Tag | Icon |
|-----|------|-----|------|
| Alone | User | With loved one | Heart |
| With friends | Users | At work | Briefcase |
| Shopping | ShoppingBag | Dining out | UtensilsCrossed |
| Outdoor | TreePine | Nervous | Frown |
| Proud | Trophy | | |

**Design Updates (based on research)**
- Changed "With partner" → "With loved one" (more inclusive)
- Added "Outdoor" tag with TreePine icon
- Replaced emojis with Lucide icons for Moleskine consistency
- Rebranded note field: "What will help you remember?" with placeholder "The context, a usage tip, or a memory..."
- Word detail: "Context" header (was "Memory"), cleaner note display without quotes
- Research shows emotional context aids retention (encoding specificity) while allowing professional/linguistic notes

**Files Changed**
| File | Change |
|------|--------|
| `web/src/lib/db/schema/words.ts` | Added 4 memory context columns |
| `web/src/lib/config/memory-context.ts` | **NEW** - Constants, types, helpers for memory context |
| `web/src/app/capture/page.tsx` | Added context accordion UI with tag pills |
| `web/src/app/api/words/route.ts` | Accept memoryContext, auto-detect timeOfDay |
| `web/src/lib/store/words-store.ts` | Updated captureWord signature |
| `web/src/components/notebook/word-card.tsx` | Added context line display |
| `web/src/components/notebook/word-detail-sheet.tsx` | Added Memory section |
| `web/src/app/review/page.tsx` | Added memory hint after reveal |
| `web/src/lib/db/schema/gamification.ts` | Changed `typeTranslation` to `addContext` |
| `web/src/app/api/gamification/event/route.ts` | Added `word_captured_with_context` handler |
| `web/src/lib/store/gamification-store.ts` | Added `emitWordCapturedWithContext` action |
| `web/src/components/gamification/bingo-board.tsx` | Updated labels for addContext square |
| `web/src/app/science/page.tsx` | Added Encoding Specificity research note |
| `docs/engineering/TESTING.md` | Added Memory Context testing section (C7-C12) |

**Build & Tests**
- `npm run build` ✅ Pass
- `npm run test:run` ✅ Pass (65/65 tests)
- `npm run db:push` ✅ Pass (4 columns added)

**Production Verified** ✅
- Capture page: "Add memory context" accordion with 9 Lucide icon tags
- Note field: "What will help you remember?" with flexible placeholder
- Word detail: "Context" header, clean note display without quotes
- Full E2E test: captured "boa tarde" with location, tags, and note - all displayed correctly

---

### Session 33 - 2026-01-20 - Science Page + Forecast Chart Fix

**Focus**: Add educational Science page, fix forecast chart weekday labels, crisp up copy

**Changes Made**
| Change | Details |
|--------|---------|
| Created `/science` page | Moleskine design explaining FSRS algorithm and learning science |
| Added Science link | "The Science Behind LLYLI" button in InfoButton sheet |
| Fixed forecast chart | Changed "Tmrw" to actual weekday names (Wed, Thu, etc.) |
| Made Science copy crisper | Shortened paragraphs, punchier bullet points |
| Documented date conventions | Added date formatting rules to design system and CLAUDE.md |

**Files Changed**
| File | Change |
|------|--------|
| `web/src/app/science/page.tsx` | **NEW** - Science explanation page with 4 sections |
| `web/src/components/brand/info-button.tsx` | Added FlaskConical icon and Science button |
| `web/src/components/progress/forecast-chart.tsx` | Fixed formatDay to use actual weekday names |
| `docs/design/design-system.md` | Added Date & Time Formatting Conventions section |
| `.claude/CLAUDE.md` | Added Dates rule to Design System section |

**Date Formatting Convention**
- Charts: `{ weekday: "short" }` → "Wed"
- Feedback: `{ weekday: "long" }` → "Wednesday"
- Never use "Tmrw" or "Tomorrow" as labels

---

### Session 32 - 2026-01-20 - Deep E2E Testing, Sign Out, Progress Streak Fix

**Focus**: Comprehensive E2E testing of full user journey including gamification, fix bugs found during testing

**Bugs Found & Fixed**
| Bug | Fix | File |
|-----|-----|------|
| No Sign Out option | Added Sign Out button to About LLYLI sheet | `info-button.tsx:150-164` |
| Confusing Bingo labels | Changed "MC"→"Pick", "Fill"→"Fill in the blank" | `bingo-board.tsx:23-33` |
| Progress streak discrepancy | Now uses `streakState` table (same as gamification) | `api/progress/route.ts:129-133, 276-282` |

**Changes Made**
| Change | Details |
|--------|---------|
| Added Sign Out | Sign Out button in About LLYLI sheet, redirects to /auth/sign-in |
| Fixed Bingo labels | Clearer labels: "Pick" / "Multiple choice", "Type" / "Type translation" |
| Fixed Progress streak | Progress API now queries `streakState` table for consistency with Home page |
| Consolidated testing docs | Merged into `/docs/engineering/TESTING.md`, deleted 3 redundant files |
| Updated CLAUDE.md | Added CRITICAL emphasis on testing after EVERY code change |

**Deep E2E Test Results** (Playwright MCP on production)
| Test | Details | Result |
|------|---------|--------|
| Auth - Sign in | test-en-pt@llyli.test | ✅ Pass |
| Capture flow | "Onde está a casa de banho?" → "Where is the bathroom?" + TTS | ✅ Pass |
| Review - 19 reviews | Completed daily goal (19/10) | ✅ Pass |
| Daily Goal | 0/10 → 19/10 "Goal Complete!" | ✅ Pass |
| Day Streak | 0 → 1 after goal completion | ✅ Pass |
| Daily Bingo | 2/9 → 4/9 squares completed | ✅ Pass |
| **Boss Round** | Prompted after goal complete, 5/5 perfect score in 0:52 | ✅ Pass |
| Notebook | Categories: Social (9), Food & Dining (4), Getting Around (2), Shopping (1) | ✅ Pass |
| Word details | Modal shows phrase, translation, review stats, next review date | ✅ Pass |
| Progress dashboard | Stats display with streak from gamification state | ✅ Pass |
| **Sign Out** | Button visible in About sheet, redirects to /auth/sign-in | ✅ Pass |
| Build | `npm run build` | ✅ Pass |
| Unit tests | 65/65 tests pass | ✅ Pass |

**Commit**: `fix: add sign out, fix bingo labels, sync progress streak` (11535de)

**Files Changed**
- `web/src/components/brand/info-button.tsx` - Added Sign Out button with auth store integration
- `web/src/components/gamification/bingo-board.tsx` - Clearer bingo square labels
- `web/src/app/api/progress/route.ts` - Query `streakState` for consistent streak data
- `docs/engineering/TESTING.md` - Added integration test scripts section
- `.claude/CLAUDE.md` - Enhanced testing section with CRITICAL emphasis
- Deleted: `web/TESTING_GUIDE.md`, `web/QUICK_TEST.md`, `TESTING_READY.md`

---

### Session 31 - 2026-01-20 - Vercel Deployment Fix + Sentence Generation Verification

**Focus**: Fix failing Vercel deployments causing repeated error emails

**Root Cause Analysis**
| Problem | Root Cause | Fix |
|---------|------------|-----|
| Duplicate deployments per push | GitHub integration + CLI both triggered | Dashboard config fixed |
| GitHub deploy always failed | Root Directory not set, built from `/` instead of `/web` | Set Root Directory = `web` |
| "Can't find pages/app directory" | Next.js app in subdirectory, Vercel looking at repo root | Root Directory setting |

**Investigation Steps**
1. `vercel list` showed Error/Ready pairs for same commits
2. `vercel inspect --logs` revealed: "Cloning github.com/..." (GitHub) vs "Downloading files" (CLI)
3. Failed builds showed: `Error: Couldn't find any 'pages' or 'app' directory`
4. Successful builds showed: `Running "npm run build"` in correct directory

**Fix Applied**
| Setting | Location | Value |
|---------|----------|-------|
| Root Directory | Vercel Dashboard → Project Settings → General | `web` |

**Verification**
| Before | After |
|--------|-------|
| 2 deployments per push (1 Error, 1 Ready) | 1 deployment per push (Ready) |
| GitHub deploy → Error (7-9s) | GitHub deploy → Ready (41s) |
| CLI deploy → Ready (redundant) | N/A |

**Sentence Generation Testing**
| Metric | Result |
|--------|--------|
| Avg generation time | ~5 seconds (includes GPT + TTS + upload + DB) |
| User-facing latency | Instant (background fire-and-forget) |
| Sentences appearing in review | ✅ Verified - "A conta, por favor, e um café também" |

**Files Changed**
| File | Change |
|------|--------|
| `.gitignore` | Added `.vercel` to prevent accidental commits |

**Transcript Reference**: `docs/reference/VibecodeLisboatranscripts.md` documents same Root Directory issue (lines 878-880)

---

### Session 30 - 2026-01-20 - Language Filtering Fix + Testing Infrastructure

**Focus**: Fix critical bug where words captured in target language weren't appearing in notebook/review

**Bug Analysis**
| Problem | Root Cause | Fix |
|---------|------------|-----|
| Words not showing in notebook | Query used `targetLang = user.targetLanguage` | Changed to OR: `sourceLang = target OR targetLang = target` |
| Semantic mismatch | `words.targetLang` = translation language, not user's target | Both columns now checked |
| English missing from target languages | `TARGET_LANGUAGES` array in onboarding didn't include "en" | Added "en" to array |

**Files Changed (Language Filter)**
| File | Lines | Change |
|------|-------|--------|
| `api/words/route.ts` | 193-202 | GET query uses OR logic |
| `api/words/categories/route.ts` | 55-64, 110-117 | Category stats + inbox count |
| `api/reviews/route.ts` | 52-63 | Due words query |
| `api/progress/route.ts` | 5 queries | All word stats |
| `api/sentences/next/route.ts` | 54-62 | Sentence word lookup |
| `onboarding/languages/page.tsx` | Line 10 | Added "en" to TARGET_LANGUAGES |

**Testing Infrastructure**
| Addition | Purpose |
|----------|---------|
| `scripts/create-test-users.ts` | Provisions pre-confirmed test accounts via Supabase Admin API |
| TESTING.md updates | Added test accounts, E2E scenarios, Playwright MCP guide |
| CLAUDE.md testing section | Mandatory testing checklist after every feature change |

**Test Accounts Created**
| Email | Languages |
|-------|-----------|
| `test-en-pt@llyli.test` | EN→PT |
| `test-en-sv@llyli.test` | EN→SV |
| `test-nl-en@llyli.test` | NL→EN |

**E2E Test Results**
| User | Flow | Result |
|------|------|--------|
| test-en-pt@llyli.test | Sign-in → Notebook → Review | ✅ PASS |
| test-en-sv@llyli.test | Sign-in → Notebook → Review | ✅ PASS |
| test-nl-en@llyli.test | Sign-in → Notebook → Review | ✅ PASS (found English target bug, fixed) |

**Deployment**
| Step | Status | Notes |
|------|--------|-------|
| Local build | ✅ Pass | `npm run build` succeeds |
| Git push | ✅ Pass | Pushed to origin/main |
| Vercel auto-deploy | ❌ Fail | Webhook/socket hang up error |
| Vercel manual deploy | ✅ Pass | `vercel --prod` succeeded |

**Key Insight**: Users can enter words in EITHER language (target or native). When entering a Portuguese word while learning Portuguese, `sourceLang=pt-PT` and `targetLang=en`. Must check both.

---

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

**E2E Test Results**
| Test | Status | Notes |
|------|--------|-------|
| Sign-up flow | ✅ PASS | Email confirmation screen works |
| Sign-in error message | ✅ PASS | Shows email confirmation hint |
| Progress page (401) | ✅ PASS | Shows "sign in to view" prompt |
| Review page (unauth) | ⚠️ BUG #51 | Shows "All caught up" instead of sign-in |
| Protected pages | ⚠️ #52 | Load UI without auth redirect |

**GitHub Issues Created**
| Issue | Title | Priority |
|-------|-------|----------|
| #51 | Review page misleading for unauth users | P2-normal |
| #52 | Protected pages should redirect to sign-in | P3-low |

**Bugs Found During E2E**
| Bug | Severity | Status |
|-----|----------|--------|
| English missing from native languages | P0 | Fixed |
| Review page shows "All caught up" for unauth | P2 | #51 |
| Protected pages don't redirect to sign-in | P3 | #52 |

**Additional Fixes**
- Added 'en' to NATIVE_LANGUAGES array
- Created test user provisioning script (`scripts/create-test-users.ts`)

**Test Users Created**
| Email | Password | Languages |
|-------|----------|-----------|
| test-en-pt@llyli.test | TestPassword123! | en→pt-PT |
| test-en-sv@llyli.test | TestPassword123! | en→sv |
| test-nl-en@llyli.test | TestPassword123! | nl→en |

**Build**: ✅ Passed
**Deployed**: ✅ Pushed to main (auto-deploy)

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
