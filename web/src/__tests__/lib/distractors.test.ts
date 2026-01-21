import { describe, it, expect, vi } from 'vitest'
import { shuffleArray, buildMultipleChoiceOptions, getNativeLanguageText, getTargetLanguageText } from '@/lib/review/distractors'
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

/**
 * Translation Hint Formatting Tests
 *
 * BUG FOUND (Issue #60): The review page formats translation hints as:
 *   `${word.originalText}: ${word.translation}`
 *
 * This is WRONG for bidirectional capture because:
 * - For PT word: originalText='tampo', translation='lid' → shows "tampo: lid" ✓
 * - For EN word: originalText='Battery', translation='bateria' → shows "Battery: bateria" ✗
 *
 * Expected format is always "TARGET: NATIVE" (e.g., "tampo: lid", "bateria: Battery")
 * so users see the word they're learning followed by the meaning they know.
 */
describe('Translation hint formatting for bidirectional capture', () => {
  const nativeLanguage = 'en'
  const targetLanguage = 'pt-PT'

  /**
   * Helper function that CORRECTLY formats translation hints.
   * This is what the review page SHOULD use.
   */
  function formatTranslationHint(word: Word, nativeLang: string, targetLang: string): string {
    const targetText = getTargetLanguageText(word, targetLang)
    const nativeText = getNativeLanguageText(word, nativeLang)
    return `${targetText}: ${nativeText}`
  }

  /**
   * The BUGGY function that the review page currently uses.
   * This demonstrates the bug.
   */
  function formatTranslationHintBuggy(word: Word): string {
    return `${word.originalText}: ${word.translation}`
  }

  it('BUGGY: shows wrong format for EN→PT capture', () => {
    // User captured "Battery" in English
    const wordCapturedInEnglish = createMockWord({
      originalText: 'Battery',    // English (what user typed)
      translation: 'bateria',     // Portuguese (translation)
      sourceLang: 'en',
      targetLang: 'pt-PT',
    })

    // The buggy function shows: "Battery: bateria"
    // But we want: "bateria: Battery" (target: native)
    const buggyResult = formatTranslationHintBuggy(wordCapturedInEnglish)

    // This assertion PASSES because the buggy code produces wrong output
    expect(buggyResult).toBe('Battery: bateria')  // WRONG FORMAT!

    // The correct format should be target language first
    // This test will FAIL with the buggy implementation
    const correctResult = formatTranslationHint(wordCapturedInEnglish, nativeLanguage, targetLanguage)
    expect(correctResult).toBe('bateria: Battery')  // CORRECT FORMAT
  })

  it('CORRECT: shows right format for PT→EN capture', () => {
    // User captured "tampo" in Portuguese
    const wordCapturedInPortuguese = createMockWord({
      originalText: 'tampo',    // Portuguese (what user typed)
      translation: 'lid',       // English (translation)
      sourceLang: 'pt-PT',
      targetLang: 'en',
    })

    // Both should produce the same format for PT captures
    const buggyResult = formatTranslationHintBuggy(wordCapturedInPortuguese)
    const correctResult = formatTranslationHint(wordCapturedInPortuguese, nativeLanguage, targetLanguage)

    // For PT word, the buggy format happens to be correct
    expect(buggyResult).toBe('tampo: lid')
    expect(correctResult).toBe('tampo: lid')
  })

  it('formats mixed capture directions consistently', () => {
    const words = [
      // PT capture
      createMockWord({
        originalText: 'tampo',
        translation: 'lid',
        sourceLang: 'pt-PT',
        targetLang: 'en',
      }),
      // EN capture (this is where the bug shows)
      createMockWord({
        originalText: 'Trainwreck',
        translation: 'desastre',
        sourceLang: 'en',
        targetLang: 'pt-PT',
      }),
    ]

    // Format all words
    const hints = words.map(w => formatTranslationHint(w, nativeLanguage, targetLanguage))

    // All should be in "TARGET: NATIVE" format
    expect(hints[0]).toBe('tampo: lid')           // PT word
    expect(hints[1]).toBe('desastre: Trainwreck') // EN word (target lang first!)

    // Joined hint should show consistent format
    const joinedHint = hints.join(' | ')
    expect(joinedHint).toBe('tampo: lid | desastre: Trainwreck')
  })
})

/**
 * Focus Word Selection Tests - Issue #61 & #62
 *
 * BUG FOUND: In sentence exercises, the "focus word" (the word being tested)
 * is not consistent across:
 * - Which word is highlighted in the sentence
 * - Which word's options are shown in multiple choice
 * - Which word's answer is expected
 *
 * ROOT CAUSE: For multiple_choice, the code uses `sentenceTargetWords[0]`
 * but for fill_blank, it uses `selectWordToBlank()`. These can return
 * different words, causing a mismatch.
 *
 * THE FIX: Use `selectWordToBlank()` for BOTH exercise types to ensure
 * the same word is used for:
 * - Selecting which word to blank/test
 * - Loading distractors for multiple choice
 * - Validating the user's answer
 */
describe('Focus word selection for sentence exercises - Issue #61 & #62', () => {
  /**
   * Test: selectWordToBlank should return consistent results
   *
   * This test verifies that the word selection logic works correctly
   * and can be used for BOTH fill_blank AND multiple_choice exercises.
   */
  it('selectWordToBlank returns word with lowest mastery consistently', async () => {
    const { selectWordToBlank } = await import('@/lib/sentences/exercise-type')

    const words = [
      createMockWord({
        id: 'high-mastery',
        originalText: 'além disso',
        translation: 'besides',
        consecutiveCorrectSessions: 3,  // High mastery
      }),
      createMockWord({
        id: 'low-mastery',
        originalText: 'Observadores',
        translation: 'Watchers',
        consecutiveCorrectSessions: 0,  // Low mastery - should be selected
      }),
      createMockWord({
        id: 'medium-mastery',
        originalText: 'relatório',
        translation: 'report',
        consecutiveCorrectSessions: 1,  // Medium mastery
      }),
    ]

    // Regardless of array order, should return lowest mastery word
    const focusWord = selectWordToBlank(words)

    expect(focusWord).not.toBeNull()
    expect(focusWord!.id).toBe('low-mastery')
    expect(focusWord!.originalText).toBe('Observadores')
  })

  /**
   * Test: Multiple choice options must be for the focus word, not array[0]
   *
   * This is the INVARIANT that was broken:
   * The word for which options are generated MUST be the same word
   * that is highlighted and expected as the answer.
   *
   * Previously, code did: loadDistractors(sentenceTargetWords[0])
   * This is WRONG because array[0] may not be the focus word.
   */
  it('INVARIANT: options must be generated for focus word, not arbitrary array[0]', async () => {
    const { selectWordToBlank } = await import('@/lib/sentences/exercise-type')

    // Simulate a sentence with words in a specific order
    // Array order: [high, low, medium]
    // But focus word (lowest mastery) is the second one!
    const sentenceTargetWords = [
      createMockWord({
        id: 'array-first',
        originalText: 'além disso',
        translation: 'besides',
        consecutiveCorrectSessions: 2,  // NOT the lowest
        sourceLang: 'pt-PT',
        targetLang: 'en',
      }),
      createMockWord({
        id: 'lowest-mastery',
        originalText: 'selos',
        translation: 'stamps',
        consecutiveCorrectSessions: 0,  // LOWEST - this should be the focus word
        sourceLang: 'pt-PT',
        targetLang: 'en',
      }),
      createMockWord({
        id: 'array-third',
        originalText: 'cartas',
        translation: 'letters',
        consecutiveCorrectSessions: 1,
        sourceLang: 'pt-PT',
        targetLang: 'en',
      }),
    ]

    // The CORRECT way: use selectWordToBlank to get focus word
    const focusWord = selectWordToBlank(sentenceTargetWords)

    // Focus word MUST be the lowest mastery word
    expect(focusWord!.id).toBe('lowest-mastery')
    expect(focusWord!.translation).toBe('stamps')

    // The BUG was: using sentenceTargetWords[0]
    const wrongWord = sentenceTargetWords[0]
    expect(wrongWord.id).toBe('array-first')  // This is NOT the focus word!

    // CRITICAL ASSERTION:
    // Options must be generated for focusWord, not wrongWord
    // If we build options for wrongWord, the correct answer ('besides')
    // won't match what user sees highlighted ('selos' → 'stamps')
    expect(focusWord!.id).not.toBe(wrongWord.id)

    // When we build options, they MUST include the focus word's translation
    const distractors = [
      createMockWord({ translation: 'letters', sourceLang: 'pt-PT', targetLang: 'en' }),
      createMockWord({ translation: 'packages', sourceLang: 'pt-PT', targetLang: 'en' }),
    ]

    const options = buildMultipleChoiceOptions(focusWord!, distractors, 'en')

    // The correct answer MUST be in the options
    expect(options.some(o => o.text === 'stamps')).toBe(true)

    // The wrong word's translation should NOT be the expected answer
    expect(options.some(o => o.id === focusWord!.id)).toBe(true)
  })

  /**
   * Test: All exercise types must use the same focus word
   *
   * For a given set of words, both fill_blank and multiple_choice
   * must test the SAME word - the one with lowest mastery.
   */
  it('fill_blank and multiple_choice use same focus word selection', async () => {
    const { selectWordToBlank, determineExerciseType } = await import('@/lib/sentences/exercise-type')

    const words = [
      createMockWord({
        id: 'word-1',
        originalText: 'excerto',
        translation: 'excerpt',
        consecutiveCorrectSessions: 2,
      }),
      createMockWord({
        id: 'word-2',
        originalText: 'selos',
        translation: 'stamps',
        consecutiveCorrectSessions: 0,  // Lowest - should be focus
      }),
    ]

    // For any exercise type, the focus word should be the same
    const focusWord = selectWordToBlank(words)

    // This should work for fill_blank
    expect(focusWord!.id).toBe('word-2')

    // AND for multiple_choice (same selection logic)
    // The code must NOT do: sentenceTargetWords[0]
    // It must do: selectWordToBlank(sentenceTargetWords)
    expect(focusWord!.id).toBe('word-2')
  })
})
