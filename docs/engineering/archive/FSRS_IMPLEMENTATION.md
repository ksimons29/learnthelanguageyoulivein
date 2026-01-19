# FSRS Algorithm Implementation Guide

**Document Purpose:** Standalone reference for implementing FSRS (Free Spaced Repetition Scheduler) in LLYI

**Last Updated:** 2026-01-15

**Commit Reference:** 349cd0e - "Add FSRS algorithm theory and implementation details"

---

## Overview

FSRS (Free Spaced Repetition Scheduler) uses the **DSR model** to predict optimal review timing for vocabulary retention. This document provides the complete theory, formulas, and implementation code for integrating FSRS-4.5 into the LLYI web application.

---

## Core Parameters (DSR Model)

| Parameter | Symbol | Description | Initial Value |
|-----------|--------|-------------|---------------|
| **Difficulty** | D | How hard it is to increase memory stability (0-10) | 5.0 |
| **Stability** | S | Days until retrievability drops to 90% | 1.0 |
| **Retrievability** | R | Probability of successful recall (0-1) | 1.0 |

---

## The Forgetting Curve

FSRS models memory decay using a power law:

```
R(t) = (1 + t/(9·S))^(-1)

Where:
  R = retrievability (probability of recall)
  t = days since last review
  S = stability (memory strength in days)
```

### Example Memory Decay (S=10 days)

```
Day 0:  R = 100%  ████████████████████
Day 5:  R = 95%   ███████████████████
Day 10: R = 90%   ██████████████████   ← Target threshold
Day 15: R = 86%   █████████████████
Day 20: R = 82%   ████████████████
Day 30: R = 75%   ███████████████
```

---

## Optimal Interval Calculation

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

---

## Rating Scale (4-Point System)

```typescript
enum Rating {
  Again = 1,  // Complete blackout, wrong answer
  Hard = 2,   // Correct but very difficult
  Good = 3,   // Correct with normal effort
  Easy = 4    // Trivially easy
}
```

---

## How Ratings Affect Stability

| Rating | Effect on Stability | Next Interval Example (S=10) |
|--------|--------------------|-----------------------------|
| **Again (1)** | S decreases significantly | ~1 day (relearn) |
| **Hard (2)** | S increases slightly | ~8 days |
| **Good (3)** | S increases normally | ~25 days |
| **Easy (4)** | S increases significantly | ~60 days |

---

## Database Schema (FSRS Fields)

Add these fields to your `Word` entity:

```typescript
// FSRS Core Parameters
difficulty: real('difficulty').default(5.0).notNull(),
stability: real('stability').default(1.0).notNull(),
retrievability: real('retrievability').default(1.0).notNull(),
nextReviewDate: timestamp('next_review_date').notNull(),
lastReviewDate: timestamp('last_review_date'),
reviewCount: integer('review_count').default(0).notNull(),
lapseCount: integer('lapse_count').default(0).notNull(),

// Mastery Tracking
consecutiveCorrectSessions: integer('consecutive_correct_sessions').default(0).notNull(),
lastCorrectSessionId: uuid('last_correct_session_id'),
masteryStatus: text('mastery_status').default('learning').notNull(),
```

---

## Core Implementation Functions

### 1. Calculate Current Retrievability

```typescript
function calculateRetrievability(stability: number, daysSinceReview: number): number {
  if (daysSinceReview <= 0) return 1.0
  return Math.pow(1 + daysSinceReview / (9 * stability), -1)
}
```

### 2. Check if Word is Due

```typescript
function isDue(word: Word, threshold: number = 0.9): boolean {
  const daysSince = daysBetween(word.lastReviewDate, new Date())
  const currentR = calculateRetrievability(word.stability, daysSince)
  return currentR < threshold
}
```

### 3. Get All Due Words

```typescript
async function getDueWords(userId: string): Promise<Word[]> {
  const words = await db.word.findMany({ where: { userId } })
  return words.filter(w => isDue(w, 0.9))
}
```

---

## Complete Review Processing Function

```typescript
import { createEmptyCard, fsrs, generatorParameters, Rating, State } from 'ts-fsrs'

// FSRS-4.5 default parameters (can be personalized later)
const params = generatorParameters()
const f = fsrs(params)

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
    lapseCount: rating === Rating.Again ? word.lapseCount + 1 : word.lapseCount,
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

---

## Complete Review Flow Diagram

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

---

## Why Use ts-fsrs Library?

We use the `ts-fsrs` library rather than implementing FSRS from scratch because:

1. **Proven accuracy**: FSRS-4.5 is the result of extensive ML research and testing
2. **Maintained**: Active development and bug fixes by the FSRS team
3. **Parameter optimization**: Future ability to personalize parameters per user
4. **Edge cases handled**: Leap years, timezone issues, numeric precision, stability bounds

---

## Installation & Setup

```bash
npm install ts-fsrs
```

### Basic Usage Example

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

---

## Session Management (2-Hour Rule)

A **review session** is defined as:
- A new session starts when **>2 hours** since last review activity
- OR when user explicitly starts a new session from home screen
- Session boundaries are critical for the "3 correct recalls on separate sessions" mastery requirement
- Each review action records `sessionId` for audit trail

```typescript
// In your review API endpoint
const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)

if (!lastSession || lastSession.startedAt < twoHoursAgo) {
  // Create new session
  sessionId = await createNewSession(userId)
} else {
  sessionId = lastSession.id
}
```

---

## Mastery Tracking (3 Correct Recalls Rule)

**Rule:** A word reaches "ready to use" status after 3 correct recalls across 3 **different** sessions.

**Implementation:**
- Track `consecutiveCorrectSessions` counter
- Only increment if `sessionId` is different from `lastCorrectSessionId`
- Reset to 0 on any wrong answer (Rating = Again or Hard with incorrect response)
- Update `masteryStatus` to `'ready_to_use'` when counter reaches 3

---

## Key Differences from SM-2 (Anki's Algorithm)

| Feature | SM-2 (Anki) | FSRS-4.5 (LLYI) |
|---------|-------------|-----------------|
| Parameters | Easiness Factor (EF) + Interval | Difficulty, Stability, Retrievability |
| Memory Model | Linear interval multiplication | Power law forgetting curve |
| Accuracy | Good for averages | ML-optimized, personalized |
| Retrievability | Not calculated | Precise R(t) calculation |
| Research Basis | 1987 algorithm | 2023 ML research |

---

## API Endpoints

### Get Due Words

```typescript
GET /api/reviews/due?limit=20

Response:
{
  data: {
    words: Word[],
    sessionId: string
  }
}
```

### Submit Review

```typescript
POST /api/reviews/complete

Body:
{
  wordId: string,
  rating: 1 | 2 | 3 | 4,
  sessionId: string
}

Response:
{
  data: {
    word: Word,
    nextReviewDate: string
  }
}
```

---

## Testing Checklist

- [ ] Install ts-fsrs library
- [ ] Add FSRS fields to Word entity schema
- [ ] Implement `processReview()` function
- [ ] Test rating 1 (Again) → S decreases, mastery resets
- [ ] Test rating 3 (Good) → S increases normally
- [ ] Test rating 4 (Easy) → S increases significantly
- [ ] Test 3 correct sessions → masteryStatus = 'ready_to_use'
- [ ] Test 2-hour session boundary creates new session
- [ ] Verify retrievability calculation matches forgetting curve
- [ ] Test lapseCount increments on "Again" rating

---

## References

- **FSRS Research Paper:** [https://github.com/open-spaced-repetition/fsrs4anki](https://github.com/open-spaced-repetition/fsrs4anki)
- **ts-fsrs Library:** [https://github.com/open-spaced-repetition/ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs)
- **Implementation Plan:** `/docs/engineering/implementation_plan.md` (lines 371-582)

---

**Created by:** LLYI Engineering Team
**For questions:** Reference full implementation plan or FSRS research documentation
