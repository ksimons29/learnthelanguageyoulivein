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
- [x] **Auth Bug Fix + Starter Words** - Email confirmation UI, improved sign-in errors, 10 starter words per language (Session 28)

### In Progress
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
| #57 | Audio generation timeout (~15% failure rate) | P2-normal |
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
| - | Speech input for iOS capture | post-mvp |

---

## Session Log

### Session 48 - 2026-01-20 - UX Review Bug Fixes & PROJECT_LOG Archiving

**Focus**: Fix 3 critical bugs from comprehensive UX review, create GitHub issue for audio timeout, archive PROJECT_LOG.

#### Bug Fixes

**1. Duplicate Multiple Choice Options** (`web/src/lib/review/distractors.ts`)
- **Problem**: Same translation text could appear as multiple buttons (e.g., two "good morning" options)
- **Root Cause**: `buildMultipleChoiceOptions()` didn't deduplicate by text value
- **Fix**: Added `seenTexts` Set to track normalized text values; skip distractors with duplicate text
- **Result**: Correct answer always appears; no duplicate buttons

**2. Missing Translation Options**
- **Problem**: Correct answer sometimes not visible in multiple choice
- **Root Cause**: Same as Bug #1 - if correct answer's text matched a distractor, confusion
- **Fix**: Same fix - correct answer added first, duplicates filtered from distractors

**3. Untranslatable Word Handling** (`web/src/app/api/words/route.ts`)
- **Problem**: Words like "gezellig" showed identical original and translation
- **Root Cause**: GPT returning original word unchanged; fallback swap also failing
- **Fix**: Added final check (6c) - if translation still equals original after both attempts, append "(Dutch expression)" or equivalent
- **Verified**: New "gezellig" capture → "cozy togetherness" (GPT now follows CRITICAL instruction)

#### GitHub Issue Created

**#57 - Audio generation timeout (~15% failure rate)**
- P2-normal priority
- Word capture works, audio is nice-to-have with retry option
- Deferred to post-MVP audio improvements

#### PROJECT_LOG Archiving

- Reduced from 1,561 → 408 lines (under 500 limit)
- Archived sessions 15-41 to PROJECT_LOG_ARCHIVE.md
- Added archiving rule: keep only 10 most recent sessions

#### Files Modified

| File | Change |
|------|--------|
| `web/src/lib/review/distractors.ts` | Text deduplication in buildMultipleChoiceOptions, fetch more distractors |
| `web/src/app/api/words/route.ts` | Final fallback for untranslatable words |
| `PROJECT_LOG.md` | Trimmed + added archiving rule |
| `PROJECT_LOG_ARCHIVE.md` | Compressed entries for sessions 15-41 |

#### Testing

- `npm run build` ✅ Passed
- `npm run test:run` ✅ 66 tests passed
- E2E via Playwright: Verified "gezellig" → "cozy togetherness", "uitwaaien" → "to get some fresh air"

---

### Session 47 - 2026-01-20 - Dark Mode Fixes & Full E2E Testing

**Focus**: Fix hardcoded colors breaking dark mode, comprehensive E2E testing of all 3 test users, verify gamification system.

#### Dark Mode Fixes

Fixed 13 hardcoded color values across 3 files that broke dark mode:

| File | Issues Fixed |
|------|--------------|
| `words-overview-card.tsx` | bg-white, #e2e8f0, text-gray-* classes, hover:bg-gray-50 |
| `boss-round.tsx` | hover:bg-gray-100 |
| `page.tsx` (home) | hover:bg-gray-100, rgba(255,255,255,0.4) in stitch pattern |

**Fix Pattern**: Replaced hardcoded colors with CSS variables:
- `bg-white` → `var(--surface-page)`
- `text-gray-*` → `var(--text-muted)`, `var(--text-heading)`, `var(--text-body)`
- `hover:bg-gray-*` → `hover:bg-[var(--surface-elevated)]`
- `#e2e8f0` → `var(--notebook-stitch)`

#### E2E Testing Results

| User | Languages | Auth | Capture | Notebook | Review | Progress | Dark Mode |
|------|-----------|------|---------|----------|--------|----------|-----------|
| test-en-pt | EN→PT | ✅ | ✅ bidirectional | ✅ 26 words | ✅ sentence mode | ✅ | ✅ |
| test-en-sv | EN→SV | ✅ | ✅ "varsågod" | ✅ Swedish Journal | ✅ | ✅ | ✅ |
| test-nl-en | NL→EN | ✅ | ✅ "thank you"→"hartelijk dank" | ✅ English Journal | ✅ | ✅ | ✅ |

#### Gamification Verification

| Feature | Status | Notes |
|---------|--------|-------|
| Daily Goal Progress Ring | ✅ | Shows X/10, checkmark at completion |
| Streak Display | ✅ | Flame icon, day count, celebration |
| Bingo Board | ✅ | 9 squares, teal completion, 5/9 test user |
| Celebration Modal | ✅ | PartyPopper, streak message |

#### Untranslatable Words Fix

Fixed GPT translation returning original word unchanged for culturally-specific words like "gezellig".

| File | Change |
|------|--------|
| `api/words/route.ts` | Added CRITICAL instruction to NEVER return original word unchanged |

**New Translation Rules**:
- For untranslatable words (gezellig, saudade, lagom), always provide closest equivalent or brief explanation
- Examples added: "gezellig" → "cozy togetherness", "saudade" → "nostalgic longing"
- Max 2-4 word explanatory phrases when no equivalent exists

#### Files Modified

- `web/src/components/progress/words-overview-card.tsx` - 10 color fixes
- `web/src/components/gamification/boss-round.tsx` - 1 color fix
- `web/src/app/page.tsx` - 2 color fixes
- `web/src/app/api/words/route.ts` - Untranslatable words handling

#### Build & Testing

- `npm run build` ✅ Passed
- E2E via Playwright MCP: All 3 test users verified
- Dark mode screenshots captured and verified

---

### Session 46 - 2026-01-20 - Bug Fixes & Self-Healing Guardrails

**Focus**: Add self-healing guardrail for orphaned sentences, add mastery progress explanation

#### Changes

**Self-Healing Guardrail for Orphaned Sentences**
- **File**: `src/app/api/sentences/next/route.ts`
- **Problem**: Orphaned sentences (referencing deleted words) caused confusing error messages
- **Fix**: Auto-detect and delete orphaned sentences when encountered
- **Result**: System self-heals over time, no manual database cleanup needed

**Mastery Progress Explanation (Issue #8)**
- **Files**: `src/app/review/page.tsx`, `src/app/science/page.tsx`
- **Problem**: "1/3 correct sessions" was unclear to users
- **Fix**:
  - Added "Mastery Progress" section to /science page
  - Made progress indicator tappable (links to /science#mastery)
  - Shows help icon for discoverability
- **Result**: Users can tap to learn what 3 correct sessions means

#### Files Changed
- `src/app/api/sentences/next/route.ts` - Self-healing orphan cleanup
- `src/app/science/page.tsx` - Added Mastery Progress section
- `src/app/review/page.tsx` - Made progress indicator tappable with Link

---

### Session 45b - 2026-01-20 - Sentence Generation Language Filter Fix

**Focus**: Fix bug where sentence generation picked words without language filter, causing orphaned sentences.

#### Bug Fixed

**Sentence Generation Language Mismatch**
- **Root Cause**: `getDueWordsGroupedByCategory()` didn't filter by language, but `sentences/next` API did
- **Symptom**: "Pre-generated sentences exist but their words may have been deleted"
- **Fix**: Added `targetLanguage` parameter to word matcher, same filter as retrieval

#### Files Changed
- `src/lib/sentences/word-matcher.ts` - Added targetLanguage filter to getDueWordsGroupedByCategory
- `src/app/api/sentences/generate/route.ts` - Pass targetLanguage to word matcher
- `src/app/api/words/route.ts` - Pass targetLanguage in triggerSentenceGeneration
- `src/app/api/dev/test-sentences/route.ts` - Updated test endpoint

---

### Session 45 - 2026-01-20 - Critical Review System Bug Fixes

**Focus**: Fix 6 critical issues with the review system discovered during manual testing. Test-driven approach with verification after each fix.

#### Issues Fixed

**Bug #1: Due Today Count Unrealistic (700+ words)**
- **Files**: `api/words/stats/route.ts`, `api/progress/route.ts`
- **Root Cause**: Due calculation included ALL words where `retrievability < 0.9 OR nextReviewDate <= now`. For bulk-imported words, every unreviewed word counted as "due."
- **Fix**: Separate "new cards" (never reviewed) from "review cards" (reviewed, now due). Cap new cards at 15/day.
- **Formula**: `dueToday = MIN(newCards, DAILY_NEW_CARDS_LIMIT) + reviewDue`
- **Result**: 912 words → shows ~39 due (15 new + 24 reviews) instead of 724

**Bug #2: Sentence Mode Never Triggers**
- **File**: `api/sentences/next/route.ts`
- **Root Cause**: `allWordsDue` check blocked sentences when ANY word was already reviewed individually
- **Fix**: Removed `allWordsDue` requirement. Any unused sentence is now returned regardless of individual word due status
- **Result**: Sentences now show as primary learning mode as designed

**Bug #3: Mixed Languages in Multiple Choice**
- **Files**: `lib/review/distractors.ts`, `api/reviews/route.ts`, `lib/store/review-store.ts`, `app/review/page.tsx`
- **Root Cause**: `buildMultipleChoiceOptions()` didn't account for bidirectional word capture direction
- **Fix**: Added `getNativeLanguageText()` helper that checks `sourceLang`/`targetLang` to return text in user's native language
- **Result**: All multiple choice options now consistently in same language

**Bug #4: Recall Mode Missing Active Input**
- **File**: `app/review/page.tsx`
- **Root Cause**: Word mode only had "Reveal" button - passive recognition instead of active recall
- **Fix**: Added `FillBlankInput` for word mode. User must type answer before rating
- **Result**: True active recall experience matching sentence mode

**Bug #5: Session Never Completes with 700+ Words**
- **File**: `api/reviews/route.ts`
- **Root Cause**: With 700+ due words, user never reaches `currentIndex >= dueWords.length - 1`
- **Fix**: Added `MAX_SESSION_WORDS = 25` limit following FSRS scientific principles (20-30 items per session optimal)
- **Result**: Session completes at 25 words, showing completion page

**Bug #6: UI Polish**
- **File**: `app/notebook/page.tsx`
- **Fix**: Added iOS safe-area-inset-top padding using `style={{ paddingTop: "max(24px, env(safe-area-inset-top, 24px))" }}`
- **Verified**: "On Track" logic (journal-header.tsx) acceptable with new due calculation
- **Verified**: Word translation visible in detail sheet (word-detail-sheet.tsx:156)

#### Testing Documentation Added

**New sections in TESTING.md**:
- Section 6E-2: FSRS & Due Calculation Verification
  - E6: Due count sanity check
  - E7: Session word limit
  - E8: Multiple choice language consistency
  - E9: Session completion triggers
  - E10: Sentence mode priority
- Section 6E-3: Word Detail & Display Tests
  - E11: Word detail shows translation
  - E12: Word detail shows context

#### Files Modified Summary

| File | Change |
|------|--------|
| `api/words/stats/route.ts` | Added DAILY_NEW_CARDS_LIMIT, separated new/review cards |
| `api/progress/route.ts` | Added DAILY_NEW_CARDS_LIMIT, reviewDue calculation |
| `api/reviews/route.ts` | Added MAX_SESSION_WORDS=25, return language preferences |
| `api/sentences/next/route.ts` | Removed allWordsDue blocking check |
| `lib/review/distractors.ts` | Added getNativeLanguageText(), updated buildMultipleChoiceOptions() |
| `lib/store/review-store.ts` | Added nativeLanguage/targetLanguage to store |
| `app/review/page.tsx` | Added active recall input, use nativeLanguage for distractors |
| `app/notebook/page.tsx` | Added iOS safe-area padding |
| `src/__tests__/lib/distractors.test.ts` | Added bidirectional capture test |
| `docs/engineering/TESTING.md` | Added sections 6E-2, 6E-3 with tests E6-E12 |

#### Key Design Decisions

1. **FSRS Scientific Principles**: 15 new cards/day + 25 max session words follows Anki/FSRS research for optimal retention
2. **Sentence Priority**: Sentences are primary learning mode; word mode is fallback only
3. **Language Normalization**: Multiple choice always in native language for consistent testing
4. **Active Recall**: Type-to-reveal enforces retrieval practice vs passive recognition

#### Testing

- `npm run build` ✅ Passed
- `npm run test:run` ✅ 66 tests passed
- Each fix verified via Playwright MCP before proceeding to next

---

### Session 44 - 2026-01-20 - Translation & Audio Fixes

**Focus**: Fix translation failures and ensure audio is always in target language.

#### Bug Fixes

**1. Login Error Message** (`web/src/app/auth/sign-in/page.tsx`)
- Removed misleading "check your email to confirm" text
- Now shows clearer "check your credentials" message

**2. Translation Fallback** (`web/src/app/api/words/route.ts`)
- Added safety check: if translation equals original text, retry with swapped languages
- Fixes cases where language detection fails (e.g., "Trainwreck" detected as Portuguese)
- Prevents identical original/translation entries in database

**3. Audio Always in Target Language** (`web/src/app/api/words/route.ts`)
- Audio now ALWAYS generated in the language being learned
- If user enters native language text → audio is the translation
- If user enters target language text → audio is the original
- Examples:
  - en→pt-PT: "trainwreck" → audio is Portuguese "desastre"
  - nl→en: "hallo" → audio is English "hello"

#### Files Modified
- `web/src/app/auth/sign-in/page.tsx` - Error message clarity
- `web/src/app/api/words/route.ts` - Translation fallback + audio language fix

---

### Session 43 - 2026-01-20 - Language Auto-Detection + Translation Quality

**Focus**: Add smart language detection and improve translation quality with idiom handling and B2 level targeting.

#### Features Added

**1. Language Auto-Detection** (`web/src/app/api/words/route.ts`)
- Added `detectLanguage()` function using OpenAI GPT-4o-mini
- Detects whether input text is in user's native or target language
- Automatically adjusts translation direction:
  - English input → translate TO Portuguese (for EN→PT learners)
  - Portuguese input → translate TO English (existing behavior)
- Works for all supported language pairs (EN→PT, EN→SV, NL→EN)

**2. Improved Translation Prompts** (`web/src/app/api/words/route.ts`)
- Core guidelines for handling idioms, slang, and colloquialisms
- Find equivalent expressions rather than literal translations
- Language-specific rules for each target language:
  - **PT-PT**: European Portuguese only, "tu" forms, European vocab
  - **SV**: Standard Swedish (rikssvenska), natural phrasing
  - **EN**: Natural conversational English, Dutch idiom equivalents
  - **NL**: Standard Dutch, natural word order
- Examples: "piece of cake" → "canja" (PT), "lätt som en plätt" (SV)

**3. B2 Level Sentence Generation** (`web/src/lib/sentences/generator.ts`)
- Target B2 (Upper Intermediate) CEFR level
- Sentences are challenging but comprehensible
- Include idiomatic expressions and natural phrasing
- Avoid overly simple (A1-A2) or complex (C1-C2) constructions
- Language-specific rules for PT-PT, SV, EN

#### Examples
- "Trainwreck" → "desastre" (detected as English, found Portuguese equivalent)
- "butterfly" → "borboleta" (detected as English, translated to Portuguese)

#### Files Modified
- `web/src/app/api/words/route.ts` - Language detection + translation prompts
- `web/src/lib/sentences/generator.ts` - B2 level + language rules

#### Testing
- `npm run build` ✓
- `npm run test:run` ✓ (65 tests)
- E2E: Verified "trainwreck" → "desastre", "butterfly" → "borboleta"

---

### Session 42 - 2026-01-20 - E2E Bug Fixes: Auth Protection + Sentence Generation

**Focus**: Fix issues found during E2E testing - background 500 errors and unprotected capture route.

#### Issues Fixed

**1. Sentence Generation Language Bug** (`web/src/app/api/words/route.ts:455`)
- Problem: `triggerSentenceGeneration()` used `DEFAULT_LANGUAGE_PREFERENCE` instead of user's actual language settings
- Impact: Background sentence generation was using wrong language, causing 500 errors
- Fix: Changed to `await getUserLanguagePreference(userId)` to fetch user's actual preference

**2. Capture Route Auth Protection** (`web/src/app/capture/page.tsx`)
- Problem: `/capture` route accessible while signed out (showed UI, but save would fail)
- Fix: Added auth check using same pattern as review page:
  - Import `useAuthStore`
  - Track `user` and `authLoading` state
  - `useEffect` redirect to `/auth/sign-in` when `!authLoading && !user`
  - Guard `if (authLoading || !user) return null` to prevent UI flash

#### E2E Verification Results

| Test | Result |
|------|--------|
| Capture route auth protection | ✅ Redirects to sign-in when no user |
| Word capture ("bom dia") | ✅ Captured with translation |
| Notebook word search ("obrigado") | ✅ 3 results found |
| Search by translation ("thank") | ✅ 3 results found |
| Science page new section | ✅ "Words That Connect" visible |

#### Files Modified
- `web/src/app/api/words/route.ts` - Fixed `triggerSentenceGeneration` language preference
- `web/src/app/capture/page.tsx` - Added auth protection

#### Testing
- `npm run build` ✓
- `npm run test:run` ✓ (65 tests)
- E2E via Playwright MCP: All verification tests pass

---

> **Archive**: Sessions 1-41 in [PROJECT_LOG_ARCHIVE.md](./PROJECT_LOG_ARCHIVE.md)
