/**
 * Capacitor Integration
 *
 * This module provides native iOS capabilities when running inside the Capacitor shell.
 * All functions gracefully degrade to web equivalents when running in a browser.
 *
 * Key features:
 * - Platform detection (native vs web)
 * - Native audio playback (bypasses iOS restrictions)
 * - Network status monitoring (more reliable than navigator.onLine)
 * - Push notifications (iOS APNs)
 *
 * Usage:
 * ```ts
 * import { isNative, playAudio, getNetworkStatus } from '@/lib/capacitor';
 *
 * // Platform-specific behavior
 * if (isNative()) {
 *   await playAudio(url);  // Native audio
 * } else {
 *   // HTML5 Audio fallback
 * }
 * ```
 */

// Platform detection
export {
  isNative,
  isIOS,
  isWeb,
  getPlatform,
  isPluginAvailable,
} from './platform';

// Native audio
export {
  isNativeAudioAvailable,
  preloadAudio,
  playAudio,
  stopAudio,
  unloadAudio,
  setVolume,
  isPlaying,
  onAudioComplete,
  getAssetIdForUrl,
} from './native-audio';

// Network status
export {
  isNetworkPluginAvailable,
  getNetworkStatus,
  onNetworkChange,
  type NetworkStatus,
} from './network';

// Push notifications
export {
  isPushAvailable,
  registerForPushNotifications,
  onPushReceived,
  onPushTapped,
  getDeliveredNotifications,
  clearAllNotifications,
} from './push-notifications';
