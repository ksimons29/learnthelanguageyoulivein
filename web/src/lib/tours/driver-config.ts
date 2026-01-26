/**
 * Driver.js Configuration with Moleskine Theme
 *
 * Core setup for product tours with design system integration.
 * Supports both light and dark modes automatically via CSS variables.
 *
 * @see https://driverjs.com/docs/configuration
 */

import { driver, type Config, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import "@/styles/driver-moleskine.css";

/**
 * Base configuration for all tours
 * Uses Moleskine design system with automatic dark mode support
 */
export const DRIVER_CONFIG: Partial<Config> = {
  // Show step progress (e.g., "2 of 5")
  showProgress: true,

  // Navigation buttons to show
  showButtons: ["next", "previous", "close"],

  // Progress text template
  progressText: "{{current}} of {{total}}",

  // Button labels
  nextBtnText: "Next",
  prevBtnText: "Back",
  doneBtnText: "Got it!",

  // Custom popover class for Moleskine styling
  popoverClass: "moleskine-tour-popover",

  // Smooth scrolling to highlighted elements
  smoothScroll: true,

  // Allow closing with overlay click
  allowClose: true,

  // Keyboard navigation
  allowKeyboardControl: true,

  // Stage settings (the cutout window around highlighted element)
  stagePadding: 8,
  stageRadius: 8,

  // Animation settings
  animate: true,

  // Callbacks can be added per-tour
};

/**
 * Create a Driver.js tour instance with Moleskine styling
 *
 * @param steps - Array of tour steps
 * @param config - Optional additional configuration
 * @returns Configured driver instance
 *
 * @example
 * ```ts
 * const tour = createTour([
 *   { element: '#capture-btn', popover: { title: 'Capture', description: '...' } }
 * ]);
 * tour.drive();
 * ```
 */
export function createTour(
  steps: DriveStep[],
  config?: Partial<Config>
): ReturnType<typeof driver> {
  return driver({
    ...DRIVER_CONFIG,
    ...config,
    steps,
  });
}

/**
 * Tour step builder helper for consistent step creation
 */
export interface TourStepOptions {
  /** CSS selector for the target element */
  element: string;
  /** Step title (displayed in serif font) */
  title: string;
  /** Step description */
  description: string;
  /** Position of popover relative to element */
  side?: "top" | "bottom" | "left" | "right";
  /** Alignment of popover */
  align?: "start" | "center" | "end";
  /** Optional callback when step is shown */
  onHighlightStarted?: () => void;
  /** Optional callback when step is hidden */
  onDeselected?: () => void;
}

/**
 * Create a standardized tour step
 */
export function createStep(options: TourStepOptions): DriveStep {
  return {
    element: options.element,
    popover: {
      title: options.title,
      description: options.description,
      side: options.side || "bottom",
      align: options.align || "center",
      // Note: Don't set onNextClick/onPrevClick to undefined - it overrides default behavior
    },
    onHighlightStarted: options.onHighlightStarted,
    onDeselected: options.onDeselected,
  };
}

/**
 * Check if user prefers dark mode
 * Used for dynamic styling if needed
 */
export function isDarkMode(): boolean {
  if (typeof window === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

/**
 * Check if we're on a mobile screen
 */
export function isMobileScreen(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth <= 640;
}

/**
 * Scroll an element into view for tour highlighting
 *
 * On mobile: Scrolls to TOP of viewport, leaving room for the bottom sheet popover
 * On desktop: Scrolls to CENTER for traditional tooltip positioning
 */
export function scrollIntoViewForTour(selector: string): void {
  if (typeof window === "undefined") return;

  const element = document.querySelector(selector);
  if (!element) return;

  // On mobile, scroll to top to leave room for bottom sheet
  // On desktop, scroll to center for better tooltip positioning
  const blockPosition = isMobileScreen() ? "start" : "center";

  element.scrollIntoView({
    behavior: "smooth",
    block: blockPosition,
    inline: "center",
  });
}

/**
 * Create a step with automatic scroll-into-view behavior
 * This ensures elements are visible on mobile before highlighting
 *
 * The scroll happens when the highlight starts, positioning the element
 * appropriately for the mobile bottom sheet or desktop tooltip.
 */
export function createScrollingStep(options: TourStepOptions): DriveStep {
  return {
    element: options.element,
    popover: {
      title: options.title,
      description: options.description,
      side: options.side || "bottom",
      align: options.align || "center",
    },
    onHighlightStarted: () => {
      scrollIntoViewForTour(options.element);
      options.onHighlightStarted?.();
    },
    onDeselected: options.onDeselected,
  };
}
