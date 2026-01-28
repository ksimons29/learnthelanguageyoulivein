# LLYLI Engineering Documentation

Technical documentation for the LLYLI language learning platform.

---

## Quick Links

| Document | Purpose | Priority |
|----------|---------|----------|
| [implementation_plan.md](./implementation_plan.md) | Architecture & data model | Reference |
| [TESTING.md](./TESTING.md) | Testing guide & test accounts | **Must Read** |
| [session-workflow.md](./session-workflow.md) | Claude Code workflow | **Must Read** |
| [LANGUAGE_CONFIGURATION.md](./LANGUAGE_CONFIGURATION.md) | Adding new languages | When needed |

---

## Architecture Overview

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| UI | shadcn/ui + Moleskine custom components |
| State | Zustand (auth, words, review, gamification stores) |
| Database | PostgreSQL (Supabase) + Drizzle ORM |
| Auth | Supabase Auth |
| AI | OpenAI GPT-4o-mini (translation), TTS (audio) |
| Algorithm | ts-fsrs v5.2.3 (FSRS-4.5) |
| Hosting | Vercel |
| Mobile | Capacitor (iOS) |

### Key Directories

```
web/src/
├── app/                # Next.js App Router pages + API routes
├── components/         # React components by feature
└── lib/
    ├── db/schema/      # Drizzle schemas (words, sessions, sentences, etc.)
    ├── fsrs/           # FSRS-4.5 algorithm implementation
    ├── store/          # Zustand stores
    ├── supabase/       # Auth helpers
    ├── audio/          # TTS generation + storage
    └── sentences/      # AI sentence generation
```

---

## Document Index

### Core Architecture

| Document | Purpose |
|----------|---------|
| [implementation_plan.md](./implementation_plan.md) | Full architecture, data model, API routes, flows |
| [Multi_Language_Implementation.md](./Multi_Language_Implementation.md) | Bidirectional language support |
| [LANGUAGE_CONFIGURATION.md](./LANGUAGE_CONFIGURATION.md) | How to add new language pairs |

### Development Workflow

| Document | Purpose |
|----------|---------|
| [session-workflow.md](./session-workflow.md) | Claude Code best practices, MCP servers |
| [TESTING.md](./TESTING.md) | Test accounts, E2E protocol, verification |
| [TODO.md](./TODO.md) | Remaining work (P0/P1/P2 items) |

### Features

| Document | Purpose |
|----------|---------|
| [llyli_gamification_and_games_plan.md](./llyli_gamification_and_games_plan.md) | Bingo, streaks, Boss Round |
| [Research Gamification.md](./Research%20Gamification.md) | Research behind gamification |
| [AUTH_AND_MONETIZATION_PLAN.md](./AUTH_AND_MONETIZATION_PLAN.md) | Auth + Stripe plans |
| [AUTH_SETUP.md](./AUTH_SETUP.md) | Supabase Auth configuration |

### Platform

| Document | Purpose |
|----------|---------|
| [CAPACITOR_IOS_SETUP.md](./CAPACITOR_IOS_SETUP.md) | iOS app setup, native plugins |
| [audio-architecture.md](./audio-architecture.md) | TTS, verification, iOS audio strategy |

### Archive

| Document | Purpose |
|----------|---------|
| [IMPLEMENTATION_ARCHIVE.md](./IMPLEMENTATION_ARCHIVE.md) | Completed features reference |
| [archive/](./archive/) | Superseded documentation |

---

## Key Concepts

### FSRS-4.5 Algorithm

```typescript
// Retrievability (probability of recall)
R(t) = (1 + t/(9·S))^(-1)

// Word is due when R < 0.9 (90% recall probability)
isDue(word) = calculateRetrievability(word) < 0.9
```

**Parameters:**
- **Difficulty (D):** How hard to increase memory strength (1-10)
- **Stability (S):** Days until 90% recall probability
- **Retrievability (R):** Current probability of recall

### Mastery System

| Level | Consecutive Correct Sessions | Visual |
|-------|------------------------------|--------|
| Learning | 0-1 | Empty bar |
| Learned | 2 | Partial bar |
| Ready to Use | 3+ | Full green bar |

**Critical Rule:** Sessions must be >2 hours apart (prevents cramming).

### Sentence Generation

1. Find 2-4 due words from same category
2. Generate unique sentence via GPT-4o-mini
3. Store with word IDs (for deduplication)
4. Pre-generate in background (7-day lookahead)

### Language Direction

Words support bidirectional capture:
- `sourceLang`: Language user typed
- `translation`: Auto-translated text
- Use `getTargetLanguageText()` / `getNativeLanguageText()` helpers

---

## Development Commands

```bash
cd web

# Development
npm run dev              # Start dev server (localhost:3000)
npm run build            # Build for production
npm run test:run         # Run unit tests

# Database
npm run db:push          # Push schema changes (dev only)
npm run db:studio        # Open Drizzle Studio
npm run db:generate      # Generate migrations

# Testing
npx tsx scripts/test-comprehensive.ts  # Full integration tests
npx tsx scripts/create-test-users.ts   # Reset test accounts
```

---

## Test Accounts

| Account | Direction | Native | Target |
|---------|-----------|--------|--------|
| test-en-pt@llyli.test | EN→PT | English | Portuguese |
| test-en-sv@llyli.test | EN→SV | English | Swedish |
| test-nl-en@llyli.test | NL→EN | Dutch | English |

**Password:** `TestPassword123!`

---

## API Routes

### Words (`/api/words/`)
- `POST /` - Capture with auto-translate + TTS
- `GET /` - Fetch user's words
- `GET /stats` - Due count, mastery breakdown
- `GET /categories` - Word counts by category
- `PUT /[id]` - Update word
- `POST /[id]/regenerate-audio` - Retry failed TTS

### Reviews (`/api/reviews/`)
- `GET /` - Get due words for session
- `POST /end` - Submit grading, update FSRS

### Sentences (`/api/sentences/`)
- `GET /next` - Get next sentence exercise
- `POST /generate` - Pre-generate sentences

### Gamification (`/api/gamification/`)
- `GET /state` - Streak, daily goal, bingo
- `POST /event` - Track achievements
- `POST /boss-round` - Start/end Boss Round

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Word capture | < 3 seconds |
| Sentence load | < 1 second |
| Audio playback | < 1 second |
| Build time | < 60 seconds |
| API response | < 500ms |

---

## Related Documentation

- [/PRODUCT_SPECIFICATION.md](../../PRODUCT_SPECIFICATION.md) - Complete product spec
- [/.claude/CLAUDE.md](../../.claude/CLAUDE.md) - AI assistant instructions
- [/docs/design/](../design/) - Design system
- [/docs/product/](../product/) - Product documentation
- [/docs/testing/](../testing/) - Test results & performance baselines
- [/findings.md](../../findings.md) - Active bug tracking
- [/MVP_AUDIT.md](../../MVP_AUDIT.md) - Feature verification

---

*Last updated: 2026-01-28*
