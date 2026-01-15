# Color Swap Required for Production

**Status**: 🚨 CRITICAL - Must be addressed before launch
**Created**: 2026-01-14
**Priority**: High
**Affects**: All UI mockups and future implementation

---

## Issue Summary

The current Frame0 mockups use **blue (#007AFF)** as the primary action color throughout the application. This is a **placeholder color** and must be replaced with LLYLI's actual brand colors before implementation.

**Current State**: Blue-heavy design using iOS system colors
**Target State**: LLYLI brand colors with strategic color hierarchy

---

## Why Blue Was Used (Temporary)

Blue was used in the mockups for these reasons:

1. **Industry Standard**: Blue is the default for "interactive elements" in iOS apps
2. **Familiarity**: Users instinctively know "blue = tap here"
3. **Placeholder**: Without final LLYLI brand colors defined, blue was safe default
4. **Framework**: Established the color strategy that can be swapped systematically

**This was NOT the final color scheme - it's a template waiting for LLYLI's brand identity.**

---

## Required Color Swaps

### What Needs to Change

All instances of **blue (#007AFF)** should be evaluated and replaced with LLYLI brand colors according to this hierarchy:

#### Current Blue Usage That Must Be Reconsidered:

1. **Primary CTA Buttons**
   - Current: Blue "Capture" button, blue FAB
   - Should be: **Your primary brand color** (red if red is meant to stand out)

2. **Selected Tab States**
   - Current: Blue selected tabs in bottom navigation
   - Should be: **Your primary brand color**

3. **Interactive Elements**
   - Current: Blue practice buttons, blue play icons
   - Should be: **Your primary brand color**

4. **"Reveal" Button (Review Session)**
   - Current: Blue
   - Should be: **Your primary brand color**

---

## Proposed LLYLI Color Strategy

Based on your direction "use red for parts that need to stand out, green as counterpart":

### Primary Actions & Standout Elements → RED
**Use LLYLI Red for:**
- ✅ Primary "Capture" button (most important action)
- ✅ Floating Action Button (FAB)
- ✅ "Reveal" button in Review Session
- ✅ Selected tab state in navigation
- ✅ Primary practice/action buttons

**Rationale**: If red is your brand color and you want things to "stand out," red should be the hero color for primary actions.

### Secondary Actions & Positive States → GREEN
**Use LLYLI Green for:**
- ✅ "Easy" grading button (already implemented)
- ✅ Captured count in daily progress
- ✅ Success states, correct answers
- ✅ Secondary action buttons (optional)
- ✅ Streak indicators (positive achievement)

**Rationale**: Green as the "counterpart" to red provides balance and signals positive/successful actions.

### Warnings & Medium Priority → ORANGE
**Use LLYLI Orange for:**
- ✅ "Good" grading button (already implemented)
- ✅ Due count badges
- ✅ Warning states
- ✅ Attention-needed items (not critical)

### Problems & Struggling Items → DEEP RED/DARK RED
**Use darker red or separate "danger" color for:**
- ✅ "Hard" grading button (already implemented)
- ✅ Struggling items in Progress screen (already implemented)
- ✅ Failed attempt counts
- ✅ Error states

**Note**: This should be visually distinct from primary red if primary is also red.

### Neutral & Inactive → GRAY SCALE
**Use grays for:**
- ✅ Unselected tabs
- ✅ Secondary text
- ✅ Borders
- ✅ Backgrounds

---

## Detailed Swap Checklist

### Color Mapping: Current (Placeholder) → LLYLI Brand

| Current Placeholder | LLYLI Brand Color | Hex Value | Usage |
|-------------------|------------------|-----------|-------|
| Blue #007AFF | **Coral Red** | #E85C48 | Primary actions, CTAs, standout elements |
| White #FFFFFF | **Cream** | #F8F3E6 | Main backgrounds |
| Light Gray #F5F5F7 | **Light Beige** | #EFE1D6 | Surface/card backgrounds |
| Green #34C759 | **Warm Taupe** | #B58B82 | Success states, positive feedback |
| Orange #FF9500 | **Deep Brown** | #8C5B52 | Warnings, medium priority |
| Red #FF3B30 | **Deep Brown (darker)** | #8C5B52 | Struggling items, errors |
| Medium Gray #8E8E93 | **Neutral Gray** | #BABEB3 | Inactive states, secondary text |
| Light Blue (for secondary) | **Teal Gray** | #5B7979 | Secondary actions, counterpart |
| Black #000000 | **Text Black** | #000000 | Primary text |
| Dark Gray | **Text Slate** | #24272C | Headings, emphasis |

### Screen: Home - Today

| Element | Current Color | LLYLI Color | Exact Hex | Rationale |
|---------|---------------|------------|-----------|-----------|
| iPhone frame background | Very Light Gray | **Cream** | #F8F3E6 | Warm notebook feel |
| Primary "Capture" button | Blue #007AFF | **Coral Red** | #E85C48 | Hero action, needs to stand out |
| Secondary "Review Due" button | Light blue bg | **Light Beige bg** | #EFE1D6 | Card surface |
| Review Due button text | Blue #007AFF | **Teal Gray** | #5B7979 | Secondary action, counterpart |
| Due count badge | Orange #FF9500 | **Deep Brown** | #8C5B52 | Attention needed |
| Captured count (5) | Green #34C759 | **Warm Taupe** | #B58B82 | Positive metric |
| Reviewed count (8) | Blue #007AFF | **Teal Gray** | #5B7979 | Achievement metric |
| Streak count (7🔥) | Orange #FF9500 | **Warm Taupe** | #B58B82 | Achievement/gamification |
| FAB (floating +) | Blue #007AFF | **Coral Red** | #E85C48 | Always-accessible capture |
| Selected tab (Today) | Blue #007AFF | **Coral Red** | #E85C48 | Active navigation state |
| Unselected tabs | Gray #8E8E93 | **Neutral Gray** | #BABEB3 | Inactive navigation |
| Action icons (✎ ▶) | Blue #007AFF | **Coral Red** | #E85C48 | Interactive elements |
| Card backgrounds | White #FFFFFF | **Light Beige** | #EFE1D6 | Surface color |
| Card borders | Light Gray #E0E0E0 | **Neutral Gray** | #BABEB3 | Subtle separation |
| Page title "Today" | Black #000000 | **Text Slate** | #24272C | Emphasis heading |
| Body text | Black #000000 | **Text Black** | #000000 | Primary text |
| Secondary text | Gray #8E8E93 | **Neutral Gray** | #BABEB3 | Muted labels |

### Screen: Review Session

| Element | Current Color | LLYLI Color | Exact Hex | Rationale |
|---------|---------------|------------|-----------|-----------|
| iPhone frame background | Very Light Gray | **Cream** | #F8F3E6 | Warm notebook feel |
| "Reveal" button | Blue #007AFF | **Coral Red** | #E85C48 | Primary action in review flow |
| Progress bar background | Light Gray | **Light Beige** | #EFE1D6 | Surface |
| Progress bar fill | Blue #007AFF | **Coral Red** | #E85C48 | Active progress indicator |
| "Hard" button bg | Light Red #FFEBEA | **Light Beige** | #EFE1D6 | Surface |
| "Hard" button text/border | Red #FF3B30 | **Deep Brown** | #8C5B52 | Struggle indicator |
| "Good" button bg | Light Orange | **Light Beige** | #EFE1D6 | Surface |
| "Good" button text/border | Orange #FF9500 | **Warm Taupe** | #B58B82 | Medium confidence |
| "Easy" button bg | Green #34C759 | **Teal Gray** | #5B7979 | Success/mastery (counterpart) |
| "Easy" button text | White | **Cream** | #F8F3E6 | High contrast on teal |
| Highlighted due words bg | Light blue | **Light Beige** | #EFE1D6 | Subtle highlight |
| Highlighted due words border | Blue #007AFF | **Coral Red** | #E85C48 | Draw attention to practice words |
| Practice card background | White | **Cream** | #F8F3E6 | Main surface |
| Play audio button circle bg | Light blue | **Light Beige** | #EFE1D6 | Surface |
| Play audio button icon | Blue #007AFF | **Coral Red** | #E85C48 | Interactive element |
| "MIXED PRACTICE" badge text | Blue #007AFF | **Coral Red** | #E85C48 | Standout info badge |
| Body text | Black | **Text Black** | #000000 | Primary text |
| Secondary text (labels) | Gray | **Neutral Gray** | #BABEB3 | Muted labels |

### Screen: Progress

| Element | Current Color | LLYLI Color | Exact Hex | Rationale |
|---------|---------------|------------|-----------|-----------|
| iPhone frame background | Very Light Gray | **Cream** | #F8F3E6 | Warm notebook feel |
| "Practice Now" button (Due Today) | Blue #007AFF | **Coral Red** | #E85C48 | Primary action |
| Due count number (12) | Blue #007AFF | **Coral Red** | #E85C48 | Attention metric |
| Struggling card backgrounds | White | **Cream** | #F8F3E6 | Main surface |
| Struggling card borders | Light Red | **Deep Brown** | #8C5B52 | Problem indicator |
| Failed count labels ("Failed 4x") | Red #FF3B30 | **Deep Brown** | #8C5B52 | Error/struggle metric |
| Practice icons (▶) | Blue #007AFF | **Coral Red** | #E85C48 | Action buttons |
| Context practice button bg | Light blue | **Light Beige** | #EFE1D6 | Surface |
| Context practice button text | Blue #007AFF | **Teal Gray** | #5B7979 | Secondary action |
| Selected tab (Progress) | Blue #007AFF | **Coral Red** | #E85C48 | Active navigation |
| Card backgrounds | White | **Cream** | #F8F3E6 | Main surface |

### Screen: Quick Capture

| Element | Current Color | LLYLI Color | Exact Hex | Rationale |
|---------|---------------|------------|-----------|-----------|
| Sheet background | White | **Cream** | #F8F3E6 | Main surface |
| "Save" button | Blue #007AFF | **Coral Red** | #E85C48 | Primary action (capture completion) |
| Voice input icon | Blue #007AFF | **Teal Gray** | #5B7979 | Secondary interactive element |
| Input field background | Light gray | **Light Beige** | #EFE1D6 | Surface |

### Screen: Edit Details

| Element | Current Color | LLYLI Color | Exact Hex | Rationale |
|---------|---------------|------------|-----------|-----------|
| Page background | White | **Cream** | #F8F3E6 | Main surface |
| "Save" link (top right) | Blue #007AFF | **Coral Red** | #E85C48 | Primary action |
| TTS play button circle bg | Light blue | **Light Beige** | #EFE1D6 | Surface |
| TTS play button icon | Blue #007AFF | **Coral Red** | #E85C48 | Interactive element |
| Selected tag chips bg | Light blue | **Light Beige** | #EFE1D6 | Surface |
| Selected tag chips text/border | Blue #007AFF | **Coral Red** | #E85C48 | Selected state |
| Unselected tag chips bg | Light gray | **Light Beige** | #EFE1D6 | Surface |
| Unselected tag chips text | Gray | **Neutral Gray** | #BABEB3 | Inactive state |

### Screen: Notebook

| Element | Current Color | LLYLI Color | Exact Hex | Rationale |
|---------|---------------|------------|-----------|-----------|
| Page background | Very Light Gray | **Cream** | #F8F3E6 | Warm notebook feel |
| Due count badges | Orange #FF9500 | **Deep Brown** | #8C5B52 | Attention metric |
| FAB | Blue #007AFF | **Coral Red** | #E85C48 | Capture action |
| Selected tab (Notebook) | Blue #007AFF | **Coral Red** | #E85C48 | Active navigation |
| Category card backgrounds | White | **Light Beige** | #EFE1D6 | Surface color |
| Inbox badge | Blue circle | **Coral Red circle** | #E85C48 | Standout new items |

---

## Implementation Strategy

### Step 1: LLYLI Brand Colors (DEFINED)

**✅ FINAL COLOR PALETTE - USE THESE EXACT VALUES**

```css
:root {
  /* PRIMARY - Accent coral red for hero actions, CTAs, standout elements */
  --color-accent-coral: #E85C48;

  /* BACKGROUNDS */
  --color-bg-cream: #F8F3E6;
  --color-surface-beige: #EFE1D6;

  /* SECONDARY - Muted teal gray as counterpart/secondary actions */
  --color-teal-gray: #5B7979;

  /* NEUTRALS */
  --color-neutral-gray: #BABEB3;
  --color-warm-taupe: #B58B82;
  --color-deep-brown: #8C5B52;

  /* TEXT */
  --color-text-black: #000000;
  --color-text-slate: #24272C;
}
```

**Color Roles:**
- **Coral Red (#E85C48)**: Primary actions, selected states, CTAs - "things that need to stand out"
- **Teal Gray (#5B7979)**: Secondary actions, counterpart to coral - calm, professional
- **Cream/Beige (#F8F3E6, #EFE1D6)**: Backgrounds - warm, notebook feel
- **Deep Brown (#8C5B52)**: Warnings, struggling items - serious but not alarming
- **Warm Taupe (#B58B82)**: Success states, positive feedback
- **Neutral Gray (#BABEB3)**: Inactive states, borders

### Step 2: Update Frame0 Mockups

1. Open `prototypes/web/LLYLI.f0`
2. For each colored screen, find all blue elements
3. Replace with appropriate LLYLI brand color using checklist above
4. Export new mockups for developer handoff

### Step 3: Update Documentation

1. Update `docs/design/colorscheme.md` with final brand colors
2. Update `prototypes/web/LLYLI-Color-Strategy.md` with new rationale
3. Update `prototypes/web/LLYLI-Mockups-Changelog.md` with color changes

### Step 4: Developer Implementation

1. Create design token system with brand colors
2. Never hardcode hex values - always use CSS variables or theme constants
3. Create component library with color props
4. Test all color combinations for WCAG AA accessibility

---

## Why This Matters

### Brand Identity
Using blue throughout makes LLYLI look like a generic iOS app. Your brand colors should dominate the interface to create distinctive identity.

### User Psychology
- **Red primary**: Creates urgency and energy around capture (your wedge feature)
- **Green counterpart**: Balances red with calm, positive reinforcement
- **Color contrast**: Red vs Green creates visual tension that blue alone cannot

### Competitive Differentiation
- Duolingo: Green everywhere
- Anki: Blue/white minimal
- LLYLI with red primary: **Stands out visually**, signals intensity and commitment

---

## Risks of NOT Changing

❌ **Generic appearance**: Looks like every other iOS app
❌ **Weak brand recall**: Users won't remember LLYLI's visual identity
❌ **Missed differentiation**: Doesn't leverage color psychology to signal "serious tool for committed learners"
❌ **Wasted design work**: All mockups need rework later anyway

---

## Questions to Answer Before Swap

1. **What is LLYLI's primary brand color?**
   - Is it red as suggested, or something else?
   - Hex value?

2. **What is the "counterpart" green?**
   - Hex value?
   - Should it be as prominent as primary, or more subtle?

3. **Should primary actions (Capture, FAB) be RED or a different brand color?**
   - If red = urgent/problems in user's mind, does making Capture red create anxiety?
   - Or does red = energy/action work for your brand?

4. **Do you have a full brand palette already defined?**
   - Logo colors?
   - Marketing site colors?
   - If yes, share the style guide

5. **Color accessibility concerns?**
   - Red-green color blindness affects ~8% of men
   - Need to ensure position + text + color (triple redundancy)

---

## Recommended Next Action

**OPTION A: Define brand colors now, update mockups**
1. Share LLYLI brand color palette (primary red, secondary green, etc.)
2. I'll update all Frame0 screens to use your colors
3. Re-export mockups ready for development

**OPTION B: Proceed with blue as placeholder, document swap**
1. Accept that blue is temporary
2. Developers use CSS variables everywhere
3. Swap colors once brand is finalized
4. Risk: Extra QA and visual regression testing

**RECOMMENDED: Option A** - Better to get colors right now in mockups than to swap later.

---

## Files to Update When Colors Are Defined

- [ ] `prototypes/web/LLYLI.f0` - All Frame0 screens
- [ ] `docs/design/colorscheme.md` - Color token reference
- [ ] `prototypes/web/LLYI-Color-Strategy.md` - Color psychology doc
- [ ] `prototypes/web/LLYLI-Mockups-Changelog.md` - Design decisions log
- [ ] Developer handoff: CSS variables, component library, Tailwind config

---

## Contact

**Issue Owner**: Koos
**Designer**: Claude Code
**Date Created**: 2026-01-14

**Status**: 🔴 BLOCKED - Waiting for final LLYLI brand color definitions

---

*This document ensures the color swap is not forgotten and provides clear guidance for implementation.*
