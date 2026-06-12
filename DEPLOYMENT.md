# Teenz Bible — Deployment Guide

## Overview

This app uses two deployment channels:

| Channel | Target | URL/Service |
|---------|--------|-------------|
| **Firebase Hosting** | PWA users (browser / home screen shortcut) | https://teens-bible-94271.web.app |
| **Capgo OTA** | Native app users (App Store / Google Play) | Capgo Cloud → auto-update |

Both channels serve the same codebase. After any code change, deploy to **both** so all users get the update.

---

## Prerequisites

1. **CAPGO_APIKEY** environment variable must be set:
   ```bash
   export CAPGO_APIKEY="a255fab3-6ed8-4445-b875-c775cf4f4dd0"
   ```

2. **Firebase service account** for hosting deploy (stored in git history, extracted at deploy time).

3. **Node.js 22+** and **pnpm** installed.

---

## Deploy Commands

### Deploy to Firebase only (PWA users)
```bash
pnpm deploy:firebase
```

### Deploy OTA only (native app users)
```bash
export CAPGO_APIKEY="your-key-here"
pnpm deploy:ota
```

### Deploy to both (recommended)
```bash
export CAPGO_APIKEY="your-key-here"
pnpm deploy:all
```

### Manual steps (what the scripts do internally)
```bash
# 1. Build
pnpm build

# 2. Firebase deploy
firebase deploy --only hosting --project teens-bible-94271

# 3. Capgo OTA upload
pnpm capgo bundle upload --apikey $CAPGO_APIKEY --channel production --no-code-check
```

---

## How Capgo OTA Works

1. **App starts** → `CapacitorUpdater.notifyAppReady()` is called (in `main.tsx`)
2. **Capgo checks** for new bundle on the `production` channel
3. **If new bundle exists** → downloads in background
4. **Next app launch** → new bundle is applied automatically
5. **If new bundle crashes** → Capgo auto-rolls back to previous working version

### First-time Setup (already done)
- Plugin: `@capgo/capacitor-updater` installed
- Config: `capacitor.config.ts` has `CapacitorUpdater: { autoUpdate: true }`
- App registered: `com.teenzbible.app` on Capgo Cloud
- Channel: `production`

---

## Important: Native App Update Required Once

The current App Store version does NOT have the Capgo plugin installed. You need to:

1. Run `npx cap sync ios` to sync the new plugin to the iOS project
2. Build a new version in Xcode (bump version/build number)
3. Submit to App Store review (this is the LAST manual submission needed)
4. After this version is approved and live, all future JS/HTML/CSS updates will be delivered via OTA automatically

---

## Rollback

If a bad bundle is deployed:

```bash
# List bundles
pnpm capgo bundle list --apikey $CAPGO_APIKEY

# Revert channel to a specific bundle version
pnpm capgo channel set production --bundle <version> --apikey $CAPGO_APIKEY
```

Or use the Capgo dashboard: https://console.capgo.app/app/com.teenzbible.app

---

## Capgo Dashboard

- **URL**: https://console.capgo.app
- **Account**: kimseonguk777@gmail.com
- **Organization**: Teenz Bible
- **Plan**: Free trial (15 days from Jun 12, 2026)
- **Limits**: 1,000 devices, 10GB bandwidth/month

---

## What CAN be updated via OTA (no App Store review)

- UI changes (React components, CSS, Tailwind)
- Bug fixes in JavaScript/TypeScript
- New pages/features (as long as they use existing native plugins)
- Content updates (Bible text, quizzes, translations)
- Firebase configuration changes

## What CANNOT be updated via OTA (requires App Store submission)

- New native plugins (e.g., adding a new Capacitor plugin)
- iOS Info.plist changes (permissions, app name)
- App icon or splash screen changes
- Xcode project configuration changes
