# Additional Needs from Testing

> User feedback and technical bugs discovered during testing

---

## User Experience Feedback (from Koos)

### UX-01: Report Issue Button for Words (P1-High) → [#91](https://github.com/ksimons29/learnthelanguageyoulivein/issues/91)
**Need:** "Report issue with this word" option to remove problematic words from review.
**Action:** Ensure feedback button clearly indicates this is where feedback goes.
**Status:** ⬜ Open

### UX-02: Memory Context Quick Capture (P2-Medium) → [#92](https://github.com/ksimons29/learnthelanguageyoulivein/issues/92)
**Need:** Memory context section is not intuitive for quick capture.
**Problem:** Need to go back to capture; section should be open by default.
**Action:** Open memory section automatically when returning to capture.
**Status:** ⬜ Open

### UX-03: Audio Reliability (P2-Medium) → [#57](https://github.com/ksimons29/learnthelanguageyoulivein/issues/57)
**Need:** Audio often not working.
**Action:** Consider deferring to iOS native app stage.
**Status:** ⬜ Open (see also Bug #96 below)

### UX-04: App Explanation / Intro (P2-Medium) → [#93](https://github.com/ksimons29/learnthelanguageyoulivein/issues/93)
**Need:** Intro video or section explaining:
- How the app works
- What it does
- Why it's scientifically good
- How to provide feedback
- This is testing phase
**Status:** ⬜ Open

### UX-05: Notifications & Nudges (P3-Low / Post-MVP) → [#98](https://github.com/ksimons29/learnthelanguageyoulivein/issues/98)
**Need:** Progress-based notifications:
- Streak achievement → WhatsApp/email with results
- Behind on progress → nudge notification
- Calendar integration → notify to capture before appointments
**Status:** ⬜ Post-MVP

### UX-06: Notebook Word Display (P1-High) → [#94](https://github.com/ksimons29/learnthelanguageyoulivein/issues/94)
**Need:** Notebook page should always show word with sentence and translation.
**Rule:** Always target language first (word + sentence), then native language.
**Status:** ⬜ Open

---

## Technical Bugs (from Session 75 Testing)

### Bug: Gamification Data Not Reset (P1-High) → [#95](https://github.com/ksimons29/learnthelanguageyoulivein/issues/95)
**Discovered:** Fresh user shows 51/10 goal, 3-day streak after onboarding
**Problem:** `create-test-users.ts` doesn't reset gamification tables (`daily_progress`, `streak_state`, `bingo_state`, `boss_round_results`)
**Impact:** Fresh users appear to have history; testing "from scratch" impossible
**Status:** ⬜ Open

### Bug: Starter Words Have No Audio (P1-High) → [#96](https://github.com/ksimons29/learnthelanguageyoulivein/issues/96)
**Discovered:** Starter words show "No audio available" after onboarding
**Problem:** Direct DB insert bypasses `/api/words` TTS generation
**Impact:** 12 essential phrases have no pronunciation audio
**Status:** ⬜ Open

### Bug: NL→EN Has No Starter Vocabulary (P2-Medium) → [#97](https://github.com/ksimons29/learnthelanguageyoulivein/issues/97)
**Discovered:** Console shows "No starter words for en"
**Problem:** `starter-vocabulary.ts` has no English target language entries
**Impact:** Dutch→English users get empty notebook at onboarding
**Status:** ⬜ Open

---

## Priority Summary

| Priority | Issues | Description |
|----------|--------|-------------|
| **P1-High** | #91, #94, #95, #96 | Blocks core experience |
| **P2-Medium** | #92, #57, #93, #97 | Affects specific flows |
| **P3-Low** | #98 | Post-MVP enhancement |

---

*Last updated: 2026-01-22* 