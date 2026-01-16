import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  date,
} from 'drizzle-orm/pg-core';

/**
 * User Profiles Schema
 *
 * Stores user preferences, language settings, and subscription information.
 * Links to Supabase Auth users via user_id.
 *
 * Reference: /docs/engineering/AUTH_AND_MONETIZATION_PLAN.md
 */

export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique(), // References Supabase auth.users

  // Personal info (optional)
  displayName: text('display_name'),

  // Language preferences
  nativeLanguage: text('native_language').notNull().default('en'),
  targetLanguage: text('target_language').notNull().default('pt-PT'),

  // Learning context
  learningReason: text('learning_reason'), // 'living_permanent', 'working_temporary', etc.

  // Subscription
  subscriptionTier: text('subscription_tier', {
    enum: ['free', 'pro', 'trial'],
  })
    .notNull()
    .default('free'),
  subscriptionStartedAt: timestamp('subscription_started_at'),
  subscriptionEndsAt: timestamp('subscription_ends_at'),
  trialEndsAt: timestamp('trial_ends_at'),
  stripeCustomerId: text('stripe_customer_id'), // For Stripe integration

  // Usage tracking (for freemium limits)
  wordsCapturedCount: integer('words_captured_count').notNull().default(0),
  reviewsTodayCount: integer('reviews_today_count').notNull().default(0),
  lastReviewDate: date('last_review_date'),

  // Onboarding state
  onboardingCompleted: boolean('onboarding_completed').notNull().default(false),

  // Metadata
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Learning reasons for categorization
 */
export const LEARNING_REASONS = [
  {
    id: 'living_permanent',
    label: 'Living here permanently',
    description: 'Moved here and want to integrate',
    icon: '🏠',
  },
  {
    id: 'working_temporary',
    label: 'Working here temporarily',
    description: 'Here for work, 1-3 years',
    icon: '💼',
  },
  {
    id: 'partner_family',
    label: 'Partner or family speaks it',
    description: 'Want to communicate with loved ones',
    icon: '❤️',
  },
  {
    id: 'planning_move',
    label: 'Planning to move here',
    description: 'Preparing before relocating',
    icon: '✈️',
  },
  {
    id: 'travel_culture',
    label: 'Travel & culture',
    description: 'Love the country and language',
    icon: '🌍',
  },
  {
    id: 'professional_growth',
    label: 'Career advancement',
    description: 'Need it for work opportunities',
    icon: '📈',
  },
  {
    id: 'other',
    label: 'Other reason',
    description: 'Something else entirely',
    icon: '✨',
  },
] as const;

export type LearningReason = (typeof LEARNING_REASONS)[number]['id'];
export type SubscriptionTier = 'free' | 'pro' | 'trial';

/**
 * Subscription limits per tier
 */
export const SUBSCRIPTION_LIMITS = {
  free: {
    maxWords: 50,
    maxReviewsPerDay: 10,
    hasHdAudio: false,
    hasSentenceGeneration: false,
    hasExport: false,
  },
  trial: {
    maxWords: Infinity,
    maxReviewsPerDay: Infinity,
    hasHdAudio: true,
    hasSentenceGeneration: true,
    hasExport: true,
  },
  pro: {
    maxWords: Infinity,
    maxReviewsPerDay: Infinity,
    hasHdAudio: true,
    hasSentenceGeneration: true,
    hasExport: true,
  },
} as const;
