/**
 * Language Configuration
 *
 * Defines supported languages and their settings for translation and TTS.
 * Currently supporting:
 * - English ↔ Portuguese (Portugal)
 * - Future: Swedish, and more
 */

export interface LanguageConfig {
  code: string; // ISO 639-1 code (e.g., 'pt-PT', 'en', 'sv')
  name: string; // Display name
  nativeName: string; // Name in the language itself
  ttsVoice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  translationName: string; // How to refer to it in translation prompts
}

export const SUPPORTED_LANGUAGES: Record<string, LanguageConfig> = {
  'pt-PT': {
    code: 'pt-PT',
    name: 'Portuguese (Portugal)',
    nativeName: 'Português (Portugal)',
    ttsVoice: 'nova', // Best for Romance languages
    translationName: 'Portuguese (Portugal)',
  },
  'en': {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    ttsVoice: 'alloy', // Neutral, clear
    translationName: 'English',
  },
  'sv': {
    code: 'sv',
    name: 'Swedish',
    nativeName: 'Svenska',
    ttsVoice: 'nova', // Works well for Scandinavian languages
    translationName: 'Swedish',
  },
  'pt-BR': {
    code: 'pt-BR',
    name: 'Portuguese (Brazil)',
    nativeName: 'Português (Brasil)',
    ttsVoice: 'nova',
    translationName: 'Portuguese (Brazil)',
  },
  'es': {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    ttsVoice: 'nova',
    translationName: 'Spanish',
  },
  'fr': {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    ttsVoice: 'nova',
    translationName: 'French',
  },
  'de': {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    ttsVoice: 'onyx', // Deeper voice works well for German
    translationName: 'German',
  },
  'nl': {
    code: 'nl',
    name: 'Dutch',
    nativeName: 'Nederlands',
    ttsVoice: 'nova',
    translationName: 'Dutch',
  },
};

/**
 * User Language Preferences
 *
 * Defines the relationship between user's native language and target language.
 */
export interface UserLanguagePreference {
  nativeLanguage: string; // User's native language code (e.g., 'en')
  targetLanguage: string; // Language user is learning (e.g., 'pt-PT')
}

/**
 * Default language preference
 * Can be overridden per user in database
 */
export const DEFAULT_LANGUAGE_PREFERENCE: UserLanguagePreference = {
  nativeLanguage: 'en',
  targetLanguage: 'pt-PT',
};

/**
 * Supported Translation Directions
 *
 * Only these language pairs are supported for translation.
 * Each direction represents: source (what user types) → target (translation output)
 */
export const SUPPORTED_DIRECTIONS = [
  // Portuguese learners
  { source: 'en', target: 'pt-PT', label: 'English → Portuguese (Portugal)' },
  // English learners
  { source: 'nl', target: 'en', label: 'Dutch → English' },
  // Swedish learners
  { source: 'en', target: 'sv', label: 'English → Swedish' },
  // Dutch learners
  { source: 'en', target: 'nl', label: 'English → Dutch' },
] as const;

export type SupportedDirection = (typeof SUPPORTED_DIRECTIONS)[number];

/**
 * Check if a learning direction is supported
 * A learning direction is native → target (e.g., en → pt-PT means English speaker learning Portuguese)
 */
export function isDirectionSupported(native: string, target: string): boolean {
  return SUPPORTED_DIRECTIONS.some(
    (d) => d.source === native && d.target === target
  );
}

/**
 * Check if a language pair is supported for translation (bidirectional)
 * For a supported learning pair, translation can go either way:
 * - Capture target language → translate to native (comprehension)
 * - Capture native language → translate to target (production)
 */
export function isLanguagePairSupported(lang1: string, lang2: string): boolean {
  return SUPPORTED_DIRECTIONS.some(
    (d) =>
      (d.source === lang1 && d.target === lang2) ||
      (d.source === lang2 && d.target === lang1)
  );
}

/**
 * Get valid source languages for a given target language
 */
export function getValidSourcesForTarget(target: string): string[] {
  return SUPPORTED_DIRECTIONS.filter((d) => d.target === target).map(
    (d) => d.source
  );
}

/**
 * Get valid target languages for a given source language
 */
export function getValidTargetsForSource(source: string): string[] {
  return SUPPORTED_DIRECTIONS.filter((d) => d.source === source).map(
    (d) => d.target
  );
}

/**
 * Get supported direction config for a pair, or undefined if not supported
 */
export function getSupportedDirection(
  source: string,
  target: string
): SupportedDirection | undefined {
  return SUPPORTED_DIRECTIONS.find(
    (d) => d.source === source && d.target === target
  );
}

/**
 * Get all unique source language codes from supported directions
 */
export function getAllSourceLanguages(): string[] {
  return [...new Set(SUPPORTED_DIRECTIONS.map((d) => d.source))];
}

/**
 * Get all unique target language codes from supported directions
 */
export function getAllTargetLanguages(): string[] {
  return [...new Set(SUPPORTED_DIRECTIONS.map((d) => d.target))];
}

/**
 * Get language config by code
 */
export function getLanguageConfig(code: string): LanguageConfig | undefined {
  return SUPPORTED_LANGUAGES[code];
}

/**
 * Get TTS voice for a language
 */
export function getTTSVoice(
  languageCode: string
): LanguageConfig['ttsVoice'] {
  const config = getLanguageConfig(languageCode);
  return config?.ttsVoice || 'nova';
}

/**
 * Get translation name for a language
 */
export function getTranslationName(languageCode: string): string {
  const config = getLanguageConfig(languageCode);
  return config?.translationName || languageCode;
}

/**
 * Get supported language codes
 */
export function getSupportedLanguageCodes(): string[] {
  return Object.keys(SUPPORTED_LANGUAGES);
}

/**
 * Check if a language is supported
 */
export function isLanguageSupported(code: string): boolean {
  return code in SUPPORTED_LANGUAGES;
}

/**
 * Check if a word's language pair matches the user's configured languages.
 *
 * Words can be captured in either direction:
 * - User types in target language → translation to native (sourceLang=target, targetLang=native)
 * - User types in native language → translation to target (sourceLang=native, targetLang=target)
 *
 * Both directions should be included, but ONLY if BOTH languages match the user's pair.
 * This prevents mixing words from different language pairs (e.g., PT words showing for EN→SV users).
 *
 * @param wordSourceLang - The word's sourceLang field
 * @param wordTargetLang - The word's targetLang field
 * @param userNativeLang - User's native language setting
 * @param userTargetLang - User's target language setting
 */
export function isWordInUserLanguagePair(
  wordSourceLang: string,
  wordTargetLang: string,
  userNativeLang: string,
  userTargetLang: string
): boolean {
  // Direction 1: User captured in target language (sourceLang=target, targetLang=native)
  const isTargetToNative =
    wordSourceLang === userTargetLang && wordTargetLang === userNativeLang;

  // Direction 2: User captured in native language (sourceLang=native, targetLang=target)
  const isNativeToTarget =
    wordSourceLang === userNativeLang && wordTargetLang === userTargetLang;

  return isTargetToNative || isNativeToTarget;
}
