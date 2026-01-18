import { describe, it, expect } from 'vitest'
import {
  CATEGORY_CONFIG,
  CATEGORY_MIGRATION_MAP,
  VALID_CATEGORIES,
  getCategoryConfig,
  getCategoryIcon,
  getCategoryLabel,
  normalizeCategory,
} from '@/lib/config/categories'

/**
 * Categories Configuration Tests
 *
 * Tests the category system used throughout the app.
 * Categories are auto-assigned by GPT-4 when users capture words,
 * and are used for:
 * - Organizing words in the notebook
 * - Grouping related words for sentence generation
 * - Displaying appropriate icons in the UI
 *
 * Consolidated to 8 categories following Miller's Law (7 ± 2 items)
 */

describe('CATEGORY_CONFIG', () => {
  it('contains expected 8 categories', () => {
    const expectedCategories = [
      'food_dining',
      'work',
      'daily_life',
      'social',
      'shopping',
      'transport',
      'health',
      'other',
    ]

    expectedCategories.forEach((cat) => {
      expect(CATEGORY_CONFIG[cat]).toBeDefined()
      expect(CATEGORY_CONFIG[cat].key).toBe(cat)
      expect(CATEGORY_CONFIG[cat].label).toBeTruthy()
      expect(CATEGORY_CONFIG[cat].icon).toBeDefined()
    })
  })

  it('has matching keys for all entries', () => {
    Object.entries(CATEGORY_CONFIG).forEach(([key, config]) => {
      expect(config.key).toBe(key)
    })
  })
})

describe('VALID_CATEGORIES', () => {
  it('contains 8 categories (Miller\'s Law compliant)', () => {
    expect(VALID_CATEGORIES).toHaveLength(8)
  })

  it('includes other as fallback', () => {
    expect(VALID_CATEGORIES).toContain('other')
  })
})

describe('CATEGORY_MIGRATION_MAP', () => {
  it('maps all legacy categories to new categories', () => {
    const legacyCategories = [
      'food', 'restaurant', 'shopping', 'work', 'home',
      'transport', 'health', 'social', 'bureaucracy',
      'emergency', 'weather', 'time', 'greetings', 'other'
    ]

    legacyCategories.forEach((legacy) => {
      expect(CATEGORY_MIGRATION_MAP[legacy]).toBeDefined()
      expect(VALID_CATEGORIES).toContain(CATEGORY_MIGRATION_MAP[legacy])
    })
  })

  it('maps food and restaurant to food_dining', () => {
    expect(CATEGORY_MIGRATION_MAP.food).toBe('food_dining')
    expect(CATEGORY_MIGRATION_MAP.restaurant).toBe('food_dining')
  })

  it('maps bureaucracy to work', () => {
    expect(CATEGORY_MIGRATION_MAP.bureaucracy).toBe('work')
  })

  it('maps home and time to daily_life', () => {
    expect(CATEGORY_MIGRATION_MAP.home).toBe('daily_life')
    expect(CATEGORY_MIGRATION_MAP.time).toBe('daily_life')
  })

  it('maps greetings to social', () => {
    expect(CATEGORY_MIGRATION_MAP.greetings).toBe('social')
  })

  it('maps emergency to health', () => {
    expect(CATEGORY_MIGRATION_MAP.emergency).toBe('health')
  })

  it('maps weather to other', () => {
    expect(CATEGORY_MIGRATION_MAP.weather).toBe('other')
  })
})

describe('normalizeCategory', () => {
  it('normalizes legacy categories to new keys', () => {
    expect(normalizeCategory('food')).toBe('food_dining')
    expect(normalizeCategory('restaurant')).toBe('food_dining')
    expect(normalizeCategory('bureaucracy')).toBe('work')
    expect(normalizeCategory('greetings')).toBe('social')
  })

  it('returns same key for current categories', () => {
    expect(normalizeCategory('food_dining')).toBe('food_dining')
    expect(normalizeCategory('daily_life')).toBe('daily_life')
    expect(normalizeCategory('work')).toBe('work')
  })

  it('returns "other" for unknown categories', () => {
    expect(normalizeCategory('unknown_category')).toBe('other')
    expect(normalizeCategory('')).toBe('other')
  })
})

describe('getCategoryConfig', () => {
  it('returns config for valid category', () => {
    const config = getCategoryConfig('food_dining')
    expect(config.key).toBe('food_dining')
    expect(config.label).toBe('Food & Dining')
    expect(config.icon).toBeDefined()
  })

  it('returns config for legacy category via migration', () => {
    const config = getCategoryConfig('food')
    expect(config.key).toBe('food_dining')
    expect(config.label).toBe('Food & Dining')
  })

  it('returns config for legacy restaurant via migration', () => {
    const config = getCategoryConfig('restaurant')
    expect(config.key).toBe('food_dining')
  })

  it('returns config for legacy bureaucracy via migration', () => {
    const config = getCategoryConfig('bureaucracy')
    expect(config.key).toBe('work')
  })

  it('returns "other" config for unknown category', () => {
    const config = getCategoryConfig('unknown_category')
    expect(config.key).toBe('other')
    expect(config.label).toBe('Other')
  })

  it('returns "other" config for empty string', () => {
    const config = getCategoryConfig('')
    expect(config.key).toBe('other')
  })
})

describe('getCategoryIcon', () => {
  it('returns icon for valid category', () => {
    const icon = getCategoryIcon('health')
    expect(icon).toBeDefined()
  })

  it('returns icon for legacy category via migration', () => {
    const icon = getCategoryIcon('emergency')
    expect(icon).toBe(CATEGORY_CONFIG.health.icon)
  })

  it('returns "other" icon for invalid category', () => {
    const icon = getCategoryIcon('invalid')
    expect(icon).toBe(CATEGORY_CONFIG.other.icon)
  })
})

describe('getCategoryLabel', () => {
  it('returns label for valid category', () => {
    expect(getCategoryLabel('food_dining')).toBe('Food & Dining')
    expect(getCategoryLabel('work')).toBe('Work')
    expect(getCategoryLabel('transport')).toBe('Getting Around')
  })

  it('returns label for legacy category via migration', () => {
    expect(getCategoryLabel('food')).toBe('Food & Dining')
    expect(getCategoryLabel('restaurant')).toBe('Food & Dining')
    expect(getCategoryLabel('bureaucracy')).toBe('Work')
  })

  it('returns "Other" for invalid category', () => {
    expect(getCategoryLabel('nonexistent')).toBe('Other')
  })
})
