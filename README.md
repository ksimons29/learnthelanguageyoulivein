# LLYLI - Learn the Language You Live In

A vocabulary app for language learners living abroad. Capture words from your daily life, get instant translations with native audio, and remember them forever with spaced repetition.

**Live:** https://llyli.vercel.app

## Quick Start

```bash
cd web
npm install
npm run dev     # localhost:3000
```

## Features

- **Instant Capture** - Type any word, get translation + native audio in <2 seconds
- **FSRS Algorithm** - Scientifically-proven spaced repetition (ts-fsrs)
- **Dynamic Sentences** - Fresh example sentences every review
- **3-Recall Mastery** - Words graduate after 3 correct recalls
- **Daily Bingo** - Achievable daily challenges
- **Boss Round** - 90-second speed challenge
- **Admin Dashboard** - Platform analytics and product KPIs

## The Science

LLYLI is built on peer-reviewed memory research, not guesswork.

| Principle | How We Apply It | Evidence |
|-----------|-----------------|----------|
| **Forgetting Curve** (1885) | Review timing catches you just as you start to forget | 64% → 87% retention after 3 reviews |
| **FSRS Algorithm** (2023) | Modern ML-based scheduling, not 1987 math | 36 years newer than most apps |
| **Optimal Sessions** | 5-15 min sessions, 25 word max, clear finish line | +11% retention from immediate feedback |
| **Interleaved Practice** | Dynamic sentences combine 2-4 of your words | 4-6x faster acquisition |
| **Encoding Specificity** | YOUR words from YOUR life, with context | r=0.5 novelty-learning correlation |
| **3-Recall Mastery** | Words graduate after 3 correct recalls | Proven long-term retention |

**Full details:** [docs/product/science.md](docs/product/science.md) | **In-app:** [/science](https://llyli.vercel.app/science)

## Supported Languages

| From | To | Status |
|------|-----|--------|
| English | Portuguese (PT) | Active |
| Dutch | Portuguese (PT) | Active |
| Dutch | English | Active |
| English | Swedish | Active |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind |
| Components | shadcn/ui + Moleskine design system |
| Database | PostgreSQL (Supabase) + Drizzle ORM |
| Auth | Supabase Auth |
| AI | OpenAI GPT-4o-mini + TTS |
| Algorithm | ts-fsrs v5.2.3 |
| Hosting | Vercel |

## Project Structure

```
web/src/
├── app/              # Pages: capture, review, notebook, progress, admin
├── components/       # UI components by feature
└── lib/
    ├── db/schema/    # Drizzle schemas
    ├── fsrs/         # FSRS implementation
    ├── store/        # Zustand stores
    └── supabase/     # Auth helpers

docs/
├── design/           # Moleskine design system
├── engineering/      # Architecture, testing, iOS setup
├── product/          # PRD, business model
└── go-live/          # Launch preparation
```

## Admin Dashboard

**URL:** https://llyli.vercel.app/admin

**Authentication:** Secret-based via `ADMIN_SECRET` environment variable. Enter the secret on the login page to access.

**Refresh:** Data is fetched on-demand when you load the page or click "Refresh". No automatic polling.

### Dashboard Sections

| Section | Metrics | Purpose |
|---------|---------|---------|
| **Product KPIs** | DAU, WAU, MAU, DAU/MAU stickiness, D1/D7/D30 retention, session completion rate | Track user engagement and retention |
| **Mastery Funnel** | Learning → Learned → Ready to Use counts with conversion % | Monitor 3-recall progression |
| **User Growth** | Total users, active (7d), new (7d/30d) | Track acquisition |
| **Word Captures** | Total, today, last 7 days, mastery breakdown | Content engagement |
| **Audio Health** | Success rate, with audio, pending, failed | Monitor TTS reliability |
| **Review Sessions** | Total sessions, reviews, accuracy rate, avg words/session | Learning activity |
| **Gamification** | Users with streaks, avg streak, max streak, 7+/30+ day streaks | Feature engagement |
| **Language Pairs** | Source → Target distribution with word and user counts | Usage patterns |
| **User Feedback** | Bug reports, feature requests, recent feedback (anonymous) | Product feedback |

### API Access

```bash
curl -H "x-admin-secret: YOUR_SECRET" https://llyli.vercel.app/api/admin/stats
```

### Technical Notes

- Queries run sequentially (not parallel) to avoid Supabase connection pool limits
- Feedback is displayed anonymously (no user IDs exposed)
- Retention calculated from first word capture to last review session

## Development

```bash
cd web
npm run dev          # Start dev server
npm run build        # Build (required before deploy)
npm run test:run     # Run tests
npm run db:push      # Push schema changes
```

### Deployment

Auto-deploys to Vercel on push to `main`.

```bash
cd web && vercel --prod     # Manual deploy
```

## Key Docs

| Doc | Purpose |
|-----|---------|
| [Design System](docs/design/design-system.md) | Moleskine tokens & patterns |
| [Testing Guide](docs/engineering/TESTING.md) | Test cases & accounts |
| [Implementation Plan](docs/engineering/implementation_plan.md) | Architecture reference |
| [Go-Live Prep](docs/go-live/GO_LIVE_PREPARATION.md) | Launch checklist |

## Recent Changes

### January 2026

**Audio Reliability (v51)**
- Fixed ~15% audio generation failure rate
- Added retry logic with exponential backoff (3 retries for TTS, 2 for upload)
- Fixed critical bug: TTS was using wrong language for bidirectional captures
- Added 30s timeout, 500-char limit, rate limit detection
- New retry button UI for failed audio recovery

**Admin Dashboard (v51b)**
- New `/admin` page with platform-wide analytics
- Product KPIs: DAU/WAU/MAU, D1/D7/D30 retention
- Mastery funnel visualization
- Audio health monitoring
- Anonymous user feedback display

**Gamification Testing (v50)**
- 186+ automated tests for gamification logic
- Work category starter words for all languages
- Boss Round ready from day one with preset lapse counts

**API Stability (v49)**
- Fixed 5 API vulnerabilities causing 500 errors
- Safe destructuring, empty array guards
- OpenAI retry helper with exponential backoff
- Race-safe insert pattern for gamification state

**UX Bug Fixes (v48)**
- Fixed duplicate multiple choice options
- Better handling of untranslatable words (gezellig → "cozy togetherness")
- PROJECT_LOG archiving system

**Dark Mode (v47)**
- Fixed 13 hardcoded colors breaking dark mode
- Full E2E testing of all 3 test language pairs

**Review System Overhaul (v45)**
- Fixed unrealistic due counts (700+ → ~39)
- Sentence mode now primary learning mode
- Fixed mixed languages in multiple choice
- Added active recall input (type before reveal)
- 25 words max per session (FSRS best practice)

**Self-Healing Data (v46)**
- Auto-cleanup of orphaned sentences
- Mastery progress explanation with link to /science

## Status

**Complete:** Auth, capture, translation, TTS, FSRS reviews, mastery tracking, notebook, onboarding, progress dashboard, gamification, multi-language, admin dashboard

**In Progress:** PWA offline, iOS App Store submission

**Planned:** Stripe payments

---

**Repository:** https://github.com/ksimons29/learnthelanguageyoulivein
