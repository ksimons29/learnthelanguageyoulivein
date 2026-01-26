-- Migration: Fix race condition in duplicate word detection
-- Issue: #128
--
-- Problem: The duplicate check (SELECT) and INSERT have a gap where concurrent
-- requests can both pass the check before either inserts, creating duplicates.
--
-- Solution: Add a UNIQUE constraint on (user_id, lower(original_text)) to
-- enforce uniqueness at the database level. This is the atomic, reliable fix
-- for TOCTOU (Time-Of-Check to Time-Of-Use) race conditions.

-- Drop the old non-unique index (if it exists)
DROP INDEX IF EXISTS words_user_original_text_idx;

-- Create a unique index with case-insensitive matching
-- This prevents duplicate words for the same user regardless of case
CREATE UNIQUE INDEX IF NOT EXISTS words_user_original_text_unique_idx
  ON words (user_id, lower(original_text));

-- Note: If there are existing duplicates in the database, this migration will fail.
-- To handle existing duplicates, run this query first to identify them:
--
-- SELECT user_id, lower(original_text), count(*) as count
-- FROM words
-- GROUP BY user_id, lower(original_text)
-- HAVING count(*) > 1;
--
-- Then delete the duplicates manually (keeping the oldest one):
--
-- WITH duplicates AS (
--   SELECT id, user_id, original_text,
--     ROW_NUMBER() OVER (PARTITION BY user_id, lower(original_text) ORDER BY created_at) as rn
--   FROM words
-- )
-- DELETE FROM words WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);
