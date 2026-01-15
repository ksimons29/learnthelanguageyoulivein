# LLYLI Screen Order - Logical User Flow

## Screens Overview
Total: 13 screens across onboarding, main app flow, and reference views

**Recent Update (2026-01-15)**: Added dedicated Notebook screen to separate word browsing from analytics. Progress now focuses on stats/analytics while Notebook handles category browsing and word management.

---

## 1. First-Time User Flow (Onboarding - Show Once)

### 1.1 Onboarding 1 - Language Selection
- **Purpose**: User selects native language and target learning language
- **Page ID**: `bFxVxGyEjNjl-O5NdYo3l`
- **Next**: Onboarding 2

### 1.2 Onboarding 2 - Welcome
- **Purpose**: Introduces app value proposition and core features
- **Page ID**: `QMZrjWF90WvjcuKPMEMaS`
- **Next**: Onboarding 3

### 1.3 Onboarding 3 - First Capture
- **Purpose**: Guides user through their first word capture
- **Page ID**: `R_qFnPd-1k2t4ujXlSBnT`
- **Next**: Home - Today

---

## 2. Main App Flow (Returning Users)

### 2.1 Home - Today (Colored)
- **Purpose**: Main entry point showing daily stats and CTAs
- **Page ID**: `6rBdHqKyKL7m-02P2dfMx`
- **Features**:
  - Shows words due for review
  - Shows mastered words count
  - Shows capture streak
  - ⓘ Info icon (top-right) → Info page
- **Actions**:
  - "Start Review" → Review Session
  - "Quick Capture" → Quick Capture
  - Bottom nav → Progress

### 2.2 Quick Capture
- **Purpose**: Fast word/phrase capture interface
- **Page ID**: `xzmgqEBeerdWv7UXkgNw3`
- **Features**:
  - Text input for word/phrase
  - Auto-detection of language
  - ⓘ Info icon (top-right) → Info page
- **Actions**:
  - "Add Word" → Returns to Home
  - Bottom nav → Home, Review, Progress

### 2.3 Review Session
- **Purpose**: Active spaced repetition review interface
- **Page ID**: `ywJmyJUo0VcDgtRNUWzNq`
- **Features**:
  - Shows mixed-practice sentence with target word
  - Progress indicator (e.g., "2/8 words")
  - ⓘ Info icon (top-right) → Info page
- **Actions**:
  - User submits answer → Review - Immediate Feedback

### 2.4 Review - Immediate Feedback
- **Purpose**: Shows correct/incorrect result immediately after answer
- **Page ID**: `BSNhUZQ31WKPLmhQJHvHP`
- **Features**:
  - Visual feedback (green checkmark or red X)
  - Shows correct answer if wrong
  - Shows translation and context
  - ⓘ Info icon (top-right) → Info page
  - Scientific note: +11% retention boost from immediate feedback
- **Actions**:
  - "Continue" → Next word in Review Session OR Done for Today

### 2.5 Done for Today
- **Purpose**: Session completion summary with stats
- **Page ID**: `NOVVYUHr0-arsyky5CV12`
- **Features**:
  - Shows words reviewed count
  - Shows accuracy percentage
  - Shows streak maintenance
  - ⓘ Info icon (top-right) → Info page
  - Scientific aesthetic: calm, data-driven
- **Actions**:
  - "View Progress" → Progress
  - "Add More Words" → Quick Capture
  - "Done" → Home

### 2.6 Ready to Use Celebration (Modal)
- **Purpose**: Celebrates when a word reaches 3 correct recalls (mastery)
- **Page ID**: `ntNw_Ip6wqV7FIup_PQm9`
- **Features**:
  - "Mastery Achieved" header (scientific tone)
  - Shows the mastered phrase
  - Explains: "Three successful retrievals recorded. This phrase has reached optimal retention probability."
  - 87% retention stat highlighted
- **Trigger**: Appears during review when word hits 3rd correct recall
- **Actions**:
  - "Continue" → Next word in review OR Done for Today

---

## 3. Reference Screens (Accessible Anytime)

### 3.1 Notebook - Browse Words
- **Purpose**: Browse and organize captured words by category
- **Page ID**: `0M6X85P5kILsY5gcWM4qX`
- **Features**:
  - Search bar for finding phrases quickly
  - **Inbox section** (highlighted): New & untagged phrases (5 items shown with badge)
  - **Categories section**: Emoji-based category cards
    - 🏢 Work: 24 phrases · 8 due
    - 💬 Social: 15 phrases · 3 due
    - 🛍️ Shopping: 9 phrases · 2 due
  - Each category shows total count + due count
  - Chevron (›) indicates tappable to view category details
  - ⓘ Info icon (top-right) → Info page
- **Actions**:
  - Tap search → Search phrases
  - Tap Inbox → View untagged phrases
  - Tap category → View category detail + practice
  - Bottom nav → Home, Capture, Review, Notebook (selected), Progress

### 3.2 Progress
- **Purpose**: Shows overall learning statistics and analytics
- **Page ID**: `pVJcuX67RRdzbrcloek5R`
- **Features**:
  - Total words captured
  - Words mastered (with "Ready to Use" badge)
  - Learning analytics and trends
  - ⓘ Info icon (top-right) → Info page
- **Actions**:
  - View detailed stats
  - Bottom nav → Home, Capture, Review, Notebook, Progress (selected)

### 3.3 Word Detail View
- **Purpose**: Shows full details for a specific word/phrase
- **Page ID**: `AFQ-WusaCY2O7domBKc5C`
- **Features**:
  - Word/phrase + translation
  - Audio playback button
  - Context sentences (multiple examples)
  - Mastery status
  - Next review date (based on FSRS scheduling)
  - ⓘ Info icon (top-right, positioned at 240px to avoid Edit button) → Info page
- **Actions**:
  - "Edit" button
  - Back to Notebook or Progress (depending on entry point)

### 3.4 Info - How LLYLI Works
- **Purpose**: Comprehensive explanation of app methodology and science
- **Page ID**: `lkvTr-rKTaAlsbm4JvLRe`
- **Features**:
  - **Scrollable content** (1435px height)
  - Stats card: "87% retention vs. 64%" and "4-6x faster acquisition"
  - Sections:
    - Mixed Practice Sentences (2-4 related words)
    - FSRS Scheduling (90% recall probability threshold)
    - 3 Correct Recalls = Mastery (64% → 87% improvement)
    - Immediate Feedback (+11% retention)
    - Why Different from Flashcards
    - Your Vocabulary, Not Curriculum
    - The Science in Practice (bulleted with all numbers)
    - Best Practices
  - "Scroll for more ↓" indicator
  - "Got it, let's start" CTA button
- **Accessible from**: ⓘ icon on all main app screens
- **Actions**:
  - "Got it, let's start" → Returns to previous screen

---

## Screen Count Summary
- **Onboarding**: 3 screens (first-time only)
- **Main Flow**: 6 screens (Home, Capture, Review, Feedback, Done, Celebration)
- **Reference**: 4 screens (Notebook, Progress, Word Detail, Info)
- **Total**: 13 screens

---

## Navigation Patterns

### Bottom Navigation (persistent on main screens)
**5-tab navigation** (iOS standard):
1. 🏠 Home → Home - Today
2. ➕ Capture → Quick Capture
3. 📝 Review → Review Session (if words are due)
4. 📓 Notebook → Notebook - Browse Words
5. 📊 Progress → Progress (analytics/stats)

**Design Rationale**:
- Separates browsing (Notebook) from analytics (Progress) for clearer mental model
- Inbox feature in Notebook surfaces new, untagged captures
- All 5 core functions accessible in one tap

### ⓘ Info Icon (top-right on all screens except onboarding and modals)
- Present on: Home, Quick Capture, Review Session, Review Feedback, Done for Today, Progress, Word Detail
- Action: Opens Info - How LLYLI Works (scrollable)

### Back Button
- Word Detail View → Notebook or Progress (depending on entry point)
- Category Detail → Notebook
- All screens can navigate back logically

---

## Key Scientific Numbers Used Throughout
- **87% retention** after one week (vs. 64% traditional flashcards)
- **4-6x faster** vocabulary acquisition through context-rich learning
- **+11% retention** boost from immediate feedback
- **90% recall probability** threshold for FSRS scheduling
- **3 correct recalls** required for mastery
- **10-20 minutes** typical session length
- **2-4 related words** per mixed practice sentence

---

## Design Philosophy
- **Scientific aesthetic**: Calm, professional, data-driven (not gamified)
- **Immediate feedback**: Shown after every review response
- **Progress visibility**: Stats and mastery status always accessible
- **Frictionless capture**: Under 2 seconds from word encounter to saved
- **Evidence-backed confidence**: "Ready to Use" badge means proven retention

---

*Last updated: 2026-01-15*
*Frame0 file: prototypes/web/LLYLI.f0*
*Update: Added dedicated Notebook screen (13 screens total) with 5-tab navigation*
