# Teenz Bible - Capacitor iOS Project Setup Guide

## Overview

This is a **proper Capacitor iOS project** (not a simple WKWebView wrapper). It includes:
- **Native Apple Sign-In** via `@capacitor-firebase/authentication` (fixes Apple review error)
- **Native Google Sign-In** via `@capacitor-firebase/authentication` (fixes "access blocked" in WebView)
- **Native Camera** via `@capacitor/camera` (fixes iPad camera crash)

---

## Prerequisites

- macOS with Xcode 15+ installed
- Apple Developer account with the app registered (Bundle ID: `com.teenzbible.app`)
- `GoogleService-Info.plist` from Firebase Console
- CocoaPods is NOT needed (uses Swift Package Manager)

---

## Step-by-Step Setup

### 1. Open the Project in Xcode

```bash
cd teens-bible-app/ios/App
open App.xcodeproj
```

### 2. Add GoogleService-Info.plist

1. Go to [Firebase Console](https://console.firebase.google.com/project/teens-bible-94271/settings/general)
2. Under "Your apps" → iOS app → Download `GoogleService-Info.plist`
3. Drag it into `ios/App/App/` in Xcode (make sure "Copy items if needed" is checked)
4. Ensure it's added to the "App" target

### 3. Add Sign in with Apple Capability

1. Select the **App** target in Xcode
2. Go to **Signing & Capabilities** tab
3. Click **+ Capability**
4. Search for and add **"Sign in with Apple"**
5. The `App.entitlements` file is already created with the correct content

> **Note:** Also verify in [Apple Developer Portal](https://developer.apple.com/account/resources/identifiers/list) that your App ID (`com.teenzbible.app`) has "Sign in with Apple" enabled under Capabilities.

### 4. Add Google Sign-In URL Scheme

1. Open `GoogleService-Info.plist` and find the `REVERSED_CLIENT_ID` value
   (looks like: `com.googleusercontent.apps.226355097233-xxxxxxxxxx`)
2. In Xcode: Select **App** target → **Info** tab → **URL Types**
3. Click **+** to add a new URL Type
4. Set **URL Schemes** to the `REVERSED_CLIENT_ID` value from step 1

### 5. Configure Signing

1. Select the **App** target → **Signing & Capabilities**
2. Set **Team** to your Apple Developer team
3. Set **Bundle Identifier** to `com.teenzbible.app`
4. Ensure **Automatically manage signing** is checked

### 6. Set Version & Build Number

1. **General** tab → **Identity** section
2. Set **Version** to `1.0`
3. Set **Build** to `5` (increment from last submission)

### 7. Set Deployment Target

1. **General** tab → **Minimum Deployments**
2. Set to **iOS 15.0** (or higher if desired)

### 8. Resolve Swift Packages

1. Xcode should automatically resolve packages on first open
2. If not: **File** → **Packages** → **Resolve Package Versions**
3. Wait for `capacitor-swift-pm`, `CapacitorFirebaseAuthentication`, and `CapacitorCamera` to download

### 9. Build & Test

1. Select a simulator (iPhone 15 Pro or iPad Air) or your physical device
2. **Product** → **Build** (⌘B)
3. Test:
   - Profile → Take Photo (should open native camera picker)
   - Sign in with Apple (should show native Apple sign-in sheet)
   - Sign in with Google (should show native Google sign-in flow)

### 10. Archive & Upload

1. Select **Any iOS Device (arm64)** as build target
2. **Product** → **Archive**
3. In Organizer: **Distribute App** → **App Store Connect** → **Upload**
4. Wait for processing in App Store Connect
5. Select the new build in your app version and submit for review

---

## What Changed from Previous Build

| Before (Build 4) | After (Build 5) |
|---|---|
| Custom WKWebView wrapper | Proper Capacitor iOS project |
| No native plugins | Native Camera, Apple Auth, Google Auth |
| Camera via HTML `<input capture>` (crashes on iPad) | Native `@capacitor/camera` plugin |
| Apple Sign-In via web popup (fails in WKWebView) | Native ASAuthorizationController |
| Google Sign-In via web popup (blocked in WKWebView) | Native GIDSignIn |
| No entitlements file | `App.entitlements` with Sign in with Apple |

---

## Troubleshooting

### "No such module 'Capacitor'" error
→ **File** → **Packages** → **Resolve Package Versions**, then clean build (⇧⌘K)

### Apple Sign-In fails
→ Verify:
1. "Sign in with Apple" capability is added in Signing & Capabilities
2. App ID has Sign in with Apple enabled in Apple Developer Portal
3. Provisioning profile is regenerated after enabling the capability

### Google Sign-In fails
→ Verify:
1. `GoogleService-Info.plist` is in the project and added to target
2. `REVERSED_CLIENT_ID` is set as URL Scheme
3. Firebase Console has the iOS app registered with correct Bundle ID

### Camera doesn't open
→ Verify:
1. `NSCameraUsageDescription` is in Info.plist (already added)
2. Running on physical device (simulator has limited camera support)

---

## File Structure

```
ios/App/
├── App/
│   ├── AppDelegate.swift          ← Capacitor app delegate (handles URL schemes)
│   ├── App.entitlements           ← Sign in with Apple entitlement
│   ├── Info.plist                 ← Camera/Photo permissions + app config
│   ├── Assets.xcassets/           ← App icon (1024x1024 brown Bible icon)
│   ├── capacitor.config.json      ← Auto-generated from capacitor.config.ts
│   └── public/                    ← Web assets (auto-synced from dist/public)
├── App.xcodeproj/                 ← Xcode project file
└── CapApp-SPM/
    └── Package.swift              ← Swift Package Manager deps (Capacitor + plugins)
```

---

## App Review Notes (for resubmission)

When resubmitting, update the App Review Notes to mention:

> "Build 5 fixes the two issues identified in the previous review:
> 1. Camera crash on iPad: Replaced HTML file input with native Capacitor Camera plugin (@capacitor/camera) which properly handles camera access on all iOS devices including iPad.
> 2. Sign in with Apple error: Migrated from WKWebView wrapper to proper Capacitor iOS project with native Apple Sign-In via ASAuthorizationController. Added Sign in with Apple entitlement and capability."

---

## Quick Commands

```bash
# Sync web changes to iOS (after modifying web code)
cd teens-bible-app
pnpm build
npx cap sync ios

# Open in Xcode
npx cap open ios
```
