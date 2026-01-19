# Claude Code Session Workflow

Based on Vibecodelisboa best practices for efficient Claude Code sessions.

## Starting a New Feature

1. Run `/clear` to free up context window
2. Check `/context` to verify context is empty
3. Read the handoff doc if one exists: `/docs/engineering/HANDOFF.md`
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

1. Commit changes with descriptive message
2. If GitHub issue resolved, use convention: `fixes #N` in commit message
3. Update `CHANGELOG.md` with session summary
4. If context remains, create/update handoff doc for next session

---

## Handoff Documentation

When ending a session with remaining work, create `/docs/engineering/HANDOFF.md`:

```markdown
# Handoff Document - [Date]

## Quick Start
- `cd web && npm run dev` to start server
- Visit `localhost:3000`

## Current Status
- [What's working]
- [What's in progress]
- [Known issues]

## Remaining Tasks
- [ ] Task 1
- [ ] Task 2

## Key Files for Next Session
- `/path/to/important/file.ts` - Description

## Technical Notes
- [Any gotchas or important context]
```

**Why Handoff Docs Matter:**
- Reduces token usage on next session (no re-analysis needed)
- Preserves context that would be lost on `/clear`
- Enables faster onboarding for next session

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

**For PostgreSQL (Supabase):**
- Use pgAdmin, TablePlus, or DBeaver to browse data
- Connection string in `.env.local`: `DATABASE_URL`

**Drizzle commands:**
```bash
npm run db:push      # Push schema changes (dev only)
npm run db:generate  # Generate migrations
npm run db:migrate   # Run migrations (production)
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
