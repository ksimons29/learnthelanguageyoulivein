/**
 * Product Tours Module
 *
 * Export all tour-related utilities for easy importing.
 *
 * @example
 * ```ts
 * import { tourManager, createStep, type TourId } from '@/lib/tours';
 *
 * tourManager.startTour('capture');
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
