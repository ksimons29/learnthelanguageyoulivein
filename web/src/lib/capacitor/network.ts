/**
 * Network Status Service
 *
 * Enhanced network detection using Capacitor Network plugin.
 * Provides more reliable offline detection than navigator.onLine,
 * especially on iOS where the browser API can be unreliable.
 *
 * Usage:
 * ```ts
 * import { getNetworkStatus, onNetworkChange } from '@/lib/capacitor/network';
 *
 * const { connected, connectionType } = await getNetworkStatus();
 *
 * const cleanup = onNetworkChange((status) => {
 *   if (status.connected) syncPendingReviews();
 * });
 * ```
 */

import { Network, type ConnectionStatus } from '@capacitor/network';
import { isNative, isPluginAvailable } from './platform';

export interface NetworkStatus {
  connected: boolean;
  connectionType: 'wifi' | 'cellular' | 'none' | 'unknown';
}

/**
 * Check if native network detection is available
 */
export function isNetworkPluginAvailable(): boolean {
  return isNative() && isPluginAvailable('Network');
}

/**
 * Get current network status
 *
 * Uses Capacitor plugin on native, falls back to navigator.onLine on web.
 */
export async function getNetworkStatus(): Promise<NetworkStatus> {
  if (isNetworkPluginAvailable()) {
    const status = await Network.getStatus();
    return {
      connected: status.connected,
      connectionType: status.connectionType,
    };
  }

  // Fallback for web
  return {
    connected: typeof navigator !== 'undefined' ? navigator.onLine : true,
    connectionType: 'unknown',
  };
}

/**
 * Listen for network status changes
 *
 * @param callback - Called whenever network status changes
 * @returns Cleanup function to remove the listener
 */
export function onNetworkChange(
  callback: (status: NetworkStatus) => void
): () => void {
  if (isNetworkPluginAvailable()) {
    // Use native plugin for more reliable detection
    const listener = Network.addListener('networkStatusChange', (status: ConnectionStatus) => {
      callback({
        connected: status.connected,
        connectionType: status.connectionType,
      });
    });

    return () => {
      listener.then((l) => l.remove());
    };
  }

  // Fallback for web
  if (typeof window === 'undefined') return () => {};

  const handleOnline = () => callback({ connected: true, connectionType: 'unknown' });
  const handleOffline = () => callback({ connected: false, connectionType: 'none' });

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}
