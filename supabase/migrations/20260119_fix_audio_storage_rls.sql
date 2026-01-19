-- Migration: Fix Audio Storage RLS Policies
-- Date: 2026-01-19
-- Issue: #25 - Storage RLS policy blocks sentence audio uploads
--
-- Problem: Audio uploads fail with "new row violates row-level security policy"
-- Solution: Add proper RLS policies for authenticated users to manage their own audio files
--
-- IMPORTANT: Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- or via supabase db push if using Supabase CLI

-- ============================================================================
-- STEP 1: Ensure the audio bucket exists and is public (read-only for all)
-- ============================================================================
-- Note: This should already exist, but idempotent creation is safe
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('audio', 'audio', true, 5242880)  -- 5MB limit
ON CONFLICT (id) DO UPDATE SET public = true;

-- ============================================================================
-- STEP 2: Drop existing policies if they exist (clean slate)
-- ============================================================================
DROP POLICY IF EXISTS "Users can upload their own audio" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own audio" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own audio" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for audio" ON storage.objects;

-- ============================================================================
-- STEP 3: Create RLS policies for the audio bucket
-- ============================================================================

-- Policy: Allow authenticated users to INSERT files in their own folder
-- Path structure: {user_id}/{word_id}.mp3 or {user_id}/sentences/{uuid}.mp3
CREATE POLICY "Users can upload their own audio"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'audio' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow authenticated users to UPDATE their own files
CREATE POLICY "Users can update their own audio"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'audio' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'audio' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow authenticated users to DELETE their own files
CREATE POLICY "Users can delete their own audio"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'audio' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow public read access (bucket is already public, but explicit policy is clearer)
CREATE POLICY "Public read access for audio"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'audio');

-- ============================================================================
-- VERIFICATION QUERY
-- Run this to verify policies were created correctly:
-- ============================================================================
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE tablename = 'objects' AND schemaname = 'storage';

-- ============================================================================
-- EXPECTED RESULT: 4 policies for the audio bucket
-- 1. "Users can upload their own audio" - INSERT
-- 2. "Users can update their own audio" - UPDATE
-- 3. "Users can delete their own audio" - DELETE
-- 4. "Public read access for audio" - SELECT
-- ============================================================================
