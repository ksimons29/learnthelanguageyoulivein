# LLYLI Gamification User Test Plan

> Extensive manual testing checklist for gamification features, incorporating user personas and product vision.

**Document Version:** 1.0
**Created:** 2026-01-21
**Last Bug Fixes:** Session 49 (API 500 errors, race conditions)

---

## Overview

This test plan covers the complete gamification system:
- Daily Goals & Progress Tracking
- Streak System (including forgiving freeze)
- Bingo Board (9 squares)
- Boss Round Challenge
- Feedback System
- Integration with Review System

### User Personas for Testing

| Persona | Context | Test Focus |
|---------|---------|------------|
| **Sofia** | Dutch UX designer in Lisbon, pt-PT learner | Friction-free capture, daily motivation, EU Portuguese |
| **Ralf** | Swedish learner, "1000 words/year" goal | Gamification structure, progress tracking, ambitious goals |
| **Maria** | Tried multiple apps, frustrated with wrong variants | Correct language variants, real-life vocabulary |

---

## Pre-Test Setup

### Test Accounts

| Email | Password | Direction | Purpose |
|-------|----------|-----------|---------|
| `test-en-pt@llyli.test` | `TestPassword123!` | EN→PT | Primary testing |
| `test-en-sv@llyli.test` | `TestPassword123!` | EN→SV | Swedish variant |
| `test-nl-en@llyli.test` | `TestPassword123!` | NL→EN | Bidirectional capture |

### Reset Before Testing

```bash
# Reset test user data if needed
cd web && npx tsx scripts/create-test-users.ts
```

---

## Section 1: Daily Progress System

### 1.1 Daily Goal Display

| ID | Test Case | Steps | Expected | Critical |
|----|-----------|-------|----------|----------|
| DP-01 | Daily goal visible on home page | 1. Sign in 2. View home page | "Today's Progress" section shows X/10 reviewed | ✅ |
| DP-02 | Progress ring updates | 1. Complete 1 review 2. Return to home | Ring fills proportionally (10% per review) | ✅ |
| DP-03 | Goal completion state | 1. Complete 10 reviews | Ring shows checkmark, "Daily goal complete!" | ✅ |
| DP-04 | Progress persists across sessions | 1. Complete 5 reviews 2. Close app 3. Reopen | Still shows 5/10, not reset | ✅ |
| DP-05 | New day resets progress | 1. Complete goal 2. Wait for new UTC day 3. Check | Reset to 0/10 | ✅ |

### 1.2 Daily Goal Celebration

| ID | Test Case | Steps | Expected | Critical |
|----|-----------|-------|----------|----------|
| DC-01 | Celebration modal appears | 1. Complete 10th review | Modal with PartyPopper shows "Done for today!" | ✅ |
| DC-02 | Streak shown in celebration | 1. Have 3+ day streak 2. Complete goal | Modal shows "3 day streak!" | ✅ |
| DC-03 | Dismiss celebration | 1. See celebration 2. Click "Keep it up!" | Modal closes, returns to home | ✅ |
| DC-04 | "Practice more" link works | 1. See celebration 2. Click "Practice more" | Navigates to /review | ✅ |
| DC-05 | Backdrop dismisses | 1. See celebration 2. Click outside modal | Modal closes | |

### 1.3 Review Complete Page

| ID | Test Case | Steps | Expected | Critical |
|----|-----------|-------|----------|----------|
| RC-01 | Session stats display | 1. Complete review session | Shows words reviewed, accuracy %, correct count | ✅ |
| RC-02 | Daily goal status | 1. Complete 5 reviews (under goal) | Shows "5/10 reviews" with progress bar | ✅ |
| RC-03 | Goal complete indicator | 1. Complete 10+ reviews | Shows checkmark, "Daily goal complete!" | ✅ |
| RC-04 | Tomorrow preview | 1. Complete session | Shows "X words due for review" | |
| RC-05 | Done button navigates home | 1. Click "Done" | Returns to home page, session reset | ✅ |

---

## Section 2: Streak System

### 2.1 Streak Tracking

| ID | Test Case | Steps | Expected | Critical |
|----|-----------|-------|----------|----------|
| ST-01 | New user starts at 0 | 1. Create new account | Current streak: 0 | ✅ |
| ST-02 | First completion starts streak | 1. Complete daily goal | Streak becomes 1 | ✅ |
| ST-03 | Consecutive day increments | 1. Complete goal today 2. Complete tomorrow | Streak increments to 2 | ✅ |
| ST-04 | Same day doesn't double-count | 1. Complete goal 2. Do more reviews same day | Streak stays same | ✅ |
| ST-05 | Streak visible in progress | 1. Have streak 2. Check progress page | Shows flame icon with streak count | ✅ |

### 2.2 Forgiving Freeze System

| ID | Test Case | Steps | Expected | Critical |
|----|-----------|-------|----------|----------|
| SF-01 | Default freeze count | 1. New user | Starts with 1 streak freeze | ✅ |
| SF-02 | Freeze protects streak | 1. Have 5-day streak 2. Miss one day 3. Return next day | Streak preserved (shows 5), freeze count -1 | ✅ |
| SF-03 | No freeze = streak reset | 1. Use freeze 2. Miss another day | Streak resets to 0 | ✅ |
| SF-04 | Multiple days missed | 1. Miss 2+ consecutive days | Streak resets (freeze only covers 1 day) | ✅ |

### 2.3 Longest Streak Tracking

| ID | Test Case | Steps | Expected | Critical |
|----|-----------|-------|----------|----------|
| LS-01 | Longest streak updates | 1. Reach 7-day streak (new record) | Longest streak updates to 7 | |
| LS-02 | Longest streak preserved | 1. Reset current streak | Longest streak unchanged | |

---

## Section 3: Bingo Board

### 3.1 Board Display

| ID | Test Case | Steps | Expected | Critical |
|----|-----------|-------|----------|----------|
| BB-01 | Compact preview on home | 1. View home page | Mini 3x3 grid with completion indicators | ✅ |
| BB-02 | Expand to full board | 1. Click compact bingo | Full board modal opens with all 9 squares | ✅ |
| BB-03 | Square labels readable | 1. View full board | All 9 squares have readable labels | ✅ |
| BB-04 | Completed squares teal | 1. Complete a square 2. View board | Completed squares show teal with checkmark | ✅ |
| BB-05 | Counter shows X/9 | 1. Complete 3 squares | Header shows "3/9" | ✅ |

### 3.2 Bingo Square Completion

| ID | Test Case | Steps | Expected | Critical |
|----|-----------|-------|----------|----------|
| BS-01 | **review5** | 1. Review 5 words | "Review 5 words" square completes | ✅ |
| BS-02 | **streak3** | 1. Get 3 consecutive correct answers | "3 in a row" square completes | ✅ |
| BS-03 | **fillBlank** | 1. Complete a fill-blank exercise | "Complete a fill-blank" square completes | ✅ |
| BS-04 | **multipleChoice** | 1. Complete a multiple choice exercise | "Multiple choice" square completes | ✅ |
| BS-05 | **addContext** | 1. Capture a word WITH memory context | "Add memory context" square completes | ✅ |
| BS-06 | **workWord** | 1. Review a word with category "work" | "Work category" square completes | |
| BS-07 | **socialWord** | 1. Review a word with category "social" | "Social category" square completes | |
| BS-08 | **masterWord** | 1. Master a word (3rd consecutive correct) | "Master a word" square completes | |
| BS-09 | **finishSession** | 1. Complete daily goal | "Finish session" square completes | ✅ |

### 3.3 Bingo Achievement

| ID | Test Case | Steps | Expected | Critical |
|----|-----------|-------|----------|----------|
| BA-01 | Row bingo detection | 1. Complete top 3 squares | "Bingo!" indicator appears, winning squares highlighted | ✅ |
| BA-02 | Column bingo detection | 1. Complete first column | Same | ✅ |
| BA-03 | Diagonal bingo detection | 1. Complete diagonal (0,4,8) | Same | ✅ |
| BA-04 | Bingo celebration | 1. Achieve any bingo | Trophy icon in compact view, celebration text | ✅ |
| BA-05 | Daily reset | 1. Achieve bingo 2. Wait for new day | Board resets to 0/9 | ✅ |

### 3.4 Bingo Navigation Actions

| ID | Test Case | Steps | Expected | Critical |
|----|-----------|-------|----------|----------|
| BN-01 | Clickable review squares | 1. Click incomplete "Review 5 words" | Navigates to /review | |
| BN-02 | Clickable capture squares | 1. Click incomplete "Add memory context" | Navigates to /capture | |
| BN-03 | Tooltip for non-navigable | 1. Hover over "3 in a row" | Shows tooltip explaining how to complete | |
| BN-04 | Completed squares non-clickable | 1. Click completed square | Nothing happens | |

---

## Section 4: Boss Round

### 4.1 Boss Round Availability

| ID | Test Case | Steps | Expected | Critical |
|----|-----------|-------|----------|----------|
| BR-01 | Not available before daily goal | 1. Complete 5/10 reviews 2. Go to home | Boss Round section not shown | ✅ |
| BR-02 | Prompt appears after goal | 1. Complete 10 reviews 2. View completion page | Boss Round Prompt card visible | ✅ |
| BR-03 | Also shows on home page | 1. After completing goal 2. Return home | Boss Round section visible on home | ✅ |
| BR-04 | Skip option available | 1. See Boss Round prompt 2. Click "Maybe later" | Prompt dismissed | ✅ |

### 4.2 Boss Round Gameplay

| ID | Test Case | Steps | Expected | Critical |
|----|-----------|-------|----------|----------|
| BG-01 | Shows 5 hardest words | 1. Start Boss Round | 5 words displayed (sorted by lapseCount) | ✅ |
| BG-02 | 90-second timer | 1. Start Boss Round | Timer shows 1:30 and counts down | ✅ |
| BG-03 | Timer visual warning | 1. Let timer reach 15 seconds | Timer turns red, pulses | ✅ |
| BG-04 | Reveal answer button | 1. See word 2. Click "Reveal Answer" | Translation shown | ✅ |
| BG-05 | "Got it!" increments score | 1. Click "Got it!" | Score +1, move to next word | ✅ |
| BG-06 | "Didn't know" no score | 1. Click "Didn't know" | Score unchanged, move to next | ✅ |
| BG-07 | Cancel mid-round | 1. Click X button | Returns to prompt state | ✅ |

### 4.3 Boss Round Results

| ID | Test Case | Steps | Expected | Critical |
|----|-----------|-------|----------|----------|
| BRR-01 | Perfect score celebration | 1. Get 5/5 | Shows "Perfect!", coral theme | ✅ |
| BRR-02 | Passing score message | 1. Get 3/5 | Shows "Well done!", teal theme | ✅ |
| BRR-03 | Low score encouragement | 1. Get 1/5 | Shows "Nice try!", encouraging message | ✅ |
| BRR-04 | Accuracy percentage | 1. Complete round | Shows "80% accuracy" (or similar) | ✅ |
| BRR-05 | Time used display | 1. Complete in 45 seconds | Shows "0:45" time used | ✅ |
| BRR-06 | Results saved to database | 1. Complete round 2. Check next session | Personal best stats reflect new attempt | ✅ |

### 4.4 Boss Round Personal Stats

| ID | Test Case | Steps | Expected | Critical |
|----|-----------|-------|----------|----------|
| BPS-01 | First attempt no stats | 1. First ever Boss Round | No personal stats shown in prompt | |
| BPS-02 | Stats shown after first | 1. Complete one round 2. See prompt again | Shows best score, attempts, perfect count | ✅ |
| BPS-03 | Best score updates | 1. Beat previous best | Best score updates in stats | ✅ |
| BPS-04 | New personal best flag | 1. Beat previous best | Results show "New personal best!" | ✅ |

---

## Section 5: Gamification Events

### 5.1 Event Emission

| ID | Test Case | Steps | Expected | Critical |
|----|-----------|-------|----------|----------|
| GE-01 | item_answered emitted | 1. Answer any review | API receives event, daily progress increments | ✅ |
| GE-02 | Correct tracks consecutive | 1. Get 3 correct in a row | consecutiveCorrect reaches 3, streak3 bingo triggers | ✅ |
| GE-03 | Incorrect resets consecutive | 1. Have 2 consecutive 2. Get one wrong | consecutiveCorrect resets to 0 | ✅ |
| GE-04 | session_completed emitted | 1. Finish review session | finishSession bingo marked (if goal complete) | ✅ |
| GE-05 | word_mastered emitted | 1. Get 3rd consecutive correct on word | masterWord bingo triggered | |
| GE-06 | word_captured_with_context | 1. Capture word with memory context | addContext bingo triggered | ✅ |

### 5.2 Category Tracking

| ID | Test Case | Steps | Expected | Critical |
|----|-----------|-------|----------|----------|
| CT-01 | Work category detected | 1. Review word with category="work" | workWord bingo triggered | |
| CT-02 | Social category detected | 1. Review word with category="social" | socialWord bingo triggered | |
| CT-03 | Category from word metadata | 1. Capture word 2. Verify category | Category auto-assigned or user-selected | |

---

## Section 6: Feedback System

### 6.1 Feedback Submission

| ID | Test Case | Steps | Expected | Critical |
|----|-----------|-------|----------|----------|
| FB-01 | Bug report submission | 1. Open feedback 2. Select "Bug Report" 3. Type message 4. Submit | Success confirmation, saved to DB | ✅ |
| FB-02 | Feature request submission | 1. Select "Feature Request" 2. Submit | Same | ✅ |
| FB-03 | General feedback submission | 1. Select "General Feedback" 2. Submit | Same | ✅ |
| FB-04 | Empty message rejected | 1. Try to submit empty message | Error: "Message is required" | ✅ |
| FB-05 | Long message accepted | 1. Submit 500 character message | Accepted | |
| FB-06 | Too long message rejected | 1. Submit 5001 character message | Error about length limit | ✅ |
| FB-07 | Page context captured | 1. Submit from /progress page | pageContext stored as "/progress" | |

### 6.2 Feedback Button Access

| ID | Test Case | Steps | Expected | Critical |
|----|-----------|-------|----------|----------|
| FA-01 | Visible on home | 1. Check home page | Coral ribbon-style feedback button visible | ✅ |
| FA-02 | Visible on review | 1. Check review page | Same | |
| FA-03 | Opens feedback form | 1. Click feedback button | Form sheet opens | ✅ |

---

## Section 7: Integration Tests

### 7.1 Review + Gamification

| ID | Test Case | Steps | Expected | Critical |
|----|-----------|-------|----------|----------|
| RG-01 | Fill-blank triggers bingo | 1. Review with fill-blank exercise | fillBlank bingo square marked | ✅ |
| RG-02 | Multiple-choice triggers bingo | 1. Review with MC exercise | multipleChoice bingo square marked | ✅ |
| RG-03 | Review count syncs | 1. Complete 5 reviews 2. Check home | Both review store and gamification store show 5 | ✅ |
| RG-04 | Streak syncs with progress | 1. Complete daily goal 2. Check progress page | Streak count matches between home and progress | ✅ |

### 7.2 Capture + Gamification

| ID | Test Case | Steps | Expected | Critical |
|----|-----------|-------|----------|----------|
| CG-01 | Context capture triggers bingo | 1. Capture word 2. Add memory context | addContext bingo marked | ✅ |
| CG-02 | No context no trigger | 1. Capture word without context | addContext bingo NOT marked | |

### 7.3 Progress Page + Gamification

| ID | Test Case | Steps | Expected | Critical |
|----|-----------|-------|----------|----------|
| PG-01 | Streak displays correctly | 1. Have 5-day streak 2. View progress | Shows "5 day streak" | ✅ |
| PG-02 | Due today accurate | 1. Check progress page | dueToday matches home page count | ✅ |

---

## Section 8: Edge Cases & Race Conditions

### 8.1 Concurrent Requests

| ID | Test Case | Steps | Expected | Critical |
|----|-----------|-------|----------|----------|
| EC-01 | Rapid answer submissions | 1. Click answer button rapidly | Only one submission processed | ✅ |
| EC-02 | Multiple tab sync | 1. Open app in 2 tabs 2. Complete review in one | Both tabs reflect update on refresh | |
| EC-03 | TOCTOU prevention | 1. First request of day from 2 sources | Only 1 dailyProgress record created (insert-first pattern) | ✅ |

### 8.2 Empty/Invalid States

| ID | Test Case | Steps | Expected | Critical |
|----|-----------|-------|----------|----------|
| ES-01 | No words captured | 1. New user with 0 words 2. Try Boss Round | "Daily goal not yet completed" error | ✅ |
| ES-02 | Less than 5 words total | 1. User with 3 words 2. Complete goal 3. Boss Round | Shows 3 words (not 5) | |
| ES-03 | Empty bingo state | 1. New user new day | Empty squaresCompleted array, all squares uncompleted | ✅ |

### 8.3 API Error Handling

| ID | Test Case | Steps | Expected | Critical |
|----|-----------|-------|----------|----------|
| AE-01 | Gamification state 401 | 1. Sign out 2. Call /api/gamification/state | Returns 401, not 500 | ✅ |
| AE-02 | Event API 401 | 1. Sign out 2. Submit event | Returns 401 | ✅ |
| AE-03 | Boss round history unavailable | 1. Table doesn't exist | Boss Round still works, just no stats | ✅ |
| AE-04 | Invalid event type | 1. Submit unknown event type | Returns 400 "Unknown event type" | ✅ |

---

## Section 9: User Persona Scenarios

### 9.1 Sofia Scenario (Friction-Free Daily Learning)

> "Dutch UX designer, 32, living in Lisbon. Wants frictionless capture and daily motivation."

| ID | Test Case | Steps | Expected | Validates |
|----|-----------|-------|----------|-----------|
| SF-01 | Quick capture flow | 1. Open app 2. Type "aquecimento" 3. Save | < 2 seconds total, word saved | "Capture takes 2 seconds" |
| SF-02 | Daily habit loop | 1. Complete 10 reviews (~10 min) | Celebration modal, streak updated | "Daily goal is achievable" |
| SF-03 | Motivation on return | 1. Return next day | Streak visible, "Keep it going!" | "Forgiving streak doesn't punish" |
| SF-04 | EU Portuguese audio | 1. Capture "obrigado" 2. Play audio | European Portuguese pronunciation | "pt-PT support" |
| SF-05 | Context recognition | 1. Capture "renda" with context "landlord text" | Word associated with context | "Words from HER life" |

### 9.2 Ralf Scenario (Ambitious Goal-Setter)

> "Swedish learner, set goal of 1000 words/year. Needs motivating structure."

| ID | Test Case | Steps | Expected | Validates |
|----|-----------|-------|----------|-----------|
| RA-01 | Progress visibility | 1. Check progress page | Total words, this week, mastered visible | "Progress toward big goal" |
| RA-02 | Gamification engagement | 1. Complete bingo squares | Visual completion, satisfaction | "Motivating structure" |
| RA-03 | Boss Round challenge | 1. Complete daily goal 2. Beat personal best | "New personal best!" celebration | "Fun and relevant" |
| RA-04 | Streak persistence | 1. Maintain 7-day streak | Clear tracking, flame icon | "Connected to bigger challenge" |
| RA-05 | Weekly pattern | 1. Review Mon-Fri, miss Sat (freeze) | Streak preserved | "Life happens" forgiveness |

### 9.3 Maria Scenario (Frustrated App Switcher)

> "Tried multiple apps, frustrated with wrong Portuguese variant."

| ID | Test Case | Steps | Expected | Validates |
|----|-----------|-------|----------|-----------|
| MA-01 | Correct variant check | 1. Set pt-PT 2. Capture word | Translation uses EU Portuguese | "Doesn't offer EU Portuguese" fix |
| MA-02 | Real vocabulary test | 1. Capture "gezellig" (Dutch concept) | Meaningful translation, not literal | "Real-life vocabulary" |
| MA-03 | Fresh sentence variety | 1. Review word 3 times | 3 different sentences | "Same sentence repeated" fix |
| MA-04 | Quick engagement | 1. First session | Complete loop in < 15 min | "Too many button presses" fix |

---

## Section 10: Bug Regression Tests

### 10.1 Fixed in Session 48

| ID | Bug | Test Steps | Expected | Status |
|----|-----|------------|----------|--------|
| REG-01 | Duplicate MC options | 1. Review with MC 2. Check all 4 options | All options have unique text | Fixed |
| REG-02 | Missing correct answer in MC | 1. Review 10 MC exercises | Correct answer always visible | Fixed |
| REG-03 | Untranslatable words | 1. Capture "gezellig" | Translation != original (e.g., "cozy togetherness") | Fixed |

### 10.2 Fixed in Session 47

| ID | Bug | Test Steps | Expected | Status |
|----|-----|------------|----------|--------|
| REG-04 | Dark mode colors | 1. Enable dark mode 2. Check all pages | No hardcoded white/gray colors | Fixed |
| REG-05 | Boss round hover state | 1. Dark mode 2. Hover over boss round button | Uses var(--surface-elevated), not gray-100 | Fixed |

### 10.3 Fixed in Session 49

| ID | Bug | Test Steps | Expected | Status |
|----|-----|------------|----------|--------|
| REG-06 | API 500 on empty results | 1. New user 2. Fetch word stats | No crash on countResult[0] | Fixed |
| REG-07 | Empty wordIds SQL crash | 1. No words 2. Fetch next sentence | Guarded inArray(), no crash | Fixed |
| REG-08 | Race condition daily progress | 1. Rapid requests first of day | Single record created | Fixed |

### 10.4 Fixed in Session 45

| ID | Bug | Test Steps | Expected | Status |
|----|-----|------------|----------|--------|
| REG-09 | Mixed languages in MC | 1. Review bidirectional capture 2. Check MC options | All options in user's native language | Fixed |
| REG-10 | Due count unrealistic | 1. User with 900+ words 2. Check due count | Shows ~15-40 (capped), not 700+ | Fixed |
| REG-11 | Session never completes | 1. Start session 2. Review 25 words | Session ends at 25 (MAX_SESSION_WORDS) | Fixed |

---

## Section 11: Performance Tests

### 11.1 Response Times

| ID | Test Case | Threshold | Measurement |
|----|-----------|-----------|-------------|
| PT-01 | Gamification state fetch | < 500ms | Time from request to response |
| PT-02 | Event submission | < 300ms | Time from click to UI update |
| PT-03 | Bingo update reflection | < 1s | Time from event to bingo square update |
| PT-04 | Boss round word fetch | < 1s | Time to show first word |

### 11.2 Scale Tests

| ID | Test Case | Steps | Expected |
|----|-----------|-------|----------|
| SC-01 | User with 500+ words | 1. Load progress page | All data loads without timeout |
| SC-02 | Many bingo updates | 1. Complete multiple squares rapidly | All update correctly, no duplicates |

---

## Execution Checklist

### Pre-Flight

- [ ] Test accounts available and confirmed
- [ ] Production deployment current (check version)
- [ ] Dark mode tested on iOS Safari
- [ ] Clear browser cache if needed

### Test Execution

- [ ] **Section 1**: Daily Progress (5 tests)
- [ ] **Section 2**: Streak System (9 tests)
- [ ] **Section 3**: Bingo Board (17 tests)
- [ ] **Section 4**: Boss Round (15 tests)
- [ ] **Section 5**: Gamification Events (8 tests)
- [ ] **Section 6**: Feedback System (9 tests)
- [ ] **Section 7**: Integration Tests (6 tests)
- [ ] **Section 8**: Edge Cases (10 tests)
- [ ] **Section 9**: Persona Scenarios (14 tests)
- [ ] **Section 10**: Bug Regressions (11 tests)
- [ ] **Section 11**: Performance (6 tests)

### Post-Test

- [ ] All critical (✅) tests passed
- [ ] No new regressions found
- [ ] Bug report filed for any failures
- [ ] Test results documented

---

## Appendix: API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/gamification/state` | GET | Fetch daily, streak, bingo state |
| `/api/gamification/event` | POST | Submit gamification events |
| `/api/gamification/boss-round` | GET | Get Boss Round words |
| `/api/gamification/boss-round` | POST | Submit Boss Round results |
| `/api/feedback` | POST | Submit user feedback |

---

*Test plan created: 2026-01-21*
