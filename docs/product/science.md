# The Science Behind LLYLI

> Memory Science, Not Guesswork

LLYLI is built on peer-reviewed research in cognitive psychology and spaced repetition. This document explains the scientific principles and how we verify they're working.

## Core Principles

### 1. The Forgetting Curve (Ebbinghaus, 1885)

**Principle:** Memory fades predictably over time. Without reinforcement, you forget ~70% of new information within 24 hours.

**How LLYLI applies it:** Review timing is calculated to catch you just as you're about to forget. This strengthens memory more efficiently than random review.

**Evidence:** 64% → 87% retention improvement after 3 well-timed reviews.

### 2. FSRS Algorithm (2023)

**Principle:** Modern machine learning can predict optimal review timing better than older algorithms like SM-2 (1987).

**How LLYLI applies it:** We use FSRS (Free Spaced Repetition Scheduler), which tracks three key variables:
- **Difficulty** - How hard is this word for you personally?
- **Stability** - How strong is your memory of this word?
- **Retrievability** - What's the probability you can recall it right now?

**Evidence:** FSRS is 36 years newer than the algorithm in most flashcard apps, with measurably better retention prediction.

### 3. Optimal Session Length

**Principle:** Cognitive load theory shows that learning degrades with fatigue. Short, focused sessions outperform marathon study.

**How LLYLI applies it:**
- Sessions target 5-15 minutes (optimal range)
- Clear "done for today" finish line
- Maximum 25 words per session
- Instant feedback on each answer

**Evidence:** +11% retention from immediate feedback vs delayed feedback.

### 4. Interleaved Practice

**Principle:** Mixing different items in varied contexts creates stronger neural connections than studying each in isolation.

**How LLYLI applies it:**
- Dynamic sentences combine 2-4 of your words
- Each review shows a fresh context
- The same sentence never repeats

**Evidence:** 4-6x faster vocabulary acquisition from varied context exposure.

### 5. Adaptive Context Generation

**Principle:** Learning is most effective when practice matches real-world usage. A sentence about business meetings won't help you at the pharmacy; a casual phrase won't prepare you for a formal presentation.

**How LLYLI applies it:**
Our sentence generator analyzes YOUR vocabulary to detect context:

| Your Words | Detected Domain | Sentence Style |
|------------|-----------------|----------------|
| reunião, prazo, cliente | Work | Professional tone |
| cerveja, amigos, sábado | Social | Casual tone |
| médico, receita, farmácia | Health | Neutral tone |
| escola, filhos, buscar | Family | Everyday tone |
| NIF, finanças, documento | Bureaucracy | Formal tone |

**The key insight:** Your vocabulary IS the context signal. We don't assume you're a "business professional" or a "student" - your captured words tell us what situations matter to YOU.

**Local grounding:** Sentences reference real places and concepts from your target country:
- **Portugal:** Continente, multibanco, finanças, pastelaria
- **Sweden:** ICA, BankID, Skatteverket, fika
- **International English:** GP, pub, meeting, deadline

This creates sentences that feel like your actual life, not generic textbook examples.

### 6. Encoding Specificity

**Principle:** Memory retrieval improves when recall context matches learning context (Tulving & Thomson, 1973).

**How LLYLI applies it:**
- Capture phrases from YOUR actual life
- Optional memory context (where/when you learned it)
- Native audio for authentic pronunciation
- Personal relevance prioritized over generic vocab

**Evidence:** r = 0.5 correlation between personal novelty and learning effectiveness.

### 7. Three-Recall Mastery

**Principle:** A word isn't truly learned until it can be recalled multiple times across spaced intervals.

**How LLYLI applies it:**
- **1/3** - First correct answer (good start)
- **2/3** - Second correct (building confidence)
- **3/3** - Mastered (ready to use in real life)

After mastery, words appear less frequently with longer intervals. Incorrect answers reset progress and trigger more practice.

---

## Verification Metrics

We track these metrics in the admin dashboard to prove the science is working:

### FSRS Health
| Metric | Expected | Alert If |
|--------|----------|----------|
| Avg stability (learning) | < 7 days | - |
| Avg stability (learned) | 7-30 days | < learning |
| Avg stability (mastered) | > 30 days | < learned |
| Interval distribution | Shifts right over time | Stuck left |

### Mastery Validation
| Metric | Expected | Alert If |
|--------|----------|----------|
| Avg reviews to mastery | 3-6 | > 10 |
| Words stuck in learning | Low | > 10 (30+ days, 5+ reviews) |
| Mastered under 3 reviews | 0 | > 0 (bug!) |
| Lapse rate | Low | High = words forgotten |

### Session Quality
| Metric | Expected | Alert If |
|--------|----------|----------|
| Optimal sessions (5-15 min) | > 50% | < 30% |
| Sessions over 25 words | Low | High = overload |
| Avg words per session | 10-20 | > 25 |

### Data Quality Guardrails
| Metric | Expected | Alert If |
|--------|----------|----------|
| Intervals > 365 days | 0 | > 0 (suspicious) |
| Users with 0% accuracy | 0 | > 0 (bot or broken UI) |
| Words never reviewed (>7d) | Low | High = abandoned captures |
| Users overloaded (>50 due) | 0 | > 0 (algorithm issue) |

---

## Key Differentiators vs Competitors

| Feature | LLYLI | Duolingo | Anki |
|---------|-------|----------|------|
| Algorithm | FSRS (2023) | Proprietary | SM-2 (1987) |
| Content | Your real life | Generic curriculum | User-created |
| Sentences | Dynamic, multi-word | Fixed | Usually single word |
| Audio | Native TTS | Actor recordings | Manual upload |
| Context memory | WHERE/WHEN you learned | None | None |
| Session design | 5-15 min optimal | Gamified streaks | Unlimited |

---

## Research References

1. **Ebbinghaus, H. (1885)** - *Memory: A Contribution to Experimental Psychology* - Established the forgetting curve
2. **Pimsleur, P. (1967)** - *A Memory Schedule* - Early spaced repetition research
3. **Tulving, E. & Thomson, D. (1973)** - *Encoding Specificity and Retrieval Processes* - Context-dependent memory
4. **Rohrer, D. & Taylor, K. (2007)** - *The shuffling of mathematics problems improves learning* - Interleaved practice
5. **Open Spaced Repetition (2023)** - *FSRS Algorithm* - Modern ML-based scheduling

---

## Built On

- **ts-fsrs v5.2.3** - TypeScript implementation of FSRS
- **Open Spaced Repetition** - Peer-reviewed, open source algorithm
- **OpenAI TTS** - Native pronunciation audio

---

*Last updated: January 2026*
