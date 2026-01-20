/**
 * Memory Context Configuration
 *
 * Constants and utilities for the Personal Memory Journal feature.
 * This transforms phrase capture into memory journaling by adding
 * WHERE (location), WHEN (time), and emotional/social context.
 */

/**
 * Predefined Situation Tags
 *
 * Users can select up to 3 to describe the emotional/social context
 * when they captured a phrase.
 *
 * Icons use Lucide icon names for consistency with the rest of the app.
 */
export const SITUATION_TAGS = [
  { id: 'alone', label: 'Alone', icon: 'User' },
  { id: 'with_loved_one', label: 'With loved one', icon: 'Heart' },
  { id: 'with_friends', label: 'With friends', icon: 'Users' },
  { id: 'at_work', label: 'At work', icon: 'Briefcase' },
  { id: 'shopping', label: 'Shopping', icon: 'ShoppingBag' },
  { id: 'dining_out', label: 'Dining out', icon: 'UtensilsCrossed' },
  { id: 'outdoor', label: 'Outdoor', icon: 'TreePine' },
  { id: 'nervous', label: 'Nervous', icon: 'Frown' },
  { id: 'proud', label: 'Proud', icon: 'Trophy' },
] as const;

export type SituationTagId = typeof SITUATION_TAGS[number]['id'];

/**
 * Time of Day values
 */
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

/**
 * Get time of day from a Date object
 *
 * - morning: 5am - 11:59am
 * - afternoon: 12pm - 4:59pm
 * - evening: 5pm - 8:59pm
 * - night: 9pm - 4:59am
 */
export function getTimeOfDay(date: Date = new Date()): TimeOfDay {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

/**
 * Format time of day for display
 */
export function formatTimeOfDay(timeOfDay: TimeOfDay): string {
  const labels: Record<TimeOfDay, string> = {
    morning: 'morning',
    afternoon: 'afternoon',
    evening: 'evening',
    night: 'night',
  };
  return labels[timeOfDay];
}

/**
 * Get situation tag by ID
 */
export function getSituationTag(id: string) {
  return SITUATION_TAGS.find((tag) => tag.id === id);
}

/**
 * Memory Context interface for API/store use
 */
export interface MemoryContext {
  locationHint?: string;
  timeOfDay?: TimeOfDay;
  situationTags?: SituationTagId[];
  personalNote?: string;
}

/**
 * Check if a word has any memory context
 */
export function hasMemoryContext(word: {
  locationHint?: string | null;
  timeOfDay?: string | null;
  situationTags?: string[] | null;
  personalNote?: string | null;
}): boolean {
  return !!(
    word.locationHint ||
    word.timeOfDay ||
    (word.situationTags && word.situationTags.length > 0) ||
    word.personalNote
  );
}

/**
 * Format memory context for display (short version for word cards)
 *
 * Example: "at the bakery · evening"
 */
export function formatMemoryContextShort(word: {
  locationHint?: string | null;
  timeOfDay?: string | null;
}): string | null {
  const parts: string[] = [];

  if (word.locationHint) {
    parts.push(word.locationHint);
  }

  if (word.timeOfDay) {
    parts.push(word.timeOfDay);
  }

  return parts.length > 0 ? parts.join(' · ') : null;
}
