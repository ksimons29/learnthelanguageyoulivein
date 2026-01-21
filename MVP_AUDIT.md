# MVP Feature Audit - LLYLI

## Purpose

This document defines EVERY feature that must work for MVP launch. Each feature has:
- Acceptance criteria (what "working" means)
- Test steps (how to verify)
- Current status (untested/pass/fail)
- Blocking issues (linked to findings.md)

**Nothing ships until every critical feature passes.**

---

## User Flows That Must Work

### Flow 1: New User Onboarding
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1.1 | Open app for first time | See welcome/onboarding screen | ⬜ Untested |
| 1.2 | Sign up with email | Account created, email confirmed | ⬜ Untested |
| 1.3 | Select native language | Language saved to profile | ⬜ Untested |
| 1.4 | Select target language | Language pair configured | ⬜ Untested |
| 1.5 | Complete onboarding | Redirected to Today page | ⬜ Untested |

### Flow 2: Phrase Capture
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 2.1 | Tap Capture tab | See capture input screen | ⬜ Untested |
| 2.2 | Enter phrase in target language | Phrase accepted | ⬜ Untested |
| 2.3 | Submit phrase | Auto-translation happens | ⬜ Untested |
| 2.4 | See translation | Correct translation shown in NATIVE language | ⬜ Untested |
| 2.5 | Confirm/save phrase | Phrase saved to database | ⬜ Untested |
| 2.6 | Audio generated | TTS audio created and playable | ⬜ Untested |
| 2.7 | Return to Today | "Captured Today" shows new phrase | ❌ **FAIL** - Finding #8 |

### Flow 3: Basic Flashcard Review (Single Word)
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 3.1 | Tap Review tab | See review screen | ⬜ Untested |
| 3.2 | See flashcard front | Shows word in TARGET language (Portuguese) | ⬜ Untested |
| 3.3 | Tap to reveal | Shows translation in NATIVE language (English) | ⬜ Untested |
| 3.4 | Hear audio | TTS plays target language pronunciation | ⬜ Untested |
| 3.5 | Rate recall (Again/Hard/Good/Easy) | Buttons visible and work | ⬜ Untested |
| 3.6 | Submit rating | FSRS updates card schedule | ⬜ Untested |
| 3.7 | Next card shown | Different card appears | ⬜ Untested |
| 3.8 | Complete session | Summary shown, stats updated | ⬜ Untested |

### Flow 4: Sentence Review (Multi-Word Context)
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 4.1 | Access sentence review | Sentence generation UI shown | ⬜ Untested |
| 4.2 | See word picker | Words shown in NATIVE language (English) | ❌ **FAIL** - Finding #1, #2, #6a |
| 4.3 | Select words | Can select 2+ words | ❌ **FAIL** - Finding #6 (capped at 2) |
| 4.4 | Generate sentence | Sentence created with selected words | ⬜ Untested |
| 4.5 | See fill-in-blank | Correct word highlighted as blank | ❌ **FAIL** - Finding #4, #5a |
| 4.6 | See multiple choice | Options in NATIVE language (English) | ❌ **FAIL** - Finding #5, #7b |
| 4.7 | Correct answer available | Right answer exists in options | ❌ **FAIL** - Finding #7 |
| 4.8 | Submit answer | Correct feedback given | ❌ **FAIL** - Finding #4 |
| 4.9 | Rate recall | FSRS updates for reviewed words | ⬜ Untested |

### Flow 5: Notebook Browser
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 5.1 | Tap Notebook tab | See notebook overview | ⬜ Untested |
| 5.2 | See word count | Correct total shown | ⬜ Untested |
| 5.3 | See mastered count | Correct mastered count | ⬜ Untested |
| 5.4 | See due today | Correct due count | ❌ **FAIL** - Finding #10 (conflicts with Today) |
| 5.5 | Tap Inbox | See untagged phrases | ❌ **FAIL** - Finding #9 |
| 5.6 | See categories | All categories with counts | ⬜ Untested |
| 5.7 | Tap category | See words in that category | ⬜ Untested |
| 5.8 | Search words | Results match query | ⬜ Untested |

### Flow 6: Today Dashboard
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 6.1 | Tap Today tab | See Today dashboard | ⬜ Untested |
| 6.2 | See "Due Today" count | Matches Notebook due count | ❌ **FAIL** - Finding #10 |
| 6.3 | See "Captured Today" | Shows words captured today | ❌ **FAIL** - Finding #8 |
| 6.4 | Tap "Review Due" | Goes to review with due cards | ⬜ Untested |
| 6.5 | See progress stats | Accurate daily/weekly stats | ⬜ Untested |

### Flow 7: Progress Tracking
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 7.1 | Tap Progress tab | See progress dashboard | ⬜ Untested |
| 7.2 | See streak | Correct streak count | ⬜ Untested |
| 7.3 | See weekly chart | Accurate review data | ⬜ Untested |
| 7.4 | See mastery breakdown | Correct distribution | ⬜ Untested |
| 7.5 | See total stats | Words, reviews, accuracy | ⬜ Untested |

### Flow 8: Audio Playback
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 8.1 | View word with audio | Audio icon visible | ⬜ Untested |
| 8.2 | Tap audio icon | Audio plays | ⬜ Untested |
| 8.3 | Audio quality | Clear pronunciation | ⬜ Untested |
| 8.4 | Audio in review | Plays during flashcard | ⬜ Untested |
| 8.5 | Audio offline | Cached audio works offline | ⬜ Untested |

### Flow 9: Authentication
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 9.1 | Login with email | Successful authentication | ⬜ Untested |
| 9.2 | Session persistence | Stay logged in across visits | ⬜ Untested |
| 9.3 | Logout | Successful logout, data cleared | ⬜ Untested |
| 9.4 | Password reset | Reset email sent and works | ⬜ Untested |

### Flow 10: Settings & Profile
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 10.1 | Access settings | Settings page loads | ⬜ Untested |
| 10.2 | Change language pair | New pair saved and applied | ⬜ Untested |
| 10.3 | View profile | Correct user info shown | ⬜ Untested |
| 10.4 | Delete account | Account and data removed | ⬜ Untested |

---

## Feature Status Summary

| Feature | Steps | Pass | Fail | Untested |
|---------|-------|------|------|----------|
| Onboarding | 5 | 0 | 0 | 5 |
| Phrase Capture | 7 | 0 | 1 | 6 |
| Basic Flashcard Review | 8 | 0 | 0 | 8 |
| Sentence Review | 9 | 0 | 7 | 2 |
| Notebook Browser | 8 | 0 | 2 | 6 |
| Today Dashboard | 5 | 0 | 2 | 3 |
| Progress Tracking | 5 | 0 | 0 | 5 |
| Audio Playback | 5 | 0 | 0 | 5 |
| Authentication | 4 | 0 | 0 | 4 |
| Settings & Profile | 4 | 0 | 0 | 4 |
| **TOTAL** | **60** | **0** | **12** | **48** |

**Current state: 0% passing, 20% failing, 80% untested**

---

## Blocking Issues (from findings.md)

| Finding | Blocks | Impact |
|---------|--------|--------|
| #1 | Flow 4.2 | Can't select words |
| #2 | Flow 4.2 | Translations exist but not shown |
| #4 | Flow 4.5, 4.8 | Wrong word highlighted |
| #5 | Flow 4.6 | Options in wrong language |
| #5a | Flow 4.5 | Wrong answer marked correct |
| #6 | Flow 4.3 | Limited to 2 words |
| #7 | Flow 4.7 | Correct answer missing |
| #7b | Flow 4.6 | Mixed language options |
| #8 | Flow 2.7, 6.3 | Captured Today resets |
| #9 | Flow 5.5 | Inbox empty despite count |
| #10 | Flow 5.4, 6.2 | Due counts don't match |

---

## Testing Protocol

### Before ANY Feature Is "Done"

```bash
# 1. Automated tests
cd web && npm run build && npm run test:run

# 2. Manual E2E (REQUIRED, NOT OPTIONAL)
# Use Playwright MCP to:
# - Complete the full flow as documented above
# - Verify each step passes
# - Screenshot evidence for non-trivial changes

# 3. Multi-language verification
# Test with:
# - test-en-pt@llyli.test (English → Portuguese)
# - test-en-sv@llyli.test (English → Swedish)
# - test-nl-en@llyli.test (Dutch → English)
```

### Definition of "Pass"

A feature step PASSES only when:
1. Action can be completed
2. Expected result matches actual result
3. No console errors
4. Works across all language pairs
5. Works on mobile viewport

### Definition of "Fail"

A feature step FAILS when:
1. Action cannot be completed, OR
2. Expected result doesn't match, OR
3. Console errors occur, OR
4. Only works for some language pairs, OR
5. Broken on mobile

---

## MVP Launch Criteria

**All of the following must be true:**

- [ ] All 60 feature steps pass
- [ ] All 15 findings fixed with tests
- [ ] Build passes
- [ ] All unit tests pass
- [ ] E2E verification complete for every flow
- [ ] No P0 or P1 bugs open
- [ ] Multi-language pair testing complete
- [ ] Mobile viewport verified

**Until then, this is NOT MVP-ready.**

---

## Document Info
- **Created:** 2026-01-21
- **Purpose:** Comprehensive MVP readiness tracking
- **Status:** Active - testing in progress
