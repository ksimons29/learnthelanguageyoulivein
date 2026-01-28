import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { words } from './words';

/**
 * User Feedback Schema
 *
 * Stores bug reports, feature requests, and general feedback from users.
 * Links to Supabase Auth users via user_id.
 */

export const userFeedback = pgTable('user_feedback', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(), // References Supabase auth.users

  // Feedback type
  type: text('type', {
    enum: ['bug_report', 'feature_request', 'general_feedback', 'word_issue', 'audio_issue'],
  }).notNull(),

  // Content
  message: text('message').notNull(),

  // Context: which page they were on when submitting
  pageContext: text('page_context'),

  // Optional link to specific word (for audio_issue and word_issue types)
  wordId: uuid('word_id').references(() => words.id),

  // Metadata
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

/**
 * Feedback type options for the UI
 */
export const FEEDBACK_TYPES = [
  {
    id: 'bug_report',
    label: 'Bug Report',
    description: 'Something broken or not working',
  },
  {
    id: 'feature_request',
    label: 'Feature Request',
    description: 'Suggest a new feature',
  },
  {
    id: 'general_feedback',
    label: 'General Feedback',
    description: 'Share your thoughts',
  },
  {
    id: 'word_issue',
    label: 'Word Issue',
    description: 'Problem with a word or translation',
  },
  {
    id: 'audio_issue',
    label: 'Audio Issue',
    description: 'Problem with pronunciation audio',
  },
] as const;

export type FeedbackType = (typeof FEEDBACK_TYPES)[number]['id'];
