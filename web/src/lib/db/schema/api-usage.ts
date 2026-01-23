import { pgTable, uuid, text, timestamp, integer, real, index } from 'drizzle-orm/pg-core';

/**
 * API Usage Log
 *
 * Tracks OpenAI API usage for cost monitoring and analytics.
 * Created per API call to track tokens, costs, and success/failure.
 *
 * Cost Estimation (as of Jan 2025):
 * - GPT-4o-mini: $0.150 / 1M input tokens, $0.600 / 1M output tokens
 * - TTS-1: $15.00 / 1M characters
 */
export const apiUsageLog = pgTable('api_usage_log', {
  // Primary Key
  id: uuid('id').primaryKey().defaultRandom(),

  // Context
  userId: uuid('user_id'), // null for system/background tasks
  createdAt: timestamp('created_at').notNull().defaultNow(),

  // API Details
  apiType: text('api_type', {
    enum: ['translation', 'tts', 'sentence_generation', 'language_detection']
  }).notNull(),

  model: text('model').notNull(), // e.g., "gpt-4o-mini", "tts-1"

  // Token Usage (for GPT calls)
  promptTokens: integer('prompt_tokens'), // Input tokens
  completionTokens: integer('completion_tokens'), // Output tokens
  totalTokens: integer('total_tokens'), // prompt + completion

  // Character Usage (for TTS calls)
  characterCount: integer('character_count'), // TTS character count

  // Cost (USD)
  estimatedCost: real('estimated_cost').notNull(), // Cost in USD cents (e.g., 0.0015)

  // Result
  status: text('status', {
    enum: ['success', 'failure', 'retry']
  }).notNull(),

  errorMessage: text('error_message'), // Populated on failure

  // Metadata (optional context for debugging)
  metadata: text('metadata'), // JSON string with additional context
}, (table) => [
  // Index for user-based cost analysis
  index('api_usage_user_date_idx').on(table.userId, table.createdAt),
  // Index for type-based queries
  index('api_usage_type_date_idx').on(table.apiType, table.createdAt),
  // Index for cost analysis by date
  index('api_usage_date_idx').on(table.createdAt),
]);

export type ApiUsageLog = typeof apiUsageLog.$inferSelect;
export type NewApiUsageLog = typeof apiUsageLog.$inferInsert;
