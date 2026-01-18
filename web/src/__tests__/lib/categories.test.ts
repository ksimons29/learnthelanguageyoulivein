import { describe, it, expect } from 'vitest'
import {
  CATEGORY_CONFIG,
  VALID_CATEGORIES,
  getCategoryConfig,
  getCategoryIcon,
  getCategoryLabel,
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
 */

describe('CATEGORY_CONFIG', () => {
  it('contains expected categories', () => {
    const expectedCategories = [
      'food',
      'restaurant',
      'shopping',
      'work',
      'home',
      'transport',
      'health',
      'social',
      'bureaucracy',
      'emergency',
      'weather',
      'time',
      'greetings',
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
  it('contains 14 categories', () => {
    expect(VALID_CATEGORIES).toHaveLength(14)
  })

  it('includes other as fallback', () => {
    expect(VALID_CATEGORIES).toContain('other')
  })
})

describe('getCategoryConfig', () => {
  it('returns config for valid category', () => {
    const config = getCategoryConfig('food')
    expect(config.key).toBe('food')
    expect(config.label).toBe('Food')
    expect(config.icon).toBeDefined()
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

  it('returns "other" icon for invalid category', () => {
    const icon = getCategoryIcon('invalid')
    expect(icon).toBe(CATEGORY_CONFIG.other.icon)
  })
})

describe('getCategoryLabel', () => {
  it('returns label for valid category', () => {
    expect(getCategoryLabel('food')).toBe('Food')
    expect(getCategoryLabel('bureaucracy')).toBe('Bureaucracy')
    expect(getCategoryLabel('transport')).toBe('Transport')
  })

  it('returns "Other" for invalid category', () => {
    expect(getCategoryLabel('nonexistent')).toBe('Other')
  })
})
