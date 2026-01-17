import {
  Utensils,
  UtensilsCrossed,
  ShoppingBag,
  Briefcase,
  Home,
  Car,
  Heart,
  MessageCircle,
  FileText,
  AlertTriangle,
  Cloud,
  Clock,
  Hand,
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
 * Categories match the enum defined in /web/src/lib/db/schema/words.ts
 */

export interface CategoryConfig {
  key: string;
  label: string;
  icon: LucideIcon;
}

/**
 * Category configurations mapped by database key
 */
export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  food: { key: "food", label: "Food", icon: Utensils },
  restaurant: { key: "restaurant", label: "Restaurant", icon: UtensilsCrossed },
  shopping: { key: "shopping", label: "Shopping", icon: ShoppingBag },
  work: { key: "work", label: "Work", icon: Briefcase },
  home: { key: "home", label: "Home", icon: Home },
  transport: { key: "transport", label: "Transport", icon: Car },
  health: { key: "health", label: "Health", icon: Heart },
  social: { key: "social", label: "Social", icon: MessageCircle },
  bureaucracy: { key: "bureaucracy", label: "Bureaucracy", icon: FileText },
  emergency: { key: "emergency", label: "Emergency", icon: AlertTriangle },
  weather: { key: "weather", label: "Weather", icon: Cloud },
  time: { key: "time", label: "Time", icon: Clock },
  greetings: { key: "greetings", label: "Greetings", icon: Hand },
  other: { key: "other", label: "Other", icon: MoreHorizontal },
};

/**
 * All valid category keys
 */
export const VALID_CATEGORIES = Object.keys(CATEGORY_CONFIG);

/**
 * Get category configuration by key
 * Returns "other" config as fallback for unknown categories
 */
export function getCategoryConfig(category: string): CategoryConfig {
  return CATEGORY_CONFIG[category] || CATEGORY_CONFIG.other;
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
