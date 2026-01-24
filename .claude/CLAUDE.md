# LLYLI

Language learning app that turns real-life phrases into smart cards with native audio and spaced repetition.

## Product Context

### The Problem We Solve

**75% of language learners save words but never review them.**

People living abroad encounter useful vocabulary daily but fail to retain it. Traditional apps require too much effort, show repetitive content, and use outdated algorithms.

### How LLYLI Works

| Step | What Happens | Time |
|------|--------------|------|
| **Capture** | Type a word → get instant translation + native audio | 2 seconds |
| **Practice** | AI creates unique sentences combining 2-4 of your words | 10 min/day |
| **Master** | FSRS-4.5 algorithm schedules reviews at optimal timing | Automatic |

### Key Differentiators

1. **Dynamic Sentence Generation** - AI combines user's words in sentences that NEVER repeat (not isolated flashcards)
2. **FSRS-4.5 Algorithm** - 2023 ML-based spaced repetition, 36 years newer than most apps
3. **Memory Context** - Record WHERE/WHEN you learned each phrase (encoding specificity)
4. **European Portuguese** - pt-PT with proper spelling and "tu" forms (NOT Brazilian)

### Target Users (Personas)

- **Sofia** - Dutch designer in Lisbon, thinks "I'll remember" but doesn't → needs frictionless capture
- **Ralf** - Goal-setter wanting "3 words/day, 1000/year" → needs gamification + structure
- **Maria** - Abandoned Duolingo for wrong regional variant → needs correct EU Portuguese

### Supported Language Pairs (MVP)

| From | To |
|------|-----|
| English | Portuguese (Portugal) |
| English | Swedish |
| Dutch | English |

### What LLYLI Does NOT Do (By Design)

| Anti-Pattern | Why Avoided |
|--------------|-------------|
| Isolated word-pair flashcards | Artificial, impedes real-world recall |
| Fixed intervals (1/3/7 days) | Doesn't adapt to individual forgetting |
| Sentences > 10 words | Cognitive overload |
| Repeated example sentences | Novelty loss kills engagement |
| Brazilian Portuguese (pt-BR) | Primary users need European Portuguese |
| Heavy currency/store systems | Distracts from learning |

### Core Features

| Feature | Key Details |
|---------|-------------|
| **Word Capture** | Auto-translate, auto-categorize (8 categories), TTS audio, optional memory context |
| **Sentence Review** | Fill-blank, multiple choice, type translation - difficulty adapts to mastery |
| **Mastery System** | 3 correct recalls on SEPARATE sessions (>2hrs apart) = "Ready to Use" |
| **Notebook** | Browse by category, search, attention section for struggling words |
| **Gamification** | Daily goal (10), streaks with freeze, 3x3 bingo, Boss Round |

### FSRS Mastery Rule

A word reaches "Ready to Use" after **3 correct recalls on 3 separate sessions**:
- Sessions must be >2 hours apart (prevents cramming)
- If answered wrong after mastery, counter resets to 0
- This is the core learning mechanic - don't bypass it

**Full specification:** See `PRODUCT_SPECIFICATION.md`

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

## 🚨 MANDATORY: Code Change Protocol (NO EXCEPTIONS)

Claude MUST follow this protocol for EVERY code change. Skipping steps is prohibited.

### Before Writing Any Code

Claude MUST announce in this format:

```
📋 CHANGE PLAN
─────────────────────────────────────────────
Files to change:
  • path/to/file1.ts
  • path/to/file2.tsx

Change type: [bug fix / new feature / refactor / styling]

Required tests:
  ✓ Build (MANDATORY)
  ✓ Unit tests (MANDATORY)
  ✓ Integration test: [script name or N/A]
  ✓ E2E verification: [YES - reason / NO]
  ✓ Multi-language: [YES - reason / NO]

Estimated impact: [low / medium / high]
Risk level: [low / medium / high]

Proceed? (waiting for confirmation)
─────────────────────────────────────────────
```

**User must type "yes" or "proceed" before Claude writes code.**

### While Writing Code

Claude MUST use TodoWrite to track:
1. Make code changes
2. Run build
3. Run unit tests
4. [Run integration test if needed]
5. [Run E2E verification if needed]
6. [Run multi-language verification if needed]
7. Update documentation

Mark each todo as in_progress → completed as you go.

### After Writing Code (MANDATORY VERIFICATION)

Claude MUST run these commands and show results:

**Step 1: Build**
```bash
cd web && npm run build
```
- If FAILS → Stop, fix, re-run. Do not proceed.
- If PASSES → Continue to Step 2.

**Step 2: Unit Tests**
```bash
cd web && npm run test:run
```
- If FAILS → Stop, fix, re-run. Do not proceed.
- If PASSES → Continue to Step 3.

**Step 3: Project Log Size Check**
```bash
cd web && npm run log:check
```
- If FAILS (>900 lines) → Run `npm run log:archive` to archive old sessions
- If PASSES → Continue to Step 4.
- This check enforces the archiving rule: Keep only 10 most recent sessions in PROJECT_LOG.md

**Step 4: Integration Tests (Conditional)**

Run if you changed:
- Schema → `npx tsx scripts/test-database.js`
- Auth → `npx tsx scripts/test-supabase.js`
- Translation/TTS → `npx tsx scripts/test-openai.js`
- Major features → `npx tsx scripts/test-comprehensive.ts`
- Gamification → `npx tsx scripts/test-gamification-api.ts`

**Step 5: E2E Verification (Conditional)**

REQUIRED if changed these paths:
- `app/review/**` → Full review flow (5+ words)
- `app/notebook/**` → Browse categories + word detail
- `app/capture/**` → Capture in both languages
- `app/today/**` → Dashboard metrics
- `components/sentence/**` → Sentence generation
- `lib/fsrs/**` → Verify scheduling
- `stores/**` → Full flow using that store

Use Playwright MCP:
1. Navigate to production: https://llyli.vercel.app
2. Sign in with appropriate test account
3. Complete the FULL user flow
4. Take browser_snapshot at each critical step
5. Verify from USER PERSPECTIVE (not developer perspective)

**Step 6: Multi-Language Verification (Conditional)**

REQUIRED if changed:
- Translation logic
- Display logic (what text/language is shown)
- Word picker/selector
- Multiple choice options
- Any component that shows native vs target language

Test with ALL three accounts:
- `test-en-pt@llyli.test` (EN→PT)
- `test-en-sv@llyli.test` (EN→SV)
- `test-nl-en@llyli.test` (NL→EN)

Password: `TestPassword123!`

Verify:
- Correct language shown in each case
- No language mixing in UI
- Native language = language user understands
- Target language = language user is learning

### Completion Report (MANDATORY)

Claude MUST show this report before saying "done":

```
✅ VERIFICATION COMPLETE
─────────────────────────────────────────────
Changed files:
  • [list files]

Tests run:
  ✅ Build: PASSED
  ✅ Unit tests: PASSED (X tests)
  ✅ Log size: PASSED (X lines)
  [✅/⏭️] Integration: [result or N/A]
  [✅/⏭️] E2E: [result or N/A]
  [✅/⏭️] Multi-language: [result or N/A]

Bugs fixed: [GitHub issue # or N/A]

Documentation updated:
  [ ] PROJECT_LOG.md [if significant change]
  [ ] MVP_AUDIT.md [if feature completed]

Status: READY FOR REVIEW
─────────────────────────────────────────────
```

### Violation Handling

If Claude skips any step:
1. User should respond: "Run the mandatory tests"
2. Claude MUST stop and run all required tests
3. Claude MUST show the completion report

If any test fails:
1. Claude MUST stop immediately
2. Claude MUST show the error clearly
3. Claude MUST fix the issue
4. Claude MUST re-run ALL tests from the start
5. Only proceed when everything passes

### Quick Reference Tables

**What Requires E2E?**

| Change Location | E2E Required? | Reason |
|-----------------|---------------|--------|
| `app/review/**` | ✅ YES | Critical user flow |
| `app/notebook/**` | ✅ YES | Critical user flow |
| `app/capture/**` | ✅ YES | Critical user flow |
| `app/today/**` | ✅ YES | Dashboard accuracy |
| `components/ui/**` | ⏭️ NO | UI components only |
| `lib/fsrs/**` | ✅ YES | Algorithm correctness |
| `stores/**` | ✅ YES | State management |
| Styling only | ⏭️ NO | Visual changes |

**What Requires Multi-Language?**

| Change Type | Multi-Language? | Reason |
|-------------|-----------------|--------|
| Translation logic | ✅ YES | Language pairs |
| Display text/language | ✅ YES | Language direction |
| Word picker | ✅ YES | Native vs target |
| Multiple choice | ✅ YES | Option language |
| Review flashcards | ✅ YES | Card language |
| Styling only | ⏭️ NO | No language impact |
| FSRS scheduling | ⏭️ NO | Language-agnostic |

## Key Documentation

| Document | Purpose |
|----------|---------|
| `MVP_AUDIT.md` | **★★ CRITICAL - Feature checklist** - 70 steps to verify |
| `PROJECT_LOG.md` | **★★ Project status** - Current progress and session history |
| `/docs/design/design-system.md` | **★ Moleskine design tokens** - Always for UI |
| `/docs/engineering/TESTING.md` | **★ Testing guide** - Run after every feature |
| `~/.claude/skills/vercel-react-best-practices/` | **★ React/Next.js performance** - 45 rules |
| `/docs/engineering/implementation_plan.md` | Architecture, data model, API routes |
| `/docs/engineering/session-workflow.md` | Claude Code session best practices |
| `/docs/engineering/CAPACITOR_IOS_SETUP.md` | iOS app setup, native plugins |
| `/docs/product/prd.md` | User stories, acceptance criteria |
| `/docs/design/wireframes.md` | UI layouts, screen flows |

## Implementation Status

**See `MVP_AUDIT.md` for detailed test results.**

### Core Features ✅
- Authentication (Supabase) - verified working
- Phrase capture with auto-translation - working
- TTS audio generation & storage - working (retry on timeout)
- FSRS spaced repetition engine - working
- Review sessions (word + sentence) - working
- Notebook browser with categories - working
- Today dashboard - working
- Progress dashboard - working
- Gamification (streaks, bingo, boss round) - working
- Product tours (Today page) - working

### In Progress ⚠️
- Product Tours (#107-#113) - remaining page tours
- PWA offline caching - basic setup done
- iOS App Store submission - Capacitor setup complete

### Not Started ❌
- Stripe payments

### MVP Readiness
- **70 feature steps defined** in MVP_AUDIT.md
- **48 passing (69%), 0 failing, 20 untested**
- **0 open bugs** - all resolved
- **MVP ready** - minor items remaining

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

## E2E Test Specs

Detailed E2E test cases for specific features:

| Feature | Test File | When to Run |
|---------|-----------|-------------|
| Product Tours | `/docs/engineering/e2e-tests/product-tours.md` | Changes to tours, Driver.js, or feedback widget |
| Memory Context | `/docs/engineering/e2e-tests/memory-context.md` | Changes to capture, notebook, or memory fields |
| Full App | `/docs/engineering/TESTING.md` | Major features, releases |

**Integration Test Scripts:**
```bash
cd web
npx tsx scripts/test-database.js      # Database/schema changes
npx tsx scripts/test-supabase.js      # Auth changes
npx tsx scripts/test-openai.js        # Translation/TTS changes
npx tsx scripts/test-comprehensive.ts # Major features
```

**Reset test users:** `npx tsx scripts/create-test-users.ts`

## Session Workflow

**Start:** `/clear` → read PROJECT_LOG.md → check MVP_AUDIT.md if needed

**End:** Update PROJECT_LOG.md → Update MVP_AUDIT.md (if features tested) → **Run FULL tests**

**Debug:** Copy server logs → paste to Claude with page context

### Session Start Checklist (MANDATORY)

Before starting ANY work, read these files IN ORDER:

1. **`PROJECT_LOG.md`** - Current status, open bugs, recent changes
2. **`MVP_AUDIT.md`** - Feature checklist with pass/fail status (if testing)
3. **Check PROJECT_LOG.md size** - Run `cd web && npm run log:check`. If >900 lines, run `npm run log:archive`
4. **`~/.claude/skills/reflect/SKILL.md`** - Learned patterns

**Priority order:**
1. Fix any open bugs (check PROJECT_LOG.md Open Bugs section)
2. Continue in-progress features
3. New features

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
