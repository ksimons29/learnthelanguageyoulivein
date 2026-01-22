# LLYLI MVP Launch Kit

**Version:** 1.0
**Last Updated:** 2026-01-22
**Status:** Pre-Launch (E2E Verification Phase)

---

## Quick Reference

### URLs

| Environment | URL |
|-------------|-----|
| **Production** | https://llyli.vercel.app |
| **Repository** | https://github.com/ksimons29/learnthelanguageyoulivein |

### Test Accounts

| Account | Language Direction | Native | Target |
|---------|-------------------|--------|--------|
| `test-en-pt@llyli.test` | EN→PT | English | Portuguese (Portugal) |
| `test-en-sv@llyli.test` | EN→SV | English | Swedish |
| `test-nl-en@llyli.test` | NL→EN | Dutch | English |

**Password:** `TestPassword123!`

### Current Status

| Metric | Status |
|--------|--------|
| Build | Passing |
| Unit Tests | 228 passing |
| P0 Blockers | 0 (all fixed) |
| Features Verified | 10/70 (14%) |
| Features Untested | 59/70 (84%) |

---

## Product Overview

### What is LLYLI?

**LLYLI (Learn the Language You Live In)** turns real-life phrases into lasting memories through AI-powered sentence practice and scientifically-optimized spaced repetition.

### The Core Loop

| Step | What Happens | Time |
|------|--------------|------|
| **Capture** | Type a word → get instant translation + native audio | 2 seconds |
| **Practice** | AI creates unique sentences combining your words | 10 min/day |
| **Master** | FSRS-4.5 algorithm schedules reviews at optimal timing | Automatic |

### Key Differentiators

1. **Dynamic Sentence Generation** - AI combines user's words in sentences that NEVER repeat
2. **FSRS-4.5 Algorithm** - 2023 ML-based spaced repetition, 36 years newer than Anki
3. **Memory Context** - Record WHERE/WHEN you learned each phrase
4. **European Portuguese** - pt-PT with proper spelling and "tu" forms

### Target Users

| Persona | Description | Primary Need |
|---------|-------------|--------------|
| **Sofia** | Dutch designer in Lisbon, learning Portuguese | Frictionless capture |
| **Ralf** | Goal-setter learning Swedish, wants "3 words/day" | Gamification + structure |
| **Maria** | Frustrated user who abandoned Duolingo | Correct regional variant |

---

## User Journey Walkthrough

### Phase 1: Account & Onboarding

```
[Sign Up] → [Select Target Language] → [Select Native Language] → [Capture 3+ Words] → [Complete]
```

**Slides from GO_LIVE_PREPARATION:**

1. **Welcome** - Simple email/password sign-up
2. **Target Language** - "What language fills your days?"
3. **Native Language** - "Select your mother tongue"
4. **First Capture** - Add at least 3 words you've encountered
5. **Ready** - Starter words pre-loaded, audio available

### Phase 2: Daily Usage

```
Morning: Check Today → Review Due Words
Daytime: Capture phrases when encountered
Evening: Check progress, browse notebook
```

**Today Dashboard Shows:**
- Captured Today counter
- Due for review count
- Daily progress (X/10)
- Streak with flame
- Bingo board progress

### Phase 3: Review Session

```
[Start Review] → [See Word/Sentence] → [Recall] → [Rate (Again/Hard/Good/Easy)] → [Repeat]
```

**Exercise Types:**
- **Multiple Choice** - For new/struggling words
- **Fill-in-blank** - Building familiarity
- **Type Translation** - Near mastery

**Completion:** After 10 reviews, daily goal complete with celebration modal.

### Phase 4: Mastery Progression

| Status | Requirement |
|--------|-------------|
| **Learning** | 0-2 correct sessions |
| **Learned** | 2 correct sessions |
| **Ready to Use** | 3 correct sessions (>2 hours apart each) |

---

## EN→SV Scenario (Ralf Persona)

**Profile:** Business developer learning Swedish, goal "3 words/day, 1000/year"

### Day 1: Onboarding + Initial Capture

| Step | Action | Expected |
|------|--------|----------|
| 1 | Sign in with test-en-sv@llyli.test | Success |
| 2 | Navigate through onboarding | Language selection shown |
| 3 | Select Swedish (target) + English (native) | Saved |
| 4 | Capture "hej" | Translation "hello" + audio |
| 5 | Capture "tack" | Counter "2 of 3" |
| 6 | Capture "fika" | Counter "3 words" |
| 7 | Click "I'm done" | Navigate to completion |
| 8 | See starter words | 12 Swedish words loaded |

**End State:** 15 words (3 captured + 12 starter), 15 due for review

### Day 2: First Review Session

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open app | Today shows 15 due |
| 2 | Tap "Review Due" | Enter review mode |
| 3 | Complete 5 reviews | Progress 5/10 |
| 4 | Get 3 correct in a row | Bingo square lights |
| 5 | Complete 10 reviews | Daily goal celebration |
| 6 | Try Boss Round | 5 hardest words in 90 seconds |

**End State:** 1-day streak, 3+ bingo squares

### Days 3-7: Building Momentum

| Day | Focus | Expected Outcome |
|-----|-------|------------------|
| 3 | Maintain streak, capture work words | 2-day streak, Work category populated |
| 4 | Skip reviews (test streak freeze) | Streak preserved |
| 5 | Recovery + FSRS verification | Streak at 3 |
| 6 | Track mastery progression | 5-10 words "Learned" |
| 7 | Full verification | First "Ready to Use" words |

---

## Test Protocol Quick Reference

### Pre-Flight Commands

```bash
cd web && npm run build          # Must pass
cd web && npm run test:run       # 228 tests must pass
npx tsx scripts/test-database.js # DB connection
npx tsx scripts/test-supabase.js # Auth connection
npx tsx scripts/test-openai.js   # AI services
```

### Reset Test Accounts

```bash
cd web && npx tsx scripts/create-test-users.ts
```

This injects:
- 12 Swedish starter words for EN→SV
- 12 Portuguese starter words for EN→PT
- Work category words (Reunião/Prazo, Möte/Deadline)
- Pre-generated sentences for immediate review

### E2E Testing with Playwright MCP

1. **Navigate:** `mcp__playwright__browser_navigate` to https://llyli.vercel.app
2. **Sign in:** Fill credentials, submit
3. **Snapshot:** `mcp__playwright__browser_snapshot` at each step
4. **Verify:** Check expected UI elements present
5. **Document:** Save snapshots for evidence

### Multi-Language Verification

Test all three accounts to ensure:
- Native language shown correctly (user understands this)
- Target language shown correctly (user is learning this)
- No language mixing in UI
- Translation directions correct

---

## Feature Flows (70 Steps)

### Flow Summary

| Flow | Steps | Verified | Status |
|------|-------|----------|--------|
| 1. Onboarding | 5 | 0 | Untested |
| 2. Phrase Capture | 7 | 1 | Partial |
| 3. Basic Flashcard Review | 8 | 0 | Untested |
| 4. Sentence Review | 9 | 5 | Partial |
| 5. Notebook Browser | 8 | 2 | Partial |
| 6. Today Dashboard | 5 | 2 | Partial |
| 7. Progress Tracking | 5 | 0 | Untested |
| 8. Audio Playback | 5 | 0 | Untested |
| 9. Authentication | 4 | 0 | Untested |
| 10. Settings & Profile | 4 | 0 | Untested |
| 11. Gamification | 10 | 0 | Untested |
| **TOTAL** | **70** | **10** | **14%** |

### Critical Flows to Verify

**Priority 1 - Core Learning:**
- Flow 2: Phrase Capture (steps 2.1-2.7)
- Flow 3: Basic Flashcard Review (steps 3.1-3.8)
- Flow 4: Sentence Review (steps 4.1-4.9)

**Priority 2 - Engagement:**
- Flow 11: Gamification (steps 11.1-11.10)
- Flow 6: Today Dashboard (steps 6.1-6.5)

**Priority 3 - Navigation:**
- Flow 5: Notebook Browser (steps 5.1-5.8)
- Flow 7: Progress Tracking (steps 7.1-7.5)

---

## Known Limitations

### By Design

| Limitation | Reason |
|------------|--------|
| Web-first (not native) | Enables rapid iteration |
| 8 languages maximum | TTS quality varies |
| Same database for dev/prod | MVP simplicity |
| No offline-first | PWA with limited offline |

### Current Issues

| Issue | Priority | Impact |
|-------|----------|--------|
| Word selection capped at 2 | P2 | Enhancement |
| Distractors from user vocab | P1 | UX improvement needed |

### Out of Scope for MVP

- Stripe payments
- Voice input (speech-to-text)
- Camera input (OCR)
- Native iOS Share Extension
- Browser extension

---

## Gamification Quick Reference

### Daily Goal
- **Target:** 10 reviews
- **Celebration:** Modal when complete
- **Reward:** Boss Round unlocked

### Streak System
- Counts consecutive days completing goal
- 1 streak freeze per reset period
- Visual flame icon on Today page

### Bingo Board (3x3)

| Row 1 | Row 2 | Row 3 |
|-------|-------|-------|
| Review 5 words | 3 correct in a row | Fill-in-blank |
| Multiple choice | Add memory context | Review work word |
| Review social word | Master a word | Finish session |

### Boss Round
- Unlocks after daily goal
- 60-90 second timed challenge
- 5 words with highest lapse count
- Personal best tracking

---

## FSRS Algorithm Summary

### Core Parameters

| Parameter | Description | Initial |
|-----------|-------------|---------|
| Difficulty (D) | How hard for this user | 5.0 |
| Stability (S) | Days until 90% recall | 1.0 |
| Retrievability (R) | Current recall probability | 1.0 |

### Rating Scale

| Rating | Meaning | Effect |
|--------|---------|--------|
| Again (1) | Complete blackout | Stability decreases |
| Hard (2) | Struggled but correct | Stability slight increase |
| Good (3) | Normal effort | Stability normal increase |
| Easy (4) | Trivially easy | Stability significant increase |

### Mastery Rule (Critical)

A word reaches "Ready to Use" after:
- 3 correct recalls
- On 3 SEPARATE sessions
- Sessions >2 hours apart
- If wrong after mastery, counter resets to 0

---

## Launch Criteria Checklist

### Must Have (MVP)

- [ ] All P0 bugs fixed (current: 0)
- [x] Build passing
- [x] Unit tests passing (228)
- [ ] 70 feature steps verified
- [ ] E2E complete for all flows
- [ ] Multi-language testing (3 accounts)
- [ ] Mobile viewport verified
- [ ] Gamification tested

### Should Have (Launch)

- [ ] 85%+ feature steps passing
- [ ] User feedback incorporated
- [ ] Performance metrics baseline
- [ ] Error monitoring active

### Nice to Have (Post-Launch)

- [ ] Semantic distractors (not user vocab)
- [ ] Word selection expanded beyond 2
- [ ] Example sentences at capture

---

## Key Documentation Links

| Document | Purpose |
|----------|---------|
| [PRODUCT_SPECIFICATION.md](../../PRODUCT_SPECIFICATION.md) | Single source of truth |
| [MVP_AUDIT.md](../../MVP_AUDIT.md) | Feature verification checklist |
| [findings.md](../../findings.md) | Bug tracking |
| [USER_GUIDE.md](../product/USER_GUIDE.md) | End-user documentation |
| [EXECUTIVE_SUMMARY.md](../product/EXECUTIVE_SUMMARY.md) | Stakeholder one-pager |
| [user-scenarios.md](../product/user-scenarios.md) | Detailed user scenarios |
| [TESTING.md](../engineering/TESTING.md) | E2E testing guide |

---

## Support & Feedback

### For Users
- In-app feedback button during review
- Support email linked in settings

### For Developers
- GitHub Issues: https://github.com/ksimons29/learnthelanguageyoulivein/issues
- PROJECT_LOG.md for session history
- findings.md for bug documentation

---

*This document consolidates launch preparation materials. For detailed feature specs, see PRODUCT_SPECIFICATION.md.*
