# LLYLI - Learn the Language You Live In

A vocabulary app for language learners living abroad. Capture words from your daily life, get instant translations with native audio, and remember them forever with spaced repetition.

**Live:** https://web-eta-gold.vercel.app

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
├── app/              # Pages: capture, review, notebook, progress
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

## Status

**Complete:** Auth, capture, translation, TTS, FSRS reviews, mastery tracking, notebook, onboarding, progress dashboard, gamification, multi-language

**In Progress:** PWA offline, iOS App Store submission

**Planned:** Stripe payments

---

**Repository:** https://github.com/ksimons29/learnthelanguageyoulivein
