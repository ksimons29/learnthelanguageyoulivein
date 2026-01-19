# Multi-Language Implementation

This document describes the multi-language support implementation for LLYLI, enabling users to learn different language pairs.

## Supported Translation Directions

| Direction | Source | Target | Use Case |
|-----------|--------|--------|----------|
| en → pt-PT | English | Portuguese (Portugal) | English speakers learning European Portuguese |
| nl → pt-PT | Dutch | Portuguese (Portugal) | Dutch speakers learning European Portuguese |
| nl → en | Dutch | English | Dutch speakers learning English |
| en → sv | English | Swedish | English speakers learning Swedish |

## Architecture

### Schema Changes

The `words` table now includes explicit language tracking:

```sql
-- web/src/lib/db/schema/words.ts
sourceLang: text('source_lang').notNull().default('en'),
targetLang: text('target_lang').notNull().default('pt-PT'),
translationProvider: text('translation_provider').default('openai-gpt4o-mini'),
```

**Migration Note:** Existing words default to `en`/`pt-PT` which maintains backwards compatibility with the original Portuguese learning flow.

### Direction Validation

All translation requests are validated against `SUPPORTED_DIRECTIONS` in `web/src/lib/config/languages.ts`:

```typescript
export const SUPPORTED_DIRECTIONS = [
  { source: 'en', target: 'pt-PT', label: 'English → Portuguese (Portugal)' },
  { source: 'nl', target: 'en', label: 'Dutch → English' },
  { source: 'en', target: 'sv', label: 'English → Swedish' },
] as const;
```

Unsupported directions return a 400 error with a descriptive message.

### Regional Variant Enforcement

For `pt-PT`, the translation prompt explicitly enforces European Portuguese:

```
IMPORTANT: Use European Portuguese (Portugal) ONLY.
- Never use Brazilian Portuguese vocabulary, spelling, or expressions
- Use "tu" forms instead of "você" where appropriate
- Use European spelling (e.g., "facto" not "fato", "autocarro" not "ônibus")
```

## User Flow

### Capture Page

1. User opens `/capture`
2. Language selector shows current direction (default: en → pt-PT)
3. User can change source/target language
4. Only valid target languages are shown for selected source
5. On save, language codes are passed to API

### API Flow

1. `POST /api/words` receives `{ text, sourceLang?, targetLang? }`
2. If languages not provided, uses user's profile settings from `user_profiles` table
3. Validates direction against `SUPPORTED_DIRECTIONS`
4. Translates with regional variant instructions (if applicable)
5. Stores language codes on word record

## Key Files

| File | Purpose |
|------|---------|
| `web/src/lib/db/schema/words.ts` | Schema with `sourceLang`, `targetLang` fields |
| `web/src/lib/config/languages.ts` | `SUPPORTED_DIRECTIONS`, validation functions |
| `web/src/app/api/words/route.ts` | Translation API with direction validation |
| `web/src/app/capture/page.tsx` | Capture UI with language selector |
| `web/src/components/capture/language-selector.tsx` | Language selector component |

## Validation Functions

```typescript
// Check if a direction is supported
isDirectionSupported(source: string, target: string): boolean

// Get valid targets for a source language
getValidTargetsForSource(source: string): string[]

// Get valid sources for a target language
getValidSourcesForTarget(target: string): string[]

// Get direction config or undefined
getSupportedDirection(source: string, target: string): SupportedDirection | undefined
```

## Testing

### Manual Test Cases

1. **Capture en → pt-PT**: Capture "hello" → should translate to European Portuguese
2. **Capture nl → en**: Change to Dutch→English, capture "hallo" → should translate to English
3. **Capture en → sv**: Change to English→Swedish, capture "hello" → should translate to Swedish
4. **Invalid direction**: Try nl → pt-PT → should show error
5. **Check database**: Verify `source_lang` and `target_lang` are stored correctly

### Database Verification

```sql
-- Check language codes on words
SELECT id, original_text, translation, source_lang, target_lang
FROM words
WHERE user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC
LIMIT 10;
```

## Future Considerations

### Adding New Directions

To add a new translation direction:

1. Add entry to `SUPPORTED_DIRECTIONS` in `languages.ts`
2. Ensure language config exists in `SUPPORTED_LANGUAGES`
3. Add any regional variant instructions to `translateText()` if needed
4. Update documentation

### Deferred Features

- **Dutch → Swedish pivot translation**: Not needed for launch, but could be added by routing through English
- **Auto-detect source language**: Could use LLM to detect input language
- **User preference persistence**: Language selector could remember last used direction
