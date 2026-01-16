import { createClient } from '@/lib/supabase/server';

/**
 * Audio Storage Service
 *
 * Handles storage and retrieval of audio files in Supabase Storage.
 * Audio files are stored in a CDN-enabled bucket for fast delivery.
 */

const AUDIO_BUCKET = 'audio';

/**
 * Upload audio file to Supabase Storage
 *
 * @param userId - User ID for organizing files
 * @param wordId - Word ID for unique naming
 * @param audioBuffer - Audio file buffer (MP3 format)
 * @returns Public URL to the uploaded audio file
 */
export async function uploadAudio(
  userId: string,
  wordId: string,
  audioBuffer: Buffer
): Promise<string> {
  const supabase = await createClient();

  // Naming convention: {userId}/{wordId}.mp3
  const filePath = `${userId}/${wordId}.mp3`;

  const { data, error } = await supabase.storage
    .from(AUDIO_BUCKET)
    .upload(filePath, audioBuffer, {
      contentType: 'audio/mpeg',
      upsert: true, // Replace if already exists
      cacheControl: '31536000', // Cache for 1 year (audio doesn't change)
    });

  if (error) {
    console.error('Failed to upload audio:', error);
    throw new Error(`Failed to upload audio: ${error.message}`);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(AUDIO_BUCKET).getPublicUrl(filePath);

  return publicUrl;
}

/**
 * Delete audio file from Supabase Storage
 *
 * @param userId - User ID
 * @param wordId - Word ID
 */
export async function deleteAudio(
  userId: string,
  wordId: string
): Promise<void> {
  const supabase = await createClient();
  const filePath = `${userId}/${wordId}.mp3`;

  const { error } = await supabase.storage.from(AUDIO_BUCKET).remove([filePath]);

  if (error) {
    console.error('Failed to delete audio:', error);
    // Don't throw - audio deletion is not critical
  }
}

/**
 * Initialize audio storage bucket
 *
 * This should be run once during setup to create the bucket with proper settings.
 * Can be called from a setup script or first-time initialization.
 */
export async function initializeAudioBucket(): Promise<void> {
  const supabase = await createClient();

  // Check if bucket exists
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.error('Failed to list buckets:', listError);
    return;
  }

  const bucketExists = buckets?.some((bucket) => bucket.name === AUDIO_BUCKET);

  if (!bucketExists) {
    // Create bucket
    const { error: createError } = await supabase.storage.createBucket(AUDIO_BUCKET, {
      public: true, // Public read access
      fileSizeLimit: 5 * 1024 * 1024, // 5MB per file (generous for TTS audio)
    });

    if (createError) {
      console.error('Failed to create audio bucket:', createError);
    } else {
      console.log('Audio bucket created successfully');
    }
  }
}
