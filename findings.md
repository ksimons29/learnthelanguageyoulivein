# Bug Findings - Session 2026-01-21

## Critical Issue: Recurring Bugs That Were "Fixed"

This document tracks bugs discovered during user testing that appear to be regressions or incomplete fixes. The goal is to:
1. Document each issue with evidence
2. Identify root causes
3. Establish guardrails to prevent recurrence
4. Ensure MVP-level quality before release

---

## Finding #1: Sentence Page Shows Portuguese Words Instead of English Translations

### Screenshot Evidence
- **Location:** Review tab → Sentence generation view (llyli.vercel.app)
- **Time:** 17:08

### Observed Behavior
1. Sentence page shows a list of words to select for sentence generation
2. Words displayed: tampo, convite, peça, água, volante, precisar, Intemporal, feira de emprego, Trainwreck
3. **"Trainwreck" shows correctly in English** (user's native language)
4. **All other words show in Portuguese** - but user needs to see ENGLISH translations to select words they want to practice
5. Footer shows "2 words in this sentence" - selection counter working

### Expected Behavior
- Word list should show **English translations** (user's native language) so they can select words they want to include in a practice sentence
- Portuguese is the target language - user is learning Portuguese, so they need to see words in a language they understand to make selections

### The Core Problem
**Language direction confusion:** The sentence word picker shows target language (Portuguese) instead of native language (English). User can't meaningfully select words if they don't know what the Portuguese words mean.

### Root Cause Analysis
| Possible Cause | Likelihood | Investigation Needed |
|----------------|------------|----------------------|
| Wrong field displayed (phrase vs translation) | High | Check sentence word list component |
| Language direction not respected in query | High | Check how words are fetched for sentence UI |
| Display logic assumes wrong direction | High | Check component props/rendering |

### Why This Bug Exists
1. **Language direction complexity** - App supports multiple language pairs (EN→PT, EN→SV, NL→EN)
2. **Field naming confusion** - `phrase` vs `translation` meaning depends on direction
3. **No test for correct language display** - Tests may check data exists, not which language shows

---

## Finding #2: System KNOWS Translations But Doesn't Display Them

### Screenshot Evidence
- **Location:** Review tab → Sentence generation (llyli.vercel.app)
- **Time:** 17:13

### Observed Behavior
1. Word list still shows Portuguese: peça, água, volante, precisar, Intemporal, feira de emprego, Trainwreck
2. "precisar" is selected (coral highlight with X to deselect)
3. **Bottom shows: "apontado: pointed | peça: piece"** - the system KNOWS the English translations!
4. "Not quite" feedback shown at bottom

### The Irony
The explanation bar at the bottom correctly displays `portuguese: english` format, proving:
- The translation data EXISTS in the database
- The system CAN format it correctly
- The word LIST component just doesn't use the right field

### Root Cause
This is a **display logic bug**, not a data bug. The word picker component is showing `word.phrase` (Portuguese) instead of `word.translation` (English), while the explanation component correctly shows both.

### Fix Complexity
Should be simple - change which field the word list displays. But needs test to prevent regression.

---

## Finding #3: Duplicate Words in Review Queue + No Shuffling

### Screenshot Evidence
- **Location:** Review tab (llyli.vercel.app)
- **Time:** 17:15

### Observed Behavior
1. Word list shows: Intemporal, volante, água, precisar, feira de emprego, tampo, peça, Trainwreck
2. **"apontado" appears twice in the review queue** (user confirmed)
3. Word order appears similar across sessions - no shuffling

### Expected Behavior
- Each word should appear ONCE per review session
- Words should be shuffled/randomized to prevent memorizing order
- If user has limited vocabulary, system should still avoid immediate duplicates

### The Problem
1. **Duplicate insertion:** Same word added to queue multiple times
2. **No deduplication:** Query or queue logic doesn't filter duplicates
3. **No shuffle:** Words always appear in same order (likely insertion order or alphabetical)

### Root Cause Analysis
| Possible Cause | Likelihood | Investigation Needed |
|----------------|------------|----------------------|
| Review queue query lacks DISTINCT | High | Check review queue SQL |
| Multiple FSRS cards for same word | Medium | Check card creation logic |
| Queue populated multiple times | Medium | Check when queue is built |
| No randomization in ORDER BY | High | Check query ORDER clause |

### Why This Is Bad for Learning
1. **Primacy/recency bias** - User memorizes position, not word
2. **Duplicate reviews waste time** - User sees same word back-to-back
3. **Predictability reduces engagement** - Learning feels mechanical

### Proposed Guardrails
1. **Database constraint:** Unique index on (user_id, word_id) in review queue
2. **Query fix:** Add `DISTINCT` and `ORDER BY RANDOM()` or shuffle in code
3. **Test:** Assert review queue has no duplicate word_ids
4. **Test:** Assert word order differs between sessions (statistical test)

---

## Finding #4: Fill-in-the-Blank Shows WRONG Word as Target

### Screenshot Evidence
- **Location:** Review tab → Sentence exercise (llyli.vercel.app)
- **Time:** 17:19

### Observed Behavior
1. Sentence shown: "Além disso, os **[Observadores]** vão fazer um relatório."
2. "Observadores" is highlighted in teal as the blank to fill
3. Hints shown: "além disso: besides | Observadores: Watchers"
4. User presumably answered based on highlighted word
5. **Error feedback: "Not quite - The answer was: além disso"**

### The Critical Problem
- **Visual highlight:** "Observadores" (user thinks this is what to translate)
- **Expected answer:** "além disso" (completely different word!)
- **Result:** Exercise is IMPOSSIBLE to complete correctly

The user sees "Observadores" highlighted, logically answers "Watchers", and gets marked wrong because the system expected "besides" (for "além disso" which ISN'T highlighted).

### Why This Is a P0 Showstopper
1. **Core feature is broken** - The main learning exercise doesn't work
2. **User frustration** - Correct answers marked wrong
3. **Trust destroyed** - User can't rely on the app to work
4. **Learning impossible** - Can't learn if feedback is wrong

### Root Cause Analysis
| Possible Cause | Likelihood | Investigation Needed |
|----------------|------------|----------------------|
| Highlight index ≠ answer index | **Very High** | Check how currentWordIndex is used |
| Multiple words selected, wrong one highlighted | High | Check sentence word selection logic |
| State desync between display and validation | High | Check answer validation vs display state |
| Array indexing off-by-one | Medium | Check 0-based vs 1-based indexing |

### Likely Code Bug
```typescript
// PROBABLE BUG: Something like this
const highlightedWord = sentence.words[visualIndex];  // Shows "Observadores"
const expectedAnswer = sentence.words[answerIndex];   // Expects "além disso"
// visualIndex ≠ answerIndex
```

### Why This Bug Exists
1. **Complex state:** Sentence has multiple words, each with index
2. **Separate concerns:** Display logic vs validation logic not in sync
3. **No integration test:** Unit tests may pass individually but integration fails
4. **Happy path testing:** Dev tested with single-word sentences?

### Required Test (MUST ADD)
```typescript
test('highlighted word matches expected answer', async () => {
  const sentence = await generateSentence(userId, [word1, word2]);
  const highlightedWordInUI = getHighlightedWord(sentence);
  const expectedAnswer = getExpectedAnswer(sentence);

  // THE CRITICAL ASSERTION
  expect(highlightedWordInUI.phrase).toBe(expectedAnswer.phrase);
});
```

### Proposed Guardrails
1. **Invariant check in code:** Assert highlighted word === expected answer before render
2. **Integration test:** Full flow from sentence generation to answer validation
3. **Visual regression test:** Screenshot comparison with known-good state
4. **Runtime assertion:** Throw error if mismatch detected (fail fast, don't confuse user)

---

## Finding #5: Multiple-Choice Options in WRONG Language + Wrong Answer

### Screenshot Evidence
- **Location:** Review tab → Multiple choice exercise (llyli.vercel.app)
- **Time:** 17:21

### Observed Behavior
1. Prompt: "Choose the correct meaning:"
2. Sentence: "Além disso, o **[excerto]** é muito interessante."
3. "excerto" is highlighted in teal (the word to translate)
4. **Answer options are ALL IN PORTUGUESE:** convite, tampo, precisar, Intemporal, Trainwreck, peça, além disso, Observadores
5. "Intemporal" is user's selection (coral highlight)
6. **"além disso" shows checkmark as correct answer**

### Multiple Bugs in One Screen

#### Bug 5a: Answer options in wrong language
- User must "choose the correct meaning" of "excerto"
- Options should be ENGLISH: "excerpt", "invitation", "lid", etc.
- Options ARE Portuguese: convite, tampo, precisar, etc.
- **User cannot succeed** - no English translations to choose from

#### Bug 5b: Wrong word marked as correct (same as Finding #4)
- Highlighted word: "excerto" (means "excerpt" in English)
- Marked correct: "além disso" (means "besides" in English)
- These are DIFFERENT WORDS with different meanings
- System expects answer for wrong word

#### Bug 5c: Confusing exercise flow
- "excerto" not even in the answer list
- "além disso" appears BOTH in sentence AND as an answer option
- Completely broken user experience

### Why This Is Worse Than Finding #4
This combines:
1. Wrong language in options (Finding #1 pattern)
2. Wrong word as expected answer (Finding #4 pattern)
3. Highlighted word absent from options entirely

### Root Cause Pattern
The entire sentence review feature has **pervasive state confusion**:
- Display component and validation component disagree on current word
- Language direction logic applied inconsistently
- Word index tracking broken across the flow

### The Common Thread
Every finding points to the same architectural problem:
```
[Word Selection] → [Sentence Generation] → [Display] → [Validation]
     ↓                    ↓                   ↓            ↓
   Index A             Index B            Index C       Index D

   A ≠ B ≠ C ≠ D  ← STATE DESYNCHRONIZATION
```

### Required Fix Approach
1. **Single source of truth** for current word in sentence
2. **Derive all other values** from that source
3. **Invariant assertions** at each step to fail fast
4. **Integration test** that traces full flow end-to-end

---

## Finding #6: Word Selection Limited + Portuguese Display (Again)

### Screenshot Evidence
- **Location:** Review tab → Word selection / Post-exercise (llyli.vercel.app)
- **Time:** 17:22

### Observed Behavior
1. Options shown: feira de emprego, além disso (selected), Observadores, precisar
2. **All options in Portuguese** - same bug as Findings #1, #5
3. Bottom hints: "além disso: besides | peça: piece" - translations exist but not shown
4. "Correct!" feedback displayed
5. "2 words in this sentence" shown
6. **User cannot add more words** - limited to 2 words only

### New Bug: Sentence Word Limit Too Restrictive

#### The Problem
- User says they cannot add more than 2 words to a sentence
- With limited vocabulary (new learners), sentences should support MORE words
- Practicing multiple words in context is the core value proposition

#### Why This Matters
- "Learning multiple words in context" is shown as feature tagline
- But limiting to 2 words defeats the purpose
- User should be able to select 3-5+ words for richer practice

### Confirmed Pattern
This is now the **4th screen** showing Portuguese instead of English translations:
- Finding #1: Word picker - Portuguese
- Finding #5: Multiple choice options - Portuguese
- Finding #6: Word selection - Portuguese

**This is not an isolated bug - it's a systemic language direction failure.**

### Root Cause Hypothesis
The entire sentence review feature has `phrase` and `translation` fields swapped:
- `phrase` = target language (Portuguese)
- `translation` = native language (English)
- Display logic uses `phrase` everywhere instead of `translation`

One-line fix potential, but needs comprehensive testing across all views.

---

## Finding #7: Correct Answer NOT in Options - Exercise Impossible

### Screenshot Evidence
- **Location:** Review tab → Sentence Review (llyli.vercel.app)
- **Time:** 17:23

### Observed Behavior
1. "SENTENCE REVIEW" header shown (coral badge)
2. "Choose the correct meaning:"
3. Sentence: "Além disso, preciso de **[selos]** para enviar cartas."
4. "selos" is highlighted in teal (means "stamps" in English)
5. **Options shown:** Trainwreck, além disso, convite, água, peça, Battery, feira de emprego, precisar, volante, tampo, Observadores, Intemporal
6. **"stamps" is NOT an option!**
7. User CANNOT complete the exercise correctly

### Multiple Issues in One Screen

#### Bug 7a: Correct answer missing from options
- Highlighted word: "selos" (Portuguese for "stamps")
- Expected correct answer: "stamps" (English)
- Available options: None contain "stamps"
- **Exercise is literally impossible**

#### Bug 7b: Options are mixed languages
- English words: Trainwreck, Battery
- Portuguese words: além disso, convite, água, peça, feira de emprego, precisar, volante, tampo, Observadores, Intemporal
- **No consistency** - should all be English translations

#### Bug 7c: Options are user's OTHER vocabulary, not distractors
- The options appear to be the user's entire word list
- They're not semantically related distractors (e.g., other nouns like "letters", "envelopes")
- This makes the exercise meaningless for learning

### Root Cause Analysis
| Possible Cause | Likelihood | Investigation Needed |
|----------------|------------|----------------------|
| Options populated from word list, not sentence context | **Very High** | Check how options are generated |
| Correct answer never added to options array | **Very High** | Check option generation logic |
| Field swap (phrase vs translation) in option display | High | Already confirmed pattern |

### Why This Is a P0 BLOCKER
1. **Exercise cannot be completed** - no valid answer exists
2. **User wastes time** - will try every option and fail
3. **Trust completely destroyed** - app is fundamentally broken
4. **Core feature non-functional** - sentence review is the main learning method

### The Correct Behavior
```typescript
// Options should be:
const correctAnswer = "stamps";  // Translation of highlighted "selos"
const distractors = ["letters", "packages", "envelopes", "postcards"]; // Related words
const options = shuffle([correctAnswer, ...distractors]);
```

### What's Actually Happening
```typescript
// Bug: Options are just user's other vocabulary
const options = userVocabulary.map(word => word.phrase); // Wrong field!
// AND correct answer never inserted
// AND mixed languages
```

---

## Finding #8: "Captured Today" Resets on Navigation

### Screenshot Evidence
- **Location:** Today page (llyli.vercel.app)
- **Time:** 17:25

### Observed Behavior
1. User captures words during session
2. User navigates to another tab (Review, Notebook, etc.)
3. User returns to Today page
4. **"Captured Today" section shows: "No phrases captured today yet"**
5. Previously captured words are gone from the list

### Expected Behavior
- "Captured Today" should persist across navigation
- Should show all words captured since midnight today
- Data comes from database (has `createdAt` timestamp), not just client state

### Root Cause Analysis
| Possible Cause | Likelihood | Investigation Needed |
|----------------|------------|----------------------|
| Client state reset on unmount | High | Check if using Zustand persist |
| Query not re-fetching on mount | High | Check React Query stale time |
| Date filter logic incorrect | Medium | Check timezone handling |
| Component fetches but shows stale | Medium | Check loading states |

### Impact
- User loses visibility into what they captured
- Feels like data loss (even if data is saved)
- Breaks the feedback loop of "capture → see → review"

---

## Finding #9: Inbox Count Mismatch - 4 Shown, None Visible

### Screenshot Evidence
- **Location:** Notebook page (llyli.vercel.app)
- **Time:** 17:25

### Observed Behavior
1. Notebook page shows: "Inbox - 4 new & untagged phrases"
2. User taps to open Inbox
3. **Only "other" category visible, not the 4 items**
4. The promised 4 phrases don't appear

### Expected Behavior
- Tapping Inbox should show 4 untagged phrases
- User can then organize/categorize them
- Count and content should match

### Root Cause Analysis
| Possible Cause | Likelihood | Investigation Needed |
|----------------|------------|----------------------|
| Category filter wrong in Inbox view | High | Check inbox query filters |
| "Untagged" definition mismatch | High | Count query ≠ display query |
| Items have category "other" but count excludes "other" | Medium | Check category logic |
| Stale count (not refreshed) | Medium | Check when count updates |

---

## Finding #10: Review Due Count Conflict Between Pages

### Screenshot Evidence
- **Location:** Notebook + Today pages (llyli.vercel.app)
- **Time:** 17:25

### Observed Behavior
1. **Notebook page shows: "DUE TODAY: 49"**
2. **Today page shows: "Review Due: 0 phrases waiting"**
3. Same user, same time, completely different counts!

### The Contradiction
| Page | Due Count |
|------|-----------|
| Notebook | 49 |
| Today | 0 |

This is the same data source - how can it show 49 on one page and 0 on another?

### Root Cause Analysis
| Possible Cause | Likelihood | Investigation Needed |
|----------------|------------|----------------------|
| Different FSRS due date calculations | High | Compare queries |
| Today page checks different criteria | High | Maybe includes "new" filter |
| Caching issue - stale data | Medium | Check cache invalidation |
| Timezone mismatch | Medium | Server vs client time |

### Why This Is Critical
- User sees 49 due, goes to review, sees 0
- Completely confusing and breaks trust
- Either Notebook is wrong or Today is wrong (or both!)
- **One source of truth needed**

### Required Fix
```typescript
// MUST use same function everywhere
const dueCount = calculateDueCards(userId, today);

// Notebook and Today pages both call this
// No separate implementations
```

---

## Findings Summary

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 1 | Sentence page shows Portuguese instead of English translations | **P0 Critical** | Documenting |
| 2 | System knows translations but doesn't display them in word list | **P0 Critical** | Documenting |
| 3 | Duplicate words in review queue (apontado x2) | **P1 High** | Documenting |
| 3a | No shuffling - words appear in same order | **P1 High** | Documenting |
| 4 | Fill-in-blank highlights WRONG word - answer mismatch | **P0 BLOCKER** | Documenting |
| 5 | Multiple-choice options in Portuguese instead of English | **P0 BLOCKER** | Documenting |
| 5a | Wrong word marked as correct (excerto highlighted, além disso "correct") | **P0 BLOCKER** | Documenting |
| 6 | Word selection capped at 2 words - too restrictive | **P2 Medium** | Documenting |
| 6a | Portuguese display in word selection (4th occurrence) | **P0 Critical** | Documenting |
| 7 | **Correct answer NOT in multiple choice options** | **P0 BLOCKER** | Documenting |
| 7a | Options are user's other vocab, not related distractors | **P1 High** | Documenting |
| 7b | Mixed languages in options (Trainwreck, Battery vs Portuguese) | **P0 Critical** | Documenting |
| 8 | "Captured Today" resets when navigating away | **P1 High** | Documenting |
| 9 | Inbox shows 4 items but none visible when opened | **P1 High** | Documenting |
| 10 | **Due count conflict: Notebook=49, Today=0** | **P0 Critical** | Documenting |

---

---

## META-ISSUE: Why Existing Guardrails Are Failing

### The Uncomfortable Truth

CLAUDE.md already contains:
- Mandatory `npm run build` and `npm run test:run` after every change
- E2E testing via Playwright MCP
- Test accounts with different language pairs (EN→PT, EN→SV, NL→EN)
- Comprehensive test scripts

**Yet bugs still ship. Why?**

### Guardrail Failure Analysis

| Guardrail | Status | Why It Failed |
|-----------|--------|---------------|
| `npm run build` | ✅ Runs | Only catches TypeScript errors, not logic bugs |
| `npm run test:run` | ⚠️ Runs | Tests exist but don't cover this scenario |
| Playwright E2E | ❌ Skipped? | Manual step easily forgotten under time pressure |
| Language pair testing | ❌ Not done | Tests likely only run for one language direction |
| Scale testing (500+ records) | ❌ Not done | Performance tested, not correctness |

### Root Causes of Guardrail Failure

1. **Tests verify presence, not correctness**
   - Test: "Does word list render?" ✅
   - Missing: "Does word list show the RIGHT language?" ❌

2. **Happy path bias**
   - Test with EN→PT user, see Portuguese words, assume correct
   - Never verified FROM USER PERSPECTIVE what language SHOULD show

3. **No user scenario tests**
   - PRD has user stories, but no automated tests trace full scenarios
   - "As a user, I want to select words I understand" ← not tested

4. **Build passes ≠ Feature works**
   - TypeScript catches type errors
   - Logic errors pass through silently

5. **Manual E2E is optional in practice**
   - CLAUDE.md says "also run E2E" but it's not enforced
   - Time pressure → skip manual testing → bugs ship

### What Must Change

1. **Semantic test assertions**
   ```typescript
   // BAD: Tests structure
   expect(wordList).toHaveLength(10);

   // GOOD: Tests meaning
   expect(wordList[0].displayLanguage).toBe(user.nativeLanguage);
   ```

2. **User scenario integration tests**
   - Not unit tests, not E2E, but scenario tests
   - "Complete sentence generation flow with EN→PT user"
   - Assert on user-visible outcomes

3. **Multi-language pair CI**
   - Every PR must pass tests for ALL language directions
   - Not just EN→PT

4. **Pre-commit hook for critical paths**
   - Changes to `/review`, `/sentence`, word display → force E2E

5. **Acceptance criteria as code**
   - PRD says "user sees words in their native language"
   - This must become an automated test, not a hope

---

## Action Items Before Fixing

- [ ] Add more screenshots to this document
- [ ] Trace the full user flow that triggers this
- [ ] Identify the specific commit that broke this (git bisect)
- [ ] Write the test FIRST that would catch this bug
- [ ] Then fix the bug
- [ ] Verify fix catches the test
- [ ] Add pre-commit hook for this file

---

## FINAL ASSESSMENT: Brutal Honesty

### The State of the App

**The sentence review feature - the app's differentiating feature - is 100% broken.**

Not edge cases. Not minor issues. The core flow fails at every step:
- Can't select words (wrong language shown)
- Can't complete exercises (wrong word highlighted)
- Can't answer questions (correct answer missing)
- Can't trust feedback (wrong answers marked correct)

**This is not MVP-ready. This is pre-alpha quality.**

### Bug Count Summary

| Severity | Count | Description |
|----------|-------|-------------|
| **P0 BLOCKER** | 5 | Core features completely broken |
| **P0 Critical** | 5 | Serious issues preventing normal use |
| **P1 High** | 4 | Significant problems affecting UX |
| **P2 Medium** | 1 | Minor limitations |
| **Total** | **15** | In a single 20-minute test session |

### Why This Happened - Honest Analysis

1. **"Fixed" without verification**
   - Bugs marked fixed in PROJECT_LOG without E2E validation
   - Code changes made, build passed, assumed working

2. **Tests check structure, not semantics**
   - "Does component render?" ✅
   - "Does it show the RIGHT content?" Never asked

3. **Happy path tunnel vision**
   - Tested EN→PT, saw Portuguese, assumed correct
   - Never asked "what SHOULD the user see?"

4. **Manual testing skipped under time pressure**
   - CLAUDE.md says "also run E2E" - optional language
   - Easy to skip when build passes

5. **No user-perspective testing**
   - Developer sees code working
   - User sees app failing
   - Gap never bridged

6. **Incremental changes without integration testing**
   - Each small change "worked"
   - Combined result: completely broken

### Mandatory Changes - Non-Negotiable

#### 1. Before ANY PR to sentence review feature:
```bash
# REQUIRED - not optional
npm run build
npm run test:run
# THEN: Manual E2E with Playwright MCP
# - Complete full sentence flow
# - Verify language direction
# - Verify highlighted word = expected answer
# - Verify correct answer in options
```

#### 2. New Test Requirements
```typescript
// MUST exist before feature ships:
test('word picker shows native language (English)', () => {
  expect(displayedWord.language).toBe(user.nativeLanguage);
});

test('highlighted word matches expected answer', () => {
  expect(highlightedWord.id).toBe(expectedAnswer.id);
});

test('correct answer exists in options', () => {
  expect(options).toContain(correctAnswer);
});

test('all options in same language', () => {
  const languages = options.map(o => o.language);
  expect(new Set(languages).size).toBe(1);
});

test('due count same across all pages', () => {
  expect(notebookDueCount).toBe(todayDueCount);
});
```

#### 3. Pre-Commit Hook for Critical Files
Any change to these files MUST include E2E validation:
- `app/review/**`
- `components/sentence/**`
- `lib/fsrs/**`
- `stores/review-store.ts`

#### 4. Definition of "Fixed"
A bug is NOT fixed until:
- [ ] Code change made
- [ ] Unit test added that would have caught the bug
- [ ] Build passes
- [ ] Manual E2E verification with Playwright MCP
- [ ] Screenshots showing correct behavior
- [ ] PR description includes before/after evidence

### Priority Fix Order

| Priority | Bug | Why First |
|----------|-----|-----------|
| 1 | Language direction (phrase vs translation) | Fixes #1, #2, #5, #6a, #7b - one root cause |
| 2 | Highlighted word ≠ answer | Fixes #4, #5a - makes exercises possible |
| 3 | Correct answer in options | Fixes #7 - makes exercises completable |
| 4 | Due count consistency | Fixes #10 - trust in data |
| 5 | Duplicates + shuffle | Fixes #3, #3a - better UX |
| 6 | Captured Today persistence | Fixes #8 - feedback loop |
| 7 | Inbox count | Fixes #9 - data consistency |
| 8 | Word limit | Fixes #6 - feature enhancement |

### The Standard Going Forward

**Every session must end with:**
1. All changes tested via build + unit tests
2. Changed features verified via Playwright E2E
3. Screenshots captured for non-trivial changes
4. PROJECT_LOG updated with verification evidence

**"It builds" is not "it works".**

---

## Document Created
- **Date:** 2026-01-21
- **Session:** Bug documentation and assessment
- **Finding count:** 15 issues
- **P0/Blocker count:** 10 issues
- **Status:** Ready for systematic fixing
