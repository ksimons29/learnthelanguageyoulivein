# LLYLI Project Log - Archive

> Archived sessions 1-14. For current sessions, see [PROJECT_LOG.md](./PROJECT_LOG.md)

---

## 2026-01-16 (Session 7) - Dynamic Sentence Generation & Anki Import (Epic 2)

**Session Focus**: Implement Epic 2 sentence generation infrastructure and test with real Anki vocabulary data

### What Was Done

#### 1. Closed Epic 3 GitHub Issue
- Verified FSRS implementation complete from Session 6
- Closed issue #13 with implementation summary

#### 2. Implemented Epic 2: Dynamic Sentence Generation

**Word-Matching Algorithm** (`/web/src/lib/sentences/word-matcher.ts`)
- `getDueWordsGroupedByCategory()` - Groups due words by category within lookahead window
- `generateWordCombinations()` - Creates 2-4 word combinations using sliding window
- `kCombinations()` - Generates k-combinations with early termination
- `generateWordIdsHash()` - Deterministic hash for deduplication
- `filterUsedCombinations()` - Batch query to exclude used combinations
- **Fixed stack overflow**: Limited to 30 words per category, 100 combinations max

**Sentence Generator** (`/web/src/lib/sentences/generator.ts`)
- GPT-4o-mini integration (~$0.00006 per sentence)
- Retry logic with validation (max 3 attempts)
- Regex validation ensures all target words present

**Exercise Type Logic** (`/web/src/lib/sentences/exercise-type.ts`)
- Determines difficulty based on average consecutive correct sessions:
  - `< 1`: multiple_choice | `< 2`: fill_blank | `>= 2`: type_translation

**API Endpoints**
- `POST /api/sentences/generate` - Batch generation with optional audio
- `GET /api/sentences/next` - Get next unused sentence for review

**Pre-generation Triggers** (`/web/src/lib/hooks/use-sentence-pregeneration.ts`)
- `useSentencePreGeneration()` hook - Triggers on app visibility (5-min cooldown)
- Post-capture trigger in `/api/words` - Generates 3 sentences after word capture

**Review Store Updates** (`/web/src/lib/store/review-store.ts`)
- Added `reviewMode: 'word' | 'sentence'` state
- Added `currentSentence`, `sentenceTargetWords` state
- Added `fetchNextSentence()`, `submitSentenceReview()` actions

#### 3. Created Anki Import Tools

**Dev Import Endpoint** (`/api/dev/import-anki`)
- Bypasses auth for development testing
- Creates users via Supabase service role
- Converts Anki SM-2 params to FSRS (easeFactor -> difficulty, interval -> stability)

**Bulk Import Endpoint** (`/api/words/bulk-import`)
- Batch inserts with learning history preservation
- Progress logging for large imports

**Test Endpoint** (`/api/dev/test-sentences`)
- Dev-only endpoint to test sentence generation for specific user

#### 4. Successfully Tested with Real Data
- Created test user: `koossimons91@gmail.com`
- Imported 903 words from Anki with learning history
- Generated 5 test sentences combining Portuguese vocabulary

### Key Technical Decisions

**Decision 1: gpt-4o-mini over gpt-4**
33x cheaper ($0.00006 vs $0.002 per sentence), sufficient quality for short constrained sentences

**Decision 2: Pre-generation over on-demand**
Avoids latency during review, enables background processing

**Decision 3: Limit combinations per category**
Fixed stack overflow by limiting to 30 words per category, max 100 combinations

**Decision 4: Fire-and-forget post-capture trigger**
Sentence generation after word capture doesn't block the response

---

## 2026-01-16 (Session 6) - FSRS Review System Implementation (Epic 3)

**Session Focus**: Implement the FSRS spaced repetition algorithm for the review system, connecting frontend to real backend API

### What Was Done

#### 1. Closed Completed GitHub Issues
Based on CHANGELOG analysis, closed issues that were already implemented:
- **Epic 0: Technical Foundation (#16)** - Database, auth, state management complete
- **Epic 1: Word Capture (#11)** - API endpoints, OpenAI integration, audio storage complete

#### 2. Installed ts-fsrs Library
Added the official FSRS (Free Spaced Repetition Scheduler) library

#### 3. Created FSRS Utility Functions (`/web/src/lib/fsrs/index.ts`)
Core functions for spaced repetition:
- `calculateRetrievability()` - Uses forgetting curve formula
- `isDue()` - Checks if word needs review (retrievability < 90%)
- `wordToCard()` - Converts Word entity to ts-fsrs Card format
- `processReview()` - Calculates new FSRS parameters after review
- `getNextReviewText()` - Human-readable next review timing

#### 4. Built Review API Endpoints
- `/api/reviews` GET - Fetch due words + create/resume session
- `/api/reviews` POST - Submit review rating, update FSRS params
- `/api/reviews/end` POST - End session, return summary stats

#### 5. Updated Review Store
Added new state fields: `totalDue`, `lastNextReviewText`, `lastMasteryAchieved`

#### 6-8. Connected Review Page to Real API
Replaced mock data with live API integration, real FSRS-calculated next review times

### Key Technical Decisions

**Decision 1: Use ts-fsrs Library**
ML-optimized parameters (FSRS-4.5), handles edge cases, future personalization ability

**Decision 2: 2-Hour Session Boundary**
Sessions expire after 2 hours - ensures "3 correct recalls across 3 sessions" mastery rule works

**Decision 3: Rating Scale (1-4)**
Following FSRS standard: Again, Hard, Good, Easy

---

## 2026-01-16 (Session 5) - Dark Mode Polish & App-Wide Consistency

**Session Focus**: Apply dark mode styling consistently across all pages and fix remaining dark mode issues

### What Was Done

- Fixed PhraseInput Component for Dark Mode
- Fixed BrandWidget Modal (About LLYLI)
- Applied Dark Mode to All Auth Pages
- Updated All Component Files with CSS variables

---

## 2026-01-16 (Session 4) - Dark Mode Implementation

**Session Focus**: Add dark mode with "leather Moleskine at night" aesthetic and theme toggle in bottom navigation

### What Was Done

- Created complete dark theme with warm, desaturated colors
- Installed `next-themes` package for theme management
- Created `ThemeProvider` component wrapping the app
- Updated all Moleskine CSS utilities with `.dark` variants
- Added theme toggle to bottom navigation

### Key Design Decisions

**Decision 1: "Leather Moleskine at Night" Aesthetic**
Dark mode uses warm charcoals (#1C1F21, #2A2D30) instead of pure blacks

**Decision 2: Single Theme Toggle Location**
Best practice: one consistent location (bottom nav)

**Decision 3: System Preference Detection**
`next-themes` detects OS preference on first visit

---

## 2026-01-16 (Session 3) - Home Page Real Data & Audio Playback

**Session Focus**: Connect home page to real API data and implement audio playback component

### What Was Done

- Created `useAudioPlayer` hook for audio state management
- Created `AudioPlayButton` component with visual states
- Converted home page from mock data to live API integration
- Updated PhraseCard with audio playback

---

## 2026-01-16 (Session 2) - Authentication Pages & FSRS Documentation

**Session Focus**: Complete authentication UI pages and create standalone FSRS algorithm documentation

### What Was Done

- Created complete auth UI (Sign In, Sign Up, Onboarding, Reset/Update Password)
- Created FSRS_IMPLEMENTATION.md documentation

---

## 2026-01-16 - Phase 1 Implementation: Backend Foundation & Word Capture

**Session Focus**: Implement complete backend foundation including database, authentication, API endpoints, OpenAI integration, and frontend connectivity

### What Was Done

#### Epic 0: Technical Foundation
- Database Setup (Drizzle ORM + Supabase)
- Authentication (Supabase Auth)
- State Management (Zustand)
- Environment Configuration

#### Epic 1: Word Capture
- API Endpoints (CRUD for words)
- OpenAI Integration (TTS, translation, categorization)
- Audio Storage (Supabase Storage)
- Frontend Integration

### Key Decisions

**Lazy Loading Pattern**: Database and OpenAI clients lazy-loaded for build safety
**Cost Optimization**: GPT-4o-mini and OpenAI TTS for cost efficiency
**Audio Non-Fatal**: Audio failures don't block word capture
**Supabase Full-Stack**: Single platform for auth + database + storage

---

## 2026-01-15 - Progress & Review Pages Alignment

**Session Focus**: Bring Progress and Review pages into alignment with the Moleskine design system

### What Was Done

- Progress Page Redesign with Moleskine aesthetic
- Review Page Updates with elastic band element
- Review Complete Page Redesign with celebration styling

---

## 2026-01-15 - Moleskine Design Enhancement & Icon Organization

**Session Focus**: Transform the UI into an immersive Moleskine notebook aesthetic with realistic paper textures

### What Was Done

- Enhanced Moleskine Paper Textures (globals.css)
- Applied Notebook Styling to All Pages
- Category Icons Redesign (emojis to Lucide icons)
- BrandWidget Improvements
- Icon Organization (consolidated to 4 files)

---

## 2026-01-15 - Brand Widget Integration

**Session Focus**: Integrate LLYLI brand mascot/widget across all pages

### What Was Done

- Created BrandWidget component with CVA-based variants
- Integrated widget across all pages
- Created Info Dialog with app information

---

## 2026-01-15 - Next.js Web App Implementation

**Session Focus**: Convert prototype PNG mockups into production-ready Next.js screens

### What Was Done

- Project Foundation Setup (Next.js 14+, shadcn/ui, Tailwind)
- Shared Navigation Components (BottomNav, FAB)
- Implemented 8 MVP Screens
- Created ~25 components

---

## 2026-01-14 - Frame0 Mockups Update

**Session Focus**: Update Frame0 mobile mockups to match LLYLI product direction

### What Was Done

- Created Complete iOS Mockup Suite (6 screens)
- Design System & Tokens
- Navigation Structure

---

## 2026-01-14 (Part 2-6) - Brand Colors, Missing Screens, Scientific Aesthetic

**Session Focus**: Define brand colors, create missing MVP screens, refine to scientific aesthetic

### What Was Done

- Defined LLYLI brand colors (coral, cream, teal)
- Created 7 new MVP screens (onboarding, completion, mastery)
- Refined celebrations to calm/scientific aesthetic
- Created comprehensive info/help pages
- Final cleanup to 12 screens

---

## 2026-01-15 - Strategic Platform Reorganization: Web-First MVP

**Session Focus**: Reorganize project from iOS-first to web-first MVP with audio as primary feature

### What Was Done

- Shifted from native iOS MVP to responsive web application MVP
- Updated PRD, Implementation Plan, Vision documentation
- Created V2 Native iOS Roadmap
- Positioned audio as core feature

### Key Decisions

**Decision 1: Web-First MVP (Not iOS-First)**
Faster iteration, universal reach, lower cost, validate methodology first

**Decision 2: Audio as Primary Feature**
TTS API integration, CDN delivery, Service Worker caching

**Decision 3: Preserve All iOS Content for V2**
iOS native apps valuable for Share Extension, Widgets, offline-first - after validation

**Decision 4: Progressive Web App (PWA)**
Offline capabilities, install prompt, app-like experience without app store

---

> For current sessions, see [PROJECT_LOG.md](./PROJECT_LOG.md)
