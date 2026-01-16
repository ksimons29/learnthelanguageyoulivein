# Authentication & Monetization Plan

## Target User Analysis

**Who they are:**
- Adults living/working abroad (expats, international professionals, students)
- Already motivated to learn (not casual learners)
- Tech-savvy (use phones/laptops daily)
- Willing to pay for tools that work
- Value time efficiency over gamification

**Key insight:** These users are *already trying* language apps. They're frustrated with generic content. They'll pay for something that actually helps them remember real-life phrases.

---

## Recommended Authentication Strategy

### Auth Methods (Priority Order)

| Method | Recommendation | Reasoning |
|--------|---------------|-----------|
| **Email + Password** | ✅ Essential | Universal, works everywhere |
| **Google Sign-In** | ✅ Highly Recommended | Professionals use Google; 1-click signup |
| **Apple Sign-In** | ✅ Add Now | Required for iOS App Store (V2); Apple users expect it |
| **Magic Link** | ⏸️ Later | Nice-to-have, but adds complexity |

**My recommendation:** Start with **Email + Password + Google + Apple**

- Google: Highest conversion for professionals
- Apple: Required for iOS anyway, and adds trust
- Email: Fallback for users who don't want social login

### Why This Combination?

1. **Low friction**: Google/Apple = one click
2. **Future-proof**: Apple Sign-In ready for iOS V2
3. **Trust**: Multiple options signal legitimacy
4. **Fallback**: Email for privacy-conscious users

---

## Recommended Signup Flow

### Two-Step Process (Higher Conversion)

**Step 1: Account Creation (Minimal)**
```
┌─────────────────────────────────────┐
│                                     │
│   [Google Icon] Continue with Google│
│   [Apple Icon]  Continue with Apple │
│                                     │
│   ─────────── or ───────────        │
│                                     │
│   Email: [________________]         │
│   Password: [______________]        │
│                                     │
│   [Create Account]                  │
│                                     │
│   Already have an account? Sign in  │
└─────────────────────────────────────┘
```

**Step 2: Onboarding (After Account Created)**
```
┌─────────────────────────────────────┐
│   Let's personalize your learning   │
│                                     │
│   I already speak:                  │
│   [English ▼]                       │
│                                     │
│   I'm learning:                     │
│   [Portuguese (Portugal) ▼]         │
│                                     │
│   Why are you learning?             │
│   ○ Living here permanently         │
│   ○ Working here temporarily        │
│   ○ Partner/family speaks it        │
│   ○ Planning to move here           │
│   ○ Travel & culture                │
│   ○ Other                           │
│                                     │
│   [Start Capturing Phrases →]       │
└─────────────────────────────────────┘
```

### Why Two Steps?

1. **Reduces initial friction**: Just email to start
2. **Captures email first**: Even if they abandon onboarding, you have their email
3. **Personalization feels valuable**: Not a barrier, but a benefit
4. **Learning reason = marketing gold**: Segment users for targeted messaging

---

## Recommended: Allow Limited Guest Access

### "Try Before Signup" Flow

**Recommendation:** Allow **5 word captures** before requiring signup.

```
User lands on app
    ↓
Can immediately capture a phrase (no signup)
    ↓
Word saved to localStorage (temporary)
    ↓
After 5 words: "Create account to save your progress"
    ↓
Signup → words migrate to their account
```

### Why Guest Access?

1. **Higher conversion**: Users experience value before committing
2. **Lower bounce rate**: No "signup wall" on first visit
3. **Viral potential**: "I captured 3 words already!" → shares with friends
4. **Trust building**: Shows you're confident in the product

### Implementation Notes

- Store guest words in `localStorage`
- Track guest session with anonymous ID
- On signup, migrate words to user account
- Show progress: "3 of 5 free captures used"

---

## Monetization Options Analysis

### Option A: Freemium (Recommended)

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | 50 words, 10 reviews/day, basic TTS |
| **Pro** | $9.99/mo | Unlimited words, unlimited reviews, HD TTS, sentence generation |
| **Annual** | $79.99/yr | Same as Pro, 33% discount |

**Pros:**
- Low barrier to entry
- Users see value before paying
- Predictable recurring revenue
- Works well with your target audience (busy professionals will pay to remove limits)

**Cons:**
- Free users cost money (TTS API)
- Need to carefully balance free limits

### Option B: Free Trial → Paid

| Phase | Duration | Features |
|-------|----------|----------|
| **Trial** | 14 days | Full access to everything |
| **After Trial** | - | Must subscribe to continue |

**Pros:**
- Full experience during trial = higher conversion
- No "teaser" version to maintain

**Cons:**
- Higher initial cost (full TTS for all trial users)
- Users may feel "tricked" when trial ends
- Harder to re-engage churned users

### Option C: Feature-Gated Free

| Tier | Features |
|------|----------|
| **Free Forever** | Unlimited words, basic review (no TTS, no sentences) |
| **Premium** | TTS audio, smart sentences, advanced analytics |

**Pros:**
- Very low barrier
- Clear value proposition for premium

**Cons:**
- Free tier lacks key differentiator (audio!)
- May train users that audio isn't essential

---

## My Recommendation: Freemium (Option A)

**Why it fits your app:**

1. **Target users will pay**: Expats/professionals value their time and will pay $10/mo for a tool that works
2. **Audio is expensive**: TTS costs ~$0.02/word, so free limits protect margins
3. **Clear upgrade path**: "You've captured 50 words! Upgrade for unlimited"
4. **Trial within free**: Users can fully evaluate with 50 words before deciding

### Suggested Limits

| Feature | Free | Pro |
|---------|------|-----|
| Word captures | 50 total | Unlimited |
| Reviews per day | 10 | Unlimited |
| TTS audio | Standard quality | HD quality |
| Sentence generation | ❌ | ✅ |
| Categories | 3 | Unlimited |
| Export data | ❌ | ✅ |
| Priority support | ❌ | ✅ |

---

## "Reason for Learning" Categories

Based on your user research, here are suggested categories:

```typescript
const LEARNING_REASONS = [
  {
    id: 'living_permanent',
    label: 'Living here permanently',
    description: 'Moved here and want to integrate',
    icon: '🏠',
  },
  {
    id: 'working_temporary',
    label: 'Working here temporarily',
    description: 'Here for work, 1-3 years',
    icon: '💼',
  },
  {
    id: 'partner_family',
    label: 'Partner or family speaks it',
    description: 'Want to communicate with loved ones',
    icon: '❤️',
  },
  {
    id: 'planning_move',
    label: 'Planning to move here',
    description: 'Preparing before relocating',
    icon: '✈️',
  },
  {
    id: 'travel_culture',
    label: 'Travel & culture',
    description: 'Love the country and language',
    icon: '🌍',
  },
  {
    id: 'professional_growth',
    label: 'Career advancement',
    description: 'Need it for work opportunities',
    icon: '📈',
  },
  {
    id: 'other',
    label: 'Other reason',
    description: 'Something else entirely',
    icon: '✨',
  },
];
```

### Why Track This?

1. **Personalization**: "As someone living here permanently, you might like..."
2. **Marketing segments**: Different messaging for expats vs. travelers
3. **Product insights**: Which user types retain best?
4. **Content suggestions**: Expats need bureaucracy words, travelers need restaurant words

---

## Database Schema Additions

```sql
-- Add to existing users table or create profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Language preferences
  native_language TEXT NOT NULL DEFAULT 'en',
  target_language TEXT NOT NULL DEFAULT 'pt-PT',

  -- Learning context
  learning_reason TEXT, -- 'living_permanent', 'working_temporary', etc.

  -- Subscription
  subscription_tier TEXT NOT NULL DEFAULT 'free', -- 'free', 'pro', 'trial'
  subscription_started_at TIMESTAMP,
  subscription_ends_at TIMESTAMP,
  trial_ends_at TIMESTAMP,

  -- Usage tracking
  words_captured_count INTEGER NOT NULL DEFAULT 0,
  reviews_today_count INTEGER NOT NULL DEFAULT 0,
  last_review_date DATE,

  -- Metadata
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),

  UNIQUE(user_id)
);

-- Index for subscription queries
CREATE INDEX idx_user_profiles_subscription ON user_profiles(subscription_tier, subscription_ends_at);
```

---

## UI Design Direction (Moleskine Style)

### Sign Up Page

Following the Moleskine aesthetic:

```
┌─────────────────────────────────────────────────────────┐
│  ░░░░░░░░░░░░░░ (paper grain texture) ░░░░░░░░░░░░░░░  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ╔══════════════════════════════════════════════╗│   │
│  │ ║                                              ║│   │
│  │ ║   📖 Learn the Language You Live In         ║│   │
│  │ ║                                              ║│   │
│  │ ║   Remember real phrases from your daily     ║│   │
│  │ ║   life, not textbook examples.              ║│   │
│  │ ║                                              ║│   │
│  │ ║   ┌─────────────────────────────────────┐   ║│   │
│  │ ║   │ 🔵 Continue with Google             │   ║│   │
│  │ ║   └─────────────────────────────────────┘   ║│   │
│  │ ║   ┌─────────────────────────────────────┐   ║│   │
│  │ ║   │ 🍎 Continue with Apple              │   ║│   │
│  │ ║   └─────────────────────────────────────┘   ║│   │
│  │ ║                                              ║│   │
│  │ ║   ──────────── or ────────────              ║│   │
│  │ ║                                              ║│   │
│  │ ║   Email                                      ║│   │
│  │ ║   ┌─────────────────────────────────────┐   ║│   │
│  │ ║   │                                     │   ║│   │
│  │ ║   └─────────────────────────────────────┘   ║│   │
│  │ ║   Password                                   ║│   │
│  │ ║   ┌─────────────────────────────────────┐   ║│   │
│  │ ║   │                                     │   ║│   │
│  │ ║   └─────────────────────────────────────┘   ║│   │
│  │ ║                                              ║│   │
│  │ ║   ┌─────────────────────────────────────┐   ║│   │
│  │ ║   │      Create Account (coral btn)     │   ║│   │
│  │ ║   └─────────────────────────────────────┘   ║│   │
│  │ ║                                              ║│   │
│  │ ║   Already have an account? Sign in          ║│   │
│  │ ╚══════════════════════════════════════════════╝│   │
│  │ │ (stitched binding edge)                      │   │
│  └─│──────────────────────────────────────────────┘   │
│    │ (coral ribbon bookmark accent)                    │
└────│───────────────────────────────────────────────────┘
```

### Design Elements

- **Paper texture background**: Cream with subtle grain
- **Card with stitched binding**: Left edge has notebook stitching
- **Coral ribbon accent**: One prominent coral element
- **Serif headings**: For the "Learn the Language" title
- **Sans-serif body**: For form labels and buttons
- **Rounded corners on right**: Like notebook pages

---

## Implementation Order

### Phase 1: Basic Auth (This Session)
1. Sign-up page (email + password)
2. Sign-in page
3. Password reset
4. Protected routes working

### Phase 2: Social Auth (Next Session)
1. Google Sign-In integration
2. Apple Sign-In integration
3. Account linking (if user signs up email, then tries Google)

### Phase 3: Onboarding (After Auth)
1. Language selection screen
2. Learning reason selection
3. First word capture tutorial
4. User profile storage

### Phase 4: Monetization (Later)
1. Stripe integration
2. Subscription management
3. Usage limits enforcement
4. Upgrade prompts

---

## Questions to Confirm

Before I start building, please confirm:

1. **Auth methods**: Start with Email + Password, add Google/Apple in Phase 2?
2. **Guest access**: Allow 5 word captures before signup?
3. **Monetization**: Freemium model sounds right?
4. **Learning reasons**: Categories above look good?
5. **Onboarding**: Two-step (signup → onboarding) approach?

---

## Next Steps

Once you confirm, I'll:

1. Create the database schema for user profiles
2. Build sign-up page with Moleskine design
3. Build sign-in page
4. Set up Supabase Auth providers
5. Create onboarding flow
6. Implement protected routes

Ready when you are! 🚀
