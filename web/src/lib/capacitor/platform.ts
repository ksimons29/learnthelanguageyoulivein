/**
 * Platform Detection Utilities
 *
 * Detects whether the app is running in a native Capacitor shell (iOS app)
 * or in a standard web browser. This allows progressive enhancement:
 * - Web: Uses standard HTML5 APIs
 * - Native: Uses enhanced Capacitor plugins for better UX
 *
 * Usage:
 * ```ts
 * import { isNative, isIOS, getPlatform } from '@/lib/capacitor/platform';
 *
 * if (isNative()) {
 *   // Use native audio player
 * } else {
 *   // Use HTML5 Audio
 * }
 * ```
 */

import { Capacitor } from '@capacitor/core';

/**
 * Check if running inside a native Capacitor shell
 *
 * Returns true when the app is running in the iOS app wrapper,
 * false when running in a web browser.
 */
export function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Check if running on iOS (native or Safari)
 */
export function isIOS(): boolean {
  const platform = Capacitor.getPlatform();
  return platform === 'ios';
}

/**
 * Check if running on web (any browser)
 */
export function isWeb(): boolean {
  return Capacitor.getPlatform() === 'web';
}

/**
 * Get the current platform
 *
 * @returns 'ios' | 'android' | 'web'
 */
export function getPlatform(): 'ios' | 'android' | 'web' {
  return Capacitor.getPlatform() as 'ios' | 'android' | 'web';
}

/**
 * Check if a specific Capacitor plugin is available
 *
 * Useful for graceful degradation when a plugin isn't installed
 * or isn't available on the current platform.
 *
 * @param pluginName - The name of the plugin to check
 */
export function isPluginAvailable(pluginName: string): boolean {
  return Capacitor.isPluginAvailable(pluginName);
}
