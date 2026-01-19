# Capacitor iOS Setup Guide

This document describes LLYLI's Capacitor integration for iOS App Store distribution.

## Architecture Overview

LLYLI uses a **hybrid architecture** where:
- The iOS app is a native shell (WKWebView) that loads your deployed web app
- Native plugins provide enhanced capabilities (audio, push notifications, network)
- API routes run on your server (Vercel), not bundled in the app

**Benefits:**
- No code duplication between web and iOS
- API routes stay secure server-side
- Updates deploy instantly without App Store review
- Same codebase, enhanced experience on native

## Project Structure

```
web/
├── capacitor.config.ts          # Capacitor configuration
├── ios/                         # Xcode project (auto-generated)
│   └── App/
│       ├── App/                 # Swift app code
│       └── App.xcodeproj        # Xcode project file
└── src/lib/capacitor/           # Platform utilities
    ├── index.ts                 # Main exports
    ├── platform.ts              # Platform detection
    ├── native-audio.ts          # Native audio playback
    ├── network.ts               # Network status
    └── push-notifications.ts    # Push notifications
```

## Installed Plugins

| Plugin | Purpose |
|--------|---------|
| `@capacitor/core` | Core Capacitor runtime |
| `@capacitor/ios` | iOS platform support |
| `@capacitor/network` | Better network status detection |
| `@capacitor/push-notifications` | iOS push notifications (APNs) |
| `@capacitor-community/native-audio` | Native audio playback |

## Development Workflow

### Prerequisites

1. **Xcode 15+** installed from Mac App Store
2. **Apple Developer Account** (for device testing and App Store)
3. **Node.js 18+**

### Running in Simulator

```bash
# 1. Start the Next.js dev server
npm run dev

# 2. Open Xcode project
npm run cap:open:ios

# 3. In Xcode:
#    - Select a simulator (e.g., iPhone 15 Pro)
#    - Click Run (▶️) or Cmd+R
```

The app will load from `http://localhost:3000` (see `capacitor.config.ts`).

### Running on Physical Device

1. Connect your iPhone via USB
2. In Xcode, select your device from the device menu
3. Sign the app with your Apple Developer account
4. Click Run

### Syncing Changes

After modifying `capacitor.config.ts` or adding plugins:

```bash
npm run cap:sync
```

## Production Configuration

### Update Server URL

Edit `capacitor.config.ts`:

```typescript
const PRODUCTION_URL = process.env.CAPACITOR_SERVER_URL || 'https://your-app.vercel.app';
```

Or set the environment variable in your build:

```bash
CAPACITOR_SERVER_URL=https://llyli.vercel.app npm run cap:build:ios
```

### App Store Submission Checklist

1. **Bundle Identifier**: Update `appId` in `capacitor.config.ts` to match your Apple Developer account
2. **App Icons**: Add icons to `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
3. **Splash Screen**: Configure in Xcode or add `splash-screen` plugin
4. **Push Notifications**:
   - Enable Push Notifications capability in Xcode
   - Configure APNs key in your backend (Supabase/server)
5. **Privacy Manifest**: Required for iOS 17+ if using certain APIs

## Platform Detection

Use the platform utilities to conditionally enable features:

```typescript
import { isNative, isIOS, getPlatform } from '@/lib/capacitor';

// Check if running in native shell
if (isNative()) {
  // Use native audio, push notifications, etc.
}

// Get specific platform
const platform = getPlatform(); // 'ios' | 'android' | 'web'
```

## Audio Playback

The `useAudioPlayer` hook automatically uses native audio on iOS:

```typescript
import { useAudioPlayer } from '@/lib/hooks';

function AudioButton({ url }) {
  const { play, isPlaying } = useAudioPlayer();

  // On iOS: Uses native audio (no autoplay restrictions)
  // On web: Uses HTML5 Audio
  return <button onClick={() => play(url)}>Play</button>;
}
```

### Benefits of Native Audio on iOS
- No autoplay restrictions (plays immediately)
- Plays in silent mode (with proper configuration)
- Better performance (native audio engine)
- Background playback support

## Push Notifications

### Registration

```typescript
import { registerForPushNotifications } from '@/lib/capacitor';

// After user onboarding
async function setupPush() {
  const token = await registerForPushNotifications();
  if (token) {
    // Send token to your backend for push delivery
    await fetch('/api/user/push-token', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }
}
```

### Handling Notifications

```typescript
import { onPushReceived, onPushTapped } from '@/lib/capacitor';

// In app initialization
onPushReceived((notification) => {
  // Notification received while app is open
  console.log('Push received:', notification.title);
});

onPushTapped((action) => {
  // User tapped notification to open app
  if (action.data.type === 'review_reminder') {
    router.push('/review');
  }
});
```

### Xcode Configuration

1. Open `ios/App/App.xcodeproj` in Xcode
2. Select the App target → Signing & Capabilities
3. Click "+ Capability" → Add "Push Notifications"
4. Also add "Background Modes" → Check "Remote notifications"

## Network Status

```typescript
import { getNetworkStatus, onNetworkChange } from '@/lib/capacitor';

// Check current status
const { connected, connectionType } = await getNetworkStatus();

// Listen for changes
const cleanup = onNetworkChange((status) => {
  if (status.connected) {
    syncPendingReviews();
  }
});
```

## Troubleshooting

### App shows blank screen

1. Ensure the server URL in `capacitor.config.ts` is correct
2. Check if the Next.js server is running (dev) or deployed (prod)
3. Check Xcode console for network errors

### Audio doesn't play

1. Check if `@capacitor-community/native-audio` is installed
2. Verify audio URL is accessible (CORS enabled)
3. Check Xcode console for plugin errors

### Push notifications not working

1. Verify Push Notifications capability is enabled in Xcode
2. Check that APNs key is configured in backend
3. Test on physical device (simulators don't support push)

### Changes not appearing

```bash
# Full rebuild
npm run cap:sync
# Then rebuild in Xcode (Cmd+Shift+K to clean, then Cmd+R)
```

## Next Steps

1. **App Icons**: Create and add app icons in all required sizes
2. **Splash Screen**: Design and configure launch screen
3. **TestFlight**: Set up TestFlight for beta testing
4. **App Store Connect**: Prepare store listing, screenshots, description
5. **Privacy Policy**: Required for App Store submission

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
