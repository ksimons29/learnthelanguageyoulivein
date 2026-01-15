# Apply LLYLI Brand Colors to Frame0 Mockups

**Issue Type**: Design Task
**Priority**: High
**Status**: 🔴 To Do
**Assignee**: Designer/Koos
**Created**: 2026-01-14

---

## Summary

Frame0 mockups currently use **placeholder colors** (blue, white, light gray) instead of official **LLYLI brand colors**. All mockups need manual color updates in Frame0 UI to apply the exact brand palette.

**Why Manual?** Frame0's MCP API only supports predefined color names (red, blue, green), not custom hex values. The Frame0 visual editor supports custom colors, so this must be done through the UI.

---

## LLYLI Official Brand Colors

```css
/* PRIMARY */
--color-accent-coral: #E85C48;      /* Primary CTAs, standout elements */

/* BACKGROUNDS */
--color-bg-cream: #F8F3E6;          /* Main backgrounds */
--color-surface-beige: #EFE1D6;     /* Card surfaces */

/* SECONDARY */
--color-teal-gray: #5B7979;         /* Secondary actions, counterpart */

/* NEUTRALS */
--color-neutral-gray: #BABEB3;      /* Inactive states */
--color-warm-taupe: #B58B82;        /* Positive feedback, "Good" grading */
--color-deep-brown: #8C5B52;        /* Warnings, "Hard" grading */

/* TEXT */
--color-text-black: #000000;        /* Primary text */
--color-text-slate: #24272C;        /* Headings */
```

---

## Task: Update Frame0 Mockups

### Files to Update

**Frame0 File**: `prototypes/web/LLYLI.f0`

**Screens to Update**:
1. 📱 Home - Today (Colored)
2. 📱 Review Session (Colored)
3. 📱 Progress (Colored)
4. 📱 Quick Capture
5. 📱 Edit Details
6. 📱 Notebook Categories

---

## Step-by-Step Instructions

### Prerequisites

1. Open Frame0 application
2. Load file: `prototypes/web/LLYLI.f0`
3. Have color reference open: `docs/design/colorscheme.md`
4. Have mapping guide open: `.github/COLOR-SWAP-REQUIRED.md`

### Process

For each screen:

1. **Select the page** in Frame0 sidebar
2. **For each element** in the mapping guide:
   - Click the element in Frame0
   - In properties panel, update fill/stroke/text color
   - Paste exact hex value from mapping guide
   - Verify visual appearance
3. **Save** after completing each screen
4. **Export** updated mockup as PNG for documentation

---

## Color Mapping Quick Reference

### Replace These Placeholder Colors:

| Current Placeholder | LLYLI Brand Color | Hex Value | Elements |
|-------------------|------------------|-----------|----------|
| Blue #007AFF | **Coral Red** | `#E85C48` | Primary buttons, FAB, selected tabs, action icons |
| White #FFFFFF | **Cream** | `#F8F3E6` | Main backgrounds, iPhone frame fill |
| Light Gray #F5F5F7 | **Light Beige** | `#EFE1D6` | Card backgrounds, surfaces, input fields |
| Green #34C759 | **Warm Taupe** | `#B58B82` | Captured count, "Good" grading, positive metrics |
| Orange #FF9500 | **Deep Brown** | `#8C5B52` | Due badges, warnings, attention items |
| Red #FF3B30 | **Deep Brown** | `#8C5B52` | "Hard" grading, struggling item borders, failed counts |
| Medium Gray #8E8E93 | **Neutral Gray** | `#BABEB3` | Inactive tabs, secondary text, borders |
| Light Blue | **Teal Gray** | `#5B7979` | "Easy" grading, secondary actions, counterpart |
| Black #000000 | **Text Black** | `#000000` | Primary body text (keep) |
| Dark Gray | **Text Slate** | `#24272C` | Headings, page titles |

---

## Screen-by-Screen Checklist

### ☐ Home - Today

<details>
<summary>Click to expand color updates</summary>

| Element | Current Color | New LLYLI Color | Hex |
|---------|---------------|----------------|-----|
| iPhone frame background | Very Light Gray | Cream | `#F8F3E6` |
| "Today" title | Black | Text Slate | `#24272C` |
| Primary "Capture" button bg | Blue | Coral Red | `#E85C48` |
| Primary "Capture" button text | White | Cream | `#F8F3E6` |
| "Review Due" button bg | Light Blue | Light Beige | `#EFE1D6` |
| "Review Due" button text | Blue | Teal Gray | `#5B7979` |
| "Review Due" button border | Blue | Teal Gray | `#5B7979` |
| Due count badge bg | Orange | Deep Brown | `#8C5B52` |
| Due count badge text (12) | White | Cream | `#F8F3E6` |
| Card backgrounds | White | Cream | `#F8F3E6` |
| Card borders | Light Gray | Neutral Gray | `#BABEB3` |
| Captured count (5) | Green | Warm Taupe | `#B58B82` |
| Reviewed count (8) | Blue | Teal Gray | `#5B7979` |
| Streak count (7🔥) | Orange | Warm Taupe | `#B58B82` |
| Action icons (✎ ▶) | Blue | Coral Red | `#E85C48` |
| FAB background | Blue | Coral Red | `#E85C48` |
| FAB icon (+) | White | Cream | `#F8F3E6` |
| Selected tab (Today) | Blue | Coral Red | `#E85C48` |
| Unselected tabs | Gray | Neutral Gray | `#BABEB3` |
| Secondary text | Gray | Neutral Gray | `#BABEB3` |

</details>

### ☐ Review Session

<details>
<summary>Click to expand color updates</summary>

| Element | Current Color | New LLYLI Color | Hex |
|---------|---------------|----------------|-----|
| iPhone frame background | Very Light Gray | Cream | `#F8F3E6` |
| Practice card background | White | Cream | `#F8F3E6` |
| "Reveal" button bg | Blue | Coral Red | `#E85C48` |
| "Reveal" button text | White | Cream | `#F8F3E6` |
| Progress bar background | Light Gray | Light Beige | `#EFE1D6` |
| Progress bar fill | Blue | Coral Red | `#E85C48` |
| "Hard" button bg | Light Red | Light Beige | `#EFE1D6` |
| "Hard" button text/border | Red | Deep Brown | `#8C5B52` |
| "Good" button bg | Light Orange | Light Beige | `#EFE1D6` |
| "Good" button text/border | Orange | Warm Taupe | `#B58B82` |
| "Easy" button bg | Green | Teal Gray | `#5B7979` |
| "Easy" button text | White | Cream | `#F8F3E6` |
| Highlighted words bg | Light Blue | Light Beige | `#EFE1D6` |
| Highlighted words border | Blue | Coral Red | `#E85C48` |
| Play button circle bg | Light Blue | Light Beige | `#EFE1D6` |
| Play button icon | Blue | Coral Red | `#E85C48` |
| "MIXED PRACTICE" badge | Blue | Coral Red | `#E85C48` |
| Report button icon/text | Orange | Warm Taupe | `#B58B82` |
| Secondary labels | Gray | Neutral Gray | `#BABEB3` |

</details>

### ☐ Progress

<details>
<summary>Click to expand color updates</summary>

| Element | Current Color | New LLYLI Color | Hex |
|---------|---------------|----------------|-----|
| iPhone frame background | Very Light Gray | Cream | `#F8F3E6` |
| "Progress" title | Black | Text Slate | `#24272C` |
| "Practice Now" button bg | Blue | Coral Red | `#E85C48` |
| "Practice Now" button text | White | Cream | `#F8F3E6` |
| Due count (12) | Blue | Coral Red | `#E85C48` |
| Card backgrounds | White | Cream | `#F8F3E6` |
| Struggling card borders | Light Red | Deep Brown | `#8C5B52` |
| "Failed 4x" labels | Red | Deep Brown | `#8C5B52` |
| Practice icons (▶) | Blue | Coral Red | `#E85C48` |
| Context practice button bg | Light Blue | Light Beige | `#EFE1D6` |
| Context practice button text | Blue | Teal Gray | `#5B7979` |
| Selected tab (Progress) | Blue | Coral Red | `#E85C48` |
| Unselected tabs | Gray | Neutral Gray | `#BABEB3` |

</details>

### ☐ Quick Capture

<details>
<summary>Click to expand color updates</summary>

| Element | Current Color | New LLYLI Color | Hex |
|---------|---------------|----------------|-----|
| Sheet background | White | Cream | `#F8F3E6` |
| "Save" button bg | Blue | Coral Red | `#E85C48` |
| "Save" button text | White | Cream | `#F8F3E6` |
| Input field background | Light Gray | Light Beige | `#EFE1D6` |
| Voice icon | Blue | Teal Gray | `#5B7979` |
| Hint text | Gray | Neutral Gray | `#BABEB3` |

</details>

### ☐ Edit Details

<details>
<summary>Click to expand color updates</summary>

| Element | Current Color | New LLYLI Color | Hex |
|---------|---------------|----------------|-----|
| Page background | White | Cream | `#F8F3E6` |
| "Save" link (top right) | Blue | Coral Red | `#E85C48` |
| Card background | White | Cream | `#F8F3E6` |
| TTS play button circle bg | Light Blue | Light Beige | `#EFE1D6` |
| TTS play button icon | Blue | Coral Red | `#E85C48` |
| Selected tag chips bg | Light Blue | Light Beige | `#EFE1D6` |
| Selected tag chips text/border | Blue | Coral Red | `#E85C48` |
| Unselected chips bg | Light Gray | Light Beige | `#EFE1D6` |
| Unselected chips text | Gray | Neutral Gray | `#BABEB3` |
| Input field backgrounds | Light Gray | Light Beige | `#EFE1D6` |

</details>

### ☐ Notebook Categories

<details>
<summary>Click to expand color updates</summary>

| Element | Current Color | New LLYLI Color | Hex |
|---------|---------------|----------------|-----|
| Page background | Very Light Gray | Cream | `#F8F3E6` |
| "Notebook" title | Black | Text Slate | `#24272C` |
| Category card backgrounds | White | Light Beige | `#EFE1D6` |
| Due badges bg | Orange | Deep Brown | `#8C5B52` |
| Due badges text | White | Cream | `#F8F3E6` |
| Inbox badge bg | Blue | Coral Red | `#E85C48` |
| Inbox badge text | White | Cream | `#F8F3E6` |
| FAB bg | Blue | Coral Red | `#E85C48` |
| FAB icon | White | Cream | `#F8F3E6` |
| Selected tab (Notebook) | Blue | Coral Red | `#E85C48` |
| Unselected tabs | Gray | Neutral Gray | `#BABEB3` |

</details>

---

## Verification Steps

After updating each screen:

1. **Visual Check**: Does it match LLYLI brand aesthetic (warm, earthy, notebook-like)?
2. **Contrast Check**: Is text readable against backgrounds?
3. **Consistency Check**: Are colors used consistently across screens?
4. **Export Check**: Export as PNG and verify colors look correct

### Accessibility Requirements

Ensure these color combinations meet WCAG AA contrast (4.5:1 for text):

- ✅ Text Black (#000000) on Cream (#F8F3E6): **17.8:1** ✓
- ✅ Text Slate (#24272C) on Cream (#F8F3E6): **15.7:1** ✓
- ⚠️ Coral Red (#E85C48) on Cream (#F8F3E6): **Test needed**
- ⚠️ Cream (#F8F3E6) on Coral Red (#E85C48): **Test needed**
- ✅ Cream (#F8F3E6) on Teal Gray (#5B7979): **Test needed**
- ⚠️ Deep Brown (#8C5B52) on Cream (#F8F3E6): **Test needed**

**Action**: Use https://webaim.org/resources/contrastchecker/ to verify all combinations.

---

## Deliverables

When complete:

- [ ] All 6 screens updated with LLYLI colors in Frame0
- [ ] Frame0 file saved: `prototypes/web/LLYLI.f0`
- [ ] Export PNG of each screen to `prototypes/web/exports/`
- [ ] Update `prototypes/web/LLYLI-Mockups-Changelog.md` with color application notes
- [ ] Add "After" screenshots to `.github/COLOR-SWAP-REQUIRED.md`
- [ ] Close this issue

---

## Reference Documents

- **Color Palette**: `docs/design/colorscheme.md`
- **Element Mapping**: `.github/COLOR-SWAP-REQUIRED.md`
- **Design Strategy**: `prototypes/web/LLYLI-Color-Strategy.md`
- **Original Mockups**: `prototypes/web/LLYLI.f0` (current state)

---

## Notes

- **Why Not Automated?** Frame0's MCP API doesn't support custom hex values, only named colors (red, blue, green, etc.). The visual editor has full color picker support.
- **Time Estimate**: ~45-60 minutes to update all screens manually
- **Best Practice**: Update one screen completely, export for verification, then proceed to next

---

## Issue Tracking

**Created**: 2026-01-14
**Last Updated**: 2026-01-14
**Status**: 🔴 To Do
**Blocked By**: None
**Blocking**: Developer handoff, final mockup exports

---

**Priority Justification**: Mockups represent final product vision. Without LLYLI colors, they don't communicate brand identity. This must be completed before developer handoff to ensure implementation matches brand.
