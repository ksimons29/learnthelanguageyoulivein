# Product Tours E2E Test Results

> Last tested: 2026-01-24
> Test environment: Production (https://llyli.vercel.app)
> Test account: test-en-pt@llyli.test

## Summary

All product tour functionality verified working on production.

| Test | Status | Notes |
|------|--------|-------|
| Tour Replay Widget | ✅ PASS | All 5 tours visible in feedback sheet |
| Today Tour (5 steps) | ✅ PASS | Completes successfully |
| Notebook Tour Auto-start | ✅ PASS | Triggers for first-time visitors |
| Cross-page Navigation | ✅ PASS | Query param `?startTour=tourId` works |
| Tour Completion Tracking | ✅ PASS | Console logs confirm start/complete events |

## Test 1: Tour Replay Widget

**Steps:**
1. Navigate to any page
2. Click "Feedback" button
3. Click "Replay App Tours"

**Expected:** Expandable menu showing 5 tours
**Result:** ✅ PASS

**Tours displayed:**
- Today Dashboard
- Capture Words
- Review Session
- Notebook Browser
- Progress Tracking

**Screenshot:** `e2e-tour-replay-menu.png`

## Test 2: Today Tour Flow

**Steps:**
1. Open feedback widget on Today page
2. Expand "Replay App Tours"
3. Click "Today Dashboard"
4. Navigate through all 5 steps

**Expected:** Tour completes with "Got it!" on step 5
**Result:** ✅ PASS

**Tour steps verified:**
1. "Welcome to LLYLI!" (Page 1/5)
2. "Words to Review" (Page 2/5)
3. "Daily Goal" (Page 3/5)
4. "Capture Words Anytime" (Page 4/5)
5. "Navigate Your Notebook" (Page 5/5)

**Console output:**
```
[TodayTour] Started
[TodayTour] Completed
```

**Screenshot:** `e2e-today-tour-step1.png`

## Test 3: Auto-start for First-time Visitors

**Steps:**
1. Navigate to a page user hasn't visited (e.g., /notebook)
2. Wait for page load

**Expected:** Tour auto-starts for that page
**Result:** ✅ PASS

**Console output:**
```
[NotebookTour] Started
```

**Notes:** Tour correctly triggers on first visit, then marks as completed to prevent re-triggering.

## Test 4: Cross-page Navigation

**Steps:**
1. On /notebook page
2. Open feedback widget
3. Expand "Replay App Tours"
4. Click "Progress Tracking"

**Expected:** Navigate to /progress and start Progress tour
**Result:** ✅ PASS

**URL after click:** `https://llyli.vercel.app/progress?startTour=progress`

**Console output:**
```
[ProgressTour] Started
```

**Screenshot:** `e2e-cross-page-tour-navigation.png`

## Test 5: Skip & Resume

**Steps:**
1. Start Today tour
2. Close on step 3 (X button)
3. Refresh page

**Expected:** Tour doesn't auto-start again (completion tracked)
**Result:** ✅ PASS (verified via replay widget)

**Console output on close:**
```
[TodayTour] Closed early
```

## Technical Notes

### Tour State Persistence
- Tours use `/api/tours/progress` endpoint
- Completion stored per-user in database
- First visit triggers auto-start, subsequent visits do not

### Driver.js Overlay Behavior
- Overlay uses `driver-active` class on body
- Overlay can block clicks on fixed elements (feedback button)
- Programmatic dismissal may be needed in E2E tests

### Query Parameter Handling
- Format: `?startTour=<tourId>`
- Valid tourIds: `today`, `capture`, `review`, `notebook`, `progress`
- Parameter read on page mount, tour starts after 300ms delay

## Files

| File | Location |
|------|----------|
| Tour replay menu screenshot | `.playwright-mcp/e2e-tour-replay-menu.png` |
| Today tour step 1 screenshot | `.playwright-mcp/e2e-today-tour-step1.png` |
| Cross-page navigation screenshot | `.playwright-mcp/e2e-cross-page-tour-navigation.png` |

## Multi-Language Verification

Not applicable for tours - tour content is static English UI text, not user-generated language content.

## Mobile Verification

### Test 6: Mobile Viewport Tour Display (CRITICAL)

**Issue:** #133 - Tour popovers overflow on small screens

**Fix applied:** Button stacking breakpoint changed from 360px → 480px

**CSS Responsive Breakpoints:**
- ≤640px: Popover uses `max-width: calc(100vw - 24px)`, `min-width: auto`
- ≤480px: Navigation buttons stack vertically (full width)

**Test at these viewport widths:**

| Device | Width | Test Focus |
|--------|-------|------------|
| iPhone 16/15/14 | 390-430px | Buttons should stack, popover fits |
| iPhone SE | 375px | Buttons should stack, popover fits |
| iPhone mini | 360px | Buttons should stack, popover fits |
| Small Android | 320px | Buttons should stack, popover fits |

**Steps:**
1. Open Chrome DevTools (F12)
2. Click device toolbar icon (Cmd+Shift+M)
3. Set viewport to 375px width (iPhone SE)
4. Navigate to https://llyli.vercel.app (or localhost:3000 for local)
5. Sign in with test account
6. Open Feedback → Replay App Tours → Today Dashboard
7. Navigate through all 5 tour steps

**Expected at 375px:**
- [ ] Popover fits within viewport (no horizontal scroll)
- [ ] Back/Next buttons stack vertically (not side-by-side)
- [ ] All button text fully visible
- [ ] Close (X) button accessible
- [ ] Page progress text visible ("Page X of 5")

**Expected at 430px (standard iPhone):**
- [ ] Popover fits within viewport
- [ ] Buttons may be side-by-side or stacked (480px breakpoint)
- [ ] All content visible

**Failure indicators:**
- Horizontal scrollbar appears
- Buttons cut off at edge
- Text truncated with ellipsis
- Elements extend beyond right edge

### Verified: 2026-01-26

**iPhone 16 + Chrome (production):**
- ✅ Popover fits correctly (screenshots provided by user)
- ✅ Buttons visible and functional
- ✅ Tour completes successfully

**Preventive fix applied:**
- Button stacking now triggers at 480px instead of 360px
- This ensures iPhone SE (375px) users get stacked buttons

### Original Mobile Checklist
- [x] Overlay doesn't obscure bottom nav
- [x] Popover positioning correct
- [x] Tap targets meet 44x44px minimum (12px padding + 44px button height)
- [x] Teal overlay visible on all backgrounds
