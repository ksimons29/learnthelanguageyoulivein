# Handoff Document - 2026-01-19

## Quick Start
```bash
cd web && npm run dev    # Start dev server at localhost:3000
```

## Current Status

### ✅ Complete
- All QA bugs from Session 17 resolved (except #29 turbopack - low priority)
- Language selection redesign with Moleskine aesthetic
- Storage RLS migration applied
- Progress API optimized (~10x faster)

### ⚠️ In Progress
- **Sentence generation**: Pre-gen works, review integration WIP
- **PWA offline caching**: Basic setup done, needs testing
- **iOS App Store**: Capacitor setup complete, needs submission

### ❌ Not Started
- Stripe payments integration

## Recommended Next Tasks

### High Priority
1. **Integrate sentences into review flow**
   - `web/src/app/review/page.tsx` - Add sentence exercise type
   - `web/src/lib/store/review-store.ts` - Handle sentence reviews
   - Reference: `/docs/engineering/implementation_plan.md` (Epic 2)

2. **Test PWA offline mode**
   - Verify offline caching works for captured words
   - Test background sync when connectivity restores
   - `web/src/app/sw.ts` - Service worker logic

### Medium Priority
3. **iOS TestFlight submission**
   - Follow `/docs/engineering/CAPACITOR_IOS_SETUP.md`
   - Build: `npm run build && npx cap sync ios`
   - Open Xcode: `npx cap open ios`

4. **Performance monitoring**
   - Verify Progress API improvement in production
   - Monitor sentence generation success rate

### Low Priority
5. **Turbopack compatibility (#29)**
   - `@serwist/next` needs Turbopack support
   - Currently using Webpack (works fine)

## Key Files for Next Session

| File | Purpose |
|------|---------|
| `web/src/app/review/page.tsx` | Review session UI - needs sentence integration |
| `web/src/lib/sentences/generator.ts` | Sentence generation with improved validation |
| `web/src/app/api/progress/route.ts` | Optimized progress API |
| `web/src/components/ui/flag-stamp.tsx` | New flag component for language selection |

## Technical Notes

### Database
- Storage RLS policies are applied - audio uploads work
- Sentence hash race condition handled with `onConflictDoNothing()`

### Performance
- Progress API: Combined queries using `count(*) filter (where ...)`
- Runs 8 parallel queries instead of 20 sequential

### Validation
- Sentence validation now handles Unicode (Portuguese accents)
- Uses 4-strategy matching: exact → normalized → includes → stem

### Design
- Flags use clean `.flag-sticker` CSS class
- No tape/worn effects - premium vinyl sticker look
- Copy reflects LLYLI concept: "What language fills your days?"

## Bug Status Summary

| Bug | Status | Notes |
|-----|--------|-------|
| #24-#26 | ✅ Fixed | Session 17-18 |
| #27 | ✅ Fixed | Nested button removed |
| #28 | ✅ Fixed | Progress API optimized |
| #29 | ⚠️ Open | Low priority, no impact |
| #30 | ✅ Fixed | Unicode validation |
