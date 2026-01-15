# Implementation Plan: LLYI

## Executive Summary

### Core Value Proposition
LLYI transforms real-life language encounters into memorable learning experiences by enabling users to capture, review, and retain phrases seamlessly through smart cards with **high-quality native audio** and a proven spaced repetition system.

### Platform Approach
**Version 1 (MVP)**: Responsive web application optimized for mobile and desktop browsers. This enables rapid iteration, instant updates, and cross-platform reach without app store dependencies.

**Version 2**: Native iOS app with platform-specific features (Share Extension, Widgets, offline-first architecture).

### MVP Scope
The web MVP includes:
- Quick phrase capture via text input (mobile-optimized)
- Smart card creation with **high-quality native audio playback**
- Spaced repetition system using FSRS algorithm
- Tagging and collections for organization
- Progress overview and analytics
- Progressive Web App (PWA) capabilities for offline support

### Success Criteria
- **Feature Completion:** All P0 features from PRD implemented and tested
- **User Validation:** At least 30% of users utilize the capture feature daily with positive feedback from 500+ active users
- **Technical Quality:** Core features work reliably with <5% error rate
- **Audio Performance:** Audio playback starts within <1 second on mobile
- **Mobile Experience:** Works seamlessly on iPhone Safari and Android Chrome

## Technical Architecture

### Tech Stack (Definitive Choices)

**Frontend:**
- **Framework:** Next.js 14+ with App Router and React 18+
- **UI Components:** shadcn/ui with Tailwind CSS (mobile-first responsive design)
- **State Management:** Zustand (single pattern for all state)
- **PWA:** next-pwa for Progressive Web App capabilities
- **Audio:** HTML5 Audio API with Web Audio API for advanced features

**Backend/Infrastructure (Supabase Full Stack):**
- **API Layer:** Next.js API Routes with Server Actions
- **Database:** Supabase (PostgreSQL)
- **ORM:** Drizzle ORM
- **Authentication:** Supabase Auth (built-in, zero additional cost)
- **File Storage:** Supabase Storage (S3-compatible, edge caching included)
- **Caching:** Next.js built-in caching (ISR, on-demand revalidation) + browser localStorage

**Audio Services:**
- **Text-to-Speech:** OpenAI TTS (primary - best quality/cost ratio, Portuguese support)
- **Audio Format:** AAC (preferred) or MP3 fallback, 44.1kHz, 128kbps
- **Audio Delivery:** Supabase Storage CDN + Service Worker caching

**Hosting & Deployment:**
- **Platform:** Vercel (edge functions for low latency)
- **CDN:** Vercel Edge Network (automatic)
- **Analytics:** Vercel Analytics
- **Error Tracking:** Sentry

**AI Services:**
- **LLM:** OpenAI GPT-4 for sentence generation and category assignment
- **Spaced Repetition:** ts-fsrs library for FSRS-4.5 algorithm

**Future (add when scaling requires):**
- Upstash Redis (if caching becomes bottleneck)
- Cloudflare CDN (if audio latency issues arise)
- Stripe (premium features)

### Architecture Patterns
- **Responsive-First Design:** Mobile-first CSS with breakpoints (375px, 768px, 1280px)
- **Progressive Enhancement:** Core features work without JavaScript, enhanced with JS
- **Server-Side Rendering:** Next.js SSR for fast initial page loads and SEO
- **API Layer:** RESTful API design with Next.js API routes
- **State Management:** Zustand for all shared state (auth, words, review session)
- **PWA Architecture:** Service Worker for offline capabilities and caching

### Session Definition
A **review session** is defined as:
- A new session starts when **>2 hours** since last review activity
- OR when user explicitly starts a new session from home screen
- Session boundaries are critical for the "3 correct recalls on separate sessions" mastery requirement
- Each review action records `sessionId` for audit trail

### PWA Cache Strategy

| Content Type | Cache Strategy | TTL |
|--------------|---------------|-----|
| Static assets (JS, CSS, images) | Cache-first, stale-while-revalidate | 30 days |
| Audio files | Cache-first after first play | Forever (until storage limit) |
| Pre-generated sentences | Network-first with cache fallback | 7 days |
| Review state | Write-through with sync on reconnect | n/a |
| Word data | Stale-while-revalidate | 1 day |

### Audio Architecture

**Audio Generation Pipeline:**
1. User captures word → Backend validates and stores word
2. Backend calls OpenAI TTS API for native pronunciation
3. Audio file stored in Supabase Storage (CDN-enabled)
4. Audio URL returned to frontend and cached in Service Worker

**Audio Playback Strategy:**
```
Client Request → Check Service Worker Cache →
  If cached: Play immediately (<100ms)
  If not cached: Fetch from Supabase CDN → Cache → Play (<1s)
```

**Audio Optimization:**
- **Format:** AAC (preferred for quality/size) or MP3 fallback
- **Bitrate:** 128kbps (optimal for speech)
- **Sample Rate:** 44.1kHz minimum
- **Caching:** Service Worker caches all played audio permanently
- **Preloading:** Preload audio for due review words in background
- **Mobile Optimization:** Use native HTML5 `<audio>` element for iOS compatibility

### Data Model

#### Entity Relationship Diagram
```
[User] 1────────M [Word]
    │              │
    │              M
    │         [GeneratedSentence]
    │              │
    1              M
[ReviewSession]────┘
```

#### Core Entities

- **User**
  - Fields: id (uuid), email (string, unique), name (string), nativeLanguage (string), targetLanguage (string), createdAt (timestamp), updatedAt (timestamp)
  - Relationships: has_many Words, has_many ReviewSessions
  - Indexes: email for authentication lookup
  - Notes: Managed by Supabase Auth

- **Word** (unified entity - replaces Phrase + SmartCard)
  - Fields:
    - id (uuid)
    - userId (uuid, FK)
    - originalText (string) - the captured word
    - translation (string) - auto-generated translation
    - language ('source' | 'target') - detected language
    - audioUrl (string, nullable) - Supabase Storage URL
    - category (string) - auto-assigned: food, work, home, transport, health, social, bureaucracy, greetings, other
    - categoryConfidence (float) - LLM confidence score
    - **FSRS Fields:**
    - difficulty (float, default 0.3) - FSRS difficulty parameter
    - stability (float, default 1.0) - FSRS stability parameter
    - retrievability (float, default 1.0) - calculated recall probability
    - nextReviewDate (date) - FSRS calculated next review
    - lastReviewDate (timestamp, nullable)
    - reviewCount (int, default 0)
    - lapseCount (int, default 0) - times word was forgotten (rating = Again)
    - **Mastery Fields:**
    - consecutiveCorrectSessions (int, default 0) - for 3-correct-recall rule
    - lastCorrectSessionId (uuid, nullable) - prevents same-session double-counting
    - masteryStatus ('learning' | 'learned' | 'ready_to_use', default 'learning')
    - createdAt (timestamp), updatedAt (timestamp)
  - Indexes: userId, nextReviewDate (for due words query), category (for grouping)
  - Notes: FSRS parameters updated on each review using ts-fsrs library

- **GeneratedSentence** (tracks unique sentences to prevent repetition)
  - Fields:
    - id (uuid)
    - userId (uuid, FK)
    - text (string) - the generated sentence (max 10 words)
    - audioUrl (string, nullable) - sentence audio
    - wordIds (uuid[]) - array of 2-4 word IDs combined in this sentence
    - wordIdsHash (string) - sorted wordIds hash for fast dedup lookup
    - exerciseType ('type_translation' | 'fill_blank' | 'multiple_choice')
    - sessionId (uuid, nullable, FK) - review session that used it
    - usedAt (timestamp, nullable) - null means pre-generated but not yet shown
    - createdAt (timestamp)
  - Indexes: userId, wordIdsHash (unique), usedAt
  - Notes: Each word combination generates unique sentences; hash prevents repetition

- **ReviewSession** (tracks session boundaries for mastery)
  - Fields:
    - id (uuid)
    - userId (uuid, FK)
    - startedAt (timestamp)
    - endedAt (timestamp, nullable)
    - wordsReviewed (int, default 0)
    - correctCount (int, default 0)
  - Indexes: userId, startedAt
  - Notes: New session created when >2 hours since last activity

- **Tag** (for user-defined organization)
  - Fields: id (uuid), name (string), wordId (uuid, FK), createdAt (timestamp)
  - Relationships: belongs_to Word
  - Indexes: wordId

### API Routes / Endpoints

#### Authentication Routes (Supabase Auth)
- Authentication handled by Supabase Auth SDK
- `POST /api/auth/callback` - OAuth callback handler
- `POST /api/auth/setup` - Complete user setup (set native/target language)

#### Word Management Routes

- `POST /api/words` - Capture and create a word
  - Body: `{ text: string, context?: string }`
  - Process: Auto-detect language → Translate → Generate audio → Assign category
  - Response: `{ data: { word: Word } }`

- `GET /api/words` - List user's words with pagination
  - Query params: `page, limit, category, masteryStatus, search`
  - Response: `{ data: { words: Word[], total: number } }`

- `GET /api/words/:id` - Get a specific word with full details
- `PUT /api/words/:id` - Update word (e.g., change category)
- `DELETE /api/words/:id` - Delete a word

#### Review System Routes

- `GET /api/reviews/due` - Get words due for review
  - Query params: `limit` (default 20)
  - Response: `{ data: { words: Word[], sessionId: string } }`
  - Creates new ReviewSession if >2 hours since last activity

- `POST /api/reviews/complete` - Submit review result
  - Body: `{ wordId: string, rating: 1 | 2 | 3 | 4, responseTimeMs?: number }`
  - Rating scale (FSRS standard):
    - 1 = Again (complete blackout, wrong answer)
    - 2 = Hard (correct but very difficult)
    - 3 = Good (correct with normal effort)
    - 4 = Easy (correct, trivially easy)
  - Process: Update FSRS parameters → Update mastery tracking → Return next review date
  - Response: `{ data: { word: Word, nextReviewDate: string } }`

- `POST /api/reviews/end` - End current review session
  - Response: `{ data: { session: ReviewSession, wordsReviewed: number, masteredCount: number } }`

#### Sentence Generation Routes

- `POST /api/sentences/generate` - Trigger batch sentence pre-generation
  - Body: `{ lookaheadDays?: number }` (default 7)
  - Process: Find due words → Group by category + timing → Generate unique sentences
  - Response: `{ data: { sentencesGenerated: number } }`

- `GET /api/sentences/next` - Get next sentence for review
  - Query params: `sessionId`
  - Response: `{ data: { sentence: GeneratedSentence, targetWords: Word[] } }`

#### Session Routes

- `GET /api/sessions/current` - Get or create current session
  - Response: `{ data: { session: ReviewSession, isNew: boolean } }`

- `GET /api/sessions/history` - Get past review sessions
  - Query params: `limit, offset`
  - Response: `{ data: { sessions: ReviewSession[] } }`

### Dynamic SRS Word-Matching Algorithm

The core differentiator: generating sentences that combine 2-4 semantically related words that are due for review at similar times.

**Three constraints balanced:**
1. **Semantic relatedness** - Words in same sentence share a category
2. **FSRS timing alignment** - Words are due within 7 days of each other
3. **Never-repeat** - Each word combination is used exactly once

**Algorithm:**
```typescript
interface WordMatchingConfig {
  minWordsPerSentence: 2
  maxWordsPerSentence: 4
  dueDateWindowDays: 7
  retrievabilityThreshold: 0.9
}

async function selectWordsForSentences(userId: string): Promise<Word[][]> {
  // 1. Get words below retrievability threshold
  const dueWords = await db.word.findMany({
    where: { userId, retrievability: { lt: 0.9 } },
    orderBy: { nextReviewDate: 'asc' }
  })

  // 2. Group by category
  const categoryGroups = groupBy(dueWords, 'category')

  // 3. Within each category, cluster by due date proximity
  const combinations: Word[][] = []

  for (const [category, words] of Object.entries(categoryGroups)) {
    const sorted = words.sort((a, b) =>
      a.nextReviewDate.getTime() - b.nextReviewDate.getTime()
    )

    // Sliding window for words due within 7 days
    let i = 0
    while (i < sorted.length) {
      const window: Word[] = [sorted[i]]
      let j = i + 1

      while (j < sorted.length &&
             daysBetween(sorted[i].nextReviewDate, sorted[j].nextReviewDate) <= 7) {
        window.push(sorted[j])
        j++
      }

      // Generate 2-4 word combinations
      if (window.length >= 2) {
        const combos = generateCombinations(window, 2, 4)
        const unused = await filterUsedCombinations(userId, combos)
        combinations.push(...unused)
      }

      i = j || i + 1
    }
  }

  return combinations
}
```

**Category Assignment (on word capture):**
```typescript
async function assignCategory(word: string, context?: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{
      role: 'system',
      content: `Categorize into one: food, restaurant, shopping, work, home,
                transport, health, social, bureaucracy, emergency, weather,
                time, greetings, other`
    }, {
      role: 'user',
      content: `Word: "${word}"${context ? `\nContext: "${context}"` : ''}`
    }]
  })
  return response.choices[0].message.content?.toLowerCase() || 'other'
}
```

**Batch Pre-generation (triggered on app foreground, after capture, on reconnect):**
```typescript
async function preGenerateSentences(userId: string): Promise<void> {
  const combinations = await selectWordsForSentences(userId)

  for (const wordGroup of combinations.slice(0, 20)) { // Limit batch size
    const sentence = await generateSentence(wordGroup)
    await db.generatedSentence.create({
      userId,
      text: sentence.text,
      wordIds: wordGroup.map(w => w.id),
      wordIdsHash: hashWordIds(wordGroup),
      exerciseType: determineExerciseType(wordGroup),
      usedAt: null
    })
  }
}
```

**Exercise Type Selection:**
```typescript
type ExerciseType = 'type_translation' | 'fill_blank' | 'multiple_choice'

function determineExerciseType(words: Word[]): ExerciseType {
  const avgCorrect = words.reduce((sum, w) =>
    sum + w.consecutiveCorrectSessions, 0) / words.length

  if (avgCorrect < 1) return 'multiple_choice'  // Easiest
  if (avgCorrect < 2) return 'fill_blank'       // Medium
  return 'type_translation'                      // Hardest
}
```

### FSRS Algorithm Theory & Implementation

FSRS (Free Spaced Repetition Scheduler) uses the **DSR model** to predict optimal review timing:

#### Core Parameters

| Parameter | Symbol | Description | Initial Value |
|-----------|--------|-------------|---------------|
| **Difficulty** | D | How hard it is to increase memory stability (0-10) | 5.0 |
| **Stability** | S | Days until retrievability drops to 90% | 1.0 |
| **Retrievability** | R | Probability of successful recall (0-1) | 1.0 |

#### The Forgetting Curve

FSRS models memory decay using a power law:

```
R(t) = (1 + t/(9·S))^(-1)

Where:
  R = retrievability (probability of recall)
  t = days since last review
  S = stability (memory strength in days)
```

**Example decay for S=10 days:**
```
Day 0:  R = 100%  ████████████████████
Day 5:  R = 95%   ███████████████████
Day 10: R = 90%   ██████████████████   ← Target threshold
Day 15: R = 86%   █████████████████
Day 20: R = 82%   ████████████████
Day 30: R = 75%   ███████████████
```

#### Optimal Interval Calculation

Given target retrievability (default 90%), calculate when to review:

```typescript
// Calculate days until retrievability drops to target
function calculateOptimalInterval(stability: number, targetR: number = 0.9): number {
  // Derived from R(t) = (1 + t/(9·S))^(-1)
  // Solving for t: t = 9·S·(1/R - 1)
  return 9 * stability * (1 / targetR - 1)
}

// Examples:
// S=1  → interval = 1 day
// S=10 → interval = 10 days
// S=30 → interval = 30 days
```

#### Stability Update After Review

After each review, stability is updated based on the rating:

```typescript
import { createEmptyCard, fsrs, generatorParameters, Rating } from 'ts-fsrs'

// FSRS-4.5 default parameters (can be personalized later)
const params = generatorParameters()
const f = fsrs(params)

// Rating scale
enum Rating {
  Again = 1,  // Complete blackout, wrong answer
  Hard = 2,   // Correct but very difficult
  Good = 3,   // Correct with normal effort
  Easy = 4    // Trivially easy
}

// Update word after review
async function processReview(
  word: Word,
  rating: Rating,
  sessionId: string
): Promise<Word> {
  // Create FSRS card from current word state
  const card = {
    due: word.nextReviewDate,
    stability: word.stability,
    difficulty: word.difficulty,
    elapsed_days: daysSince(word.lastReviewDate),
    scheduled_days: daysBetween(word.lastReviewDate, word.nextReviewDate),
    reps: word.reviewCount,
    lapses: word.lapseCount || 0,
    state: word.reviewCount === 0 ? State.New : State.Review,
    last_review: word.lastReviewDate
  }

  // Get next state from FSRS
  const scheduling = f.repeat(card, new Date())
  const next = scheduling[rating]

  // Update word with new FSRS parameters
  const updatedWord = {
    ...word,
    difficulty: next.card.difficulty,
    stability: next.card.stability,
    retrievability: calculateRetrievability(next.card.stability, 0),
    nextReviewDate: next.card.due,
    lastReviewDate: new Date(),
    reviewCount: word.reviewCount + 1,
  }

  // Update mastery tracking
  if (rating >= Rating.Good) {
    // Correct answer
    if (word.lastCorrectSessionId !== sessionId) {
      updatedWord.consecutiveCorrectSessions = word.consecutiveCorrectSessions + 1
      updatedWord.lastCorrectSessionId = sessionId
    }
    if (updatedWord.consecutiveCorrectSessions >= 3) {
      updatedWord.masteryStatus = 'ready_to_use'
    }
  } else {
    // Wrong answer - reset mastery progress
    updatedWord.consecutiveCorrectSessions = 0
    updatedWord.lastCorrectSessionId = null
    updatedWord.masteryStatus = 'learning'
  }

  return updatedWord
}
```

#### How Ratings Affect Stability

| Rating | Effect on Stability | Next Interval Example (S=10) |
|--------|--------------------|-----------------------------|
| **Again (1)** | S decreases significantly | ~1 day (relearn) |
| **Hard (2)** | S increases slightly | ~8 days |
| **Good (3)** | S increases normally | ~25 days |
| **Easy (4)** | S increases significantly | ~60 days |

#### Retrievability Calculation for Due Words

```typescript
// Calculate current retrievability for a word
function calculateRetrievability(stability: number, daysSinceReview: number): number {
  if (daysSinceReview <= 0) return 1.0
  return Math.pow(1 + daysSinceReview / (9 * stability), -1)
}

// Word is due when retrievability drops below threshold
function isDue(word: Word, threshold: number = 0.9): boolean {
  const daysSince = daysBetween(word.lastReviewDate, new Date())
  const currentR = calculateRetrievability(word.stability, daysSince)
  return currentR < threshold
}

// Get all due words for review session
async function getDueWords(userId: string): Promise<Word[]> {
  const words = await db.word.findMany({ where: { userId } })
  return words.filter(w => isDue(w, 0.9))
}
```

#### Complete Review Flow

```
User answers → Rating (1-4) → FSRS calculates new S, D → New interval → Update DB
     │                              │                         │
     │                              │                         ▼
     │                              │              nextReviewDate = now + interval
     │                              │
     │                              ▼
     │              Stability update formula (ts-fsrs handles this):
     │              S' = S · (e^w · (11-D) · S^(-w) · (e^(w·(1-R)) - 1) · rating_factor + 1)
     │
     ▼
If rating ≥ 3 (Good/Easy):
  └─► consecutiveCorrectSessions++ (if new session)
  └─► If consecutiveCorrectSessions ≥ 3 → masteryStatus = 'ready_to_use'

If rating < 3 (Again/Hard with wrong):
  └─► consecutiveCorrectSessions = 0
  └─► masteryStatus = 'learning'
```

#### Why ts-fsrs Library

We use the `ts-fsrs` library rather than implementing FSRS from scratch because:

1. **Proven accuracy**: FSRS-4.5 is the result of extensive ML research and testing
2. **Maintained**: Active development and bug fixes
3. **Parameter optimization**: Future ability to personalize parameters per user
4. **Edge cases handled**: Leap years, timezone issues, numeric precision

```bash
npm install ts-fsrs
```

```typescript
import { createEmptyCard, fsrs, generatorParameters, Rating, State } from 'ts-fsrs'

// Initialize with default FSRS-4.5 parameters
const params = generatorParameters()
const f = fsrs(params)

// Create new card for a captured word
const card = createEmptyCard()

// After review with rating 3 (Good)
const scheduling = f.repeat(card, new Date())
const nextState = scheduling[Rating.Good]

console.log(nextState.card.due)        // Next review date
console.log(nextState.card.stability)  // New stability
console.log(nextState.card.difficulty) // Updated difficulty
```

## User Stories

### User Story 1: Quick Word Capture
**Story:** As a user, I want to capture words I encounter quickly so that I can review them later.
**Priority:** P0
**Acceptance Criteria:**
- [ ] Capture words via text input on mobile-optimized interface
- [ ] Auto-detect language (source or target)
- [ ] Auto-translate and assign category
- [ ] Generate native audio pronunciation via TTS
**Dependencies:** None
**Estimated Complexity:** Medium

### User Story 2: Dynamic Sentence Review
**Story:** As a user, I want to review words in fresh, contextual sentences so that I learn to recognize them in varied contexts.
**Priority:** P0
**Acceptance Criteria:**
- [ ] Generate unique sentences combining 2-4 related due words
- [ ] Never repeat the same sentence/word combination
- [ ] Provide high-quality native audio for each sentence
- [ ] Support multiple exercise types (fill-blank, multiple choice, type translation)
**Dependencies:** User Story 1
**Estimated Complexity:** Large

### User Story 3: FSRS-Based Spaced Repetition
**Story:** As a user, I want words scheduled at optimal review times so that I retain them with minimal effort.
**Priority:** P0
**Acceptance Criteria:**
- [ ] Implement FSRS-4.5 algorithm with 4-point rating scale
- [ ] Calculate next review based on individual word difficulty and stability
- [ ] Track mastery via 3-correct-recalls-on-separate-sessions rule
- [ ] Show "Ready to Use" status when mastery achieved
**Dependencies:** User Story 2
**Estimated Complexity:** Large

### User Story 4: Word Organization (Tags & Categories)
**Story:** As a user, I want to browse and filter my words by category so that I can focus on specific areas.
**Priority:** P1
**Acceptance Criteria:**
- [ ] View words grouped by auto-assigned category
- [ ] Allow users to create and assign custom tags
- [ ] Filter review sessions by category or tag
**Dependencies:** User Story 1
**Estimated Complexity:** Medium

### User Story 5: Progress & Mastery Dashboard
**Story:** As a user, I want to see my learning progress so that I stay motivated and know what I've mastered.
**Priority:** P2
**Acceptance Criteria:**
- [ ] Display words captured, reviewed, and mastered counts
- [ ] Show retention rate and streak
- [ ] List "Ready to Use" words separately
- [ ] Update statistics in real-time
**Dependencies:** User Story 3
**Estimated Complexity:** Medium

## Development Epics

### Epic 0: Technical Foundation
**Goal:** Establish technical infrastructure needed to support feature development
**Tasks:**
- Next.js 14+ project initialization with TypeScript
- Supabase project setup (database, auth, storage)
- Drizzle ORM schema and migrations
- Zustand store setup
- Vercel deployment pipeline
- Environment configuration (.env.local, .env.production)
- Sentry error tracking integration
- PWA manifest and Service Worker setup

### Epic 1: Word Capture
**Goal:** Enable users to capture words effortlessly
**User Stories Included:** US-1
**Tasks:**
- **Task 1.1:** Word capture UI and API
  - **Acceptance Criteria:**
    - [ ] Mobile-optimized text input
    - [ ] POST /api/words endpoint
    - [ ] Word stored in database
  - **Estimated Effort:** 12 hours

- **Task 1.2:** Language detection and translation
  - **Acceptance Criteria:**
    - [ ] Auto-detect source/target language
    - [ ] Auto-translate via OpenAI API
    - [ ] Auto-assign category via GPT-4
  - **Estimated Effort:** 8 hours

- **Task 1.3:** Audio generation
  - **Acceptance Criteria:**
    - [ ] Generate TTS audio via OpenAI TTS
    - [ ] Store in Supabase Storage
    - [ ] Return audio URL with word
  - **Estimated Effort:** 8 hours

### Epic 2: Dynamic Sentence Generation
**Goal:** Generate unique, contextual sentences for review
**User Stories Included:** US-2
**Tasks:**
- **Task 2.1:** Word-matching algorithm
  - **Acceptance Criteria:**
    - [ ] Group words by category
    - [ ] Cluster by due date proximity (7-day window)
    - [ ] Generate 2-4 word combinations
    - [ ] Filter out used combinations
  - **Estimated Effort:** 16 hours

- **Task 2.2:** Sentence generation via LLM
  - **Acceptance Criteria:**
    - [ ] Generate sentences via GPT-4
    - [ ] Validate sentence contains target words
    - [ ] Max 10 words per sentence
    - [ ] Store with wordIdsHash for dedup
  - **Estimated Effort:** 12 hours

- **Task 2.3:** Batch pre-generation system
  - **Acceptance Criteria:**
    - [ ] Trigger on app foreground
    - [ ] Trigger after word capture
    - [ ] Trigger on connectivity restoration
    - [ ] Pre-generate 7 days of sentences
  - **Estimated Effort:** 10 hours

### Epic 3: FSRS Review System
**Goal:** Optimize learning retention with FSRS algorithm
**User Stories Included:** US-3
**Tasks:**
- **Task 3.1:** FSRS integration
  - **Acceptance Criteria:**
    - [ ] Integrate ts-fsrs library
    - [ ] 4-point rating scale (Again, Hard, Good, Easy)
    - [ ] Update difficulty, stability, retrievability on review
    - [ ] Calculate next review date
  - **Estimated Effort:** 16 hours

- **Task 3.2:** Session management
  - **Acceptance Criteria:**
    - [ ] Create ReviewSession entity
    - [ ] New session after 2-hour gap
    - [ ] Track session boundaries for mastery
  - **Estimated Effort:** 8 hours

- **Task 3.3:** Mastery tracking
  - **Acceptance Criteria:**
    - [ ] Track consecutiveCorrectSessions
    - [ ] Prevent same-session double-counting
    - [ ] Update masteryStatus to 'ready_to_use' after 3 correct
  - **Estimated Effort:** 8 hours

- **Task 3.4:** Review UI
  - **Acceptance Criteria:**
    - [ ] Display sentence with blanked/highlighted words
    - [ ] Multiple exercise types (fill-blank, multiple-choice, type)
    - [ ] Immediate feedback on answer
    - [ ] Audio playback
  - **Estimated Effort:** 20 hours

### Epic 4: Word Organization
**Goal:** Browse and filter words by category and tags
**User Stories Included:** US-4
**Tasks:**
- **Task 4.1:** Notebook/browse view
  - **Acceptance Criteria:**
    - [ ] View words grouped by category
    - [ ] Search and filter
    - [ ] Word detail view
  - **Estimated Effort:** 12 hours

- **Task 4.2:** Custom tags
  - **Acceptance Criteria:**
    - [ ] Create and assign tags to words
    - [ ] Filter by tag
  - **Estimated Effort:** 8 hours

### Epic 5: Progress Dashboard
**Goal:** Provide users with learning progress insights
**User Stories Included:** US-5
**Tasks:**
- **Task 5.1:** Progress metrics
  - **Acceptance Criteria:**
    - [ ] Words captured, reviewed, mastered counts
    - [ ] Retention rate calculation
    - [ ] Streak tracking
  - **Estimated Effort:** 12 hours

- **Task 5.2:** Ready to Use list
  - **Acceptance Criteria:**
    - [ ] List words with 'ready_to_use' status
    - [ ] Celebration modal on mastery
  - **Estimated Effort:** 6 hours

## Implementation Phases

### Phase 1: Foundation & Word Capture
**Epics:** Epic 0 (Foundation), Epic 1 (Word Capture)
**Key Deliverables:**
- Next.js + Supabase infrastructure
- Word capture with auto-translation and TTS audio
**Exit Criteria:**
- [ ] User can sign up and capture words
- [ ] Words have audio pronunciation

### Phase 2: Dynamic Sentence Generation
**Epics:** Epic 2 (Sentence Generation)
**Key Deliverables:**
- Word-matching algorithm
- Sentence generation via GPT-4
- Batch pre-generation system
**Exit Criteria:**
- [ ] Sentences generated combining 2-4 related words
- [ ] No sentence repetition

### Phase 3: FSRS Review System
**Epics:** Epic 3 (FSRS Review)
**Key Deliverables:**
- FSRS-4.5 algorithm integration
- Session management
- Mastery tracking (3 correct recalls)
- Review UI with multiple exercise types
**Exit Criteria:**
- [ ] Reviews scheduled based on FSRS
- [ ] Mastery status updates after 3 correct sessions

### Phase 4: Organization & Progress
**Epics:** Epic 4 (Organization), Epic 5 (Progress)
**Key Deliverables:**
- Notebook view by category
- Custom tags
- Progress dashboard
**Exit Criteria:**
- [ ] Users can browse and filter words
- [ ] Progress metrics visible

### Phase 5: Polish & Launch
**Key Deliverables:**
- PWA optimization (offline, install prompt)
- Performance optimization
- Bug fixes and polish
**Exit Criteria:**
- [ ] All P0 features stable
- [ ] Audio plays <1s on mobile
- [ ] Works offline with pre-generated content

## Testing Strategy

### Unit Testing
- **Framework:** Vitest with React Testing Library
- **Components:** Word capture form, Review card, Audio player, Exercise types
- **Services:** FSRS calculations, Word-matching algorithm, Category assignment

### Integration Testing
- **Framework:** Playwright for E2E tests
- **Key Flows:**
  - Word capture → Audio generation → Storage
  - Review session → FSRS update → Mastery tracking
  - Sentence generation → Combination dedup → Pre-caching
- **API Tests:** All endpoints with realistic payloads

### Verification Tests (Critical)
1. **Data model test:** Create word → Generate 3 sentences → Verify none repeat
2. **Mastery test:** Review word correctly 3x across 3 sessions → Verify 'ready_to_use' status
3. **FSRS test:** Submit ratings 1-4 → Verify next review date changes appropriately
4. **Offline test:** Go offline → Complete review with pre-cached content → Sync on reconnect
5. **Latency test:** Sentence generation < 3s with batch pre-generation

### User Acceptance Testing
- Validate with 10+ real users completing core workflows
- Success metrics: Session completion rate >80%, word capture friction <2s

## Deployment Plan

### Environments
- **Development:** Local Next.js dev server (`npm run dev`)
- **Preview:** Vercel automatic preview deployments for every PR
- **Staging:** Vercel staging environment (`staging.llyli.app`)
- **Production:** Vercel production environment (`llyli.app` or custom domain)

### Deployment Process
1. **Local Development:**
   - Develop features with hot reload
   - Test on mobile viewports using browser DevTools
   - Test audio on actual mobile devices (iPhone Safari, Android Chrome)

2. **Pull Request:**
   - Create PR → Vercel automatically deploys preview
   - Review preview on multiple devices
   - Run automated tests (Playwright for E2E, Vitest for unit)

3. **Staging Deployment:**
   - Merge to `staging` branch
   - Automatic deploy to staging environment
   - QA testing on staging

4. **Production Deployment:**
   - Merge to `main` branch
   - Automatic deploy to production
   - Monitor error rates and performance

### PWA Deployment Checklist
- [ ] Service Worker registered and caching static assets
- [ ] manifest.json configured with app icons (192x192, 512x512)
- [ ] iOS-specific meta tags for Add to Home Screen
- [ ] Offline fallback page configured
- [ ] Audio files cached for offline playback

### Rollback Plan
- **Vercel Instant Rollback:** One-click rollback to previous deployment
- **Database Migrations:** Use Drizzle migration rollback for schema changes
- **Audio Files:** Supabase Storage retains files; versioning not required

## Risk Assessment

### Technical Risks
- **Risk 1:** Audio playback issues on iOS Safari (autoplay restrictions)
  - *Mitigation:* Require user interaction before first audio play; cache audio after first interaction; thorough iOS testing

- **Risk 2:** TTS API costs escalate with usage
  - *Mitigation:* Cache generated audio permanently in Supabase Storage; implement rate limiting; monitor costs per user

- **Risk 3:** LLM sentence generation latency
  - *Mitigation:* Batch pre-generation; 7-day lookahead; trigger on foreground/capture/reconnect

- **Risk 4:** Word combination exhaustion (running out of unique combinations)
  - *Mitigation:* Algorithm generates fresh combinations as new words added; allow sentence text variation even with same word combo after 30 days

- **Risk 5:** Service Worker caching issues causing stale content
  - *Mitigation:* Implement cache versioning; proper cache invalidation; user-facing "Refresh" option

- **Risk 6:** Supabase free tier limits
  - *Mitigation:* Monitor usage; upgrade to Pro ($25/month) when approaching limits; free tier generous for MVP (500MB database, 1GB storage)

### Feature Risks
- **Risk 1:** Dynamic sentence quality varies
  - *Mitigation:* Validate sentences contain target words; max 10 words; prompt engineering for natural sentences

- **Risk 2:** Category auto-assignment accuracy
  - *Mitigation:* Allow user to edit category; improve prompt based on feedback; add confidence threshold

## Success Metrics

### Feature Adoption
- Words captured per user per week (target: ≥10)
- Session completion rate (target: ≥80%)
- Review sessions per week per active user

### Technical Metrics
- Word capture latency <2s
- Sentence generation latency <3s (with pre-caching)
- Audio playback start <1s
- Error rate <5%

### Learning Outcomes
- 7-day word retention rate (target: ≥85%)
- Words reaching 'ready_to_use' status per user per month
- Average sessions to mastery (expect ~3-4)

### User Satisfaction
- 30-day user retention (target: ≥40%)
- NPS score from in-app feedback
- Qualitative feedback on sentence quality and variety

---

**Implementation Principles:**
1. **Supabase-First:** Leverage Supabase ecosystem (auth, storage, realtime) before adding vendors
2. **Incremental Delivery:** Build and test features incrementally
3. **Algorithm-Driven:** Core value comes from word-matching + FSRS algorithms
4. **Quality Bar:** Each feature should meet acceptance criteria before moving on
5. **Adaptability:** Be ready to adjust based on user feedback and technical discoveries