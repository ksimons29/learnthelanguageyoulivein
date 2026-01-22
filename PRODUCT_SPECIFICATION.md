# LLYLI Product Specification

**Version:** 1.0 MVP
**Last Updated:** 2026-01-21
**Status:** Pre-Release (Active Development)

---

## Executive Summary

**LLYLI (Learn the Language You Live In)** is a language learning application designed for people living in immersion environments who encounter useful vocabulary daily but fail to retain it.

### The Core Concept

LLYLI transforms real-life language encounters into lasting vocabulary knowledge through:
1. **Frictionless capture** - Save words you encounter in under 2 seconds
2. **Dynamic sentence generation** - AI creates unique practice sentences combining your words
3. **Scientifically-optimized review** - FSRS-4.5 algorithm schedules reviews at the optimal moment
4. **Native audio** - High-quality TTS pronunciation for every word
5. **Personal memory context** - Record WHERE and WHEN you learned each phrase

### The Metaphor

LLYLI is your **digital language notebook** - a premium Moleskine-style journal where you collect, organize, and master the language around you.

---

## Problem Statement

### Why Existing Solutions Fail

| Problem | Evidence | LLYLI Solution |
|---------|----------|----------------|
| Only 36% continue using SRS apps | Research data | Gamification + short sessions + clear "done for today" |
| Too much work to create cards | 75% of learners don't capture words at all (survey) | 2-second auto-capture with translation + audio |
| Generic vocabulary lists | Apps teach "schilpad" not real-life words | User captures their OWN words from daily life |
| Repetitive content | Fixed example sentences lose novelty | AI generates NEW sentences each review - never repeats |
| Wrong regional variant | Multiple users abandoned Duolingo for Brazilian Portuguese | European Portuguese (pt-PT) support |
| No review structure | "I save them but never review" (25% of respondents) | FSRS automatic scheduling |

### Target Users (Personas)

**Sofia - The Immersed Professional**
- Dutch UX designer, 32, living in Lisbon
- Learning Portuguese (Portugal)
- "I think I'll remember it but don't write it down"
- Needs: Frictionless capture + automatic review

**Ralf - The Ambitious Goal-Setter**
- Business developer learning Swedish
- Goal: "3 new words per day - 1000 per year"
- "Without a motivating structure it is not doable"
- Needs: Gamification + progress tracking

**Maria - The Frustrated App User**
- Expat who tried multiple apps
- Abandoned Duolingo for wrong regional variant
- Needs: Correct EU Portuguese + real-life vocabulary

---

## Complete Feature Specification

### 1. Word Capture

**Purpose:** Enable instant vocabulary capture from real-life encounters.

#### Core Functionality
| Feature | Description | Status |
|---------|-------------|--------|
| Text input | Type word/phrase in either language | ✅ Implemented |
| Auto language detection | Detects if input is native or target language | ✅ Implemented |
| Auto translation | GPT-4o-mini translates to the other language | ✅ Implemented |
| Auto categorization | AI assigns category (food, work, social, etc.) | ✅ Implemented |
| TTS audio | OpenAI generates native pronunciation | ✅ Implemented |
| Memory context | Optional: WHERE, WHEN, situation tags, notes | ✅ Implemented |

#### Categories
- `food_dining` - Restaurant, cooking, groceries
- `work` - Office, meetings, career
- `daily_life` - Home, routines, errands
- `social` - Friends, conversation, greetings
- `shopping` - Stores, purchases, prices
- `transport` - Travel, directions, vehicles
- `health` - Medical, fitness, wellbeing
- `other` - Default fallback

#### Memory Context Fields
| Field | Description | Optional |
|-------|-------------|----------|
| Location hint | "at the bakery", "in the metro" | Yes |
| Time of day | Auto-detected: morning/afternoon/evening/night | Yes |
| Situation tags | Up to 3: Nervous, Alone, Friends, Work, etc. | Yes |
| Personal note | Free-form memory note | Yes |

#### Performance Target
- Capture to confirmation: < 3 seconds

---

### 2. Sentence Review System

**Purpose:** Practice words in varied, contextual sentences rather than isolated flashcards.

#### How It Works
1. System identifies words due for review (retrievability < 90%)
2. AI generates sentences combining 2-4 related due words
3. Each sentence is unique - never repeated
4. Maximum 10 words per sentence (cognitive load limit)
5. User practices via fill-in-blank, multiple choice, or type translation

#### Exercise Types
| Type | Difficulty | When Used |
|------|------------|-----------|
| Multiple choice | Easiest | New words, struggling words (0-1 correct sessions) |
| Fill-in-blank | Medium | Building familiarity (1-2 correct sessions) |
| Type translation | Hardest | Near mastery (2+ correct sessions) |

#### Sentence Generation
- Uses GPT-4o-mini to create natural sentences
- Words grouped by category for semantic coherence
- Pre-generated in background (7-day lookahead)
- Each word combination used exactly once

---

### 3. FSRS Spaced Repetition Algorithm

**Purpose:** Schedule reviews at the scientifically optimal time for retention.

#### The Algorithm (FSRS-4.5)
LLYLI uses the Free Spaced Repetition Scheduler, a 2023 machine learning-based algorithm that outperforms traditional SRS systems by 36 years of research advancement.

**Core Parameters:**
| Parameter | Description | Initial Value |
|-----------|-------------|---------------|
| Difficulty (D) | How hard to increase memory strength | 5.0 |
| Stability (S) | Days until 90% recall probability | 1.0 |
| Retrievability (R) | Current probability of recall | 1.0 |

**The Forgetting Curve:**
```
R(t) = (1 + t/(9·S))^(-1)

Where:
  R = retrievability (probability of recall)
  t = days since last review
  S = stability (memory strength)
```

**Rating Scale:**
| Rating | Meaning | Effect on Stability |
|--------|---------|---------------------|
| Again (1) | Complete blackout, wrong | Decreases significantly |
| Hard (2) | Correct but struggled | Increases slightly |
| Good (3) | Correct, normal effort | Increases normally |
| Easy (4) | Trivially easy | Increases significantly |

#### Mastery System
A word reaches **"Ready to Use"** status after:
- 3 correct recalls
- On 3 SEPARATE sessions (not same-day cramming)
- Sessions defined as >2 hours apart

If a mastered word is answered incorrectly, the counter resets to 0.

---

### 4. Notebook (Word Browser)

**Purpose:** Browse, organize, and manage your personal vocabulary.

#### Features
| Feature | Description | Status |
|---------|-------------|--------|
| Category grid | Visual overview of words by category | ✅ Implemented |
| Category counts | Shows total and due counts per category | ✅ Implemented |
| Inbox | Uncategorized/new words | ✅ Implemented |
| Word detail sheet | Full word info, audio, edit, delete | ✅ Implemented |
| Global search | Search across all words | ✅ Implemented |
| Memory context display | Shows WHERE/WHEN if captured | ✅ Implemented |
| Attention section | Words you're struggling with (high lapse count) | ✅ Implemented |
| Mastery badges | Visual status: Learning / Learned / Ready to Use | ✅ Implemented |

---

### 5. Progress Dashboard

**Purpose:** Visualize learning progress and maintain motivation.

#### Metrics Displayed
| Metric | Description |
|--------|-------------|
| Words captured | Total vocabulary size |
| Due today | Words needing review |
| Mastery distribution | Learning / Learned / Ready to Use counts |
| Ready to use | Words with 3+ consecutive correct sessions |
| Activity heatmap | Calendar view of review activity |
| Forecast chart | Predicted due words over time |
| Retention streak | Consecutive days with completed reviews |
| Struggling words | Words with highest lapse counts |

---

### 6. Gamification System

**Purpose:** Maintain engagement through achievement-oriented game mechanics.

#### Daily Goal
- Default target: 10 reviews per day
- Clear "Done for today" completion screen
- Optional "Learn new words" after goal completion

#### Streak System
- Consecutive days completing daily goal
- Streak freeze: 1 automatic protection against missed day
- Visual streak counter on home screen

#### Bingo Board (3x3)
Daily challenges tied to learning behaviors:
| Square | Trigger |
|--------|---------|
| Review 5 words | Complete 5 reviews |
| 3 correct in a row | Streak of correct answers |
| Fill-in-blank | Complete one fill-blank exercise |
| Multiple choice | Complete one multiple choice |
| Add memory context | Capture word with context |
| Review work word | Review word in "work" category |
| Review social word | Review word in "social" category |
| Master a word | Reach 3 consecutive correct |
| Finish session | Complete daily goal |

#### Boss Round
- Unlocks after daily goal completion
- 60-90 second timed challenge
- 5 words with highest lapse count (struggling words)
- Multiple choice and fill-blank only
- Score tracking and personal best

---

### 7. User Onboarding

**Purpose:** Get users to first value quickly.

#### Flow
1. **Language selection** - Choose native + target language
2. **First capture** - Add at least 3 words (experience the loop)
3. **Completion** - Onboarding marked complete

#### Starter Vocabulary
New users receive 12 starter words per language:
- 2 work category words
- 10 common everyday words
- Include some with `initialLapseCount` for gamification testing

---

### 8. Authentication & User Management

**Provider:** Supabase Auth

#### Supported Methods
- Email/password signup and login
- Email confirmation required
- Password reset via email

#### User Profile Data
| Field | Description |
|-------|-------------|
| Native language | User's first language |
| Target language | Language being learned |
| Onboarding completed | Boolean flag |

---

## Supported Languages

### Translation Directions (MVP)

| Direction | Source | Target | Status |
|-----------|--------|--------|--------|
| EN → PT-PT | English | Portuguese (Portugal) | ✅ Active |
| EN → SV | English | Swedish | ✅ Active |
| NL → EN | Dutch | English | ✅ Active |

### Regional Variant Enforcement

For European Portuguese (pt-PT):
- Uses "tu" forms (not "você")
- European spelling: "facto" not "fato", "autocarro" not "ônibus"
- Explicitly NOT Brazilian Portuguese

### TTS Voice Selection
| Language | OpenAI Voice |
|----------|--------------|
| English | alloy |
| Portuguese | nova |
| Swedish | nova |
| German | onyx |
| French | nova |
| Spanish | nova |
| Dutch | nova |

---

## Design System (Moleskine)

### Core Concept
LLYLI uses a "premium notebook" aesthetic inspired by Moleskine journals. Every screen is a page. Every interaction feels crafted.

### Color Palette
| Token | Hex | Usage |
|-------|-----|-------|
| Surface Notebook | #F8F3E7 | Page backgrounds (cream paper) |
| Surface Page | #FFFFFF | Card surfaces (white paper) |
| Accent Ribbon | #E85C4A | Primary CTA (coral) |
| Accent Nav | #0C6B70 | Navigation, secondary (teal) |
| Text Heading | #1D262A | Headings |
| Text Body | #2D3436 | Body text |
| Text Muted | #6C7275 | Secondary text |

### Design Rules

#### The Ribbon Rule
**Coral (#E85C4A) appears as ONE dominant element per screen maximum.**
- Home: Capture button is coral
- Review: Reveal button is coral
- Capture: Save button is coral

#### The Binding Rule
**Cards have rounded corners on right, square on left.**
- Creates the Moleskine page-edge aesthetic
- Binding strip uses dashed stitch pattern

#### The Typography Rule
**Headings are serif, UI is sans-serif.**
- Headings: Libre Baskerville
- Body/UI: Inter

---

## Technical Architecture

### Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| UI Components | shadcn/ui + custom Moleskine components |
| State | Zustand (auth, words, review, gamification stores) |
| Database | PostgreSQL via Supabase |
| ORM | Drizzle |
| Auth | Supabase Auth |
| AI Translation | OpenAI GPT-4o-mini |
| Audio | OpenAI TTS |
| Algorithm | ts-fsrs v5.2.3 (FSRS-4.5) |
| Hosting | Vercel |
| Mobile | Capacitor (iOS wrapper) |

### Performance Targets
| Metric | Target |
|--------|--------|
| Word capture latency | < 3 seconds |
| Sentence generation | < 3 seconds (pre-cached) |
| Audio playback start | < 1 second |
| Page load (3G) | < 2 seconds |

---

## What LLYLI Does NOT Do

### Explicitly Avoided (By Design)

| Anti-Pattern | Why Avoided |
|--------------|-------------|
| Isolated word-pair flashcards | Artificial, impedes real-world recall |
| Fixed review intervals (1/3/7 days) | Doesn't adapt to individual forgetting |
| Sentences > 10 words | Cognitive overload |
| Repeated example sentences | Novelty loss kills engagement |
| Massed practice (cramming) | Doesn't improve forgetting rate |
| Heavy currency/store systems | Distracts from learning |
| Leaderboards | Stressful, not everyone's motivator |
| Brazilian Portuguese (pt-BR) | Primary users need European Portuguese |

### Out of Scope for MVP

| Feature | Status |
|---------|--------|
| Stripe payments | Not started |
| Voice input (speech-to-text) | v2.0 |
| Camera input (OCR) | v2.0 |
| Native iOS Share Extension | v2.0 |
| iOS Widgets | v2.0 |
| Browser extension | v1.1 |
| Social features | Future |
| Chat/email integration | Future |
| Word pack recommendations | Future |

### Platform Limitations

| Limitation | Reason |
|------------|--------|
| Web-first (not native) | Enables rapid iteration |
| Same database for dev/prod | MVP simplicity |
| No offline-first architecture | PWA with limited offline |
| 8 languages maximum | TTS quality varies |

---

## Success Metrics (Targets)

| Metric | Target |
|--------|--------|
| 7-day word retention | ≥ 85% |
| Session completion rate | ≥ 80% |
| 30-day user retention | ≥ 40% |
| Words captured per user per week | ≥ 10 |
| Average session duration | 10-20 minutes |
| Feature adoption | 30% daily capture usage |
| Error rate | < 5% |

---

## Quick Reference for Development

### Commands
```bash
cd web && npm run dev     # Start dev server
npm run build             # Production build
npm run test:run          # Run tests
npm run db:push           # Push schema changes
```

### Test Accounts
| Account | Direction |
|---------|-----------|
| test-en-pt@llyli.test | EN→PT |
| test-en-sv@llyli.test | EN→SV |
| test-nl-en@llyli.test | NL→EN |

Password: `TestPassword123!`

### Key Documentation
| Document | Purpose |
|----------|---------|
| CLAUDE.md | Development instructions |
| findings.md | Active bug tracking |
| MVP_AUDIT.md | Feature verification checklist |
| design-system.md | UI component specs |
| implementation_plan.md | Architecture details |

---

## Document History

| Date | Change |
|------|--------|
| 2026-01-21 | Initial comprehensive specification created |

---

*This document serves as the single source of truth for LLYLI's product definition. For implementation details, see the engineering documentation. For design specifications, see the design system documentation.*
