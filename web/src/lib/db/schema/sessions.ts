import { pgTable, uuid, timestamp, integer } from 'drizzle-orm/pg-core';

/**
 * ReviewSession Entity
 *
 * Tracks session boundaries for the "3 correct recalls on separate sessions" mastery requirement.
 * A new session starts when >2 hours since last review activity OR user explicitly starts new session.
 *
 * Reference: /docs/engineering/implementation_plan.md (lines 178-188)
 */
export const reviewSessions = pgTable('review_sessions', {
  // Primary Key
  id: uuid('id').primaryKey().defaultRandom(),

  // Foreign Keys
  userId: uuid('user_id').notNull(), // References auth.users (Supabase Auth)

  // Session Data
  startedAt: timestamp('started_at').notNull().defaultNow(),
  endedAt: timestamp('ended_at'), // null = session still active
  wordsReviewed: integer('words_reviewed').notNull().default(0),
  correctCount: integer('correct_count').notNull().default(0), // Count of Good/Easy ratings
});

export type ReviewSession = typeof reviewSessions.$inferSelect;
export type NewReviewSession = typeof reviewSessions.$inferInsert;
