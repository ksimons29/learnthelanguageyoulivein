import { pgTable, uuid, text, real, timestamp, integer, boolean, index } from 'drizzle-orm/pg-core';

/**
 * Word Entity
 *
 * Core entity representing a captured phrase/word with FSRS parameters for spaced repetition.
 * Each word belongs to a user and tracks its learning progress through FSRS algorithm.
 *
 * Reference: /docs/engineering/implementation_plan.md (lines 138-162)
 */
export const words = pgTable('words', {
  // Primary Key
  id: uuid('id').primaryKey().defaultRandom(),

  // Foreign Keys
  userId: uuid('user_id').notNull(), // References auth.users (Supabase Auth)

  // Word Content
  originalText: text('original_text').notNull(), // The captured phrase
  translation: text('translation').notNull(), // Auto-generated translation
  language: text('language', { enum: ['source', 'target'] }).notNull(), // Detected language
  audioUrl: text('audio_url'), // Supabase Storage URL for TTS audio
  audioGenerationFailed: boolean('audio_generation_failed').default(false), // True if TTS generation failed after retries

  // Language Codes (ISO 639-1, e.g., 'en', 'pt-PT', 'nl', 'sv')
  // Tracks which specific languages were used for this word
  sourceLang: text('source_lang').notNull().default('en'), // Language of the original text
  targetLang: text('target_lang').notNull().default('pt-PT'), // Language of the translation
  translationProvider: text('translation_provider').default('openai-gpt4o-mini'), // AI model used

  // Categorization
  category: text('category').notNull().default('other'), // 8 categories: food_dining, work, daily_life, social, shopping, transport, health, other
  categoryConfidence: real('category_confidence').notNull().default(0.5), // LLM confidence score (0-1)

  // FSRS Parameters (Free Spaced Repetition Scheduler)
  // These parameters are updated after each review using the ts-fsrs library
  difficulty: real('difficulty').notNull().default(5.0), // How hard to increase memory stability (0-10)
  stability: real('stability').notNull().default(1.0), // Days until retrievability drops to 90%
  retrievability: real('retrievability').notNull().default(1.0), // Probability of successful recall (0-1)
  nextReviewDate: timestamp('next_review_date').notNull().defaultNow(), // FSRS calculated next review
  lastReviewDate: timestamp('last_review_date'), // Last time word was reviewed
  reviewCount: integer('review_count').notNull().default(0), // Total number of reviews
  lapseCount: integer('lapse_count').notNull().default(0), // Times word was forgotten (rating = Again)

  // Mastery Tracking (3 Correct Recalls Rule)
  // A word reaches "ready to use" after 3 correct recalls across 3 different sessions
  consecutiveCorrectSessions: integer('consecutive_correct_sessions').notNull().default(0),
  lastCorrectSessionId: uuid('last_correct_session_id'), // Prevents same-session double-counting
  masteryStatus: text('mastery_status', {
    enum: ['learning', 'learned', 'ready_to_use']
  }).notNull().default('learning'),

  // Memory Context (Personal Memory Journal)
  // Optional fields that turn phrases into memories with WHERE and WHEN context
  locationHint: text('location_hint'), // "at the bakery", "in the park"
  timeOfDay: text('time_of_day', { enum: ['morning', 'afternoon', 'evening', 'night'] }), // Auto-detected from capture time
  situationTags: text('situation_tags').array(), // ['alone', 'with_partner', 'nervous']
  personalNote: text('personal_note'), // "My first time ordering alone!"

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  // P0: Critical indexes for performance (3s capture requirement)
  // Index for fetching due words - used by GET /api/reviews
  index('words_user_next_review_idx').on(table.userId, table.nextReviewDate),
  // Index for language filtering - used by notebook and review queries
  index('words_user_target_lang_idx').on(table.userId, table.targetLang),
  index('words_user_source_lang_idx').on(table.userId, table.sourceLang),
  // Index for mastery filtering - used by notebook filters and progress dashboard
  index('words_user_mastery_idx').on(table.userId, table.masteryStatus),
  // Index for notebook ordering (most recent first)
  index('words_user_created_idx').on(table.userId, table.createdAt),
  // Index for category filtering - used by notebook category view
  index('words_user_category_idx').on(table.userId, table.category),
  // Index for duplicate detection - used by capture endpoint
  index('words_user_original_text_idx').on(table.userId, table.originalText),
]);

export type Word = typeof words.$inferSelect;
export type NewWord = typeof words.$inferInsert;
