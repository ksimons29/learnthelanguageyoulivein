import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { db } from '@/lib/db';
import { words } from '@/lib/db/schema';

/**
 * POST /api/dev/import-anki
 *
 * DEVELOPMENT ONLY - Import Anki vocabulary with automatic user creation.
 * Uses Supabase service role to create/find users.
 *
 * This endpoint should be disabled in production!
 */

// Only allow in development
const IS_DEV = process.env.NODE_ENV === 'development';

interface AnkiLearningHistory {
  state: 'new' | 'learning' | 'review' | 'struggling';
  reviewCount: number;
  lapseCount: number;
  interval: number;
  easeFactor: number;
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

function convertEaseFactorToDifficulty(easeFactor: number): number {
  let normalizedEase = easeFactor;
  if (easeFactor > 10) normalizedEase = easeFactor / 10;
  if (easeFactor > 100) normalizedEase = easeFactor / 100;
  normalizedEase = Math.max(1.3, Math.min(2.5, normalizedEase));
  const difficulty = 10 - ((normalizedEase - 1.3) / (2.5 - 1.3)) * 10;
  return Math.round(difficulty * 10) / 10;
}

function convertIntervalToStability(interval: number): number {
  return Math.max(1, interval);
}

function calculateRetrievability(stability: number, lastReviewed: string | null): number {
  if (!lastReviewed) return 1.0;
  const lastReviewDate = new Date(lastReviewed);
  const now = new Date();
  const daysSinceReview = (now.getTime() - lastReviewDate.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceReview <= 0) return 1.0;
  const retrievability = Math.pow(1 + daysSinceReview / (9 * stability), -1);
  return Math.max(0, Math.min(1, retrievability));
}

function calculateNextReviewDate(stability: number, lastReviewed: string | null): Date {
  const baseDate = lastReviewed ? new Date(lastReviewed) : new Date();
  const nextDate = new Date(baseDate.getTime() + stability * 24 * 60 * 60 * 1000);
  const now = new Date();
  return nextDate > now ? nextDate : now;
}

function convertStateToMasteryStatus(
  state: string,
  mastered: boolean,
  reviewCount: number
): 'learning' | 'learned' | 'ready_to_use' {
  if (mastered || (state === 'review' && reviewCount >= 3)) return 'ready_to_use';
  if (state === 'review') return 'learned';
  return 'learning';
}

function calculateConsecutiveCorrectSessions(
  state: string,
  mastered: boolean,
  lapseCount: number,
  reviewCount: number
): number {
  if (mastered) return 3;
  if (lapseCount > 0) return 0;
  if (state === 'review' && reviewCount >= 2) return 2;
  if (state === 'review') return 1;
  return 0;
}

export async function POST(request: NextRequest) {
  // Block in production
  if (!IS_DEV) {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { email, displayName, entries } = body as {
      email: string;
      displayName: string;
      entries: ImportEntry[];
    };

    if (!email || !entries) {
      return NextResponse.json(
        { error: 'email and entries are required' },
        { status: 400 }
      );
    }

    // Create Supabase admin client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Check if user exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    let user = existingUsers?.users.find(u => u.email === email);

    if (!user) {
      // Create user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { display_name: displayName || 'Test User' },
      });

      if (createError) {
        return NextResponse.json(
          { error: `Failed to create user: ${createError.message}` },
          { status: 500 }
        );
      }

      user = newUser.user;
      console.log(`Created user: ${email} (${user.id})`);
    } else {
      console.log(`Found existing user: ${email} (${user.id})`);
    }

    // Import entries
    const stats = { total: entries.length, imported: 0, skipped: 0, errors: 0, withHistory: 0 };
    const BATCH_SIZE = 100;

    for (let i = 0; i < entries.length; i += BATCH_SIZE) {
      const batch = entries.slice(i, i + BATCH_SIZE);
      const valuesToInsert = [];

      for (const entry of batch) {
        if (!entry.originalText || !entry.translation) {
          stats.skipped++;
          continue;
        }

        const history = entry.learningHistory;
        let difficulty = 5.0, stability = 1.0, retrievability = 1.0;
        let nextReviewDate = new Date(), lastReviewDate: Date | null = null;
        let reviewCount = 0, lapseCount = 0, consecutiveCorrectSessions = 0;
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
            history.state, history.mastered, history.lapseCount, history.reviewCount
          );
          masteryStatus = convertStateToMasteryStatus(history.state, history.mastered, history.reviewCount);
          stats.withHistory++;
        }

        valuesToInsert.push({
          userId: user.id,
          originalText: entry.originalText.trim(),
          translation: entry.translation.trim(),
          language: (entry.language || 'target') as 'source' | 'target',
          category: entry.category || 'other',
          categoryConfidence: 0.8,
          difficulty, stability, retrievability,
          nextReviewDate, lastReviewDate,
          reviewCount, lapseCount, consecutiveCorrectSessions, masteryStatus,
          createdAt: entry.createdAt ? new Date(entry.createdAt) : new Date(),
        });
      }

      if (valuesToInsert.length > 0) {
        try {
          await db.insert(words).values(valuesToInsert);
          stats.imported += valuesToInsert.length;
        } catch (dbError) {
          console.error('Batch insert error:', dbError);
          stats.errors += valuesToInsert.length;
        }
      }

      // Log progress
      const progress = Math.round(((i + batch.length) / entries.length) * 100);
      console.log(`Import progress: ${progress}% (${i + batch.length}/${entries.length})`);
    }

    return NextResponse.json({
      data: {
        user: { id: user.id, email: user.email },
        ...stats,
      },
    });
  } catch (error) {
    console.error('Dev import error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Import failed' },
      { status: 500 }
    );
  }
}
