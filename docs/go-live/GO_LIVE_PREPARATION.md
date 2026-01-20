# LLYLI Go-Live Preparation

## Part 1: Account Security & Data Persistence

### How User Accounts Work

LLYLI uses **Supabase Authentication**, an industry-standard authentication system built on top of PostgreSQL and JWT (JSON Web Tokens). Here's what users need to know:

#### Account Creation
1. Users sign up with email and password (minimum 8 characters)
2. Email confirmation is sent to verify the account
3. Once confirmed, users complete onboarding to set their language preferences

#### Data Security Guarantees

| Aspect | How It's Protected |
|--------|-------------------|
| **Passwords** | Never stored in plain text. Supabase hashes passwords using bcrypt with automatic salting |
| **Sessions** | Secure HTTP-only cookies with JWT tokens that expire and auto-refresh |
| **Data Isolation** | Every database query filters by user ID - users can only see their own data |
| **Transport** | All data transmitted over HTTPS (TLS encryption) |
| **Storage** | PostgreSQL database hosted on Supabase's secure infrastructure |

#### What Gets Saved to Your Account

| Data Type | Description | Where Stored |
|-----------|-------------|--------------|
| **Profile** | Display name, language preferences, subscription tier | `user_profiles` table |
| **Phrases** | All captured words with translations and audio | `words` table |
| **Progress** | FSRS spaced repetition data, mastery status | `words` table |
| **Review History** | Session records, recall performance | `review_sessions` table |
| **Audio Files** | TTS recordings for each phrase | Supabase Storage |

#### Data Persistence Assurance

- **Cloud-synced**: All data is stored in the cloud, not just on your device
- **Cross-device**: Sign in on any device to access your full vocabulary
- **Automatic saves**: Every phrase capture and review is saved immediately
- **No data loss**: Even if you lose your phone, your learning progress is safe

---

## Part 2: App Journey Presentation

### Slide Deck with Script

---

## SLIDE 1: Welcome to LLYLI

**[Screenshot: Sign-up page - 07-sign-up.png]**

### Script:
> "Welcome to LLYLI - Learn the Language You Live In. This app helps you remember real phrases from your daily life. Let's walk through how it works.
>
> Getting started is simple - just create an account with your email. Your account keeps all your phrases and progress safe in the cloud, so you can access them from any device."

**Key Points:**
- Simple email/password sign-up
- Account stores everything securely
- Terms of Service and Privacy Policy linked

---

## SLIDE 2: Choose Your Languages

**[Screenshot: Onboarding language selection - 08-onboarding-language.png]**

### Script:
> "First, tell us what language fills your days - the one you hear on streets, in shops, on signs. This is the language you want to learn."

**Key Points:**
- Select the language you're immersed in
- Currently supports: English, Portuguese, Swedish, Spanish, French, German, Dutch

---

## SLIDE 3: Set Your Native Language

**[Screenshot: Onboarding native language - 09-onboarding-native.png]**

### Script:
> "Next, select your mother tongue. LLYLI will translate everything into this language, so explanations feel like home."

**Key Points:**
- Translations appear in your native language
- Creates your personal learning direction (e.g., English → Portuguese)

---

## SLIDE 4: Add Your First Words

**[Screenshot: Onboarding capture - 10-onboarding-capture.png]**

### Script:
> "Now add some words you've already encountered. Seen something on a sign? Heard a phrase at a café? Type it in! The app asks for just 3 words to get started."

**Key Points:**
- Type any word or phrase you've encountered
- Minimum 3 words to proceed
- This teaches you how to use the capture feature

---

## SLIDE 5: Your Notebook is Ready

**[Screenshot: Onboarding complete - 11-onboarding-complete.png]**

### Script:
> "Your personal notebook is ready! We've added some essential phrases to help you get started. Tap any phrase to hear it spoken by a native speaker. During reviews, the app will create sentences using YOUR words to help you remember them in context."

**Key Points:**
- Starter phrases pre-loaded
- Audio playback for pronunciation
- Personalized sentence generation using your vocabulary

---

## SLIDE 6: Your Daily Dashboard

**[Screenshot: Today page - 01-today-dashboard.png]**

### Script:
> "This is your daily home screen. At a glance, you can see what you captured today, how many phrases are due for review, and your daily progress. The 'Capture a Phrase' button is always prominently available."

**Key Points:**
- Quick access to capture and review
- Shows phrases captured today
- Progress tracking (captured, goal, streak)
- Daily Bingo for gamification

---

## SLIDE 7: Capturing Phrases

**[Screenshot: Capture page - 02-capture-page.png]**

### Script:
> "Whenever you encounter a new word or phrase, tap Capture. Type it in - it can be something you saw on a menu, heard in conversation, or read on a sign. The app automatically translates it, categorizes it, and generates native speaker audio."

**Key Points:**
- Type or paste any phrase
- Camera button for future OCR feature
- Voice input button for dictation
- "Add memory context" to remember where you heard it
- Auto-translation and audio generation

---

## SLIDE 8: The Review Experience (Question)

**[Screenshot: Review question - 03-review-question.png]**

### Script:
> "When phrases are due for review, tap 'Review Due' to start a session. You'll see the phrase and hear the audio. Try to recall the meaning before revealing the answer."

**Key Points:**
- Shows progress (1 of 8)
- Audio playback available
- Simple "Reveal" interaction
- FSRS algorithm schedules optimal review times

---

## SLIDE 9: The Review Experience (Answer)

**[Screenshot: Review answer - 04-review-answer.png]**

### Script:
> "After revealing the answer, rate how well you remembered: Hard, Good, or Easy. This feedback trains the spaced repetition algorithm to show you phrases at exactly the right time - not too soon, not too late."

**Key Points:**
- Three simple recall ratings
- FSRS-4.5 algorithm optimizes timing
- "3 correct recalls" rule for mastery
- Report button for issues

---

## SLIDE 10: Your Notebook

**[Screenshot: Notebook page - 05-notebook.png]**

### Script:
> "Your Notebook organizes all your phrases by category. See your Inbox for new untagged phrases, or browse by category - Social, Food & Dining, Shopping, Getting Around. The numbers show how many phrases are due for review in each category."

**Key Points:**
- Inbox for organization
- 8 automatic categories
- Search functionality
- Due indicators per category

---

## SLIDE 11: Track Your Progress

**[Screenshot: Progress page - 06-progress.png]**

### Script:
> "The Progress page shows your learning journey at a glance. See your total phrases, this week's activity, and how many you've mastered. The upcoming calendar shows when reviews are scheduled throughout the week."

**Key Points:**
- Total/weekly/mastered counts
- Due today and need practice indicators
- Weekly forecast calendar
- Quick access to start review

---

## SLIDE 12: Daily Usage Summary

### Script:
> "Here's your daily routine with LLYLI:
>
> **Morning**: Check the Today screen. See what's due for review. Do a quick 5-minute review session.
>
> **Throughout the day**: When you encounter a new word - at a café, in a meeting, on a sign - capture it immediately. Takes 5 seconds.
>
> **Evening**: Check your progress, review any new due items, browse your notebook.
>
> The key is consistency: capture real phrases from YOUR life, review them at the right time, and watch your vocabulary grow naturally."

**Key Points:**
- Morning: Review due phrases
- Daytime: Capture new encounters
- Evening: Check progress
- Consistency is key

---

## Summary: The LLYLI Promise

1. **Real Phrases**: Learn words you actually encounter, not textbook vocabulary
2. **Native Audio**: Hear every phrase spoken correctly
3. **Smart Timing**: FSRS algorithm ensures optimal review scheduling
4. **Context Memory**: Remember where you heard each phrase
5. **Progress Tracking**: Watch your mastery grow over time
6. **Secure & Synced**: Your vocabulary is safe in the cloud

---

## Technical Appendix: Data Security Details

For users who want to understand the technical details:

### Authentication Flow
```
1. User enters email + password
2. Supabase validates and creates session
3. JWT token issued, stored in secure HTTP-only cookie
4. Token auto-refreshes on each request
5. All API calls verify token before accessing data
```

### Data Isolation Pattern
```typescript
// Every database query includes user ID filter
const words = await db
  .select()
  .from(wordsTable)
  .where(eq(wordsTable.userId, currentUser.id))
```

### Storage Architecture
- **Database**: PostgreSQL on Supabase (same security as enterprise databases)
- **Audio Files**: Supabase Storage with authenticated access
- **Backups**: Automatic daily backups by Supabase

### Privacy Compliance
- Email used only for authentication
- No data sold to third parties
- User can request data deletion
- Terms of Service and Privacy Policy available at `/terms` and `/privacy`
