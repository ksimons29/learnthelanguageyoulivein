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
