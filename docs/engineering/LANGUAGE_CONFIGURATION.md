# Language Configuration Guide

This document explains how the LLYI language system works and how to add support for new languages.

---

## Overview

LLYI supports multiple language pairs. Users select:
- **Native Language**: The language they already speak (e.g., English)
- **Target Language**: The language they're learning (e.g., Portuguese Portugal)

The app adapts all features based on these selections:
- Translation direction
- TTS voice selection
- UI labels (future)
- Category suggestions (future)

---

## Current Language Support

| Language | Code | TTS Voice | Status |
|----------|------|-----------|--------|
| English | `en` | alloy | ✅ Active (Native) |
| Portuguese (Portugal) | `pt-PT` | nova | ✅ Active (Target) |
| Swedish | `sv` | nova | 🔜 Ready to activate |
| Portuguese (Brazil) | `pt-BR` | nova | ⏸️ Available |
| Spanish | `es` | nova | ⏸️ Available |
| French | `fr` | nova | ⏸️ Available |
| German | `de` | onyx | ⏸️ Available |
| Dutch | `nl` | nova | ⏸️ Available |

**Default Configuration:**
- Native Language: English (`en`)
- Target Language: Portuguese Portugal (`pt-PT`)

---

## Architecture

### File Structure

```
web/src/lib/config/
└── languages.ts          # Central language configuration

web/src/lib/audio/
└── tts.ts                # TTS with language-aware voice selection

web/src/app/api/words/
└── route.ts              # Translation with language preferences
```

### Key Components

#### 1. Language Configuration (`/web/src/lib/config/languages.ts`)

Central source of truth for all language settings:

```typescript
export interface LanguageConfig {
  code: string;           // ISO 639-1 code (e.g., 'pt-PT', 'en', 'sv')
  name: string;           // Display name in English
  nativeName: string;     // Name in the language itself
  ttsVoice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  translationName: string; // How GPT should refer to it
}

export interface UserLanguagePreference {
  nativeLanguage: string;  // User's native language code
  targetLanguage: string;  // Language user is learning
}
```

#### 2. TTS Voice Selection (`/web/src/lib/audio/tts.ts`)

Automatically selects the best OpenAI voice for each language:

```typescript
import { getTTSVoice } from '@/lib/config/languages';

// Voice is selected based on language code
const voice = getTTSVoice('pt-PT'); // Returns 'nova'
```

#### 3. Translation (`/web/src/app/api/words/route.ts`)

Uses language preferences for translation direction:

```typescript
import { getTranslationName, DEFAULT_LANGUAGE_PREFERENCE } from '@/lib/config/languages';

// Translates from target language to native language
const translation = await translateText(text, isTargetLanguage, languagePreference);
```

---

## How to Add a New Language

### Step 1: Add Language Config

Edit `/web/src/lib/config/languages.ts`:

```typescript
export const SUPPORTED_LANGUAGES: Record<string, LanguageConfig> = {
  // ... existing languages ...

  // Add your new language
  'ja': {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    ttsVoice: 'nova',  // See voice recommendations below
    translationName: 'Japanese',
  },
};
```

### Step 2: Choose the Right TTS Voice

OpenAI TTS voices have different characteristics:

| Voice | Best For | Characteristics |
|-------|----------|-----------------|
| `nova` | Romance languages, Scandinavian | Female, clear, warm |
| `alloy` | English, neutral | Balanced, professional |
| `onyx` | German, authoritative contexts | Deep, male |
| `echo` | Technical content | Male, precise |
| `fable` | Storytelling, expressive | Warm, animated |
| `shimmer` | Soft, gentle contexts | Soft, calming |

**Recommendations:**
- Portuguese, Spanish, French, Italian, Swedish → `nova`
- English → `alloy`
- German → `onyx`
- Japanese, Chinese, Korean → `nova` (works well for Asian languages)

### Step 3: Test the New Language

```bash
# Run the OpenAI test with your new language
cd web
node scripts/test-openai.js

# Or test manually in Node:
node -e "
const { generateAudio } = require('./src/lib/audio/tts');
generateAudio({ text: 'Hej, hur mår du?', languageCode: 'sv' })
  .then(buffer => console.log('Audio generated:', buffer.length, 'bytes'))
  .catch(console.error);
"
```

### Step 4: Update Default Preference (Optional)

If this should be a new default target language:

```typescript
// In /web/src/lib/config/languages.ts
export const DEFAULT_LANGUAGE_PREFERENCE: UserLanguagePreference = {
  nativeLanguage: 'en',
  targetLanguage: 'sv',  // Change to new language
};
```

---

## User Language Preferences

### Current Implementation (MVP)

Language preference is set at the application level via `DEFAULT_LANGUAGE_PREFERENCE`.

### Future Implementation (User-Specific)

When user settings are implemented, preferences will be stored in the database:

```sql
-- Add to users table or create user_settings table
ALTER TABLE users ADD COLUMN native_language TEXT DEFAULT 'en';
ALTER TABLE users ADD COLUMN target_language TEXT DEFAULT 'pt-PT';
```

Then fetch in API routes:

```typescript
// Future implementation
async function getUserLanguagePreference(userId: string): Promise<UserLanguagePreference> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  return {
    nativeLanguage: user?.nativeLanguage || 'en',
    targetLanguage: user?.targetLanguage || 'pt-PT',
  };
}
```

---

## Language-Specific Features

### Translation Prompt Customization

Some languages may need specific translation instructions:

```typescript
// Example: Add dialect-specific instructions
function getTranslationPrompt(sourceLang: string, targetLang: string): string {
  let prompt = `Translate from ${sourceLang} to ${targetLang}.`;

  // Add language-specific rules
  if (targetLang === 'Portuguese (Portugal)') {
    prompt += ' Use European Portuguese spelling and expressions, not Brazilian.';
  }

  if (targetLang === 'Swedish') {
    prompt += ' Use standard Swedish (rikssvenska), not dialects.';
  }

  return prompt;
}
```

### Category Localization (Future)

Categories can be localized per language:

```typescript
const LOCALIZED_CATEGORIES: Record<string, Record<string, string>> = {
  'pt-PT': {
    'food': 'Comida',
    'restaurant': 'Restaurante',
    'shopping': 'Compras',
    // ...
  },
  'sv': {
    'food': 'Mat',
    'restaurant': 'Restaurang',
    'shopping': 'Shopping',
    // ...
  },
};
```

---

## Testing Checklist for New Languages

When adding a new language, verify:

- [ ] Language config added to `SUPPORTED_LANGUAGES`
- [ ] TTS voice produces natural-sounding audio
- [ ] Translation quality is acceptable (test 10+ phrases)
- [ ] Special characters render correctly
- [ ] Right-to-left support (if applicable: Arabic, Hebrew)
- [ ] Build succeeds: `npm run build`
- [ ] OpenAI test passes: `node scripts/test-openai.js`

---

## Planned Language Roadmap

### Phase 1 (Current)
- ✅ English (Native)
- ✅ Portuguese Portugal (Target)

### Phase 2 (Next)
- 🔜 Swedish (for beta testing)

### Phase 3 (Future)
- Spanish
- French
- German
- Dutch
- Italian

### Phase 4 (Expansion)
- Portuguese Brazil
- Japanese
- Mandarin Chinese
- Korean
- Arabic (requires RTL support)

---

## Troubleshooting

### TTS Audio Sounds Wrong

1. Check voice selection in `languages.ts`
2. Try different voices for the language
3. Ensure text uses correct spelling/characters for the language variant

### Translation Quality Issues

1. Be specific in the translation prompt (e.g., "European Portuguese" not just "Portuguese")
2. Lower the temperature for more consistent translations
3. Consider using GPT-4 instead of GPT-4o-mini for complex languages

### Language Not Detected

Currently, the app assumes all captured text is in the target language. Auto-detection is planned for future releases.

---

## API Reference

### Functions

```typescript
// Get full config for a language
getLanguageConfig(code: string): LanguageConfig | undefined

// Get TTS voice for a language
getTTSVoice(languageCode: string): 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'

// Get translation-friendly name
getTranslationName(languageCode: string): string

// List all supported language codes
getSupportedLanguageCodes(): string[]

// Check if language is supported
isLanguageSupported(code: string): boolean
```

### Constants

```typescript
// All supported languages
SUPPORTED_LANGUAGES: Record<string, LanguageConfig>

// Default user preference
DEFAULT_LANGUAGE_PREFERENCE: UserLanguagePreference
```

---

## Questions?

- Check `/web/src/lib/config/languages.ts` for the source code
- Review `/docs/engineering/implementation_plan.md` for overall architecture
- See `/docs/product/prd.md` for language-related product requirements
