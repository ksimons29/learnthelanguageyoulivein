# Next Implementation Phase - Backend Foundation & Word Capture

**Date:** 2026-01-16
**Status:** Ready to Begin
**Phase:** Phase 1 - Foundation & Word Capture (Epic 0 + Epic 1)

---

## Current State Assessment

### ✅ Completed
- **Frontend UI**: All 7 pages implemented with Moleskine design system
  - Home (Today), Capture, Notebook, Review, Review Complete, Progress, Word Detail
- **Component Library**: 25+ components (navigation, home, capture, notebook, review, progress)
- **Design System**: Complete with CSS utilities, color tokens, typography
- **Responsive Design**: Mobile-first with max-w-md container
- **Next.js 16 Setup**: App Router, React 19, Tailwind CSS 4, TypeScript

### ❌ Missing (Next Phase)
- **Database**: No schema, no ORM setup, no migrations
- **API Routes**: No backend endpoints (words, reviews, sessions)
- **Authentication**: No user management
- **FSRS Integration**: Algorithm exists in docs but not implemented
- **Audio**: No TTS integration, no audio storage
- **State Management**: No Zustand store, using mock data
- **Environment Configuration**: No .env files

---

## Phase 1 Implementation Plan

### Epic 0: Technical Foundation (Week 1-2)

#### Task 0.1: Database Setup with Supabase
**Goal**: Set up PostgreSQL database with Supabase and Drizzle ORM

**Steps**:
1. Create Supabase project (https://supabase.com)
   - Note: Free tier includes 500MB database, 1GB storage, authentication
2. Install dependencies:
   ```bash
   cd web
   npm install drizzle-orm postgres
   npm install -D drizzle-kit
   ```
3. Create `web/drizzle.config.ts`
4. Create `web/src/lib/db/index.ts` (database connection)
5. Create schema files:
   - `web/src/lib/db/schema/users.ts` (handled by Supabase Auth)
   - `web/src/lib/db/schema/words.ts` (core Word entity with FSRS fields)
   - `web/src/lib/db/schema/sessions.ts` (ReviewSession entity)
   - `web/src/lib/db/schema/sentences.ts` (GeneratedSentence entity)
   - `web/src/lib/db/schema/tags.ts` (Tag entity)
6. Generate and run initial migration:
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

**Database Schema** (from implementation_plan.md):
```typescript
// Word entity (lines 138-162 of implementation_plan.md)
{
  id: uuid (PK)
  userId: uuid (FK)
  originalText: string
  translation: string
  language: 'source' | 'target'
  audioUrl: string | null
  category: string (food, work, home, transport, health, social, etc.)
  categoryConfidence: float

  // FSRS Fields
  difficulty: float (default 5.0)
  stability: float (default 1.0)
  retrievability: float (default 1.0)
  nextReviewDate: timestamp
  lastReviewDate: timestamp | null
  reviewCount: int (default 0)
  lapseCount: int (default 0)

  // Mastery Fields
  consecutiveCorrectSessions: int (default 0)
  lastCorrectSessionId: uuid | null
  masteryStatus: 'learning' | 'learned' | 'ready_to_use'

  createdAt: timestamp
  updatedAt: timestamp
}

// ReviewSession entity (lines 178-188)
{
  id: uuid (PK)
  userId: uuid (FK)
  startedAt: timestamp
  endedAt: timestamp | null
  wordsReviewed: int (default 0)
  correctCount: int (default 0)
}

// GeneratedSentence entity (lines 164-176)
{
  id: uuid (PK)
  userId: uuid (FK)
  text: string
  audioUrl: string | null
  wordIds: uuid[] (array of 2-4 word IDs)
  wordIdsHash: string (for deduplication)
  exerciseType: 'type_translation' | 'fill_blank' | 'multiple_choice'
  sessionId: uuid | null (FK)
  usedAt: timestamp | null
  createdAt: timestamp
}

// Tag entity (lines 189-193)
{
  id: uuid (PK)
  name: string
  wordId: uuid (FK)
  createdAt: timestamp
}
```

**Acceptance Criteria**:
- [ ] Supabase project created and database accessible
- [ ] Drizzle ORM configured with Supabase connection
- [ ] All schemas created matching implementation plan
- [ ] Initial migration runs successfully
- [ ] Can query database from `web/src/lib/db/index.ts`

---

#### Task 0.2: Authentication with Supabase Auth
**Goal**: Set up user authentication and session management

**Steps**:
1. Install Supabase client:
   ```bash
   npm install @supabase/supabase-js @supabase/ssr
   ```
2. Create `web/src/lib/supabase/client.ts` (client-side)
3. Create `web/src/lib/supabase/server.ts` (server-side for API routes)
4. Create `web/src/lib/supabase/middleware.ts` (auth middleware)
5. Update `web/middleware.ts` to protect routes
6. Create sign-up/sign-in pages:
   - `web/src/app/auth/sign-in/page.tsx`
   - `web/src/app/auth/sign-up/page.tsx`
   - `web/src/app/auth/callback/route.ts` (OAuth callback)
7. Add authentication UI components

**Acceptance Criteria**:
- [ ] Users can sign up with email/password
- [ ] Users can sign in and maintain session
- [ ] Protected routes redirect to sign-in
- [ ] User ID available in API routes via Supabase session

---

#### Task 0.3: Environment Configuration
**Goal**: Set up environment variables for local and production

**Steps**:
1. Create `web/.env.local.example`:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # Database (Supabase PostgreSQL)
   DATABASE_URL=postgresql://...

   # OpenAI (for TTS and translation)
   OPENAI_API_KEY=sk-...

   # App
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
2. Create `web/.env.local` (gitignored) with actual values
3. Add environment variables to Vercel project settings

**Acceptance Criteria**:
- [ ] `.env.local.example` committed to repo
- [ ] `.env.local` exists locally with real values (gitignored)
- [ ] Environment variables documented in README

---

#### Task 0.4: Zustand State Management Setup
**Goal**: Replace mock data with centralized state management

**Steps**:
1. Install Zustand:
   ```bash
   npm install zustand
   ```
2. Create stores:
   - `web/src/lib/store/auth-store.ts` (user, session)
   - `web/src/lib/store/words-store.ts` (words list, capture, delete)
   - `web/src/lib/store/review-store.ts` (session state, due words, grading)
   - `web/src/lib/store/ui-store.ts` (modals, loading states)
3. Create `web/src/lib/store/index.ts` (barrel export)

**Store Structure Example** (words-store.ts):
```typescript
interface WordsState {
  words: Word[]
  isLoading: boolean
  error: string | null

  // Actions
  fetchWords: () => Promise<void>
  captureWord: (text: string, context?: string) => Promise<Word>
  deleteWord: (id: string) => Promise<void>
  updateWord: (id: string, updates: Partial<Word>) => Promise<void>
}
```

**Acceptance Criteria**:
- [ ] Zustand stores created for auth, words, review, ui
- [ ] Stores can be imported and used in components
- [ ] TypeScript interfaces defined for all state shapes

---

### Epic 1: Word Capture (Week 2-3)

#### Task 1.1: Word Capture API Endpoint
**Goal**: Create API endpoint to capture and process words

**Route**: `POST /api/words`

**Steps**:
1. Create `web/src/app/api/words/route.ts`
2. Implement word capture logic:
   - Validate input (text required, context optional)
   - Detect language (OpenAI API or language detection library)
   - Auto-translate (OpenAI GPT-4)
   - Assign category (OpenAI GPT-4 with prompt)
   - Initialize FSRS parameters (difficulty=5.0, stability=1.0, retrievability=1.0)
   - Store in database
   - Return word with initial state

**Request Body**:
```typescript
{
  text: string           // Required: the captured phrase
  context?: string       // Optional: where user encountered it
}
```

**Response**:
```typescript
{
  data: {
    word: Word           // Complete word object with FSRS fields
  }
}
```

**Category Assignment Prompt** (from implementation_plan.md lines 321-335):
```typescript
const categoryPrompt = `Categorize this word/phrase into exactly ONE category:
- food, restaurant, shopping, work, home, transport, health, social,
  bureaucracy, emergency, weather, time, greetings, other

Word: "${text}"
${context ? `Context: "${context}"` : ''}

Respond with ONLY the category name, nothing else.`
```

**Acceptance Criteria**:
- [ ] POST /api/words endpoint exists
- [ ] Validates user authentication (Supabase session)
- [ ] Auto-detects language (source vs. target)
- [ ] Auto-translates using OpenAI API
- [ ] Auto-assigns category with confidence score
- [ ] Initializes FSRS fields correctly
- [ ] Returns complete word object
- [ ] Error handling for API failures
- [ ] Rate limiting (10 captures per minute per user)

---

#### Task 1.2: Word Retrieval API Endpoints
**Goal**: Create endpoints to list and retrieve words

**Routes**:
- `GET /api/words` - List user's words with filters
- `GET /api/words/:id` - Get single word details
- `DELETE /api/words/:id` - Delete a word
- `PUT /api/words/:id` - Update word (e.g., change category)

**Query Parameters** (GET /api/words):
```typescript
{
  page?: number          // Default: 1
  limit?: number         // Default: 20
  category?: string      // Filter by category
  masteryStatus?: string // Filter by mastery status
  search?: string        // Search in originalText or translation
}
```

**Acceptance Criteria**:
- [ ] GET /api/words returns paginated list
- [ ] Filtering by category, masteryStatus, search works
- [ ] GET /api/words/:id returns single word
- [ ] DELETE /api/words/:id removes word
- [ ] PUT /api/words/:id updates word
- [ ] All endpoints validate authentication

---

#### Task 1.3: Audio Generation with OpenAI TTS
**Goal**: Generate and store native audio pronunciation

**Steps**:
1. Install OpenAI SDK:
   ```bash
   npm install openai
   ```
2. Create `web/src/lib/audio/tts.ts`:
   - Generate audio using OpenAI TTS API
   - Choose voice based on target language (alloy, echo, fable, onyx, nova, shimmer)
   - Return audio buffer
3. Store audio in Supabase Storage:
   - Create `audio` bucket in Supabase Storage
   - Upload with naming convention: `{userId}/{wordId}.mp3`
   - Set public access with CDN caching
4. Update word record with `audioUrl`

**OpenAI TTS API Call** (from implementation_plan.md lines 95-114):
```typescript
import OpenAI from 'openai'
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

async function generateAudio(text: string, language: string): Promise<Buffer> {
  const response = await openai.audio.speech.create({
    model: 'tts-1',        // or 'tts-1-hd' for higher quality
    voice: 'nova',         // Choose based on language/preference
    input: text,
    response_format: 'mp3', // AAC preferred but MP3 widely supported
    speed: 1.0
  })

  return Buffer.from(await response.arrayBuffer())
}
```

**Audio Storage Strategy**:
- Format: MP3 (128kbps, 44.1kHz)
- Storage: Supabase Storage (CDN-enabled, edge caching)
- Naming: `{userId}/{wordId}.mp3`
- Access: Public read, authenticated write
- Caching: Service Worker cache after first play

**Acceptance Criteria**:
- [ ] OpenAI TTS integration working
- [ ] Audio stored in Supabase Storage
- [ ] Audio URL returned with word object
- [ ] Audio playback <1s on mobile (CDN delivery)
- [ ] Error handling for TTS failures
- [ ] Cost monitoring (OpenAI TTS pricing: $15 per 1M characters)

---

#### Task 1.4: Connect Capture Form to API
**Goal**: Replace mock data in capture form with real API calls

**Steps**:
1. Update `web/src/components/capture/phrase-input.tsx`:
   - Import `useWordsStore`
   - Call `captureWord()` on form submit
   - Show loading state during API call
   - Show success/error feedback
   - Clear form on success
2. Update `web/src/app/page.tsx`:
   - Fetch real captured words from store
   - Display actual phrases with audio
3. Add audio playback component:
   - `web/src/components/audio/audio-player.tsx`
   - Play/pause button
   - Loading indicator
   - Error handling

**Acceptance Criteria**:
- [ ] Capture form calls real API endpoint
- [ ] Loading state shown during capture
- [ ] Success message on successful capture
- [ ] Error message on failure
- [ ] Captured words displayed on home page
- [ ] Audio playback works for captured words
- [ ] Form clears after successful capture

---

### Epic 2 Preview: Dynamic Sentence Generation (Week 4-5)

**Note**: This epic depends on having words captured and stored. Include in plan but implement after Epic 1 complete.

**Key Tasks**:
1. Word-Matching Algorithm (lines 256-317 of implementation_plan.md)
   - Group words by category
   - Cluster by due date proximity (7-day window)
   - Generate 2-4 word combinations
   - Filter out used combinations (check wordIdsHash)
2. Sentence Generation via GPT-4
   - Prompt engineering for natural sentences
   - Validate sentence contains target words
   - Max 10 words per sentence
3. Batch Pre-Generation System
   - Trigger on app foreground
   - Trigger after word capture
   - Pre-generate 7 days of sentences

---

### Epic 3 Preview: FSRS Review System (Week 5-7)

**Note**: This is the core learning algorithm. Reference FSRS_IMPLEMENTATION.md.

**Key Tasks**:
1. Install ts-fsrs library:
   ```bash
   npm install ts-fsrs
   ```
2. Implement review processing function (FSRS_IMPLEMENTATION.md lines 153-213):
   - Calculate retrievability
   - Update difficulty, stability based on rating
   - Calculate next review date
   - Track mastery (3 correct recalls across sessions)
3. Create review API endpoints:
   - `GET /api/reviews/due` - Get due words
   - `POST /api/reviews/complete` - Submit review rating
   - `POST /api/reviews/end` - End session
4. Session management (2-hour rule)
5. Connect review UI to API

---

## Technical Decisions

### Database: Supabase (PostgreSQL)
**Why**: Built-in auth, storage, real-time, edge caching, free tier generous for MVP

**Alternatives Considered**:
- Neon: PostgreSQL only, no auth/storage
- PlanetScale: MySQL (want PostgreSQL for JSON columns)
- Vercel Postgres: Limited free tier

**Decision**: Supabase provides everything needed (auth + database + storage) in one platform

---

### ORM: Drizzle
**Why**: Type-safe, lightweight, excellent TypeScript support, SQL-like syntax

**Alternatives Considered**:
- Prisma: Heavier, slower, but more mature
- Kysely: Type-safe but more verbose

**Decision**: Drizzle recommended in implementation_plan.md (line 43)

---

### TTS Provider: OpenAI TTS
**Why**: High quality, cost-effective ($15 per 1M chars), multilingual, easy integration

**Alternatives Considered**:
- Google Cloud TTS: Similar pricing, good quality
- ElevenLabs: Ultra-realistic but expensive ($330/month for 500k chars)
- Browser TTS: Free but inconsistent quality

**Decision**: OpenAI TTS for MVP (line 49 of implementation_plan.md)

---

### State Management: Zustand
**Why**: Simple, minimal boilerplate, TypeScript-first, no context providers needed

**Alternatives Considered**:
- Redux Toolkit: Over-engineered for this app
- React Context: Causes unnecessary re-renders

**Decision**: Zustand specified in implementation_plan.md (line 36)

---

## Success Criteria for Phase 1

### Technical Milestones
- [ ] Database schema matches implementation plan
- [ ] All migrations run successfully
- [ ] Authentication flow complete (sign up, sign in, protected routes)
- [ ] Word capture API working end-to-end
- [ ] Audio generation and storage working
- [ ] Frontend connected to real API (no more mock data)
- [ ] Audio playback functional on mobile

### User Experience Milestones
- [ ] User can sign up and log in
- [ ] User can capture a phrase in <5 seconds
- [ ] User sees captured phrases on home page
- [ ] User can play audio for each phrase
- [ ] User can filter phrases by category
- [ ] Loading states and error messages work correctly

### Performance Targets
- [ ] Word capture latency <2s (including TTS generation)
- [ ] Audio playback starts <1s (via Supabase CDN)
- [ ] Page load time <2s on 3G
- [ ] No console errors or warnings

---

## Risk Mitigation

### Risk 1: OpenAI API Costs
**Risk**: TTS costs escalate with many captures
**Mitigation**:
- Cache audio permanently in Supabase Storage
- Implement rate limiting (10 captures per minute)
- Monitor costs per user
- Set spending alerts in OpenAI dashboard

### Risk 2: Database Schema Changes
**Risk**: Schema changes after data exists
**Mitigation**:
- Use Drizzle migrations (reversible)
- Test migrations on staging database first
- Keep backups of production data
- Version control all schema changes

### Risk 3: Audio Playback on iOS Safari
**Risk**: iOS autoplay restrictions
**Mitigation**:
- Require user interaction before first audio play
- Cache audio after first interaction
- Use native HTML5 `<audio>` element (not Web Audio API)
- Test on actual iOS devices

### Risk 4: Supabase Free Tier Limits
**Risk**: Exceed 500MB database or 1GB storage
**Mitigation**:
- Monitor usage in Supabase dashboard
- Implement data retention policies (archive old words)
- Plan upgrade to Pro ($25/month) at 80% capacity
- Free tier generous for MVP (expect 1000-5000 users before limits)

---

## Next Steps (Immediate Actions)

### 1. Create Supabase Project (30 minutes)
```bash
# Visit https://supabase.com
# Create new project: llyi-web-mvp
# Note: Database URL, Anon Key, Service Role Key
# Create .env.local with credentials
```

### 2. Install Dependencies (10 minutes)
```bash
cd web
npm install drizzle-orm postgres @supabase/supabase-js @supabase/ssr
npm install -D drizzle-kit
npm install openai zustand
```

### 3. Set Up Database Schema (2-3 hours)
```bash
# Create drizzle.config.ts
# Create schema files in src/lib/db/schema/
# Generate initial migration
npm run db:generate
npm run db:migrate
```

### 4. Implement Word Capture API (4-6 hours)
```bash
# Create src/app/api/words/route.ts
# Implement capture, translation, category assignment
# Test with Postman or curl
```

### 5. Connect Frontend (2-3 hours)
```bash
# Update capture form to call API
# Replace mock data with real API calls
# Test end-to-end flow
```

---

## Timeline Estimate

| Week | Focus | Deliverables |
|------|-------|--------------|
| **Week 1** | Database & Auth Setup | Supabase configured, schema created, auth working |
| **Week 2** | Word Capture API | Capture endpoint, audio generation, storage |
| **Week 3** | Frontend Integration | Capture form connected, audio playback, real data |
| **Week 4-5** | Sentence Generation | Word-matching algorithm, GPT-4 integration |
| **Week 5-7** | FSRS Review System | ts-fsrs integration, session management, review flow |
| **Week 8** | Testing & Polish | Bug fixes, performance optimization, user testing |

**Total Estimated Time**: 6-8 weeks for complete MVP (all 5 phases)

---

## Questions to Resolve

1. **Target Language**: What languages should be supported initially? (Portuguese ↔ English confirmed in mockups)
2. **Category List**: Finalize category taxonomy (current: food, work, home, transport, health, social, bureaucracy, greetings, other)
3. **TTS Voice**: Which OpenAI voice for each language? (alloy, echo, fable, onyx, nova, shimmer)
4. **Rate Limits**: What limits on captures per day/hour to prevent abuse?
5. **Data Retention**: How long to keep words in database? Archive after X months?
6. **Deployment**: Deploy to Vercel staging first or go straight to production?

---

## References

- **Implementation Plan**: `/docs/engineering/implementation_plan.md` (lines 1-952)
- **FSRS Implementation**: `/docs/engineering/FSRS_IMPLEMENTATION.md` (lines 1-391)
- **PRD**: `/docs/product/prd.md`
- **Design System**: `/docs/design/design-system.md`
- **Supabase Docs**: https://supabase.com/docs
- **Drizzle ORM Docs**: https://orm.drizzle.team/docs/overview
- **OpenAI TTS Docs**: https://platform.openai.com/docs/guides/text-to-speech
- **ts-fsrs Docs**: https://github.com/open-spaced-repetition/ts-fsrs

---

**Created**: 2026-01-16
**Last Updated**: 2026-01-16
**Status**: Ready for Development
**Next Review**: After Week 1 (Database & Auth Setup Complete)
