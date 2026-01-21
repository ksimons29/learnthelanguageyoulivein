import { pgTable, uuid, text, timestamp, integer, boolean, date, jsonb } from 'drizzle-orm/pg-core';

/**
 * Gamification Schema
 *
 * Tracks daily progress, streaks, and gamification features like Bingo Board.
 *
 * Reference: /docs/engineering/llyli_gamification_and_games_plan.md
 */

/**
 * DailyProgress Entity
 *
 * Tracks a user's daily review progress toward their goal.
 * One record per user per day. Default target: 10 reviews.
 */
export const dailyProgress = pgTable('daily_progress', {
  // Primary Key
  id: uuid('id').primaryKey().defaultRandom(),

  // Foreign Keys
  userId: uuid('user_id').notNull(), // References auth.users (Supabase Auth)

  // Date (one record per user per day)
  date: date('date').notNull(),

  // Progress Tracking
  targetReviews: integer('target_reviews').notNull().default(10), // Daily goal
  completedReviews: integer('completed_reviews').notNull().default(0), // Reviews done today
  completedAt: timestamp('completed_at'), // When daily goal was reached (null if not yet)

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type DailyProgress = typeof dailyProgress.$inferSelect;
export type NewDailyProgress = typeof dailyProgress.$inferInsert;

/**
 * StreakState Entity
 *
 * Persists streak information for a user, including freeze count.
 * Uses a forgiving freeze system instead of punitive streak loss.
 */
export const streakState = pgTable('streak_state', {
  // Primary Key (one per user)
  id: uuid('id').primaryKey().defaultRandom(),

  // Foreign Keys
  userId: uuid('user_id').notNull().unique(), // References auth.users (Supabase Auth)

  // Streak Data
  currentStreak: integer('current_streak').notNull().default(0),
  longestStreak: integer('longest_streak').notNull().default(0),
  lastCompletedDate: date('last_completed_date'), // Last day user met daily goal

  // Streak Freeze (forgiving system)
  streakFreezeCount: integer('streak_freeze_count').notNull().default(1), // Free freezes available
  lastFreezeUsedDate: date('last_freeze_used_date'), // Prevents multiple freezes same day

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type StreakState = typeof streakState.$inferSelect;
export type NewStreakState = typeof streakState.$inferInsert;

/**
 * BingoState Entity
 *
 * Tracks daily Bingo Board progress. Resets daily.
 * Squares are stored as JSON for flexibility.
 */
export const bingoState = pgTable('bingo_state', {
  // Primary Key
  id: uuid('id').primaryKey().defaultRandom(),

  // Foreign Keys
  userId: uuid('user_id').notNull(), // References auth.users (Supabase Auth)

  // Date (one board per user per day)
  date: date('date').notNull(),

  // Board State (JSON arrays)
  // squaresCompleted: [0, 2, 4] = indices of completed squares
  squaresCompleted: jsonb('squares_completed').notNull().default([]),

  // Square definitions for this board (allows for variety)
  // Default squares: review5, streak3, fillBlank, multipleChoice, typeTranslation, workWord, socialWord, masterWord, finishSession
  squareDefinitions: jsonb('square_definitions').notNull(),

  // Achievement
  bingoAchieved: boolean('bingo_achieved').notNull().default(false),
  bingoAchievedAt: timestamp('bingo_achieved_at'),

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type BingoState = typeof bingoState.$inferSelect;
export type NewBingoState = typeof bingoState.$inferInsert;

/**
 * Bingo Square Definitions
 *
 * These are the available squares for the daily Bingo board.
 * Stored in the database to allow for future A/B testing and personalization.
 *
 * Note: We define more than 9 squares here to enable variety.
 * The board selects 9 from this pool each day.
 */
export const ALL_BINGO_SQUARES = [
  { id: 'review5', label: 'Review 5 words', target: 5 },
  { id: 'streak3', label: '3 correct in a row', target: 3 },
  { id: 'fillBlank', label: 'Complete a fill-blank', target: 1 },
  { id: 'multipleChoice', label: 'Complete a multiple choice', target: 1 },
  { id: 'addContext', label: 'Add memory context', target: 1 }, // Capture a phrase with memory context
  { id: 'workWord', label: 'Review a work word', target: 1 },
  { id: 'socialWord', label: 'Review a social word', target: 1 },
  { id: 'masterWord', label: 'Master a word', target: 1 },
  { id: 'finishSession', label: 'Finish daily session', target: 1 },
  { id: 'bossRound', label: 'Complete Boss Round', target: 1 }, // Added for Erik's weekly ritual
] as const;

// Default selection for backwards compatibility
export const DEFAULT_BINGO_SQUARES = ALL_BINGO_SQUARES.slice(0, 9);

export type BingoSquareId = typeof ALL_BINGO_SQUARES[number]['id'];

/**
 * BossRoundHistory Entity
 *
 * Tracks completed boss round challenges for progress visualization.
 * Enables personal best tracking (like Erik's scenario: Week 1: 2/5, Week 8: 4/5, Week 16: 5/5).
 */
export const bossRoundHistory = pgTable('boss_round_history', {
  // Primary Key
  id: uuid('id').primaryKey().defaultRandom(),

  // Foreign Keys
  userId: uuid('user_id').notNull(), // References auth.users (Supabase Auth)

  // Challenge Details
  totalWords: integer('total_words').notNull().default(5),
  correctCount: integer('correct_count').notNull().default(0),
  timeLimit: integer('time_limit').notNull().default(90), // seconds
  timeUsed: integer('time_used').notNull().default(0), // seconds

  // Computed (stored for quick access)
  accuracy: integer('accuracy').notNull().default(0), // percentage 0-100
  isPerfect: boolean('is_perfect').notNull().default(false),

  // Timestamps
  completedAt: timestamp('completed_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type BossRoundHistory = typeof bossRoundHistory.$inferSelect;
export type NewBossRoundHistory = typeof bossRoundHistory.$inferInsert;
