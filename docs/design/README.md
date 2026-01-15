# LLYLI Design System

## Philosophy

LLYLI uses a **"Moleskine notebook"** aesthetic - a premium digital notebook for your language journey. Every screen is a page. Every interaction feels crafted. The coral accent is your ribbon bookmark, used sparingly but distinctively.

**Core Metaphor:** You are building a digital language notebook, not an app with notebook colors.

---

## Source of Truth

**All design decisions live in [`design-system.md`](./design-system.md)**

This single document contains:
- Complete CSS token system (colors, typography, spacing, shadows)
- Core component specifications
- Layout guidelines
- Screen redesign patterns
- Design rules and principles

---

## File Structure

```
/docs/design/
├── README.md           # This file - overview & how to update
├── design-system.md    # THE source of truth for all design decisions
├── wireframes.md       # Screen layouts and user flows (ASCII wireframes)
└── archive/            # Superseded documentation (preserved for history)
```

---

## How to Update the Design System

### For Design Token Changes (colors, spacing, typography)

1. **Update the spec** in `design-system.md` Part 1 (Design Tokens)
2. **Update the CSS** in `web/src/app/globals.css`
3. **Run build** to verify no breaks: `cd web && npm run build`

### For Component Changes

1. **Update the spec** in `design-system.md` Part 2 (Core Components)
2. **Update/create component** in `web/src/components/ui/`
3. **Update exports** in `web/src/components/ui/index.ts`
4. **Run build** to verify

### For New Screen Designs

1. **Add wireframe** to `wireframes.md` if needed
2. **Document pattern** in `design-system.md` Part 4 (Screen Redesigns)
3. **Implement** following existing component patterns

---

## Key Design Rules

These rules create the distinctive Moleskine aesthetic:

### The "Ribbon Rule"
**Coral (#E85C4A) appears as ONE dominant element per screen maximum.**
- Home: Capture button is coral, everything else is teal/neutral
- Review: Reveal button is coral, grading uses semantic colors
- Capture: Save button is coral

### The "Binding Rule"
**Cards have rounded corners on right, square on left (with binding strip).**
- Use `rounded-r-[var(--radius-md)]` for the Moleskine page effect
- Binding strip uses dashed stitch pattern

### The "Texture Rule"
**Backgrounds have subtle paper grain, surfaces are clean white.**
- Page backgrounds: textured cream (`--surface-notebook`)
- Card surfaces: clean white (`--surface-page`)
- Never texture on text-heavy areas

### The "Typography Rule"
**Headings are serif (Libre Baskerville), UI is sans-serif (Inter).**
- Page titles: serif
- Card titles: serif
- Button text: sans-serif
- Body text: sans-serif

---

## Color Palette Quick Reference

| Token | Hex | Usage |
|-------|-----|-------|
| `--surface-notebook` | #F8F3E7 | Page backgrounds |
| `--surface-page` | #FFFFFF | Card surfaces |
| `--accent-ribbon` | #E85C4A | Primary CTA (coral) |
| `--accent-nav` | #0C6B70 | Navigation states (teal) |
| `--text-heading` | #1D262A | Headings |
| `--text-body` | #2D3436 | Body text |
| `--text-muted` | #6C7275 | Secondary text |

See `design-system.md` for the complete token list.

---

## Related Documentation

- **Screen Flows:** `/prototypes/web/SCREEN_ORDER.md`
- **Notebook UX Rationale:** `/prototypes/web/NOTEBOOK-DESIGN-RATIONALE.md`
- **Visual Mockups:** `/prototypes/web/*.png`

---

*Last updated: 2026-01-15*
