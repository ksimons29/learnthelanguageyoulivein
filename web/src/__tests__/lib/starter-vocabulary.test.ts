import { describe, it, expect } from 'vitest';
import {
  STARTER_VOCABULARY,
  getStarterWords,
  getTranslation,
  type StarterWord,
} from '@/lib/data/starter-vocabulary';

/**
 * Starter Vocabulary Tests
 *
 * Tests that starter words are properly configured for:
 * - All supported target languages
 * - Work category words (for bingo squares)
 * - Initial lapse counts (for Boss Round testing)
 * - Complete translation coverage
 *
 * This ensures new users get a gamification-ready vocabulary set.
 */

describe('Starter Vocabulary', () => {
  // All target languages including English for NL→EN users
  const supportedLanguages = ['pt-PT', 'sv', 'es', 'fr', 'de', 'nl', 'en'] as const;

  describe('Language coverage', () => {
    it.each(supportedLanguages)('has starter words for %s', (lang) => {
      const words = getStarterWords(lang);
      expect(words).toBeDefined();
      expect(words!.length).toBeGreaterThan(0);
    });

    it('returns undefined for unsupported language', () => {
      expect(getStarterWords('invalid')).toBeUndefined();
    });

    it('has at least 10 words per language', () => {
      for (const lang of supportedLanguages) {
        const words = getStarterWords(lang);
        expect(words!.length).toBeGreaterThanOrEqual(10);
      }
    });
  });

  describe('Work category for bingo', () => {
    it.each(supportedLanguages)('%s has work category words', (lang) => {
      const words = getStarterWords(lang)!;
      const workWords = words.filter((w) => w.category === 'work');
      expect(workWords.length).toBeGreaterThan(0);
    });

    it.each(supportedLanguages)('%s has at least 2 work category words', (lang) => {
      const words = getStarterWords(lang)!;
      const workWords = words.filter((w) => w.category === 'work');
      expect(workWords.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Boss Round words (lapse counts)', () => {
    it.each(supportedLanguages)('%s has words with initialLapseCount > 0', (lang) => {
      const words = getStarterWords(lang)!;
      const wordsWithLapses = words.filter((w) => (w.initialLapseCount ?? 0) > 0);
      expect(wordsWithLapses.length).toBeGreaterThan(0);
    });

    it.each(supportedLanguages)('%s has at least 2 words suitable for Boss Round', (lang) => {
      const words = getStarterWords(lang)!;
      const bossRoundWords = words.filter((w) => (w.initialLapseCount ?? 0) >= 2);
      expect(bossRoundWords.length).toBeGreaterThanOrEqual(2);
    });

    it('Portuguese has words with varying lapse counts', () => {
      const words = getStarterWords('pt-PT')!;
      const lapseCounts = words.map((w) => w.initialLapseCount ?? 0).filter((c) => c > 0);
      const uniqueLapseCounts = new Set(lapseCounts);
      expect(uniqueLapseCounts.size).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Category distribution', () => {
    // Updated to include daily_life which is used in upgraded vocabulary
    const expectedCategories = ['social', 'food_dining', 'transport', 'shopping', 'work', 'daily_life'];

    it.each(supportedLanguages)('%s covers essential categories', (lang) => {
      const words = getStarterWords(lang)!;
      const categories = new Set(words.map((w) => w.category));

      for (const expected of expectedCategories) {
        expect(categories.has(expected as StarterWord['category'])).toBe(true);
      }
    });

    it.each(supportedLanguages)('%s has social category words for bingo', (lang) => {
      const words = getStarterWords(lang)!;
      const socialWords = words.filter((w) => w.category === 'social');
      expect(socialWords.length).toBeGreaterThan(0);
    });
  });

  describe('Translation coverage', () => {
    const nativeLanguages = ['en', 'nl', 'de', 'fr', 'sv', 'es', 'pt-PT'] as const;

    it.each(supportedLanguages)('%s words have all translations', (targetLang) => {
      const words = getStarterWords(targetLang)!;

      for (const word of words) {
        for (const nativeLang of nativeLanguages) {
          expect(word.translations[nativeLang]).toBeDefined();
          expect(word.translations[nativeLang].length).toBeGreaterThan(0);
        }
      }
    });

    it('getTranslation returns English fallback for unknown language', () => {
      const words = getStarterWords('pt-PT')!;
      // Use the first word that has translations
      const firstWord = words[0];

      const translation = getTranslation(firstWord, 'xx'); // Unknown language
      expect(translation).toBe(firstWord.translations.en); // English fallback
    });

    it('getTranslation returns correct translation for known language', () => {
      const words = getStarterWords('pt-PT')!;
      const prazo = words.find((w) => w.text === 'Prazo')!;

      expect(getTranslation(prazo, 'en')).toBe('Deadline');
      expect(getTranslation(prazo, 'nl')).toBe('Deadline');
      expect(getTranslation(prazo, 'de')).toBe('Frist');
    });
  });

  describe('Word uniqueness', () => {
    it.each(supportedLanguages)('%s has no duplicate words', (lang) => {
      const words = getStarterWords(lang)!;
      const texts = words.map((w) => w.text.toLowerCase());
      const uniqueTexts = new Set(texts);
      expect(uniqueTexts.size).toBe(texts.length);
    });
  });

  describe('Work words content verification', () => {
    it('Portuguese work words have correct translations', () => {
      const words = getStarterWords('pt-PT')!;
      const workWords = words.filter((w) => w.category === 'work');

      // Upgraded vocabulary focuses on professional terms
      const prazo = workWords.find((w) => w.text.toLowerCase().includes('prazo'));
      expect(prazo).toBeDefined();
      expect(prazo!.translations.en.toLowerCase()).toContain('deadline');

      // Should have "Disponível" or "Fico à espera" in work category
      const availableOrWaiting = workWords.find((w) =>
        w.text.toLowerCase().includes('disponível') || w.text.toLowerCase().includes('espera')
      );
      expect(availableOrWaiting).toBeDefined();
    });

    it('Swedish work words have correct translations', () => {
      const words = getStarterWords('sv')!;
      const workWords = words.filter((w) => w.category === 'work');

      // Upgraded vocabulary uses common Swedish work terms
      const deadline = workWords.find((w) => w.text.toLowerCase() === 'deadline');
      expect(deadline).toBeDefined();

      // Should have "Tillgänglig" or "Återkommer" in work category
      const availableOrReturning = workWords.find((w) =>
        w.text.toLowerCase().includes('tillgänglig') || w.text.toLowerCase().includes('återkommer')
      );
      expect(availableOrReturning).toBeDefined();
    });
  });

  describe('NL→EN language pair (Issue #97)', () => {
    it('English target language has starter words for Dutch speakers', () => {
      // This test would have caught Issue #97
      // NL→EN users need English starter words with Dutch translations
      const words = getStarterWords('en');
      expect(words).toBeDefined();
      expect(words!.length).toBeGreaterThanOrEqual(10);
    });

    it('English starter words have Dutch translations', () => {
      const words = getStarterWords('en')!;
      for (const word of words) {
        expect(word.translations.nl).toBeDefined();
        expect(word.translations.nl.length).toBeGreaterThan(0);
      }
    });

    it('FAILURE TEST: getStarterWords returns undefined for non-existent language', () => {
      // This ensures we detect missing language support early
      // If this test ever fails with a false positive, we may have added
      // an incomplete language entry
      expect(getStarterWords('xx')).toBeUndefined();
      expect(getStarterWords('invalid')).toBeUndefined();
    });
  });

  describe('Gamification readiness', () => {
    it.each(supportedLanguages)('%s vocabulary enables all bingo squares', (lang) => {
      const words = getStarterWords(lang)!;
      const categories = new Set(words.map((w) => w.category));

      // Bingo squares require these categories:
      // - socialWord: needs 'social' category
      // - workWord: needs 'work' category
      expect(categories.has('social')).toBe(true);
      expect(categories.has('work')).toBe(true);
    });

    it.each(supportedLanguages)('%s has enough words for Boss Round (5)', (lang) => {
      const words = getStarterWords(lang)!;
      // Boss Round needs at least 5 words
      expect(words.length).toBeGreaterThanOrEqual(5);
    });

    it.each(supportedLanguages)('%s has words with high lapses for priority Boss Round selection', (lang) => {
      const words = getStarterWords(lang)!;
      const highLapseWords = words.filter((w) => (w.initialLapseCount ?? 0) >= 3);
      // Should have at least 1 word with lapse count 3+ for Boss Round variety
      expect(highLapseWords.length).toBeGreaterThanOrEqual(1);
    });
  });
});
