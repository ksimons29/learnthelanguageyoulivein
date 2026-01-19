# LLYLI MVP - Implementation Archive

**Last Updated:** 2026-01-19
**Purpose:** Document of all completed features and implementation details

---

## Executive Summary

The LLYLI web MVP is **approximately 85% feature-complete**. All core learning loop features are implemented and functional. The application can be used for real language learning today.

---

## Epic 0: Technical Foundation

### Status: COMPLETE

| Task | Description | Status | Location |
|------|-------------|--------|----------|
| T0.1 | Next.js 16+ with TypeScript, Tailwind, React 19 | ✅ | `/web/` |
| T0.2 | Supabase project (db, auth, storage) | ✅ | `/web/src/lib/supabase/` |
| T0.3 | Drizzle ORM schema and migrations | ✅ | `/web/src/lib/db/schema/` |
| T0.4 | Vercel deployment | ✅ | Configured |
| T0.5 | PWA manifest + Service Worker | ❌ | **Not implemented** |

### Tech Stack Implemented

```
Frontend:
- Next.js 16.1.2 with App Router
- React 19.2.3
- TypeScript 5
- Tailwind CSS 4
- shadcn/ui components
- Zustand 5 for state management

Backend:
- Supabase PostgreSQL
- Drizzle ORM 0.45
- Next.js API Routes

AI Services:
- OpenAI GPT-4o-mini (translation, categorization)
- OpenAI TTS (audio generation)
- ts-fsrs 5.2.3 (spaced repetition)
```

### Database Schema

**5 tables implemented:**

1. **words** (`/web/src/lib/db/schema/words.ts`)
   - Core entity with FSRS parameters
   - 8 categories: food_dining, work, daily_life, social, shopping, transport, health, other
   - Mastery tracking: consecutiveCorrectSessions, masteryStatus

2. **review_sessions** (`/web/src/lib/db/schema/sessions.ts`)
   - Session tracking with 2-hour boundary
   - Stats: wordsReviewed, correctCount

3. **generated_sentences** (`/web/src/lib/db/schema/sentences.ts`)
   - Pre-generated sentences with wordIdsHash for deduplication
   - Exercise types: fill_blank, multiple_choice, type_translation

4. **tags** (`/web/src/lib/db/schema/tags.ts`)
   - User-defined tags for words (schema only, no UI)

5. **user_profiles** (`/web/src/lib/db/schema/user-profiles.ts`)
   - Language preferences (native/target)
   - Subscription tiers (free/trial/pro)
   - Learning reasons

---

## Epic 1: Word Capture

### Status: COMPLETE

| Task | Description | Status | Location |
|------|-------------|--------|----------|
| T1.1 | Word capture UI and API | ✅ | `/web/src/app/api/words/route.ts` |
| T1.2 | Language detection + translation | ✅ | Uses OpenAI GPT-4o-mini |
| T1.3 | TTS audio generation + storage | ✅ | `/web/src/lib/audio/tts.ts` |

### API Endpoints

```
POST /api/words          - Capture new word (with translation + audio)
GET  /api/words          - List words (with filters)
GET  /api/words/:id      - Get single word
PUT  /api/words/:id      - Update word
DELETE /api/words/:id    - Delete word
POST /api/words/bulk-import - Bulk import from CSV/JSON
GET  /api/words/categories - Get category list
```

### Word Capture Flow

```
User Input → Auto-detect language → GPT-4o-mini translates
           → GPT-4o-mini assigns category (8 options)
           → OpenAI TTS generates audio → Store in Supabase Storage
           → Initialize FSRS parameters → Save to database
```

### Categories (Consolidated)

Originally 14 categories, consolidated to 8 following Miller's Law:

1. food_dining
2. work
3. daily_life
4. social
5. shopping
6. transport
7. health
8. other

---

## Epic 2: Dynamic Sentence Generation

### Status: COMPLETE

| Task | Description | Status | Location |
|------|-------------|--------|----------|
| T2.1 | Word-matching algorithm | ✅ | `/web/src/lib/sentences/` |
| T2.2 | Sentence generation via LLM | ✅ | `/web/src/app/api/sentences/generate/route.ts` |
| T2.3 | Batch pre-generation system | ✅ | Same as above |

### API Endpoints

```
POST /api/sentences/generate  - Batch pre-generate sentences
GET  /api/sentences/next      - Get next sentence for review
```

### Implementation Details

**Word Matching Algorithm:**
- Groups words by category
- Clusters by due date proximity (7-day window)
- Generates 2-4 word combinations
- Uses `wordIdsHash` to prevent repetition

**Sentence Generation:**
- GPT-4o-mini generates natural sentences
- Validates all target words appear in sentence
- Max 10 words per sentence
- Generates TTS audio for each sentence

**Exercise Type Selection:**
```typescript
if (avgCorrectSessions < 1) return 'multiple_choice'  // Easiest
if (avgCorrectSessions < 2) return 'fill_blank'       // Medium
return 'type_translation'                              // Hardest
```

---

## Epic 3: FSRS Review System

### Status: COMPLETE

| Task | Description | Status | Location |
|------|-------------|--------|----------|
| T3.1 | ts-fsrs integration | ✅ | `/web/src/lib/fsrs/index.ts` |
| T3.2 | Session management (2h boundary) | ✅ | `/web/src/app/api/reviews/route.ts` |
| T3.3 | Mastery tracking (3 sessions) | ✅ | Same as above |
| T3.4 | Review UI with exercise types | ✅ | `/web/src/app/review/page.tsx` |

### API Endpoints

```
GET  /api/reviews      - Get due words + session ID
POST /api/reviews      - Submit review rating (1-4)
POST /api/reviews/end  - End current session
```

### FSRS Implementation

**Core Functions (`/web/src/lib/fsrs/index.ts`):**
- `calculateRetrievability()` - Power law forgetting curve
- `isDue()` - Check if word needs review (R < 0.9)
- `processReview()` - Update FSRS parameters after review
- `getNextReviewText()` - Human-readable next review date

**Rating Scale:**
```
1 = Again (complete blackout)
2 = Hard (correct but difficult)
3 = Good (correct, normal effort)
4 = Easy (trivially easy)
```

**Mastery Tracking:**
- Tracks `consecutiveCorrectSessions` (0-3)
- Uses `lastCorrectSessionId` to prevent same-session double-counting
- `masteryStatus`: 'learning' → 'learned' → 'ready_to_use'
- Requires 3 correct recalls across 3 different sessions

### Review UI Components

```
/web/src/components/review/
├── answer-feedback.tsx      - Correct/incorrect feedback
├── feedback-card.tsx        - Post-grading feedback
├── fill-blank-input.tsx     - Fill-in-the-blank exercise
├── grading-buttons.tsx      - Hard/Good/Easy buttons
├── mastery-modal.tsx        - Celebration on mastery
├── multiple-choice-options.tsx - Multiple choice exercise
├── review-header.tsx        - Progress indicator
└── sentence-card.tsx        - Sentence display with highlights
```

### Review Store

**Location:** `/web/src/lib/store/review-store.ts`

**State Management:**
- Session state (sessionId, dueWords, currentIndex)
- Review flow (reviewState, lastRating, lastMasteryAchieved)
- Sentence mode (currentSentence, sentenceTargetWords)

**Actions:**
- `startSession()` - Fetches due words, creates session
- `submitReview()` - Submits rating, updates FSRS
- `endSession()` - Ends current session
- `fetchNextSentence()` - Gets next sentence for review
- `submitSentenceReview()` - Grades all words in sentence

---

## Epic 4: Word Organization

### Status: PARTIAL

| Task | Description | Status | Location |
|------|-------------|--------|----------|
| T4.1 | Notebook view by category | ✅ | `/web/src/app/notebook/` |
| T4.2 | Custom tags CRUD | ⚠️ | Schema only, no UI |

### Pages Implemented

```
/notebook           - Category overview with word counts
/notebook/[category] - Words in specific category
```

---

## Epic 5: Progress Dashboard

### Status: COMPLETE

| Task | Description | Status | Location |
|------|-------------|--------|----------|
| T5.1 | Progress metrics calculation | ✅ | `/web/src/app/api/progress/route.ts` |
| T5.2 | Ready to Use list | ✅ | In progress page |

### API Endpoint

```
GET /api/progress - Returns:
  - totalWords, wordsThisWeek, masteredWords
  - retentionRate, currentStreak
  - dueToday, needPractice
  - forecast (7-day chart data)
  - strugglingWordsList
```

### UI Components

```
/web/src/components/progress/
├── compact-progress-card.tsx
└── forecast-chart.tsx
```

---

## Authentication & User Management

### Status: COMPLETE

### Pages Implemented

```
/auth/sign-up           - Email/password registration
/auth/sign-in           - Login
/auth/reset-password    - Password reset request
/auth/update-password   - Password update
/auth/callback          - OAuth callback handler
/auth/onboarding        - Post-signup onboarding
```

### Onboarding Flow

```
/onboarding             - Start
/onboarding/languages   - Select native/target language
/onboarding/capture     - First word capture tutorial
/onboarding/complete    - Welcome to LLYLI
```

### Supabase Integration

```
/web/src/lib/supabase/
├── client.ts      - Browser client
├── server.ts      - Server-side client
└── middleware.ts  - Auth middleware
```

---

## UI Pages Summary

### All Pages Implemented

| Page | Route | Status |
|------|-------|--------|
| Home | `/` | ✅ |
| Capture | `/capture` | ✅ |
| Notebook | `/notebook` | ✅ |
| Category Detail | `/notebook/[category]` | ✅ |
| Word Detail | `/word/[id]` | ✅ |
| Review | `/review` | ✅ |
| Review Complete | `/review/complete` | ✅ |
| Progress | `/progress` | ✅ |
| Sign Up | `/auth/sign-up` | ✅ |
| Sign In | `/auth/sign-in` | ✅ |
| Reset Password | `/auth/reset-password` | ✅ |
| Onboarding | `/onboarding/*` | ✅ |

---

## Language Support

### Configured Languages

| Language | Code | TTS Voice | Status |
|----------|------|-----------|--------|
| English | `en` | alloy | ✅ Native |
| Portuguese (Portugal) | `pt-PT` | nova | ✅ Target |
| Swedish | `sv` | nova | ✅ Ready |
| Portuguese (Brazil) | `pt-BR` | nova | Available |
| Spanish | `es` | nova | Available |
| French | `fr` | nova | Available |
| German | `de` | onyx | Available |
| Dutch | `nl` | nova | Available |

**Configuration:** `/web/src/lib/config/languages.ts`

---

## Development Tools

### Anki Import

**Endpoint:** `POST /api/dev/import-anki`
**Status:** Implemented for development/migration

### Test Utilities

```
/api/dev/test-sentences  - Test sentence generation
/api/dev/reset-password  - Dev password reset
```

---

## Key Files Reference

### API Routes
```
/web/src/app/api/
├── words/
│   ├── route.ts              - CRUD for words
│   ├── [id]/route.ts         - Single word operations
│   ├── bulk-import/route.ts  - Bulk import
│   └── categories/route.ts   - Category list
├── reviews/
│   ├── route.ts              - Due words & submit review
│   └── end/route.ts          - End session
├── sentences/
│   ├── generate/route.ts     - Batch generation
│   └── next/route.ts         - Get next sentence
├── progress/route.ts         - Progress metrics
└── onboarding/               - Onboarding status
```

### Core Libraries
```
/web/src/lib/
├── fsrs/index.ts             - FSRS algorithm
├── sentences/                - Sentence generation logic
├── audio/tts.ts              - TTS generation
├── config/languages.ts       - Language configuration
├── store/                    - Zustand stores
└── db/schema/                - Database schema
```

### Components
```
/web/src/components/
├── brand/                    - Logo, ribbon, navigation
├── home/                     - Home page components
├── capture/                  - Word capture form
├── notebook/                 - Notebook/browse views
├── review/                   - Review session components
├── progress/                 - Progress dashboard
└── ui/                       - shadcn/ui components
```

---

## Documents Still Relevant

| Document | Purpose | Status |
|----------|---------|--------|
| `implementation_plan.md` | Overall architecture reference | ✅ Current |
| `FSRS_IMPLEMENTATION.md` | FSRS algorithm details | ✅ Current |
| `LANGUAGE_CONFIGURATION.md` | Language setup guide | ✅ Current |
| `AUTH_AND_MONETIZATION_PLAN.md` | Auth/payment planning | ⚠️ Partially implemented |
| `PLATFORM_STRATEGY_2026-01-15.md` | Web-first strategy | ✅ Historical context |
| `ANKI_IMPORT_GUIDE.md` | Import guide for users | ✅ Current |
| `dependency_graph.md` | Epic dependencies | ⚠️ Mostly complete |

---

## Documents to Archive

These documents are **outdated** and provide inaccurate information:

| Document | Reason |
|----------|--------|
| `Missing Features.MD` | Claims FSRS/review system missing, but they're complete |
| `NEXT_IMPLEMENTATION_PHASE.md` | Phase 1 is complete |
| `llyli_default_categories_and_packs.md` | Lists 12 categories (now 8) |

---

## Changelog Highlights

### 2026-01-19
- Verified all core features implemented
- Created TODO.md and IMPLEMENTATION_ARCHIVE.md
- Identified outdated documentation

### 2026-01-18
- Category consolidation from 14 to 8 (Miller's Law)
- Fitness category migrated to health

### Earlier
- Full FSRS review system implemented
- Sentence generation with word matching
- Complete authentication flow
- Progress dashboard with real data

---

*This document serves as the authoritative record of what has been implemented in the LLYLI MVP.*
