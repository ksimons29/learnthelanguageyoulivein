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
    // Language codes for bidirectional support
    sourceLang: 'pt-PT',  // Default: PT word
    targetLang: 'en',     // Translation in English
    translationProvider: 'openai-gpt4o-mini',
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
    locationHint: null,
    timeOfDay: null,
    situationTags: null,
    personalNote: null,
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
  // All tests use 'en' as native language (user knows English, learning Portuguese)
  const nativeLanguage = 'en'

  it('includes correct word as an option', () => {
    const correctWord = createMockWord({
      id: 'correct-id',
      originalText: 'maçã',     // Portuguese word
      translation: 'apple',     // English meaning
      sourceLang: 'pt-PT',
      targetLang: 'en',
    })
    const distractors = [
      createMockWord({ id: 'dist-1', originalText: 'laranja', translation: 'orange', sourceLang: 'pt-PT', targetLang: 'en' }),
      createMockWord({ id: 'dist-2', originalText: 'banana', translation: 'banana', sourceLang: 'pt-PT', targetLang: 'en' }),
    ]

    const options = buildMultipleChoiceOptions(correctWord, distractors, nativeLanguage)

    expect(options.some((o) => o.id === 'correct-id')).toBe(true)
    // Should show English (native language) text
    expect(options.some((o) => o.text === 'apple')).toBe(true)
  })

  it('includes all distractors', () => {
    const correctWord = createMockWord({ originalText: 'maçã', translation: 'apple', sourceLang: 'pt-PT', targetLang: 'en' })
    const distractors = [
      createMockWord({ id: 'dist-1', originalText: 'laranja', translation: 'orange', sourceLang: 'pt-PT', targetLang: 'en' }),
      createMockWord({ id: 'dist-2', originalText: 'banana', translation: 'banana', sourceLang: 'pt-PT', targetLang: 'en' }),
      createMockWord({ id: 'dist-3', originalText: 'uva', translation: 'grape', sourceLang: 'pt-PT', targetLang: 'en' }),
    ]

    const options = buildMultipleChoiceOptions(correctWord, distractors, nativeLanguage)

    expect(options).toHaveLength(4) // 1 correct + 3 distractors
    expect(options.some((o) => o.text === 'orange')).toBe(true)
    expect(options.some((o) => o.text === 'banana')).toBe(true)
    expect(options.some((o) => o.text === 'grape')).toBe(true)
  })

  it('returns options with correct structure', () => {
    const correctWord = createMockWord({ id: 'test-id', translation: 'test', sourceLang: 'pt-PT', targetLang: 'en' })
    const options = buildMultipleChoiceOptions(correctWord, [], nativeLanguage)

    expect(options).toHaveLength(1)
    expect(options[0]).toHaveProperty('id')
    expect(options[0]).toHaveProperty('text')
  })

  it('works with empty distractors array', () => {
    const correctWord = createMockWord({ originalText: 'maçã', translation: 'apple', sourceLang: 'pt-PT', targetLang: 'en' })
    const options = buildMultipleChoiceOptions(correctWord, [], nativeLanguage)

    expect(options).toHaveLength(1)
    expect(options[0].text).toBe('apple')
  })

  it('normalizes bidirectional captures to native language', () => {
    // User captured an English word (native→target direction)
    const wordCapturedInEnglish = createMockWord({
      id: 'en-word',
      originalText: 'timeless',  // English (native) word
      translation: 'intemporal', // Portuguese translation
      sourceLang: 'en',          // Source is English
      targetLang: 'pt-PT',       // Target is Portuguese
    })

    // User captured a Portuguese word (target→native direction)
    const wordCapturedInPortuguese = createMockWord({
      id: 'pt-word',
      originalText: 'folgar',    // Portuguese word
      translation: 'to relax',   // English translation
      sourceLang: 'pt-PT',       // Source is Portuguese
      targetLang: 'en',          // Target is English
    })

    const options = buildMultipleChoiceOptions(
      wordCapturedInEnglish,
      [wordCapturedInPortuguese],
      nativeLanguage
    )

    // Both options should be in English (native language)
    // wordCapturedInEnglish: sourceLang='en' matches native, so use originalText='timeless'
    // wordCapturedInPortuguese: targetLang='en' matches native, so use translation='to relax'
    expect(options.some((o) => o.text === 'timeless')).toBe(true)
    expect(options.some((o) => o.text === 'to relax')).toBe(true)
    // Should NOT show Portuguese text
    expect(options.some((o) => o.text === 'intemporal')).toBe(false)
    expect(options.some((o) => o.text === 'folgar')).toBe(false)
  })
})
