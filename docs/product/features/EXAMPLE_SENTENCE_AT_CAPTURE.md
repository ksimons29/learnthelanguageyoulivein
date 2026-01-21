# Feature: Example Sentence at Capture Time

**Status:** NOT STARTED
**Priority:** P2 - Enhancement
**Created:** 2026-01-21
**Owner:** TBD

---

## Problem Statement

When a user captures a word, they only see the word and its translation. They don't see how the word is used in context until they've completed a review session.

**Current flow:**
1. User captures "supermercado"
2. Word card shows: `supermercado → supermarket`
3. No example sentence until word is used in review

**Desired flow:**
1. User captures "supermercado"
2. Word card shows:
   - Word: `supermercado`
   - Translation: `supermarket`
   - Example: `Vou ao supermercado comprar leite.`
   - Example translation: `I'm going to the supermarket to buy milk.`

---

## User Story

> As a language learner, I want to see an example sentence when I capture a word, so that I immediately understand how it's used in context.

---

## Requirements

### Word Card Display (Notebook)

Each word card should show:

| Field | Description | Language |
|-------|-------------|----------|
| **Word** | The captured phrase | Target language |
| **Translation** | Direct translation | Native language |
| **Example Sentence** | A natural sentence using the word | Target language |
| **Sentence Translation** | Full translation of the example | Native language |

### Example

```
┌─────────────────────────────────────┐
│ supermercado                        │
│ supermarket                         │
│                                     │
│ "Vou ao supermercado comprar leite."│
│ I'm going to the supermarket to     │
│ buy milk.                           │
└─────────────────────────────────────┘
```

---

## Technical Implementation

### Option A: New Columns on `words` Table

Add to `words` schema:
```typescript
exampleSentence: text('example_sentence'),        // Target language
exampleSentenceTranslation: text('example_sentence_translation'), // Native language
```

**Pros:** Simple, fast queries
**Cons:** Increases table width

### Option B: Use `generated_sentences` Table

Store example as a special generated_sentence with:
- `wordIds = [wordId]` (single word)
- `usedAt = null` (not used in review yet)
- `isExample = true` (new boolean flag)

**Pros:** Reuses existing infrastructure
**Cons:** More complex queries

### Recommended: Option A

Simpler implementation, example sentence is tightly coupled to word.

---

## Implementation Steps

### 1. Schema Migration

```sql
ALTER TABLE words
ADD COLUMN example_sentence TEXT,
ADD COLUMN example_sentence_translation TEXT;
```

### 2. Update Word Capture API (`/api/words/route.ts`)

After translation, generate example sentence:

```typescript
// Generate example sentence using GPT-4o-mini
const exampleResult = await generateExampleSentence({
  word: text,
  targetLanguage,
  nativeLanguage,
});

// Store with word
await db.insert(words).values({
  ...wordData,
  exampleSentence: exampleResult.sentence,
  exampleSentenceTranslation: exampleResult.translation,
});
```

### 3. Update Starter Words API (`/api/onboarding/starter-words/route.ts`)

Generate example sentences for each starter word during injection.

### 4. Update Word Card Components

- `word-detail-sheet.tsx` - Show example in detail view
- `word-card.tsx` (if exists) - Show example in list view

### 5. Backfill Existing Words (Optional)

Script to generate example sentences for words that don't have them.

---

## Prompt for Example Sentence Generation

```
Generate a simple, natural sentence (max 10 words) using the word "${word}" in ${targetLanguage}.
The sentence should:
- Be something a learner might actually say or hear
- Use common vocabulary alongside the target word
- Be appropriate for everyday conversation

Return JSON:
{
  "sentence": "...",
  "translation": "..." // in ${nativeLanguage}
}
```

---

## Performance Considerations

- Example sentence generation adds ~1-2 seconds to capture flow
- Consider generating async (fire-and-forget) like TTS audio
- Cache common examples to reduce API calls

---

## Dependencies

- GPT-4o-mini API for sentence generation
- Schema migration for new columns

---

## Acceptance Criteria

- [ ] New words show example sentence in word detail
- [ ] Starter words have pre-generated example sentences
- [ ] Example sentence is in target language
- [ ] Translation is in native language
- [ ] Sentences are max 10 words (cognitive load limit)
- [ ] Generation doesn't block capture (async acceptable)

---

## Out of Scope (v1)

- Audio for example sentences
- Multiple example sentences per word
- User-editable examples
- Regenerate example button

---

## Related

- `SENTENCE_DISPLAY_WORD_DETAIL.md` - Shows practice sentences (post-review)
- `MEMORY_CONTEXT.md` - Context capture feature
- Product spec Section 2.1 - Sentence Review System
