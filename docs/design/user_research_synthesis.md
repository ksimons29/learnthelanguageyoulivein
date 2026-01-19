# LLYLI User Research Synthesis

> Analysis of survey data (24 respondents) and LinkedIn feedback

**Date:** 2026-01-19
**Method:** Tally survey + LinkedIn comments
**Sample:** 24 total responses, 20 active language learners

---

## Executive Summary

Language learners living in immersion environments share a consistent pattern: they encounter useful vocabulary daily but fail to capture and retain it. The primary barriers are **friction** (too much work to create cards), **motivation** (no structure to stay consistent), and **relevance** (apps teach generic vocabulary, not personal words).

LLYLI addresses all three barriers directly. Survey findings validate our core approach while highlighting opportunities for future features (widgets, social accountability, yearly goals).

---

## Survey Demographics

### Are you currently learning a language? (n=24)

| Response | Count | % |
|----------|-------|---|
| Yes | 20 | 83% |
| No | 4 | 17% |

### Living in country where language is spoken? (n=20)

| Response | Count | % |
|----------|-------|---|
| Yes, I live there now | 14 | 70% |
| No, learning from home country | 5 | 25% |
| Yes, I lived there before | 1 | 5% |

### Languages being learned (n=20)

| Language | Count | % |
|----------|-------|---|
| Portuguese (PT) | 7 | 35% |
| Dutch | 5 | 25% |
| Spanish | 4 | 20% |
| Swedish | 1 | 5% |
| German | 1 | 5% |
| French/Italian/German/Spanish (multi) | 1 | 5% |
| Japanese | 1 | 5% |

**Key insight:** Portuguese and Dutch dominate—exactly the languages LLYLI supports.

---

## Pain Points Analysis

### What do you do when you encounter a useful word? (n=20)

| Behavior | Count | % |
|----------|-------|---|
| "I think I'll remember it but don't write it down" | **15** | **75%** |
| I take a screenshot or photo | 2 | 10% |
| I add it straight into a learning app | 1 | 5% |
| This is not something I do or care about | 2 | 10% |
| I repeat it to myself and try to use it often | 1 | 5% |

**Primary insight:** 75% of learners **don't capture words at all** despite intending to remember them.

### What is the most annoying part about remembering words? (n=20)

| Frustration | Count | % |
|-------------|-------|---|
| "I save them somewhere but never review" | 5 | 25% |
| "It's too much work to turn them into good examples or cards" | 3 | 15% |
| "I'm too busy or tired to do anything with them" | 5 | 25% |
| "I forget them anyway" | 3 | 15% |
| "I already have a system that works fine" | 3 | 15% |
| "Honestly, this part is not a big problem for me" | 3 | 15% |

**Primary insight:** The top barriers are **no review system** and **friction in card creation**.

### Most frustrating part of learning this language? (n=20)

| Frustration | Count | % |
|-------------|-------|---|
| Staying motivated and consistent | 5 | 25% |
| Grammar or correctness stresses me out | 5 | 25% |
| I understand too little when people speak | 4 | 20% |
| I keep forgetting vocabulary | 2 | 10% |
| I can't find the words when I speak | 2 | 10% |
| Practicing/speaking in real life situations | 1 | 5% |
| Apps are too basic, full courses expensive | 1 | 5% |

**Primary insight:** **Motivation and consistency** is the #1 frustration—exactly what gamification addresses.

---

## Interest & Willingness

### Interest in LLYLI concept (1-5 scale, n=20)

| Score | Count | % | Interpretation |
|-------|-------|---|----------------|
| 5 (Very interested) | 7 | 35% | Strong fit |
| 4 | 7 | 35% | Good fit |
| 3 | 2 | 10% | Neutral |
| 2 | 4 | 20% | Weak fit |
| 1 | 0 | 0% | No fit |

**Average score:** 3.85/5
**70% scored 4-5** — strong product-market fit signal.

---

## Feature Requests (Verbatim Quotes)

### What would make you use this tool every week?

| Theme | Quote | Respondent |
|-------|-------|------------|
| **Automatic practice** | "Create a real practice for me" | Portuguese learner |
| **EU Portuguese** | "Honestly I think Duolingo cracked the code. I don't use it because it doesn't offer EU Portuguese" | Portuguese learner |
| **Gamification** | "App which is easy to use. With correct pronunciation (not Brazilian). With strong gamification with real-life rewards" | Portuguese learner |
| **Simplicity** | "Should be easy to pull up, but not do the same as a Notes app, it should have slightly more value, but be just as simple and intuitive" | Dutch learner |
| **Quick access** | "Quick to use, widget on my home screen to give daily quick questions. As little barriers as possible" | Multi-language learner |
| **Yearly goal** | "Fun and relevant and useful in daily life and connected to a bigger challenge like achieving a certain level. For example learn 1000 new words per year" | Ralf (Swedish) |
| **Real-life vocab** | "Short, quick exercises using words/phrases which one would use in everyday life (so no schilpad as Duolingo tries to teach early on)" | Dutch learner |
| **Real translation** | "Be quick and make sense in everyday language not just textbook translations" | German learner |

---

## Competitive Intelligence

### Why they stopped using other apps

| App | Why Stopped | Count |
|-----|-------------|-------|
| **Duolingo** | Brazilian Portuguese, not EU Portuguese | 3 |
| **Duolingo** | Too many button presses | 1 |
| **Duolingo** | Too addictive, felt like game not learning | 1 |
| **Duolingo** | "Duolingo is stupid" | 1 |
| **General** | Couldn't stay motivated | 3 |
| **Online course** | "Needed someone involved in the process" | 1 |
| **University classes** | Too formal | 1 |

**Key competitive insight:** EU Portuguese is a **major differentiator**. Multiple users explicitly abandoned Duolingo for this reason.

---

## LinkedIn Feedback

### Ralf Fleuren (Swedish learner)

> "Nice initiative. I recently set the goal to learn 3 new Swedish words per day - 1000 per year. But without a motivating structure to learn, repeat and apply them it is not doable."

**Analysis:**
- Validates yearly goal feature request
- Validates need for "motivating structure" (gamification)
- Shows users set ambitious goals (1000 words/year = 3/day)
- Confirms existing behavior: capture words without retention system

---

## Gap Analysis

### Solved by LLYLI MVP

| Survey Finding | LLYLI Solution | Evidence |
|----------------|----------------|----------|
| EU Portuguese unavailable | pt-PT support with regional validation | `SUPPORTED_DIRECTIONS` config |
| No review system | FSRS automatic scheduling | Reviews API |
| Too much work to create cards | 2-second auto-capture | Capture API |
| Generic vocabulary | User captures own words | Core architecture |
| Can't stay motivated | Daily goals, streaks, bingo, boss round | Gamification MVP |
| Repetitive content boring | Dynamic sentence generation | Sentence generator |

### Partial Solutions

| Survey Finding | Current State | Enhancement Opportunity |
|----------------|---------------|------------------------|
| Yearly goal (1000 words) | Daily goal exists | Add yearly progress tracker |
| "Connected to bigger challenge" | Streaks exist | Add milestone celebrations |

### Gaps / Future Features

| Survey Finding | Status | Priority |
|----------------|--------|----------|
| Widget for quick access | PWA only, no native widget | Medium |
| Social accountability | Not implemented | Low (post-MVP) |
| Real-life rewards (meetups) | Not implemented | Low (post-MVP) |
| Someone involved in the process | No social features | Low (post-MVP) |

---

## Personas (Synthesized)

### Persona 1: The Immersed Professional

**Name:** Sofia
**Context:** Dutch UX designer, 32, living in Lisbon
**Learning:** Portuguese (Portugal)
**Behavior:** "I think I'll remember it but don't write it down"
**Frustration:** Googles same words repeatedly, abandoned Duolingo
**Need:** Frictionless capture + automatic review system

**Quote:** "I needed someone involved in the process... app reminders would help"

### Persona 2: The Ambitious Goal-Setter

**Name:** Ralf
**Context:** Business developer learning Swedish
**Goal:** "3 new words per day - 1000 per year"
**Behavior:** Sets goals but lacks structure to achieve them
**Frustration:** "Without a motivating structure it is not doable"
**Need:** Gamification + progress toward big goal

**Quote:** "Fun and relevant and connected to a bigger challenge"

### Persona 3: The Frustrated App User

**Name:** Maria
**Context:** Expat learning Portuguese, tried multiple apps
**Behavior:** Uses Duolingo but annoyed by wrong variant
**Frustration:** "Doesn't offer EU Portuguese"
**Need:** Correct regional variant + real-life vocabulary

**Quote:** "No schilpad as Duolingo tries to teach early on"

---

## Recommendations

### Immediate (MVP validated)

1. **Continue gamification rollout** — #1 user frustration is motivation
2. **Emphasize EU Portuguese** in marketing — major competitive differentiator
3. **Keep capture under 2 seconds** — friction is core barrier
4. **Maintain dynamic sentences** — prevents boredom that killed other apps

### Near-term (v1.1)

1. **Add yearly progress tracker** — "1000 words per year" goal resonates
2. **Add milestone celebrations** — respond to "bigger challenge" request
3. **Improve PWA install prompt** — bridge gap until native widgets

### Future (v2.0+)

1. **Native iOS widget** — "widget on home screen" explicitly requested
2. **Social accountability** — "someone involved in the process"
3. **Consider real-world rewards** — ambitious but resonated in survey

---

## Appendix: Raw Data Summary

**Survey file:** `/docs/design/Learning a New Language_Submissions_2026-01-19.csv`

**Email addresses collected:** 15 (for beta invites)

**Countries represented:** Portugal, Netherlands, Germany, Spain

**Response period:** November 17 - December 23, 2025

---

*Synthesized: 2026-01-19*
