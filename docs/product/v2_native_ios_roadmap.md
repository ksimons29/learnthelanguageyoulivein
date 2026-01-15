# LLYLI Version 2: Native iOS App Roadmap

**Status:** Planned for Year 2 (after web MVP validation)
**Repository:** https://github.com/ksimons29/learnthelanguageyoulivein
**Updated:** 2026-01-15

## Overview

Version 2 brings LLYLI to native iOS with platform-specific features that enhance the web experience. This phase begins only after the web MVP has validated the core learning methodology and achieved product-market fit.

## Why Native iOS (Version 2)

The web MVP (V1) validates the learning methodology and serves all platforms. Native iOS adds capabilities that web browsers cannot match:

### Platform-Specific Features
- **Share Extension:** Capture words directly from WhatsApp, iMessage, Safari, Mail
- **Widgets:** Home Screen and Lock Screen widgets showing "Words Due Today"
- **Offline-First:** Full functionality without internet connection
- **Haptic Feedback:** Tactile responses for mastery achievements and review feedback
- **iCloud Sync:** Seamless sync across all Apple devices
- **Native Audio:** Optimized audio playback with iOS audio session management
- **Face ID/Touch ID:** Secure, instant authentication

### Prerequisites for V2 Development

Before starting iOS development:
- [ ] Web MVP launched and stable (V1.0)
- [ ] 10,000+ active users on web platform
- [ ] 87% retention metric validated
- [ ] Core learning loop proven effective
- [ ] TTS audio pipeline optimized and cost-effective
- [ ] FSRS algorithm tuned and tested
- [ ] Funding secured for iOS development cycle

---

## V2 Feature Scope

### Core Features (Parity with Web)
- Word capture via text input
- High-quality TTS audio for all phrases
- FSRS-based spaced repetition scheduling
- Dynamic sentence generation (LLM)
- Review sessions with immediate feedback
- Progress tracking and analytics
- Tagging and collections

### iOS-Exclusive Features

#### 1. Share Extension
**Value:** Capture words from anywhere on iOS without switching apps

**Implementation:**
- Share Extension target in Xcode
- Extract text from NSExtensionItem
- App Groups for data sharing between main app and extension
- Background sync to main app

**User Flow:**
1. User sees word in WhatsApp/Safari/Mail
2. Tap Share → "Add to LLYLI"
3. Word captured instantly
4. Return to original app
5. Word appears in LLYLI on next launch

#### 2. Home Screen & Lock Screen Widgets
**Value:** Glanceable "Words Due Today" count encourages daily practice

**Implementation:**
- WidgetKit extension
- Small widget: Due count + icon
- Medium widget: Due count + learning count
- Large widget: Stats grid preview
- Lock Screen widget (iOS 16+): Inline due count
- Timeline updates every 30 minutes

#### 3. Offline-First Architecture
**Value:** Full functionality on flights, in subway, during travel

**Implementation:**
- CoreData + CloudKit for local-first data
- Background sync with iCloud
- Pre-generate sentences for due cards when online
- Cache all audio files locally after first play
- Offline indicator in UI
- Sync queue for offline changes

#### 4. Native Interactions
**Haptic Feedback:**
- Light impact: Card tap, category expansion
- Success: Word mastered (3 correct recalls)
- Warning: Failure threshold reached
- Selection: Answer chosen

**iOS Gestures:**
- Swipe left on word card → Delete
- Swipe right → Edit
- Long press → Quick actions menu
- Pull to refresh → Sync with server

#### 5. Notifications
**Push Notifications:**
- Daily review reminder (customizable time)
- "Ready to Use" notification when word reaches mastery
- Streak maintenance reminders
- Weekly progress summary

**Local Notifications:**
- Review due reminder (offline capable)
- Streak risk warning

#### 6. Siri Shortcuts
**Voice Commands:**
- "Hey Siri, add word to LLYLI"
- "Hey Siri, start review session"
- "Hey Siri, how many words are due?"

---

## Technical Architecture (iOS)

### Tech Stack

**Framework:** SwiftUI (iOS 16.0+)

**Database:**
- CoreData for local persistence
- CloudKit for iCloud sync
- Realm as alternative (evaluate performance)

**Networking:**
- URLSession for API calls
- Alamofire for advanced networking (optional)
- Background fetch for sync

**Audio:**
- AVFoundation for audio playback
- Audio session management for interruptions
- Background audio if needed

**State Management:**
- SwiftUI @StateObject, @ObservedObject
- Combine for reactive data flow
- MVVM architecture

**Dependencies:**
- [ts-fsrs](https://github.com/open-spaced-repetition/fsrs-rs) (Rust → Swift bridge or reimplement)
- Swift Package Manager for dependency management

### Data Model (iOS)

**CoreData Entities:**

```swift
// User
@NSManaged var id: UUID
@NSManaged var email: String
@NSManaged var name: String
@NSManaged var createdAt: Date
@NSManaged var phrases: NSSet // Relationship to Phrase

// Phrase
@NSManaged var id: UUID
@NSManaged var text: String
@NSManaged var language: String
@NSManaged var translation: String
@NSManaged var audioUrl: String?
@NSManaged var userId: UUID
@NSManaged var createdAt: Date
@NSManaged var smartCard: SmartCard? // Relationship to SmartCard

// SmartCard
@NSManaged var id: UUID
@NSManaged var phraseId: UUID
@NSManaged var reviewSchedule: Date
@NSManaged var difficulty: Double // FSRS
@NSManaged var stability: Double // FSRS
@NSManaged var retrievability: Double // FSRS
@NSManaged var lastReviewDate: Date
@NSManaged var reviewCount: Int
@NSManaged var correctCount: Int
@NSManaged var createdAt: Date
@NSManaged var tags: NSSet // Relationship to Tag

// Tag
@NSManaged var id: UUID
@NSManaged var name: String
@NSManaged var emoji: String?
@NSManaged var smartCardId: UUID
```

### CloudKit Sync Strategy

**Record Types:**
- User (private database)
- Phrase (private database)
- SmartCard (private database)
- Tag (private database)

**Sync Logic:**
- Push local changes to CloudKit on network available
- Pull remote changes on app launch and background fetch
- Conflict resolution: Last-write-wins for simplicity (V2.0), merge strategies later

---

## Implementation Phases

### Phase 1: Core iOS App (8-10 weeks)

**Epic #1: iOS Project Setup & Architecture**
- Initialize Xcode project (iOS 16.0+ target)
- Setup CoreData + CloudKit
- Implement MVVM architecture
- Setup API client for web backend
- Configure development certificates

**Epic #2: Core UI Implementation**
- Home screen with daily stats
- Quick Capture screen (text input)
- Review Session screen
- Word Detail view with audio playback
- Progress Dashboard
- Notebook (category browsing)

**Epic #3: Audio & FSRS Integration**
- Audio playback with AVFoundation
- Audio caching strategy
- FSRS algorithm implementation (Swift)
- Review scheduling logic

**Epic #4: Data Sync**
- CloudKit setup
- Sync engine (local → cloud → local)
- Offline queue for changes
- Conflict resolution

### Phase 2: iOS-Specific Features (4-6 weeks)

**Epic #5: Share Extension**
- Create Share Extension target
- Text extraction from NSExtensionItem
- App Groups for data sharing
- UI for Share Extension

**Epic #6: Widgets**
- WidgetKit extension
- Small/Medium/Large widgets
- Lock Screen widget (iOS 16+)
- Timeline provider

**Epic #7: Native Interactions**
- Haptic feedback mapping
- Swipe gestures
- Long-press menus
- Pull to refresh

**Epic #8: Notifications**
- Push notification setup (APNs)
- Local notification scheduling
- Notification actions
- Permission handling

### Phase 3: Polish & App Store (3-4 weeks)

**Epic #9: Testing & Optimization**
- Device testing (iPhone SE, 13/14, 15 Pro)
- VoiceOver accessibility testing
- Dynamic Type testing
- Performance profiling (Instruments)
- Battery impact testing
- Network condition testing (3G/LTE/5G)

**Epic #10: App Store Preparation**
- App Store screenshots (6.7", 6.5", 5.5")
- App Preview video (15-30s)
- Privacy manifest (PrivacyInfo.xcprivacy)
- App Store listing (name, subtitle, description, keywords)
- TestFlight beta (10+ external testers)
- App Review Guidelines compliance

**Epic #11: Launch & Post-Launch**
- Submit to App Store Review
- Monitor crash reports (Crashlytics/Sentry)
- Track App Store ratings/reviews
- Monitor KPIs (retention, engagement)
- Iterate based on feedback

---

## iOS Human Interface Guidelines Compliance

### Accessibility
- [ ] VoiceOver labels for all interactive elements
- [ ] Dynamic Type support (all text scales)
- [ ] Reduce Motion support
- [ ] Voice Control compatibility
- [ ] 4.5:1 contrast ratio minimum (text)
- [ ] 3:1 contrast ratio minimum (UI components)

### Design
- [ ] SF Symbols for icons
- [ ] iOS semantic colors (adapt to Light/Dark Mode)
- [ ] Safe Area handling (notch, Dynamic Island, home indicator)
- [ ] Native iOS navigation patterns (NavigationStack)
- [ ] Bottom sheet modals for iOS feel

### Performance
- [ ] Launch time <1.5 seconds (iPhone 13)
- [ ] 60fps scrolling (standard), 120fps (ProMotion)
- [ ] Memory usage <150MB
- [ ] Battery drain <5% per day with background sync
- [ ] Network: 3G load time <3 seconds

---

## Success Metrics (V2 iOS)

### Adoption
- **Target:** 30% of web users install iOS app within 6 months
- **Metric:** iOS app downloads / web active users

### Engagement
- **Share Extension Usage:** 50% of iOS users use Share Extension at least once
- **Widget Installation:** 40% of iOS users add widget to Home Screen
- **Daily Active Users:** 70% of iOS users open app daily (vs. 50% web)

### Retention
- **30-Day Retention:** 50% (vs. 40% web)
- **Retention Improvement:** +25% relative improvement over web

### Performance
- **Crash Rate:** <1%
- **App Store Rating:** >4.5 stars
- **Review Response Time:** <48 hours

---

## Dependencies & Risks

### Technical Dependencies
| Dependency | Risk | Mitigation |
|------------|------|------------|
| CloudKit reliability | Sync failures | Implement robust retry logic; fallback to manual sync button |
| iOS audio session management | Interruptions (calls, Siri) | Proper audio session handling; resume after interruption |
| Share Extension stability | Crashes kill host app | Extensive testing; minimal code in extension |
| Widget timeline budget | Widgets not updating | Optimize timeline refresh; educate users on iOS limits |
| App Store Review rejection | Launch delay | Follow guidelines exactly; prepare for appeals |

### Business Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Low web→iOS conversion | Wasted development | Validate demand via pre-launch survey; TestFlight early access |
| Development cost overruns | Budget strain | Hire experienced iOS developers; realistic timeline estimates |
| Maintenance burden | Two platforms to support | Shared backend API; feature parity strategy; code reuse |

---

## Migration Path (Web → iOS)

### User Data Migration
1. User signs up on web (V1)
2. Creates words, reviews, progress
3. Downloads iOS app (V2)
4. Signs in with same account
5. **Server syncs all data to iOS app via CloudKit**
6. User can continue using both web and iOS seamlessly

### Feature Parity
- All web features available on iOS
- iOS-exclusive features labeled "iOS only" in web docs
- Web users encouraged to try iOS for enhanced features

---

## Timeline Overview

| Phase | Duration | Start Dependency |
|-------|----------|------------------|
| **Phase 1: Core iOS App** | 8-10 weeks | Web MVP stable + funding secured |
| **Phase 2: iOS Features** | 4-6 weeks | Phase 1 complete |
| **Phase 3: Polish & Launch** | 3-4 weeks | Phase 2 complete |
| **Total** | **15-20 weeks** | ~4-5 months from start to App Store launch |

---

## Post-Launch Iterations (V2.1, V2.2)

### V2.1: Enhanced iOS Features
- Siri Shortcuts support
- iPad-optimized layouts
- Apple Watch companion app (words due, quick review)
- Voice input for word capture (speech-to-text)
- Camera input for word capture (OCR)

### V2.2: Advanced Features
- Live Activities (iOS 16.1+) for active review sessions
- Focus Mode integration
- Handoff between devices
- Shared albums/collections with other users
- Family Sharing support

---

## Resources

### Apple Documentation
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/ios)
- [SwiftUI Documentation](https://developer.apple.com/documentation/swiftui)
- [WidgetKit](https://developer.apple.com/documentation/widgetkit)
- [Share Extension](https://developer.apple.com/documentation/uikit/uiactivityviewcontroller)
- [CloudKit](https://developer.apple.com/documentation/cloudkit)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

### Project Documentation
- **Web MVP PRD:** `/docs/product/prd.md`
- **Web Implementation Plan:** `/docs/engineering/implementation_plan.md`
- **Design System:** `/confabulator/LLYLI_design_system_claude_v2.md`
- **Web Mockups:** `/prototypes/web/`

---

## Decision: Why Wait Until V2?

**Strategic Rationale:**

1. **Validate Core Hypothesis:** Web MVP proves the learning methodology works (87% retention, user engagement) before platform investment

2. **Faster Iteration:** Web enables instant updates; iOS requires App Store review (1-7 days per release)

3. **Universal Reach:** Web works on iPhone, Android, desktop; iOS only serves Apple users

4. **Lower Development Cost:** One codebase (web) vs. three (web, iOS, Android)

5. **Delayed Platform Lock-In:** Web-first avoids App Store 30% commission initially

6. **User Feedback Loop:** Web MVP user feedback informs iOS feature prioritization

**When to Start V2:**
- ✅ Web MVP has 10,000+ active users
- ✅ Core metrics validated (87% retention, 40% D30 retention, 3+ sessions/week)
- ✅ Funding secured for 6-month iOS development cycle
- ✅ User demand for iOS-specific features confirmed (surveys, support requests)

---

**Next Steps:** Complete web MVP (V1.0), validate learning methodology, gather user feedback, secure funding, then revisit this roadmap for iOS development kickoff.

---

*Last Updated: 2026-01-15*
*Status: Planned for Year 2*
