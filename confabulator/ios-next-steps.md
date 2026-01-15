# iOS Development Next Steps
**Project:** LLYI - Learn the Language You Live In
**Repository:** https://github.com/ksimons29/learnthelanguageyoulivein
**Generated:** 2026-01-13
**Status:** Planned for Version 2 (Year 2)

---

## ⚠️ IMPORTANT: This is V2 Planning

**Current Focus:** Version 1 is a responsive web application (mobile + desktop).

**This Document:** Contains detailed planning for the Version 2 native iOS app, scheduled for Year 2 after web MVP validation.

**See Updated V2 Roadmap:** [`/docs/product/v2_native_ios_roadmap.md`](/docs/product/v2_native_ios_roadmap.md) for the current strategic approach and timeline.

---

**Original iOS Implementation Plan Below** (preserved for future reference)

## Overview

This document outlines the actionable next steps for iOS-first development of the LLYI Analytics Dashboard and core application features. All specifications are based on the iOS-optimized PRD and follow Apple Human Interface Guidelines.

## Prerequisites

Before starting iOS development, ensure the following are complete:

- [ ] PRD.md reviewed and approved (✅ Complete)
- [ ] iOS-first specifications documented (✅ Complete)
- [ ] Analytics Dashboard requirements finalized (✅ Complete)
- [ ] Development team assigned
- [ ] Apple Developer Account active
- [ ] Xcode 15+ installed
- [ ] iOS Simulator ready (iOS 16.0+)
- [ ] Physical test devices available (iPhone SE, 13/14, 15 Pro)

## Phase 1: Design & Architecture (Week 1-2)

### Epic #1: iOS-Specific Wireframes & Design System

**Objective:** Create production-ready iOS designs following Human Interface Guidelines

**Tasks:**
- [ ] **Task 1.1:** Design Analytics Dashboard wireframes for iPhone
  - Create designs for iPhone SE (4.7"), standard (6.1"), Pro Max (6.7")
  - Design both portrait and landscape orientations
  - Include Light Mode and Dark Mode variants
  - Show safe area handling (notch, Dynamic Island, home indicator)
  - **Deliverable:** Figma/Sketch file with all screen sizes
  - **Reference:** `confabulator/PRD.md:99-168` (Analytics Dashboard feature)

- [ ] **Task 1.2:** Design SF Symbols icon system
  - Select appropriate SF Symbols for all UI elements
  - Define category emoji + SF Symbol pairings (💼 Work, 💪 Gym, etc.)
  - Create warning/alert iconography (exclamationmark.triangle, etc.)
  - **Deliverable:** SF Symbols reference sheet
  - **Tool:** SF Symbols 5 app

- [ ] **Task 1.3:** Define iOS semantic color palette
  - Define Light Mode colors using iOS semantic naming
  - Define Dark Mode color adaptations
  - Ensure 4.5:1 contrast ratio for text, 3:1 for UI components
  - **Deliverable:** Colors.xcassets or color constants file
  - **Reference:** `confabulator/PRD.md:137-147` (Accessibility requirements)

- [ ] **Task 1.4:** Create interaction prototypes
  - Prototype pull-to-refresh animation
  - Prototype category expansion with disclosure indicator rotation
  - Prototype long-press context menus
  - Prototype sheet modal presentations
  - **Deliverable:** Interactive Figma/Principle prototype
  - **Reference:** `confabulator/PRD.md:203-235` (iOS-Specific User Flow)

- [ ] **Task 1.5:** Design haptic feedback mapping
  - Map all user actions to appropriate haptic feedback types
  - Light impact: category expansion, card tap
  - Success: practice completion, phrase added
  - Warning: failure threshold reached
  - **Deliverable:** Haptic feedback specification document
  - **Reference:** `confabulator/PRD.md:148-153` (iOS-Specific Interactions)

**Acceptance Criteria:**
- All designs follow iOS Human Interface Guidelines
- Designs tested with iOS simulator preview
- Accessibility requirements met (VoiceOver, Dynamic Type)
- Sign-off from product team

**Estimated Duration:** 1-2 weeks
**Dependencies:** None (can start immediately)

---

### Epic #2: Technical Architecture & Database Schema

**Objective:** Design backend API and database schema for analytics

**Tasks:**
- [ ] **Task 2.1:** Design analytics database schema
  - Define tables for phrase reviews, failures, categories
  - Plan indexes for fast "struggling phrases" queries
  - Design schema for spaced repetition scheduling
  - **Deliverable:** SQL schema migration files
  - **Reference:** `confabulator/implementation-plan.md:40-50` (Data Model)

- [ ] **Task 2.2:** Design analytics pre-computation strategy
  - Define background jobs for analytics calculation
  - Plan caching strategy (5-minute client cache)
  - Design real-time vs batch update logic
  - **Deliverable:** Analytics computation architecture doc
  - **Reference:** `confabulator/PRD.md:299` (Backend pre-computation)

- [ ] **Task 2.3:** API endpoint design
  - `GET /api/analytics/overview` - Stats grid data
  - `GET /api/analytics/learning-progress` - Due/learning/practice counts
  - `GET /api/analytics/struggling-phrases?limit=10` - High-failure phrases
  - `GET /api/analytics/categories` - Category insights
  - `POST /api/analytics/refresh` - Trigger analytics recalculation
  - **Deliverable:** OpenAPI/Swagger specification
  - **Tool:** Postman or Swagger Editor

- [ ] **Task 2.4:** Plan iOS data persistence strategy
  - Decide: CoreData + CloudKit OR SQLite local-first
  - Design offline-first sync architecture
  - Plan background sync with BGTaskScheduler
  - **Deliverable:** Data persistence architecture doc
  - **Reference:** `confabulator/PRD.md:221-224` (Database options)

- [ ] **Task 2.5:** Define iOS framework choice
  - Decision: SwiftUI (preferred) vs React Native
  - If React Native: Plan iOS-specific optimizations
  - Document state management approach
  - **Deliverable:** Technical decision record (TDR)
  - **Reference:** `confabulator/PRD.md:216-219` (Framework choice)

**Acceptance Criteria:**
- Database schema supports all analytics queries efficiently
- API endpoints designed for <2s response time
- iOS data sync strategy supports offline capture
- Technical decisions documented and approved

**Estimated Duration:** 1-2 weeks
**Dependencies:** None (can run in parallel with Epic #1)

---

## Phase 2: iOS Core Implementation (Week 3-6)

### Epic #3: iOS Analytics Dashboard UI

**Objective:** Build native iOS Analytics Dashboard following designs

**Tasks:**
- [ ] **Task 3.1:** Setup iOS project structure
  - Initialize Xcode project (iOS 16.0+ deployment target)
  - Configure SwiftUI or React Native project
  - Setup project organization (Views, ViewModels, Services)
  - Configure Info.plist with required permissions
  - **Deliverable:** Working iOS project skeleton
  - **Reference:** `confabulator/PRD.md:207-213` (iOS Minimum Requirements)

- [ ] **Task 3.2:** Implement Overview Stats Grid
  - Create SwiftUI LazyVGrid (2×2 portrait, 4×1 landscape)
  - Implement stat card component with SF Symbols
  - Add Dynamic Type support
  - Test on all iPhone sizes
  - **Deliverable:** Functional stats grid component
  - **Reference:** `confabulator/PRD.md:104-108` (Overview Stats Grid)

- [ ] **Task 3.3:** Implement Learning Progress Panel
  - Create panel component with 3 metrics
  - Add contextual tooltips (long-press info popover)
  - Implement warning color-coding for "Need Practice"
  - Add VoiceOver labels
  - **Deliverable:** Functional learning progress panel
  - **Reference:** `confabulator/PRD.md:109-112` (Learning Progress Panel)

- [ ] **Task 3.4:** Implement Struggling Phrases Section
  - Create list view with phrase cards
  - Implement "Practice Now" quick-action button
  - Add swipe-to-refresh
  - Limit to top 3 by default with "See all" expansion
  - **Deliverable:** Functional struggling phrases section
  - **Reference:** `confabulator/PRD.md:113-116` (Struggling Phrases Section)

- [ ] **Task 3.5:** Implement Category Insights
  - Create collapsible category sections
  - Add disclosure indicator (chevron.right → chevron.down)
  - Implement smooth expansion animation
  - Show top 5 words preview
  - Add haptic feedback on expansion
  - **Deliverable:** Functional category insights component
  - **Reference:** `confabulator/PRD.md:117-121` (Category Insights)

- [ ] **Task 3.6:** Implement Search & Filter
  - Create iOS search bar (UISearchController or SwiftUI)
  - Implement 300ms debounce
  - Add real-time highlighting of results
  - Make search bar sticky on scroll
  - **Deliverable:** Functional search/filter
  - **Reference:** `confabulator/PRD.md:122-125` (Search & Filter)

- [ ] **Task 3.7:** Implement iOS-specific interactions
  - Pull-to-refresh with UIRefreshControl
  - Long-press context menus (UIMenu/contextMenu)
  - Sheet modal presentations for detail views
  - Haptic feedback (UIImpactFeedbackGenerator)
  - **Deliverable:** Native iOS interaction patterns
  - **Reference:** `confabulator/PRD.md:148-153` (iOS-Specific Interactions)

**Acceptance Criteria:**
- Dashboard renders in <1.5s on iPhone 13
- 60fps scrolling on standard iPhones, 120fps on ProMotion
- All interactions feel native with proper haptics
- VoiceOver navigation works correctly
- Dynamic Type scales all text properly

**Estimated Duration:** 2-3 weeks
**Dependencies:** Epic #1 (Design) must be 50% complete

---

### Epic #4: iOS Share Extension for Phrase Capture

**Objective:** Enable phrase capture from WhatsApp, Safari, Messages

**Tasks:**
- [ ] **Task 4.1:** Create iOS Share Extension target
  - Add Share Extension to Xcode project
  - Configure extension entitlements
  - Setup App Groups for data sharing
  - **Deliverable:** Share Extension boilerplate
  - **Reference:** `confabulator/PRD.md:227` (Share Extension)

- [ ] **Task 4.2:** Implement text extraction
  - Extract shared text from NSExtensionItem
  - Handle multiple text items
  - Sanitize and validate input
  - **Deliverable:** Text extraction logic

- [ ] **Task 4.3:** Build share extension UI
  - Create compact UI for phrase preview
  - Add language detection
  - Show translation preview
  - Add "Save to LLYI" button
  - **Deliverable:** Share extension interface

- [ ] **Task 4.4:** Implement data handoff to main app
  - Save phrase to shared container (App Groups)
  - Post notification to main app
  - Handle offline scenarios
  - **Deliverable:** Data transfer mechanism

**Acceptance Criteria:**
- Share extension appears in WhatsApp, Safari, Messages
- Phrase capture completes in <2 seconds
- Works offline with background sync
- No data loss during handoff

**Estimated Duration:** 1 week
**Dependencies:** Epic #3 Task 3.1 (iOS project setup)

---

### Epic #5: iOS Widgets (Home Screen & Lock Screen)

**Objective:** Display "Due Today" count on Home/Lock Screen

**Tasks:**
- [ ] **Task 5.1:** Create WidgetKit extension
  - Add Widget Extension to Xcode project
  - Setup widget timeline provider
  - Configure widget family sizes (small, medium, large)
  - **Deliverable:** Widget extension boilerplate
  - **Reference:** `confabulator/PRD.md:228` (Widgets)

- [ ] **Task 5.2:** Design widget UI
  - Create small widget (Due Today count + icon)
  - Create medium widget (Due Today + Currently Learning)
  - Create large widget (Stats grid preview)
  - Support Light/Dark Mode
  - **Deliverable:** Widget UI components

- [ ] **Task 5.3:** Implement widget data refresh
  - Fetch "Due Today" count from shared container
  - Configure timeline update schedule
  - Handle widget tap deep-linking to app
  - **Deliverable:** Widget refresh mechanism

- [ ] **Task 5.4:** Create Lock Screen widget (iOS 16+)
  - Design circular/rectangular lock screen widget
  - Show due count inline
  - Configure widget metadata
  - **Deliverable:** Lock Screen widget

**Acceptance Criteria:**
- Widget updates every 30 minutes or when app enters background
- Widget tapping opens app to review session
- Displays accurate "Due Today" count
- Works with iOS 16+ Lock Screen

**Estimated Duration:** 1 week
**Dependencies:** Epic #3 (Dashboard must have data source)

---

## Phase 3: Testing & Polish (Week 7-8)

### Epic #6: iOS Testing & Accessibility

**Objective:** Comprehensive testing across devices and accessibility features

**Tasks:**
- [ ] **Task 6.1:** Device compatibility testing
  - Test on iPhone SE (2nd gen) - 4.7"
  - Test on iPhone 13/14 - 6.1"
  - Test on iPhone 15 Pro Max - 6.7"
  - Test on iOS 16.0, 17.0, latest beta
  - **Deliverable:** Device compatibility report
  - **Reference:** `confabulator/PRD.md:320-328` (iOS Testing Requirements)

- [ ] **Task 6.2:** VoiceOver testing
  - Navigate entire dashboard with VoiceOver
  - Test custom rotor actions
  - Verify accessibility labels and hints
  - Test with Screen Curtain enabled
  - **Deliverable:** VoiceOver compliance report
  - **Reference:** `confabulator/PRD.md:141-147` (iOS Accessibility)

- [ ] **Task 6.3:** Dynamic Type testing
  - Test all accessibility text sizes (1-5)
  - Verify layout doesn't break at largest size
  - Test with Bold Text enabled
  - **Deliverable:** Dynamic Type compliance report

- [ ] **Task 6.4:** Performance profiling
  - Profile with Instruments (Time Profiler, Allocations)
  - Verify <1.5s launch time on iPhone 13
  - Check memory stays under 150MB
  - Test 60fps/120fps scrolling
  - **Deliverable:** Performance report
  - **Reference:** `confabulator/PRD.md:234-240` (iOS Performance Requirements)

- [ ] **Task 6.5:** Battery testing
  - Test background task battery impact
  - Verify <5% drain per day
  - Profile with Energy Log
  - **Deliverable:** Battery impact report
  - **Reference:** `confabulator/PRD.md:238` (Battery requirement)

- [ ] **Task 6.6:** Network condition testing
  - Test on WiFi, 5G, LTE, 3G
  - Test offline mode with background sync
  - Verify 3G load time <3 seconds
  - **Deliverable:** Network resilience report
  - **Reference:** `confabulator/PRD.md:277` (3G Network requirement)

- [ ] **Task 6.7:** Interruption testing
  - Test during incoming phone calls
  - Test low battery scenario
  - Test background/foreground transitions
  - Test memory warnings
  - **Deliverable:** Interruption handling report
  - **Reference:** `confabulator/PRD.md:328` (Interruption testing)

**Acceptance Criteria:**
- All tests pass on physical devices
- No accessibility violations
- Performance meets all targets
- Battery impact within limits

**Estimated Duration:** 1-2 weeks
**Dependencies:** Epic #3, #4, #5 complete

---

## Phase 4: App Store Preparation (Week 9-10)

### Epic #7: iOS App Store Submission

**Objective:** Prepare and submit app to App Store

**Tasks:**
- [ ] **Task 7.1:** Configure Privacy Manifest
  - Create PrivacyInfo.xcprivacy file
  - Declare all data collection practices
  - Document required reason APIs
  - **Deliverable:** PrivacyInfo.xcprivacy
  - **Reference:** `confabulator/PRD.md:242` (Privacy manifest)

- [ ] **Task 7.2:** Create App Store screenshots
  - Generate screenshots for 6.7" (iPhone 15 Pro Max)
  - Generate screenshots for 6.5" (iPhone 14 Plus)
  - Generate screenshots for 5.5" (iPhone 8 Plus)
  - Show Analytics Dashboard + core features
  - **Deliverable:** Screenshot sets (PNG format)
  - **Reference:** `confabulator/PRD.md:245` (Screenshot requirements)

- [ ] **Task 7.3:** Create App Preview video
  - Record 15-30 second video showing:
    - Phrase capture from WhatsApp
    - Smart card with audio
    - Review session
    - Analytics dashboard
  - **Deliverable:** App Preview video (H.264, 30fps)
  - **Reference:** `confabulator/PRD.md:246` (App Preview video)

- [ ] **Task 7.4:** Setup TestFlight beta
  - Upload build to App Store Connect
  - Configure internal testing group
  - Invite 10+ external beta testers
  - Collect feedback via TestFlight
  - **Deliverable:** TestFlight beta live
  - **Reference:** `confabulator/PRD.md:336` (TestFlight beta)

- [ ] **Task 7.5:** Complete App Store Connect listing
  - Write app name (30 chars max)
  - Write subtitle (30 chars max)
  - Write description (4000 chars max)
  - Add keywords for App Store search
  - Set age rating: 4+ (Educational)
  - Add support URL and privacy policy URL
  - **Deliverable:** Complete App Store metadata
  - **Reference:** `confabulator/PRD.md:330-339` (App Store Submission Requirements)

- [ ] **Task 7.6:** App Review Guidelines compliance check
  - Verify no violations of App Review Guidelines
  - Check for prohibited content
  - Verify Sign in with Apple (if using auth)
  - Test in-app purchases (if applicable)
  - **Deliverable:** Compliance checklist completed
  - **Reference:** `confabulator/PRD.md:337` (App Review Guidelines)

- [ ] **Task 7.7:** Submit for App Review
  - Submit build for review
  - Monitor review status
  - Respond to any reviewer questions within 24h
  - **Deliverable:** App submitted to App Store Review

**Acceptance Criteria:**
- All App Store Connect fields complete
- Screenshots showcase key features
- TestFlight feedback is positive
- App passes App Review on first try (target)

**Estimated Duration:** 1-2 weeks
**Dependencies:** Epic #6 (Testing) complete

---

## Phase 5: Post-Launch Monitoring (Week 11+)

### Epic #8: iOS Post-Launch Operations

**Objective:** Monitor app performance and user feedback post-launch

**Tasks:**
- [ ] **Task 8.1:** Setup crash reporting
  - Integrate Crashlytics or Sentry
  - Configure symbolication for crash reports
  - Setup alerts for crash rate >1%
  - **Deliverable:** Crash reporting dashboard
  - **Reference:** `confabulator/PRD.md:342` (Crashlytics/Sentry)

- [ ] **Task 8.2:** Monitor App Store ratings
  - Track App Store ratings and reviews daily
  - Respond to user reviews within 48h
  - Create process for addressing negative feedback
  - **Deliverable:** Rating monitoring process
  - **Reference:** `confabulator/PRD.md:343` (App Store ratings monitoring)

- [ ] **Task 8.3:** Track KPIs
  - Monitor Dashboard Engagement Rate (target: 50%)
  - Track Struggling Phrases Action Rate (target: 40%)
  - Monitor Day 30 Retention (target: 40%)
  - Track Average Review Sessions per Week (target: 3)
  - **Deliverable:** KPI dashboard
  - **Reference:** `confabulator/PRD.md:23-30` (KPIs)

- [ ] **Task 8.4:** Performance monitoring
  - Monitor launch time metrics
  - Track memory usage in production
  - Monitor battery drain reports
  - **Deliverable:** Performance monitoring dashboard
  - **Reference:** `confabulator/PRD.md:345` (Performance monitoring)

- [ ] **Task 8.5:** Iterate based on feedback
  - Collect TestFlight feedback weekly
  - Prioritize bug fixes and feature requests
  - Plan version 1.1 roadmap
  - **Deliverable:** Post-launch iteration plan

**Acceptance Criteria:**
- Crash rate <1%
- App Store rating >4.0 stars
- KPIs trending toward targets
- Feedback loop established

**Estimated Duration:** Ongoing
**Dependencies:** App Store launch

---

## Quick Start Commands

### iOS Development Setup
```bash
# Clone repository
git clone https://github.com/ksimons29/learnthelanguageyoulivein.git
cd learnthelanguageyoulivein

# Create iOS development branch
git checkout -b ios/analytics-dashboard

# Open Xcode project (if using native iOS)
open LLYI.xcodeproj

# Or setup React Native (if cross-platform)
npm install
cd ios && pod install
cd .. && npm run ios
```

### Testing Commands
```bash
# Run unit tests
xcodebuild test -scheme LLYI -destination 'platform=iOS Simulator,name=iPhone 15 Pro'

# Run on physical device
xcodebuild -scheme LLYI -destination 'platform=iOS,name=Your iPhone'

# Generate screenshots
fastlane snapshot

# Upload to TestFlight
fastlane beta
```

---

## Resources

### Documentation References
- **PRD:** `confabulator/PRD.md` - Complete product requirements
- **Implementation Plan:** `confabulator/implementation-plan.md` - Technical architecture
- **Wireframes:** `confabulator/wireframes.md` - UI/UX wireframes
- **Design System:** `confabulator/LLYLI_design_system_claude_v2.md` - Visual design specs

### Apple Resources
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/ios)
- [SF Symbols](https://developer.apple.com/sf-symbols/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Accessibility on iOS](https://developer.apple.com/accessibility/ios/)
- [SwiftUI Documentation](https://developer.apple.com/documentation/swiftui)
- [WidgetKit](https://developer.apple.com/documentation/widgetkit)
- [Share Extension](https://developer.apple.com/documentation/uikit/uiactivityviewcontroller)

### Third-Party Tools
- [Figma](https://www.figma.com) - Design tool
- [SF Symbols App](https://developer.apple.com/sf-symbols/) - Icon browser
- [Fastlane](https://fastlane.tools) - iOS automation
- [Crashlytics](https://firebase.google.com/products/crashlytics) - Crash reporting

---

## Success Criteria Summary

This iOS development plan is successful when:

1. ✅ Analytics Dashboard renders perfectly on all iPhone sizes
2. ✅ Share Extension captures phrases from WhatsApp, Safari, Messages
3. ✅ Widgets display accurate "Due Today" count
4. ✅ App passes all accessibility tests (VoiceOver, Dynamic Type, Reduce Motion)
5. ✅ Performance meets all targets (<1.5s launch, 60fps scroll, <150MB memory)
6. ✅ App Store submission approved on first review
7. ✅ TestFlight beta feedback is positive (>4.0 star equivalent)
8. ✅ Post-launch KPIs trending toward targets

---

## Timeline Overview

| Phase | Epic | Duration | Start Dependency |
|-------|------|----------|------------------|
| **Phase 1** | Epic #1: Wireframes & Design | 1-2 weeks | None (start now) |
| **Phase 1** | Epic #2: Architecture & DB | 1-2 weeks | None (parallel with #1) |
| **Phase 2** | Epic #3: Dashboard UI | 2-3 weeks | Epic #1 at 50% |
| **Phase 2** | Epic #4: Share Extension | 1 week | Epic #3 Task 3.1 |
| **Phase 2** | Epic #5: Widgets | 1 week | Epic #3 complete |
| **Phase 3** | Epic #6: Testing | 1-2 weeks | Epics #3, #4, #5 complete |
| **Phase 4** | Epic #7: App Store Prep | 1-2 weeks | Epic #6 complete |
| **Phase 5** | Epic #8: Post-Launch | Ongoing | App Store launch |

**Total Estimated Duration:** 9-12 weeks from start to App Store launch

---

## Contact & Support

- **Repository:** https://github.com/ksimons29/learnthelanguageyoulivein
- **Project Documentation:** `/confabulator/` directory
- **Questions:** Refer to PRD.md and implementation-plan.md first

---

*Generated by Claude Code - iOS Development Planning*
*Last Updated: 2026-01-13*