/**
 * Today Dashboard Tour
 *
 * Introduces new users to the main dashboard after onboarding.
 * 10 steps covering the core features: review, capture, daily goal, feedback, practice, progress, and navigation.
 *
 * Duration: ~60 seconds
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
    title: "Words to Practice",
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
  createScrollingStep({
    element: "#tour-daily-bingo",
    title: "Daily Bingo",
    description:
      "Complete daily challenges to fill your bingo board. Capture words, review, and hit streaks to earn squares!",
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
  createStep({
    element: "#feedback-button",
    title: "Share Your Feedback",
    description:
      "Found a bug or have a suggestion? Tap here to let us know. Your feedback shapes the app.",
    side: "right",
    align: "center",
  }),
  // Capture FAB - the prominent red + button
  createStep({
    element: "#tour-capture-fab",
    title: "Capture Words Anytime",
    description:
      "Tap the red + button to save words you hear or see. 2 seconds to capture, auto-translation included.",
    side: "bottom",
    align: "center",
  }),
  // Nav items are fixed, position popover above them
  createStep({
    element: "#nav-practice",
    title: "Practice with AI Sentences",
    description:
      "Review due words here. Each word appears in a unique AI-generated sentence—never the same twice.",
    side: "top",
    align: "center",
  }),
  createStep({
    element: "#nav-progress",
    title: "Track Your Progress",
    description:
      "See your learning stats, streaks, and mastery levels. Watch your vocabulary grow over time.",
    side: "top",
    align: "center",
  }),
  createStep({
    element: "#tour-bottom-nav",
    title: "Navigate Your Notebook",
    description:
      "Practice • Capture • Notebook • Progress. Everything you need is one tap away.",
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
