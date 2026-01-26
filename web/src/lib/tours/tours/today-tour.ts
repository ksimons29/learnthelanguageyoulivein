/**
 * Today Dashboard Tour
 *
 * Introduces new users to the main dashboard after onboarding.
 * 5 steps covering the core features: review, capture, daily goal, and navigation.
 *
 * Duration: ~45 seconds
 */

import { createStep, createScrollingStep } from "../driver-config";
import { tourManager, type TourDefinition } from "../tour-manager";

/**
 * Tour step definitions for the Today dashboard
 */
const todayTourSteps = [
  createStep({
    element: "#tour-welcome",
    title: "Welcome to LLYLI!",
    description:
      "Your language notebook for words you encounter in real life. Let's show you around.",
    side: "bottom",
    align: "start",
  }),
  // Scroll these elements into view on mobile
  createScrollingStep({
    element: "#tour-due-today",
    title: "Words to Review",
    description:
      "When words are ready to practice, they appear here. Our AI creates unique sentences—never the same twice.",
    side: "bottom",
    align: "center",
  }),
  createScrollingStep({
    element: "#daily-goal-stat",
    title: "Daily Goal",
    description:
      "Review 10 words per day. That's it. Clear 'done for today' so you never over-study.",
    side: "top",
    align: "center",
  }),
  createStep({
    element: "#tour-info-button",
    title: "Learn About LLYLI",
    description:
      "Tap here to see the science behind spaced repetition, sign out, or explore app features.",
    side: "bottom",
    align: "end",
  }),
  // Nav items are fixed, position popover above them
  createStep({
    element: "#nav-capture",
    title: "Capture Words Anytime",
    description:
      "Tap Capture to save words you hear or see. 2 seconds to capture, auto-translation included.",
    side: "top",
    align: "center",
  }),
  createStep({
    element: "#tour-bottom-nav",
    title: "Navigate Your Notebook",
    description:
      "Review • Capture • Notebook • Progress. Everything you need is one tap away.",
    side: "top",
    align: "center",
  }),
];

/**
 * Today tour definition with completion callback
 */
export const todayTourDefinition: TourDefinition = {
  steps: todayTourSteps,
  onStart: () => {
    console.log("[TodayTour] Started");
  },
  onComplete: () => {
    console.log("[TodayTour] Completed");
  },
  onClose: () => {
    console.log("[TodayTour] Closed early");
  },
};

/**
 * Register the Today tour with the tour manager
 * Call this when the Today page mounts
 *
 * @param onComplete - Optional callback when tour completes (use for markTourComplete)
 */
export function registerTodayTour(onComplete?: () => void): void {
  // Always re-register to update the onComplete callback
  tourManager.registerTour("today", {
    ...todayTourDefinition,
    onComplete: () => {
      todayTourDefinition.onComplete?.();
      onComplete?.();
    },
  });
}

/**
 * Export steps for testing
 */
export { todayTourSteps };
