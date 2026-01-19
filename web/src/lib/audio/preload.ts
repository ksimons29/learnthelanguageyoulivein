import type { Word } from "@/lib/db/schema";

/**
 * Audio Preloader
 *
 * Preloads audio files into the browser cache for offline access.
 * Uses the Cache API to populate the service worker's audio-cache.
 */

const AUDIO_CACHE_NAME = "audio-cache";

/**
 * Preload audio files for a list of words
 *
 * This populates the service worker's cache with audio files
 * so they're available offline during review sessions.
 *
 * @param words - Words with audio URLs to preload
 * @returns Number of successfully cached audio files
 */
export async function preloadSessionAudio(words: Word[]): Promise<number> {
  // Check if Cache API is available
  if (typeof caches === "undefined") {
    console.warn("[Preload] Cache API not available");
    return 0;
  }

  // Filter words with audio URLs
  const wordsWithAudio = words.filter((word) => word.audioUrl);

  if (wordsWithAudio.length === 0) {
    return 0;
  }

  let cachedCount = 0;

  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);

    // Preload each audio file
    const preloadPromises = wordsWithAudio.map(async (word) => {
      if (!word.audioUrl) return false;

      try {
        // Check if already cached
        const cached = await cache.match(word.audioUrl);
        if (cached) {
          return true; // Already cached
        }

        // Fetch and cache
        const response = await fetch(word.audioUrl, {
          mode: "cors",
          credentials: "omit",
        });

        if (response.ok) {
          await cache.put(word.audioUrl, response.clone());
          return true;
        }
        return false;
      } catch (error) {
        console.warn(`[Preload] Failed to cache audio for word ${word.id}:`, error);
        return false;
      }
    });

    const results = await Promise.all(preloadPromises);
    cachedCount = results.filter(Boolean).length;

    console.log(`[Preload] Cached ${cachedCount}/${wordsWithAudio.length} audio files`);
  } catch (error) {
    console.error("[Preload] Cache error:", error);
  }

  return cachedCount;
}

/**
 * Check how many audio files are already cached
 *
 * Useful for showing progress or determining if preload is needed.
 */
export async function getCachedAudioCount(words: Word[]): Promise<number> {
  if (typeof caches === "undefined") return 0;

  const wordsWithAudio = words.filter((word) => word.audioUrl);
  if (wordsWithAudio.length === 0) return 0;

  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    let count = 0;

    for (const word of wordsWithAudio) {
      if (word.audioUrl) {
        const cached = await cache.match(word.audioUrl);
        if (cached) count++;
      }
    }

    return count;
  } catch {
    return 0;
  }
}

/**
 * Clear the audio cache
 *
 * Useful for freeing up storage space.
 */
export async function clearAudioCache(): Promise<void> {
  if (typeof caches === "undefined") return;

  try {
    await caches.delete(AUDIO_CACHE_NAME);
    console.log("[Preload] Audio cache cleared");
  } catch (error) {
    console.error("[Preload] Failed to clear cache:", error);
  }
}
