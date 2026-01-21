# Feature Request: Example Sentences in Word Detail

**Status:** IMPLEMENTED
**Priority:** P2 Enhancement
**Created:** 2026-01-21
**Implemented:** 2026-01-21
**Owner:** Claude Code (Session 61)

---

## Problem Statement

When a user opens a word in Notebook → Word Details, they can see:
- Translation
- Audio playback
- Category
- Mastery progress
- Memory context (if captured)

**Missing:** Users cannot see example sentences that use this word in practice.

This prevents users from:
1. Understanding how the word is used in context
2. Reviewing past practice sentences
3. Building confidence that they've practiced the word

---

## User Story

> As a language learner, I want to see example sentences containing a word when viewing its details, so that I can understand how it's used in context and verify I've practiced it.

---

## Acceptance Criteria

### AC1: Display Generated Sentences

- [x] Word Detail sheet shows section: "Practice Sentences"
- [x] Lists up to 3 most recent sentences that include this word
- [x] Each sentence shows:
  - Full sentence text (target language)
  - Translation (native language)
  - Date used in practice
- [x] If no sentences exist, section is hidden (cleaner UX than showing "none")

### AC2: Visual Design

- [x] Section appears below Memory Context (if present) or below Statistics
- [x] Styled consistently with Moleskine design system
- [x] Sentences have subtle left border (teal)
- [x] Translation shown in muted text below sentence

### AC3: Data Requirements

- [x] Query `generated_sentences` table where `word_ids` contains current word ID
- [x] Only show sentences that were actually used (`used_at IS NOT NULL`)
- [x] Order by `used_at DESC` (most recent first)
- [x] Limit to 3 sentences to avoid overwhelming the detail view

---

## Technical Implementation

### Data Model

Current `generated_sentences` schema:
```typescript
{
  id: uuid,
  userId: uuid,
  text: string,          // Sentence in target language
  translation: string,   // Sentence in native language
  wordIds: uuid[],       // Array of word IDs in this sentence
  usedAt: timestamp,     // When sentence was shown in review
}
```

### Query

```sql
SELECT gs.text, gs.translation, gs.used_at
FROM generated_sentences gs
WHERE gs.user_id = :userId
  AND :wordId = ANY(gs.word_ids)
  AND gs.used_at IS NOT NULL
ORDER BY gs.used_at DESC
LIMIT 3;
```

### Component Changes

1. **`word-detail-sheet.tsx`**: Add `SentenceHistory` section
2. **New component**: `components/notebook/sentence-history.tsx`
3. **API route** (optional): `/api/words/[id]/sentences` or fetch client-side

### Mock-up

```
┌─────────────────────────────────────┐
│ padaria                             │
│ bakery                              │
├─────────────────────────────────────┤
│ [▶ Play Audio]                      │
├─────────────────────────────────────┤
│ Statistics                          │
│ Reviews: 5  |  Correct: 3  |  Due   │
├─────────────────────────────────────┤
│ Memory Context                      │
│ at the bakery · afternoon           │
│ Nervous, Alone                      │
│ "My first time ordering bread!"     │
├─────────────────────────────────────┤
│ ✨ Practice Sentences               │  ← NEW SECTION
│                                     │
│ │ "Preciso ir à padaria comprar    │
│ │  pão fresco."                    │
│ │ I need to go to the bakery to    │
│ │ buy fresh bread.                 │
│ │                       Jan 15     │
│                                     │
│ │ "A padaria abre às sete da       │
│ │  manhã."                         │
│ │ The bakery opens at seven in     │
│ │ the morning.                     │
│ │                       Jan 12     │
├─────────────────────────────────────┤
│ Added January 10, 2026              │
├─────────────────────────────────────┤
│ [Delete Phrase]                     │
└─────────────────────────────────────┘
```

---

## E2E Test (To Be Run After Implementation)

```
## Test Case: Sentence Display in Word Detail

### Prerequisites
- Word "padaria" exists for test user
- At least 1 generated sentence exists containing "padaria"
- Sentence has been used (used_at IS NOT NULL)

### Steps
1. browser_navigate to /notebook
2. Search for "padaria"
3. Open word detail sheet
4. browser_snapshot

### Expected
- "Practice Sentences" section visible
- At least 1 sentence containing "padaria" shown
- Sentence has translation below it
- Date shown for when sentence was practiced

### Verification SQL
SELECT text, translation, used_at
FROM generated_sentences
WHERE word_ids @> ARRAY[(SELECT id FROM words WHERE original_text = 'padaria' LIMIT 1)]
  AND used_at IS NOT NULL
ORDER BY used_at DESC
LIMIT 3;

Assert: At least 1 row returned AND displayed in UI
```

---

## Implementation Checklist

- [ ] Design approved
- [ ] API endpoint created (if needed)
- [ ] `SentenceHistory` component created
- [ ] Integrated into `word-detail-sheet.tsx`
- [ ] Unit tests added
- [ ] E2E test passed
- [ ] Deployed to production
- [ ] Verified with real data

---

## Out of Scope

- Generating new sentences from word detail (use Review for that)
- Editing existing sentences
- Deleting sentences
- Audio playback for sentences (possible future enhancement)

---

## Related Files

- `web/src/components/notebook/word-detail-sheet.tsx`
- `web/src/lib/db/schema/sentences.ts`
- `docs/engineering/e2e-tests/memory-context.md`
