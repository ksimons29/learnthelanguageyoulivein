---
name: changelog-generator
description: Generate user-facing changelogs and release notes from git commits, PRs, or feature descriptions. Use when the user needs to create release notes, changelog entries, version updates, or "what's new" content. Triggers include "changelog", "release notes", "what's new", "version update", "generate changelog", "write release notes".
---

# Changelog Generator

## Core Principles

1. **User-focused**: Write for end users, not developers
2. **Benefit-oriented**: Explain impact, not just changes
3. **Scannable**: Categories and bullets
4. **Consistent**: Same format every release

## Changelog Format

### Standard Entry

```markdown
## [Version] - YYYY-MM-DD

### Added
- **[Feature name]**: [User benefit in one sentence]

### Changed
- **[What changed]**: [Why it's better now]

### Fixed
- **[Bug area]**: [What users can now do]

### Deprecated
- **[Feature]**: [What to use instead]

### Removed
- **[Feature]**: [Why and alternatives]

### Security
- **[Issue]**: [What was addressed]
```

### User-Friendly Version

```markdown
## What's New in v2.1.0

### 🚀 New Features

**Dark Mode**
Finally! Switch to dark mode in Settings > Appearance. Your eyes will thank you during those late-night sessions.

**Bulk Export**
Export up to 1,000 items at once. Select multiple items and hit Export.

### ✨ Improvements

- **Faster search**: Results now appear 3x faster
- **Better mobile layout**: Cards stack properly on small screens

### 🐛 Bug Fixes

- Fixed: Login sometimes failed on Safari
- Fixed: Charts not loading for large datasets

### 📝 Notes

- Minimum iOS version is now 15.0
- API v1 deprecated (sunset: March 2025)
```

## Commit → Changelog Translation

| Commit Type | Changelog Section | User-Facing? |
|-------------|-------------------|--------------|
| feat: | Added | Yes |
| fix: | Fixed | Yes |
| perf: | Changed | Usually |
| docs: | (skip) | No |
| refactor: | (skip) | No |
| test: | (skip) | No |
| chore: | (skip) | No |

### Translation Rules

**Technical → User-Friendly:**
- "Implemented caching layer" → "Pages now load 50% faster"
- "Refactored auth module" → (skip or) "Improved login reliability"
- "Fixed null pointer exception" → "Fixed crash when opening empty folders"
- "Added rate limiting" → "Improved system stability during high traffic"

## Output Formats

### For GitHub Releases

```markdown
## Highlights

- 🎉 Dark mode is here
- ⚡ 3x faster search

## All Changes

### Features
- feat: dark mode (#123)
- feat: bulk export (#124)

### Fixes  
- fix: Safari login (#125)

**Full Changelog**: v2.0.0...v2.1.0
```

### For In-App "What's New"

```markdown
# What's New

## Dark Mode 🌙
Switch to dark mode anytime in Settings.

## Faster Search ⚡
Find what you need 3x faster.

---
[View all updates](link)
```

### For Email/Newsletter

```markdown
## v2.1 is here!

**Dark mode** - Your most requested feature is live.
**3x faster search** - We rebuilt search from scratch.
**Bug fixes** - Safari login and chart loading issues resolved.

[See full changelog →](link)
```

## Quality Checks

- [ ] No developer jargon
- [ ] Benefits explained, not just changes
- [ ] Grouped by category
- [ ] Breaking changes highlighted
- [ ] Dates in ISO format (YYYY-MM-DD)
- [ ] Links to relevant docs/PRs
