# LLYLI App Summary & Anki Import Guide

## What is LLYLI?

**LLYLI** (Learn the Language You Live In) is a spaced repetition web app designed for adults living/working in a country where they need to learn the local language. Unlike traditional flashcard apps (like Anki), LLYLI focuses on:

1. **Real-life phrase capture** - Users capture words/phrases from daily life (text, WhatsApp, emails, signs)
2. **Native audio pronunciation** - Every word gets high-quality TTS audio in the target language
3. **Dynamic sentence generation** - Reviews combine 2-4 related words into novel sentences (never repeated)
4. **FSRS scheduling** - Advanced spaced repetition algorithm that adapts to individual forgetting curves
5. **Mastery tracking** - Words reach "ready to use" status after 3 correct recalls across 3 separate sessions

---

## How LLYLI Generates and Saves Words

### 1. Word Capture Flow

```
User Input (text)
  → Auto-detect language (source or target)
  → OpenAI GPT-4o-mini translates
  → OpenAI TTS generates audio (MP3, 128kbps, 44.1kHz)
  → Auto-assign category (food, work, social, etc.)
  → Save to database with FSRS initial parameters
```

### 2. Word Storage Format

Each word is stored with:

**Core Content:**
- Original text (the phrase captured)
- Translation (auto-generated)
- Language (source or target)
- Audio URL (link to MP3 file in Supabase Storage)

**Categorization:**
- Category (food, work, home, transport, health, social, bureaucracy, greetings, other)
- Category confidence score (0-1)
- User-defined tags (optional)

**FSRS Parameters (for scheduling):**
- Difficulty (0-10): How hard to increase memory stability
- Stability (days): Days until retrievability drops to 90%
- Retrievability (0-1): Current probability of successful recall
- Next review date: FSRS-calculated next review
- Last review date
- Review count: Total reviews
- Lapse count: Times forgotten

**Mastery Tracking:**
- Consecutive correct sessions (0-3)
- Mastery status: `learning` | `learned` | `ready_to_use`

### 3. Review System

**FSRS Algorithm:**
- Uses forgetting curve: `R(t) = (1 + t/(9·S))^(-1)` where R = retrievability, t = days since review, S = stability
- Word is "due" when retrievability < 90%
- After each review, FSRS recalculates difficulty, stability, and next review date

**Session Management:**
- Sessions expire after 2 hours of inactivity
- Mastery requires 3 correct recalls across 3 different sessions (prevents gaming)

**Rating Scale (1-4):**
- 1 (Again): Complete blackout, wrong answer
- 2 (Hard): Correct but very difficult
- 3 (Good): Correct with normal effort
- 4 (Easy): Trivially easy

---

## Anki Import Data Format

### Required Fields for LLYLI Import

To transfer words FROM Anki INTO LLYLI, you need to map Anki fields to LLYLI's format. Here's what LLYLI expects:

#### Minimum Required Fields

| LLYLI Field | Type | Required | Description | Anki Equivalent |
|-------------|------|----------|-------------|-----------------|
| `originalText` | string | ✅ Yes | The phrase/word in target language | Front of card (target language) |
| `translation` | string | ✅ Yes | Translation in native language | Back of card (native language) |
| `language` | enum | ✅ Yes | Either `source` or `target` | Manual mapping based on deck |
| `userId` | uuid | ✅ Yes | User ID from authentication | Generated on import |

#### Optional Fields (Recommended)

| LLYLI Field | Type | Default | Description | Anki Equivalent |
|-------------|------|---------|-------------|-----------------|
| `category` | string | `other` | Category tag | Anki tags (map to LLYLI categories) |
| `audioUrl` | string | `null` | Audio file URL | Anki media file (upload to LLYLI storage) |
| `createdAt` | timestamp | now() | When word was captured | Card creation date |

#### FSRS Parameters (Optional - for Advanced Import)

If you want to preserve Anki's scheduling data, you can map these fields:

| LLYLI Field | Type | Default | Anki Equivalent |
|-------------|------|---------|-----------------|
| `difficulty` | float | 5.0 | Can calculate from Anki's "Ease Factor" |
| `stability` | float | 1.0 | Can estimate from Anki's interval |
| `nextReviewDate` | timestamp | now() | Anki's "Due" date |
| `lastReviewDate` | timestamp | `null` | Last review timestamp |
| `reviewCount` | integer | 0 | Anki's review count |
| `lapseCount` | integer | 0 | Anki's lapse count |

**Note:** FSRS parameters work differently than Anki's SM-2 algorithm. It's often better to let LLYLI recalculate from scratch.

---

## Import Formats

### Format 1: CSV (Simplest)

```csv
originalText,translation,language,category
"Bom dia",Good morning,target,greetings
"Preciso de uma fatura",I need an invoice,target,bureaucracy
"Onde fica a estação?",Where is the station?,target,transport
```

### Format 2: JSON (Full Featured)

```json
[
  {
    "originalText": "Bom dia",
    "translation": "Good morning",
    "language": "target",
    "category": "greetings",
    "createdAt": "2026-01-10T08:00:00Z",
    "reviewCount": 5,
    "lapseCount": 0
  },
  {
    "originalText": "Preciso de uma fatura",
    "translation": "I need an invoice",
    "language": "target",
    "category": "bureaucracy",
    "createdAt": "2026-01-12T14:30:00Z",
    "reviewCount": 2,
    "lapseCount": 1
  }
]
```

---

## Database Schema (PostgreSQL)

```sql
CREATE TABLE words (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys
  user_id UUID NOT NULL,

  -- Word Content
  original_text TEXT NOT NULL,           -- The captured phrase
  translation TEXT NOT NULL,             -- Auto-generated translation
  language TEXT NOT NULL                 -- 'source' or 'target'
    CHECK (language IN ('source', 'target')),
  audio_url TEXT,                        -- Supabase Storage URL for TTS

  -- Categorization
  category TEXT NOT NULL DEFAULT 'other', -- food, work, home, etc.
  category_confidence REAL NOT NULL DEFAULT 0.5, -- LLM confidence (0-1)

  -- FSRS Parameters (Free Spaced Repetition Scheduler)
  difficulty REAL NOT NULL DEFAULT 5.0,  -- How hard to increase stability (0-10)
  stability REAL NOT NULL DEFAULT 1.0,   -- Days until 90% retrievability
  retrievability REAL NOT NULL DEFAULT 1.0, -- Probability of recall (0-1)
  next_review_date TIMESTAMP NOT NULL DEFAULT NOW(),
  last_review_date TIMESTAMP,
  review_count INTEGER NOT NULL DEFAULT 0,
  lapse_count INTEGER NOT NULL DEFAULT 0, -- Times forgotten (rating = 1)

  -- Mastery Tracking (3 Correct Recalls Rule)
  consecutive_correct_sessions INTEGER NOT NULL DEFAULT 0,
  last_correct_session_id UUID,
  mastery_status TEXT NOT NULL DEFAULT 'learning'
    CHECK (mastery_status IN ('learning', 'learned', 'ready_to_use')),

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_words_user_id ON words(user_id);
CREATE INDEX idx_words_next_review ON words(next_review_date);
CREATE INDEX idx_words_category ON words(category);
CREATE INDEX idx_words_mastery ON words(mastery_status);
```

---

## Category Mapping Guide

LLYLI uses 9 predefined categories. Map your Anki tags to these:

| LLYLI Category | Examples | Anki Tags to Map |
|----------------|----------|------------------|
| `food` | Restaurant, cooking, ingredients | food, restaurant, cooking |
| `work` | Office, meetings, emails | work, business, office |
| `home` | Furniture, repairs, cleaning | home, house, apartment |
| `transport` | Bus, taxi, directions | transport, travel, directions |
| `health` | Doctor, pharmacy, symptoms | health, medical, doctor |
| `social` | Friends, parties, greetings | social, friends, conversation |
| `bureaucracy` | Documents, government, forms | bureaucracy, official, documents |
| `greetings` | Hello, goodbye, thank you | greetings, politeness |
| `other` | Everything else | (default fallback) |

---

## Import Process Recommendations

### Step 1: Export from Anki

1. In Anki: File → Export → Notes in Plain Text
2. Include: Front, Back, Tags, Created (optional)
3. Format: CSV or JSON

### Step 2: Transform Data

Map Anki fields to LLYLI format:

```javascript
// Example transformation
const ankiCard = {
  front: "Bom dia",        // Portuguese (target)
  back: "Good morning",    // English (source)
  tags: "greetings basic",
  created: "2025-01-10"
};

const llyliWord = {
  originalText: ankiCard.front,      // Target language on front
  translation: ankiCard.back,        // Native language on back
  language: "target",                // Assuming front is target
  category: mapTagToCategory(ankiCard.tags), // Map to LLYLI category
  createdAt: ankiCard.created,
  // Let LLYLI generate fresh FSRS parameters
  difficulty: 5.0,
  stability: 1.0,
  retrievability: 1.0,
  nextReviewDate: new Date(),        // Start fresh
  reviewCount: 0,
  lapseCount: 0
};
```

### Step 3: Import to LLYLI

Use the LLYLI API:

```bash
# Bulk import endpoint (to be created)
POST /api/words/import
Content-Type: application/json

{
  "words": [
    {
      "originalText": "Bom dia",
      "translation": "Good morning",
      "language": "target",
      "category": "greetings"
    },
    // ... more words
  ],
  "generateAudio": true  // Optional: generate TTS audio on import
}
```

---

## Key Differences: Anki vs. LLYLI

| Feature | Anki | LLYLI |
|---------|------|-------|
| **Card Format** | Static front/back pairs | Dynamic sentences combining 2-4 words |
| **Scheduling** | SM-2 algorithm (fixed intervals) | FSRS algorithm (adaptive forgetting curve) |
| **Audio** | Manual audio files | Auto-generated TTS for every word |
| **Categories** | User-defined tags (unlimited) | 9 predefined categories (auto-assigned) |
| **Mastery** | Based on ease factor | 3 correct recalls across 3 sessions |
| **Platform** | Desktop + mobile apps | Web-first (mobile responsive) |
| **Sentence Reuse** | Same example sentence repeated | Each sentence used only once |

---

## Audio Generation

LLYLI automatically generates audio for every word using:

- **TTS Provider:** OpenAI TTS (voices: `nova` for Portuguese, `alloy` for English)
- **Format:** MP3, 128kbps, 44.1kHz
- **Storage:** Supabase Storage with CDN
- **Naming:** `{userId}/{wordId}.mp3`

**If importing from Anki:**
- Option 1: Let LLYLI generate fresh audio (recommended)
- Option 2: Upload Anki audio files to Supabase Storage and provide URLs

---

## Next Steps

1. **Export your Anki deck** to CSV or JSON
2. **Map fields** using the tables above
3. **Create import script** or use LLYLI's bulk import API (to be built)
4. **Test with small batch** (10-20 words) before full import
5. **Verify audio generation** and FSRS scheduling work correctly

---

## Questions?

For technical support or import assistance:
- GitHub: https://github.com/ksimons29/learnthelanguageyoulivein
- Documentation: `/docs/product/prd.md` and `/docs/engineering/implementation_plan.md`
