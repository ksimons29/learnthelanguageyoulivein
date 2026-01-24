/**
 * Progress Page Tour
 *
 * Introduces users to the progress tracking dashboard.
 * 3 steps covering stats, forecast, and streaks.
 *
 * Duration: ~20 seconds
 */

import { createStep } from "../driver-config";
import { tourManager, type TourDefinition } from "../tour-manager";

/**
 * Tour step definitions for the Progress page
 */
const progressTourSteps = [
  createStep({
    element: "#stats-overview",
    title: "Your Learning Stats",
    description:
      "Words captured, accuracy rate, and total vocabulary—everything tracked automatically.",
    side: "bottom",
    align: "center",
  }),
  createStep({
    element: "#forecast-chart",
    title: "Science-Based Scheduling",
    description:
      "FSRS-4.5 algorithm predicts when you'll forget. Reviews happen at the perfect time for retention.",
    side: "top",
    align: "center",
  }),
  createStep({
    element: "#streak-section",
    title: "Build Consistency",
    description:
      "Daily streaks unlock Boss Rounds and Bingo challenges. Make learning a habit!",
    side: "top",
    align: "center",
  }),
];

/**
 * Progress tour definition with completion callback
 */
export const progressTourDefinition: TourDefinition = {
  steps: progressTourSteps,
  onStart: () => {
    console.log("[ProgressTour] Started");
  },
  onComplete: () => {
    console.log("[ProgressTour] Completed");
  },
  onClose: () => {
    console.log("[ProgressTour] Closed early");
  },
};

/**
 * Register the Progress tour with the tour manager
 * Call this when the Progress page mounts
 *
 * @param onComplete - Optional callback when tour completes (use for markTourComplete)
 */
export function registerProgressTour(onComplete?: () => void): void {
  tourManager.registerTour("progress", {
    ...progressTourDefinition,
    onComplete: () => {
      progressTourDefinition.onComplete?.();
      onComplete?.();
    },
  });
}

/**
 * Export steps for testing
 */
export { progressTourSteps };
