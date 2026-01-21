import { pgTable, uuid, timestamp, integer, index } from 'drizzle-orm/pg-core';

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
}, (table) => [
  // P0: Index for finding active sessions (endedAt IS NULL) by user
  // Used by getOrCreateSession() in reviews API
  index('sessions_user_ended_idx').on(table.userId, table.endedAt),
  // Index for session lookup by user and start time (for session boundary checks)
  index('sessions_user_started_idx').on(table.userId, table.startedAt),
]);

export type ReviewSession = typeof reviewSessions.$inferSelect;
export type NewReviewSession = typeof reviewSessions.$inferInsert;
