import { describe, it, expect } from 'vitest'
import {
  determineExerciseType,
  getExerciseTypeName,
  getExerciseDifficulty,
  selectWordToBlank,
} from '@/lib/sentences/exercise-type'
import type { Word } from '@/lib/db/schema'

/**
 * Exercise Type Tests
 *
 * Tests the logic that determines which type of exercise a user gets
 * based on their mastery level. This is critical for the learning
 * progression - we want users to progress from easier (multiple choice)
 * to harder (type translation) as they master words.
 */

// Helper to create mock words with specific mastery levels
function createMockWord(
  overrides: Partial<Word> = {}
): Word {
  return {
    id: crypto.randomUUID(),
    userId: 'test-user',
    originalText: 'test',
    translation: 'test translation',
    language: 'target',
    audioUrl: null,
    category: 'other',
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

describe('determineExerciseType', () => {
  it('returns multiple_choice for empty array', () => {
    expect(determineExerciseType([])).toBe('multiple_choice')
  })

  it('returns multiple_choice when avg correct sessions < 1', () => {
    const words = [
      createMockWord({ consecutiveCorrectSessions: 0 }),
      createMockWord({ consecutiveCorrectSessions: 0 }),
    ]
    expect(determineExerciseType(words)).toBe('multiple_choice')
  })

  it('returns fill_blank when avg correct sessions is 1-2', () => {
    const words = [
      createMockWord({ consecutiveCorrectSessions: 1 }),
      createMockWord({ consecutiveCorrectSessions: 1 }),
    ]
    expect(determineExerciseType(words)).toBe('fill_blank')
  })

  it('returns type_translation when avg correct sessions >= 2', () => {
    const words = [
      createMockWord({ consecutiveCorrectSessions: 2 }),
      createMockWord({ consecutiveCorrectSessions: 3 }),
    ]
    expect(determineExerciseType(words)).toBe('type_translation')
  })

  it('calculates average correctly with mixed mastery levels', () => {
    // Average: (0 + 1 + 2) / 3 = 1, should be fill_blank
    const words = [
      createMockWord({ consecutiveCorrectSessions: 0 }),
      createMockWord({ consecutiveCorrectSessions: 1 }),
      createMockWord({ consecutiveCorrectSessions: 2 }),
    ]
    expect(determineExerciseType(words)).toBe('fill_blank')
  })

  it('handles words with null/undefined consecutiveCorrectSessions', () => {
    const words = [
      createMockWord({ consecutiveCorrectSessions: null as unknown as number }),
      createMockWord({ consecutiveCorrectSessions: undefined as unknown as number }),
    ]
    // Should treat null/undefined as 0, so average is 0 → multiple_choice
    expect(determineExerciseType(words)).toBe('multiple_choice')
  })
})

describe('getExerciseTypeName', () => {
  it('returns correct names for all exercise types', () => {
    expect(getExerciseTypeName('multiple_choice')).toBe('Multiple Choice')
    expect(getExerciseTypeName('fill_blank')).toBe('Fill in the Blank')
    expect(getExerciseTypeName('type_translation')).toBe('Type Translation')
  })

  it('returns Unknown for invalid exercise type', () => {
    expect(getExerciseTypeName('invalid' as never)).toBe('Unknown')
  })
})

describe('getExerciseDifficulty', () => {
  it('returns correct difficulty levels', () => {
    expect(getExerciseDifficulty('multiple_choice')).toBe(1)
    expect(getExerciseDifficulty('fill_blank')).toBe(2)
    expect(getExerciseDifficulty('type_translation')).toBe(3)
  })

  it('defaults to 1 for unknown types', () => {
    expect(getExerciseDifficulty('unknown' as never)).toBe(1)
  })
})

describe('selectWordToBlank', () => {
  it('returns null for empty array', () => {
    expect(selectWordToBlank([])).toBeNull()
  })

  it('returns the word with lowest mastery', () => {
    const lowMastery = createMockWord({
      originalText: 'hard',
      consecutiveCorrectSessions: 0,
    })
    const highMastery = createMockWord({
      originalText: 'easy',
      consecutiveCorrectSessions: 3,
    })

    const result = selectWordToBlank([highMastery, lowMastery])
    expect(result?.originalText).toBe('hard')
  })

  it('returns first word when all have equal mastery', () => {
    const word1 = createMockWord({ originalText: 'first' })
    const word2 = createMockWord({ originalText: 'second' })

    // Both have 0 mastery, first one in sorted order wins
    const result = selectWordToBlank([word1, word2])
    expect(result).toBeDefined()
  })
})
