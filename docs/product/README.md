# LLYLI Product Documentation

This folder contains all product-related documentation for LLYLI.

---

## Quick Links

| Document | Description | Audience |
|----------|-------------|----------|
| [EXECUTIVE_SUMMARY.md](./EXECUTIVE_SUMMARY.md) | One-page product overview | Stakeholders, quick onboarding |
| [USER_GUIDE.md](./USER_GUIDE.md) | End-user help documentation | Users, support |
| [user-scenarios.md](./user-scenarios.md) | Detailed user scenarios with gamification | QA, Design |
| [MVP_LAUNCH_KIT](../launch/MVP_LAUNCH_KIT.md) | Consolidated launch preparation | Testing, QA |

---

## What is LLYLI?

**LLYLI (Learn the Language You Live In)** turns real-life phrases into lasting memories through AI-powered sentence practice and scientifically-optimized spaced repetition.

### The Core Loop

| Step | What Happens | Time |
|------|--------------|------|
| **Capture** | Type a word → get instant translation + native audio | 2 seconds |
| **Practice** | AI creates unique sentences combining your words | 10 min/day |
| **Master** | FSRS-4.5 algorithm schedules reviews at optimal timing | Automatic |

### Target Users

- **Sofia** - Immersed professional who thinks "I'll remember" but doesn't
- **Ralf** - Goal-setter wanting "3 words/day, 1000/year"
- **Maria** - Frustrated user who abandoned Duolingo for wrong regional variant

---

## Document Index

### Core Product

| Document | Purpose |
|----------|---------|
| [EXECUTIVE_SUMMARY.md](./EXECUTIVE_SUMMARY.md) | One-page overview with problem, solution, differentiators |
| [PRODUCT_SPECIFICATION.md](../../PRODUCT_SPECIFICATION.md) | **Single source of truth** - Complete technical product spec |

### User Documentation

| Document | Purpose |
|----------|---------|
| [USER_GUIDE.md](./USER_GUIDE.md) | Complete end-user help (getting started, features, FAQ) |
| [onboarding_script.md](./onboarding_script.md) | Onboarding flow walkthrough |
| [user-scenarios.md](./user-scenarios.md) | Detailed user scenarios with gamification integration |

### Science & Learning

| Document | Purpose |
|----------|---------|
| [science.md](./science.md) | The memory science behind LLYLI |

### Launch & Testing

| Document | Purpose |
|----------|---------|
| [MVP_LAUNCH_KIT.md](../launch/MVP_LAUNCH_KIT.md) | Consolidated launch preparation and test protocols |
| [GO_LIVE_PREPARATION.md](../go-live/GO_LIVE_PREPARATION.md) | Presentation content for user onboarding |

### Roadmap

| Document | Purpose |
|----------|---------|
| [v2_native_ios_roadmap.md](./v2_native_ios_roadmap.md) | Native iOS app plans |

### Feature Specifications

| Document | Purpose |
|----------|---------|
| [features/MEMORY_CONTEXT.md](./features/MEMORY_CONTEXT.md) | Memory context feature spec |
| [features/SENTENCE_DISPLAY_WORD_DETAIL.md](./features/SENTENCE_DISPLAY_WORD_DETAIL.md) | Sentence display in word detail |
| [features/EXAMPLE_SENTENCE_AT_CAPTURE.md](./features/EXAMPLE_SENTENCE_AT_CAPTURE.md) | Example sentence at capture (planned) |

---

## Key Concepts

### FSRS-4.5 Algorithm
Modern spaced repetition using the Free Spaced Repetition Scheduler (2023). 36 years more advanced than traditional algorithms.

### The 3-Session Mastery Rule
A word reaches "Ready to Use" after 3 correct recalls on 3 separate sessions (>2 hours apart). Prevents cramming.

### Dynamic Sentence Generation
AI combines 2-4 of user's words in unique sentences that never repeat. Builds real-world recall.

### Memory Context
Optional WHERE/WHEN capture creates retrieval cues based on encoding specificity research.

---

## Archived Documentation

Historical documents moved to `/docs/archive/`:
- `prd.md` - Original PRD (superseded by PRODUCT_SPECIFICATION.md)
- `vision.md` - Long-term vision (merged into other docs)
- `pr_faq.md` - Pre-launch PR/FAQ artifact
- `business_model_canvas.md` - Strategy document
- `product_guide.md` - Redundant with PRODUCT_SPECIFICATION.md

---

## Related Documentation

- [/PRODUCT_SPECIFICATION.md](../../PRODUCT_SPECIFICATION.md) - Complete technical product spec
- [/docs/design/](../design/) - Design system and wireframes
- [/docs/engineering/](../engineering/) - Technical implementation docs
- [/docs/launch/](../launch/) - Launch preparation materials

---

*Last updated: 2026-01-22*
