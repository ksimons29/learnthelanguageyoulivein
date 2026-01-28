/**
 * Capture Page Tour
 *
 * Introduces users to the word capture flow.
 * 4 steps covering input, memory context, and saving.
 *
 * Duration: ~30 seconds
 */

import { createStep } from "../driver-config";
import { tourManager, type TourDefinition } from "../tour-manager";

/**
 * Tour step definitions for the Capture page
 */
const captureTourSteps = [
  createStep({
    element: "#capture-input",
    title: "Type Any Word",
    description:
      "Enter in Portuguese or English—we detect which and translate to the other. Auto-categorization included.",
    side: "top",
    align: "center",
  }),
  createStep({
    element: "#memory-context-section",
    title: "Add Memory Context",
    description:
      "Tap to expand. Add WHERE you learned this word—a café name, a sign, a conversation. Encoding specificity means richer context = stronger memory.",
    side: "top",
    align: "center",
  }),
  createStep({
    element: "#save-button",
    title: "Save & Get Audio",
    description:
      "Your word is saved, categorized, and gets native pronunciation. We handle translation and scheduling.",
    side: "top",
    align: "center",
  }),
  createStep({
    element: "#capture-sheet",
    title: "That's It!",
    description:
      "2 seconds to capture any word. Build your personal vocabulary from real life encounters.",
    side: "top",
    align: "center",
  }),
];

/**
 * Capture tour definition with completion callback
 */
export const captureTourDefinition: TourDefinition = {
  steps: captureTourSteps,
  onStart: () => {
    console.log("[CaptureTour] Started");
  },
  onComplete: () => {
    console.log("[CaptureTour] Completed");
  },
  onClose: () => {
    console.log("[CaptureTour] Closed early");
  },
};

/**
 * Register the Capture tour with the tour manager
 * Call this when the Capture page mounts
 *
 * @param onComplete - Optional callback when tour completes (use for markTourComplete)
 */
export function registerCaptureTour(onComplete?: () => void): void {
  tourManager.registerTour("capture", {
    ...captureTourDefinition,
    onComplete: () => {
      captureTourDefinition.onComplete?.();
      onComplete?.();
    },
  });
}

/**
 * Export steps for testing
 */
export { captureTourSteps };
