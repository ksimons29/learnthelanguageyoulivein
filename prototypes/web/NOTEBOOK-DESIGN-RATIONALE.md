# Notebook Screen Design Rationale

**Date**: 2026-01-15
**Change**: Added dedicated Notebook screen, separating word browsing from analytics
**Impact**: 12 screens → 13 screens, 3-tab nav → 5-tab nav

---

## Problem Identified

The original 12-screen design merged two distinct user needs into a single "Progress" screen:

1. **Browsing/organizing captured words** (library function)
2. **Viewing learning statistics** (analytics function)

**Why This Was Problematic**:

- **Naming confusion**: "Progress" implies analytics/stats, not a place to browse your word collection
- **Mental model mismatch**: Users think of browsing their words as different from viewing charts
- **Inbox concept lost**: No clear place for new, untagged captures to appear
- **Feature discoverability**: Word browsing features were hidden under an analytics-sounding label

---

## Solution: Separate Notebook from Progress

### New Structure (13 screens)

**Notebook Screen** (NEW - Screen 3.1)
- **Purpose**: Browse, search, and organize captured words
- **Mental model**: "My word collection" / "Library"
- **Features**:
  - Search bar for instant phrase lookup
  - **Inbox** (highlighted): New & untagged phrases (badge count)
  - **Categories**: Emoji-based cards (🏢 Work, 💬 Social, 🛍️ Shopping)
  - Each category shows: "24 phrases · 8 due"
  - Tap category → View category detail + targeted practice

**Progress Screen** (Screen 3.2 - Refocused)
- **Purpose**: Learning analytics and statistics
- **Mental model**: "How am I doing?" / "Dashboard"
- **Features**:
  - Total words captured
  - Mastery statistics
  - Learning trends and analytics

---

## Design Decisions

### 1. Why 5-Tab Navigation vs. 3-Tab?

**Previous (3 tabs)**:
- 🏠 Home
- ➕ Capture
- 📊 Progress (overloaded: browse + analytics)

**New (5 tabs)**:
- 🏠 Home
- ➕ Capture
- 📝 Review
- 📓 Notebook (NEW - browse/organize)
- 📊 Progress (refocused - analytics only)

**Rationale**:
- **Clearer separation of concerns**: Each tab has one clear purpose
- **Better mental models**: Notebook = collection, Progress = stats
- **iOS standard**: 5 tabs is within iOS HIG guidelines (max recommended)
- **One-tap access**: All core functions accessible without nested navigation

### 2. Why Inbox-First in Notebook?

**Design**: Inbox appears at top of Notebook, before categories

**Benefits**:
- **Surfaces new captures**: Users immediately see phrases they haven't organized
- **Encourages organization**: Badge count (5 items) prompts action
- **Reduces cognitive load**: Don't have to remember to tag during frictionless capture
- **Mirrors email UX**: Familiar "inbox → process → file" workflow

### 3. Why Emoji-Based Categories?

**Visual Design**: Each category has large emoji (🏢, 💬, 🛍️) + name + stats

**Benefits**:
- **Fast visual scanning**: Emoji is faster to parse than text
- **Personality**: Less corporate, more notebook-like
- **User-created categories**: Emoji selection makes categorization fun, not a chore
- **Accessibility**: Color-independent (works in dark mode, for color-blind users)

### 4. Why Show "Total Phrases · Due Count" Per Category?

**Example**: "24 phrases · 8 due"

**Benefits**:
- **Corpus size awareness**: User sees their growing library (motivation)
- **Urgency signaling**: "8 due" prompts action
- **Context-based practice**: "I have a work meeting → tap Work category → practice 8 due phrases"
- **Progress visibility**: Watching "24 phrases" grow over weeks shows learning trajectory

---

## User Flow Impact

### Before (12 screens)
```
Home → [3-tab nav: Home, Capture, Progress]
         ↓
       Progress (confused: browse + stats?)
         ↓
       Word Detail
```

**Pain Points**:
- Users unsure if Progress = browsing or analytics
- No clear Inbox for new captures
- Review button buried in Home screen

### After (13 screens)
```
Home → [5-tab nav: Home, Capture, Review, Notebook, Progress]
         ↓                                    ↓          ↓
       Review Session                   Notebook    Progress
                                           ↓
                                    Inbox (5 new)
                                    🏢 Work (8 due)
                                    💬 Social (3 due)
                                           ↓
                                    Word Detail
```

**Improvements**:
- ✅ Clear purpose for each tab
- ✅ Inbox surfaces untagged captures
- ✅ Category-based practice enables contextual review
- ✅ Review tab accessible in one tap
- ✅ Progress clearly = analytics

---

## Acceptance Criteria Met

✅ **Users can browse their word collection** without navigating through analytics
✅ **Inbox feature** surfaces new, untagged phrases prominently
✅ **Category-based organization** with visual emoji identifiers
✅ **Due count per category** enables targeted, contextual practice
✅ **5-tab navigation** follows iOS HIG, all core functions one tap away
✅ **Progress screen** clearly focused on analytics/stats, not browsing
✅ **Search bar** enables instant phrase lookup

---

## Implementation Notes

### For Developers

**Notebook Screen Components**:
1. **Search Bar**
   - Placeholder: "🔍 Search phrases..."
   - Client-side filter for <1000 phrases, server-side for larger corpora
   - Instant results (no "Search" button needed)

2. **Inbox Card**
   - Highlighted with blue tint background
   - Badge shows untagged phrase count
   - "Tap to organize →" CTA

3. **Category Cards**
   - Each card: Emoji (28px) + Title (16px) + Stats (13px gray) + Chevron (›)
   - Stats format: "{total} phrases · {due} due"
   - Tap → Navigate to Category Detail View

4. **Bottom Navigation**
   - 5 tabs: Home, Capture, Review, Notebook, Progress
   - Notebook tab selected state (blue label)
   - Consistent across all main app screens

**Data Requirements**:
- Count of untagged phrases (for Inbox badge)
- Phrases grouped by category with total + due counts
- User-created categories with emoji + name

**API Endpoints** (suggested):
- `GET /api/phrases/inbox` → Untagged phrases
- `GET /api/categories` → Categories with counts
- `GET /api/categories/:id/phrases` → Phrases in category
- `POST /api/phrases/:id/tag` → Add phrase to category

---

## Future Enhancements (Out of Scope for MVP)

1. **Category creation flow**: In-app UI for creating custom categories
2. **Bulk tagging**: Select multiple Inbox items → Assign category
3. **Smart categories**: Auto-suggest categories based on phrase content
4. **Category icons**: User-selectable emoji or custom icons
5. **Nested categories**: Subcategories (e.g., Work → Meetings, Work → Email)
6. **Category practice modes**: All due, random review, weakest first

---

## Design Philosophy Alignment

This change aligns with LLYLI's core design principles:

✅ **Notebook aesthetic**: Dedicated Notebook screen reinforces personal memory journal feel
✅ **Frictionless capture**: Inbox allows zero-friction capture → organize later workflow
✅ **Context-rich learning**: Category-based practice prepares users for real situations
✅ **Progress visibility**: Clear separation makes analytics easier to understand
✅ **Scientific aesthetic**: Clean, organized interface without gamification

---

## Comparison to Competitors

| Feature | LLYLI (New) | Anki | Quizlet | Duolingo |
|---------|-------------|------|---------|----------|
| Dedicated browse screen | ✅ Notebook | ⚠️ Deck browser | ✅ Sets | ❌ N/A (curriculum) |
| Inbox for new items | ✅ Yes | ❌ No | ❌ No | ❌ N/A |
| Category-based practice | ✅ Yes | ⚠️ Deck-based | ⚠️ Set-based | ❌ No |
| Due counts per category | ✅ Yes | ✅ Yes (per deck) | ❌ No | ❌ N/A |
| Emoji categories | ✅ Yes | ❌ No | ❌ No | ❌ No |

**Differentiation**: LLYLI's Inbox + emoji categories + context-based practice = unique UX in language learning space.

---

## Conclusion

**The Problem**: Merging word browsing and analytics into one "Progress" screen created confusion and buried key features like Inbox.

**The Solution**: Dedicated Notebook screen with Inbox-first design, emoji categories, and 5-tab navigation for clear information architecture.

**The Result**: Users have a clear mental model of where to find their words (Notebook) vs. how they're doing (Progress), with one-tap access to all core functions.

---

*Document created: 2026-01-15*
*Frame0 page ID: `0M6X85P5kILsY5gcWM4qX`*
*Related docs: SCREEN_ORDER.md, LLYLI-Mockups-Changelog.md*
