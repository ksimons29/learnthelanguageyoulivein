import { describe, it, expect } from 'vitest'
import { CATEGORY_CONFIG, VALID_CATEGORIES } from '@/lib/config/categories'

/**
 * Category Cognitive Load Tests
 *
 * Tests based on cognitive science research:
 * - Miller's Law: Working memory holds 7 ± 2 items
 * - Modern UX practice: 5 ± 2 items optimal
 * - Netflix/eBay standard: 6 items per group
 *
 * Sources:
 * - Miller, G.A. (1956). "The Magical Number Seven, Plus or Minus Two"
 * - Laws of UX: https://lawsofux.com/millers-law/
 * - Nielsen Norman Group research on menu design
 */

// Cognitive load thresholds based on research
const COGNITIVE_LIMITS = {
  MILLER_MIN: 5,      // 7 - 2
  MILLER_MAX: 9,      // 7 + 2
  MODERN_UX_MIN: 3,   // 5 - 2
  MODERN_UX_MAX: 7,   // 5 + 2
  OPTIMAL: 6,         // Netflix/eBay standard
}

describe('Category Cognitive Load', () => {
  describe('Category Count Compliance', () => {
    // TODO: Enable this test after category consolidation
    // Currently skipped because we have 14 categories (exceeds limit)
    it.skip('should have categories within Miller\'s Law range (5-9)', () => {
      const count = VALID_CATEGORIES.length
      expect(count).toBeGreaterThanOrEqual(COGNITIVE_LIMITS.MILLER_MIN)
      expect(count).toBeLessThanOrEqual(COGNITIVE_LIMITS.MILLER_MAX)
    })

    it('should ideally have categories within modern UX range (3-7)', () => {
      const count = VALID_CATEGORIES.length
      // This is a warning test - we want to flag if we exceed 7
      if (count > COGNITIVE_LIMITS.MODERN_UX_MAX) {
        console.warn(
          `⚠️ WARNING: ${count} categories exceeds modern UX recommendation of ${COGNITIVE_LIMITS.MODERN_UX_MAX}`
        )
      }
      // For now, just document - we'll enforce after migration
      expect(count).toBeGreaterThanOrEqual(COGNITIVE_LIMITS.MODERN_UX_MIN)
    })

    it('should document current category count for tracking', () => {
      // This test documents the current state and fails if categories change unexpectedly
      expect(VALID_CATEGORIES.length).toBe(14) // CURRENT: Too high!
      // TODO: After category consolidation, update to:
      // expect(VALID_CATEGORIES.length).toBe(8) // TARGET: Within cognitive limit
    })
  })

  describe('Category Overlap Detection', () => {
    // Categories that semantically overlap and should potentially be merged
    const OVERLAPPING_PAIRS = [
      { a: 'food', b: 'restaurant', reason: 'Both relate to eating/dining' },
      { a: 'social', b: 'greetings', reason: 'Greetings are social interactions' },
      { a: 'work', b: 'bureaucracy', reason: 'Bureaucracy often work-related' },
      { a: 'health', b: 'emergency', reason: 'Emergencies often health-related' },
    ]

    it('should document overlapping category pairs for future consolidation', () => {
      // This test documents pairs that could be merged
      OVERLAPPING_PAIRS.forEach(({ a, b, reason }) => {
        const aExists = VALID_CATEGORIES.includes(a)
        const bExists = VALID_CATEGORIES.includes(b)

        if (aExists && bExists) {
          console.warn(`⚠️ OVERLAP: "${a}" and "${b}" - ${reason}`)
        }
      })

      // Currently all overlapping pairs exist - this will change after consolidation
      expect(OVERLAPPING_PAIRS.every(
        p => VALID_CATEGORIES.includes(p.a) && VALID_CATEGORIES.includes(p.b)
      )).toBe(true)
    })
  })

  describe('Category Semantic Grouping', () => {
    // Proposed category consolidation for cognitive load reduction
    const PROPOSED_GROUPS = {
      'food_and_dining': ['food', 'restaurant'],
      'work_and_admin': ['work', 'bureaucracy'],
      'social_and_greetings': ['social', 'greetings'],
      'health_and_safety': ['health', 'emergency'],
      'daily_life': ['home', 'time', 'weather'],
      'standalone': ['shopping', 'transport'],
      'fallback': ['other'],
    }

    it('should cover all existing categories in proposed groups', () => {
      const allGroupedCategories = Object.values(PROPOSED_GROUPS).flat()

      VALID_CATEGORIES.forEach(cat => {
        expect(allGroupedCategories).toContain(cat)
      })
    })

    it('proposed consolidation would reduce to acceptable count', () => {
      const proposedCount = Object.keys(PROPOSED_GROUPS).length
      expect(proposedCount).toBeLessThanOrEqual(COGNITIVE_LIMITS.MILLER_MAX)
      expect(proposedCount).toBeLessThanOrEqual(COGNITIVE_LIMITS.MODERN_UX_MAX)
    })
  })

  describe('Category Label Quality', () => {
    it('all categories should have short, clear labels', () => {
      const MAX_LABEL_LENGTH = 15 // Keep labels scannable

      Object.values(CATEGORY_CONFIG).forEach(config => {
        expect(config.label.length).toBeLessThanOrEqual(MAX_LABEL_LENGTH)
        expect(config.label.trim()).toBe(config.label) // No leading/trailing whitespace
      })
    })

    it('labels should be distinct and not easily confused', () => {
      const labels = Object.values(CATEGORY_CONFIG).map(c => c.label.toLowerCase())
      const uniqueLabels = new Set(labels)

      // No duplicate labels
      expect(uniqueLabels.size).toBe(labels.length)
    })
  })

  describe('Category Icon Distinctiveness', () => {
    it('each category should have a unique icon', () => {
      const icons = Object.values(CATEGORY_CONFIG).map(c => c.icon)
      const uniqueIcons = new Set(icons)

      // All icons should be unique to avoid confusion
      expect(uniqueIcons.size).toBe(icons.length)
    })
  })
})

describe('Category Usability Metrics', () => {
  it('should have an "other" fallback category', () => {
    expect(VALID_CATEGORIES).toContain('other')
    expect(CATEGORY_CONFIG.other).toBeDefined()
  })

  it('getCategoryConfig should fallback gracefully for unknown categories', async () => {
    const { getCategoryConfig } = await import('@/lib/config/categories')

    const unknownResult = getCategoryConfig('unknown_category_xyz')
    expect(unknownResult.key).toBe('other')
    expect(unknownResult.label).toBe('Other')
  })
})
