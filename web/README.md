# LLYLI Web Application

Next.js web application for the LLYLI language learning platform.

## Quick Start

```bash
npm install
npm run dev     # http://localhost:3000
```

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test:run     # Run unit tests
npm run db:push      # Push schema changes (dev only)
npm run db:studio    # Open Drizzle Studio
```

## Environment

Required environment variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=

# OpenAI
OPENAI_API_KEY=

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Error Monitoring (Sentry) - Optional in dev, required in prod
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=
SENTRY_AUTH_TOKEN=

# Admin Dashboard
ADMIN_SECRET=           # Required for /admin access
```

## Admin Dashboard

Access at `/admin` with your `ADMIN_SECRET`. Features:

- **Health Status Banner** - Green/yellow/red status with automatic issue detection
- **Key Metrics** - 6 executive KPIs: DAU, D7 Retention, Sessions, Cost, Words, Streaks
- **Metric Explanations** - "What's this?" toggle on each metric showing:
  - What it measures
  - How to interpret it (thresholds)
  - When to take action
- **User Feedback Stream** - Scrollable list of recent bug reports, feature requests, and feedback with color-coded categories
- **Quick Links** - Direct access to Sentry errors and GitHub issues

## Project Structure

```
src/
├── app/           # Next.js pages and API routes
├── components/    # React components by feature
└── lib/
    ├── db/        # Drizzle schemas
    ├── fsrs/      # Spaced repetition algorithm
    ├── store/     # Zustand stores
    └── supabase/  # Auth helpers
```

## Tech Stack

- Next.js 16, React 19, TypeScript
- Tailwind CSS, shadcn/ui
- Supabase (PostgreSQL + Auth)
- Drizzle ORM
- ts-fsrs (spaced repetition)
- OpenAI (translation + TTS)

See root [README.md](../README.md) for full documentation.
