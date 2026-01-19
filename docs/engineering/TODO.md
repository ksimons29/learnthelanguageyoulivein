# LLYLI MVP - Remaining Work

**Last Updated:** 2026-01-19
**Status:** Active Development

---

## Priority Legend
- **P0** - Required for MVP launch
- **P1** - Should have (can launch without, but add soon)
- **P2** - Nice to have (post-launch)

---

## P0 - Required for MVP

### 1. PWA Implementation
**Status:** ✅ Complete (2026-01-19)
**Effort:** 8-12 hours

The implementation plan specifies PWA support for offline capabilities and mobile install prompt.

**Completed Tasks:**
- [x] Create `/web/public/manifest.json` with app icons (192x192, 512x512)
- [x] Implement Service Worker via Serwist (modern next-pwa fork)
  - Audio files: Cache-first (1 year)
  - Static assets: Cache-first (30 days)
  - API /words, /reviews: Network-first (1 day fallback)
  - Categories/progress: Stale-while-revalidate (1 day)
- [x] iOS meta tags already in layout.tsx (appleWebApp config)
- [x] Create offline fallback page (`/~offline`)
- [x] Preload audio for due review words at session start
- [x] Offline review queue with IndexedDB + auto-sync on reconnect
- [x] Install prompt banner UI
- [x] Offline/online status indicator

**Testing:** See GitHub Issue #18 Section 9 for verification steps

**Files Created:**
- `web/public/manifest.json` - PWA manifest
- `web/src/app/sw.ts` - Service worker source
- `web/src/app/~offline/page.tsx` - Offline fallback
- `web/src/lib/hooks/use-network-status.ts` - Network detection
- `web/src/lib/hooks/use-install-prompt.ts` - Install prompt
- `web/src/lib/offline/` - IndexedDB queue + sync service
- `web/src/lib/audio/preload.ts` - Audio preloader
- `web/src/components/ui/offline-indicator.tsx` - Status banner
- `web/src/components/ui/install-banner.tsx` - Install prompt UI

---

### 2. End-to-End Testing & Bug Fixes
**Status:** Not started
**Effort:** 16-24 hours

Before launch, validate the complete user journey works correctly.

**Tasks:**
- [ ] User can complete full review flow end-to-end
- [ ] Words advance through mastery stages correctly
- [ ] Session boundaries respected (2-hour gap = new session)
- [ ] FSRS scheduling adapts to user performance
- [ ] Sentences never repeat for same word combinations
- [ ] Audio plays correctly on mobile (iOS Safari, Android Chrome) and desktop
- [ ] Mastery modal appears after 3rd correct recall
- [ ] Audio playback starts within 1 second

**Testing Checklist from implementation_plan.md:**
- [ ] Data model test: Create word, generate 3 sentences, verify none repeat
- [ ] Mastery test: Review word correctly 3x across 3 sessions, verify 'ready_to_use' status
- [ ] FSRS test: Submit ratings 1-4, verify next review date changes appropriately

---

## P1 - Should Have

### 3. Custom Tags UI
**Status:** Schema exists, no UI
**Effort:** 8-12 hours

Tags schema is in `/web/src/lib/db/schema/tags.ts` but there's no UI to create/manage them.

**Tasks:**
- [ ] Add tag input to word capture form (optional)
- [ ] Add tag management in word detail view
- [ ] Allow filtering words by tag in notebook view
- [ ] Create `/api/tags` CRUD endpoints

**Reference:** `/docs/engineering/implementation_plan.md` Epic 4, Task 4.2

---

### 4. Guest Access (Try Before Signup)
**Status:** Not implemented
**Effort:** 12-16 hours

Allow 5 word captures before requiring signup to improve conversion.

**Tasks:**
- [ ] Store guest words in localStorage with anonymous ID
- [ ] Show progress: "3 of 5 free captures used"
- [ ] On signup, migrate words to user account
- [ ] Create guest session tracking

**Reference:** `/docs/engineering/AUTH_AND_MONETIZATION_PLAN.md` lines 96-127

---

### 5. Social Authentication (Google/Apple)
**Status:** Supabase Auth ready, social providers not configured
**Effort:** 4-8 hours

Add Google and Apple Sign-In for lower friction signup.

**Tasks:**
- [ ] Configure Google OAuth in Supabase dashboard
- [ ] Configure Apple Sign-In in Supabase dashboard
- [ ] Add social login buttons to sign-up/sign-in pages
- [ ] Handle account linking (email user tries Google)

**Reference:** `/docs/engineering/AUTH_AND_MONETIZATION_PLAN.md` lines 17-39

---

### 6. User Language Settings UI
**Status:** Schema exists, no settings page
**Effort:** 6-8 hours

Allow users to change their native/target language after onboarding.

**Tasks:**
- [ ] Create settings page (`/settings`)
- [ ] Add language preference dropdowns
- [ ] Update user profile on save
- [ ] Use user preferences in translation/TTS (currently uses defaults)

**Reference:** `/docs/engineering/LANGUAGE_CONFIGURATION.md` lines 179-199

---

## P2 - Nice to Have (Post-Launch)

### 7. Stripe Payment Integration
**Status:** Schema ready (`stripeCustomerId`), no integration
**Effort:** 16-24 hours

Implement freemium monetization with Stripe.

**Tasks:**
- [ ] Set up Stripe account and products
- [ ] Create `/api/stripe/checkout` endpoint
- [ ] Create `/api/stripe/webhook` for subscription events
- [ ] Implement subscription tier enforcement (50 words free limit)
- [ ] Create upgrade prompts in UI
- [ ] Add subscription management page

**Reference:** `/docs/engineering/AUTH_AND_MONETIZATION_PLAN.md` lines 130-203

---

### 8. Data Export
**Status:** Not implemented
**Effort:** 4-6 hours

Allow Pro users to export their word data.

**Tasks:**
- [ ] Create `/api/words/export` endpoint
- [ ] Export formats: CSV, JSON
- [ ] Respect subscription tier (Pro only)
- [ ] Add export button to settings page

---

### 9. Starter Packs
**Status:** Documented, not implemented
**Effort:** 12-16 hours

Optional starter packs for new users to reduce empty state.

**Tasks:**
- [ ] Create starter pack content (20-40 phrases each):
  - Lisbon essentials
  - Workplace essentials
  - Apartment and utilities essentials
  - Doctor and pharmacy essentials
- [ ] Add opt-in prompt during onboarding
- [ ] Schedule starter pack items gradually (don't flood reviews)
- [ ] Prioritize user-captured words over starter pack items

**Reference:** `/docs/engineering/llyli_default_categories_and_packs.md`

---

### 10. Advanced Analytics
**Status:** Basic progress page exists
**Effort:** 8-12 hours

Enhanced analytics for power users.

**Tasks:**
- [ ] Add retention rate calculation over time
- [ ] Add word difficulty distribution chart
- [ ] Add category breakdown visualization
- [ ] Add review session history

---

### 11. Offline Sync
**Status:** ✅ Complete (2026-01-19) - Merged into PWA Implementation

Implemented as part of Epic 7 PWA:
- [x] Store pending reviews in IndexedDB
- [x] Sync on connectivity restoration (auto-sync on `online` event)
- [x] Cache audio files for offline playback
- [ ] Cache pre-generated sentences for offline review (deferred - not critical)

---

## Documents to Archive/Delete

The following documents are **outdated** and should be moved to `/docs/engineering/archive/`:

| Document | Reason |
|----------|--------|
| `Missing Features.MD` | All claimed "missing" features are now implemented |
| `NEXT_IMPLEMENTATION_PHASE.md` | Phase 1 is complete, document is outdated |
| `llyli_default_categories_and_packs.md` | Categories consolidated to 8; document mentions 12 |

---

## Effort Summary

| Priority | Items | Estimated Hours |
|----------|-------|-----------------|
| **P0** | 1 item remaining (E2E Testing) | 16-24 hours |
| **P1** | 4 items | 30-44 hours |
| **P2** | 4 items (Offline Sync merged into PWA) | 40-58 hours |
| **Total** | 9 items | **86-126 hours** |

**Completed P0:** PWA Implementation (8-12 hours) ✅

---

## Quick Wins (< 4 hours each)

1. Delete/archive outdated documentation
2. ~~Add PWA manifest.json~~ ✅ Done
3. Configure Google OAuth in Supabase
4. Add export button (basic CSV)

---

*This document replaces the outdated `Missing Features.MD` and should be kept current as features are completed.*
