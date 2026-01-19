# LLYLI Testing Guide

This document describes how to test the LLYLI application to ensure it works correctly.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Unit Tests](#unit-tests)
3. [Manual QA Testing](#manual-qa-testing)
4. [Database Validation](#database-validation)
5. [API Testing](#api-testing)
6. [Troubleshooting](#troubleshooting)

---

## Quick Start

```bash
# Run unit tests
cd web && npm test

# Run tests once (CI mode)
npm run test:run

# Run with coverage
npm run test:coverage

# Start dev server for manual testing
npm run dev
# Then open http://localhost:3000
```

---

## Unit Tests

### Test Files Location

```
web/src/__tests__/
├── setup.tsx                          # Test setup (jsdom, React Testing Library)
└── lib/
    ├── categories.test.ts             # Category configuration tests
    ├── categories-cognitive.test.ts   # Miller's Law compliance tests
    ├── distractors.test.ts            # Multiple choice distractor tests
    └── exercise-type.test.ts          # Exercise type selection tests
```

### Running Tests

```bash
cd web

# Watch mode (re-runs on file changes)
npm test

# Single run
npm run test:run

# With coverage report
npm run test:coverage
```

### Test Coverage Areas

| Area | Tests | Purpose |
|------|-------|---------|
| Categories | 26 | Category config, migration, normalization |
| Cognitive Load | 17 | Miller's Law (7±2 categories) |
| Distractors | 8 | Multiple choice option generation |
| Exercise Types | 14 | Mastery-based exercise selection |

### Writing New Tests

```typescript
// web/src/__tests__/lib/example.test.ts
import { describe, it, expect } from 'vitest';
import { myFunction } from '@/lib/example';

describe('myFunction', () => {
  it('should return expected result', () => {
    expect(myFunction('input')).toBe('expected');
  });
});
```

---

## Manual QA Testing

### Prerequisites

1. Dev server running: `cd web && npm run dev`
2. Test account logged in
3. Database has words (import from Anki or capture manually)

### Test Accounts

| Account | Email | User ID | Notes |
|---------|-------|---------|-------|
| Primary | koossimons91@gmail.com | `0146698d-0d6a-49f9-924f-ebe50c154511` | Main account with 900+ words |
| Claude Test | claudetest20260119@gmail.com | `c3f710bd-676a-439a-bd94-e32584183254` | Password: `testpass123` - Fresh account |

---

### Test Case 1: Authentication Flow

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1.1 | Go to `/auth/sign-in` | Sign in page loads with LLYLI logo |
| 1.2 | Enter invalid email | Error message shown |
| 1.3 | Enter valid credentials | Redirect to home page |
| 1.4 | Click sign out | Redirect to sign-in page |
| 1.5 | Go to protected route when signed out | Redirect to sign-in |

---

### Test Case 2: Word Capture

| Step | Action | Expected Result |
|------|--------|-----------------|
| 2.1 | Go to `/capture` | Capture page loads |
| 2.2 | Enter Portuguese word (e.g., "obrigado") | - |
| 2.3 | Click "Add Word" | Loading state shown |
| 2.4 | Wait for completion | ✅ Translation appears |
| 2.5 | - | ✅ Category assigned |
| 2.6 | - | ✅ Audio button appears |
| 2.7 | Click audio button | Audio plays |
| 2.8 | Check database (Query 2.6) | Word saved with all fields |

---

### Test Case 3: Review Session - Fill in the Blank

| Step | Action | Expected Result |
|------|--------|-----------------|
| 3.1 | Go to `/review` | Review page loads |
| 3.2 | Find fill_blank exercise | One word shows as `_____` |
| 3.3 | Type correct answer | ✅ Green border |
| 3.4 | - | ✅ "Correct!" feedback |
| 3.5 | Type wrong answer | ✅ Red border |
| 3.6 | - | ✅ "Not quite. The answer was: X" |
| 3.7 | Click "Rate Your Recall" | Grading buttons appear |
| 3.8 | After wrong answer | "Hard" button pre-highlighted |

---

### Test Case 4: Review Session - Multiple Choice

| Step | Action | Expected Result |
|------|--------|-----------------|
| 4.1 | Find multiple_choice exercise | 4 option buttons shown |
| 4.2 | Options show translations | Not original text |
| 4.3 | Select correct option | ✅ Green highlight |
| 4.4 | Select wrong option | ✅ Red highlight |
| 4.5 | - | ✅ Correct answer shown in green |
| 4.6 | After selection | All buttons disabled |

---

### Test Case 5: Review Session - Type Translation

| Step | Action | Expected Result |
|------|--------|-----------------|
| 5.1 | Find type_translation exercise | "Recall the meaning:" prompt |
| 5.2 | Click "Reveal" | Translations shown below |
| 5.3 | Grade recall | FSRS values updated |

---

### Test Case 6: FSRS Algorithm

| Step | Action | Expected Result |
|------|--------|-----------------|
| 6.1 | Complete a review | - |
| 6.2 | Run Query 3.1 | FSRS params updated |
| 6.3 | Rate "Again" on a word | `lapse_count` increments |
| 6.4 | Rate "Good" 3 sessions | `mastery_status` → 'ready_to_use' |
| 6.5 | Check `next_review_date` | Future date based on stability |

---

### Test Case 7: Notebook / Vocabulary

| Step | Action | Expected Result |
|------|--------|-----------------|
| 7.1 | Go to `/notebook` | Category grid loads |
| 7.2 | Each category shows | Word count and due count |
| 7.3 | Click a category | Word list loads |
| 7.4 | Click a word | Detail sheet opens |
| 7.5 | Play audio | Audio plays |
| 7.6 | Delete word | Word removed, list updates |

---

### Test Case 8: Onboarding Flow

| Step | Action | Expected Result |
|------|--------|-----------------|
| 8.1 | New user signs up | Redirect to `/onboarding` |
| 8.2 | Select target language | Proceed to native language |
| 8.3 | Select native language | Proceed to word capture |
| 8.4 | Add 3+ words | "Continue" button enabled |
| 8.5 | Complete onboarding | Celebration page with sentence |
| 8.6 | Check `user_profiles` | `onboarding_completed = true` |

---

### Test Case 9: Offline Mode (PWA)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 9.1 | Build and serve: `npm run build && npm start` | - |
| 9.2 | DevTools → Network → Offline | - |
| 9.3 | Refresh page | Offline page or cached content |
| 9.4 | Start a review | Works with cached data |
| 9.5 | Complete review | Queued in IndexedDB |
| 9.6 | Go back online | Reviews sync automatically |
| 9.7 | Check "Back online! Syncing..." banner | Shows briefly |

---

### Test Case 10: Progress Dashboard

| Step | Action | Expected Result |
|------|--------|-----------------|
| 10.1 | Go to `/progress` | Dashboard loads |
| 10.2 | Check "Words Due" card | Matches Query 2.4 count |
| 10.3 | Check mastery breakdown | Matches Query 2.3 |
| 10.4 | Check streak display | Current streak shown |

---

## Database Validation

### How to Run Queries

1. Go to **https://supabase.com/dashboard**
2. Select your **LLYLI project**
3. Click **SQL Editor** in left sidebar
4. Copy query from below → Click **Run**

Full query file: [`/scripts/database-queries.sql`](/scripts/database-queries.sql)

---

### Essential Queries

#### Query 1.1: Health Check (Run First!)

```sql
SELECT
  'words' as table_name, COUNT(*) as row_count FROM words
UNION ALL
SELECT 'user_profiles', COUNT(*) FROM user_profiles
UNION ALL
SELECT 'review_sessions', COUNT(*) FROM review_sessions
UNION ALL
SELECT 'generated_sentences', COUNT(*) FROM generated_sentences;
```

**Expected**: Non-zero counts for words and user_profiles.

---

#### Query 2.3: Mastery Distribution

```sql
SELECT
  mastery_status,
  COUNT(*) as count,
  ROUND(AVG(review_count), 1) as avg_reviews,
  ROUND(AVG(consecutive_correct_sessions), 1) as avg_correct_sessions
FROM words
GROUP BY mastery_status;
```

**Expected**: Most words in 'learning', some in 'learned', few in 'ready_to_use'.

---

#### Query 2.4: Words Due for Review

```sql
SELECT
  original_text,
  translation,
  category,
  next_review_date
FROM words
WHERE next_review_date <= NOW()
ORDER BY next_review_date ASC
LIMIT 20;
```

**Expected**: Should match what the app shows in review queue.

---

#### Query 3.1: FSRS Health Check

```sql
SELECT
  mastery_status,
  COUNT(*) as count,
  ROUND(AVG(difficulty)::numeric, 2) as avg_difficulty,
  ROUND(AVG(stability)::numeric, 2) as avg_stability,
  ROUND(AVG(retrievability)::numeric, 2) as avg_retrievability
FROM words
GROUP BY mastery_status;
```

**Expected**:
- `difficulty`: 3-7 range (5 is default)
- `stability`: Increases with mastery
- `retrievability`: 0.0-1.0 range

---

#### Query 6.1-6.4: Data Integrity (All Should Return 0)

```sql
-- Orphaned words
SELECT COUNT(*) FROM words w
LEFT JOIN user_profiles up ON w.user_id = up.user_id
WHERE up.id IS NULL;

-- Orphaned sessions
SELECT COUNT(*) FROM review_sessions rs
LEFT JOIN user_profiles up ON rs.user_id = up.user_id
WHERE up.id IS NULL;

-- Invalid mastery state
SELECT COUNT(*) FROM words
WHERE (mastery_status = 'ready_to_use' AND consecutive_correct_sessions < 3);

-- Duplicate words
SELECT COUNT(*) FROM (
  SELECT user_id, original_text
  FROM words
  GROUP BY user_id, original_text
  HAVING COUNT(*) > 1
) duplicates;
```

**Expected**: All queries return 0.

---

## API Testing

### Test Sentence Generation

```bash
curl -X POST http://localhost:3000/api/dev/test-sentences \
  -H "Content-Type: application/json" \
  -d '{"userId": "YOUR-USER-ID", "maxSentences": 5}'
```

### Test Distractor Fetching

```bash
curl "http://localhost:3000/api/words?category=food_dining&limit=3&excludeId=WORD-ID"
```

### Test Word Capture

```bash
curl -X POST http://localhost:3000/api/words \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR-AUTH-COOKIE" \
  -d '{"text": "obrigado"}'
```

---

## Troubleshooting

### Tests Failing

```bash
# Clear cache and reinstall
rm -rf node_modules/.vitest
npm test
```

### Database Connection Issues

```bash
# Check DATABASE_URL is set
echo $DATABASE_URL

# Or in .env.local
cat .env.local | grep DATABASE
```

### Review Not Showing Words

1. Run Query 2.4 - are there words due?
2. Check `next_review_date` is in the past
3. Reset for testing:

```sql
UPDATE words
SET next_review_date = NOW() - INTERVAL '1 day'
WHERE user_id = 'YOUR-USER-ID';
```

### Audio Not Playing

1. Check `audio_url` is populated (Query 2.5)
2. Check Supabase Storage bucket is public
3. Check browser console for CORS errors

### FSRS Not Updating

1. Verify review is being submitted (Network tab)
2. Check API response for errors
3. Run Query 3.1 before and after review

---

## Continuous Integration

Future: Add GitHub Actions workflow for automated testing.

```yaml
# .github/workflows/test.yml (example)
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: cd web && npm ci
      - run: cd web && npm run test:run
```

---

## QA Test Reports

Automated QA test reports from Playwright browser testing:

| Date | Report | Issues Found | Status |
|------|--------|--------------|--------|
| 2026-01-19 | [QA_REPORT_20260119](/docs/qa/QA_REPORT_20260119.md) | 7 bugs (#24-#30) | Critical bugs fixed |

---

## Related Documentation

- [Session Workflow](/docs/engineering/session-workflow.md) - Development workflow
- [Implementation Plan](/docs/engineering/implementation_plan.md) - Architecture details
- [Database Queries](/scripts/database-queries.sql) - Full query reference
- [QA Reports](/docs/qa/) - Automated test reports
