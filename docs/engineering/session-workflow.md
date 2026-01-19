# Claude Code Session Workflow

Based on Vibecodelisboa best practices for efficient Claude Code sessions.

## Starting a New Feature

1. Run `/clear` to free up context window
2. Check `/context` to verify context is empty
3. Read the project log: `PROJECT_LOG.md` (dashboard section for quick context)
4. Use **plan mode** (shift+tab) for multi-step or architectural work
5. Let Claude formulate a plan before approving implementation

## During Development

- Use `npm run dev` in a separate terminal (not via Claude) to see server logs directly
- Server logs help debug errors faster than having Claude test blindly
- Hot reload means changes appear instantly without restart
- If server crashes, restart with `npm run dev`

## Debugging Workflow

1. Copy error from server logs
2. Paste to Claude with context: "I'm on [page], seeing this error: [error]"
3. Let Claude investigate and fix
4. Test manually, report back if still broken

## Ending a Session

> **⚠️ MANDATORY: Update PROJECT_LOG.md before committing!**
> This is enforced by a pre-commit hook. The project log is the project's memory.

1. **Update `PROJECT_LOG.md`**:
   - Update Dashboard section (Recently Completed, In Progress, Open Bugs)
   - Add session entry at top of Session Log (files changed, decisions made)
   - Update Key Files if significant files were created
2. Commit changes with descriptive message
3. If GitHub issue resolved, use convention: `fixes #N` in commit message

### Claude Code Reminder
When planning tasks with TodoWrite, **always include "Update PROJECT_LOG.md" as the final todo item** for any session that creates or modifies files.

### Git Hooks Setup
After cloning the repo, install the pre-commit hook:
```bash
./scripts/install-hooks.sh
```
This hook warns you if you try to commit >2 files without updating PROJECT_LOG.md.

---

## PROJECT_LOG.md Structure

The project log consolidates all project documentation into a single file with three sections:

### 1. Dashboard (Always Current)
- **Quick Start**: Essential commands
- **Recently Completed**: Last 5 completed items with session references
- **In Progress**: Current work items
- **Not Started**: Upcoming priorities
- **Key Files**: Important files for current work
- **Open Bugs/Issues**: Active issue tracking

### 2. Session Log (Last 10-15 Sessions)
Each session entry includes:
- **Focus**: One sentence summary
- **Done**: What was accomplished
- **Files**: Table of created/modified files
- **Decisions**: Key architectural choices
- **Issues**: Created/fixed issue numbers
- **Testing**: What was verified

### 3. Archive Reference
Link to PROJECT_LOG_ARCHIVE.md for older sessions.

**Why This Matters:**
- Single source of truth (no hunting through multiple files)
- Dashboard provides instant context for new sessions
- Session history preserves institutional knowledge
- Archive prevents file bloat (archive when >500 lines)

---

## GitHub Integration

**Issue Management:**
- Check open issues before starting: `gh issue list`
- Move issues to "In Progress" when starting work
- Reference issues in commits: `fixes #N` or `closes #N`
- Update issue status when work completes

**Commit Conventions:**
```bash
# Feature commits
git commit -m "feat: add phrase capture with TTS

fixes #12"

# Bug fix commits
git commit -m "fix: resolve review session not ending

closes #15"
```

---

## Recommended MCP Servers

**Context7** - Live documentation for any library/framework:
```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@context7/mcp"]
    }
  }
}
```
Usage: "Use Context7 to get the latest Drizzle ORM docs"

**Chrome DevTools** - Automated browser testing:
```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-chrome-devtools"]
    }
  }
}
```
Usage: "Test the capture flow in the browser and tell me what you see"

---

## Database Inspection

**Pre-built validation queries:** See [`/scripts/database-queries.sql`](/scripts/database-queries.sql)

**How to run queries:**
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your LLYLI project
3. Click **SQL Editor** in left sidebar
4. Copy/paste query from `database-queries.sql`
5. Click **Run**

**Key queries to run regularly:**
- Section 1.1: Quick health check (all table counts)
- Section 2.4: Words due for review (verify matches app)
- Section 3.1: FSRS parameter distribution (algorithm working?)
- Section 6: Data integrity checks (should all return 0)

**Drizzle commands:**
```bash
npm run db:push      # Push schema changes (dev only)
npm run db:generate  # Generate migrations
npm run db:migrate   # Run migrations (production)
npm run db:studio    # Open Drizzle Studio UI
```

---

## Testing Guidelines

### Manual Testing Workflow
1. Start server: `npm run dev`
2. Test happy path manually
3. Test edge cases (empty states, errors)
4. Check server logs for errors
5. Report issues to Claude with full context

### What to Test
- **API Routes:** Request/response validation, error handling
- **FSRS Logic:** Review calculations, mastery progression
- **Components:** User interactions, state changes
- **Auth Flows:** Sign in, sign out, protected routes
