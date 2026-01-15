# Implement MVP from Frame0 Mockups

**Status**: Ready for Development
**Priority**: High
**Estimated Effort**: 6-8 weeks (full MVP)
**Prerequisites**: Frame0 mockups finalized (12 screens)

---

## Overview

Implement the LLYLI MVP mobile application based on the finalized Frame0 mockups. All 12 screens are designed, documented, and ready for development handoff.

**Key Deliverables:**
- ✅ Onboarding flow (3 screens)
- ✅ Main app flow (6 screens)
- ✅ Reference screens (3 screens)
- ✅ Scientific aesthetic applied throughout
- ✅ All flows documented with user journeys

---

## Essential Documentation to Read First

**CRITICAL - Read these before writing any code:**

| Document | Purpose | Location |
|----------|---------|----------|
| **PRD** | Feature specs, user stories, acceptance criteria | `docs/product/prd.md` |
| **Implementation Plan** | Architecture, tech stack, data model, API routes | `docs/product/implementation-plan.md` |
| **Screen Order** | Logical user flow, navigation patterns | `prototypes/web/SCREEN_ORDER.md` |
| **Mockups Changelog** | Design rationale, per-screen decisions | `prototypes/web/LLYLI-Mockups-Changelog.md` |
| **Color Scheme** | Brand colors, design tokens | `docs/design/colorscheme.md` |
| **Vision** | Problem statement, target users, goals | `docs/product/vision.md` |
| **PR-FAQ** | Value props, differentiation, customer quotes | `docs/product/pr_faq.md` |

---

## Tech Stack (from Implementation Plan)

**Frontend:**
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui (Radix UI components)
- React Hook Form + Zod (form validation)

**Backend:**
- Next.js API routes
- Drizzle ORM
- PostgreSQL

**Authentication:**
- NextAuth.js or Clerk

**Deployment:**
- Vercel (frontend + API)
- AWS RDS or Supabase (PostgreSQL)

**Audio:**
- TTS provider TBD (iOS native, Google, Azure, or ElevenLabs)

---

## Implementation Phases

### Phase 1: Setup & Infrastructure (Week 1)

**Tasks:**
1. Initialize Next.js project with TypeScript
2. Set up Tailwind CSS + shadcn/ui
3. Configure Drizzle ORM + PostgreSQL connection
4. Set up authentication (NextAuth.js or Clerk)
5. Create design token system (CSS variables)
6. Set up project structure per implementation plan

**Reference:**
- `docs/product/implementation-plan.md` → Section 3 (Tech Stack)
- `docs/design/colorscheme.md` → Design Tokens section

**Acceptance Criteria:**
- [ ] Project runs locally with `npm run dev`
- [ ] Database migrations work with `npm run db:migrate`
- [ ] Design tokens applied as CSS variables
- [ ] Authentication flow working (sign up / sign in)

---

### Phase 2: Database Schema & Models (Week 1-2)

**Tasks:**
1. Create Drizzle schema for:
   - Users
   - Phrases (captured words/phrases)
   - Reviews (SRS history)
   - Categories/Tags
   - Mixed practice sentences
2. Set up seed data for testing
3. Create TypeScript types from schema

**Reference:**
- `docs/product/implementation-plan.md` → Section 4.1 (Data Model)
- `docs/product/prd.md` → FR-1 (Phrase Capture), FR-3 (Review System)

**Acceptance Criteria:**
- [ ] All tables created with proper relationships
- [ ] Seed data populates test phrases
- [ ] TypeScript types auto-generated from schema
- [ ] Can query phrases and reviews from DB

---

### Phase 3: Onboarding Flow (Week 2)

**Screens to Implement:**
1. **Onboarding 1 - Language Selection**
   - Page ID: `bFxVxGyEjNjl-O5NdYo3l`
   - Native language selector (🇬🇧 English)
   - Target language selector (🇵🇹 Portuguese)
   - "Continue" button

2. **Onboarding 2 - Welcome**
   - Page ID: `QMZrjWF90WvjcuKPMEMaS`
   - Value prop communication
   - Progress dots (step 2 of 3)
   - "Get Started" button

3. **Onboarding 3 - First Capture**
   - Page ID: `R_qFnPd-1k2t4ujXlSBnT`
   - Interactive guided capture
   - Text input + voice button
   - "Save" button → Home

**Reference:**
- `prototypes/web/LLYLI-Mockups-Changelog.md` → Onboarding sections
- `prototypes/web/SCREEN_ORDER.md` → Section 1 (First-Time User Flow)
- `docs/product/prd.md` → FR-6.1, FR-6.2, FR-6.3

**Acceptance Criteria:**
- [ ] Language selection saves to user profile
- [ ] Onboarding shown only on first launch
- [ ] First capture saves phrase to database
- [ ] User redirected to Home after onboarding complete

---

### Phase 4: Main App Flow - Capture (Week 3)

**Screens to Implement:**
1. **Home - Today (Colored)**
   - Page ID: `6rBdHqKyKL7m-02P2dfMx`
   - Daily stats (words due, mastered count, streak)
   - Primary CTAs: "Start Review" + "Quick Capture"
   - ⓘ Info icon → Info page
   - Bottom navigation

2. **Quick Capture**
   - Page ID: `xzmgqEBeerdWv7UXkgNw3`
   - Text input for phrase
   - Optional voice input (🎤)
   - Auto-save to database
   - Return to Home

**Reference:**
- `prototypes/web/LLYLI-Mockups-Changelog.md` → Screen A (Home), Screen B (Quick Capture)
- `prototypes/web/SCREEN_ORDER.md` → Section 2.1, 2.2
- `docs/product/prd.md` → FR-1.1, FR-1.2 (Phrase Capture)

**Key Features:**
- **Capture in <2 seconds**: Paste phrase → tap Save → done
- **No mandatory fields** beyond the phrase itself
- **Floating Action Button** (FAB) on appropriate screens

**Acceptance Criteria:**
- [ ] User can capture phrase in under 2 seconds
- [ ] Voice input button present (can stub initially)
- [ ] Phrase saves to database with timestamp
- [ ] Home shows "Captured Today" count
- [ ] FAB appears on Home, Progress screens

---

### Phase 5: Main App Flow - Review System (Week 4-5)

**Screens to Implement:**
1. **Review Session**
   - Page ID: `ywJmyJUo0VcDgtRNUWzNq`
   - Mixed practice sentence with 2-4 highlighted due words
   - Progress indicator (e.g., "5 / 12")
   - Audio playback button (▶)
   - "Reveal" button → shows translation
   - Grading buttons (Hard / Good / Easy)

2. **Review - Immediate Feedback**
   - Page ID: `BSNhUZQ31WKPLmhQJHvHP`
   - Feedback card (green "Good recall!" or red "Not quite")
   - Shows correct translation
   - Shows next review timing ("in 2 days")
   - Word mastery progress (e.g., "2/3")
   - "Continue" → next review

3. **Done for Today**
   - Page ID: `NOVVYUHr0-arsyky5CV12`
   - Session summary (12 phrases reviewed)
   - Accuracy percentage (83% correct)
   - Streak count (7 days 🔥)
   - Tomorrow preview ("8 phrases due")
   - "Practice more" (optional) + "Done" (primary)

**Reference:**
- `prototypes/web/LLYLI-Mockups-Changelog.md` → Screen D (Review Session), Screen 7 (Immediate Feedback), Screen 8 (Done for Today)
- `prototypes/web/SCREEN_ORDER.md` → Section 2.3, 2.4, 2.5
- `docs/product/prd.md` → FR-3.1 through FR-3.6 (Review System)

**CRITICAL DIFFERENTIATOR - Mixed Practice:**
- **NOT** basic flashcards showing one word at a time
- **SHOW** 2-4 due words together in a single practice sentence
- **HIGHLIGHT** the due words in the sentence (e.g., blue color)
- Example: "Vou **verificar** com o cliente e depois posso **ajudar** você."

**Spaced Repetition (FSRS):**
- Implement FSRS algorithm for scheduling (see PRD Section 2.1.A)
- Calculate next review date based on grading (Hard/Good/Easy)
- Show next review timing transparently ("in 2 days", "in 1 week")
- Target: 90% recall probability threshold

**Immediate Feedback:**
- Show feedback **immediately** after each grading action
- Research shows +11% retention boost (PRD Section 6.2)
- Do NOT batch feedback until session end

**Acceptance Criteria:**
- [ ] Review shows mixed practice sentences with 2-4 highlighted words
- [ ] FSRS algorithm calculates next review dates
- [ ] Immediate feedback shown after each response
- [ ] Session summary shows accuracy, streak, tomorrow preview
- [ ] Audio playback works (TTS initially, native audio later)
- [ ] Hard/Good/Easy buttons use LLYLI colors (not blue)

---

### Phase 6: Mastery System (Week 5)

**Screens to Implement:**
1. **Ready to Use Celebration (Modal)**
   - Page ID: `ntNw_Ip6wqV7FIup_PQm9`
   - Triggered when phrase reaches 3 correct recalls
   - "Mastery Achieved" title (scientific tone)
   - Message: "Three successful retrievals recorded. This phrase has reached optimal retention probability..."
   - Green "Continue" button

**Reference:**
- `prototypes/web/LLYLI-Mockups-Changelog.md` → Screen 5 (Ready to Use Celebration)
- `prototypes/web/SCREEN_ORDER.md` → Section 2.6
- `docs/product/prd.md` → FR-5.1, FR-5.2 (Mastery Tracking)

**Mastery Logic:**
- 3 correct recalls = "Ready to Use" status
- Show celebration modal on 3rd correct recall
- Add green "Ready" badge to phrase in Notebook
- Update Home stat: "24 words ready to use"

**Acceptance Criteria:**
- [ ] Modal appears when phrase hits 3 correct recalls
- [ ] Scientific language (not "Great job! 🎉")
- [ ] Green badge appears on mastered phrases
- [ ] Home shows mastered count

---

### Phase 7: Reference Screens (Week 6)

**Screens to Implement:**
1. **Progress**
   - Page ID: `pVJcuX67RRdzbrcloek5R`
   - Total words captured
   - Words mastered (with "Ready to Use" badge)
   - Category breakdown
   - Action buttons: "Practice Now" on each section

2. **Word Detail View**
   - Page ID: `AFQ-WusaCY2O7domBKc5C`
   - Phrase + translation
   - Audio playback
   - Mastery journey:
     - First captured date
     - Review history (7 times: 5 correct, 2 struggled)
     - Progress bar
     - Next review date
   - Tags (e.g., 🏢 Work, 👨‍💼 Customer)
   - "Practice Now" button
   - "Edit" button

3. **Info - How LLYLI Works**
   - Page ID: `lkvTr-rKTaAlsbm4JvLRe`
   - Scrollable content (1435px)
   - Stats card: "87% retention vs. 64%" + "4-6x faster"
   - Sections: Mixed Practice, FSRS, Mastery, Immediate Feedback, Why Different, Best Practices
   - "Got it, let's start" CTA

**Reference:**
- `prototypes/web/LLYLI-Mockups-Changelog.md` → Screen E (Progress), Screen 6 (Word Detail), Screen 7 (Info)
- `prototypes/web/SCREEN_ORDER.md` → Section 3.1, 3.2, 3.3
- `docs/product/prd.md` → FR-4 (Progress Tracking), FR-5 (Mastery)

**Acceptance Criteria:**
- [ ] Progress shows actionable sections with Practice buttons
- [ ] Word Detail shows full mastery journey and personal memory
- [ ] Info page scrollable with all scientific numbers highlighted
- [ ] ⓘ icon on all main screens opens Info page

---

### Phase 8: Design System & Styling (Ongoing)

**Color Application:**
- **DO NOT use blue (#007AFF)** - that was a placeholder in mockups
- **USE LLYLI brand colors** per `docs/design/colorscheme.md`

**Brand Colors to Apply:**
- **Accent Coral Red** (#E85C48): Primary CTAs, FAB, selected tabs, "Reveal" button, Practice buttons
- **Muted Teal Gray** (#5B7979): Secondary actions, "Easy" grading
- **Deep Brown** (#8C5B52): Warnings, "Hard" grading
- **Warm Taupe** (#B58B82): Positive feedback, "Good" grading
- **Background Cream** (#F8F3E6): Main backgrounds
- **Surface Light Beige** (#EFE1D6): Cards, surfaces

**Reference:**
- `docs/design/colorscheme.md` → Complete color token system
- `.github/COLOR-SWAP-REQUIRED.md` → Screen-by-screen color mapping

**Typography Hierarchy:**
- Titles: 32pt
- Body: 16pt
- Hints/Secondary: 12pt

**Spacing Grid:**
- Use 4/8/16/20px spacing system

**Component Consistency:**
- Buttons: Rounded corners, same padding
- Cards: Consistent shadow, rounded corners
- Badges: Blue background, white text
- Icons: Emoji for categories, symbols for actions

**Acceptance Criteria:**
- [ ] All LLYLI brand colors applied (no blue placeholders)
- [ ] Typography hierarchy matches mockups
- [ ] Spacing follows 4/8/16/20px grid
- [ ] Component library created for reusable elements

---

### Phase 9: Advanced Features (Week 7-8)

**Optional for MVP+:**
1. **Voice Input** for phrase capture
2. **Share Extension** (iOS) for capturing from WhatsApp/Safari
3. **Native Audio** (replace TTS with high-quality recordings)
4. **Category-Filtered Practice** (practice only Work phrases)
5. **Mixed Practice Algorithm Refinement** (smarter word selection)
6. **Offline Mode** (service worker + local storage)

**Reference:**
- `docs/product/prd.md` → FR-1.3 (Share Extension), FR-2.4 (Native Audio)
- `docs/product/implementation-plan.md` → Section 5 (Development Roadmap)

---

## Critical Implementation Notes

### 1. Mixed Practice Sentence Generation
**This is the KILLER FEATURE - do NOT implement basic flashcards**

**Requirements:**
- Select 2-4 due words that can fit in a single sentence
- Generate or retrieve a sentence that uses those words naturally
- Highlight the due words visually (e.g., bold + color)

**MVP Approach (naive but functional):**
1. Pre-create sentence templates with slots
2. User adds context sentences when capturing phrases
3. Mix 2-4 words from same context/category
4. If not enough related words, pull from different contexts

**Future Enhancement:**
- AI-generated sentences using GPT-4 or similar
- Sentence database with word associations
- Grammar-aware sentence construction

**Reference:**
- `docs/product/prd.md` → Section 2.1.A (Mixed Practice research)
- `prototypes/web/LLYLI-Mockups-Changelog.md` → Screen D (Review Session)

---

### 2. FSRS Implementation
**Free Spaced Repetition Scheduler - NOT Anki's SM-2**

**Algorithm Requirements:**
- Calculate next review based on difficulty (Hard/Good/Easy)
- Target 90% recall probability
- Adjust intervals based on user's actual performance
- Show transparent next review dates ("in 2 days", "in 1 week")

**Resources:**
- FSRS specification: https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm
- FSRS.js implementation: https://github.com/open-spaced-repetition/fsrs.js

**Reference:**
- `docs/product/prd.md` → Section 2.1.A (SRS research)
- `prototypes/web/SCREEN_ORDER.md` → "90% recall probability threshold"

---

### 3. Scientific Aesthetic
**Professional, calm, data-driven - NOT gamified**

**DO:**
- Use precise terminology ("retrievals", "retention probability", "mastery")
- Show specific numbers (87%, 4-6x, +11%)
- Celebrate with data ("Session Complete", "Mastery Achieved")
- Use calm colors (warm earth tones)

**DO NOT:**
- Use loud emojis (🎉, 🎊)
- Use exclamation points excessively
- Use XP/points/levels
- Use childish language ("Great job!", "You're on fire!")

**Reference:**
- `prototypes/web/LLYLI-Mockups-Changelog.md` → Part 5 (Scientific Aesthetic)
- `docs/product/pr_faq.md` → Target audience (working professionals, expats)

---

### 4. Accessibility & Performance

**WCAG AA Compliance:**
- Test all color combinations for contrast ratio
- Ensure text is readable on all backgrounds
- Provide keyboard navigation

**Performance:**
- Target <2s page load
- Optimize audio files
- Use lazy loading for images
- Implement service worker for offline support

**Mobile-First:**
- All screens designed for iPhone (320x690)
- Touch targets minimum 44x44px
- Swipe gestures where appropriate

---

## Testing Checklist

### User Flow Testing
- [ ] Complete onboarding flow from language selection → first capture
- [ ] Capture phrase in <2 seconds from Home
- [ ] Review session with mixed practice sentences works
- [ ] Immediate feedback shows after each response
- [ ] Session completion shows accurate stats
- [ ] "Ready to Use" celebration triggers on 3rd correct recall
- [ ] Info page accessible from all screens via ⓘ icon
- [ ] Bottom navigation works on all main screens

### Data Integrity
- [ ] Phrases save to database correctly
- [ ] Review history tracked accurately
- [ ] FSRS scheduling calculates correct next review dates
- [ ] Mastery status updates when reaching 3 correct recalls
- [ ] Streak increments daily (not per session)

### Visual Consistency
- [ ] All LLYLI brand colors applied (no blue)
- [ ] Typography hierarchy matches mockups
- [ ] Spacing follows 4/8/16/20px grid
- [ ] Components consistent across screens
- [ ] Scientific aesthetic maintained (no loud celebrations)

### Edge Cases
- [ ] What happens if user has 0 phrases captured?
- [ ] What happens if user has 0 phrases due?
- [ ] What happens if user has only 1 phrase due (can't mix 2-4)?
- [ ] What happens if audio fails to play?
- [ ] What happens on network failure?

---

## Success Metrics (Post-Launch)

**Engagement:**
- Daily active users (DAU)
- Average session length
- Capture rate (phrases captured per day)
- Review completion rate

**Learning Outcomes:**
- Accuracy percentage over time
- Mastery rate (% of phrases reaching 3 correct recalls)
- Retention rate (% still active after 30 days)

**Differentiation Validation:**
- User feedback on mixed practice sentences
- Comparison to basic flashcard apps (user surveys)
- "Ready to Use" confidence ratings

**Reference:**
- `docs/product/business_model_canvas.md` → Key Metrics

---

## Key Files Reference Summary

| File | What It Contains | When to Use |
|------|------------------|-------------|
| `docs/product/prd.md` | Feature requirements, user stories, acceptance criteria | Before implementing any feature |
| `docs/product/implementation-plan.md` | Tech stack, data model, API routes, architecture | Technical implementation decisions |
| `prototypes/web/SCREEN_ORDER.md` | User flow, navigation, screen purposes | Understanding app structure |
| `prototypes/web/LLYLI-Mockups-Changelog.md` | Per-screen design rationale, decisions | Why screens look the way they do |
| `docs/design/colorscheme.md` | Brand colors, design tokens | Styling and theming |
| `.github/COLOR-SWAP-REQUIRED.md` | Element-by-element color mapping | Replacing blue placeholders |
| `docs/product/pr_faq.md` | Value props, customer quotes, differentiation | Understanding product positioning |
| `docs/product/vision.md` | Problem statement, target users, goals | Strategic alignment |

---

## Questions?

If you encounter ambiguity during implementation, refer to the documentation hierarchy:

1. **PRD** (`docs/product/prd.md`) - source of truth for features
2. **Mockups Changelog** (`prototypes/web/LLYLI-Mockups-Changelog.md`) - design rationale
3. **Implementation Plan** (`docs/product/implementation-plan.md`) - technical architecture
4. **This Issue** - implementation roadmap

If still unclear, document the question and flag for Koos/product owner review.

---

**Created**: 2026-01-14
**Frame0 File**: `prototypes/web/LLYLI.f0` (12 screens finalized)
**Status**: Ready for developer handoff
