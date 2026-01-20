# LLYLI

Language learning app that turns real-life phrases into smart cards with native audio and spaced repetition.

## Quick Reference

```bash
cd web && npm run dev     # Start dev server at localhost:3000
npm run build             # Build for production
npm run db:push           # Push schema changes (dev only)
```

## Deployment

- **Production URL:** https://web-eta-gold.vercel.app
- **Hosting:** Vercel (auto-deploys on push to `main`)
- **Database:** Supabase PostgreSQL (same instance for dev/prod)

```bash
# Deploy manually (auto-deploy preferred)
cd web && vercel --prod

# Add env vars (use printf to avoid newline issues)
printf '%s' "value" | vercel env add VAR_NAME production

# Check deployment logs
vercel logs <deployment-url> --since 5m
```

**Important:** When adding secrets to Vercel, use `printf` instead of `echo` to avoid trailing newlines which cause auth failures.

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind, shadcn/ui
- **State:** Zustand (auth-store, words-store, review-store, ui-store)
- **Database:** PostgreSQL (Supabase) + Drizzle ORM
- **Auth:** Supabase Auth (NOT NextAuth/Clerk)
- **AI:** OpenAI GPT-4o-mini (translation), OpenAI TTS (audio)
- **Algorithm:** ts-fsrs v5.2.3 (FSRS-4.5 spaced repetition)
- **iOS:** Capacitor (hybrid app wrapping web in native shell)

## Key Documentation

| Document | Purpose |
|----------|---------|
| `/docs/design/design-system.md` | **★ Moleskine design tokens** - Always for UI |
| `/docs/engineering/TESTING.md` | **★ Testing guide** - Run after every feature |
| `/docs/engineering/implementation_plan.md` | Architecture, data model, API routes |
| `/docs/engineering/session-workflow.md` | Claude Code session best practices |
| `/docs/engineering/CAPACITOR_IOS_SETUP.md` | iOS app setup, native plugins |
| `/docs/product/prd.md` | User stories, acceptance criteria |
| `/docs/design/wireframes.md` | UI layouts, screen flows |

## Implementation Status

### Complete ✅
- Authentication (Supabase)
- Phrase capture with auto-translation
- TTS audio generation & storage
- FSRS spaced repetition engine
- Review sessions with mastery tracking
- Notebook browser with categories
- User onboarding flow
- Progress dashboard
- Production deployment (Vercel)

### In Progress ⚠️
- Sentence generation (pre-gen works, review integration WIP)
- PWA offline caching
- iOS App Store submission (Capacitor setup complete)

### Not Started ❌
- Stripe payments

## Code Patterns

```typescript
// Naming: Use auxiliary verbs
const isLoading = true;
const hasAccess = user?.role === 'admin';
const canSubmit = isValid && !isLoading;

// Directories: lowercase-with-dashes
components/phrase-card/
lib/audio-player/

// Exports: Named exports preferred
export function PhraseCard() { }
export const useFsrs = () => { }
```

## Design System (Moleskine)

- **Colors:** Teal nav (#0C6B70), Coral actions (#E85C4A), Cream paper (#F5EFE0)
- **Ribbon Rule:** Coral appears as ONE prominent element per screen
- **Binding Rule:** Cards rounded on right, square on left
- **Classes:** `.notebook-bg`, `.binding-edge-stitched`, `.ribbon-bookmark`
- **Dates:** Charts use short weekdays ("Wed"), feedback uses full ("Wednesday"), never "Tmrw"

See `/docs/design/design-system.md` for full reference.

## Testing (MANDATORY)

**⚠️ CRITICAL: After EVERY code change (feature, bug fix, or refactor), run:**

```bash
cd web
npm run build          # Must pass - catches TypeScript errors
npm run test:run       # Must pass - unit tests
```

**For UI/API changes, also run E2E via Playwright MCP:**
1. `browser_navigate` to https://web-eta-gold.vercel.app
2. Sign in with test account: `test-en-pt@llyli.test` / `TestPassword123!`
3. Test the changed feature
4. `browser_snapshot` to verify

**Integration test scripts (run when changing related systems):**
```bash
cd web
npx tsx scripts/test-database.js      # Database/schema changes
npx tsx scripts/test-supabase.js      # Auth changes
npx tsx scripts/test-openai.js        # Translation/TTS changes
npx tsx scripts/test-comprehensive.ts # Major features
```

**Test Accounts (pre-confirmed, ready to use):**
| Email | Password | Languages |
|-------|----------|-----------|
| `test-en-pt@llyli.test` | `TestPassword123!` | EN→PT |
| `test-en-sv@llyli.test` | `TestPassword123!` | EN→SV |
| `test-nl-en@llyli.test` | `TestPassword123!` | NL→EN |

**Reset test users:** `npx tsx scripts/create-test-users.ts`

**📖 Full testing guide:** `/docs/engineering/TESTING.md` - Contains E2E scenarios, database queries, all test user types, and release readiness checklist.

## Session Workflow

**Start:** `/clear` → read PROJECT_LOG.md → use plan mode for complex work

**End:** Update PROJECT_LOG.md → Commit with `fixes #N` → **Run tests**

**Debug:** Copy server logs → paste to Claude with page context

### PROJECT_LOG.md Updates (MANDATORY)

After EVERY session or commit with >2 file changes:

1. **Update Dashboard**:
   - Move completed items to "Recently Completed"
   - Add/update "In Progress" items
   - Update "Open Bugs" if issues found/fixed

2. **Add Session Entry** at top of Session Log:
   - Full entry: 3+ files, new features, architecture
   - Minimal entry: bug fixes, 1-2 files
   - Build entry: production deployments

3. **Update Key Files** if significant files created

When planning tasks, always include "Update PROJECT_LOG.md" as final todo.

Archive when file exceeds 500 lines - move oldest sessions to PROJECT_LOG_ARCHIVE.md.

See `/docs/engineering/session-workflow.md` for detailed workflow, MCP servers, and testing guidelines.

## Key Files

```
web/
├── capacitor.config.ts     # iOS app configuration
├── ios/                    # Xcode project (auto-generated)
└── src/
    ├── app/                # Pages (capture, review, notebook, progress)
    ├── components/         # UI components by feature
    └── lib/
        ├── capacitor/      # Platform detection, native plugins
        ├── db/schema/      # Drizzle schemas (words, sessions, sentences)
        ├── fsrs/           # FSRS algorithm implementation
        ├── audio/          # TTS generation & storage
        ├── store/          # Zustand stores
        └── supabase/       # Auth helpers
```

## Repository

https://github.com/ksimons29/learnthelanguageyoulivein
