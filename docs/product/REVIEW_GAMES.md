# Review Games & Exercise Types

> Complete guide to LLYLI's review system, exercise types, and gamification features.

---

## Overview

LLYLI uses a multi-layered review system that adapts to your mastery level. Instead of repetitive flashcards, you practice through dynamic exercises that get progressively harder as you improve.

```
┌─────────────────────────────────────────────────────────────┐
│                     REVIEW SESSION                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────────────┐    ┌─────────────────────┐       │
│   │   SENTENCE MODE     │    │     WORD MODE       │       │
│   │   (Preferred)       │    │   (Fallback)        │       │
│   │                     │    │                     │       │
│   │  AI-generated       │    │  Single word        │       │
│   │  sentences mixing   │    │  flashcard-style    │       │
│   │  2+ of YOUR words   │    │  review             │       │
│   └─────────────────────┘    └─────────────────────┘       │
│                                                             │
│   System tries sentences first → Falls back to words       │
└─────────────────────────────────────────────────────────────┘
```

---

## Sentence Mode

The core differentiator. GPT-4o-mini generates natural sentences containing 2-4 of YOUR captured words. Each sentence is unique - they never repeat.

**Example:**
```
Your Words: ["café", "padaria", "manhã"]
                    ↓
         GPT-4o-mini generates:
                    ↓
"Todas as manhãs vou à padaria tomar um café."
(Every morning I go to the bakery to have a coffee.)
```

### Exercise Types (Auto-Selected by Mastery)

The system automatically chooses exercise difficulty based on your `consecutiveCorrectSessions` count for each word.

---

### 1. Multiple Choice (Easiest)

**When used:** `consecutiveCorrectSessions < 1` (new words you're still learning)

**How it works:**
- Sentence displayed with one word highlighted
- Choose the correct translation from 4 options
- Options shown in your NATIVE language

```
┌──────────────────────────────────────────────────┐
│  Choose the correct meaning:                     │
│                                                  │
│  "Todas as manhãs vou à [padaria] tomar café."  │
│                          ^^^^^^^^               │
│                        (highlighted)             │
│                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │  bakery  │ │  library │ │  station │        │
│  └──────────┘ └──────────┘ └──────────┘        │
│                                                  │
│  ✓ Tap "bakery" to answer correctly             │
└──────────────────────────────────────────────────┘
```

**Why this helps:** Recognition-based recall is easiest. You see the word in context and just need to recognize its meaning from options.

---

### 2. Fill in the Blank (Medium)

**When used:** `1 ≤ consecutiveCorrectSessions < 2` (words you're gaining confidence with)

**How it works:**
- Sentence displayed with one word blanked out
- Type the missing word
- Tests partial recall - you know it goes there, just need to remember it

```
┌──────────────────────────────────────────────────┐
│  Fill in the blank:                              │
│                                                  │
│  "Todas as manhãs vou à [______] tomar café."   │
│                         ^^^^^^^^                │
│                       (blanked out)              │
│                                                  │
│  ┌────────────────────────────────────┐         │
│  │ padaria                            │         │
│  └────────────────────────────────────┘         │
│                                                  │
│  ✓ Type "padaria" to complete the sentence      │
└──────────────────────────────────────────────────┘
```

**Why this helps:** Requires active recall but with strong context clues from the sentence structure.

---

### 3. Type Translation (Hardest)

**When used:** `consecutiveCorrectSessions ≥ 2` (words approaching mastery)

**How it works:**
- Sentence displayed with word highlighted (not blanked)
- Type the full translation
- Full production recall - no hints except the sentence context

```
┌──────────────────────────────────────────────────┐
│  Recall the meaning:                             │
│                                                  │
│  "Todas as manhãs vou à [padaria] tomar café."  │
│                          ^^^^^^^^               │
│                        (highlighted)             │
│                                                  │
│  ┌────────────────────────────────────┐         │
│  │ bakery                             │         │
│  └────────────────────────────────────┘         │
│                                                  │
│  ✓ Type "bakery" - the English translation      │
└──────────────────────────────────────────────────┘
```

**Why this helps:** True production recall - the hardest type. If you can do this, you're ready to use the word in real life.

---

## Word Mode (Fallback)

When no pre-generated sentences are available, the system falls back to single-word review.

```
┌──────────────────────────────────────────────────┐
│  Recall the meaning:                             │
│                                                  │
│               "padaria"                          │
│                                                  │
│  ┌────────────────────────────────────┐         │
│  │ bakery                             │         │
│  └────────────────────────────────────┘         │
│                                                  │
│  🔊 [Play Audio]                                │
│                                                  │
│  ✓ Type the translation                         │
└──────────────────────────────────────────────────┘
```

**Note:** Word mode uses active recall (type translation) - no multiple choice for single words.

---

## Difficulty Progression

The system automatically progresses difficulty as you demonstrate mastery:

| Consecutive Correct Sessions | Exercise Type | Difficulty |
|------------------------------|---------------|------------|
| 0 | Multiple Choice | ⭐ Easy |
| 1 | Fill in the Blank | ⭐⭐ Medium |
| 2+ | Type Translation | ⭐⭐⭐ Hard |
| 3+ | Word graduates to "Ready to Use" | 🎓 Mastered |

This mirrors natural language acquisition:
1. **Recognition** → "I know that word when I see it"
2. **Partial recall** → "I can fill it in with context"
3. **Full production** → "I can produce it on demand"

---

## Gamification System

### Daily Goal

- **Target:** 10 reviews per day
- **Progress:** Shown as X/10 on dashboard
- **Completion:** Unlocks Boss Round and builds streak

### Streaks

- **How it works:** Complete daily goal to maintain streak
- **Freeze protection:** Miss a day? One free freeze available
- **Display:** Flame icon with day count

### Bingo Board (3×3)

Daily board with 9 achievement squares. Complete a row, column, or diagonal for bonus.

**Available Squares:**

| Square | Challenge | How to Complete |
|--------|-----------|-----------------|
| `review5` | Review 5 words | Complete any 5 reviews |
| `streak3` | 3 correct in a row | Get 3 consecutive correct answers |
| `fillBlank` | Complete a fill-blank | Answer one fill-in-blank exercise |
| `multipleChoice` | Complete a multiple choice | Answer one multiple choice exercise |
| `addContext` | Add memory context | Capture a phrase with WHERE/WHEN context |
| `workWord` | Review a work word | Review any word from Work category |
| `socialWord` | Review a social word | Review any word from Social category |
| `masterWord` | Master a word | Get a word to "Ready to Use" status |
| `finishSession` | Finish daily session | Complete your 10 daily reviews |
| `bossRound` | Complete Boss Round | Finish the timed challenge |

**Visual:**
```
┌─────────────────────────────────────────┐
│           DAILY BINGO                   │
├───────────┬───────────┬─────────────────┤
│ Review 5  │ Fill-in   │ Work word       │
│    ✓      │   blank   │                 │
├───────────┼───────────┼─────────────────┤
│ 3 in a    │ Multiple  │ Master          │
│   row     │  choice   │  a word         │
├───────────┼───────────┼─────────────────┤
│ Social    │ Add       │ Finish          │
│  word     │ context   │ session    ✓    │
└───────────┴───────────┴─────────────────┘
```

---

## Boss Round (Timed Challenge)

**Unlocks:** After completing daily goal (10 reviews)

**How it works:**
1. System selects your 5 HARDEST words (highest lapse count)
2. 90-second time limit
3. Answer as many as possible
4. Track personal best over time

**Why it matters:** Deliberate practice on your weakest words accelerates mastery.

```
┌──────────────────────────────────────────────────┐
│              🔥 BOSS ROUND 🔥                    │
│                                                  │
│   Your 5 HARDEST words (most mistakes)          │
│                                                  │
│   ⏱️ 90 seconds                                  │
│                                                  │
│   Beat your personal best!                       │
│                                                  │
│   Week 1:  2/5  ⭐⭐                             │
│   Week 8:  4/5  ⭐⭐⭐⭐                         │
│   Week 16: 5/5  ⭐⭐⭐⭐⭐ 🏆                    │
└──────────────────────────────────────────────────┘
```

---

## Summary Table

| Mode | Exercise | Difficulty | Trigger |
|------|----------|------------|---------|
| **Sentence** | Multiple Choice | ⭐ Easy | New words (0 sessions) |
| **Sentence** | Fill in Blank | ⭐⭐ Medium | Learning (1 session) |
| **Sentence** | Type Translation | ⭐⭐⭐ Hard | Near mastery (2+ sessions) |
| **Word** | Active Recall | ⭐⭐⭐ Hard | No sentences available |
| **Gamification** | Bingo Board | Varies | Daily challenges |
| **Gamification** | Boss Round | ⭐⭐⭐ Hard | After daily goal |

---

## The Science Behind It

This progressive difficulty system applies **scaffolding** from learning theory:

1. **Recognition before production** - Multiple choice builds familiarity
2. **Graduated difficulty** - Each level builds on the previous
3. **Context-based learning** - Sentences provide natural context clues
4. **Interleaved practice** - Mixing words prevents pattern memorization
5. **Deliberate practice** - Boss Round targets weaknesses specifically

The `consecutiveCorrectSessions` counter serves as a proxy for mastery, automatically adjusting difficulty without manual configuration.

---

## Related Documentation

- [PRODUCT_SPECIFICATION.md](../../PRODUCT_SPECIFICATION.md) - Complete product spec
- [docs/product/science.md](./science.md) - Scientific foundations
- [docs/engineering/llyli_gamification_and_games_plan.md](../engineering/llyli_gamification_and_games_plan.md) - Technical gamification design
- [docs/testing/GAMIFICATION_USER_TEST_PLAN.md](../testing/GAMIFICATION_USER_TEST_PLAN.md) - Testing checklist

---

*Last updated: 2026-01-22*
