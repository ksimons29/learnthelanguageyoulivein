import { openDB, type IDBPDatabase } from "idb";

/**
 * Offline Review Queue
 *
 * Stores reviews in IndexedDB when offline.
 * Reviews are synced to the server when back online.
 */

const DB_NAME = "llyli-offline";
const DB_VERSION = 1;
const STORE_NAME = "pending-reviews";

interface PendingReview {
  id: string;
  wordId: string;
  rating: 1 | 2 | 3 | 4;
  sessionId: string | null;
  createdAt: string;
  synced: boolean;
}

interface LlyliDB {
  "pending-reviews": {
    key: string;
    value: PendingReview;
    indexes: { "by-synced": boolean };
  };
}

let dbPromise: Promise<IDBPDatabase<LlyliDB>> | null = null;

/**
 * Get or create database connection
 */
function getDB(): Promise<IDBPDatabase<LlyliDB>> {
  if (!dbPromise) {
    dbPromise = openDB<LlyliDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
          store.createIndex("by-synced", "synced");
        }
      },
    });
  }
  return dbPromise;
}

/**
 * Generate a unique ID for a review
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Queue a review for later sync
 */
export async function queueOfflineReview(
  wordId: string,
  rating: 1 | 2 | 3 | 4,
  sessionId: string | null
): Promise<void> {
  const db = await getDB();

  const review: PendingReview = {
    id: generateId(),
    wordId,
    rating,
    sessionId,
    createdAt: new Date().toISOString(),
    synced: false,
  };

  await db.put(STORE_NAME, review);
}

/**
 * Get all pending (unsynced) reviews
 */
export async function getPendingReviews(): Promise<PendingReview[]> {
  const db = await getDB();
  const allReviews = await db.getAll(STORE_NAME);
  return allReviews.filter((review) => !review.synced);
}

/**
 * Mark a review as synced
 */
export async function markReviewSynced(id: string): Promise<void> {
  const db = await getDB();
  const review = await db.get(STORE_NAME, id);

  if (review) {
    review.synced = true;
    await db.put(STORE_NAME, review);
  }
}

/**
 * Delete a synced review
 */
export async function deleteReview(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

/**
 * Clear all synced reviews (cleanup)
 */
export async function clearSyncedReviews(): Promise<void> {
  const db = await getDB();
  const allReviews = await db.getAll(STORE_NAME);
  const synced = allReviews.filter((review) => review.synced);

  const tx = db.transaction(STORE_NAME, "readwrite");
  await Promise.all([
    ...synced.map((review) => tx.store.delete(review.id)),
    tx.done,
  ]);
}

/**
 * Get count of pending reviews
 */
export async function getPendingCount(): Promise<number> {
  const reviews = await getPendingReviews();
  return reviews.length;
}
