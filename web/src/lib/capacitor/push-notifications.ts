/**
 * Push Notifications Service
 *
 * Handles iOS push notifications via Capacitor.
 * Used for daily review reminders and learning streaks.
 *
 * Setup required:
 * 1. Apple Developer account with Push Notifications capability
 * 2. APNS certificate or key configured in your backend/Supabase
 * 3. Call registerForPushNotifications() after user onboarding
 *
 * Usage:
 * ```ts
 * import { registerForPushNotifications } from '@/lib/capacitor/push-notifications';
 *
 * // After user completes onboarding
 * const token = await registerForPushNotifications();
 * // Send token to your backend for push delivery
 * ```
 */

import { PushNotifications, type Token, type ActionPerformed } from '@capacitor/push-notifications';
import { isNative, isPluginAvailable } from './platform';

export interface PushNotificationToken {
  value: string;
}

/**
 * Check if push notifications are available
 */
export function isPushAvailable(): boolean {
  return isNative() && isPluginAvailable('PushNotifications');
}

/**
 * Request permission and register for push notifications
 *
 * Call this after user onboarding is complete.
 * Returns the device token to send to your backend.
 *
 * @returns Promise with the device token, or null if denied/unavailable
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!isPushAvailable()) {
    console.log('[Push] Not available on this platform');
    return null;
  }

  // Check current permission status
  const permStatus = await PushNotifications.checkPermissions();

  if (permStatus.receive === 'prompt') {
    // Request permission
    const result = await PushNotifications.requestPermissions();
    if (result.receive !== 'granted') {
      console.log('[Push] Permission denied');
      return null;
    }
  } else if (permStatus.receive !== 'granted') {
    console.log('[Push] Permission not granted:', permStatus.receive);
    return null;
  }

  // Register with Apple Push Notification service
  await PushNotifications.register();

  // Wait for registration token
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.log('[Push] Registration timeout');
      resolve(null);
    }, 10000);

    PushNotifications.addListener('registration', (token: Token) => {
      clearTimeout(timeout);
      console.log('[Push] Registered with token:', token.value.substring(0, 20) + '...');
      resolve(token.value);
    });

    PushNotifications.addListener('registrationError', (error) => {
      clearTimeout(timeout);
      console.error('[Push] Registration error:', error);
      resolve(null);
    });
  });
}

/**
 * Listen for push notification received while app is in foreground
 *
 * @param callback - Called when a notification is received
 * @returns Cleanup function
 */
export function onPushReceived(
  callback: (notification: { title?: string; body?: string; data: Record<string, unknown> }) => void
): () => void {
  if (!isPushAvailable()) return () => {};

  const listener = PushNotifications.addListener('pushNotificationReceived', (notification) => {
    callback({
      title: notification.title,
      body: notification.body,
      data: notification.data,
    });
  });

  return () => {
    listener.then((l) => l.remove());
  };
}

/**
 * Listen for push notification taps (user opened the app via notification)
 *
 * @param callback - Called when user taps a notification
 * @returns Cleanup function
 */
export function onPushTapped(
  callback: (action: { actionId: string; data: Record<string, unknown> }) => void
): () => void {
  if (!isPushAvailable()) return () => {};

  const listener = PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
    callback({
      actionId: action.actionId,
      data: action.notification.data,
    });
  });

  return () => {
    listener.then((l) => l.remove());
  };
}

/**
 * Get current delivered notifications (in notification center)
 */
export async function getDeliveredNotifications(): Promise<Array<{ id: string; title?: string; body?: string }>> {
  if (!isPushAvailable()) return [];

  const result = await PushNotifications.getDeliveredNotifications();
  return result.notifications.map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
  }));
}

/**
 * Remove all delivered notifications from notification center
 */
export async function clearAllNotifications(): Promise<void> {
  if (!isPushAvailable()) return;

  await PushNotifications.removeAllDeliveredNotifications();
}
