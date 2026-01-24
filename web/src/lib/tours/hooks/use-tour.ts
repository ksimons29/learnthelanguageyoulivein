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
  const [tourProgress, setTourProgress] = useState<TourProgress | null>(null);
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
   * Persists to database and updates local state
   */
  const markTourComplete = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      const response = await fetch("/api/tours/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tourId }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark tour as complete");
      }

      // Update local state to reflect completion
      setTourProgress((prev) => {
        if (!prev) {
          // Create new progress object with this tour completed
          return {
            today: tourId === "today",
            capture: tourId === "capture",
            review: tourId === "review",
            notebook: tourId === "notebook",
            progress: tourId === "progress",
          };
        }
        return {
          ...prev,
          [tourId]: true,
        };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err; // Re-throw so caller knows it failed
    }
  }, [tourId]);

  return {
    isCompleted: tourProgress?.[tourId] ?? false,
    isLoading: authLoading || isLoading,
    error,
    startTour,
    markTourComplete,
  };
}
