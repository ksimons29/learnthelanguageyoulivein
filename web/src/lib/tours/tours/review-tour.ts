/**
 * Review Session Tour
 *
 * Introduces users to the review experience.
 * 6 steps covering sentences, audio, exercises, rating, and feedback.
 *
 * Duration: ~60 seconds
 */

import { createStep } from "../driver-config";
import { tourManager, type TourDefinition } from "../tour-manager";

/**
 * Tour step definitions for the Review page
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
    element: "#answer-section",
    title: "Choose the Meaning",
    description:
      "We start with recognition. As you improve, exercises get harder—from multiple choice to typing.",
    side: "top",
    align: "center",
  }),
  createStep({
    element: "#rating-buttons",
    title: "Rate Honestly",
    description:
      "This powers the FSRS algorithm. 'Hard' isn't failure—it's feedback for better scheduling.",
    side: "top",
    align: "center",
  }),
  createStep({
    element: "#progress-indicator",
    title: "Your Progress",
    description:
      "We track 3 correct recalls across separate sessions. That's when words become 'Ready to Use'.",
    side: "bottom",
    align: "center",
  }),
  createStep({
    element: "#feedback-button",
    title: "Report Issues",
    description:
      "Found a bad translation? Tap Feedback anytime. This is beta—your input shapes the app!",
    side: "right",
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
