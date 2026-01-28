"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { tourManager, type TourId } from "../tour-manager";

/**
 * Tour completion status for all tours
 */
interface TourProgress {
  today: boolean;
  capture: boolean;
  review: boolean;
  notebook: boolean;
  progress: boolean;
}

/**
 * LocalStorage key for caching tour progress
 * Prevents race condition where isCompleted returns false while API is fetching
 */
const TOUR_CACHE_KEY = "llyli_tour_progress";

/**
 * Get cached tour progress from localStorage
 * Returns null if not available or invalid
 */
function getCachedProgress(): TourProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const cached = localStorage.getItem(TOUR_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

/**
 * Cache tour progress to localStorage
 */
function cacheProgress(progress: TourProgress): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TOUR_CACHE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore localStorage errors (quota exceeded, private browsing, etc.)
  }
}

/**
 * Return type for the useTour hook
 */
interface UseTourReturn {
  /** Whether this specific tour has been completed */
  isCompleted: boolean;
  /** Whether the completion status is being fetched */
  isLoading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Start the tour (calls tourManager.startTour) */
  startTour: () => boolean;
  /** Mark the tour as complete (persists to database) */
  markTourComplete: () => Promise<void>;
}

/**
 * Hook for managing tour state
 *
 * Fetches tour completion status from the API and provides
 * functions to start tours and mark them as complete.
 *
 * @param tourId - The tour to manage
 * @returns Tour state and control functions
 *
 * @example
 * ```tsx
 * function CapturePageTour() {
 *   const { isCompleted, isLoading, startTour, markTourComplete } = useTour('capture');
 *
 *   // Auto-start tour for new users
 *   useEffect(() => {
 *     if (!isLoading && !isCompleted) {
 *       startTour();
 *     }
 *   }, [isLoading, isCompleted, startTour]);
 *
 *   return <button onClick={startTour}>Replay Tour</button>;
 * }
 * ```
 */
export function useTour(tourId: TourId): UseTourReturn {
  const { user, isLoading: authLoading } = useAuthStore();
  // Initialize with cached value to prevent race condition
  const [tourProgress, setTourProgress] = useState<TourProgress | null>(
    () => getCachedProgress()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tour completion status
  useEffect(() => {
    // Don't fetch if still loading auth
    if (authLoading) {
      return;
    }

    // No user = no tour progress to fetch
    if (!user) {
      setIsLoading(false);
      setTourProgress(null);
      return;
    }

    const fetchTourProgress = async () => {
      try {
        setError(null);
        const response = await fetch("/api/tours/progress");

        if (!response.ok) {
          throw new Error("Failed to fetch tour progress");
        }

        const { data } = await response.json();
        setTourProgress(data);
        cacheProgress(data); // Cache for future page loads
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTourProgress();
  }, [user, authLoading]);

  /**
   * Start the tour using the tour manager
   * Returns true if tour started successfully
   */
  const startTour = useCallback((): boolean => {
    return tourManager.startTour(tourId);
  }, [tourId]);

  /**
   * Mark the tour as complete
   * Uses optimistic update with localStorage cache + server persistence with retry
   */
  const markTourComplete = useCallback(async (): Promise<void> => {
    // Optimistic update: immediately update cache and state
    const currentCache = getCachedProgress() || {
      today: false,
      capture: false,
      review: false,
      notebook: false,
      progress: false,
    };
    const updatedProgress = { ...currentCache, [tourId]: true };
    cacheProgress(updatedProgress);
    setTourProgress(updatedProgress);
    setError(null);

    // Persist to server with retry logic
    const maxAttempts = 3;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch("/api/tours/progress", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tourId }),
        });

        if (response.ok) {
          return; // Success, exit
        }

        // Non-retryable error (e.g., 4xx)
        if (response.status < 500) {
          console.warn(`[Tour] Failed to persist ${tourId}: ${response.status}`);
          return;
        }
      } catch {
        // Network error, will retry
      }

      // Wait before retry (exponential backoff: 1s, 2s, 4s)
      if (attempt < maxAttempts - 1) {
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
      }
    }

    console.warn(`[Tour] Failed to persist ${tourId} completion after ${maxAttempts} attempts`);
  }, [tourId]);

  return {
    isCompleted: tourProgress?.[tourId] ?? false,
    isLoading: authLoading || isLoading,
    error,
    startTour,
    markTourComplete,
  };
}
