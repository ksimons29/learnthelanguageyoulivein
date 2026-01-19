# LLYLI Project Changelog

This changelog tracks all Claude Code sessions and major changes to the LLYLI project. After each session, add a brief summary of work completed.

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
