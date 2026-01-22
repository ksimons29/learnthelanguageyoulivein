# LLYLI Go-Live Documentation

> **Learn the Language You Live In** - Turn real-life phrases into lasting memories

This documentation covers everything you need to know for the LLYLI app launch, including the complete user journey, data security, and presentation materials.

---

## Quick Links

- [PowerPoint Presentation](./LLYLI-App-Journey.pptx) - Full slide deck with speaker notes
- [Technical Details](./GO_LIVE_PREPARATION.md) - Security and data persistence documentation
- [Screenshots](#app-journey-screenshots) - All app screens with descriptions

---

## Table of Contents

1. [Account Security & Data Safety](#account-security--data-safety)
2. [The Complete User Journey](#the-complete-user-journey)
3. [Daily Usage Guide](#daily-usage-guide)
4. [App Features Summary](#app-features-summary)

---

## Account Security & Data Safety

### Your Data is Safe

LLYLI uses **Supabase Authentication**, an industry-standard security system. Here's what that means for users:

| Security Feature | What It Means |
|------------------|---------------|
| **Encrypted Passwords** | Passwords are never stored in plain text - they're securely hashed |
| **Secure Sessions** | Login sessions use encrypted tokens that automatically refresh |
| **Data Isolation** | Users can only see their own data - no access to others' phrases |
| **Cloud Backup** | All progress is stored in the cloud, not just on your device |
| **HTTPS Encryption** | All data is encrypted during transmission |

### What Gets Saved

When you create an account, LLYLI securely stores:

- Your language preferences
- All captured phrases with translations
- Native speaker audio files
- Learning progress and review history
- Spaced repetition scheduling data

**Your progress syncs automatically** - lose your phone, get a new device, or switch between web and mobile - your vocabulary is always there.

---

## The Complete User Journey

### Step 1: Create Your Account

<p align="center">
  <img src="./screenshots/07-sign-up.png" alt="Sign Up Page" width="350"/>
</p>

**What happens:**
- Enter your email and create a password (minimum 8 characters)
- Receive a confirmation email
- Your account is created and ready to use

**What users see:**
- Clean, welcoming design with the LLYLI logo
- Clear indication that progress is "securely saved to the cloud"
- Links to Terms of Service and Privacy Policy

---

### Step 2: Choose Your Target Language

<p align="center">
  <img src="./screenshots/08-onboarding-language.png" alt="Language Selection" width="350"/>
</p>

**What happens:**
- Select the language you're immersed in (the one you hear around you)
- Visual flag icons make selection intuitive

**Available languages:**
- English, Portuguese (Portugal), Swedish, Spanish, French, German, Dutch

---

### Step 3: Set Your Native Language

<p align="center">
  <img src="./screenshots/09-onboarding-native.png" alt="Native Language Selection" width="350"/>
</p>

**What happens:**
- Select your mother tongue
- This determines how translations are displayed
- Creates your personal learning direction (e.g., English → Portuguese)

---

### Step 4: Add Your First Words

<p align="center">
  <img src="./screenshots/10-onboarding-capture.png" alt="Initial Word Capture" width="350"/>
</p>

**What happens:**
- Type 3+ words or phrases you've already encountered
- This teaches you the capture workflow
- Progress indicator shows how many more words needed

**Tips for new users:**
- Think of signs you've seen
- Phrases you've heard at shops or cafés
- Words from menus or conversations

---

### Step 5: Your Notebook is Ready!

<p align="center">
  <img src="./screenshots/11-onboarding-complete.png" alt="Onboarding Complete" width="350"/>
</p>

**What happens:**
- Celebration screen shows your starter phrases
- Tap any phrase to hear native speaker pronunciation
- Explanation of sentence generation feature
- "Start Learning" button takes you to the main app

---

## Daily Usage Guide

### The Today Dashboard

<p align="center">
  <img src="./screenshots/01-today-dashboard.png" alt="Today Dashboard" width="350"/>
</p>

Your home screen shows everything at a glance:

- **Capture a Phrase** - Big coral button for quick access
- **Review Due** - Number of phrases waiting for review
- **Captured Today** - All phrases added today with audio playback
- **Today's Progress** - Captured count, daily goal, streak
- **Daily Bingo** - Gamification element for engagement

---

### Capturing Phrases

<p align="center">
  <img src="./screenshots/02-capture-page.png" alt="Capture Page" width="350"/>
</p>

**How to capture:**
1. Tap the **Capture** button (or the floating + button)
2. Type or paste the phrase you encountered
3. Optionally add memory context (where you heard it)
4. Tap **Save to Notebook**

**What happens automatically:**
- Phrase is translated to your native language
- Category is detected (Social, Food & Dining, etc.)
- Native speaker audio is generated
- FSRS scheduling determines when to review

---

### Review Sessions

#### The Question

<p align="center">
  <img src="./screenshots/03-review-question.png" alt="Review Question" width="350"/>
</p>

- See the phrase in your target language
- Hear the audio pronunciation
- Try to recall the meaning
- Tap **Reveal** when ready

#### The Answer

<p align="center">
  <img src="./screenshots/04-review-answer.png" alt="Review Answer" width="350"/>
</p>

- See the translation revealed
- Rate your recall: **Hard**, **Good**, or **Easy**
- This feedback trains the spaced repetition algorithm
- Progress indicator shows cards remaining

**The Science:**
LLYLI uses FSRS-4.5 (Free Spaced Repetition Scheduler), the most advanced spaced repetition algorithm available. It optimizes review timing based on your personal forgetting curve.

---

### Your Notebook

<p align="center">
  <img src="./screenshots/05-notebook.png" alt="Notebook Page" width="350"/>
</p>

**Organization:**
- **Inbox** - New phrases waiting to be organized
- **Categories** - Automatic sorting into 8 categories:
  - Social, Food & Dining, Shopping, Getting Around, Work, Daily Life, Health, Other
- **Search** - Find any phrase quickly
- **Due Indicators** - Numbers show reviews due per category

---

### Track Your Progress

<p align="center">
  <img src="./screenshots/06-progress.png" alt="Progress Page" width="350"/>
</p>

**Metrics shown:**
- **Total** - All phrases in your notebook
- **This Week** - Phrases added recently
- **Mastered** - Phrases you've proven you know (3 correct recalls)
- **Due Today** - Reviews scheduled for today
- **Need Practice** - Phrases marked as difficult
- **Weekly Calendar** - Upcoming review forecast

---

## Daily Routine Recommendation

| Time | Action | Duration |
|------|--------|----------|
| **Morning** | Check Today screen, do review session | 5 minutes |
| **Throughout day** | Capture new phrases as you encounter them | 5 seconds each |
| **Evening** | Check progress, review new due items | 5 minutes |

**The key to success:** Consistency. Capture real phrases from YOUR life, review them at the right time, and watch your vocabulary grow naturally.

---

## App Features Summary

### Core Features

| Feature | Description |
|---------|-------------|
| **Phrase Capture** | Type or paste any word/phrase from your daily life |
| **Auto-Translation** | GPT-4o-mini provides accurate translations |
| **Native Audio** | OpenAI TTS generates authentic pronunciation |
| **Smart Categories** | AI automatically organizes phrases by context |
| **Spaced Repetition** | FSRS-4.5 optimizes review timing |
| **Memory Context** | Record where you heard each phrase |
| **Progress Tracking** | Visualize your learning journey |

### The LLYLI Difference

1. **Real Phrases** - Learn words you actually encounter, not textbook vocabulary
2. **Native Audio** - Hear every phrase spoken correctly
3. **Smart Timing** - FSRS algorithm ensures optimal review scheduling
4. **Context Memory** - Remember where you heard each phrase
5. **Progress Tracking** - Watch your mastery grow over time
6. **Secure & Synced** - Your vocabulary is safe in the cloud

---

## Presentation Materials

### PowerPoint Deck

Download the full presentation: [LLYLI-App-Journey.pptx](./LLYLI-App-Journey.pptx)

**Includes:**
- 13 slides covering the complete user journey
- Speaker notes with full scripts
- Key points for each slide
- LLYLI brand colors and styling

### Screenshots

All screenshots are available in the `screenshots/` folder:

| File | Description |
|------|-------------|
| `01-today-dashboard.png` | Main home screen |
| `02-capture-page.png` | Phrase capture interface |
| `03-review-question.png` | Review mode - question |
| `04-review-answer.png` | Review mode - answer |
| `05-notebook.png` | Notebook browser |
| `06-progress.png` | Progress tracking |
| `07-sign-up.png` | Account creation |
| `08-onboarding-language.png` | Target language selection |
| `09-onboarding-native.png` | Native language selection |
| `10-onboarding-capture.png` | Initial word capture |
| `11-onboarding-complete.png` | Onboarding celebration |

---

## Technical Documentation

For detailed technical information about authentication, database schema, and security implementation, see [GO_LIVE_PREPARATION.md](./GO_LIVE_PREPARATION.md).

---

<p align="center">
  <strong>LLYLI - Learn the Language You Live In</strong><br/>
  <em>Turn real-life phrases into lasting memories</em>
</p>
