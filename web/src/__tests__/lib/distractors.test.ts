import { describe, it, expect, vi } from 'vitest'
import { shuffleArray, buildMultipleChoiceOptions } from '@/lib/review/distractors'
import type { Word } from '@/lib/db/schema'

/**
 * Distractors Utility Tests
 *
 * Tests the multiple choice exercise generation logic.
 * Distractors are "wrong answers" shown alongside the correct word
 * in multiple choice exercises. They're selected from the same category
 * to make the exercise meaningful (e.g., food words vs other food words).
 */

// Helper to create mock words
function createMockWord(overrides: Partial<Word> = {}): Word {
  return {
    id: crypto.randomUUID(),
    userId: 'test-user',
    originalText: 'test',
    translation: 'test translation',
    language: 'target',
    audioUrl: null,
    category: 'food_dining',
    categoryConfidence: 0.9,
    difficulty: 0.3,
    stability: 1.0,
    retrievability: 1.0,
    nextReviewDate: new Date(),
    lastReviewDate: null,
    reviewCount: 0,
    lapseCount: 0,
    consecutiveCorrectSessions: 0,
    lastCorrectSessionId: null,
    masteryStatus: 'learning',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

describe('shuffleArray', () => {
  it('returns array with same elements', () => {
    const original = [1, 2, 3, 4, 5]
    const shuffled = shuffleArray(original)

    expect(shuffled).toHaveLength(original.length)
    original.forEach((item) => {
      expect(shuffled).toContain(item)
    })
  })

  it('does not modify original array', () => {
    const original = [1, 2, 3]
    const originalCopy = [...original]
    shuffleArray(original)

    expect(original).toEqual(originalCopy)
  })

  it('returns empty array for empty input', () => {
    expect(shuffleArray([])).toEqual([])
  })

  it('returns single item array unchanged', () => {
    expect(shuffleArray([42])).toEqual([42])
  })

  it('eventually produces different orders (probabilistic)', () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const orders = new Set<string>()

    // Run 20 shuffles and expect at least 2 different orders
    for (let i = 0; i < 20; i++) {
      orders.add(shuffleArray(original).join(','))
    }

    expect(orders.size).toBeGreaterThan(1)
  })
})

describe('buildMultipleChoiceOptions', () => {
  it('includes correct word as an option', () => {
    const correctWord = createMockWord({
      id: 'correct-id',
      translation: 'apple',
    })
    const distractors = [
      createMockWord({ id: 'dist-1', translation: 'orange' }),
      createMockWord({ id: 'dist-2', translation: 'banana' }),
    ]

    const options = buildMultipleChoiceOptions(correctWord, distractors)

    expect(options.some((o) => o.id === 'correct-id')).toBe(true)
    expect(options.some((o) => o.text === 'apple')).toBe(true)
  })

  it('includes all distractors', () => {
    const correctWord = createMockWord({ translation: 'apple' })
    const distractors = [
      createMockWord({ id: 'dist-1', translation: 'orange' }),
      createMockWord({ id: 'dist-2', translation: 'banana' }),
      createMockWord({ id: 'dist-3', translation: 'grape' }),
    ]

    const options = buildMultipleChoiceOptions(correctWord, distractors)

    expect(options).toHaveLength(4) // 1 correct + 3 distractors
    expect(options.some((o) => o.text === 'orange')).toBe(true)
    expect(options.some((o) => o.text === 'banana')).toBe(true)
    expect(options.some((o) => o.text === 'grape')).toBe(true)
  })

  it('returns options with correct structure', () => {
    const correctWord = createMockWord({ id: 'test-id', translation: 'test' })
    const options = buildMultipleChoiceOptions(correctWord, [])

    expect(options).toHaveLength(1)
    expect(options[0]).toHaveProperty('id')
    expect(options[0]).toHaveProperty('text')
  })

  it('works with empty distractors array', () => {
    const correctWord = createMockWord({ translation: 'apple' })
    const options = buildMultipleChoiceOptions(correctWord, [])

    expect(options).toHaveLength(1)
    expect(options[0].text).toBe('apple')
  })
})
