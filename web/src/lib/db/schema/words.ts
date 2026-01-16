import { pgTable, uuid, text, real, timestamp, integer } from 'drizzle-orm/pg-core';

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

  // Categorization
  category: text('category').notNull().default('other'), // food, work, home, transport, health, social, bureaucracy, greetings, other
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

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Word = typeof words.$inferSelect;
export type NewWord = typeof words.$inferInsert;
