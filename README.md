# LLYLI - Learn the Language You Live In

> Turn real-life phrases into lasting memories through AI-powered sentence practice and scientifically-optimized spaced repetition.

**Live:** https://llyli.vercel.app

---

## The Problem

**75% of language learners save words but never review them.**

People living abroad encounter useful vocabulary daily - at the bakery, in meetings, on signs - but fail to retain it. Traditional apps require too much effort to create cards, show repetitive content, and use outdated algorithms.

---

## The Solution

LLYLI is your **digital language notebook** that makes vocabulary stick:

| Step | What Happens | Time |
|------|--------------|------|
| **Capture** | Type a word → get instant translation + native audio | 2 seconds |
| **Practice** | AI creates unique sentences combining your words | 10 min/day |
| **Master** | FSRS-4.5 algorithm schedules reviews at optimal timing | Automatic |

---

## Target Users

**Sofia - The Immersed Professional**
- Dutch designer in Lisbon, thinks "I'll remember" but doesn't
- Needs: Frictionless capture + automatic review

**Ralf - The Ambitious Goal-Setter**
- Business developer wanting "3 words/day, 1000/year"
- Needs: Gamification + progress tracking

**Maria - The Frustrated App User**
- Abandoned Duolingo for wrong regional variant
- Needs: Correct EU Portuguese + real-life vocabulary

---

## Key Features

### Dynamic Sentence Generation
Most apps show isolated word pairs. LLYLI combines 2-4 of your words in AI-generated sentences that **never repeat**. Each review is fresh, building real-world recall.

### FSRS-4.5 Spaced Repetition
We use a 2023 machine learning-based algorithm - **36 years more advanced** than the algorithm in most apps. It adapts to your personal forgetting curve.

### Memory Context
Record WHERE and WHEN you learned each phrase. Research shows context-linked memories are stronger.

### European Portuguese
Unlike apps that teach Brazilian Portuguese, LLYLI enforces European Portuguese (pt-PT) with proper spelling and "tu" forms.

### The 3-Session Mastery Rule
A word reaches "Ready to Use" after **3 correct recalls on 3 separate sessions** (>2 hours apart). No cramming - real retention.

---

## What LLYLI Does NOT Do

| Anti-Pattern | Why Avoided |
|--------------|-------------|
| Isolated word-pair flashcards | Artificial, impedes real-world recall |
| Fixed intervals (1/3/7 days) | Doesn't adapt to individual forgetting |
| Repeated example sentences | Novelty loss kills engagement |
| Brazilian Portuguese | Primary users need European Portuguese |
| Heavy currency/store systems | Distracts from learning |

---

## The Science

LLYLI is built on peer-reviewed memory research, not guesswork.

| Principle | How We Apply It | Evidence |
|-----------|-----------------|----------|
| **Forgetting Curve** (1885) | Review timing catches you just as you start to forget | 64% → 87% retention after 3 reviews |
| **FSRS Algorithm** (2023) | Modern ML-based scheduling, not 1987 math | 36 years newer than most apps |
| **Interleaved Practice** | Dynamic sentences combine 2-4 of your words | 4-6x faster acquisition |
| **Encoding Specificity** | YOUR words from YOUR life, with context | r=0.5 novelty-learning correlation |
| **3-Recall Mastery** | Words graduate after 3 correct recalls across separate sessions | Proven long-term retention |

**In-app science page:** [/science](https://llyli.vercel.app/science)

---

## Supported Languages

| From | To | Status |
|------|-----|--------|
| English | Portuguese (Portugal) | Active |
| English | Swedish | Active |
| Dutch | English | Active |

---

## Quick Start

```bash
# Clone and install
git clone https://github.com/ksimons29/learnthelanguageyoulivein.git
cd learnthelanguageyoulivein/web
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local with your credentials

# Start development
npm run dev     # localhost:3000
```

### Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_postgres_connection_string
OPENAI_API_KEY=your_openai_key
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind |
| Components | shadcn/ui + Moleskine design system |
| State | Zustand (auth, words, review, gamification stores) |
| Database | PostgreSQL (Supabase) + Drizzle ORM |
| Auth | Supabase Auth |
| AI | OpenAI GPT-4o-mini (translation) + TTS (audio) |
| Algorithm | ts-fsrs v5.2.3 (FSRS-4.5) |
| Hosting | Vercel |
| Mobile | Capacitor (iOS) |

---

## Project Structure

```
learnthelanguageyoulivein/
├── web/                          # Next.js application
│   ├── src/
│   │   ├── app/                  # Pages: capture, review, notebook, progress, admin
│   │   ├── components/           # UI components by feature
│   │   └── lib/
│   │       ├── db/schema/        # Drizzle schemas
│   │       ├── fsrs/             # FSRS algorithm implementation
│   │       ├── store/            # Zustand stores
│   │       └── supabase/         # Auth helpers
│   └── ios/                      # Capacitor iOS wrapper
├── docs/
│   ├── product/                  # PRD, user guide, executive summary
│   ├── design/                   # Moleskine design system
│   ├── engineering/              # Technical documentation
│   └── go-live/                  # Launch preparation
├── PRODUCT_SPECIFICATION.md      # Complete product spec
└── .claude/CLAUDE.md             # AI assistant instructions
```

---

## Features Deep Dive

### Word Capture
- Auto-translate in <3 seconds
- Auto-categorize (8 categories: food, work, social, etc.)
- Native TTS audio generation
- Optional memory context (WHERE, WHEN, situation tags)

### Sentence Review
- Fill-in-blank (medium difficulty)
- Multiple choice (easiest)
- Type translation (hardest)
- Difficulty adapts to mastery level

### Notebook
- Browse by category
- Global search
- Attention section (struggling words)
- Mastery badges (Learning → Learned → Ready to Use)

### Gamification
- Daily goal: 10 reviews
- Streaks with freeze protection
- 3x3 Bingo board
- Boss Round: 60-90s timed challenge with struggling words

---

## Design System

LLYLI uses a **Moleskine notebook** aesthetic:

| Element | Color | Usage |
|---------|-------|-------|
| Surface | #F8F3E7 | Page backgrounds (cream) |
| Cards | #FFFFFF | Card surfaces (white) |
| Ribbon | #E85C4A | Primary CTA (coral) |
| Nav | #0C6B70 | Navigation (teal) |

**Design Rules:**
- **Ribbon Rule:** Coral appears as ONE dominant element per screen
- **Binding Rule:** Cards rounded on right, square on left
- **Typography:** Serif headings (Libre Baskerville), sans-serif UI (Inter)

---

## Documentation

| Document | Description |
|----------|-------------|
| [PRODUCT_SPECIFICATION.md](./PRODUCT_SPECIFICATION.md) | Complete product spec |
| [docs/product/EXECUTIVE_SUMMARY.md](./docs/product/EXECUTIVE_SUMMARY.md) | One-page overview |
| [docs/product/USER_GUIDE.md](./docs/product/USER_GUIDE.md) | End-user documentation |
| [docs/product/REVIEW_GAMES.md](./docs/product/REVIEW_GAMES.md) | Review exercises & gamification guide |
| [docs/product/prd.md](./docs/product/prd.md) | Product requirements |
| [docs/design/design-system.md](./docs/design/design-system.md) | UI component specs |
| [docs/engineering/implementation_plan.md](./docs/engineering/implementation_plan.md) | Technical architecture |
| [docs/engineering/TESTING.md](./docs/engineering/TESTING.md) | Testing guide |
| [docs/go-live/README.md](./docs/go-live/README.md) | Launch preparation |

---

## Development

```bash
cd web

npm run dev          # Start dev server
npm run build        # Build for production
npm run test:run     # Run unit tests
npm run db:push      # Push schema changes (dev only)
npm run db:studio    # Open Drizzle Studio
```

### Test Accounts

| Account | Language Direction |
|---------|-------------------|
| test-en-pt@llyli.test | English → Portuguese |
| test-en-sv@llyli.test | English → Swedish |
| test-nl-en@llyli.test | Dutch → English |

Password: `TestPassword123!`

---

## Deployment

Auto-deploys to Vercel on push to `main`.

```bash
cd web && vercel --prod     # Manual deploy
vercel logs <url> --since 5m # Check logs
```

---

## Admin Dashboard

**URL:** https://llyli.vercel.app/admin

Requires `ADMIN_SECRET` environment variable. Metrics include:
- Product KPIs: DAU/WAU/MAU, D1/D7/D30 retention
- Mastery funnel: Learning → Learned → Ready to Use
- Audio health monitoring
- User feedback (anonymous)

---

## Recent Highlights

- **Audio Reliability** - Fixed ~15% failure rate with retry logic
- **Admin Dashboard** - Platform-wide analytics
- **Gamification** - 186+ automated tests, Boss Round ready day one
- **Review System** - Realistic due counts, sentence-first learning
- **Multi-Language** - Full support for EN→PT, EN→SV, NL→EN

---

## License

Proprietary - All rights reserved.

---

<p align="center">
  <strong>LLYLI - Learn the Language You Live In</strong><br/>
  <em>Turn real-life phrases into lasting memories</em>
</p>

**Repository:** https://github.com/ksimons29/learnthelanguageyoulivein
