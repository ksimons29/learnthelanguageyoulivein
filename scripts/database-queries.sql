-- ============================================================================
-- LLYLI Database Validation Queries
-- ============================================================================
--
-- HOW TO USE:
-- 1. Go to https://supabase.com/dashboard
-- 2. Select your LLYLI project
-- 3. Click "SQL Editor" in the left sidebar
-- 4. Copy/paste any query below and click "Run"
--
-- TIP: Run Section 1 first to get an overview of your data health
-- ============================================================================


-- ============================================================================
-- SECTION 1: DATA OVERVIEW (Run these first!)
-- ============================================================================

-- 1.1 Quick health check - see all table counts at once
SELECT
  'words' as table_name, COUNT(*) as row_count FROM words
UNION ALL
SELECT 'user_profiles', COUNT(*) FROM user_profiles
UNION ALL
SELECT 'review_sessions', COUNT(*) FROM review_sessions
UNION ALL
SELECT 'generated_sentences', COUNT(*) FROM generated_sentences;

-- 1.2 Your user profile (replace with your email or check all)
SELECT
  up.id,
  up.display_name,
  up.native_language,
  up.target_language,
  up.subscription_tier,
  up.words_captured_count,
  up.onboarding_completed,
  up.created_at
FROM user_profiles up
ORDER BY up.created_at DESC;

-- 1.3 Words per user (shows if data is properly associated)
SELECT
  up.display_name,
  up.target_language,
  COUNT(w.id) as word_count,
  COUNT(CASE WHEN w.mastery_status = 'ready_to_use' THEN 1 END) as mastered_count
FROM user_profiles up
LEFT JOIN words w ON w.user_id = up.user_id
GROUP BY up.id, up.display_name, up.target_language
ORDER BY word_count DESC;


-- ============================================================================
-- SECTION 2: WORD DATA VALIDATION
-- ============================================================================

-- 2.1 All your words with key fields (most recent first)
SELECT
  original_text,
  translation,
  category,
  mastery_status,
  review_count,
  consecutive_correct_sessions,
  next_review_date,
  created_at
FROM words
ORDER BY created_at DESC
LIMIT 50;

-- 2.2 Words by category (verify category distribution)
SELECT
  category,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as percentage
FROM words
GROUP BY category
ORDER BY count DESC;

-- 2.3 Words by mastery status (learning progress)
SELECT
  mastery_status,
  COUNT(*) as count,
  ROUND(AVG(review_count), 1) as avg_reviews,
  ROUND(AVG(consecutive_correct_sessions), 1) as avg_correct_sessions
FROM words
GROUP BY mastery_status
ORDER BY
  CASE mastery_status
    WHEN 'learning' THEN 1
    WHEN 'learned' THEN 2
    WHEN 'ready_to_use' THEN 3
  END;

-- 2.4 Words due for review (should match what app shows)
SELECT
  original_text,
  translation,
  category,
  mastery_status,
  next_review_date,
  ROUND(retrievability::numeric, 2) as retrievability
FROM words
WHERE next_review_date <= NOW()
ORDER BY next_review_date ASC
LIMIT 20;

-- 2.5 Words with audio (verify TTS is working)
SELECT
  COUNT(*) as total_words,
  COUNT(audio_url) as with_audio,
  COUNT(*) - COUNT(audio_url) as missing_audio,
  ROUND(COUNT(audio_url) * 100.0 / COUNT(*), 1) as audio_percentage
FROM words;

-- 2.6 Recent word captures (verify capture flow works)
SELECT
  original_text,
  translation,
  category,
  category_confidence,
  audio_url IS NOT NULL as has_audio,
  created_at
FROM words
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC
LIMIT 20;


-- ============================================================================
-- SECTION 3: FSRS ALGORITHM VALIDATION
-- ============================================================================

-- 3.1 FSRS parameter distribution (check algorithm is working)
SELECT
  mastery_status,
  COUNT(*) as count,
  ROUND(AVG(difficulty)::numeric, 2) as avg_difficulty,
  ROUND(AVG(stability)::numeric, 2) as avg_stability,
  ROUND(AVG(retrievability)::numeric, 2) as avg_retrievability,
  ROUND(AVG(review_count)::numeric, 1) as avg_reviews
FROM words
GROUP BY mastery_status;

-- 3.2 Words with unusual FSRS values (potential bugs)
SELECT
  original_text,
  difficulty,
  stability,
  retrievability,
  review_count,
  lapse_count
FROM words
WHERE
  difficulty < 0 OR difficulty > 10
  OR stability < 0
  OR retrievability < 0 OR retrievability > 1
  OR review_count < 0
  OR lapse_count < 0;
-- Should return 0 rows if data is valid

-- 3.3 Lapse rate (how often users forget words)
SELECT
  CASE
    WHEN review_count = 0 THEN 'Never reviewed'
    WHEN lapse_count = 0 THEN 'Never forgotten'
    WHEN lapse_count::float / review_count < 0.2 THEN 'Rarely forgotten (<20%)'
    WHEN lapse_count::float / review_count < 0.5 THEN 'Sometimes forgotten (20-50%)'
    ELSE 'Often forgotten (>50%)'
  END as lapse_category,
  COUNT(*) as word_count
FROM words
GROUP BY 1
ORDER BY word_count DESC;

-- 3.4 Review schedule distribution (when are words due?)
SELECT
  CASE
    WHEN next_review_date <= NOW() THEN 'Overdue'
    WHEN next_review_date <= NOW() + INTERVAL '1 day' THEN 'Due today'
    WHEN next_review_date <= NOW() + INTERVAL '7 days' THEN 'Due this week'
    WHEN next_review_date <= NOW() + INTERVAL '30 days' THEN 'Due this month'
    ELSE 'Due later'
  END as schedule,
  COUNT(*) as word_count
FROM words
GROUP BY 1
ORDER BY
  CASE
    WHEN next_review_date <= NOW() THEN 1
    WHEN next_review_date <= NOW() + INTERVAL '1 day' THEN 2
    WHEN next_review_date <= NOW() + INTERVAL '7 days' THEN 3
    WHEN next_review_date <= NOW() + INTERVAL '30 days' THEN 4
    ELSE 5
  END;


-- ============================================================================
-- SECTION 4: REVIEW SESSIONS
-- ============================================================================

-- 4.1 Recent review sessions
SELECT
  id,
  started_at,
  ended_at,
  words_reviewed,
  correct_count,
  CASE
    WHEN words_reviewed > 0
    THEN ROUND(correct_count * 100.0 / words_reviewed, 1)
    ELSE 0
  END as accuracy_percentage,
  CASE WHEN ended_at IS NULL THEN 'Active' ELSE 'Completed' END as status
FROM review_sessions
ORDER BY started_at DESC
LIMIT 20;

-- 4.2 Session statistics over time
SELECT
  DATE(started_at) as date,
  COUNT(*) as sessions,
  SUM(words_reviewed) as total_reviews,
  SUM(correct_count) as total_correct,
  ROUND(AVG(words_reviewed), 1) as avg_words_per_session
FROM review_sessions
WHERE started_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(started_at)
ORDER BY date DESC;

-- 4.3 Incomplete sessions (might indicate bugs or user abandonment)
SELECT
  id,
  started_at,
  words_reviewed,
  correct_count
FROM review_sessions
WHERE ended_at IS NULL
  AND started_at < NOW() - INTERVAL '2 hours'
ORDER BY started_at DESC;


-- ============================================================================
-- SECTION 5: SENTENCE GENERATION
-- ============================================================================

-- 5.1 Generated sentences overview
SELECT
  COUNT(*) as total_sentences,
  COUNT(used_at) as used_sentences,
  COUNT(*) - COUNT(used_at) as unused_sentences,
  COUNT(audio_url) as with_audio
FROM generated_sentences;

-- 5.2 Recent generated sentences
SELECT
  text,
  exercise_type,
  array_length(word_ids, 1) as words_combined,
  audio_url IS NOT NULL as has_audio,
  used_at,
  created_at
FROM generated_sentences
ORDER BY created_at DESC
LIMIT 20;

-- 5.3 Sentences by exercise type
SELECT
  exercise_type,
  COUNT(*) as count,
  COUNT(used_at) as times_used
FROM generated_sentences
GROUP BY exercise_type;

-- 5.4 Unused pre-generated sentences (ready for review)
SELECT
  text,
  exercise_type,
  created_at
FROM generated_sentences
WHERE used_at IS NULL
ORDER BY created_at DESC
LIMIT 10;


-- ============================================================================
-- SECTION 6: DATA INTEGRITY CHECKS
-- ============================================================================

-- 6.1 Orphaned words (no matching user profile) - should be 0
SELECT COUNT(*) as orphaned_words
FROM words w
LEFT JOIN user_profiles up ON w.user_id = up.user_id
WHERE up.id IS NULL;

-- 6.2 Orphaned sessions (no matching user profile) - should be 0
SELECT COUNT(*) as orphaned_sessions
FROM review_sessions rs
LEFT JOIN user_profiles up ON rs.user_id = up.user_id
WHERE up.id IS NULL;

-- 6.3 Words with invalid mastery state
-- (consecutive_correct_sessions should match mastery_status)
SELECT
  original_text,
  mastery_status,
  consecutive_correct_sessions
FROM words
WHERE
  (mastery_status = 'ready_to_use' AND consecutive_correct_sessions < 3)
  OR (mastery_status = 'learning' AND consecutive_correct_sessions >= 3);
-- Should return 0 rows if mastery logic is correct

-- 6.4 Check for duplicate words (same user, same text)
SELECT
  user_id,
  original_text,
  COUNT(*) as duplicates
FROM words
GROUP BY user_id, original_text
HAVING COUNT(*) > 1;


-- ============================================================================
-- SECTION 7: USEFUL ADMIN QUERIES
-- ============================================================================

-- 7.1 Reset a specific word's FSRS data (for testing)
-- UPDATE words
-- SET
--   difficulty = 5.0,
--   stability = 1.0,
--   retrievability = 1.0,
--   next_review_date = NOW(),
--   review_count = 0,
--   lapse_count = 0,
--   consecutive_correct_sessions = 0,
--   mastery_status = 'learning'
-- WHERE id = 'YOUR-WORD-UUID-HERE';

-- 7.2 Mark all words as due for review (for testing)
-- UPDATE words
-- SET next_review_date = NOW() - INTERVAL '1 day'
-- WHERE user_id = 'YOUR-USER-UUID-HERE';

-- 7.3 Delete test user data (BE CAREFUL!)
-- DELETE FROM words WHERE user_id = 'TEST-USER-UUID';
-- DELETE FROM review_sessions WHERE user_id = 'TEST-USER-UUID';
-- DELETE FROM generated_sentences WHERE user_id = 'TEST-USER-UUID';
-- DELETE FROM user_profiles WHERE user_id = 'TEST-USER-UUID';
