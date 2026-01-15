---
name: commit-message-generator
description: Generate clear, conventional commit messages from code diffs or change descriptions. Use when the user needs help writing commit messages, wants to follow conventional commits format, or needs to summarize changes for git. Triggers include "commit message", "write commit", "git commit", "conventional commit", "summarize changes for commit".
---

# Commit Message Generator

## Conventional Commits Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

| Type | When to Use |
|------|-------------|
| `feat` | New feature for user |
| `fix` | Bug fix for user |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code change, no feature/fix |
| `perf` | Performance improvement |
| `test` | Adding/fixing tests |
| `chore` | Build, tools, deps |
| `ci` | CI/CD changes |

### Scope (optional)

The component or area affected: `auth`, `api`, `ui`, `db`, etc.

### Subject Rules

- Imperative mood ("add" not "added")
- No period at end
- Under 50 characters
- Lowercase first letter

## Examples

### Simple Changes

```
feat(auth): add password reset flow
fix(cart): prevent duplicate items
docs: update API authentication guide
style: format user service file
refactor(api): extract validation logic
perf(search): add result caching
test(auth): add login failure cases
chore: upgrade React to v18
```

### With Body

```
feat(checkout): add Apple Pay support

Integrate Apple Pay SDK for one-tap checkout.
Only available on Safari and iOS devices.

Closes #234
```

### Breaking Change

```
feat(api)!: change user endpoint response format

BREAKING CHANGE: User object now uses camelCase.
- `user_id` → `userId`
- `created_at` → `createdAt`

Migration guide: docs/api-v2-migration.md
```

### Multiple Changes

If changes are related, combine:
```
feat(dashboard): add analytics widgets

- Add daily active users chart
- Add revenue trend graph
- Add user retention metric
```

If unrelated, separate commits.

## Generating from Diff

### Process

1. Identify the primary change type
2. Determine scope from files changed
3. Summarize the "what" in subject
4. Add "why" in body if not obvious

### Diff Analysis

```diff
- const result = data.filter(x => x.active)
+ const result = data.filter(x => x.active && x.verified)
```
→ `fix(users): filter only verified active users`

```diff
+ export async function retryWithBackoff(fn, maxRetries = 3) {
+   // implementation
+ }
```
→ `feat(utils): add retry with exponential backoff`

```diff
- // TODO: optimize this query
- const users = await db.query('SELECT * FROM users')
+ const users = await db.query('SELECT id, name FROM users WHERE active = true')
```
→ `perf(db): optimize user query with projection and filter`

## Output Format

```markdown
## Suggested Commit Message

```
[commit message here]
```

### Breakdown
- **Type:** [type] - [why this type]
- **Scope:** [scope] - [affected area]
- **Subject:** [analysis of change]

### Alternative Options
1. `[alternative 1]`
2. `[alternative 2]`
```

## Quality Checks

- [ ] Type accurately reflects change
- [ ] Subject is imperative mood
- [ ] Subject under 50 chars
- [ ] Scope matches affected area
- [ ] Breaking changes marked with !
- [ ] Body explains "why" if needed
