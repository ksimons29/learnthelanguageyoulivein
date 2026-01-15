# Product Requirements Document: LLYLI MVP

## Overview

LLYLI is a mobile app that converts user-captured words into lasting vocabulary knowledge through dynamic sentence-based spaced repetition.

**MVP Goal:** Validate that dynamic sentence generation combined with FSRS scheduling delivers measurably better retention and engagement than static flashcard approaches.

## Problem Statement

Language learners in immersive environments encounter useful vocabulary daily but fail to retain it. Existing solutions require manual effort (flashcard creation), present repetitive content (same example sentences), or follow irrelevant curricula. Research shows:

- Only 36% of learners continue using assigned SRS tools (Section 2, Research Notes)
- Isolated word-pair memorization is artificial and impedes recall (Section 7, Research Notes)
- Fixed example sentences lose novelty and reduce engagement (Section 2.1.A, Research Notes)

## Solution

LLYLI addresses these failures through:

1. **Frictionless word capture** via text input with auto language detection
2. **Dynamic sentence generation** combining multiple due words into novel, single-use sentences
3. **Adaptive scheduling** using FSRS algorithm based on individual recall probability
4. **Strict mastery criteria** requiring 3 correct recalls before reducing review frequency

---

## MVP Scope

### In Scope

| Component | Requirement | Research Basis |
|-----------|-------------|----------------|
| Word capture | Text input, auto-detect source/target language | User requirement |
| Sentence generation | LLM generates sentences combining 2-4 related due words | Section 2.1.A: 4-6x speed increase |
| Sentence constraints | Max 10 words per sentence | Section 5: longer sentences overwhelm |
| Scheduling | FSRS algorithm, recall-probability-based | Section 3.1: avoid fixed intervals |
| Mastery | 3 correct recalls on separate occasions to graduate | Section 6.1: 64%→87% retention |
| Feedback | Immediate corrective feedback on every response | Section 6.2: 11% retention boost |
| Session flow | Daily review with "Done for today" completion screen | Section 2.1.E: habit formation |
| Session length | Target 15-20 minutes, natural stopping points | Section 3.2: short spaced sessions |

### Out of Scope (Post-MVP)

- Voice input (speech-to-text word capture)
- Camera input (OCR word capture from photos)
- Browser extension
- Desktop app
- Chat/email integration
- Word pack recommendations
- User preference learning for sentence style

### Explicitly Avoided

| Anti-pattern | Why | Reference |
|--------------|-----|-----------|
| Isolated word-pair flashcards | Artificial, impedes recall | Section 7 |
| Fixed review intervals (1/3/7 days) | Doesn't adapt to individual forgetting | Section 3.1 |
| Sentences >10 words | Cognitive overload, reduces motivation | Section 5 |
| Passive restudying | Active retrieval required for retention | Section 6.2 |
| Repeated example sentences | Novelty loss kills engagement | Section 2.1.A |
| Massed practice (cramming) | Doesn't improve forgetting rate | Section 7 |

---

## Functional Requirements

### 1. Word Capture

**FR-1.1** User can input a word via text field on home screen.

**FR-1.2** System auto-detects whether input is in source language (user's native) or target language (learning).

**FR-1.3** System stores word with: original text, detected language, translation, timestamp, category tag (auto-assigned or user-selected).

**FR-1.4** System generates audio pronunciation for target language word using TTS.

### 2. Sentence Generation

**FR-2.1** When user starts review session, system identifies all words due for review (recall probability below threshold per FSRS).

**FR-2.2** System groups due words by category/relatedness.

**FR-2.3** System calls LLM to generate sentences containing 2-4 related due words per sentence.

**FR-2.4** Generated sentences must be ≤10 words.

**FR-2.5** Each sentence is used exactly once, never repeated in future reviews.

**FR-2.6** System validates generated sentence contains target words before presenting.

### 3. Review Session

**FR-3.1** Session presents sentence with target word(s) blanked or highlighted based on exercise type.

**FR-3.2** User provides answer (type translation, select correct option, or type missing word).

**FR-3.3** System provides immediate feedback: correct/incorrect with correct answer shown.

**FR-3.4** System updates FSRS parameters for each reviewed word based on recall success.

**FR-3.5** Session continues until all due words reviewed or 20-minute soft limit reached.

**FR-3.6** Session ends with "Done for today" screen showing words reviewed and streak.

**FR-3.7** Optional "Learn new words" button available after daily review complete for motivated users.

### 4. Scheduling (FSRS Implementation)

**FR-4.1** System implements FSRS-4.5 algorithm (or latest stable version).

**FR-4.2** Each word tracks: difficulty, stability, retrievability, last review date, review count.

**FR-4.3** System calculates next review date based on target retrievability (default 90%).

**FR-4.4** Words with retrievability below threshold appear in next review session.

**FR-4.5** Successful recall increases stability; failed recall decreases it and schedules sooner review.

### 5. Mastery Criteria

**FR-5.1** Word requires 3 correct recalls on separate sessions to reach "learned" status.

**FR-5.2** "Learned" words continue in FSRS but with extended intervals.

**FR-5.3** Failed recall on "learned" word resets correct-recall counter to 0.

### 6. User Onboarding

**FR-6.1** User selects native language and target language on first launch.

**FR-6.2** Brief tutorial shows word capture flow (3 screens max).

**FR-6.3** User adds first word to experience full loop before tutorial ends.

---

## Non-Functional Requirements

**NFR-1** Word capture to confirmation: <2 seconds.

**NFR-2** Sentence generation latency: <3 seconds per sentence.

**NFR-3** App must function offline for reviews (pre-generate sentences when online).

**NFR-4** Data sync when connectivity restored.

**NFR-5** Support iOS 15+ and Android 10+.

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| 7-day word retention | ≥85% | Correct recall rate on words due at day 7 |
| Session completion rate | ≥80% | Sessions completed vs. started |
| 30-day user retention | ≥40% | Users active at day 30 vs. day 1 |
| Words captured per user per week | ≥10 | Average across active users |
| Average session duration | 10-20 min | Time from session start to completion |

---

## Validation Unknowns

From Research Notes Section 8, these gaps require validation:

| Unknown | Validation Approach |
|---------|---------------------|
| No evidence for self-captured personalized phrases | A/B test retention: user-captured words vs. standardized vocabulary |
| Transition to spontaneous conversation unproven | Qualitative interviews on real-world usage confidence |
| Compliance difficult even with minimal time requirements | Track session completion and 30-day retention in production |

---

## Dependencies

| Dependency | Risk | Mitigation |
|------------|------|------------|
| LLM API for sentence generation | Latency, cost, quality | Pre-generate sentences in batch; quality validation before display |
| FSRS implementation | Algorithm complexity | Use open-source FSRS library (ts-fsrs or fsrs-rs) |
| TTS for pronunciation | Quality varies by language | Evaluate multiple providers per target language |

---

## Roadmap Context

**MVP (This Document):** Text input → LLM sentences → FSRS scheduling → 3-correct mastery

**V1.1:** Voice input (speech-to-text capture)

**V1.2:** Camera input (OCR capture from photos)

**V2.0:** Personalization engine. System learns user vocabulary patterns. Recommends related word packs. Adapts sentence style to user preferences.