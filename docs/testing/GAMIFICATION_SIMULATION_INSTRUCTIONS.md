# Gamification Simulation Test Instructions

## Status: ✅ COMPLETE (Session 73)

**Script Created:** `web/scripts/test-gamification-simulation.ts`
**Run:** `npx tsx scripts/test-gamification-simulation.ts`
**Results:** 30/30 tests pass

---

## Purpose
Create a database simulation script to verify gamification features (streaks, daily progress, bingo) without waiting real days. This follows the same pattern as `test-fsrs-simulation.ts`.

## Problem Statement
7 gamification tests are blocked because they require:
- Fresh users with no history
- Time passage (24-48+ hours)
- Specific state conditions (streak breaks, bingo lines)

## Solution: Time Manipulation via Backdated Records

### Script to Create: `web/scripts/test-gamification-simulation.ts`

### Tests to Implement (18 total from Part 2)

#### 2.1 Daily Progress (4 tests)
| Test | Simulation Approach |
|------|---------------------|
| Initial state (0/10) | Create user with NO daily_progress record for today |
| Increment (+1) | Insert record with `completed_reviews: 0`, then update to 1 |
| Goal complete (10/10) | Insert record with `completed_reviews: 10`, verify `completed_at` set |
| Persistence | Insert record, query back, verify values match |

#### 2.2 Streak System (4 tests)
| Test | Simulation Approach |
|------|---------------------|
| New streak | Insert daily_progress for today with goal complete → streak = 1 |
| Streak increment | Insert records for yesterday AND today (both complete) → streak = 2 |
| Streak break | Insert record for 2 days ago (complete), skip yesterday, add today → streak = 1 (reset) |
| Streak freeze | Insert streak_state with `freeze_available: true`, skip a day, verify streak preserved |

#### 2.3 Daily Bingo (9 tests)
| Test | Simulation Approach |
|------|---------------------|
| Initial state (0/9) | Create bingo_state with empty `squares_completed` array |
| review5 | Insert with `squares_completed: ['review5']` |
| streak3 | Insert with `squares_completed: ['streak3']` |
| fillBlank | Insert with `squares_completed: ['fillBlank']` |
| multipleChoice | Insert with `squares_completed: ['multipleChoice']` |
| addContext | Insert with `squares_completed: ['addContext']` |
| workWord | Insert with `squares_completed: ['workWord']` |
| socialWord | Insert with `squares_completed: ['socialWord']` |
| masterWord | Insert with `squares_completed: ['masterWord']` |
| finishSession | Insert with `squares_completed: ['finishSession']` |
| Bingo line | Insert 3 in a row, verify detection |

#### 2.4 Boss Round (5 tests)
| Test | Simulation Approach |
|------|---------------------|
| Availability | Set daily_progress.completed_at (goal complete) → boss round unlocks |
| Word selection | Create 5 words with high lapse_count, verify selection |
| Timer | Unit test (no DB needed) |
| Reveal/Rate | Unit test (no DB needed) |
| Personal best | Insert boss_round_results with score, beat it, verify "new best" |

### Database Tables Involved

```sql
-- Daily Progress (tracks daily reviews)
daily_progress (
  id, user_id, date, completed_reviews, target_reviews,
  completed_at, created_at, updated_at
)

-- Streak State (tracks streak count and freezes)
streak_state (
  id, user_id, current_streak, longest_streak,
  last_activity_date, freeze_available, freeze_used_date,
  created_at, updated_at
)

-- Bingo State (tracks daily bingo squares)
bingo_state (
  id, user_id, date, squares_completed, bingo_achieved,
  created_at, updated_at
)
```

### Script Structure

```typescript
/**
 * Gamification Simulation Test
 *
 * Usage: npx tsx scripts/test-gamification-simulation.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });
import postgres from 'postgres';
import { randomUUID } from 'crypto';

const db = postgres(process.env.DATABASE_URL!);
const TEST_USER_EMAIL = 'test-en-sv@llyli.test';

// Helper functions
async function getUserId(): Promise<string> { /* ... */ }
async function cleanupGamificationData(userId: string) { /* ... */ }
async function insertDailyProgress(userId: string, date: Date, reviews: number) { /* ... */ }
async function insertStreakState(userId: string, streak: number, lastDate: Date) { /* ... */ }
async function insertBingoState(userId: string, date: Date, squares: string[]) { /* ... */ }

// Test functions
async function testDailyProgress() { /* 4 tests */ }
async function testStreakSystem() { /* 4 tests */ }
async function testDailyBingo() { /* 9 tests */ }
async function testBossRound() { /* 5 tests - some unit tests */ }

// Main
async function runSimulation() {
  console.log('═══════════════════════════════════════════════════════');
  console.log(' Gamification Simulation Test');
  console.log('═══════════════════════════════════════════════════════\n');

  const userId = await getUserId();
  await cleanupGamificationData(userId);

  await testDailyProgress();
  await testStreakSystem();
  await testDailyBingo();
  await testBossRound();

  await cleanupGamificationData(userId);
  await db.end();

  // Print summary
}

runSimulation().catch(console.error);
```

### Key Date Manipulation Patterns

```typescript
// Yesterday
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

// 2 days ago
const twoDaysAgo = new Date();
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

// Format for PostgreSQL DATE column
const dateOnly = date.toISOString().split('T')[0]; // '2026-01-22'
```

### Streak Break Logic to Test

```typescript
// Scenario: Streak should reset if user misses a day
// Day 1 (2 days ago): Complete goal → streak = 1
// Day 2 (yesterday): MISSED
// Day 3 (today): Complete goal → streak should be 1 (not 2)

await insertDailyProgress(userId, twoDaysAgo, 10); // Complete
// Skip yesterday
await insertDailyProgress(userId, today, 10); // Complete

const streak = await getStreakState(userId);
assertEqual('Streak reset after miss', streak.current_streak, 1);
```

### Bingo Line Detection to Test

```typescript
// Bingo board layout (3x3):
// [review5]     [streak3]      [fillBlank]
// [multiChoice] [addContext]   [workWord]
// [socialWord]  [masterWord]   [finishSession]

// Horizontal line (row 1): review5, streak3, fillBlank
// Vertical line (col 1): review5, multiChoice, socialWord
// Diagonal: review5, addContext, finishSession

const squares = ['review5', 'streak3', 'fillBlank']; // Row 1
const hasBingo = checkBingoLine(squares);
assertEqual('Horizontal bingo detected', hasBingo, true);
```

### Verification Queries

```sql
-- Check daily progress
SELECT * FROM daily_progress
WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY date;

-- Check streak state
SELECT * FROM streak_state WHERE user_id = $1;

-- Check bingo state
SELECT * FROM bingo_state
WHERE user_id = $1 AND date = CURRENT_DATE;
```

## Implementation Checklist

- [ ] Create `web/scripts/test-gamification-simulation.ts`
- [ ] Implement cleanup function (delete all gamification data for test user)
- [ ] Implement daily progress tests (4)
- [ ] Implement streak system tests (4)
- [ ] Implement bingo tests (9)
- [ ] Implement boss round tests (5 - mix of DB and unit)
- [ ] Run and verify all 22 tests pass
- [ ] Update MVP_LAUNCH_TEST_PLAN.md with results
- [ ] Update PROJECT_LOG.md

## Success Criteria

```
═══════════════════════════════════════════════════════════
 TEST RESULTS SUMMARY
═══════════════════════════════════════════════════════════

  Total: 22
  ✅ Passed: 22
  ❌ Failed: 0

✅ Gamification simulation PASSED
```

## Related Files

- `web/scripts/test-fsrs-simulation.ts` - Reference implementation
- `web/src/lib/db/schema/gamification.ts` - Schema definitions
- `web/src/app/api/gamification/` - API endpoints to understand logic
- `docs/testing/MVP_LAUNCH_TEST_PLAN.md` - Test plan to update

---

## Next Session Instructions

### What's Done
- ✅ S2: Authentication & Onboarding (Session 68)
- ✅ S3: Word Capture & Notebook (Session 69)
- ✅ S4: Review Session & Today Dashboard (Session 70)
- ✅ S5: Gamification Simulation Tests (Session 73) - **This document**
- ✅ S6: FSRS Scientific Verification Tests (Session 72)
- ✅ S7: Multi-Language Verification (Session 71)

### What's Next
**Priority 1: UI Tests for Boss Round (E2E)**
- Timer functionality (90 second countdown)
- Reveal/Rate interaction
- Score/time display after completion

**Priority 2: Known Issues**
- C-06: Situation tags may not persist (investigate)
- C-10: Duplicate word capture not prevented

**Priority 3: MVP Readiness**
- Run full MVP checklist from MVP_AUDIT.md
- Verify all 70 feature steps pass
- Create release notes

### How to Start Next Session
```bash
/clear
```
Then read:
1. `findings.md` - Check for any new bugs
2. `MVP_AUDIT.md` - Current feature status
3. `PROJECT_LOG.md` - Session 73 summary
4. `docs/testing/MVP_LAUNCH_TEST_PLAN.md` - Test results

### Key Commands
```bash
# Run gamification simulation
cd web && npx tsx scripts/test-gamification-simulation.ts

# Run FSRS simulation
cd web && npx tsx scripts/test-fsrs-simulation.ts

# Run all unit tests
cd web && npm run test:run

# Build
cd web && npm run build
```
