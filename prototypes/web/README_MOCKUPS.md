# LLYLI Mockups Export Guide

## Overview
This directory contains all 13 LLYLI mobile app mockups designed in Frame0, now featuring 5-tab navigation.

## Screen Inventory (Updated 2026-01-15)

### Onboarding Flow (3 screens)
1. **Onboarding 1 - Language Selection** (`bFxVxGyEjNjl-O5NdYo3l`)
2. **Onboarding 2 - Welcome** (`QMZrjWF90WvjcuKPMEMaS`)
3. **Onboarding 3 - First Capture** (`R_qFnPd-1k2t4ujXlSBnT`)

### Main App Flow (6 screens)
4. **Home - Today** (`6rBdHqKyKL7m-02P2dfMx`) - 5-tab nav, Today selected
5. **Quick Capture** (`xzmgqEBeerdWv7UXkgNw3`) - Modal, no bottom nav
6. **Review Session** (`ywJmyJUo0VcDgtRNUWzNq`) - In-session, no bottom nav
7. **Review - Immediate Feedback** (`BSNhUZQ31WKPLmhQJHvHP`) - In-session, no bottom nav
8. **Done for Today** (`NOVVYUHr0-arsyky5CV12`) - 5-tab nav, Review selected
9. **Ready to Use Celebration** (`ntNw_Ip6wqV7FIup_PQm9`) - Modal, no bottom nav

### Reference Screens (4 screens)
10. **Notebook - Browse Words** (`0M6X85P5kILsY5gcWM4qX`) - **NEW!** 5-tab nav, Notebook selected
11. **Progress** (`pVJcuX67RRdzbrcloek5R`) - 5-tab nav, Progress selected
12. **Word Detail View** (`AFQ-WusaCY2O7domBKc5C`) - 5-tab nav, Notebook selected
13. **Info - How LLYLI Works** (`lkvTr-rKTaAlsbm4JvLRe`) - Full-screen overlay, no bottom nav

## Navigation Structure

### 5-Tab Bottom Navigation (Updated Design)
```
🏠 Today | ➕ Capture | 📝 Review | 📓 Notebook | 📊 Progress
```

**Screens with 5-tab navigation:**
- Home - Today (Today tab selected)
- Done for Today (Review tab selected)
- Notebook - Browse Words (Notebook tab selected)
- Progress (Progress tab selected)
- Word Detail View (Notebook tab selected)

**Screens without bottom navigation:**
- Quick Capture (modal)
- Review Session (in-session)
- Review - Immediate Feedback (in-session)
- Ready to Use Celebration (modal)
- Info page (overlay)
- Onboarding 1-3 (first-time flow)

## Export Instructions

### Option 1: Manual Export from Frame0 (Recommended)
1. Open `LLYLI.f0` in Frame0 app
2. For each screen, select the page
3. Export → Export Page as Image → PNG
4. Save with filename: `{number}_{screen_name}.png`
   - Example: `01_Onboarding_Language_Selection.png`
5. Save all to `prototypes/web/mockups/`

### Option 2: Automated Export (Requires Frame0 CLI if available)
```bash
# If Frame0 has CLI export (check documentation)
frame0 export LLYLI.f0 --format png --output mockups/
```

### Option 3: Create PDF from Existing PNGs
```bash
# Using ImageMagick
cd prototypes/web/mockups
magick convert *.png LLYLI_Mockups_Complete.pdf

# Or using img2pdf (preserves image quality better)
pip install img2pdf
img2pdf --output LLYLI_Mockups_Complete.pdf *.png
```

## File Naming Convention

Use zero-padded numbers for correct sorting:
```
01_Onboarding_Language_Selection.png
02_Onboarding_Welcome.png
03_Onboarding_First_Capture.png
04_Home_Today.png
05_Quick_Capture.png
06_Review_Session.png
07_Review_Immediate_Feedback.png
08_Done_For_Today.png
09_Ready_To_Use_Celebration.png
10_Notebook_Browse_Words.png         ← NEW screen
11_Progress.png
12_Word_Detail_View.png
13_Info_How_LLYLI_Works.png
```

## Changes from Previous Version

### What Changed (2026-01-15)
- **Added:** Notebook - Browse Words screen (NEW 13th screen)
- **Updated:** 5-tab navigation (was 3-tab)
  - Added: 📝 Review tab
  - Added: 📓 Notebook tab
- **Updated:** Progress screen now analytics-focused (removed word browsing UI)
- **Updated:** Home, Done for Today, Word Detail all have new 5-tab nav

### Files to Delete
Delete these old PNG files (outdated 3-tab navigation):
```bash
rm "prototypes/web/Done for Today.png"
rm "prototypes/web/Home Today.png"
rm "prototypes/web/Info with Scroll Bar.png"
rm "prototypes/web/Onboarding 2.png"
rm "prototypes/web/Onboarding 3.png"
rm "prototypes/web/Onboarding Selection 1.png"
rm "prototypes/web/Progress.png"
rm "prototypes/web/Quick Capture (1).png"
rm "prototypes/web/Ready to Use Celebration.png"
rm "prototypes/web/Review Session.png"
rm "prototypes/web/Word Detail View.png"
```

## Creating Final PDF Mockup Document

### Step 1: Export all 13 screens to mockups/
Follow "Option 1: Manual Export from Frame0" above

### Step 2: Add title page (optional)
Create a title page PNG (320x690px) with:
- LLYLI logo
- "Mobile App Mockups"
- "MVP Design - 13 Screens"
- "Last Updated: 2026-01-15"
- Save as: `00_Title_Page.png`

### Step 3: Generate PDF
```bash
cd prototypes/web/mockups

# Install img2pdf if needed
pip3 install img2pdf

# Create PDF (preserves PNG quality)
img2pdf --output ../LLYLI_Mockups_v2_13screens.pdf *.png

# Or with ImageMagick (more compression)
magick convert *.png ../LLYLI_Mockups_v2_13screens.pdf
```

### Step 4: Verify PDF
- Open `LLYLI_Mockups_v2_13screens.pdf`
- Verify all 13 screens (+ optional title page) are present
- Check that 5-tab navigation is visible and correct

## Design Documentation

See related files:
- `SCREEN_ORDER.md` - User flow and navigation patterns
- `NOTEBOOK-DESIGN-RATIONALE.md` - Why Notebook screen was added
- `LLYLI-Mockups-Changelog.md` - Full design changelog
- `LLYLI-Color-Strategy.md` - Color usage guide

## Frame0 Source File

**Location:** `prototypes/web/LLYLI.f0`
**Last Updated:** 2026-01-15
**Total Screens:** 13
**Navigation:** 5-tab (Home, Capture, Review, Notebook, Progress)

---

*For developer handoff, see: `.github/ISSUE-implement-mvp-from-mockups.md`*
