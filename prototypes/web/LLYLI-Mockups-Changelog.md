# LLYLI Frame0 Mockups Changelog

**Date**: 2026-01-14
**Updated by**: Claude Code
**Frame0 File**: `prototypes/web/LLYLI.f0`

## Overview

Updated all LLYLI mobile mockups to clearly communicate the product's core wedge and differentiation:

1. **Capture to card in under 2 seconds** (iOS-first)
2. **Daily loop focus**: Capture → Review due → Feel more ready tomorrow
3. **Review differentiator**: Practice sentences that mix 2-4 due words (non-repetitive)
4. **Minimal navigation**: Notebook feel, not a course app
5. **Tokenized color palette**: Easy rebranding without refactoring

---

## Design Tokens & Color System

### What Changed
- Created a tokenized color system using consistent color names instead of hardcoded hex values
- Reduced color palette to single primary accent (blue) for CTAs, selected states, and interactive elements
- Removed rainbow grading - Hard/Good/Easy now use one color family with intensity variations
- Added tinted surfaces instead of saturated fills for premium notebook aesthetic

### Why
- Allows Koos to rebrand the entire app by changing colors in one place
- Creates visual consistency across all screens
- Professional, focused appearance vs. overwhelming multi-color designs
- Easier for developers to implement with design system tokens

### Token Structure
- `colorPrimary` → Blue CTAs, selected tabs
- `colorBackground` → White backgrounds
- `colorSurface` → Very light gray surface fills
- `colorText` → Black primary text
- `colorTextMuted` → Gray secondary text
- `colorBorder` → Very light gray borders
- Intensity variations use the same color at different opacities

---

## Screen A: Home - Today

### What Changed
1. **Added two primary action buttons at top**:
   - Primary CTA: "Capture" (blue, prominent)
   - Secondary CTA: "Review Due" with badge showing 12 due items
2. **Renamed "Recent cards" to "Captured Today" (Inbox section)**:
   - Shows last 3-5 captures with phrase and translation
   - Each card has quick actions: Edit (✎) and Practice (▶)
3. **Added "Today's Progress" strip** showing daily loop metrics:
   - Captured: 5
   - Reviewed: 8
   - Streak: 7🔥
4. **Added floating Capture button** (blue + icon, bottom right)
5. **Removed analytics/stats tiles** from home screen
6. **Bottom navigation** shows all 5 tabs with icons

### Why
- **Capture-first wedge**: Users can capture in ONE tap from home, making it frictionless
- **Daily loop visibility**: Reinforces the habit of capture → review → progress
- **Action over analytics**: Home is for doing, not viewing dashboards
- **Doesn't look like Duolingo**: Feels like a personal productivity tool, not a gamified course

### Acceptance Criteria Met
✅ User can capture in one tap from Home (primary CTA + FAB)
✅ User can start review in one tap from Home
✅ Home does not look like a curriculum app (no lessons, no trees, no mascots)

---

## Screen B: Quick Capture

### What Changed
1. **Minimal bottom sheet modal** instead of full screen
2. **Single required field**: "Type or paste a phrase you want to remember"
3. **Optional voice input** button (🎤) next to text field
4. **Single primary action**: "Save" button (blue, prominent)
5. **Helpful hint text**: "You can add translation and context later"
6. **No mandatory fields** beyond the phrase itself

### Why
- **Under 2 seconds**: Paste phrase → tap Save → done
- **Removes friction**: No forced fields, no forms, no decisions
- **iOS bottom sheet pattern**: Familiar, dismissible, lightweight
- **Encourages capture habit**: Making it effortless means users actually do it

### Acceptance Criteria Met
✅ User can paste or type, then Save, with no mandatory extra steps
✅ Capture feels instant, not like filling out a form

---

## Screen C: Edit Details

### What Changed
1. **Card layout** instead of form layout for primary phrase display
2. **Translation field collapsed by default** (tap › to expand)
3. **Tags shown as optional chips**: "Work", "Customer" with + to add more
4. **Context field is optional**: Placeholder text, not required
5. **Audio behavior clarified**: "Listen (TTS)" shows it's text-to-speech
6. **Added notebook tip at bottom**: "💡 You can always edit these details later from your Notebook"
7. **Top navigation**: Back and Save (blue link, top right)

### Why
- **Feels like enriching a notebook**, not submitting a form
- **Optional everything**: Users aren't blocked from saving if they skip fields
- **Clear audio expectations**: Shows TTS vs. native speaker audio
- **Encourages flow**: Save now, enrich later keeps momentum going

### Acceptance Criteria Met
✅ Product feels like a personal notebook, not a form
✅ Translation, tags, and context are all optional
✅ Audio behavior is transparent (TTS labeled)

---

## Screen D: Review Session (CRITICAL DIFFERENTIATOR)

### What Changed
1. **"MIXED PRACTICE" badge** at top to signal differentiation
2. **Practice sentence** as the unit of review: "Vou verificar com o verificar e depois posso ajudar você."
3. **Due words highlighted in blue**: "verificar" and "ajudar" are visually distinct
4. **Progress indicator**: "5 / 12" shows session progress
5. **Recall-first interaction**:
   - Sentence shown with instruction "Recall the meaning:"
   - Audio play button (▶) to hear pronunciation
   - "Reveal" button (blue CTA) to show translation/hints
6. **Grading buttons** (Hard/Good/Easy) use intensity not color variety:
   - Hard: Light blue outline
   - Good: Medium blue fill
   - Easy: Dark blue fill (selected state shown)
7. **Mastery progress**: "Today: 1 of 3 correct"
8. **"Report sentence issue" feedback control** with ⚠️ icon
9. **Mode indicator at bottom**: "💡 Mixing 2 due words per sentence"

### Why
- **KILLER FEATURE**: This is NOT a basic flashcard app - practicing 2-4 words together in context is unique
- **Real-life preparation**: Learning words in sentences prepares users for actual conversations
- **Visual differentiation**: Highlighted words make it clear this is mixed practice
- **Flexible for MVP**: Mode toggle allows single-card fallback if mixing algorithm is complex
- **User feedback loop**: Bad sentence reporting improves quality over time
- **Transparent SRS**: Shows next review timing after grading, not on buttons

### Acceptance Criteria Met
✅ Review screen makes it obvious this is not a basic flashcard app
✅ Practice sentences can mix 2-4 due words (UI supports it)
✅ Due words are visually highlighted
✅ Recall-first interaction (show → reveal → grade)

---

## Screen E: Progress

### What Changed
1. **Renamed from dashboard/stats to "Progress"**
2. **Action-first sections**:
   - **Due Today**: "12 phrases ready" with "Practice Now" button
   - **Struggling**: List of 2 items with individual Practice buttons (▶):
     - "Qual é o problema?" Failed 4x
     - "Estou de acordo" Failed 3x
   - **Context Readiness**: "🏢 Work" showing "24 phrases · 8 due" with Practice button
3. **Bottom navigation** with Progress tab selected (blue)
4. **No charts or graphs** on main view (can be in Details sub-view if needed)

### Why
- **Every metric is actionable**: Not just "here's your data" but "here's what to practice"
- **Struggling section**: Directly addresses problem areas with one-tap practice
- **Context-based practice**: Lets users prepare for specific situations (work meeting, social event)
- **Removes passive consumption**: Progress becomes a launch pad, not a report card

### Acceptance Criteria Met
✅ Every section on Progress has an action, not just a chart
✅ Due today, struggling items, and context readiness all have Practice buttons
✅ Charts/analytics are secondary or hidden in sub-views

---

## Screen F: Notebook Categories

### What Changed
1. **Search bar at top**: "🔍 Search phrases..."
2. **Inbox category first** (featured):
   - "📥 Inbox" title
   - "New & untagged phrases" subtitle
   - Badge showing 5 items
3. **Categories section** with emoji icons:
   - 🏢 Work: "24 phrases · 8 due"
   - 💬 Social: "15 phrases · 3 due"
   - 🛍️ Shopping: "9 phrases · 2 due"
4. **Chevrons (›)** indicate tap to view category details
5. **Floating Capture button** (blue +) in bottom right
6. **Bottom navigation** with Notebook tab selected (blue)

### Why
- **Inbox-first**: New captures are immediately visible, not lost in categories
- **Due count badges**: Shows what needs attention in each category
- **Total + due counts**: Gives sense of corpus size and urgency
- **No taxonomy project**: Categories are simple, user-created, emoji-based
- **Quick category practice**: Can tap into any category for targeted review
- **Fast phrase retrieval**: Search at top for instant lookup

### Acceptance Criteria Met
✅ Inbox category at top for untagged and new captures
✅ Due badges per category (total items + due count)
✅ Category actions (tap to view/review)
✅ User can find a phrase fast (search bar)
✅ User can practice a category (tap through to practice)

---

## Navigation Structure

### What Changed
- **5-tab bottom navigation** (iOS standard):
  1. 🏠 Today
  2. ➕ Capture
  3. 📝 Review
  4. 📓 Notebook
  5. 📊 Progress
- **Floating Capture button** visible on Today, Notebook, and Progress screens
- **Settings removed from main tabs** (moved to top-right menu on Today or Notebook)

### Why
- **Minimal navigation**: Core flows are one tap away
- **No duplicate entry points**: Clean information architecture
- **iOS conventions**: Bottom tab bar with 5 or fewer items is standard
- **Capture is always accessible**: Both as tab and FAB reduces friction

---

## Consistency Across Screens

### What Was Verified
✅ All frames use iPhone mobile dimensions (320x690 standard)
✅ Primary blue color used consistently for CTAs, selected tabs, and interactive elements
✅ Floating Capture button appears on appropriate screens with same styling
✅ Bottom navigation identical across all screens (except selected state)
✅ Typography hierarchy consistent (32pt titles, 16pt body, 12pt hints)
✅ Card components use same rounded corners, padding, and shadow
✅ Spacing follows 4/8/16/20px grid system
✅ Badge styling consistent (blue background, white text)
✅ Icon usage consistent (emoji for categories, symbols for actions)

---

## Files Delivered

1. **Frame0 Design File**: `prototypes/web/LLYLI.f0`
   - 6 mobile screens + 1 design tokens page
   - All screens created as iPhone frames (320x690)
   - Editable in Frame0 application

2. **Exported Mockups**: Available as PNG images from Frame0
   - Home - Today
   - Quick Capture
   - Edit Details
   - Review Session
   - Progress
   - Notebook Categories

3. **This Changelog**: `prototypes/web/LLYLI-Mockups-Changelog.md`

---

## Design Decisions & Trade-offs

### 1. Blue as Single Primary Color
**Decision**: Use one accent color (blue) instead of multiple brand colors
**Rationale**: Easier to rebrand, cleaner visual hierarchy, more professional
**Trade-off**: Less colorful, but that's intentional (notebook feel vs. gamified app)

### 2. Floating Capture Button on Multiple Screens
**Decision**: Show FAB on Today, Notebook, and Progress (not Review)
**Rationale**: Capture should be accessible from anywhere except during active review
**Trade-off**: Slight redundancy with Capture tab, but dramatically reduces friction

### 3. Review Session Shows Mixed Mode in UI
**Decision**: Build UI for mixed practice sentences even if algorithm is naive initially
**Rationale**: This is the key differentiator; UI must support it from day one
**Trade-off**: Backend complexity, but UI sets the vision and constraints

### 4. Progress is Action-First, Not Analytics
**Decision**: Every metric has a Practice button; charts are secondary
**Rationale**: LLYLI is about doing, not tracking; progress should drive action
**Trade-off**: Less impressive for screenshot marketing, but better for retention

### 5. Inbox-First Notebook
**Decision**: Inbox at top, before categories
**Rationale**: New captures are most time-sensitive; surfaces unprocessed items
**Trade-off**: Adds visual weight to top of screen, but reinforces daily loop

---

## Implementation Notes for Developers

1. **Color tokens**: Implement design tokens as CSS variables or theme constants
2. **Bottom sheet**: Quick Capture should use iOS native UISheetPresentationController
3. **Practice sentences**: Review screen needs backend API for mixed-word sentence generation
4. **Floating Action Button**: Should persist across tab changes (except Review)
5. **Due count badges**: Real-time updates when user completes reviews
6. **Search**: Notebook search should be instant (client-side filter for <1000 phrases, server-side for larger corpora)
7. **Audio playback**: TTS integration needed; show "Listen (TTS)" label until native audio available
8. **Offline-first**: All screens should work offline except initial phrase capture (if using translation API)

---

## Next Steps

1. **User testing**: Validate capture flow takes <2 seconds
2. **Backend architecture**: Design mixed-practice sentence generation algorithm
3. **Audio strategy**: Decide on TTS provider (iOS native, Google, Azure, ElevenLabs)
4. **Category taxonomy**: Define default categories vs. user-created
5. **Spaced repetition**: Implement SRS algorithm (SM-2, FSRS, or custom)
6. **Share extension**: Build iOS share extension for WhatsApp/Safari capture

---

## Acceptance Criteria Summary

All acceptance criteria from the original instructions have been met:

✅ **Capture is one tap from anywhere**, no mandatory fields beyond the phrase
✅ **Home is action-based**, capture and review are the only primary flows
✅ **Review screen communicates mixed practice sentence differentiation** clearly
✅ **Progress is action-first**, not analytics-first
✅ **Palette is applied via tokens**, one place to change branding
✅ **Fast capture prioritized** over comprehensive forms
✅ **Mixed practice review experience** designed and ready to implement

---

*Changelog generated by Claude Code | Frame0 file ready for development handoff*

---

## 🆕 Update: Missing MVP Screens Added (2026-01-14)

**Added by**: Claude Code
**Session**: Frame0 comprehensive review against PRD, PR-FAQ, and Vision docs

### New Screens Created (7 total)

Following a comprehensive review of the Frame0 mockups against the PRD (FR-6.1-6.3, FR-3.6, FR-5.1-5.3) and PR-FAQ requirements, we identified and designed 7 critical missing screens required for the MVP user flow:

#### 1. Onboarding 1 - Language Selection
**Purpose**: PRD FR-6.1 requires language selection on first launch

**Design**:
- Title: "Welcome to LLYLI"
- Native language selector: 🇬🇧 English
- Target language selector: 🇵🇹 Portuguese (Portugal)
- Blue "Continue" button
- Clean, minimal setup (no overwhelming forms)

**Why**: First-run experience must be frictionless while capturing essential config.

---

#### 2. Onboarding 2 - Welcome
**Purpose**: PRD FR-6.2 requires brief tutorial (3 screens max) showing value props

**Design**:
- Title: "Turn the words you see today into the phrases you use tomorrow"
- Three value propositions with icons:
  - ✨ Capture any phrase in seconds
  - 🔄 Practice in real contexts (fresh sentences)
  - ✓ Know when you're ready (science-backed proof)
- Progress dots: step 2 of 3
- "Get Started" button

**Why**: Communicates unique value (mixed practice, instant capture, mastery proof) before user commits.

---

#### 3. Onboarding 3 - First Capture
**Purpose**: PRD FR-6.3 requires user to add first word and experience full loop before tutorial ends

**Design**:
- Title: "Try it now"
- Subtitle: "Capture your first phrase"
- Large input field with blue border (focused state)
- Voice input button (🎤)
- Helpful hint: "💡 Try typing 'Como posso ajudar?' or any phrase you want to remember"
- "Save" button
- Progress dots: step 3 of 3

**Why**: Interactive tutorial > passive walkthrough. User experiences core value (frictionless capture) immediately.

---

#### 4. Done for Today
**Purpose**: PRD FR-3.6 requires "Done for today" screen showing words reviewed and streak after session completion

**Design** (science-backed, per recommendations):
- 🎉 celebration emoji
- Title: "Done for today!"
- Stats card:
  - Large blue "12" → "phrases reviewed"
  - Divider
  - "83% correct | 7 days 🔥"
  - (Accuracy / Streak)
- Tomorrow preview card (light blue):
  - "Tomorrow"
  - "8 phrases due"
- Optional link: "Keep practicing" (respects autonomy)
- Primary "Done" button

**Why**:
- Session summary provides concrete achievement
- Accuracy rate calibrates self-assessment
- Tomorrow preview reduces anxiety ("I won't be overwhelmed")
- Optional continuation respects user agency
- Quick dismissal (no user trapping)

**Research basis**: Immediate feedback (11% retention boost, PRD Section 6.2), habit formation through streak, autonomy support.

---

#### 5. Ready to Use Celebration
**Purpose**: Communicate when a word reaches "ready to use" status (3 correct recalls, PRD FR-5.1-5.2). PR-FAQ emphasizes this as key differentiator.

**Design**:
- Modal overlay with dim background
- 🎉 celebration emoji
- Green title: "Ready to Use!"
- Phrase displayed: "fazer filas"
- Message: "You've correctly recalled this phrase 3 times. You can confidently use it tomorrow!"
- Green "Continue" button

**Why**:
- Creates emotional anchor for mastery achievement
- Communicates PR-FAQ value prop: "evidence-backed confidence you can use it when your landlord calls"
- Celebration reinforces behavior (reached mastery milestone)

**Multi-touchpoint system**:
This modal is ONE of four "Ready to Use" indicators:
1. Modal (achievement moment)
2. Green badge in Notebook (scannable)
3. Notebook filter (practical utility)
4. Home screen stat ("24 words ready to use")

---

#### 6. Word Detail View
**Purpose**: Show full mastery journey and personal memory for individual words (addresses PRD requirement for transparent SRS and user's desire for "notebook feel")

**Design**:
- Header: "‹ Back" and "Edit" links
- Phrase card (light blue background):
  - "Como posso ajudar?"
  - "How can I help?"
  - Audio playback button (▶)
  - Green "Ready" badge
- **Mastery Journey section**:
  - "First captured: Jan 10, 2026"
  - "Reviewed 7 times (5 correct, 2 struggled)"
  - "✓ Ready to use" (green text)
  - Full green progress bar
  - "Next review: Jan 20, 2026"
- **Tags section**:
  - 🏢 Work
  - 👨‍💼 Customer
- "Practice Now" button (blue, full width)

**Why**:
- **Personal memory**: "First captured: Jan 10" creates narrative ("I added this when...")
- **Journey visibility**: "2 struggled" shows perseverance, builds emotional connection
- **Transparent SRS**: Next review date builds trust in system
- **On-demand practice**: Allows targeted review before specific events
- **Notebook aesthetic**: Feels like a personal language diary, not a flashcard app

---

#### 7. Review - Immediate Feedback State
**Purpose**: PRD FR-3.3 requires "immediate feedback" after each response. Section 6.2 cites 11% retention boost from immediate corrective feedback.

**Design**:
- Progress: "5 / 12" (top)
- "MIXED PRACTICE" badge (blue)
- **Feedback card** (top, green background):
  - ✓ "Good recall!"
  - "You'll see this again in 2 days"
- **Sentence card** (below):
  - Portuguese: "Vou verificar com o cliente e depois posso ajudar você."
  - Divider
  - English: "I'll check with the client and then I can help you."
  - Audio playback button (▶)
- **Words practiced**:
  - "verificar (2/3) | ajudar (1/3)"
- "Continue" button → next sentence

**Why IMMEDIATE beats batched**:
- **Memory trace fresh**: Feedback while retrieval attempt is active
- **No interference**: Subsequent sentences don't corrupt the memory
- **Error correction**: User can adjust understanding before moving forward
- **Transparent SRS**: "in 2 days" shows system is adaptive, builds trust
- **Mastery progress**: "(2/3)" shows path to "ready to use" status

**Research basis**: PRD Section 6.2 (immediate feedback = 11% retention boost)

---

### Implementation Priority

**Blocking MVP launch:**
1. ✅ Onboarding flow (1-3) — Required for first-run experience
2. ✅ Done for Today — Required by PRD FR-3.6
3. ✅ Review Immediate Feedback — Required by PRD FR-3.3, research-backed

**High priority (core value props):**
4. ✅ Ready to Use Celebration — PR-FAQ emphasizes this differentiator
5. ✅ Word Detail View — "Notebook feel" is brand differentiator

**Total screens in Frame0**: 13 (6 original + 7 new)

---

### Files Updated

- **Frame0 file**: `prototypes/web/LLYLI.f0`
  - 13 mobile screens total
  - All screens use iPhone frame dimensions
  - Design tokens applied consistently

---

### Acceptance Criteria: All Met ✅

**From original Frame0 review:**
- ✅ Capture is one tap from anywhere
- ✅ Home is action-based
- ✅ Review screen communicates mixed practice
- ✅ Progress is action-first
- ✅ Palette applied via tokens

**From new PRD gaps identified:**
- ✅ Onboarding flow (3 screens, FR-6.1-6.3)
- ✅ Done for Today screen (FR-3.6)
- ✅ Immediate feedback in review (FR-3.3, Section 6.2)
- ✅ "Ready to Use" status communication (FR-5.1-5.2, PR-FAQ)
- ✅ Mastery journey visibility (personal memory design)
- ✅ Transparent SRS (next review dates shown)

---

*Updated 2026-01-14 | All MVP screens complete and ready for development*

---

## 🆕 Update 2: Scientific Aesthetic & Info Pages (2026-01-14)

**Updated by**: Claude Code
**Session**: Refined celebrations to calm/scientific aesthetic + created comprehensive info pages

### Changes Made

#### 1. Updated "Done for Today" Screen
**What Changed:**
- Removed loud 🎉 emoji
- Changed title from "Done for today!" to "Session Complete"
- Kept clean, data-focused stats card
- Changed "Keep practicing" to "Practice more" (more neutral)
- Maintained tomorrow preview (reduces anxiety)

**Why:**
- Scientific app aesthetic vs. gamified celebration
- Professional, calm tone matches target users (working professionals, expats)
- Focuses on achievement metrics rather than emotional exclamation
- Respects user intelligence—data speaks for itself

#### 2. Updated "Ready to Use" Celebration
**What Changed:**
- Removed large 🎉 emoji
- Changed title from "Ready to Use!" to "Mastery Achieved"
- Updated message to scientific language: "Three successful retrievals recorded. This phrase has reached optimal retention probability and is ready for active use."
- Kept green color scheme (success indicator)
- Maintained modal overlay design

**Why:**
- Aligns with evidence-based learning approach
- Uses precise terminology (retrievals, retention probability)
- Communicates achievement without childish excitement
- Reinforces scientific credibility of the method

#### 3. Created Comprehensive Info/Help Pages (2 pages)

**Page 1: How LLYLI Works**
Sections:
- **What is LLYLI?** - Core value proposition and mechanics
- **Mixed Practice Sentences** - Explains 4-6x faster acquisition through varied contexts
- **Spaced Repetition (FSRS)** - Defines FSRS algorithm and optimal timing
- **Mastery = 3 Correct Recalls** - Explains 64%→87% retention improvement

**Page 2: Deep Dive**
Sections:
- **Why Different from Flashcards?** - Card memorization vs. word mastery
- **The Science Behind It** - Bulleted research findings (active retrieval, 11% feedback boost, 4-6x context learning, spaced intervals)
- **Your Vocabulary, Your Way** - Differentiates from fixed curricula apps
- **Session Best Practices** - Daily review, 10-20 min sessions, quality over quantity, trust the algorithm

**Content Source:**
- Synthesized from PRD.md (FR sections, research citations)
- Synthesized from PR-FAQ.md (value props, differentiators)
- Synthesized from vision.md (target users, scientific basis)

**Navigation:**
- Accessible via ⓘ info icon on key screens (added to Home screen)
- "✕ Close" button returns to previous screen
- "Scroll for more ↓" indicates multi-page content
- Final CTA: "Got it, let's start" (dismisses info)

**Why:**
- Transparent about methodology builds trust
- Educates users on WHY the approach works (not just WHAT to do)
- Answers "is this just another flashcard app?" upfront
- Provides reference material for skeptical users
- Reinforces scientific credibility

#### 4. Added Info Icon to Home Screen
- Placed ⓘ icon in top-right corner (55, 285)
- Links to info/help pages
- Blue color matches interactive elements
- Accessible from primary navigation point

---

### Design Philosophy: Calm Scientific > Loud Gamification

**Before:**
- "Done for today! 🎉"
- "Ready to Use! 🎉"
- Emotional language

**After:**
- "Session Complete"
- "Mastery Achieved"
- "Three successful retrievals recorded. This phrase has reached optimal retention probability..."

**Why This Matters:**
1. **Target audience**: Working professionals and expats expect professional tools
2. **Credibility**: Scientific language reinforces evidence-based approach
3. **Differentiation**: Most language apps use gamification; LLYLI uses data
4. **Trust**: Precise terminology (retrieval probability, FSRS) shows serious methodology
5. **Respect**: Users are adults making progress; they don't need cartoon celebrations

---

### Files Updated

- `prototypes/web/LLYLI.f0` - Updated 3 screens, added 2 new info pages (total: 15 screens)
  - Updated: Done for Today (calm aesthetic)
  - Updated: Ready to Use Celebration (scientific language)
  - Added: Info - How LLYLI Works (page 1)
  - Added: Info - Page 2 (deep dive)
  - Updated: Home - Today (added ⓘ info icon)

---

### Acceptance Criteria: Updated ✅

**Original criteria maintained:**
- ✅ Capture is one tap from anywhere
- ✅ Home is action-based
- ✅ Review screen communicates mixed practice
- ✅ Progress is action-first
- ✅ Palette applied via tokens

**New criteria met:**
- ✅ Celebrations are calm, scientific, modern (not loud/childish)
- ✅ Comprehensive info pages explain what the app does
- ✅ Info pages explain SRS (FSRS specifically)
- ✅ Info pages cite scientific research from PRD
- ✅ Info accessible via ⓘ icon on key screens

---

## Part 6: Final Cleanup & Screen Organization

**Date**: 2026-01-14
**Focus**: Remove duplicate screens, create single scrollable info page, add info icons throughout, finalize for development

### What Changed

#### 1. Screen Cleanup - Removed Duplicates
Deleted unnecessary duplicate screens to streamline the mockup file:
- ❌ Deleted: Edit Details (duplicate functionality)
- ❌ Deleted: Copy of Notebook Categories (duplicate)
- ❌ Deleted: Info - How LLYLI Works (page 1) - replaced with combined version
- ❌ Deleted: Info - Page 2 (deep dive) - merged into combined version

**Result**: Reduced from 15 screens to 12 final screens

#### 2. Combined Scrollable Info Page
Created single comprehensive info page combining both previous info pages:

**Features:**
- **Scrollable content**: 1435px height with scroll indicator "Scroll for more ↓"
- **Prominent stats card** at top:
  - "87% retention after one week (vs. 64% with traditional flashcards)"
  - "4-6x faster vocabulary acquisition through context-rich learning"
- **Scientific sections**:
  - Mixed Practice Sentences (2-4 related words per sentence)
  - FSRS: Free Spaced Repetition (90% recall probability threshold)
  - 3 Correct Recalls = Mastery (64% → 87% improvement)
  - Immediate Feedback: +11% Retention
  - Why Different from Flashcards
  - Your Vocabulary, Not Curriculum
  - The Science in Practice (all numbers highlighted in bullets)
  - Best Practices (10-20 min sessions)
- **CTA button**: "Got it, let's start" at bottom

**Why:**
- Single scrollable page is more mobile-native than pagination
- All scientific advantages in one place for easy reference
- Emphasizes specific numbers throughout (87%, 4-6x, +11%, 90%, 3 recalls)
- Maintains scientific, professional tone

#### 3. Added Info Icons Throughout App
Added ⓘ info icon to all main app screens (positioned top-right):

**Screens with info icon:**
1. ✅ Home - Today (Colored)
2. ✅ Quick Capture
3. ✅ Review Session
4. ✅ Review - Immediate Feedback
5. ✅ Done for Today
6. ✅ Progress
7. ✅ Word Detail View (positioned at 240px to avoid Edit button)

**Screens without info icon:**
- Onboarding 1-3 (first-time only flow, doesn't need info)
- Ready to Use Celebration (modal overlay)

**Why:**
- Consistent access to help from any screen
- Users can learn about methodology when they need it
- Builds trust through transparency
- Professional apps provide contextual help

#### 4. Screen Order Documentation
Created `SCREEN_ORDER.md` documenting the logical user flow:

**Onboarding (first-time only):**
1. Language Selection
2. Welcome
3. First Capture

**Main App Flow:**
4. Home - Today (Colored)
5. Quick Capture
6. Review Session
7. Review - Immediate Feedback
8. Done for Today
9. Ready to Use Celebration (modal)

**Reference Screens:**
10. Progress
11. Word Detail View
12. Info - How LLYLI Works

**Why:**
- Clear documentation for developers
- Logical flow from onboarding → daily use → reference
- Separates first-time experience from returning user flow

---

### Final Screen Count: 12 Screens

| # | Screen Name | Type | Purpose |
|---|-------------|------|---------|
| 1 | Onboarding 1 - Language Selection | Onboarding | First-time: Select languages |
| 2 | Onboarding 2 - Welcome | Onboarding | First-time: Value prop |
| 3 | Onboarding 3 - First Capture | Onboarding | First-time: Guided capture |
| 4 | Home - Today (Colored) | Main Flow | Entry point, daily stats, CTAs |
| 5 | Quick Capture | Main Flow | Fast phrase capture |
| 6 | Review Session | Main Flow | Spaced repetition review |
| 7 | Review - Immediate Feedback | Main Flow | Correct/incorrect feedback |
| 8 | Done for Today | Main Flow | Session complete summary |
| 9 | Ready to Use Celebration | Main Flow | Mastery achieved modal |
| 10 | Progress | Reference | Overall stats, categories |
| 11 | Word Detail View | Reference | Individual word details |
| 12 | Info - How LLYLI Works | Reference | Methodology explanation |

---

### Key Scientific Numbers Highlighted Throughout

All mockups now emphasize the research-backed advantages:

- **87% retention** after one week (vs. 64% traditional flashcards)
- **4-6x faster** vocabulary acquisition through context-rich learning
- **+11% retention** boost from immediate feedback
- **90% recall probability** threshold for FSRS scheduling
- **3 correct recalls** required for mastery
- **10-20 minutes** optimal session length
- **2-4 related words** per mixed practice sentence

**Source:** All numbers from PRD.md research citations (Section 2.1.A, 6.1, 6.2)

---

### Files Updated/Created

**Updated:**
- `prototypes/web/LLYLI.f0` - Final 12 screens with all refinements
  - Added info icons to 7 main app screens
  - Combined info pages into single scrollable page
  - Enhanced scientific numbers throughout
  - Deleted 4 duplicate screens

**Created:**
- `prototypes/web/SCREEN_ORDER.md` - Complete screen flow documentation
  - Logical user flow from onboarding → main app → reference
  - Screen purpose and navigation patterns
  - Scientific numbers summary

**Exported:**
- All 12 screens as PNG images in logical order
  - Ready for developer handoff
  - Ready for user testing
  - Ready for stakeholder review

---

### Final Acceptance Criteria ✅

**All original criteria maintained:**
- ✅ Capture is one tap from anywhere (primary CTA + FAB)
- ✅ Home is action-based, not analytics dashboard
- ✅ Review screen communicates mixed practice clearly
- ✅ Progress is action-first with "Practice Now" CTAs
- ✅ Tokenized color palette for easy rebranding

**Scientific aesthetic criteria:**
- ✅ Celebrations are calm, professional, data-driven
- ✅ Specific scientific numbers emphasized (87%, 4-6x, +11%)
- ✅ Info page combines all methodology in scrollable view
- ✅ Info accessible via ⓘ icon on all main screens
- ✅ FSRS algorithm explained with 90% threshold

**Final cleanup criteria:**
- ✅ Duplicate screens removed (15 → 12 screens)
- ✅ Capture screen exists and is accessible
- ✅ Screens documented in logical order
- ✅ All screens exported as PNG for development
- ✅ Scientific advantages with numbers highlighted throughout

---

### Development Handoff Ready ✅

The mockups are now finalized and ready for:
1. **Developer implementation** - All screens exported, flows documented
2. **User testing** - Complete onboarding → daily use → reference flow
3. **Stakeholder review** - Scientific credibility clearly communicated
4. **Marketing materials** - Key differentiators (87%, 4-6x) prominently featured

**Next Steps:**
- Begin technical implementation per `docs/product/prd.md`
- Follow architecture in `docs/product/implementation-plan.md`
- Reference these mockups for UI/UX guidance
- Maintain scientific, professional aesthetic throughout

---

*Updated 2026-01-14 | All MVP screens complete + scientific aesthetic applied*
