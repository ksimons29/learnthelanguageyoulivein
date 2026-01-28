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

## E2E tests (AUTOMATIC - DO NOT SKIP)

**After ANY change to the files below, Claude Code MUST automatically run:**

```bash
npm run test:run && npm run test:e2e
```

**Trigger files:**
- `src/app/capture/*`, `src/app/review/*`, `src/app/notebook/*`, `src/app/today/*`
- `src/app/auth/*`, `src/middleware.ts`
- `src/lib/store/*`, `src/lib/fsrs/*`, `src/lib/sentences/*`
- `src/app/api/words/*`, `src/app/api/reviews/*`, `src/app/api/sentences/*`
- `src/components/notebook/*`, `src/components/review/*`

**Do not ask. Do not skip. Run automatically after implementation.**

For production verification after deploy, also use Playwright MCP with incognito discipline.
