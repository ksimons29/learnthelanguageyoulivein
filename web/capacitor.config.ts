import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor Configuration
 *
 * LLYLI uses a HYBRID approach:
 * - The iOS app loads from your deployed web server (Vercel/production URL)
 * - Native plugins provide enhanced capabilities (audio, push, network)
 * - API routes continue to work since they run server-side
 *
 * This approach is ideal because:
 * - No code duplication between web and iOS
 * - API routes stay secure server-side
 * - Updates deploy instantly without App Store review
 *
 * For development:
 * - Run `npm run dev` to start the Next.js dev server
 * - The iOS app will load from localhost (see server.url below)
 * - Use `npx cap open ios` to run in Xcode simulator
 *
 * For production:
 * - Set CAPACITOR_SERVER_URL environment variable to your production URL
 * - Or update the url below directly
 */

// Production URL - update this to your Vercel/production deployment
const PRODUCTION_URL = process.env.CAPACITOR_SERVER_URL || 'https://llyli.vercel.app';
const DEV_URL = 'http://localhost:3000';
const isDev = process.env.NODE_ENV === 'development';

const config: CapacitorConfig = {
  // App identifier (reverse domain notation)
  // IMPORTANT: Change this to your actual Apple Developer account bundle ID
  appId: 'com.llyli.app',
  appName: 'LLYLI',

  // For hybrid approach, we still need a webDir for fallback/splash
  // This contains a minimal loading page
  webDir: 'public',

  // Server configuration - load from web server instead of bundled files
  server: {
    // Load from your deployed web app
    url: isDev ? DEV_URL : PRODUCTION_URL,

    // Clear cache on app launch (ensures fresh content)
    cleartext: isDev, // Allow HTTP only in development

    // Allow navigation to these domains
    allowNavigation: [
      '*.supabase.co',
      '*.supabase.in',
      'llyli.vercel.app',
      '*.vercel.app',
    ],
  },

  // iOS-specific configuration
  ios: {
    // Content inset behavior for safe areas (notch, home indicator)
    contentInset: 'automatic',

    // Allow inline media playback (prevents fullscreen takeover)
    allowsLinkPreview: false,

    // Smooth scrolling
    scrollEnabled: true,

    // Prefer use of the WKWebView (required for iOS 14+)
    preferredContentMode: 'mobile',

    // Background modes are configured in Xcode:
    // - audio: Background audio playback
    // - fetch: Background fetch for sync
    // - remote-notification: Push notification processing
  },

  // Plugin configuration
  plugins: {
    // Push Notifications
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },

    // Splash Screen (shown while loading web content)
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#F5EFE0', // Cream paper color from Moleskine theme
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },

    // Keyboard (for text input)
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
