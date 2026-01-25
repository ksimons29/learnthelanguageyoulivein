# Web app rules

## Stack

- Next.js, React, TypeScript, Tailwind, shadcn/ui
- State via Zustand stores
- Supabase Auth
- Drizzle ORM
- OpenAI for translation and TTS
- FSRS via ts-fsrs

## Ground rules

1. Prefer direct imports, avoid barrels.
2. Avoid async waterfalls. Batch and parallelize safely.
3. If you touch stores or fsrs scheduling, run full user flow verification.

## State conventions

Stores are the source of truth.
No UI should invent language direction logic. Read it from the user profile or central config.

## Language direction

- Native language is what user understands.
- Target language is what user is learning.
- Never mix native and target strings in the same UI element.

## When to run E2E

If changes touch capture, review, notebook, today dashboards, stores, fsrs, sentence generation.
Use production URL and incognito discipline from root CLAUDE.md.
