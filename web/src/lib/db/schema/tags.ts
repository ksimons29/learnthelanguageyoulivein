import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

/**
 * Tag Entity
 *
 * User-defined tags for organizing words beyond automatic categories.
 *
 * Reference: /docs/engineering/implementation_plan.md (lines 189-193)
 */
export const tags = pgTable('tags', {
  // Primary Key
  id: uuid('id').primaryKey().defaultRandom(),

  // Foreign Keys
  wordId: uuid('word_id').notNull(), // References words

  // Tag Data
  name: text('name').notNull(), // User-defined tag name
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
