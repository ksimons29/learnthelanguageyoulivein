# Authentication Setup Guide

This guide covers configuring authentication for LLYLI, including email/password, Google Sign-In, and Apple Sign-In for both web and iOS.

## Quick Links

- Supabase Dashboard: https://supabase.com/dashboard/project/blympzejwbezjajpevdc
- Google Cloud Console: https://console.cloud.google.com
- Apple Developer Portal: https://developer.apple.com

---

## Step 1: Disable Email Confirmation (Required for MVP)

Due to SMTP delivery issues with Supabase's built-in email service, disable email confirmation for now.

1. Go to **Supabase Dashboard** → **Authentication** → **Providers**
2. Click on **Email** provider
3. Toggle OFF: **Confirm email**
4. Click **Save**

> **Note**: This allows users to sign in immediately after signup without email verification. Re-enable once you have a custom domain for email delivery.

---

## Step 2: Configure Google Sign-In

### 2.1 Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select or create a project (e.g., "LLYLI")
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Configure OAuth consent screen if prompted:
   - App name: "LLYLI"
   - User support email: your email
   - Authorized domains: `supabase.co`, `web-eta-gold.vercel.app`
6. Create OAuth client ID:
   - Application type: **Web application**
   - Name: "LLYLI Web"
   - Authorized JavaScript origins:
     ```
     https://web-eta-gold.vercel.app
     http://localhost:3000
     ```
   - Authorized redirect URIs:
     ```
     https://blympzejwbezjajpevdc.supabase.co/auth/v1/callback
     ```
7. Copy the **Client ID** and **Client Secret**

### 2.2 Enable Google in Supabase

1. Go to **Supabase Dashboard** → **Authentication** → **Providers**
2. Find **Google** and toggle it ON
3. Enter:
   - **Client ID**: (from Google Cloud Console)
   - **Client Secret**: (from Google Cloud Console)
4. Copy the **Callback URL** shown (should match what you added to Google)
5. Click **Save**

---

## Step 3: Configure Apple Sign-In

> **Requires**: Apple Developer Account ($99/year)

### 3.1 Create Apple App ID

1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. Go to **Certificates, Identifiers & Profiles** → **Identifiers**
3. Click **+** to create a new identifier
4. Select **App IDs** → Continue
5. Select **App** → Continue
6. Configure:
   - Description: "LLYLI"
   - Bundle ID: `com.llyli.app` (explicit)
   - Capabilities: Check **Sign In with Apple**
7. Click **Continue** → **Register**

### 3.2 Create Services ID (for Web)

1. In **Identifiers**, click **+** again
2. Select **Services IDs** → Continue
3. Configure:
   - Description: "LLYLI Web"
   - Identifier: `com.llyli.web`
4. Click **Continue** → **Register**
5. Click on the Services ID you just created
6. Check **Sign In with Apple** → Click **Configure**
7. Configure:
   - Primary App ID: Select "LLYLI" (the App ID from step 3.1)
   - Domains and Subdomains: `blympzejwbezjajpevdc.supabase.co`
   - Return URLs: `https://blympzejwbezjajpevdc.supabase.co/auth/v1/callback`
8. Click **Save** → **Continue** → **Save**

### 3.3 Create Private Key

1. Go to **Keys** → Click **+**
2. Configure:
   - Key Name: "LLYLI Sign In"
   - Check **Sign In with Apple** → Click **Configure**
   - Primary App ID: Select "LLYLI"
3. Click **Continue** → **Register**
4. **Download** the key file (`.p8`) - you can only download it once!
5. Note the **Key ID** shown

### 3.4 Enable Apple in Supabase

1. Go to **Supabase Dashboard** → **Authentication** → **Providers**
2. Find **Apple** and toggle it ON
3. Enter:
   - **Services ID**: `com.llyli.web` (from step 3.2)
   - **Secret Key**: Paste the entire contents of the `.p8` file
   - **Key ID**: (from step 3.3)
   - **Team ID**: Find in top-right of Apple Developer Portal (looks like "ABC123DEF4")
4. Click **Save**

---

## Step 4: iOS App Configuration (Capacitor)

### 4.1 Add URL Scheme for OAuth Callback

Edit `ios/App/App/Info.plist` and add:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>com.llyli.app</string>
    </array>
  </dict>
</array>
```

### 4.2 Add Associated Domains for Universal Links

In Xcode:
1. Select your target → **Signing & Capabilities**
2. Click **+ Capability** → **Associated Domains**
3. Add: `applinks:blympzejwbezjajpevdc.supabase.co`

### 4.3 Configure Sign In with Apple Capability

In Xcode:
1. Select your target → **Signing & Capabilities**
2. Click **+ Capability** → **Sign In with Apple**

### 4.4 Handle OAuth Deep Links

The Capacitor app needs to handle the OAuth callback. Create/update `web/src/lib/capacitor/deep-links.ts`:

```typescript
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { createClient } from '@/lib/supabase/client';

export function initDeepLinkHandler() {
  if (!Capacitor.isNativePlatform()) return;

  App.addListener('appUrlOpen', async (event: URLOpenListenerEvent) => {
    const url = new URL(event.url);

    // Handle Supabase auth callback
    if (url.pathname.includes('/auth/callback')) {
      const code = url.searchParams.get('code');
      if (code) {
        const supabase = createClient();
        await supabase.auth.exchangeCodeForSession(code);
        // Navigate to appropriate screen
        window.location.href = '/';
      }
    }
  });
}
```

### 4.5 Update OAuth Redirect URL for iOS

For iOS, the redirect needs to use your app's URL scheme. Update the OAuth calls:

```typescript
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: Capacitor.isNativePlatform()
      ? 'com.llyli.app://auth/callback'
      : `${window.location.origin}/auth/callback`,
  },
});
```

---

## Step 5: Update Vercel Environment

Add the Supabase URL to allowed redirects in Vercel:

```bash
# No additional env vars needed - Supabase handles OAuth entirely
```

---

## Testing Checklist

### Web
- [ ] Google Sign-In from sign-in page
- [ ] Google Sign-In from sign-up page
- [ ] Apple Sign-In from sign-in page
- [ ] Apple Sign-In from sign-up page
- [ ] Email/password sign-up (no confirmation needed)
- [ ] Email/password sign-in
- [ ] OAuth callback redirects to onboarding for new users
- [ ] OAuth callback redirects to home for existing users

### iOS App
- [ ] Google Sign-In opens Safari/in-app browser
- [ ] Google Sign-In returns to app after auth
- [ ] Apple Sign-In uses native Apple UI
- [ ] Apple Sign-In returns to app after auth
- [ ] Session persists after app restart

---

## Troubleshooting

### "Invalid OAuth redirect"
- Verify redirect URLs match exactly in both Supabase and provider settings
- Check for trailing slashes
- Ensure protocol is `https://`

### "OAuth state mismatch"
- Clear browser cookies/storage
- Try incognito mode

### Apple Sign-In not showing on web
- Apple Sign-In on web only works on Safari and Chrome (not Firefox)
- Ensure Services ID domains are correctly configured

### iOS OAuth doesn't return to app
- Verify URL scheme is registered in Info.plist
- Check Associated Domains are properly configured
- Ensure deep link handler is initialized on app start

---

## Security Notes

1. **Never** commit OAuth secrets to the repository
2. Rotate secrets if they are ever exposed
3. Use environment variables for all sensitive values
4. The Supabase service role key should **never** be used client-side
