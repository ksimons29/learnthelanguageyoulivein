/**
 * Tour Manager - Orchestrates product tours across the app
 *
 * Singleton pattern for registering and starting tours by ID.
 * Tours are lazy-loaded when started to minimize initial bundle size.
 *
 * @example
 * ```ts
 * // Register a tour (typically in the tour definition file)
 * tourManager.registerTour('capture', captureSteps);
 *
 * // Start a tour (from any component)
 * tourManager.startTour('capture');
 * ```
 */

import { type DriveStep } from "driver.js";
import { createTour } from "./driver-config";

/**
 * Available tour identifiers
 * Each corresponds to a specific page/feature tour
 */
export type TourId =
  | "today" // Today dashboard tour
  | "capture" // Word capture flow
  | "review" // Review session mechanics
  | "notebook" // Notebook browser
  | "progress"; // Progress tracking

/**
 * Tour definition with steps and optional callbacks
 */
export interface TourDefinition {
  /** Tour steps */
  steps: DriveStep[];
  /** Called when tour starts */
  onStart?: () => void;
  /** Called when tour completes (all steps finished) */
  onComplete?: () => void;
  /** Called when tour is closed early */
  onClose?: () => void;
}

/**
 * Tour Manager Class
 * Manages registration and execution of product tours
 */
class TourManager {
  /** Registered tours by ID */
  private tours: Map<TourId, TourDefinition> = new Map();

  /** Currently active tour instance */
  private activeTour: ReturnType<typeof createTour> | null = null;

  /** Currently active tour ID */
  private activeTourId: TourId | null = null;

  /**
   * Register a tour definition
   *
   * @param id - Unique tour identifier
   * @param definition - Tour steps and callbacks
   */
  registerTour(id: TourId, definition: TourDefinition): void {
    this.tours.set(id, definition);
  }

  /**
   * Register a tour with just steps (convenience method)
   *
   * @param id - Unique tour identifier
   * @param steps - Array of tour steps
   */
  registerSteps(id: TourId, steps: DriveStep[]): void {
    this.tours.set(id, { steps });
  }

  /**
   * Check if a tour is registered
   */
  hasTour(id: TourId): boolean {
    return this.tours.has(id);
  }

  /**
   * Get all registered tour IDs
   */
  getRegisteredTours(): TourId[] {
    return Array.from(this.tours.keys());
  }

  /**
   * Start a tour by ID
   *
   * @param tourId - The tour to start
   * @returns true if tour started, false if not found or already active
   */
  startTour(tourId: TourId): boolean {
    // Don't start if another tour is active
    if (this.activeTour) {
      console.warn(
        `[TourManager] Cannot start "${tourId}" - tour "${this.activeTourId}" is already active`
      );
      return false;
    }

    const definition = this.tours.get(tourId);
    if (!definition) {
      console.warn(`[TourManager] Tour "${tourId}" not found`);
      return false;
    }

    // Call onStart callback if provided
    definition.onStart?.();

    // Create and start the tour
    this.activeTour = createTour(definition.steps, {
      onDestroyStarted: () => {
        // Tour is being closed (either completed or dismissed)
        const wasCompleted = this.activeTour?.isLastStep?.();

        if (wasCompleted) {
          definition.onComplete?.();
        } else {
          definition.onClose?.();
        }

        // Clean up
        this.activeTour = null;
        this.activeTourId = null;
      },
    });

    this.activeTourId = tourId;
    this.activeTour.drive();

    return true;
  }

  /**
   * Stop the currently active tour
   */
  stopTour(): void {
    if (this.activeTour) {
      this.activeTour.destroy();
      this.activeTour = null;
      this.activeTourId = null;
    }
  }

  /**
   * Check if a tour is currently active
   */
  isActive(): boolean {
    return this.activeTour !== null;
  }

  /**
   * Get the currently active tour ID
   */
  getActiveTourId(): TourId | null {
    return this.activeTourId;
  }

  /**
   * Move to next step in active tour
   */
  nextStep(): void {
    this.activeTour?.moveNext();
  }

  /**
   * Move to previous step in active tour
   */
  previousStep(): void {
    this.activeTour?.movePrevious();
  }

  /**
   * Check if current step is the last one
   */
  isLastStep(): boolean {
    return this.activeTour?.isLastStep?.() ?? false;
  }
}

/**
 * Singleton tour manager instance
 * Use this for all tour operations
 */
export const tourManager = new TourManager();

/**
 * Re-export for convenience
 */
export { createTour, createStep } from "./driver-config";
export type { TourStepOptions } from "./driver-config";
