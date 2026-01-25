import { describe, it, expect } from 'vitest';
import {
  evaluateAnswer,
  levenshteinDistance,
  normalizeForComparison,
} from '@/lib/review/answer-evaluation';

describe('normalizeForComparison', () => {
  it('converts to lowercase', () => {
    expect(normalizeForComparison('Hello')).toBe('hello');
    expect(normalizeForComparison('WORLD')).toBe('world');
  });

  it('trims whitespace', () => {
    expect(normalizeForComparison('  hello  ')).toBe('hello');
    expect(normalizeForComparison('\thello\n')).toBe('hello');
  });

  it('strips accents', () => {
    expect(normalizeForComparison('café')).toBe('cafe');
    expect(normalizeForComparison('São Paulo')).toBe('sao paulo');
    expect(normalizeForComparison('naïve')).toBe('naive');
    expect(normalizeForComparison('résumé')).toBe('resume');
  });

  it('handles combined transformations', () => {
    expect(normalizeForComparison('  CAFÉ  ')).toBe('cafe');
    expect(normalizeForComparison(' São PAULO ')).toBe('sao paulo');
  });
});

describe('levenshteinDistance', () => {
  it('returns 0 for identical strings', () => {
    expect(levenshteinDistance('hello', 'hello')).toBe(0);
    expect(levenshteinDistance('', '')).toBe(0);
  });

  it('returns length for empty vs non-empty', () => {
    expect(levenshteinDistance('', 'hello')).toBe(5);
    expect(levenshteinDistance('world', '')).toBe(5);
  });

  it('calculates single character differences', () => {
    expect(levenshteinDistance('cat', 'bat')).toBe(1); // substitution
    expect(levenshteinDistance('cat', 'cats')).toBe(1); // insertion
    expect(levenshteinDistance('cats', 'cat')).toBe(1); // deletion
  });

  it('calculates multiple differences', () => {
    expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
    expect(levenshteinDistance('hello', 'world')).toBe(4);
  });

  it('handles transpositions as 2 edits', () => {
    // Levenshtein treats 'ab' -> 'ba' as 2 operations (not 1 like Damerau)
    expect(levenshteinDistance('ab', 'ba')).toBe(2);
  });
});

describe('evaluateAnswer', () => {
  describe('exact matches', () => {
    it('returns correct for exact match', () => {
      const result = evaluateAnswer('hello', 'hello');
      expect(result.status).toBe('correct');
      expect(result.correctedSpelling).toBeUndefined();
    });

    it('returns correct for case-insensitive match', () => {
      const result = evaluateAnswer('Hello', 'hello');
      expect(result.status).toBe('correct');
    });

    it('returns correct for match with whitespace differences', () => {
      const result = evaluateAnswer('  hello  ', 'hello');
      expect(result.status).toBe('correct');
    });

    it('returns correct for accent-insensitive match', () => {
      const result = evaluateAnswer('cafe', 'café');
      expect(result.status).toBe('correct');
    });
  });

  describe('typo tolerance', () => {
    it('returns correct_with_typo for single typo in short word', () => {
      // 'helo' vs 'hello' - 1 typo, word length 5, threshold 1
      const result = evaluateAnswer('helo', 'hello');
      expect(result.status).toBe('correct_with_typo');
      expect(result.correctedSpelling).toBe('hello');
    });

    it('returns correct_with_typo for "see you latter" vs "see you later"', () => {
      // 1 extra 't' - distance of 1
      const result = evaluateAnswer('see you latter', 'see you later');
      expect(result.status).toBe('correct_with_typo');
      expect(result.correctedSpelling).toBe('see you later');
    });

    it('allows more typos for longer strings', () => {
      // "internationalization" (20 chars) -> threshold 4 typos
      // "internationalisation" has 1 difference (z vs s) - should be correct_with_typo
      const result = evaluateAnswer('internationalisation', 'internationalization');
      expect(result.status).toBe('correct_with_typo');
    });

    it('returns incorrect for too many typos', () => {
      // 'cat' vs 'dog' - 3 differences, word length 3, threshold 1
      const result = evaluateAnswer('cat', 'dog');
      expect(result.status).toBe('incorrect');
    });

    it('returns incorrect for completely different answers', () => {
      const result = evaluateAnswer('hello', 'goodbye');
      expect(result.status).toBe('incorrect');
    });
  });

  describe('edge cases', () => {
    it('handles empty user answer', () => {
      const result = evaluateAnswer('', 'hello');
      expect(result.status).toBe('incorrect');
    });

    it('handles single character answers', () => {
      const result = evaluateAnswer('a', 'a');
      expect(result.status).toBe('correct');

      const result2 = evaluateAnswer('a', 'b');
      expect(result2.status).toBe('correct_with_typo'); // 1 typo allowed
    });

    it('handles multi-word phrases', () => {
      const result = evaluateAnswer('good morning', 'good morning');
      expect(result.status).toBe('correct');

      const result2 = evaluateAnswer('good mornign', 'good morning');
      expect(result2.status).toBe('correct_with_typo');
    });
  });

  describe('real-world examples', () => {
    it('handles Portuguese-English translation typos', () => {
      // User types "to relax" but makes a typo "to relex"
      const result = evaluateAnswer('to relex', 'to relax');
      expect(result.status).toBe('correct_with_typo');
    });

    it('handles missing articles', () => {
      // "the cat" vs "cat" - this is 4 char difference, probably incorrect
      const result = evaluateAnswer('cat', 'the cat');
      expect(result.status).toBe('incorrect');
    });

    it('handles doubled letters', () => {
      const result = evaluateAnswer('tommorrow', 'tomorrow');
      expect(result.status).toBe('correct_with_typo');
    });
  });
});
