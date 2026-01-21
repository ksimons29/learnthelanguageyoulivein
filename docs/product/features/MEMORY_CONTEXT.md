# Feature: Memory Context (Personal Memory Journal)

**Status:** IMPLEMENTED
**Priority:** P1 - Core Feature
**Last Updated:** 2026-01-21

---

## Overview

Memory Context allows users to attach personal context to captured phrases, leveraging the psychological principle of **encoding specificity** - memories are easier to recall when the retrieval context matches the encoding context.

When users record WHERE and WHEN they learned a phrase, they create stronger memory associations that aid long-term retention.

---

## How It Works

### Capture Flow

1. User enters a phrase on the Capture page
2. User taps "Add memory context" to expand the context accordion
3. User fills in optional fields:
   - **Location**: Free text (e.g., "at the bakery on Rua Augusta")
   - **Situation tags**: Up to 3 selectable tags
   - **Personal note**: Free text for tips or memories
4. System auto-detects **time of day** based on capture time
5. User saves phrase - all context is stored with the word

### Display Locations

| Location | What Shows | When |
|----------|------------|------|
| Word Detail Sheet (Notebook) | Full context section with location, tags, note | Always if `hasMemoryContext(word)` is true |
| Review (post-answer) | "Remember:" hint with condensed context | After answer reveal, if word has context |

---

## Technical Implementation

### Data Model (`words` table)

| Column | Type | Description |
|--------|------|-------------|
| `location_hint` | text | Free-form location description |
| `time_of_day` | text | Auto-detected: 'morning', 'afternoon', 'evening', 'night' |
| `situation_tags` | text[] | Array of tag IDs (max 3) |
| `personal_note` | text | User's personal memory or tip |

### Available Situation Tags (9 total)

| Tag ID | Label | Icon |
|--------|-------|------|
| `alone` | Alone | User |
| `loved_one` | With loved one | Heart |
| `friends` | With friends | Users |
| `work` | At work | Briefcase |
| `shopping` | Shopping | ShoppingBag |
| `dining` | Dining out | UtensilsCrossed |
| `outdoor` | Outdoor | TreePine |
| `nervous` | Nervous | Frown |
| `proud` | Proud | Trophy |

### Key Functions

- `hasMemoryContext(word)` - Returns true if any context field is non-null
- `formatMemoryContextShort(word)` - Returns condensed "location · time" format
- `getSituationTag(tagId)` - Returns tag config (label, icon) for display

### Files

| File | Purpose |
|------|---------|
| `lib/config/memory-context.ts` | Tag definitions, helper functions |
| `app/capture/page.tsx` | Capture form with context accordion |
| `components/notebook/word-detail-sheet.tsx` | Context display in word detail |
| `app/review/page.tsx` | Memory hint after answer reveal (lines 720-760) |

---

## Tag Selection Limit

**Maximum 3 tags** can be selected per phrase.

Implementation (capture/page.tsx:62-73):
```typescript
const handleTagToggle = (tagId: SituationTagId) => {
  setSelectedTags((prev) => {
    if (prev.includes(tagId)) {
      return prev.filter((id) => id !== tagId); // Deselect
    }
    if (prev.length >= 3) {
      return prev; // Ignore if already at limit
    }
    return [...prev, tagId]; // Add tag
  });
};
```

---

## Auto-Detected Time of Day

The system automatically sets `time_of_day` based on capture time:

| Hour Range | Value |
|------------|-------|
| 5:00-11:59 | morning |
| 12:00-16:59 | afternoon |
| 17:00-20:59 | evening |
| 21:00-4:59 | night |

**Note:** Even if user doesn't expand the context accordion, `time_of_day` is set automatically. This causes the Context section to appear in Word Detail even for "fast capture" flows.

---

## Gamification Integration

Memory Context does NOT currently have dedicated gamification integration. Potential future integrations:

1. **Bingo Square**: "Add context to a capture" - reward contextual learning
2. **Boss Round Boost**: Words with context could have different difficulty weighting
3. **Streak Bonus**: Consecutive days with contextual captures

See GitHub Issue #72 for improvement tracking.

---

## E2E Test Results (2026-01-21)

| Test | Result |
|------|--------|
| Capture with full context | ✅ PASS |
| Display in Word Detail | ✅ PASS |
| Capture without context | ⚠️ Auto time_of_day triggers Context section |
| Memory hint in review | ⚠️ Code exists, needs words with context in queue |
| Tag limit (max 3) | ✅ PASS |

Full test spec: `/docs/engineering/e2e-tests/memory-context.md`

---

## Known Behaviors

1. **Auto time_of_day**: Even without manual context, the Context section appears with just the time (e.g., "night"). This is intentional for encoding specificity.

2. **Review hint visibility**: Memory hint only shows in **word mode** review, not sentence mode (sentences contain multiple words with potentially different contexts).

---

## Future Improvements

See GitHub Issue #72 for tracked improvements:
- Visual feedback when tag limit reached
- Gamification integration (bingo square for contextual captures)
- Sentence review context hints (aggregate from multiple words)
- Location auto-detect via GPS (planned but disabled)
