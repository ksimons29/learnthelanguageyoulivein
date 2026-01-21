# E2E Test: Memory Context Persistence

**Feature:** Personal Memory Journal - Memory Context attached to captured words
**Priority:** P1
**Last Updated:** 2026-01-21

---

## Prerequisites

- Test account: `test-en-pt@llyli.test` / `TestPassword123!`
- Playwright MCP available
- Production URL: https://llyli.vercel.app

---

## Test Case 1: Capture with Full Memory Context

### Steps

1. `browser_navigate` to https://llyli.vercel.app/auth/sign-in
2. Sign in with test account
3. `browser_navigate` to https://llyli.vercel.app/capture
4. `browser_snapshot` - verify capture page loads
5. Enter phrase: "padaria" (bakery in Portuguese)
6. Tap "Add memory context" accordion to expand
7. Fill location: "at the bakery on Rua Augusta"
8. Select 2 situation tags: "Nervous" and "Alone"
9. Add personal note: "My first time ordering bread!"
10. `browser_snapshot` - verify all fields filled
11. Tap "Add Phrase" button
12. `browser_wait_for` toast "Phrase captured successfully!"
13. `browser_snapshot` - verify success state

### Expected

- Capture completes within 3 seconds
- Toast shows success message
- Input clears for next capture

### Verification SQL

```sql
SELECT original_text, translation, location_hint, time_of_day, situation_tags, personal_note
FROM words
WHERE user_id = (SELECT user_id FROM user_profiles WHERE email = 'test-en-pt@llyli.test')
  AND original_text = 'padaria'
ORDER BY created_at DESC
LIMIT 1;
```

**Assert:**
- `location_hint` = "at the bakery on Rua Augusta"
- `time_of_day` IN ('morning', 'afternoon', 'evening', 'night')
- `situation_tags` contains 'nervous' AND 'alone'
- `personal_note` = "My first time ordering bread!"

---

## Test Case 2: Memory Context Displays in Notebook Word Detail

### Steps

1. Continue from Test Case 1 (or sign in fresh)
2. `browser_navigate` to https://llyli.vercel.app/notebook
3. `browser_snapshot` - verify notebook loads
4. Search for "padaria" using the search input
5. `browser_snapshot` - verify word appears in search results
6. Tap the word card to open Word Detail sheet
7. `browser_snapshot` - **CRITICAL: Capture full detail view**

### Expected - Word Detail Sheet Must Show

| Element | Expected Content |
|---------|------------------|
| Word | "padaria" |
| Translation | "bakery" (or similar) |
| Category badge | Appears with icon |
| Mastery badge | "Learning" or similar |
| Audio button | Present and tappable |
| **Memory Section** | **MUST BE VISIBLE** |
| Location + time | "at the bakery on Rua Augusta · afternoon" |
| Situation tags | Pills showing "Nervous", "Alone" |
| Personal note | "My first time ordering bread!" in italic |

### Assertions

```typescript
// All must be true:
expect(wordDetailSheet).toBeVisible();
expect(memorySection).toBeVisible();
expect(locationHint).toContain("bakery on Rua Augusta");
expect(situationTags).toContain("Nervous");
expect(situationTags).toContain("Alone");
expect(personalNote).toContain("first time ordering bread");
```

---

## Test Case 3: Capture WITHOUT Memory Context (Fast Path)

### Steps

1. `browser_navigate` to https://llyli.vercel.app/capture
2. Enter phrase: "obrigado"
3. **DO NOT expand memory context accordion**
4. Tap "Add Phrase" button
5. `browser_wait_for` toast
6. `browser_navigate` to https://llyli.vercel.app/notebook
7. Find "obrigado" and open detail sheet
8. `browser_snapshot`

### Expected

- Capture succeeds quickly (< 2 seconds)
- Word Detail does NOT show Memory Section (no context to display)
- All other fields (translation, audio, category) present

### Verification SQL

```sql
SELECT location_hint, time_of_day, situation_tags, personal_note
FROM words
WHERE user_id = (SELECT user_id FROM user_profiles WHERE email = 'test-en-pt@llyli.test')
  AND original_text = 'obrigado'
ORDER BY created_at DESC
LIMIT 1;
```

**Assert:** All memory fields are NULL

---

## Test Case 4: Memory Context in Review (Post-Answer Hint)

### Steps

1. Ensure test user has word with memory context that is due for review
2. Force word due if needed:
   ```sql
   UPDATE words SET next_review_date = NOW() - INTERVAL '1 day'
   WHERE original_text = 'padaria' AND user_id = 'YOUR-USER-ID';
   ```
3. `browser_navigate` to https://llyli.vercel.app/review
4. Complete review for the word with memory context
5. After answering, before rating, check for memory hint
6. `browser_snapshot`

### Expected

- After reveal, memory hint appears below answer
- Shows: "Remember: at the bakery on Rua Augusta · afternoon · Nervous, Alone"
- Styled with MapPin icon and teal left border

---

## Test Case 5: Situation Tags Limit (Max 3)

### Steps

1. `browser_navigate` to https://llyli.vercel.app/capture
2. Enter any phrase
3. Expand memory context accordion
4. Try to select MORE than 3 situation tags
5. `browser_snapshot`

### Expected

- Only 3 tags can be selected at once
- 4th tap does nothing OR deselects another tag
- Visual feedback shows selection limit

---

## Regression Checklist

After ANY change to these files, re-run ALL tests above:

- `app/capture/**`
- `components/notebook/word-detail-sheet.tsx`
- `lib/config/memory-context.ts`
- `app/review/**` (if memory hint shown)

---

## Pass/Fail Criteria

| Test | Result | Date | Notes |
|------|--------|------|-------|
| TC1: Capture with context | | | |
| TC2: Display in Word Detail | | | |
| TC3: Capture without context | | | |
| TC4: Memory hint in review | | | |
| TC5: Tag limit | | | |

**All 5 tests must PASS before Memory Context feature is considered working.**
