/**
 * Product Tours Module
 *
 * Export all tour-related utilities for easy importing.
 *
 * @example
 * ```ts
 * import { tourManager, useTour, createStep, type TourId } from '@/lib/tours';
 *
 * // In a component
 * const { isCompleted, startTour } = useTour('capture');
 * ```
 */

// Tour manager singleton and types
export {
  tourManager,
  type TourId,
  type TourDefinition,
} from "./tour-manager";

// Tour creation utilities
export {
  createTour,
  createStep,
  DRIVER_CONFIG,
  isDarkMode,
  type TourStepOptions,
} from "./driver-config";

// React hooks
export { useTour } from "./hooks/use-tour";

// Tour definitions
export {
  registerTodayTour,
  todayTourDefinition,
  todayTourSteps,
} from "./tours/today-tour";
