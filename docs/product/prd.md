# Product Requirements Document

## Document Information
- **Product Name:** LLYI
- **Version:** 1.0
- **Last Updated:** 2025-12-10
- **Status:** Draft

## Product Overview
LLYI is an innovative mobile and web application designed to bridge the gap between real-life language encounters and effective memorization. Serving expatriates, international professionals, and students who find themselves immersed in a non-native language environment, LLYI empowers users to convert phrases from everyday interactions into memorable learning experiences. Through seamless integration with common communication platforms and utilizing a proven spaced repetition system, LLYI transforms phrases from chats, emails, signs, and conversations into smart cards, complete with text and native audio pronunciations.

The product addresses a significant challenge faced by language learners: the rapid forgetting of useful phrases encountered in daily life. Unlike traditional language apps that follow rigid curricula, LLYI adapts to the user's personal language encounters, ensuring that learning is relevant and contextual. The target market includes adults who are motivated to enhance their language skills but are frustrated by the limitations of existing language learning tools. By providing a personalized and contextually relevant learning experience, LLYI helps users achieve lasting retention and confident language use.

## Objectives & Success Metrics

### Primary Objectives
1. Seamlessly integrate into users' daily routines for effortless phrase capture.
2. Enhance language retention through personalized spaced repetition.
3. Achieve high user engagement and retention rates by delivering a relevant learning experience.
4. Establish a stable and user-friendly product on both iOS and Android platforms.

### Key Performance Indicators (KPIs)
- **Weekly Active Users (WAU):** Target 1,000+ by the end of the first year.
- **Day 30 Retention Rate:** Aim for a retention rate of 40%.
- **Month 3 Retention Rate:** Target a 30% retention rate.
- **Average Review Sessions per User per Week:** Aim for at least 3 sessions.
- **Percentage of Captured Phrases Reviewed Three Times:** Target 60%.
- **Long Term Recall Rate on "Test Myself" Checks:** Aim for 70% accuracy.
- **Dashboard Engagement Rate:** Target 50% of weekly active users viewing analytics dashboard.
- **Struggling Phrases Action Rate:** Aim for 40% of users who view struggling phrases to initiate a practice session.

### Success Criteria for MVP Launch
- Successful deployment on iOS and Android with no critical bugs.
- Positive qualitative feedback from at least 500 active users.
- At least 30% of users utilize the capture feature daily.
- Establishment of a simple, scalable paid plan model.

## User Personas

### Persona 1: The International Professional
- **Demographics and Background:** 34-year-old marketing manager, recently relocated to Germany. Fluent in English, intermediate in German.
- **Goals and Motivations:** Wants to confidently conduct meetings and socialize with colleagues in German.
- **Pain Points and Frustrations:** Overwhelmed by the volume of new phrases and unable to keep track of them effectively.
- **Success Scenario:** Uses LLYI to capture and review phrases from work emails and conversations, leading to increased confidence and fluency in professional settings.

### Persona 2: The Expat Student
- **Demographics and Background:** 22-year-old international student studying in France. Basic knowledge of French.
- **Goals and Motivations:** Aims to improve conversational skills to make friends and participate in social activities.
- **Pain Points and Frustrations:** Finds traditional language apps too rigid and not reflective of everyday language use.
- **Success Scenario:** Leverages LLYI to capture slang and colloquial phrases from social interactions, resulting in more engaging conversations with peers.

## Core Features

### Feature: Quick Phrase Capture
- **Description:** Allow users to effortlessly capture phrases from apps and integrate them into LLYI.
- **User Story:** "As a user, I want to capture phrases from my chats quickly so that I can review them later."
- **Acceptance Criteria:**
  1. Capture phrases via shared text from WhatsApp, Telegram, etc.
  2. Add phrases manually with minimal input.
  3. Detect and suggest language and translation automatically.
- **Priority:** P0

### Feature: Smart Cards with Audio
- **Description:** Create smart cards that include text, translation, and audio pronunciation.
- **User Story:** "As a user, I want to listen to native audio pronunciations so that I can improve my speaking skills."
- **Acceptance Criteria:**
  1. Display text and translation for each phrase.
  2. Provide high-quality native audio for pronunciation.
  3. Include context sentences for better understanding.
- **Priority:** P0

### Feature: Spaced Repetition System
- **Description:** Implement a spaced repetition engine to optimize review sessions.
- **User Story:** "As a user, I want to review phrases at the right time so that I retain them longer."
- **Acceptance Criteria:**
  1. Schedule reviews based on user retention data.
  2. Adapt difficulty based on user's recall accuracy.
  3. Notify users when reviews are due.
- **Priority:** P0

### Feature: Tagging and Collections
- **Description:** Organize phrases with tags for contextual review.
- **User Story:** "As a user, I want to group phrases by context so that I can focus on specific areas as needed."
- **Acceptance Criteria:**
  1. Allow users to create and assign tags.
  2. Facilitate review sessions by tag or collection.
  3. Preload common tags with starter packages.
- **Priority:** P1

### Feature: Basic Progress Overview
- **Description:** Provide users with insights into their learning progress.
- **User Story:** "As a user, I want to see my progress so that I stay motivated."
- **Acceptance Criteria:**
  1. Display metrics such as cards added and reviews completed.
  2. Show retention rate and active streaks.
  3. Update statistics in real-time.
- **Priority:** P2

### Feature: Analytics Dashboard
- **Description:** Comprehensive analytics dashboard providing actionable insights into learning patterns, retention, and areas needing focus.
- **User Story:** "As a user, I want to understand which phrases I'm struggling with and track my learning velocity so that I can optimize my study time."
- **Platform Priority:** iOS-first development, Android secondary
- **Acceptance Criteria:**
  1. **Overview Stats Grid:** Display key metrics including:
     - Total Cards captured
     - Cards Added This Week
     - Cards Added This Month
     - Total Categories/Tags
  2. **Learning Progress Panel:** Show real-time learning state:
     - Currently Learning (cards in active rotation)
     - Due for Review Today (scheduled reviews)
     - Need Practice (cards with recent failures)
  3. **Struggling Phrases Section:** Identify phrases requiring attention:
     - List phrases with 3+ review failures
     - Show failure count and last review date
     - Provide quick-action to practice these cards immediately
  4. **Category Insights:** For each category/tag display:
     - Total phrases count
     - Top 5 most common words preview
     - Category-specific review statistics
     - Visual indicators for category difficulty
  5. **Search & Filter:**
     - Full-text search across all phrases and translations
     - Filter by category, difficulty, or review status
     - Real-time search results with highlighting
  6. **Contextual Information Display:** Show explanatory information using iOS patterns:
     - Long-press on metrics to reveal info popover (iOS)
     - Tap info icon (ⓘ) to show detail sheet (iOS modal presentation)
     - What the metric measures, why it matters, how it's calculated
  7. **iOS-First Responsive Design:**
     - **Safe Area Compliance:** Respect notch, Dynamic Island, and home indicator
     - **iPhone Size Support:** Optimize for iPhone SE (4.7"), standard (6.1"), Pro Max (6.7")
     - **Stats Grid Layout:** 2×2 grid on iPhone portrait, 4×1 on landscape
     - **Touch Targets:** Minimum 44×44pt (iOS HIG standard)
     - **Navigation:** Integrate with iOS tab bar or navigation controller
     - **Pull-to-Refresh:** Native iOS refresh control for updating analytics
  8. **Progressive Disclosure:** Default view shows only essential information:
     - Overview Stats and Learning Progress always visible
     - Show top 3 struggling phrases with "See all" expansion
     - Categories collapsed by default (expandable with iOS disclosure indicator)
  9. **iOS Accessibility (VoiceOver, Dynamic Type):**
     - Full VoiceOver support with custom rotor actions
     - Dynamic Type support (scales from accessibility size 1 to 5)
     - Smart Invert and Increase Contrast compatibility
     - VoiceOver hints for all interactive elements
     - Accessibility labels following iOS naming conventions
     - Reduce Motion support (disable animations when enabled)
  10. **iOS-Specific Interactions:**
      - **Haptic Feedback:** Light impact on category expansion, success on practice completion
      - **Swipe Gestures:** Swipe-to-refresh on main view
      - **Long-Press Menus:** Context menu on phrase cards (Practice Now, View Details, Share)
      - **Smooth Scrolling:** Native iOS scroll physics with bounce
      - **Modal Presentations:** Use iOS sheet presentations for struggling phrases detail
- **Priority:** P1
- **iOS Design Notes:**
  - Follow iOS Human Interface Guidelines (HIG) for all UI patterns
  - Use SF Symbols for icons (category icons, chevrons, info buttons)
  - Implement iOS native card style with system background colors
  - Use iOS standard spacing (8pt grid system)
  - Support both Light and Dark Mode with semantic colors
  - Color-code metrics with SF Symbols (e.g., exclamationmark.triangle for warnings)
  - Ensure smooth 60fps scrolling on all supported iPhone models
  - Use iOS native navigation patterns (back button, modal dismiss)
- **Android Compatibility Notes:**
  - Adapt iOS gestures to Material Design equivalents
  - Replace SF Symbols with Material Icons
  - Use Material Design cards and elevation instead of iOS cards
  - Adapt haptic feedback to Android vibration patterns

## User Flows

### User Flow: Phrase Capture and Review
1. **Entry Point:** User encounters a useful phrase in a chat app.
2. **Step 1:** User shares the phrase to LLYI via the Share menu.
3. **Step 2:** LLYI detects the language and suggests a translation.
4. **Step 3:** User confirms and saves the phrase as a smart card.
5. **Step 4:** LLYI schedules the phrase for spaced repetition review.
6. **Exit Point:** User completes review sessions and retains the phrase.

### User Flow: Review Session
1. **Entry Point:** User receives a notification for a scheduled review.
2. **Step 1:** User opens LLYI and starts a review session.
3. **Step 2:** LLYI presents phrases with audio for recall.
4. **Step 3:** User marks phrases as remembered or forgotten.
5. **Step 4:** Spaced repetition system adjusts future schedule based on performance.
6. **Exit Point:** User finishes session and receives feedback on progress.

### User Flow: Analytics Dashboard Exploration
1. **Entry Point:** User navigates to Analytics Dashboard from main navigation.
2. **Step 1:** Dashboard loads showing Overview Stats (total cards, weekly/monthly additions, categories).
3. **Step 2:** User views Learning Progress Panel highlighting:
   - Cards currently in learning rotation
   - Number of cards due for review today
   - Cards marked as "Need Practice" (recent failures)
4. **Step 3:** User taps on "Need Practice" to see Struggling Phrases section.
5. **Step 4:** System displays phrases with 3+ failures, sorted by failure count.
6. **Step 5:** User selects "Practice Now" quick-action button.
7. **Step 6:** LLYI starts an immediate review session focused on struggling phrases.
8. **Alternative Path:** User searches for specific phrase using search bar.
9. **Alternative Path:** User filters by category to review category-specific statistics.
10. **Exit Point:** User gains insight into learning patterns and takes action on weak areas.

### User Flow: iOS-Specific Dashboard Interactions
1. **Entry Point:** User opens LLYI app on iPhone and taps "Analytics" tab in bottom tab bar.
2. **Step 1 (Pull-to-Refresh):** User pulls down on dashboard to refresh analytics data.
   - iOS refresh control appears with spinning indicator
   - Dashboard updates with latest statistics
   - Light haptic feedback on completion
3. **Step 2 (Long-Press Info):** User long-presses on "Due for Review" stat card.
   - iOS context menu appears with info option
   - User taps "What does this mean?"
   - Sheet modal slides up from bottom explaining the metric
   - User swipes down to dismiss sheet
4. **Step 3 (Category Expansion):** User taps on "💼 Work" category.
   - Category expands with smooth animation
   - Disclosure indicator rotates 90° (chevron.right → chevron.down)
   - Phrases list slides into view
   - Light haptic feedback on expansion
5. **Step 4 (Long-Press Phrase):** User long-presses on struggling phrase card.
   - iOS context menu appears with options:
     - 🎯 Practice Now
     - 👁 View Details
     - 📤 Share
   - User selects "Practice Now"
   - Success haptic feedback plays
6. **Step 5 (Practice Session):** Review session presents as full-screen modal.
   - Modal slides up from bottom (iOS sheet presentation)
   - User completes practice
   - Swipes down or taps Done to dismiss
   - Dashboard automatically updates "Need Practice" count (optimistic UI)
7. **Step 6 (VoiceOver Support):** VoiceOver user navigates dashboard.
   - VoiceOver announces: "Analytics Dashboard. Heading. Due for Review: 50 cards. Button."
   - User double-taps to activate
   - Custom rotor action allows jumping between stat categories
8. **Exit Point:** User switches to different tab or closes app (state persisted).

## Technical Considerations

### Platform Requirements

#### iOS (Primary Platform)
**Minimum Requirements:**
- **Deployment Target:** iOS 16.0+ (supports iPhone 8 and newer)
- **Recommended Target:** iOS 17.0+ for latest features (Live Activities, WidgetKit enhancements)
- **Device Support:** iPhone SE (2nd gen), iPhone 13/14/15 series, iPhone Pro/Pro Max models
- **Orientation:** Portrait primary, landscape supported for analytics dashboard
- **Architecture:** Universal app (supports all iPhone sizes via Auto Layout/SwiftUI)

**iOS-Specific Technical Requirements:**
- **Framework Choice:**
  - **Native:** SwiftUI (preferred) with UIKit interop for complex interactions
  - **Cross-platform:** React Native with iOS-specific optimizations
- **State Management:** SwiftUI @State/@Observable or Redux (React Native)
- **Networking:** URLSession with async/await for API calls
- **Database:**
  - CoreData with CloudKit sync OR
  - SQLite with local-first architecture
  - Background sync support for offline capture
- **Audio Playback:** AVFoundation with background audio capability
- **Background Tasks:** BGTaskScheduler for spaced repetition notifications
- **Share Extension:** iOS Share Extension for capturing from WhatsApp, Safari, Messages
- **Widgets:** Home Screen and Lock Screen widgets showing "Due Today" count
- **Notifications:**
  - Local notifications for review reminders
  - Rich notifications with practice quick actions
  - Notification Service Extension for custom sounds

**iOS Performance Requirements:**
- **Launch Time:** <2 seconds cold launch on iPhone 13
- **Frame Rate:** Maintain 60fps during scrolling (120fps on ProMotion devices)
- **Memory:** Stay under 150MB during normal operation
- **Battery:** Efficient background tasks (<5% battery drain per day)
- **App Size:** Initial download <50MB, total size <200MB with cached content

**iOS App Store Requirements:**
- Privacy manifest (PrivacyInfo.xcprivacy) declaring all data collection
- App Tracking Transparency framework if using analytics
- Required reason APIs documentation
- Screenshot sets for all iPhone sizes (6.7", 6.5", 5.5")
- App Preview video showing core capture and review flow
- Age rating: 4+ (Educational)

#### Android (Secondary Platform)
- **Minimum SDK:** API 26 (Android 8.0) for 95%+ market coverage
- **Target SDK:** Latest stable (API 34/Android 14)
- **Framework:** React Native (shared codebase with iOS) or native Kotlin
- **Material Design 3** implementation for native Android feel
- **Share Sheet integration** for phrase capture from other apps

#### Web/Desktop (Tertiary Platform)
- **Web App:** Progressive Web App (PWA) for desktop synchronization
- **Browser Extension:** Chrome/Safari extension for desktop capture
- **Framework:** Next.js with responsive design adapting dashboard to desktop viewports

### Integration Needs
- Integration with communication apps (WhatsApp, Telegram, Slack) for phrase capture.
- Email forwarding capability for extracting phrases from email content.

### Scalability Considerations
- Ensure backend infrastructure can handle growing user base and data volume.
- Implement efficient data storage and retrieval mechanisms for smart cards.

### Performance Requirements
- Optimize app performance for quick phrase capture and audio playback.
- Minimize latency in review session loading and completion feedback.

#### Analytics Dashboard Performance

**iOS-Specific Performance:**
- **Initial Load:** Dashboard must render core metrics within 1.5 seconds on iPhone 13 (2 seconds on iPhone SE)
- **3G Network:** Full dashboard load <3 seconds on cellular connection
- **Scroll Performance:**
  - Maintain 60fps on standard iPhones, 120fps on ProMotion displays
  - Use iOS LazyVStack/LazyVGrid or RecyclerListView (React Native)
  - Limit simultaneous cell rendering to visible + 2 screens buffer
- **Memory Management:**
  - Dashboard view should stay under 80MB memory footprint
  - Properly deallocate category views when collapsed
  - Use weak references for closures to prevent retain cycles
- **Animation Performance:**
  - All animations use Core Animation layer-backed properties
  - Disable complex animations when "Reduce Motion" enabled
  - Haptic feedback triggers <16ms after user action
- **Background Refresh:**
  - Pre-fetch analytics during background app refresh
  - Update analytics cache silently when app enters foreground
  - Use NSCache for in-memory analytics with automatic eviction

**Cross-Platform Performance:**
- **Search Debouncing:** Implement 300ms debounce on search input to prevent excessive re-renders
- **Virtual Scrolling:** Use virtualization for categories with >50 phrases
- **Lazy Loading:** Defer loading collapsed category data until user expansion
- **Backend Pre-computation:** Calculate analytics (struggling phrases, category stats) during background jobs, not on-demand
- **Client Caching:** Cache dashboard analytics for 5 minutes to reduce server load
- **Optimistic Updates:** Update UI immediately when user completes practice session (sync in background)

## Success Criteria

### MVP Completion Criteria
- All MVP features are implemented and tested on iOS (primary), Android (secondary).
- User feedback indicates a positive reception and usability.
- Integration with key communication platforms is functional and reliable.

### iOS Launch Readiness Checklist

**Development Completion:**
- [ ] All P0 features implemented and tested on iOS 16.0+ devices
- [ ] Analytics Dashboard renders correctly on all iPhone sizes (SE, standard, Pro Max)
- [ ] Share Extension captures phrases from WhatsApp, Safari, Messages
- [ ] Audio playback works reliably with AVFoundation
- [ ] Spaced repetition notifications trigger accurately with BGTaskScheduler
- [ ] Light/Dark Mode fully supported with semantic colors

**iOS Testing Requirements:**
- [ ] Tested on physical devices: iPhone SE (2nd gen), iPhone 13/14, iPhone 15 Pro
- [ ] VoiceOver navigation tested across all core flows
- [ ] Dynamic Type tested at all accessibility sizes
- [ ] Reduce Motion accessibility setting respected
- [ ] Memory profiling: No leaks, stays under 150MB
- [ ] Battery testing: <5% drain per day with background tasks
- [ ] Network conditions tested: WiFi, 5G, LTE, 3G, offline
- [ ] Interruption testing: Phone calls, low battery, background/foreground transitions

**App Store Submission Requirements:**
- [ ] App Store Connect listing complete with metadata
- [ ] Screenshots for all required sizes (6.7", 6.5", 5.5")
- [ ] App Preview video (15-30 seconds) showing capture and review flow
- [ ] Privacy manifest (PrivacyInfo.xcprivacy) configured
- [ ] Required reason APIs documented if using background modes
- [ ] TestFlight beta testing with 10+ external testers
- [ ] App Review Guidelines compliance verified
- [ ] Age rating: 4+ (Educational)
- [ ] Support URL and privacy policy published

**Post-Launch iOS Monitoring:**
- [ ] Crashlytics/Sentry configured for crash reporting
- [ ] App Store ratings monitoring setup
- [ ] TestFlight feedback collection process
- [ ] Performance monitoring (launch time, memory, battery)

### Android Launch Checklist (Secondary)
- [ ] Core features parity with iOS
- [ ] Material Design 3 implementation
- [ ] Tested on Google Pixel and Samsung Galaxy devices
- [ ] Google Play Store listing complete
- [ ] Play Console beta testing

### General Launch Checklist
- Develop support documentation and onboarding tutorials.
- Customer support email configured (support@llyi.app)
- Analytics instrumentation for tracking KPIs

### Key Metrics to Track Post-launch
- Monitor user engagement metrics and retention rates.
- Track feature usage, particularly phrase capture and review sessions.
- Collect qualitative feedback to guide future iterations.

## Out of Scope (for MVP)
- Advanced gamification elements or competitive leaderboards.
- Offline mode for phrase capture and review.
- Multi-language support beyond initial target languages.
- Advanced data visualization (charts, graphs, trend lines).
- Export/sharing of analytics data. 

---

This PRD is crafted to guide the development of LLYI, ensuring that the team remains focused on delivering a valuable and impactful language learning tool. The document translates the founder's vision into actionable specifications that align with user needs and market demands.