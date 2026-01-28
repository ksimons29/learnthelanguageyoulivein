import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { words } from '@/lib/db/schema';
import { getRequestContext } from '@/lib/logger/api-logger';

/**
 * POST /api/words/bulk-import
 *
 * Bulk import vocabulary from Anki with learning history preservation.
 * Converts Anki's SM-2 parameters to FSRS parameters.
 *
 * Reference: /docs/engineering/ANKI_IMPORT_GUIDE.md
 */

interface AnkiLearningHistory {
  state: 'new' | 'learning' | 'review' | 'struggling';
  reviewCount: number;
  lapseCount: number;
  interval: number; // Days until next review
  easeFactor: number; // Anki ease factor (typically 1.3-2.5, stored as 13-25 or 130-250)
  lastReviewed: string | null;
  mastered: boolean;
}

interface ImportEntry {
  originalText: string;
  translation: string;
  language?: 'source' | 'target';
  category?: string;
  createdAt?: string;
  notes?: string;
  learningHistory?: AnkiLearningHistory;
}

interface BulkImportRequest {
  entries: ImportEntry[];
  skipDuplicates?: boolean;
}

/**
 * Convert Anki ease factor to FSRS difficulty (0-10 scale)
 *
 * Anki ease factor typically ranges from 1.3 to 2.5
 * (sometimes stored as 13-25 or 130-250)
 *
 * FSRS difficulty: 0 = easy, 10 = hard
 */
function convertEaseFactorToDifficulty(easeFactor: number): number {
  // Normalize ease factor to 1.3-2.5 range
  let normalizedEase = easeFactor;
  if (easeFactor > 10) normalizedEase = easeFactor / 10;
  if (easeFactor > 100) normalizedEase = easeFactor / 100;

  // Clamp to valid range
  normalizedEase = Math.max(1.3, Math.min(2.5, normalizedEase));

  // Invert: higher ease = lower difficulty
  // Map 1.3-2.5 to 10-0
  const difficulty = 10 - ((normalizedEase - 1.3) / (2.5 - 1.3)) * 10;

  return Math.round(difficulty * 10) / 10; // Round to 1 decimal
}

/**
 * Convert Anki interval to FSRS stability
 *
 * Stability represents "days until retrievability drops to 90%"
 * For Anki, this approximates to the interval
 */
function convertIntervalToStability(interval: number): number {
  // Minimum stability of 1 day
  return Math.max(1, interval);
}

/**
 * Calculate retrievability based on time since last review
 *
 * Uses FSRS formula: R(t) = (1 + t/(9·S))^(-1)
 */
function calculateRetrievability(
  stability: number,
  lastReviewed: string | null
): number {
  if (!lastReviewed) return 1.0; // New cards have 100% retrievability

  const lastReviewDate = new Date(lastReviewed);
  const now = new Date();
  const daysSinceReview =
    (now.getTime() - lastReviewDate.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceReview <= 0) return 1.0;

  // FSRS retrievability formula
  const retrievability = Math.pow(1 + daysSinceReview / (9 * stability), -1);

  return Math.max(0, Math.min(1, retrievability));
}

/**
 * Calculate next review date based on stability
 */
function calculateNextReviewDate(
  stability: number,
  lastReviewed: string | null
): Date {
  const baseDate = lastReviewed ? new Date(lastReviewed) : new Date();
  const nextDate = new Date(baseDate.getTime() + stability * 24 * 60 * 60 * 1000);

  // Don't schedule in the past
  const now = new Date();
  return nextDate > now ? nextDate : now;
}

/**
 * Convert Anki state to LLYLI mastery status
 */
function convertStateToMasteryStatus(
  state: string,
  mastered: boolean,
  reviewCount: number
): 'learning' | 'learned' | 'ready_to_use' {
  if (mastered || (state === 'review' && reviewCount >= 3)) {
    return 'ready_to_use';
  }
  if (state === 'review') {
    return 'learned';
  }
  return 'learning';
}

/**
 * Calculate consecutive correct sessions from Anki data
 */
function calculateConsecutiveCorrectSessions(
  state: string,
  mastered: boolean,
  lapseCount: number,
  reviewCount: number
): number {
  if (mastered) return 3; // Full mastery
  if (lapseCount > 0) return 0; // Recent lapse resets
  if (state === 'review' && reviewCount >= 2) return 2;
  if (state === 'review') return 1;
  return 0;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const { logRequest, logResponse, logError } = getRequestContext(request);

  try {
    logRequest();
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse request body
    const body: BulkImportRequest = await request.json();
    const { entries, skipDuplicates = true } = body;

    if (!entries || !Array.isArray(entries)) {
      return NextResponse.json(
        { error: 'entries must be an array' },
        { status: 400 }
      );
    }

    // 3. Process entries
    const stats = {
      total: entries.length,
      imported: 0,
      skipped: 0,
      errors: 0,
      withHistory: 0,
    };

    const BATCH_SIZE = 50;
    const errorDetails: string[] = [];

    for (let i = 0; i < entries.length; i += BATCH_SIZE) {
      const batch = entries.slice(i, i + BATCH_SIZE);
      const valuesToInsert = [];

      for (const entry of batch) {
        try {
          // Validate required fields
          if (!entry.originalText || !entry.translation) {
            stats.skipped++;
            continue;
          }

          // Convert learning history to FSRS parameters
          const history = entry.learningHistory;
          let difficulty = 5.0;
          let stability = 1.0;
          let retrievability = 1.0;
          let nextReviewDate = new Date();
          let lastReviewDate: Date | null = null;
          let reviewCount = 0;
          let lapseCount = 0;
          let consecutiveCorrectSessions = 0;
          let masteryStatus: 'learning' | 'learned' | 'ready_to_use' = 'learning';

          if (history) {
            difficulty = convertEaseFactorToDifficulty(history.easeFactor || 2.5);
            stability = convertIntervalToStability(history.interval || 1);
            retrievability = calculateRetrievability(stability, history.lastReviewed);
            nextReviewDate = calculateNextReviewDate(stability, history.lastReviewed);
            lastReviewDate = history.lastReviewed ? new Date(history.lastReviewed) : null;
            reviewCount = history.reviewCount || 0;
            lapseCount = history.lapseCount || 0;
            consecutiveCorrectSessions = calculateConsecutiveCorrectSessions(
              history.state,
              history.mastered,
              history.lapseCount,
              history.reviewCount
            );
            masteryStatus = convertStateToMasteryStatus(
              history.state,
              history.mastered,
              history.reviewCount
            );
            stats.withHistory++;
          }

          valuesToInsert.push({
            userId: user.id,
            originalText: entry.originalText.trim(),
            translation: entry.translation.trim(),
            language: (entry.language || 'target') as 'source' | 'target',
            category: entry.category || 'other',
            categoryConfidence: 0.8, // Imported categories are assumed accurate
            difficulty,
            stability,
            retrievability,
            nextReviewDate,
            lastReviewDate,
            reviewCount,
            lapseCount,
            consecutiveCorrectSessions,
            masteryStatus,
            createdAt: entry.createdAt ? new Date(entry.createdAt) : new Date(),
          });
        } catch (entryError) {
          stats.errors++;
          errorDetails.push(
            `Entry "${entry.originalText}": ${entryError instanceof Error ? entryError.message : 'Unknown error'}`
          );
        }
      }

      // Batch insert
      if (valuesToInsert.length > 0) {
        try {
          await db.insert(words).values(valuesToInsert);
          stats.imported += valuesToInsert.length;
        } catch (dbError) {
          // If batch fails, try individual inserts
          for (const value of valuesToInsert) {
            try {
              await db.insert(words).values(value);
              stats.imported++;
            } catch (individualError) {
              stats.errors++;
              if (
                individualError instanceof Error &&
                individualError.message.includes('duplicate')
              ) {
                stats.skipped++;
                stats.errors--;
              } else {
                errorDetails.push(
                  `"${value.originalText}": ${individualError instanceof Error ? individualError.message : 'Unknown'}`
                );
              }
            }
          }
        }
      }
    }

    logResponse(200, Date.now() - startTime);
    return NextResponse.json({
      data: {
        ...stats,
        errors: errorDetails.length > 0 ? errorDetails.slice(0, 10) : undefined, // Limit error details
      },
    });
  } catch (error) {
    logError(error, { endpoint: '/api/words/bulk-import' });
    logResponse(500, Date.now() - startTime);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to import words',
      },
      { status: 500 }
    );
  }
}
