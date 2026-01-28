/**
 * Notebook Browser Tour
 *
 * Introduces users to the notebook where all captured words are organized.
 * 6 steps covering categories, inbox, search, category cards, and mastery tracking.
 *
 * Duration: ~30 seconds
 */

import { createStep, createScrollingStep } from "../driver-config";
import { tourManager, type TourDefinition } from "../tour-manager";

/**
 * Tour step definitions for the Notebook page
 */
const notebookTourSteps = [
  // Start with the nav button to show where we are
  createStep({
    element: "#nav-notebook",
    title: "Your Notebook",
    description:
      "This is your notebook—where all captured phrases are organized and ready to explore.",
    side: "top",
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
  createStep({
    element: "#search-bar",
    title: "Search Anytime",
    description:
      "Looking for a specific word? Search across all categories instantly.",
    side: "bottom",
    align: "center",
  }),
  // Scroll these into view on mobile
  createScrollingStep({
    element: "#inbox-category",
    title: "Check Your Inbox",
    description:
      "New words land here first. After your first review, they get properly categorized.",
    side: "bottom",
    align: "center",
  }),
  createScrollingStep({
    element: "#first-category-card",
    title: "Explore a Category",
    description:
      "Tap any category to see all your words. Each card expands to show the sentence, audio, and your memory context.",
    side: "bottom",
    align: "center",
  }),
  createScrollingStep({
    element: "#category-grid",
    title: "Your Words by Category",
    description:
      "Food, work, social, transport—AI organizes everything automatically based on context.",
    side: "top",
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
