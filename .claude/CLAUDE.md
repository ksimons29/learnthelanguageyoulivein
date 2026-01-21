# LLYLI

Language learning app that turns real-life phrases into smart cards with native audio and spaced repetition.

## Quick Reference

```bash
cd web && npm run dev     # Start dev server at localhost:3000
npm run build             # Build for production
npm run db:push           # Push schema changes (dev only)
```

## Deployment

- **Production URL:** https://llyli.vercel.app
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
| `findings.md` | **★★ CRITICAL - Active bugs** - Fix before anything else |
| `MVP_AUDIT.md` | **★★ CRITICAL - Feature checklist** - 60 steps to verify |
| `/docs/design/design-system.md` | **★ Moleskine design tokens** - Always for UI |
| `/docs/engineering/TESTING.md` | **★ Testing guide** - Run after every feature |
| `~/.claude/skills/vercel-react-best-practices/` | **★ React/Next.js performance** - 45 rules |
| `/docs/engineering/implementation_plan.md` | Architecture, data model, API routes |
| `/docs/engineering/session-workflow.md` | Claude Code session best practices |
| `/docs/engineering/CAPACITOR_IOS_SETUP.md` | iOS app setup, native plugins |
| `/docs/product/prd.md` | User stories, acceptance criteria |
| `/docs/design/wireframes.md` | UI layouts, screen flows |

## Implementation Status

**⚠️ WARNING: Status below needs verification. See `MVP_AUDIT.md` for actual test results.**

### Needs Re-Verification 🔄
- Authentication (Supabase) - untested this session
- Phrase capture with auto-translation - partial fail (Finding #8)
- TTS audio generation & storage - untested
- FSRS spaced repetition engine - untested
- Review sessions with mastery tracking - untested
- Notebook browser with categories - partial fail (Finding #9, #10)
- User onboarding flow - untested
- Progress dashboard - untested
- Production deployment (Vercel) - deployed but buggy

### Broken ❌ (See findings.md)
- Sentence review - 7 P0 bugs, completely non-functional
- Today dashboard - due count mismatch, captured today resets
- Notebook inbox - count doesn't match content

### In Progress ⚠️
- PWA offline caching
- iOS App Store submission (Capacitor setup complete)

### Not Started ❌
- Stripe payments

### MVP Readiness
- **60 feature steps defined** in MVP_AUDIT.md
- **0 passing, 12 failing, 48 untested**
- **15 bugs documented** in findings.md
- **NOT ready for MVP launch**

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

## React/Next.js Performance (MANDATORY)

Follow these Vercel best practices when writing React/Next.js code:

### 1. Eliminate Async Waterfalls (CRITICAL)

```typescript
// ❌ BAD: Sequential awaits in loops
for (const item of items) {
  await processItem(item);      // Sequential!
  await generateAudio(item);    // Waits for previous!
}

// ✅ GOOD: Parallel with Promise.allSettled
const results = await Promise.allSettled(
  items.map(item => processItem(item))
);

// ✅ GOOD: Batched parallelism (respects rate limits)
const BATCH_SIZE = 5;
for (let i = 0; i < items.length; i += BATCH_SIZE) {
  const batch = items.slice(i, i + BATCH_SIZE);
  await Promise.allSettled(batch.map(processItem));
}
```

### 2. Direct Imports (No Barrels)

```typescript
// ❌ BAD: Barrel imports pull entire module
import { Button } from "@/components/ui";
import { isDue } from "@/lib/fsrs";

// ✅ GOOD: Direct imports enable tree-shaking
import { Button } from "@/components/ui/button";
import { isDue } from "@/lib/fsrs/calculations";
```

### 3. Dynamic Imports for Conditional Components

```typescript
// ❌ BAD: Always loaded even if not rendered
import { HeavyModal } from "@/components/heavy-modal";

// ✅ GOOD: Lazy-loaded when needed
const HeavyModal = dynamic(
  () => import("@/components/heavy-modal").then(m => m.HeavyModal),
  { ssr: false, loading: () => <Spinner /> }
);
```

Use `next/dynamic` for:
- Modals and sheets (loaded on open)
- Gamification components (loaded when active)
- Admin-only features (loaded for admins)
- Heavy visualizations (charts, graphs)

### 4. Batch Database Operations

```typescript
// ❌ BAD: N queries in a loop
for (const id of ids) {
  await db.update(table).set({ status }).where(eq(table.id, id));
}

// ✅ GOOD: Single batched query
await db.update(table).set({ status }).where(inArray(table.id, ids));
```

### 5. Memoization Checklist

- `useMemo`: Expensive computations derived from props/state
- `useCallback`: Functions passed to child components or in dependency arrays
- Keep dependencies minimal and primitive when possible

### Quick Reference

| Pattern | When to Use |
|---------|-------------|
| `Promise.all` | Independent async operations |
| `Promise.allSettled` | Batch ops where individual failures are OK |
| `next/dynamic` | Conditionally rendered heavy components |
| Direct imports | Always (avoid barrel `index.ts` files) |
| `useMemo`/`useCallback` | Expensive work or stable references needed |

## Design System (Moleskine)

- **Colors:** Teal nav (#0C6B70), Coral actions (#E85C4A), Cream paper (#F5EFE0)
- **Ribbon Rule:** Coral appears as ONE prominent element per screen
- **Binding Rule:** Cards rounded on right, square on left
- **Classes:** `.notebook-bg`, `.binding-edge-stitched`, `.ribbon-bookmark`
- **Dates:** Charts use short weekdays ("Wed"), feedback uses full ("Wednesday"), never "Tmrw"

See `/docs/design/design-system.md` for full reference.

## Testing (MANDATORY - NO EXCEPTIONS)

### The Rule: "It builds" is NOT "it works"

TypeScript catches type errors. It does NOT catch:
- Wrong language displayed
- Wrong data in UI
- State synchronization bugs
- Logic errors

**Every change requires BOTH automated AND manual verification.**

---

### Step 1: Automated Tests (REQUIRED)

```bash
cd web
npm run build          # Must pass
npm run test:run       # Must pass
```

---

### Step 2: E2E Verification (REQUIRED - NOT OPTIONAL)

**This is NOT optional. This is NOT "also run". This is REQUIRED.**

For ANY change to these paths, you MUST complete E2E verification:
- `app/review/**` - Sentence review, flashcards
- `app/notebook/**` - Word browser, categories
- `app/today/**` - Dashboard, due counts
- `app/capture/**` - Phrase capture
- `components/sentence/**` - Sentence generation
- `lib/fsrs/**` - Spaced repetition
- `stores/**` - State management

**E2E Protocol:**
1. `browser_navigate` to https://llyli.vercel.app
2. Sign in with test account
3. Complete the FULL user flow (not just the changed component)
4. `browser_snapshot` at each step
5. Verify from USER PERSPECTIVE (not developer perspective)

---

### Step 3: Multi-Language Verification (REQUIRED for display logic)

Any change that affects what text/language is shown MUST be tested with ALL language pairs:

| Account | Direction | What to Verify |
|---------|-----------|----------------|
| `test-en-pt@llyli.test` | EN→PT | Native=English, Target=Portuguese |
| `test-en-sv@llyli.test` | EN→SV | Native=English, Target=Swedish |
| `test-nl-en@llyli.test` | NL→EN | Native=Dutch, Target=English |

Password for all: `TestPassword123!`

**Critical checks:**
- Word picker shows NATIVE language (what user understands)
- Flashcard front shows TARGET language (what user is learning)
- Multiple choice options in NATIVE language
- Highlighted word matches expected answer

---

### Step 4: Semantic Verification (REQUIRED)

Don't just check "does it render?" Check "does it show the RIGHT thing?"

```typescript
// ❌ BAD: Tests structure only
expect(wordList).toHaveLength(10);
expect(component).toBeInTheDocument();

// ✅ GOOD: Tests meaning
expect(displayedLanguage).toBe(user.nativeLanguage);
expect(highlightedWord.id).toBe(expectedAnswer.id);
expect(options).toContain(correctAnswer);
```

---

### Definition of "Fixed"

A bug is NOT fixed until ALL of these are true:
- [ ] Code change made
- [ ] Unit test added that catches the bug
- [ ] Build passes
- [ ] E2E verification with Playwright MCP
- [ ] Multi-language verification (if display-related)
- [ ] Screenshots showing correct behavior
- [ ] Behavior verified from USER perspective

---

### Critical Bug Tracking

**Active bugs:** See `findings.md`
**MVP readiness:** See `MVP_AUDIT.md`

Before claiming ANY feature works, verify against MVP_AUDIT.md checklist.

---

### Integration Test Scripts

```bash
cd web
npx tsx scripts/test-database.js      # Database/schema changes
npx tsx scripts/test-supabase.js      # Auth changes
npx tsx scripts/test-openai.js        # Translation/TTS changes
npx tsx scripts/test-comprehensive.ts # Major features
```

**Reset test users:** `npx tsx scripts/create-test-users.ts`

**📖 Full testing guide:** `/docs/engineering/TESTING.md`

## Session Workflow

**Start:** `/clear` → read findings.md → read MVP_AUDIT.md → check PROJECT_LOG.md → fix bugs FIRST

**End:** Update findings.md status → Update MVP_AUDIT.md → Update PROJECT_LOG.md → **Run FULL tests**

**Debug:** Copy server logs → paste to Claude with page context

### Session Start Checklist (MANDATORY)

Before starting ANY work, read these files IN ORDER:

1. **`findings.md`** - Active bugs that MUST be fixed first
2. **`MVP_AUDIT.md`** - Feature checklist with pass/fail status
3. **`PROJECT_LOG.md`** - Current status, recent changes
4. **`~/.claude/skills/reflect/SKILL.md`** - Learned patterns

**Priority order:**
1. Fix P0 BLOCKER bugs (app unusable)
2. Fix P0 Critical bugs (major features broken)
3. Fix P1 High bugs (significant UX issues)
4. New features (ONLY after bugs fixed)

### Key Learnings (ENFORCED)

- **"It builds" ≠ "It works"** - Always verify with E2E
- **Test semantics, not structure** - Check WHAT is shown, not IF it renders
- **User perspective testing** - What should the USER see?
- **Multi-language verification** - Test EN→PT, EN→SV, NL→EN
- **Full flow testing** - Not just changed component, full user journey
- Scale testing with 500+ records for data-heavy features
- Double verification: Claude (Playwright) + User (device)

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
