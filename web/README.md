# LLYI Web Application

A responsive web application for learning and retaining vocabulary through spaced repetition and high-quality native audio pronunciation.

---

## 🚀 Quick Start

**Phase 1 Complete!** Ready for testing.

**New to this project?** Start here:

1. **[START_HERE.md](./START_HERE.md)** - Overview and testing path (5 min read)
2. **[QUICK_TEST.md](./QUICK_TEST.md)** - Fast verification (15-20 mins)
3. **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Comprehensive testing (optional, 45-60 mins)

**Test Scripts** (automated):
```bash
node scripts/test-database.js   # Test database connection
node scripts/test-supabase.js   # Test Supabase auth
node scripts/test-openai.js     # Test OpenAI integration
```

**Already set up?** Jump to [Available Scripts](#available-scripts)

---

A responsive web application for learning and retaining vocabulary through spaced repetition and high-quality native audio pronunciation.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **UI**: React 19, Tailwind CSS 4, shadcn/ui, Radix UI
- **Database**: Supabase (PostgreSQL)
- **ORM**: Drizzle
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (for audio files)
- **TTS**: OpenAI TTS API
- **Translation**: OpenAI GPT-4
- **State Management**: Zustand

## Prerequisites

- Node.js 18+ and npm
- Supabase account (https://supabase.com)
- OpenAI API key (https://platform.openai.com/api-keys)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Choose a name (e.g., "llyi-web-mvp")
4. Set a database password (save this!)
5. Select a region closest to your users
6. Wait for project creation (~2 minutes)

### 3. Get Supabase Credentials

From your Supabase project dashboard:

**API Keys** (Settings → API):
- Copy the `Project URL`
- Copy the `anon` public key
- Copy the `service_role` secret key

**Database URL** (Settings → Database → Connection string → URI):
- Copy the connection string
- Replace `[YOUR-PASSWORD]` with your database password

### 4. Configure Environment Variables

Create a `.env.local` file in the `web/` directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Database
DATABASE_URL=postgresql://postgres:your_password@db.your-project.supabase.co:5432/postgres

# OpenAI
OPENAI_API_KEY=sk-...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Initialize Database

Generate and run migrations:

```bash
# Generate migration files from schema
npm run db:generate

# Apply migrations to database
npm run db:migrate
```

**Alternative:** If you prefer to push schema directly without migrations:

```bash
npm run db:push
```

### 6. Create Audio Storage Bucket

The audio storage bucket needs to be created in Supabase:

**Option A: Via Supabase Dashboard**
1. Go to Storage in your Supabase dashboard
2. Click "New bucket"
3. Name: `audio`
4. Public bucket: Yes
5. File size limit: 5MB
6. Click "Create bucket"

**Option B: Programmatically**

The bucket will be created automatically on first audio upload. See `/src/lib/audio/storage.ts` for the `initializeAudioBucket()` function.

### 7. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### 8. (Optional) Enable Row Level Security

For production, enable Row Level Security (RLS) on Supabase tables:

1. Go to Authentication → Policies in Supabase dashboard
2. Add policies for each table:

**Words table policies:**
```sql
-- Users can only read their own words
CREATE POLICY "Users can read own words"
ON words FOR SELECT
USING (auth.uid() = user_id);

-- Users can only insert their own words
CREATE POLICY "Users can insert own words"
ON words FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own words
CREATE POLICY "Users can update own words"
ON words FOR UPDATE
USING (auth.uid() = user_id);

-- Users can only delete their own words
CREATE POLICY "Users can delete own words"
ON words FOR DELETE
USING (auth.uid() = user_id);
```

Repeat similar policies for `review_sessions`, `generated_sentences`, and `tags` tables.

## Available Scripts

```bash
# Development
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:generate  # Generate migrations from schema
npm run db:migrate   # Run migrations
npm run db:push      # Push schema changes directly (no migrations)
npm run db:studio    # Open Drizzle Studio (visual database browser)
```

## Project Structure

```
web/
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── api/              # API routes
│   │   │   └── words/        # Word capture & retrieval endpoints
│   │   ├── auth/             # Authentication pages (TODO)
│   │   ├── capture/          # Phrase capture page
│   │   ├── notebook/         # Notebook/browse page
│   │   ├── progress/         # Progress dashboard
│   │   ├── review/           # Review session pages
│   │   ├── layout.tsx        # Root layout with navigation
│   │   ├── page.tsx          # Home page
│   │   └── globals.css       # Global styles & design system
│   ├── components/           # React components
│   │   ├── brand/            # Brand widget
│   │   ├── capture/          # Capture form components
│   │   ├── home/             # Home page components
│   │   ├── navigation/       # Bottom nav & FAB
│   │   ├── notebook/         # Notebook components
│   │   ├── progress/         # Progress components
│   │   ├── providers/        # Context providers (auth)
│   │   ├── review/           # Review components
│   │   └── ui/               # shadcn/ui base components
│   └── lib/                  # Utility libraries
│       ├── audio/            # TTS generation & storage
│       ├── db/               # Database schema & connection
│       │   └── schema/       # Drizzle schema definitions
│       ├── store/            # Zustand state stores
│       ├── supabase/         # Supabase client setup
│       └── utils.ts          # Utility functions
├── drizzle/                  # Generated migrations (gitignored)
├── drizzle.config.ts         # Drizzle configuration
├── package.json              # Dependencies & scripts
├── .env.local                # Environment variables (gitignored)
└── .env.local.example        # Example environment file
```

## Current Implementation Status

### ✅ Completed (Phase 1 - Epic 0 & Epic 1)

**Foundation:**
- Database schema with Drizzle ORM (words, sessions, sentences, tags)
- Supabase authentication setup
- Environment configuration
- Zustand state management stores (auth, words, review, UI)

**Word Capture:**
- POST /api/words - Capture word with auto-translation, category, audio
- GET /api/words - List words with filtering
- GET /api/words/:id - Get single word
- PUT /api/words/:id - Update word
- DELETE /api/words/:id - Delete word
- OpenAI TTS integration for audio generation
- Supabase Storage for audio file hosting
- Frontend capture form connected to API

**UI:**
- Complete Moleskine design system
- All 7 pages styled and responsive
- 25+ UI components

### 🚧 To-Do (Phase 1 Remaining)

**Authentication:**
- [ ] Sign-up page (`/auth/sign-up`)
- [ ] Sign-in page (`/auth/sign-in`)
- [ ] OAuth callback handler
- [ ] Protected route middleware (configured but needs testing)

**Home Page Integration:**
- [ ] Fetch and display real captured words
- [ ] Audio playback component
- [ ] Real-time stats (captured, reviewed, streak)

**Testing:**
- [ ] Test word capture flow end-to-end
- [ ] Test audio generation and playback
- [ ] Test authentication flow

### 📋 Next Phases (Weeks 4-8)

**Phase 2: Dynamic Sentence Generation** (Weeks 4-5)
- Word-matching algorithm (2-4 related words)
- GPT-4 sentence generation
- Batch pre-generation system
- GET /api/sentences/next endpoint

**Phase 3: FSRS Review System** (Weeks 5-7)
- Install ts-fsrs library
- POST /api/reviews/complete endpoint
- Review session management (2-hour rule)
- Mastery tracking (3 correct recalls)
- Connect review UI to API

**Phase 4: Polish & Launch** (Week 8)
- Bug fixes and optimization
- Audio playback <1s on mobile
- PWA configuration (offline, install)
- User testing and feedback

## API Endpoints

### Words

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/words` | Capture new word/phrase |
| GET | `/api/words` | List words (with filters) |
| GET | `/api/words/:id` | Get single word |
| PUT | `/api/words/:id` | Update word |
| DELETE | `/api/words/:id` | Delete word |

### Reviews (TODO - Phase 3)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reviews/due` | Get words due for review |
| POST | `/api/reviews/complete` | Submit review rating |
| POST | `/api/reviews/end` | End review session |

### Sentences (TODO - Phase 2)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sentences/generate` | Trigger batch generation |
| GET | `/api/sentences/next` | Get next sentence for review |

## Database Schema

See `/src/lib/db/schema/` for complete schema definitions.

**Key Entities:**
- **Word**: Captured phrases with FSRS parameters
- **ReviewSession**: Session boundaries for mastery tracking
- **GeneratedSentence**: Mixed-practice sentences (2-4 words)
- **Tag**: User-defined tags for organization

## Cost Estimates (MVP)

**OpenAI API:**
- Translation: ~$0.15 per 1M tokens (GPT-4o-mini)
- TTS: $15 per 1M characters
- Estimated: $0.02-0.05 per captured word

**Supabase:**
- Free tier: 500MB database, 1GB storage, unlimited API requests
- Pro tier: $25/month (if exceeding free limits)

**Total Monthly Cost (100 active users, 50 captures/month each):**
- OpenAI: ~$100-250
- Supabase: $0 (free tier) or $25 (pro)
- **Total: $100-275/month**

## Troubleshooting

### Database Connection Issues

**Error: "Failed to connect to database"**

Solution:
1. Check DATABASE_URL is correct
2. Ensure database password has no special characters that need URL encoding
3. Test connection: `npm run db:studio`

### Supabase Auth Issues

**Error: "Missing Supabase environment variables"**

Solution:
1. Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set
2. Ensure .env.local is in the `web/` directory (not project root)
3. Restart dev server after changing environment variables

### Audio Generation Failures

**Error: "Failed to generate audio"**

Solution:
1. Check OPENAI_API_KEY is valid
2. Verify OpenAI account has available credits
3. Test TTS API directly: https://platform.openai.com/docs/guides/text-to-speech

### Build Errors

**Error: Type errors in components**

Solution:
1. Ensure all dependencies installed: `npm install`
2. Check TypeScript version: `npm list typescript`
3. Clear .next cache: `rm -rf .next && npm run dev`

## Documentation References

- **Implementation Plan**: `/docs/engineering/implementation_plan.md`
- **FSRS Algorithm**: `/docs/engineering/FSRS_IMPLEMENTATION.md`
- **Next Phase Plan**: `/docs/engineering/NEXT_IMPLEMENTATION_PHASE.md`
- **PRD**: `/docs/product/prd.md`
- **Design System**: `/docs/design/design-system.md`

## Support

For issues or questions:
1. Check existing documentation in `/docs/`
2. Review implementation plan for architecture decisions
3. Open an issue on GitHub

---

**Built with ❤️ for language learners who want to remember what they learn.**
