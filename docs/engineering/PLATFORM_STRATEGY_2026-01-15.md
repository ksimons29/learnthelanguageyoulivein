# Platform Strategy Update: Web-First MVP

**Date:** 2026-01-15
**Type:** Strategic Pivot
**Status:** Complete

## Summary

LLYLI has been reorganized from a mobile-first (iOS native) approach to a **web-first MVP** strategy. All iOS native app plans have been preserved and moved to Version 2 roadmap.

## What Changed

### Platform Strategy

**Before:**
- MVP: Native iOS app
- Focus: iOS-specific features (Share Extension, Widgets, offline-first)
- Timeline: 9-12 weeks to App Store launch

**After:**
- **V1 MVP:** Responsive web app (mobile + desktop browsers)
- **V2:** Native iOS app (Year 2, after web validation)
- **V3:** Native Android app (Year 2-3)

### Core Focus

The web MVP now emphasizes:
1. **Audio as a primary feature** - High-quality TTS native pronunciation for every phrase
2. **Responsive design** - Mobile-optimized (iOS Safari, Android Chrome) and desktop-accessible
3. **Progressive Web App** - Offline capabilities, installable on mobile devices
4. **Rapid iteration** - Instant updates without App Store review delays
5. **Universal reach** - Works on any device with a browser

## Updated Documents

| Document | Changes Made |
|----------|-------------|
| `/docs/product/prd.md` | • Added web-first platform strategy<br>• Updated NFRs for web (browser support, responsive design, audio quality)<br>• Moved iOS features to "Out of Scope (V2)"<br>• Added PWA requirements<br>• Updated roadmap to show V1/V2/V3 phases |
| `/docs/engineering/implementation_plan.md` | • Emphasized web architecture and Next.js stack<br>• Added comprehensive audio architecture section<br>• Updated tech stack with audio services (OpenAI TTS, Google TTS, ElevenLabs)<br>• Added PWA deployment checklist<br>• Updated risk assessment for web-specific concerns<br>• Enhanced data model with audio URLs and FSRS fields |
| `/docs/product/vision.md` | • Updated vision to mention "web platform"<br>• Added Platform Evolution section (V1/V2/V3)<br>• Emphasized audio as core innovation<br>• Updated value proposition with web-first benefits<br>• Revised long-term vision with phased approach<br>• Added guiding principle: "Platform follows purpose" |
| `/.claude/CLAUDE.md` | • Updated platform context to show V1 (web), V2 (iOS), V3 (Android)<br>• Updated Current Focus to emphasize web MVP and audio<br>• Fixed documentation references to correct paths<br>• Added reference to v2_native_ios_roadmap.md |
| `/docs/product/v2_native_ios_roadmap.md` | **NEW FILE** - Comprehensive V2 iOS roadmap including:<br>• All iOS-specific features (Share Extension, Widgets, offline-first)<br>• Technical architecture for SwiftUI + CoreData + CloudKit<br>• Implementation phases (15-20 weeks)<br>• Success metrics and migration path<br>• Decision rationale for why V2 not V1 |
| `/confabulator/ios-next-steps.md` | • Added warning header: "This is V2 Planning"<br>• Added reference to new v2_native_ios_roadmap.md<br>• Preserved original content for future reference |

## New File Structure

```
docs/
├── product/
│   ├── prd.md                      # Updated for web MVP
│   ├── vision.md                   # Updated for phased approach
│   ├── v2_native_ios_roadmap.md    # NEW - Comprehensive iOS V2 plan
│   └── business_model_canvas.md    # Unchanged
├── engineering/
│   └── implementation_plan.md      # Updated for web + audio architecture
├── design/
│   └── wireframes.md               # Unchanged (already web-focused)
└── active/
    └── spec.md                     # Empty, ready for current work

prototypes/
└── web/
    ├── SCREEN_ORDER.md             # Existing web mockups (perfect for V1)
    └── *.png                       # 13 screens designed for web

confabulator/
└── ios-next-steps.md               # Marked as V2, points to new roadmap
```

## Strategic Rationale

### Why Web-First?

1. **Faster Validation**
   - Deploy instantly, update without App Store review
   - Iterate based on user feedback in real-time
   - Prove learning methodology before platform investment

2. **Universal Reach**
   - Works on iPhone, Android, desktop, tablet
   - No app store friction (download, updates)
   - One codebase serves all users

3. **Lower Initial Cost**
   - Single web codebase vs. iOS + Android + web
   - No App Store fees (30% commission)
   - Cheaper to maintain initially

4. **Better for Audio MVP**
   - Web Audio API mature and well-supported
   - TTS services integrate easily via API
   - Audio caching with Service Workers proven

5. **Existing Mockups**
   - 13 web screens already designed in `/prototypes/web/`
   - Ready to implement immediately
   - No iOS-specific design needed yet

### Why iOS V2 (Not V1)?

Native iOS adds features web cannot match:
- **Share Extension:** Capture from WhatsApp, iMessage, Safari directly
- **Widgets:** Home/Lock Screen "words due" count
- **Offline-First:** Full functionality without internet
- **Haptic Feedback:** Tactile responses for mastery
- **iCloud Sync:** Seamless cross-device sync

But these **require proven product-market fit first**. Web MVP validates the core hypothesis (87% retention, engagement) before committing to iOS-specific development.

## Audio Architecture (New Focus)

The web MVP now includes comprehensive audio architecture:

### Audio Generation Pipeline
1. User captures phrase
2. Backend calls TTS API (OpenAI/Google/ElevenLabs)
3. Audio file stored in CDN (S3 + CloudFront or Vercel Blob)
4. Audio URL cached in database
5. Frontend plays audio with <1s latency

### Audio Optimization
- **Format:** AAC (preferred) or MP3 fallback
- **Quality:** 44.1kHz, 128kbps (optimal for speech)
- **Caching:** Service Worker caches all played audio
- **Mobile:** HTML5 `<audio>` element for iOS Safari compatibility
- **Preloading:** Background preload for due review cards

### TTS Provider Options
- **Primary:** OpenAI TTS (high quality, cost-effective, multilingual)
- **Alternative:** Google Cloud TTS (wide language support)
- **Premium:** ElevenLabs (ultra-realistic, higher cost)

## Migration Path for Users

1. **Web MVP (V1):** User signs up on web, captures words, reviews
2. **iOS App (V2):** User downloads iOS app, signs in with same account
3. **Server syncs all data** to iOS app via CloudKit
4. **User can use both** web and iOS seamlessly

No data migration required - server is source of truth.

## Next Steps for Implementation

### Immediate (Week 1-2)
1. ✅ Update all documentation (COMPLETE)
2. Set up Next.js project with PWA support
3. Choose TTS provider and set up API
4. Design database schema with audio URLs
5. Implement basic audio playback POC

### Short-term (Month 1-2)
1. Build core web UI (Home, Capture, Review screens)
2. Implement FSRS algorithm (ts-fsrs library)
3. Integrate TTS API and audio caching
4. Deploy to Vercel staging
5. Test on mobile devices (iPhone Safari, Android Chrome)

### Medium-term (Month 3-6)
1. Complete all 13 screens from mockups
2. Add PWA functionality (offline, install prompt)
3. Launch beta to first 100 users
4. Gather feedback and iterate
5. Launch public V1.0

### Long-term (Year 2)
1. Reach 10,000+ active users on web
2. Validate 87% retention metric
3. Secure funding for iOS development
4. Kickoff V2 iOS app (15-20 weeks)
5. Launch iOS app on App Store

## Success Metrics (Web MVP)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Page Load Time | <2s on 3G | Vercel Analytics |
| Audio Playback Latency | <1s | Custom instrumentation |
| 7-day Word Retention | ≥85% | Correct recall rate |
| 30-day User Retention | ≥40% | Active users D30/D1 |
| Mobile Usage | ≥70% | Device analytics |
| Audio Feature Usage | ≥90% | Users who play audio |

## Preserved iOS Content

All iOS planning has been preserved in two locations:
1. `/docs/product/v2_native_ios_roadmap.md` - Comprehensive V2 roadmap
2. `/confabulator/ios-next-steps.md` - Original detailed iOS implementation plan

This content includes:
- iOS Human Interface Guidelines compliance
- SwiftUI + CoreData + CloudKit architecture
- Share Extension implementation
- WidgetKit widgets (Home Screen, Lock Screen)
- Haptic feedback mapping
- App Store submission checklist
- VoiceOver accessibility requirements
- Complete 8 epics with task breakdowns

Nothing was deleted - only reorganized for V2.

## Communication

### For Team
"We're starting with a web MVP to validate the learning methodology faster and reach all platforms. Native iOS comes in Year 2 after we've proven the core hypothesis with 10,000+ users."

### For Users
"LLYLI works on any device with a browser - your phone, tablet, or computer. No app store needed. Just open the website and start learning."

### For Investors
"Web-first enables rapid iteration and universal reach. We'll validate retention metrics (87% target) and user engagement before committing to native app development. This reduces risk and accelerates time-to-market."

## Open Questions

1. **TTS Provider:** OpenAI TTS vs. Google TTS vs. ElevenLabs?
   - **Recommendation:** Start with OpenAI TTS (quality + cost), add ElevenLabs as premium option

2. **PWA vs. Web-only:** Full PWA with offline or just responsive web?
   - **Recommendation:** Full PWA - enables install prompt and offline reviews (competitive advantage)

3. **Database:** Neon (PostgreSQL) vs. Supabase?
   - **Recommendation:** Supabase (includes auth, storage, real-time features out of box)

4. **FSRS Library:** ts-fsrs (TypeScript) vs. custom implementation?
   - **Recommendation:** ts-fsrs library (battle-tested, maintained by FSRS creators)

---

**Conclusion:** LLYLI is now positioned for rapid web MVP development with audio as a core feature. All iOS planning preserved for Year 2 execution after web validation.

---

*Reorganization completed by: Claude Code*
*Date: 2026-01-15*
