import {
  getPendingReviews,
  markReviewSynced,
  deleteReview,
  clearSyncedReviews,
} from "./review-queue";

/**
 * Sync Service
 *
 * Handles syncing offline reviews to the server when back online.
 */

let isSyncing = false;

/**
 * Sync all pending reviews to the server
 *
 * Returns the number of successfully synced reviews.
 */
export async function syncPendingReviews(): Promise<number> {
  // Prevent concurrent syncs
  if (isSyncing) return 0;
  isSyncing = true;

  let syncedCount = 0;

  try {
    const pending = await getPendingReviews();

    if (pending.length === 0) {
      return 0;
    }

    console.log(`[Sync] Starting sync of ${pending.length} pending reviews`);

    for (const review of pending) {
      try {
        const response = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wordId: review.wordId,
            rating: review.rating,
            sessionId: review.sessionId,
          }),
        });

        if (response.ok) {
          // Mark as synced and delete
          await markReviewSynced(review.id);
          await deleteReview(review.id);
          syncedCount++;
          console.log(`[Sync] Synced review for word ${review.wordId}`);
        } else {
          console.warn(`[Sync] Failed to sync review ${review.id}: ${response.status}`);
        }
      } catch (error) {
        console.error(`[Sync] Error syncing review ${review.id}:`, error);
        // Continue with other reviews
      }
    }

    // Clean up any orphaned synced reviews
    await clearSyncedReviews();

    console.log(`[Sync] Completed: ${syncedCount}/${pending.length} reviews synced`);
  } finally {
    isSyncing = false;
  }

  return syncedCount;
}

/**
 * Setup automatic sync on online event
 *
 * Call this once when the app initializes.
 */
export function setupAutoSync(): void {
  if (typeof window === "undefined") return;

  window.addEventListener("online", async () => {
    console.log("[Sync] Back online, starting sync...");
    const count = await syncPendingReviews();
    if (count > 0) {
      console.log(`[Sync] Synced ${count} offline reviews`);
    }
  });
}

/**
 * Check if sync is currently in progress
 */
export function isSyncInProgress(): boolean {
  return isSyncing;
}
