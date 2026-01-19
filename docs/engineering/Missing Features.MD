# [MVP CRITICAL] Complete Core Learning Loop - Sentence Generation & FSRS Review System

## 🚨 Priority: P0 - Blocking MVP Launch

## Problem Statement

The LLYI web application is **65% feature-complete** but missing the **core learning loop** that delivers the product's primary value proposition. Currently, users can capture words and see them on the home page, but **cannot review them or experience the spaced repetition system** that drives the claimed 4-6x learning speed improvement.

### What's Working ✅
- Full authentication flow (Supabase)
- Phrase capture with auto-translation (OpenAI GPT-4o-mini)
- Auto-categorization (14 categories)
- TTS audio generation (OpenAI TTS)
- Home page displaying captured phrases with audio playback
- Beautiful Moleskine-themed UI with dark mode

### What's Missing ❌
- **Dynamic sentence generation** (Epic 2)
- **FSRS spaced repetition algorithm** (Epic 3)
- **Review session management** (Epic 3)
- **Mastery tracking** (3-correct-recall logic)
- **Session completion screen**

## Impact

**Without these features, we cannot:**
- Validate the core value proposition (87% retention vs 64% industry average)
- Measure key success metrics (7-day retention rate, session completion)
- Deliver on the product vision (4-6x faster learning)
- Launch a functional MVP that users can actually use for learning

**From PRD MVP Scope:**
> "LLYLI addresses these failures through:
> 1. ✅ Frictionless word capture
> 2. ❌ Dynamic sentence generation
> 3. ❌ Adaptive scheduling using FSRS
> 4. ❌ Strict mastery criteria"

**We currently have 1/4 of the core value proposition implemented.**

---

## User Stories to Complete

### User Story 2: Dynamic Sentence Review (P0)
**Story:** As a user, I want to review words in fresh, contextual sentences so that I learn to recognize them in varied contexts.

**Acceptance Criteria:**
- [ ] Generate unique sentences combining 2-4 related due words
- [ ] Never repeat the same sentence/word combination
- [ ] Provide high-quality native audio for each sentence
- [ ] Support multiple exercise types (fill-blank, multiple choice, type translation)

**Dependencies:** User Story 1 (Word Capture) ✅ COMPLETE

**Estimated Complexity:** Large (~38 hours)

**Reference:** `/docs/engineering/implementation_plan.md` lines 597-606

---

### User Story 3: FSRS-Based Spaced Repetition (P0)
**Story:** As a user, I want words scheduled at optimal review times so that I retain them with minimal effort.

**Acceptance Criteria:**
- [ ] Implement FSRS-4.5 algorithm with 4-point rating scale
- [ ] Calculate next review based on individual word difficulty and stability
- [ ] Track mastery via 3-correct-recalls-on-separate-sessions rule
- [ ] Show "Ready to Use" status when mastery achieved

**Dependencies:** User Story 2 (Sentence Generation)

**Estimated Complexity:** Large (~52 hours)

**Reference:** `/docs/engineering/implementation_plan.md` lines 608-617

---

## Technical Implementation Details

### Epic 2: Dynamic Sentence Generation

**Goal:** Generate unique, contextual sentences for review

#### Task 2.1: Word-Matching Algorithm (16 hours)
**Acceptance Criteria:**
- [ ] Group words by category
- [ ] Cluster by due date proximity (7-day window)
- [ ] Generate 2-4 word combinations
- [ ] Filter out used combinations (check `GeneratedSentence.wordIdsHash`)

**Algorithm Spec:** See `/docs/engineering/implementation_plan.md` lines 255-352

**Key Logic:**
```typescript
// Three constraints balanced:
// 1. Semantic relatedness - words share category
// 2. FSRS timing alignment - due within 7 days
// 3. Never-repeat - each word combo used exactly once

interface WordMatchingConfig {
  minWordsPerSentence: 2
  maxWordsPerSentence: 4
  dueDateWindowDays: 7
  retrievabilityThreshold: 0.9
}
Task 2.2: Sentence Generation via LLM (12 hours)
Acceptance Criteria:

 Generate sentences via GPT-4
 Validate sentence contains all target words
 Max 10 words per sentence
 Store with wordIdsHash for deduplication
 Generate TTS audio for each sentence
Prompt Template: See /docs/engineering/implementation_plan.md lines 353-390

Key Validation:

Sentence must be natural and grammatically correct
All target words must appear in the sentence
Sentence length ≤ 10 words
Difficulty appropriate for user level
Task 2.3: Batch Pre-Generation System (10 hours)
Acceptance Criteria:

 Trigger on app foreground
 Trigger after word capture
 Trigger on connectivity restoration
 Pre-generate 7 days of sentences ahead
Optimization:

Generate in background to avoid blocking UX
Cache in GeneratedSentence table with usedAt = null
Mark as used when shown to user
Epic 3: FSRS Review System
Goal: Optimize learning retention with FSRS algorithm

Task 3.1: FSRS Integration (16 hours)
Acceptance Criteria:

 Integrate ts-fsrs library (already in package.json)
 Implement 4-point rating scale:
1 = Again (complete blackout, wrong answer)
2 = Hard (correct but very difficult)
3 = Good (correct with normal effort)
4 = Easy (correct, trivially easy)
 Update difficulty, stability, retrievability on each review
 Calculate nextReviewDate using FSRS algorithm
Implementation Reference: /docs/engineering/implementation_plan.md lines 524-583

Key FSRS Fields (already in schema):

// web/db/schema.ts - words table
difficulty: real("difficulty").default(0.3)
stability: real("stability").default(1.0)
retrievability: real("retrievability").default(1.0)
nextReviewDate: timestamp("next_review_date").notNull().defaultNow()
lastReviewDate: timestamp("last_review_date")
reviewCount: integer("review_count").default(0)
lapseCount: integer("lapse_count").default(0)

FSRS Library Usage:

import { FSRS, Rating, Grade } from 'ts-fsrs'

const fsrs = new FSRS()
const card = {
  due: word.nextReviewDate,
  stability: word.stability,
  difficulty: word.difficulty,
  elapsed_days: daysSince(word.lastReviewDate),
  scheduled_days: daysBetween(word.lastReviewDate, word.nextReviewDate),
  reps: word.reviewCount,
  lapses: word.lapseCount,
  state: word.masteryStatus === 'learning' ? State.Learning : State.Review
}

// On review submission:
const rating = userGrade // 1-4 from grading buttons
const nextState = fsrs.repeat(card, now)[rating]

// Update word:
await db.update(words).set({
  difficulty: nextState.card.difficulty,
  stability: nextState.card.stability,
  retrievability: nextState.card.retrievability,
  nextReviewDate: nextState.card.due,
  lastReviewDate: now,
  reviewCount: word.reviewCount + 1,
  lapseCount: rating === 1 ? word.lapseCount + 1 : word.lapseCount
})

Task 3.2: Session Management (8 hours)
Acceptance Criteria:

 Create ReviewSession entity (already in schema)
 Start new session when >2 hours since last activity
 Track session boundaries for mastery calculation
 Store sessionId with each review
Session Logic:

// Create or get session
const lastSession = await getLastReviewSession(userId)
const hoursSinceLastReview = (now - lastSession.endedAt) / (1000 * 60 * 60)

let sessionId: string
if (!lastSession || hoursSinceLastReview > 2) {
  // Create new session
  sessionId = await createReviewSession(userId)
} else {
  // Continue existing session
  sessionId = lastSession.id
}

Database Schema (already created):

// web/db/schema.ts - review_sessions table
export const reviewSessions = pgTable("review_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
  wordsReviewed: integer("words_reviewed").default(0),
  correctCount: integer("correct_count").default(0),
})

Task 3.3: Mastery Tracking (8 hours)
Acceptance Criteria:

 Track consecutiveCorrectSessions (already in schema)
 Prevent same-session double-counting using lastCorrectSessionId
 Update masteryStatus to 'ready_to_use' after 3 correct recalls
 Show mastery celebration modal when achieved
Mastery Logic:

// On correct review (rating >= 3):
if (rating >= 3) {
  let consecutiveCorrect = word.consecutiveCorrectSessions

  // Only increment if different session
  if (word.lastCorrectSessionId !== sessionId) {
    consecutiveCorrect += 1
  }

  await db.update(words).set({
    consecutiveCorrectSessions: consecutiveCorrect,
    lastCorrectSessionId: sessionId,
    masteryStatus: consecutiveCorrect >= 3 ? 'ready_to_use' : word.masteryStatus
  })
}

// On incorrect review (rating < 3):
else {
  await db.update(words).set({
    consecutiveCorrectSessions: 0, // Reset counter
    lastCorrectSessionId: null,
    masteryStatus: 'learning'
  })
}

Database Fields (already in schema):

// web/db/schema.ts - words table
consecutiveCorrectSessions: integer("consecutive_correct_sessions").default(0)
lastCorrectSessionId: uuid("last_correct_session_id")
masteryStatus: text("mastery_status").default("learning") // 'learning' | 'learned' | 'ready_to_use'

Task 3.4: Review UI (20 hours)
Acceptance Criteria:

 Display sentence with blanked/highlighted words
 Multiple exercise types:
Fill-in-the-blank (type the word)
Multiple choice (select correct word)
Type translation (type full translation)
 Immediate feedback on answer
 Audio playback for sentence
 Grading buttons (Hard/Good/Easy) after reveal
 Next review timing shown in feedback
UI Components (already created, need API integration):

SentenceCard - displays sentence with blanks/highlights
GradingButtons - Hard/Good/Easy buttons
FeedbackCard - shows correctness + next review date
MasteryModal - celebration when word mastered
AudioPlayButton - plays sentence audio
Files to Update:

web/src/app/review/page.tsx - remove mock data, connect to API
web/src/lib/stores/review-store.ts - implement startSession(), submitReview(), endSession()
API Endpoints to Implement
GET /api/reviews/due
Purpose: Get words due for review

Query Params:

limit (default 20) - max words to return
Response:

{
  data: {
    words: Word[],
    sessionId: string
  }
}

Logic:

Check if active session exists (last session endedAt is null and started <2 hours ago)
If not, create new ReviewSession
Query words where retrievability < 0.9 OR nextReviewDate <= now
Order by nextReviewDate ASC
Limit to limit words
Return words + sessionId
File to Create: web/src/app/api/reviews/due/route.ts

POST /api/reviews/complete
Purpose: Submit review result and update FSRS parameters

Request Body:

{
  wordId: string
  rating: 1 | 2 | 3 | 4  // Again, Hard, Good, Easy
  sessionId: string
  responseTimeMs?: number
}

Response:

{
  data: {
    word: Word,
    nextReviewDate: string,
    masteryAchieved: boolean
  }
}

Logic:

Validate word belongs to user
Get current word data
Calculate FSRS next state using ts-fsrs
Update word with new FSRS parameters
Update mastery tracking (consecutiveCorrectSessions)
Update review session stats (wordsReviewed++, correctCount if rating >= 3)
Return updated word
File to Create: web/src/app/api/reviews/complete/route.ts

Reference Implementation: See /docs/engineering/implementation_plan.md lines 524-583

POST /api/reviews/end
Purpose: End current review session

Response:

{
  data: {
    session: ReviewSession,
    wordsReviewed: number,
    masteredCount: number  // words that achieved mastery this session
  }
}

Logic:

Get current session
Set endedAt to now
Count words mastered in this session
Return session stats
File to Create: web/src/app/api/reviews/end/route.ts

POST /api/sentences/generate
Purpose: Batch pre-generate sentences for upcoming reviews

Request Body:

{
  lookaheadDays?: number  // default 7
}

Response:

{
  data: {
    sentencesGenerated: number
  }
}

Logic:

Find words due within next lookaheadDays
Group by category
Create 2-4 word combinations within 7-day due date window
For each combination:
Check if sentence already exists (query wordIdsHash)
If not, generate via GPT-4
Generate TTS audio for sentence
Store in GeneratedSentence table with usedAt = null
Return count of generated sentences
File to Create: web/src/app/api/sentences/generate/route.ts

Optimization:

Can run as background job
Trigger on word capture
Trigger on app foreground
Rate limit to avoid excessive API calls
GET /api/sentences/next
Purpose: Get next sentence for current review session

Query Params:

sessionId - current review session ID
Response:

{
  data: {
    sentence: GeneratedSentence,
    targetWords: Word[],  // the 2-4 words being reviewed
    exerciseType: 'fill_blank' | 'multiple_choice' | 'type_translation'
  }
}

Logic:

Get due words for user
Find pre-generated sentence with usedAt = null containing these words
If none exists, generate on-demand
Mark sentence as used (usedAt = now, sessionId = sessionId)
Return sentence + target words
File to Create: web/src/app/api/sentences/next/route.ts

Database Schema (Already Complete ✅)
All required tables and fields are already implemented in web/db/schema.ts:

words table
✅ FSRS fields: difficulty, stability, retrievability, nextReviewDate
✅ Mastery fields: consecutiveCorrectSessions, lastCorrectSessionId, masteryStatus
✅ Review tracking: reviewCount, lapseCount, lastReviewDate
review_sessions table
✅ Session tracking: id, userId, startedAt, endedAt
✅ Stats: wordsReviewed, correctCount
sentences table (for generated sentences)
✅ Sentence data: text, audioUrl
✅ Word tracking: wordIds, wordIdsHash
✅ Usage tracking: usedAt, sessionId, exerciseType
No schema changes needed - all fields are ready!

UI Components (Already Built ✅)
All review UI components exist but use mock data:

Files that need API integration:

web/src/app/review/page.tsx - Main review page
web/src/components/review/SentenceCard.tsx - Sentence display
web/src/components/review/GradingButtons.tsx - Hard/Good/Easy buttons
web/src/components/review/FeedbackCard.tsx - Post-review feedback
web/src/components/review/MasteryModal.tsx - Mastery celebration
State Management:

web/src/lib/stores/review-store.ts - Has skeleton methods, needs implementation
Zustand Store Implementation
File: web/src/lib/stores/review-store.ts
Methods to Implement:

interface ReviewStore {
  // Session management
  currentSessionId: string | null
  isSessionActive: boolean
  startSession: () => Promise<void>
  endSession: () => Promise<SessionStats>

  // Review flow
  currentSentence: GeneratedSentence | null
  currentWords: Word[]
  loadNextReview: () => Promise<void>
  submitReview: (wordId: string, rating: 1 | 2 | 3 | 4) => Promise<ReviewResult>

  // Progress tracking
  sessionWordsReviewed: number
  sessionCorrectCount: number
  wordsRemaining: number
}

Implementation Tasks:

Connect to /api/reviews/due endpoint
Connect to /api/reviews/complete endpoint
Connect to /api/sentences/next endpoint
Handle session state transitions
Update local state on review submission
Trigger mastery modal when word graduates
Success Criteria
Feature Completion Checklist
Epic 2: Sentence Generation
 Word-matching algorithm groups by category and due date
 GPT-4 generates sentences with 2-4 target words
 Sentences stored with hash to prevent repetition
 TTS audio generated for each sentence
 Batch pre-generation system triggers on word capture
 API endpoint /api/sentences/generate working
 API endpoint /api/sentences/next working
Epic 3: FSRS Review System
 ts-fsrs library integrated
 Review submission updates FSRS parameters (difficulty, stability, nextReviewDate)
 Session boundaries tracked (new session after 2 hours)
 Mastery tracking counts 3 correct recalls across separate sessions
 "Ready to Use" status updates when mastery achieved
 API endpoint /api/reviews/due working
 API endpoint /api/reviews/complete working
 API endpoint /api/reviews/end working
 Review UI connected to real data
 Grading buttons trigger FSRS calculations
 Feedback shows next review timing
 Mastery modal appears on graduation
Quality Gates
 All API endpoints have error handling
 FSRS calculations validated against library documentation
 Sentence generation doesn't repeat word combinations
 Audio generation handles failures gracefully
 Review session stats are accurate
 Mobile UX is smooth and responsive
Testing Checklist
 User can complete full review flow end-to-end
 Words advance through mastery stages correctly
 Session boundaries respected (2-hour gap = new session)
 FSRS scheduling adapts to user performance
 Sentences never repeat for same word combinations
 Audio plays correctly on mobile and desktop
 Mastery modal appears after 3rd correct recall
Estimation Summary
Epic	Total Hours	Priority
Epic 2: Sentence Generation	38 hours	P0
Epic 3: FSRS Review System	52 hours	P0
Total	90 hours	~2-3 weeks
Breakdown:

Task 2.1: Word-matching algorithm (16h)
Task 2.2: Sentence generation via LLM (12h)
Task 2.3: Batch pre-generation (10h)
Task 3.1: FSRS integration (16h)
Task 3.2: Session management (8h)
Task 3.3: Mastery tracking (8h)
Task 3.4: Review UI integration (20h)
Definition of Done
This issue is complete when:

✅ User can capture a word
✅ Word appears on home page with audio
✅ User can start a review session
✅ Review session shows a sentence with 2-4 captured words
✅ User can grade their recall (Hard/Good/Easy)
✅ FSRS algorithm calculates next review date
✅ After 3 correct recalls (across different sessions), word shows "Ready to Use"
✅ Session completion screen shows stats
✅ No duplicate sentences for same word combinations
✅ All flows work on mobile and desktop
At this point, we will have a functional MVP that delivers on the core value proposition: "4-6x faster vocabulary acquisition through dynamic sentence generation and adaptive scheduling."

References
Product Vision: /docs/product/vision.md
Implementation Plan: /docs/engineering/implementation_plan.md (lines 584-774)
Database Schema: /web/db/schema.ts
Review Store: /web/src/lib/stores/review-store.ts
Review Components: /web/src/components/review/*
FSRS Library Docs: https://github.com/open-spaced-repetition/ts-fsrs