/**
 * Review Session Tour
 *
 * Introduces users to the review experience.
 * 4 steps covering sentences, audio, progress, and feedback.
 * Note: Rating buttons step removed - appears only after answering.
 *
 * Duration: ~30 seconds
 */

import { createStep } from "../driver-config";
import { tourManager, type TourDefinition } from "../tour-manager";

/**
 * Tour step definitions for the Review page
 * Only includes elements that exist at page load
 */
const reviewTourSteps = [
  createStep({
    element: "#sentence-display",
    title: "Real Sentences",
    description:
      "Your words appear in sentences, not flashcards. This is how you'll use them in real life.",
    side: "bottom",
    align: "center",
  }),
  createStep({
    element: "#audio-button",
    title: "Listen First",
    description:
      "Hear how native speakers say the full sentence. Tap anytime to replay.",
    side: "bottom",
    align: "center",
  }),
  createStep({
    element: "#progress-indicator",
    title: "Track Your Progress",
    description:
      "After answering, rate how hard it was. This powers spaced repetition for optimal memory.",
    side: "bottom",
    align: "center",
  }),
  createStep({
    element: "#feedback-button",
    title: "Report Issues",
    description:
      "Found a bad translation? Tap Feedback anytime. This is beta—your input shapes the app!",
    side: "top",
    align: "center",
  }),
];

/**
 * Review tour definition with completion callback
 */
export const reviewTourDefinition: TourDefinition = {
  steps: reviewTourSteps,
  onStart: () => {
    console.log("[ReviewTour] Started");
  },
  onComplete: () => {
    console.log("[ReviewTour] Completed");
  },
  onClose: () => {
    console.log("[ReviewTour] Closed early");
  },
};

/**
 * Register the Review tour with the tour manager
 * Call this when the Review page mounts
 *
 * @param onComplete - Optional callback when tour completes (use for markTourComplete)
 */
export function registerReviewTour(onComplete?: () => void): void {
  tourManager.registerTour("review", {
    ...reviewTourDefinition,
    onComplete: () => {
      reviewTourDefinition.onComplete?.();
      onComplete?.();
    },
  });
}

/**
 * Export steps for testing
 */
export { reviewTourSteps };
