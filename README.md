# LLYLI - Learn the Language You Live In

A vocabulary retention app for language learners living abroad. Unlike apps that teach generic curriculum, LLYLI captures the words *you* encounter in *your* life—from landlord texts, cafe menus, and overheard conversations—and ensures you actually remember them.

**Live:** https://web-eta-gold.vercel.app

## The Core Promise

**Add a word. Learn it forever.**

```
┌─────────────────────────────────────────────────────────────────┐
│                        THE LLYLI LOOP                           │
├─────────────────────────────────────────────────────────────────┤
│   1. CAPTURE          2. REVIEW           3. MASTER             │
│   ─────────           ──────────          ──────────            │
│   Type a word    →    Fresh sentences →   3 correct recalls     │
│   < 2 seconds         10-15 min daily     = Ready to use        │
└─────────────────────────────────────────────────────────────────┘
```

## Why LLYLI?

| Traditional Apps | LLYLI |
|------------------|-------|
| Someone else's vocabulary | YOUR vocabulary |
| Same sentence repeated | Fresh sentence every review |
| Fixed review intervals | Personalized FSRS scheduling |
| Punitive streak loss | Forgiving freeze system |
| Brazilian Portuguese | EU Portuguese (pt-PT) |
| Manual card creation | 2-second auto-capture |

## Features

- **Instant Capture** - Type any word, get translation + native audio in <2 seconds
- **FSRS Algorithm** - Scientifically-proven spaced repetition with personalized scheduling
- **Dynamic Sentences** - Never see the same example twice; words combine in fresh contexts
- **3-Recall Mastery** - Words graduate to "Ready to Use" only after proven retention
- **Daily Bingo** - Achievable daily challenges for consistent motivation
- **Boss Round** - 90-second speed challenge for your hardest words
- **Forgiving Streaks** - One free freeze per week; life happens

## Supported Languages

| Native Language | Learning | Status |
|-----------------|----------|--------|
| English | Portuguese (Portugal) | ✅ Active |
| Dutch | Portuguese (Portugal) | ✅ Active |
| Dutch | English | ✅ Active |
| English | Swedish | ✅ Active |

## Quick Start

```bash
cd web
npm install
npm run dev     # localhost:3000
```

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# OpenAI (translation + TTS)
OPENAI_API_KEY=

# Database
DATABASE_URL=
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind |
| Components | shadcn/ui with custom Moleskine design system |
| State | Zustand (auth, words, review, gamification stores) |
| Database | PostgreSQL (Supabase) + Drizzle ORM |
| Auth | Supabase Auth |
| AI | OpenAI GPT-4o-mini (translation), OpenAI TTS (audio) |
| Algorithm | ts-fsrs v5.2.3 (FSRS-4.5 spaced repetition) |
| iOS | Capacitor (hybrid app wrapping web) |
| Hosting | Vercel (auto-deploy on push to main) |

## Project Structure

```
web/
├── src/
│   ├── app/                    # Next.js pages
│   │   ├── api/               # API routes
│   │   │   ├── words/         # Word CRUD + categories
│   │   │   ├── reviews/       # Review scheduling
│   │   │   ├── sentences/     # Sentence generation
│   │   │   ├── gamification/  # Daily goals, bingo, boss round
│   │   │   └── progress/      # Dashboard stats
│   │   ├── auth/              # Sign in/up, password reset
│   │   ├── capture/           # Word capture
│   │   ├── notebook/          # Word browser by category
│   │   ├── review/            # Review session + complete
│   │   ├── onboarding/        # Language selection flow
│   │   └── progress/          # Progress dashboard
│   │
│   ├── components/            # React components
│   │   ├── ui/               # shadcn + custom components
│   │   ├── gamification/     # Bingo board, boss round
│   │   ├── review/           # Exercise types
│   │   └── notebook/         # Word cards, categories
│   │
│   └── lib/
│       ├── fsrs/             # FSRS algorithm implementation
│       ├── db/schema/        # Drizzle schemas
│       ├── store/            # Zustand stores
│       ├── audio/            # TTS generation + playback
│       └── supabase/         # Auth + database helpers
│
├── ios/                       # Capacitor iOS project
└── drizzle/                   # Database migrations

docs/
├── product/
│   ├── product_guide.md      # Complete product documentation
│   ├── prd.md               # Product requirements
│   └── business_model_canvas.md
├── design/
│   ├── design-system.md      # Moleskine design tokens
│   ├── wireframes.md         # UI layouts
│   └── user_research_synthesis.md
└── engineering/
    ├── implementation_plan.md # Architecture reference
    ├── TESTING.md            # QA test cases
    ├── CAPACITOR_IOS_SETUP.md # iOS app setup
    └── session-workflow.md   # Claude Code best practices
```

## Development

```bash
# Start development server
cd web && npm run dev

# Build for production
npm run build

# Run tests
npm test

# Push schema changes (dev only)
npm run db:push
```

### Deployment

The app auto-deploys to Vercel on push to `main`. For manual deployment:

```bash
cd web && vercel --prod
```

## Design System (Moleskine)

LLYLI uses a Moleskine notebook-inspired design:

- **Colors:** Teal nav (#0C6B70), Coral actions (#E85C4A), Cream paper (#F5EFE0)
- **Ribbon Rule:** Coral appears as ONE prominent element per screen
- **Binding Rule:** Cards rounded on right, square on left (like notebook pages)
- **Typography:** System fonts with handwritten accents

See [docs/design/design-system.md](docs/design/design-system.md) for full reference.

## Key Documentation

| Document | Purpose |
|----------|---------|
| [Product Guide](docs/product/product_guide.md) | Complete product explanation, onboarding, gamification |
| [Design System](docs/design/design-system.md) | Moleskine design tokens and patterns |
| [Implementation Plan](docs/engineering/implementation_plan.md) | Architecture, data model, API routes |
| [Testing Guide](docs/engineering/TESTING.md) | QA test cases, database queries |
| [PROJECT_LOG.md](PROJECT_LOG.md) | Session history, current status |

## Current Status

### Complete
- Authentication (Supabase)
- Phrase capture with auto-translation
- TTS audio generation & storage
- FSRS spaced repetition engine
- Review sessions with mastery tracking
- Notebook browser with categories
- User onboarding with starter words
- Progress dashboard
- Gamification (daily goals, streaks, bingo, boss round)
- Multi-language support (4 language directions)
- Production deployment (Vercel)

### In Progress
- Sentence generation (pre-gen works, review integration WIP)
- PWA offline caching
- iOS App Store submission

### Planned
- Stripe payments (post-MVP)

## Contributing

See [docs/engineering/session-workflow.md](docs/engineering/session-workflow.md) for development workflow and [PROJECT_LOG.md](PROJECT_LOG.md) for current context.

## License

Private - All rights reserved
