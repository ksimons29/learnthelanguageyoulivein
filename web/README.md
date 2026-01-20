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

Copy `.env.local.example` to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
OPENAI_API_KEY=
```

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
