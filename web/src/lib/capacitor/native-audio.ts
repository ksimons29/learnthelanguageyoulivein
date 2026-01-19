/**
 * Native Audio Service
 *
 * Provides enhanced audio playback on iOS using the Capacitor Native Audio plugin.
 * Falls back to standard HTML5 Audio on web browsers.
 *
 * Benefits of native audio on iOS:
 * - No autoplay restrictions (plays immediately)
 * - Better performance (native audio engine)
 * - Background playback support
 * - Plays in silent mode (with proper configuration)
 */

import { NativeAudio } from '@capacitor-community/native-audio';
import { isNative, isPluginAvailable } from './platform';

// Track loaded audio assets by URL
const loadedAssets = new Map<string, string>();
let assetIdCounter = 0;

/**
 * Check if native audio is available
 */
export function isNativeAudioAvailable(): boolean {
  return isNative() && isPluginAvailable('NativeAudio');
}

/**
 * Generate a unique asset ID for a URL
 */
function getAssetId(url: string): string {
  if (!loadedAssets.has(url)) {
    loadedAssets.set(url, `audio_${assetIdCounter++}`);
  }
  return loadedAssets.get(url)!;
}

/**
 * Preload an audio file for faster playback
 *
 * Native audio requires preloading before playback.
 * This downloads the file and prepares it for instant playback.
 *
 * @param url - URL of the audio file
 * @returns Promise that resolves when preloaded
 */
export async function preloadAudio(url: string): Promise<void> {
  if (!isNativeAudioAvailable()) return;

  const assetId = getAssetId(url);

  try {
    await NativeAudio.preload({
      assetId,
      assetPath: url,
      audioChannelNum: 1,
      isUrl: true,
    });
  } catch (error) {
    // Asset might already be loaded, that's okay
    console.debug('[NativeAudio] Preload:', error);
  }
}

/**
 * Play an audio file
 *
 * If native audio is available, uses the native plugin.
 * Automatically preloads if not already loaded.
 *
 * @param url - URL of the audio file
 * @returns Promise that resolves when playback starts
 */
export async function playAudio(url: string): Promise<void> {
  if (!isNativeAudioAvailable()) {
    throw new Error('Native audio not available');
  }

  const assetId = getAssetId(url);

  // Ensure audio is preloaded
  await preloadAudio(url);

  // Play the audio
  await NativeAudio.play({ assetId });
}

/**
 * Stop audio playback
 *
 * @param url - URL of the audio file to stop
 */
export async function stopAudio(url: string): Promise<void> {
  if (!isNativeAudioAvailable()) return;

  const assetId = loadedAssets.get(url);
  if (!assetId) return;

  try {
    await NativeAudio.stop({ assetId });
  } catch (error) {
    console.debug('[NativeAudio] Stop:', error);
  }
}

/**
 * Unload an audio asset to free memory
 *
 * @param url - URL of the audio file to unload
 */
export async function unloadAudio(url: string): Promise<void> {
  if (!isNativeAudioAvailable()) return;

  const assetId = loadedAssets.get(url);
  if (!assetId) return;

  try {
    await NativeAudio.unload({ assetId });
    loadedAssets.delete(url);
  } catch (error) {
    console.debug('[NativeAudio] Unload:', error);
  }
}

/**
 * Set the volume for an audio asset
 *
 * @param url - URL of the audio file
 * @param volume - Volume level (0.0 to 1.0)
 */
export async function setVolume(url: string, volume: number): Promise<void> {
  if (!isNativeAudioAvailable()) return;

  const assetId = loadedAssets.get(url);
  if (!assetId) return;

  await NativeAudio.setVolume({ assetId, volume });
}

/**
 * Check if an audio asset is currently playing
 *
 * @param url - URL of the audio file
 * @returns Promise<boolean> - true if playing
 */
export async function isPlaying(url: string): Promise<boolean> {
  if (!isNativeAudioAvailable()) return false;

  const assetId = loadedAssets.get(url);
  if (!assetId) return false;

  try {
    const { isPlaying } = await NativeAudio.isPlaying({ assetId });
    return isPlaying;
  } catch {
    return false;
  }
}

/**
 * Add a listener for when audio playback completes
 *
 * @param callback - Function called when any audio completes
 * @returns Cleanup function to remove the listener
 */
export function onAudioComplete(callback: (assetId: string) => void): () => void {
  if (!isNativeAudioAvailable()) return () => {};

  const listener = NativeAudio.addListener('complete', (event) => {
    callback(event.assetId);
  });

  return () => {
    listener.then((l) => l.remove());
  };
}

/**
 * Get the asset ID for a URL (for listener matching)
 */
export function getAssetIdForUrl(url: string): string | undefined {
  return loadedAssets.get(url);
}
