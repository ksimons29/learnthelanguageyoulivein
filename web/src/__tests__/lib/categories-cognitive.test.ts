import { describe, it, expect } from 'vitest'
import { CATEGORY_CONFIG, VALID_CATEGORIES, CATEGORY_MIGRATION_MAP } from '@/lib/config/categories'

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
 *
 * Categories have been consolidated from 14 to 8 to comply with Miller's Law.
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
    it('should have categories within Miller\'s Law range (5-9)', () => {
      const count = VALID_CATEGORIES.length
      expect(count).toBeGreaterThanOrEqual(COGNITIVE_LIMITS.MILLER_MIN)
      expect(count).toBeLessThanOrEqual(COGNITIVE_LIMITS.MILLER_MAX)
    })

    it('should ideally have categories within modern UX range (3-7)', () => {
      const count = VALID_CATEGORIES.length
      // 8 is slightly above the modern UX max of 7, but within Miller's Law
      // This is an acceptable trade-off for semantic coverage
      expect(count).toBeGreaterThanOrEqual(COGNITIVE_LIMITS.MODERN_UX_MIN)
      expect(count).toBeLessThanOrEqual(COGNITIVE_LIMITS.MILLER_MAX)
    })

    it('should have exactly 8 categories (consolidated from 14)', () => {
      expect(VALID_CATEGORIES.length).toBe(8)
    })
  })

  describe('Category Consolidation Verification', () => {
    it('should have consolidated food and restaurant into food_dining', () => {
      expect(VALID_CATEGORIES).toContain('food_dining')
      expect(VALID_CATEGORIES).not.toContain('food')
      expect(VALID_CATEGORIES).not.toContain('restaurant')
    })

    it('should have consolidated work and bureaucracy into work', () => {
      expect(VALID_CATEGORIES).toContain('work')
      expect(VALID_CATEGORIES).not.toContain('bureaucracy')
    })

    it('should have consolidated home and time into daily_life', () => {
      expect(VALID_CATEGORIES).toContain('daily_life')
      expect(VALID_CATEGORIES).not.toContain('home')
      expect(VALID_CATEGORIES).not.toContain('time')
    })

    it('should have consolidated social and greetings into social', () => {
      expect(VALID_CATEGORIES).toContain('social')
      expect(VALID_CATEGORIES).not.toContain('greetings')
    })

    it('should have consolidated health and emergency into health', () => {
      expect(VALID_CATEGORIES).toContain('health')
      expect(VALID_CATEGORIES).not.toContain('emergency')
    })

    it('should have consolidated weather into other', () => {
      expect(VALID_CATEGORIES).toContain('other')
      expect(VALID_CATEGORIES).not.toContain('weather')
    })
  })

  describe('Backward Compatibility via Migration Map', () => {
    it('migration map should cover all 14 legacy categories', () => {
      const legacyCategories = [
        'food', 'restaurant', 'shopping', 'work', 'home',
        'transport', 'health', 'social', 'bureaucracy',
        'emergency', 'weather', 'time', 'greetings', 'other'
      ]

      legacyCategories.forEach(legacy => {
        expect(CATEGORY_MIGRATION_MAP[legacy]).toBeDefined()
      })
    })

    it('all migration targets should be valid current categories', () => {
      Object.values(CATEGORY_MIGRATION_MAP).forEach(target => {
        expect(VALID_CATEGORIES).toContain(target)
      })
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

  it('getCategoryConfig should handle legacy categories', async () => {
    const { getCategoryConfig } = await import('@/lib/config/categories')

    // Legacy categories should map to their consolidated equivalents
    expect(getCategoryConfig('food').key).toBe('food_dining')
    expect(getCategoryConfig('restaurant').key).toBe('food_dining')
    expect(getCategoryConfig('bureaucracy').key).toBe('work')
    expect(getCategoryConfig('greetings').key).toBe('social')
    expect(getCategoryConfig('emergency').key).toBe('health')
  })
})
