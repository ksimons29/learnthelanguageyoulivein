import {
  Utensils,
  ShoppingBag,
  Briefcase,
  Home,
  Car,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Inbox,
  type LucideIcon,
} from "lucide-react";

/**
 * Category Configuration
 *
 * Maps database category values to display labels and Lucide icons.
 * Used throughout the notebook UI for consistent category presentation.
 *
 * Consolidated to 8 categories following Miller's Law (7 ± 2 items)
 * for optimal cognitive load management.
 *
 * Categories match the values used in GPT-4 category assignment
 * in /web/src/app/api/words/route.ts
 */

export interface CategoryConfig {
  key: string;
  label: string;
  icon: LucideIcon;
}

/**
 * Migration map for backward compatibility with legacy category keys.
 * Maps old 14-category keys to new 8-category keys.
 */
export const CATEGORY_MIGRATION_MAP: Record<string, string> = {
  // Direct mappings (unchanged)
  shopping: "shopping",
  transport: "transport",
  // Merged categories
  food: "food_dining",
  restaurant: "food_dining",
  work: "work",
  bureaucracy: "work",
  home: "daily_life",
  time: "daily_life",
  social: "social",
  greetings: "social",
  health: "health",
  emergency: "health",
  weather: "other",
  other: "other",
  // New category keys (map to themselves)
  food_dining: "food_dining",
  daily_life: "daily_life",
};

/**
 * Category configurations mapped by database key
 *
 * 8 categories following Miller's Law consolidation:
 * - food_dining: food + restaurant
 * - work: work + bureaucracy
 * - daily_life: home + time
 * - social: social + greetings
 * - shopping: unchanged
 * - transport: unchanged
 * - health: health + emergency
 * - other: weather + other
 */
export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  food_dining: { key: "food_dining", label: "Food & Dining", icon: Utensils },
  work: { key: "work", label: "Work", icon: Briefcase },
  daily_life: { key: "daily_life", label: "Daily Life", icon: Home },
  social: { key: "social", label: "Social", icon: MessageCircle },
  shopping: { key: "shopping", label: "Shopping", icon: ShoppingBag },
  transport: { key: "transport", label: "Getting Around", icon: Car },
  health: { key: "health", label: "Health", icon: Heart },
  other: { key: "other", label: "Other", icon: MoreHorizontal },
};

/**
 * All valid category keys
 */
export const VALID_CATEGORIES = Object.keys(CATEGORY_CONFIG);

/**
 * Normalize a category key to the current 8-category system.
 * Handles legacy category keys by mapping them to their new equivalents.
 *
 * @param category - The category key to normalize (may be legacy or current)
 * @returns The normalized category key from the 8-category system
 */
export function normalizeCategory(category: string): string {
  return CATEGORY_MIGRATION_MAP[category] || "other";
}

/**
 * Get category configuration by key
 * Returns "other" config as fallback for unknown categories.
 * Handles legacy category keys through the migration map.
 */
export function getCategoryConfig(category: string): CategoryConfig {
  // First try direct lookup
  if (CATEGORY_CONFIG[category]) {
    return CATEGORY_CONFIG[category];
  }
  // Then try migration map for legacy keys
  const normalizedKey = normalizeCategory(category);
  return CATEGORY_CONFIG[normalizedKey] || CATEGORY_CONFIG.other;
}

/**
 * Get icon for a category
 */
export function getCategoryIcon(category: string): LucideIcon {
  return getCategoryConfig(category).icon;
}

/**
 * Get display label for a category
 */
export function getCategoryLabel(category: string): string {
  return getCategoryConfig(category).label;
}

/**
 * Special inbox icon for uncategorized/new words
 */
export const INBOX_ICON = Inbox;
