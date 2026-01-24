/**
 * Notebook Browser Tour
 *
 * Introduces users to the notebook where all captured words are organized.
 * 4 steps covering categories, inbox, search, and mastery tracking.
 *
 * Duration: ~30 seconds
 */

import { createStep } from "../driver-config";
import { tourManager, type TourDefinition } from "../tour-manager";

/**
 * Tour step definitions for the Notebook page
 */
const notebookTourSteps = [
  createStep({
    element: "#category-grid",
    title: "Your Words by Category",
    description:
      "Food, work, social, transport—AI organizes everything automatically based on context.",
    side: "top",
    align: "center",
  }),
  createStep({
    element: "#inbox-category",
    title: "Check Your Inbox",
    description:
      "New words land here first. After your first review, they get properly categorized.",
    side: "bottom",
    align: "center",
  }),
  createStep({
    element: "#search-bar",
    title: "Search Anytime",
    description:
      "Looking for a specific word? Search across all categories instantly.",
    side: "bottom",
    align: "center",
  }),
  createStep({
    element: "#journal-header",
    title: "Track Your Progress",
    description:
      "Learning → Learned → Ready to Use. Watch your vocabulary grow over time.",
    side: "bottom",
    align: "center",
  }),
];

/**
 * Notebook tour definition with completion callback
 */
export const notebookTourDefinition: TourDefinition = {
  steps: notebookTourSteps,
  onStart: () => {
    console.log("[NotebookTour] Started");
  },
  onComplete: () => {
    console.log("[NotebookTour] Completed");
  },
  onClose: () => {
    console.log("[NotebookTour] Closed early");
  },
};

/**
 * Register the Notebook tour with the tour manager
 * Call this when the Notebook page mounts
 *
 * @param onComplete - Optional callback when tour completes (use for markTourComplete)
 */
export function registerNotebookTour(onComplete?: () => void): void {
  tourManager.registerTour("notebook", {
    ...notebookTourDefinition,
    onComplete: () => {
      notebookTourDefinition.onComplete?.();
      onComplete?.();
    },
  });
}

/**
 * Export steps for testing
 */
export { notebookTourSteps };
