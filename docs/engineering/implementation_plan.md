# Implementation Plan: LLYI

## Executive Summary

### Core Value Proposition
LLYI transforms real-life language encounters into memorable learning experiences by enabling users to capture, review, and retain phrases seamlessly through smart cards with **high-quality native audio** and a proven spaced repetition system.

### Platform Approach
**Version 1 (MVP)**: Responsive web application optimized for mobile and desktop browsers. This enables rapid iteration, instant updates, and cross-platform reach without app store dependencies.

**Version 2**: Native iOS app with platform-specific features (Share Extension, Widgets, offline-first architecture).

### MVP Scope
The web MVP includes:
- Quick phrase capture via text input (mobile-optimized)
- Smart card creation with **high-quality native audio playback**
- Spaced repetition system using FSRS algorithm
- Tagging and collections for organization
- Progress overview and analytics
- Progressive Web App (PWA) capabilities for offline support

### Success Criteria
- **Feature Completion:** All P0 features from PRD implemented and tested
- **User Validation:** At least 30% of users utilize the capture feature daily with positive feedback from 500+ active users
- **Technical Quality:** Core features work reliably with <5% error rate
- **Audio Performance:** Audio playback starts within <1 second on mobile
- **Mobile Experience:** Works seamlessly on iPhone Safari and Android Chrome

## Technical Architecture

### Tech Stack Recommendations

**Frontend:**
- **Framework:** Next.js 14+ with App Router and React
- **UI Components:** shadcn/ui with Tailwind CSS (mobile-first responsive design)
- **State Management:** React Context API + Zustand for complex state
- **PWA:** next-pwa for Progressive Web App capabilities
- **Audio:** HTML5 Audio API with Web Audio API for advanced features

**Backend/API:**
- **API Layer:** Next.js API Routes with Server Actions
- **Database:** Neon (Serverless PostgreSQL) or Supabase
- **ORM:** Drizzle ORM
- **Authentication:** NextAuth.js (Auth.js) or Clerk
- **File Storage:** Vercel Blob or AWS S3 (for audio files)
- **Caching:** Vercel Edge caching + Redis (Upstash) for session data

**Audio Services:**
- **Text-to-Speech:** OpenAI TTS, Google Cloud Text-to-Speech, or ElevenLabs
- **Audio Format:** AAC or MP3, 44.1kHz minimum
- **Audio CDN:** Cloudflare or CloudFront for fast global delivery
- **Audio Caching:** Service Worker caching for offline playback

**Hosting & Deployment:**
- **Platform:** Vercel (edge functions for low latency)
- **CDN:** Vercel Edge Network (automatic)
- **Analytics:** Vercel Analytics or Mixpanel
- **Error Tracking:** Sentry

**Additional Services:**
- **LLM API:** OpenAI GPT-4 for sentence generation
- **Spaced Repetition:** ts-fsrs library for FSRS algorithm
- **Payments:** Stripe (future premium features)
- **Email:** Resend or SendGrid for transactional emails

### Architecture Patterns
- **Responsive-First Design:** Mobile-first CSS with breakpoints (375px, 768px, 1280px)
- **Progressive Enhancement:** Core features work without JavaScript, enhanced with JS
- **Server-Side Rendering:** Next.js SSR for fast initial page loads and SEO
- **API Layer:** RESTful API design with Next.js API routes
- **State Management:** React Context API for global state, local state for components
- **PWA Architecture:** Service Worker for offline capabilities and caching

### Audio Architecture

**Audio Generation Pipeline:**
1. User captures phrase → Backend validates and stores
2. Backend calls TTS API (OpenAI/Google/ElevenLabs) for native pronunciation
3. Audio file stored in CDN (S3 + CloudFront or Vercel Blob)
4. Audio URL returned to frontend and cached

**Audio Playback Strategy:**
```
Client Request → Check Service Worker Cache →
  If cached: Play immediately (<100ms)
  If not cached: Fetch from CDN → Cache → Play (<1s)
```

**Audio Optimization:**
- **Format:** AAC (preferred for quality/size) or MP3 fallback
- **Bitrate:** 128kbps (optimal for speech)
- **Sample Rate:** 44.1kHz minimum
- **Caching:** Service Worker caches all played audio
- **Preloading:** Preload audio for due review cards in background
- **Mobile Optimization:** Use native HTML5 `<audio>` element for iOS compatibility

**Audio Quality Providers:**
- **Primary:** OpenAI TTS (high quality, multilingual, cost-effective)
- **Alternative:** Google Cloud TTS (good quality, wide language support)
- **Premium Option:** ElevenLabs (ultra-realistic voices, higher cost)

### Data Model

#### Entity Relationship Diagram (Text)
```
[User] 1──────M [Phrase]
    │                 │
    │                 │
    M                 1
[Tag] ──────── [SmartCard]
```

#### Core Entities

- **User**
  - Fields: id (uuid), email (string, unique), name (string), passwordHash (string), createdAt (timestamp), updatedAt (timestamp)
  - Relationships: has_many Phrases, has_many SmartCards
  - Indexes: email for authentication lookup

- **Phrase**
  - Fields: id (uuid), text (string), language (string), translation (string), audioUrl (string, nullable), userId (uuid), createdAt (timestamp), updatedAt (timestamp)
  - Relationships: belongs_to User, has_one SmartCard
  - Indexes: userId for user-specific retrieval
  - Notes: audioUrl points to CDN-hosted TTS audio file

- **SmartCard**
  - Fields: id (uuid), phraseId (uuid), reviewSchedule (date), difficulty (float), stability (float), retrievability (float), lastReviewDate (timestamp), reviewCount (int), correctCount (int), createdAt (timestamp), updatedAt (timestamp)
  - Relationships: belongs_to Phrase, has_many Tags
  - Indexes: phraseId for phrase lookup, reviewSchedule for due cards query
  - Notes: FSRS parameters (difficulty, stability, retrievability) track learning progress

- **Tag**
  - Fields: id (uuid), name (string), smartCardId (uuid), createdAt (timestamp), updatedAt (timestamp)
  - Relationships: belongs_to SmartCard
  - Indexes: smartCardId for card tagging

### API Routes / Endpoints

#### Authentication Routes
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate a user
- `POST /api/auth/logout` - Terminate a session
- `POST /api/auth/forgot-password` - Initiate password reset
- `POST /api/auth/reset-password` - Complete password reset

#### Core Feature Routes

**Phrase Capture Routes:**
- `POST /api/phrases` - Capture and create a phrase
  - Body: { text, language }
  - Response: { data: { phraseId } }

**Smart Card Management Routes:**
- `GET /api/smartcards` - List smart cards with pagination
  - Query params: page, limit, filter
- `GET /api/smartcards/:id` - Get a specific smart card
- `POST /api/smartcards` - Create a smart card from a phrase
  - Body: { phraseId, audioUrl }
- `PUT /api/smartcards/:id` - Update a smart card
- `DELETE /api/smartcards/:id` - Delete a smart card

**Review System Routes:**
- `GET /api/reviews/schedule` - Get scheduled reviews for the user
- `POST /api/reviews/complete` - Mark a review as complete
  - Body: { smartCardId, success }

## User Stories

### User Story 1: Quick Phrase Capture
**Story:** As a user, I want to capture phrases from my chats quickly so that I can review them later.
**Priority:** P0
**Acceptance Criteria:**
- [ ] Capture phrases via shared text from communication apps
- [ ] Add phrases manually with minimal input
- [ ] Detect and suggest language and translation automatically
**Dependencies:** None
**Estimated Complexity:** Medium

### User Story 2: Smart Cards with Audio
**Story:** As a user, I want to listen to native audio pronunciations so that I can improve my speaking skills.
**Priority:** P0
**Acceptance Criteria:**
- [ ] Display text and translation for each phrase
- [ ] Provide high-quality native audio for pronunciation
- [ ] Include context sentences for better understanding
**Dependencies:** User Story 1
**Estimated Complexity:** Large

### User Story 3: Spaced Repetition System
**Story:** As a user, I want to review phrases at the right time so that I retain them longer.
**Priority:** P0
**Acceptance Criteria:**
- [ ] Schedule reviews based on user retention data
- [ ] Adapt difficulty based on user's recall accuracy
- [ ] Notify users when reviews are due
**Dependencies:** User Story 2
**Estimated Complexity:** Large

### User Story 4: Tagging and Collections
**Story:** As a user, I want to group phrases by context so that I can focus on specific areas as needed.
**Priority:** P1
**Acceptance Criteria:**
- [ ] Allow users to create and assign tags
- [ ] Facilitate review sessions by tag or collection
- [ ] Preload common tags with starter packages
**Dependencies:** User Story 2
**Estimated Complexity:** Medium

### User Story 5: Basic Progress Overview
**Story:** As a user, I want to see my progress so that I stay motivated.
**Priority:** P2
**Acceptance Criteria:**
- [ ] Display metrics such as cards added and reviews completed
- [ ] Show retention rate and active streaks
- [ ] Update statistics in real-time
**Dependencies:** User Story 3
**Estimated Complexity:** Medium

## Development Epics

### Epic 1: Phrase Capture
**Goal:** Enable users to capture phrases effortlessly from various sources
**User Stories Included:** US-1
**Tasks:**
- **Task 1.1:** Implement phrase capture from apps via sharing
  - **Acceptance Criteria:**
    - [ ] Integrate with WhatsApp, Telegram for phrase sharing
    - [ ] Support manual phrase entry
  - **Estimated Effort:** 16 hours

- **Task 1.2:** Automatic language detection and translation
  - **Acceptance Criteria:**
    - [ ] Detect language of captured phrase
    - [ ] Suggest translation automatically
  - **Estimated Effort:** 12 hours

### Epic 2: Smart Card Management
**Goal:** Create and manage smart cards with text and audio
**User Stories Included:** US-2
**Tasks:**
- **Task 2.1:** Implement smart card creation from phrases
  - **Acceptance Criteria:**
    - [ ] Convert phrases into smart cards
    - [ ] Attach native audio to cards
  - **Estimated Effort:** 20 hours

- **Task 2.2:** Display smart card details
  - **Acceptance Criteria:**
    - [ ] Show text, translation, and audio in card view
  - **Estimated Effort:** 12 hours

### Epic 3: Spaced Repetition System
**Goal:** Optimize learning retention with a spaced repetition review system
**User Stories Included:** US-3
**Tasks:**
- **Task 3.1:** Develop review scheduling algorithm
  - **Acceptance Criteria:**
    - [ ] Schedule reviews based on retention data
  - **Estimated Effort:** 24 hours

- **Task 3.2:** Integrate notifications for due reviews
  - **Acceptance Criteria:**
    - [ ] Notify users when reviews are due
  - **Estimated Effort:** 10 hours

### Epic 4: Tagging and Collections
**Goal:** Organize phrases contextually with tags and collections
**User Stories Included:** US-4
**Tasks:**
- **Task 4.1:** Implement tag creation and assignment
  - **Acceptance Criteria:**
    - [ ] Allow users to create and assign tags to phrases
  - **Estimated Effort:** 14 hours

- **Task 4.2:** Facilitate reviews by tags
  - **Acceptance Criteria:**
    - [ ] Enable review sessions focused on specific tags
  - **Estimated Effort:** 10 hours

### Epic 5: Basic Progress Overview
**Goal:** Provide users with insights into their learning progress
**User Stories Included:** US-5
**Tasks:**
- **Task 5.1:** Develop progress metrics dashboard
  - **Acceptance Criteria:**
    - [ ] Show metrics such as cards added and reviews completed
  - **Estimated Effort:** 15 hours

- **Task 5.2:** Implement real-time statistics update
  - **Acceptance Criteria:**
    - [ ] Update retention rate and active streaks in real-time
  - **Estimated Effort:** 12 hours

### Epic X: Technical Foundation
**Goal:** Establish technical infrastructure needed to support feature development
**Tasks:**
- Project initialization and framework setup
- Database schema design and migrations
- Authentication implementation
- Deployment pipeline and hosting setup
- Basic error handling and logging
- Environment configuration

## Implementation Phases

### Phase 1: Foundation & Core Features (Weeks 1-2)
**Epics:** Technical Foundation, Epic 1, Epic 2
**Key Deliverables:**
- Project setup with database and authentication
- Phrase capture and smart card creation
**Exit Criteria:**
- [ ] Successful phrase capture and smart card creation

### Phase 2: Secondary Features & Integration (Weeks 3-4)
**Epics:** Epic 3, Epic 4
**Key Deliverables:**
- Spaced repetition system and tagging implementation
**Exit Criteria:**
- [ ] Review scheduling and tag-based reviews functional

### Phase 3: Polish & Launch Prep (Week 5)
**Epics:** Epic 5, Final polish tasks
**Key Deliverables:**
- Progress overview dashboard
- Final testing and optimization
**Exit Criteria:**
- [ ] All features meet acceptance criteria and are stable

## Testing Strategy

### Unit Testing
- Components: Phrase capture, Smart card creation, Review scheduling
- Framework: Jest with React Testing Library

### Integration Testing
- Key Points: API endpoints, Phrase capture to card conversion
- User Flows: Phrase capture to review completion

### User Acceptance Testing
- Validate with real users completing core workflows
- Success: Positive feedback and successful task completion by 10+ users

## Deployment Plan

### Environments
- **Development:** Local Next.js dev server (`npm run dev`)
- **Preview:** Vercel automatic preview deployments for every PR
- **Staging:** Vercel staging environment (`staging.llyli.app`)
- **Production:** Vercel production environment (`llyli.app` or custom domain)

### Deployment Process
1. **Local Development:**
   - Develop features with hot reload
   - Test on mobile viewports using browser DevTools
   - Test audio on actual mobile devices (iPhone Safari, Android Chrome)

2. **Pull Request:**
   - Create PR → Vercel automatically deploys preview
   - Review preview on multiple devices
   - Run automated tests (Playwright for E2E, Vitest for unit)

3. **Staging Deployment:**
   - Merge to `staging` branch
   - Automatic deploy to staging environment
   - QA testing on staging

4. **Production Deployment:**
   - Merge to `main` branch
   - Automatic deploy to production
   - Monitor error rates and performance

### PWA Deployment Checklist
- [ ] Service Worker registered and caching static assets
- [ ] manifest.json configured with app icons (192x192, 512x512)
- [ ] iOS-specific meta tags for Add to Home Screen
- [ ] Offline fallback page configured
- [ ] Audio files cached for offline playback

### Rollback Plan
- **Vercel Instant Rollback:** One-click rollback to previous deployment
- **Database Migrations:** Use Drizzle migration rollback for schema changes
- **Audio Files:** Keep previous versions in S3 for 30 days

## Risk Assessment

### Technical Risks
- **Risk 1:** Audio playback issues on iOS Safari (autoplay restrictions)
  - *Mitigation:* Require user interaction before first audio play; cache audio after first interaction; thorough iOS testing

- **Risk 2:** TTS API costs escalate with usage
  - *Mitigation:* Cache generated audio permanently; implement rate limiting; monitor costs per user

- **Risk 3:** Mobile browser compatibility issues
  - *Mitigation:* Test on real devices (iPhone Safari, Android Chrome); use progressive enhancement; polyfills for older browsers

- **Risk 4:** Performance issues with spaced repetition calculations
  - *Mitigation:* Optimize algorithm with ts-fsrs library; run calculations server-side; cache results

- **Risk 5:** Service Worker caching issues causing stale content
  - *Mitigation:* Implement cache versioning; proper cache invalidation; user-facing "Refresh" option

### Feature Risks
- **Risk 1:** User adoption of capture feature may be low
  - *Mitigation:* Enhance onboarding and in-app guidance

## Success Metrics

### Feature Adoption
- Track usage of phrase capture and review sessions

### Technical Metrics
- Monitor performance, error rates, and notification delivery

### User Satisfaction
- Collect qualitative feedback and track retention rates

---

**Implementation Principles:**
1. **Feature-First:** Organize work around delivering complete user-facing features
2. **Incremental Delivery:** Build and test features incrementally
3. **User-Centric:** Prioritize user stories that deliver the most value
4. **Quality Bar:** Each feature should meet acceptance criteria before moving on
5. **Adaptability:** Be ready to adjust based on user feedback and technical discoveries