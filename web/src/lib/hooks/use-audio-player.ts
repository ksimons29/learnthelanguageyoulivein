"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  isNativeAudioAvailable,
  playAudio as nativePlayAudio,
  stopAudio as nativeStopAudio,
  onAudioComplete,
  getAssetIdForUrl,
} from '@/lib/capacitor/native-audio';

interface UseAudioPlayerOptions {
  onEnded?: () => void;
  onError?: (error: Error) => void;
}

interface UseAudioPlayerReturn {
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  play: (url: string) => Promise<void>;
  stop: () => void;
  currentUrl: string | null;
}

/**
 * useAudioPlayer Hook
 *
 * Manages audio playback with progressive enhancement:
 * - Native iOS: Uses Capacitor native audio (no autoplay restrictions)
 * - Web: Uses HTML5 Audio element
 *
 * Prevents overlapping audio by stopping previous playback before starting new.
 *
 * Usage:
 * ```tsx
 * const { play, stop, isPlaying, isLoading } = useAudioPlayer();
 *
 * <button onClick={() => play(audioUrl)}>
 *   {isPlaying ? 'Stop' : 'Play'}
 * </button>
 * ```
 */
export function useAudioPlayer(options: UseAudioPlayerOptions = {}): UseAudioPlayerReturn {
  const { onEnded, onError } = options;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);

  // Track whether we're using native audio
  const useNativeAudio = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio on mount
  useEffect(() => {
    // Check if native audio is available (iOS app)
    useNativeAudio.current = isNativeAudioAvailable();

    if (useNativeAudio.current) {
      // Set up native audio completion listener
      const cleanup = onAudioComplete((completedAssetId) => {
        // Check if the completed audio matches our current URL
        if (currentUrl) {
          const ourAssetId = getAssetIdForUrl(currentUrl);
          if (ourAssetId === completedAssetId) {
            setIsPlaying(false);
            setCurrentUrl(null);
            onEnded?.();
          }
        }
      });

      return cleanup;
    } else {
      // Web fallback: Create HTML5 Audio element
      audioRef.current = new Audio();
      const audio = audioRef.current;

      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentUrl(null);
        onEnded?.();
      };

      const handleError = () => {
        const errorMessage = audio.error?.message || 'Failed to play audio';
        setError(errorMessage);
        setIsPlaying(false);
        setIsLoading(false);
        onError?.(new Error(errorMessage));
      };

      const handleCanPlay = () => {
        setIsLoading(false);
      };

      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);
      audio.addEventListener('canplay', handleCanPlay);

      return () => {
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('canplay', handleCanPlay);
        audio.pause();
        audio.src = '';
      };
    }
  }, [onEnded, onError, currentUrl]);

  const play = useCallback(async (url: string) => {
    // If same URL is playing, toggle off
    if (currentUrl === url && isPlaying) {
      if (useNativeAudio.current) {
        await nativeStopAudio(url);
      } else if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      return;
    }

    // Stop any current playback
    if (currentUrl && currentUrl !== url) {
      if (useNativeAudio.current) {
        await nativeStopAudio(currentUrl);
      } else if (audioRef.current) {
        audioRef.current.pause();
      }
    }

    setError(null);
    setIsLoading(true);
    setCurrentUrl(url);

    try {
      if (useNativeAudio.current) {
        // Native iOS audio - no autoplay restrictions
        await nativePlayAudio(url);
        setIsPlaying(true);
        setIsLoading(false);
      } else if (audioRef.current) {
        // Web fallback - HTML5 Audio
        audioRef.current.src = url;
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to play audio';
      setError(errorMessage);
      setIsPlaying(false);
      onError?.(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [currentUrl, isPlaying, onError]);

  const stop = useCallback(async () => {
    if (currentUrl) {
      if (useNativeAudio.current) {
        await nativeStopAudio(currentUrl);
      } else if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
    setIsPlaying(false);
    setCurrentUrl(null);
  }, [currentUrl]);

  return {
    isPlaying,
    isLoading,
    error,
    play,
    stop,
    currentUrl,
  };
}
