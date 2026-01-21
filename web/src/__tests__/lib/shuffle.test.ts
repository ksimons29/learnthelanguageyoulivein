import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fisherYatesShuffle,
  shuffleWithinPriorityBands,
  shuffleFully,
} from '@/lib/review/shuffle';
import type { Word } from '@/lib/db/schema';

// Helper to create mock words with specific review dates
function createMockWord(overrides: Partial<Word> = {}): Word {
  return {
    id: overrides.id || crypto.randomUUID(),
    userId: 'test-user',
    originalText: 'test',
    translation: 'teste',
    sourceLang: 'en',
    targetLang: 'pt-PT',
    category: 'other',
    difficulty: 0.3,
    stability: 1,
    retrievability: 0.9,
    reps: 0,
    lapses: 0,
    lastReviewDate: null,
    nextReviewDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    audioUrl: null,
    memoryContext: null,
    masteryStatus: 'learning',
    correctSessionCount: 0,
    lastCorrectSessionId: null,
    audioGenerationFailed: null,
    ...overrides,
  } as Word;
}

describe('fisherYatesShuffle', () => {
  it('should return empty array for empty input', () => {
    const result = fisherYatesShuffle([]);
    expect(result).toEqual([]);
  });

  it('should return single element unchanged', () => {
    const result = fisherYatesShuffle([1]);
    expect(result).toEqual([1]);
  });

  it('should contain all original elements', () => {
    const original = [1, 2, 3, 4, 5];
    const result = fisherYatesShuffle([...original]);
    expect(result.sort()).toEqual(original.sort());
  });

  it('should mutate the original array', () => {
    const original = [1, 2, 3, 4, 5];
    const result = fisherYatesShuffle(original);
    expect(result).toBe(original);
  });

  it('should produce different orders over multiple runs (statistical)', () => {
    // Run 100 shuffles and check that we get at least 2 different orders
    const original = [1, 2, 3, 4, 5];
    const orders = new Set<string>();

    for (let i = 0; i < 100; i++) {
      const shuffled = fisherYatesShuffle([...original]);
      orders.add(shuffled.join(','));
    }

    // With 5 elements, there are 120 permutations
    // Getting only 1 unique order in 100 tries is astronomically unlikely
    expect(orders.size).toBeGreaterThan(1);
  });
});

describe('shuffleWithinPriorityBands', () => {
  const now = new Date('2026-01-21T12:00:00Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return empty array for empty input', () => {
    const result = shuffleWithinPriorityBands([]);
    expect(result).toEqual([]);
  });

  it('should return single word unchanged', () => {
    const word = createMockWord();
    const result = shuffleWithinPriorityBands([word]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(word.id);
  });

  it('should not mutate the original array', () => {
    const words = [createMockWord(), createMockWord()];
    const originalLength = words.length;
    const originalIds = words.map((w) => w.id);

    shuffleWithinPriorityBands(words);

    expect(words).toHaveLength(originalLength);
    expect(words.map((w) => w.id)).toEqual(originalIds);
  });

  it('should categorize new words (never reviewed) correctly', () => {
    const newWord1 = createMockWord({ lastReviewDate: null });
    const newWord2 = createMockWord({ lastReviewDate: null });
    const result = shuffleWithinPriorityBands([newWord1, newWord2]);

    expect(result).toHaveLength(2);
    // Both should be present
    const ids = result.map((w) => w.id);
    expect(ids).toContain(newWord1.id);
    expect(ids).toContain(newWord2.id);
  });

  it('should put overdue words before due words', () => {
    // Overdue = more than 7 days past nextReviewDate
    const overdueWord = createMockWord({
      id: 'overdue',
      lastReviewDate: new Date('2026-01-01'),
      nextReviewDate: new Date('2026-01-10'), // 11 days ago
    });

    // Due = past nextReviewDate but within 7 days
    const dueWord = createMockWord({
      id: 'due',
      lastReviewDate: new Date('2026-01-15'),
      nextReviewDate: new Date('2026-01-20'), // 1 day ago
    });

    // Run multiple times to ensure priority is maintained
    for (let i = 0; i < 10; i++) {
      const result = shuffleWithinPriorityBands([dueWord, overdueWord]);
      const overdueIndex = result.findIndex((w) => w.id === 'overdue');
      const dueIndex = result.findIndex((w) => w.id === 'due');
      expect(overdueIndex).toBeLessThan(dueIndex);
    }
  });

  it('should put due words before new words', () => {
    const dueWord = createMockWord({
      id: 'due',
      lastReviewDate: new Date('2026-01-15'),
      nextReviewDate: new Date('2026-01-20'),
    });

    const newWord = createMockWord({
      id: 'new',
      lastReviewDate: null,
      nextReviewDate: null,
    });

    for (let i = 0; i < 10; i++) {
      const result = shuffleWithinPriorityBands([newWord, dueWord]);
      const dueIndex = result.findIndex((w) => w.id === 'due');
      const newIndex = result.findIndex((w) => w.id === 'new');
      expect(dueIndex).toBeLessThan(newIndex);
    }
  });

  it('should preserve all words in output', () => {
    const words = [
      createMockWord({ id: 'overdue', lastReviewDate: new Date('2026-01-01'), nextReviewDate: new Date('2026-01-05') }),
      createMockWord({ id: 'due1', lastReviewDate: new Date('2026-01-15'), nextReviewDate: new Date('2026-01-20') }),
      createMockWord({ id: 'due2', lastReviewDate: new Date('2026-01-16'), nextReviewDate: new Date('2026-01-21') }),
      createMockWord({ id: 'new1', lastReviewDate: null }),
      createMockWord({ id: 'new2', lastReviewDate: null }),
    ];

    const result = shuffleWithinPriorityBands(words);

    expect(result).toHaveLength(5);
    const resultIds = result.map((w) => w.id).sort();
    expect(resultIds).toEqual(['due1', 'due2', 'new1', 'new2', 'overdue']);
  });

  it('should shuffle within bands (statistical test)', () => {
    const newWords = Array.from({ length: 5 }, (_, i) =>
      createMockWord({ id: `new-${i}`, lastReviewDate: null })
    );

    const orders = new Set<string>();

    for (let i = 0; i < 100; i++) {
      const result = shuffleWithinPriorityBands(newWords);
      orders.add(result.map((w) => w.id).join(','));
    }

    // Should have multiple different orders
    expect(orders.size).toBeGreaterThan(1);
  });
});

describe('shuffleFully', () => {
  it('should return empty array for empty input', () => {
    const result = shuffleFully([]);
    expect(result).toEqual([]);
  });

  it('should not mutate the original array', () => {
    const words = [createMockWord(), createMockWord()];
    const originalIds = words.map((w) => w.id);

    shuffleFully(words);

    expect(words.map((w) => w.id)).toEqual(originalIds);
  });

  it('should contain all original words', () => {
    const words = [
      createMockWord({ id: 'a' }),
      createMockWord({ id: 'b' }),
      createMockWord({ id: 'c' }),
    ];

    const result = shuffleFully(words);

    expect(result).toHaveLength(3);
    const ids = result.map((w) => w.id).sort();
    expect(ids).toEqual(['a', 'b', 'c']);
  });

  it('should produce different orders over multiple runs', () => {
    const words = Array.from({ length: 5 }, (_, i) =>
      createMockWord({ id: `word-${i}` })
    );

    const orders = new Set<string>();

    for (let i = 0; i < 100; i++) {
      const result = shuffleFully(words);
      orders.add(result.map((w) => w.id).join(','));
    }

    expect(orders.size).toBeGreaterThan(1);
  });
});

describe('Issue #64: Review queue should not have duplicates', () => {
  it('should maintain unique word IDs after shuffle', () => {
    const words = Array.from({ length: 10 }, (_, i) =>
      createMockWord({ id: `word-${i}` })
    );

    const result = shuffleWithinPriorityBands(words);

    const ids = result.map((w) => w.id);
    const uniqueIds = new Set(ids);

    // No duplicates
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should maintain FSRS priority order (overdue > due > new) while shuffling within bands', () => {
    const now = new Date('2026-01-21T12:00:00Z');
    vi.useFakeTimers();
    vi.setSystemTime(now);

    const overdueWords = [
      createMockWord({ id: 'o1', lastReviewDate: new Date('2026-01-01'), nextReviewDate: new Date('2026-01-05') }),
      createMockWord({ id: 'o2', lastReviewDate: new Date('2026-01-02'), nextReviewDate: new Date('2026-01-06') }),
    ];

    const dueWords = [
      createMockWord({ id: 'd1', lastReviewDate: new Date('2026-01-18'), nextReviewDate: new Date('2026-01-20') }),
      createMockWord({ id: 'd2', lastReviewDate: new Date('2026-01-19'), nextReviewDate: new Date('2026-01-21') }),
    ];

    const newWords = [
      createMockWord({ id: 'n1', lastReviewDate: null }),
      createMockWord({ id: 'n2', lastReviewDate: null }),
    ];

    // Test multiple times to ensure consistency
    for (let i = 0; i < 20; i++) {
      const result = shuffleWithinPriorityBands([...newWords, ...dueWords, ...overdueWords]);

      // Overdue words should be in first 2 positions
      expect(['o1', 'o2']).toContain(result[0].id);
      expect(['o1', 'o2']).toContain(result[1].id);

      // Due words should be in positions 2-3
      expect(['d1', 'd2']).toContain(result[2].id);
      expect(['d1', 'd2']).toContain(result[3].id);

      // New words should be last
      expect(['n1', 'n2']).toContain(result[4].id);
      expect(['n1', 'n2']).toContain(result[5].id);
    }

    vi.useRealTimers();
  });
});
