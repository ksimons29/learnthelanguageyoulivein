# LLYLI Web Prototypes

## Status

These mockups and documentation reflect an **earlier color palette** (iOS-style blue/green/red).

**For implementation colors, always follow:**
[`/docs/design/design-system.md`](/docs/design/design-system.md)

---

## What's Still Valid

These prototypes remain valuable reference for:

- **Screen layouts and flows** - Component placement and information architecture
- **UX patterns and interactions** - How users navigate and complete tasks
- **Information hierarchy** - What's emphasized on each screen
- **Feature specifications** - What each screen should do

---

## What's Changed (Color Palette)

The implementation now uses the **Moleskine design aesthetic**:

| Old (These Mockups) | New (Implementation) |
|---------------------|----------------------|
| Blue (#007AFF) primary actions | Coral (#E85C4A) primary CTA |
| Blue navigation | Teal (#0C6B70) navigation |
| iOS green/red/orange semantic | Muted brown/taupe/teal semantic |
| White backgrounds | Cream paper texture (#F8F3E7) |
| Standard rounded corners | Binding-edge cards (rounded right only) |

---

## Files in This Directory

| File | Purpose | Status |
|------|---------|--------|
| `SCREEN_ORDER.md` | Screen flow documentation (13 screens) | **Valid** - Use for UX flow |
| `NOTEBOOK-DESIGN-RATIONALE.md` | Notebook screen UX decisions | **Valid** - Use for UX rationale |
| `LLYLI-Mockups-Changelog.md` | Design evolution history | **Valid** - Reference only |
| `prototype.html` | Interactive HTML prototype | **Valid** - Layout reference |
| `*.png` (21 files) | Visual mockups | **Valid** - Layout reference |
| `archive/` | Superseded documentation | Archived |

---

## Using These Mockups

### Do
- Reference for **layout** and **component placement**
- Use for understanding **screen flows** and **user journeys**
- Check for **feature requirements** and **content**

### Don't
- Copy colors directly - use design-system.md tokens instead
- Assume button styles - follow Moleskine component patterns
- Use iOS-style semantic colors - use the Moleskine state colors

---

## Screen Overview

From `SCREEN_ORDER.md`:

1. **Onboarding** (3 screens) - Welcome, value prop, language selection
2. **Main Flow** (7 screens) - Home, Capture, Review, Notebook, Progress, Word Detail, Settings
3. **Reference** (3 screens) - Help, Info modals

See `SCREEN_ORDER.md` for detailed screen specifications.

---

*Last updated: 2026-01-15*
