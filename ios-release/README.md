# Teenz Bible iOS 1.3.0 (build 7) — App Store release

Capacitor iOS shell (`com.teenzbible.app`) that loads the live PWA at
`https://teens-bible-94271.web.app` via `server.url` in `capacitor.config.json`.
No OTA updater: after each App Store build, PWA deploys reflect in the iOS app
automatically with no new binary.

## What's inside

| File | Purpose |
|---|---|
| `capacitor.config.json` | appId `com.teenzbible.app`, `server.url` → live PWA (auto-updates on each hosting deploy), Firebase auth (Google + Apple, web-based) |
| `package.json` | Capacitor 8.5.0, camera, app, firebase-auth plugins |
| `Info.plist` | Installed over the generated one: camera/photo usage strings, Google Sign-In URL scheme |
| `AppIcon.appiconset/` | Full iOS icon set generated from `client/public/icons/icon-512.png` |
| `scripts/bootstrap-ios.sh` | One-command Mac setup (see below) |
| `APP_STORE_METADATA.md` | Final listing copy for App Store Connect (Bible AI references removed) |

`web/`, `ios/`, `node_modules/` are built on the Mac and gitignored.

## Mac build (on the MacBook)

```bash
git pull
bash ios-release/scripts/bootstrap-ios.sh
```

The script builds the web app, generates the native project, installs the
plist + icons, syncs assets, runs `pod install`, sets version **1.3.0** /
build **7**, and opens `ios/App/App.xcworkspace`.

Then in Xcode:

1. App target → Signing & Capabilities → Team: your Apple Developer Team
   (owner of the Teenz Bible listing). Enable **Automatically manage signing**.
   Bundle ID must be `com.teenzbible.app`.
2. Connect a real iPhone/iPad → **Run**. Smoke test:
   Home, Bible reader, quiz, challenge (gold ribbon → NASUM), login
   (Apple/Google), profile photo (camera/library), account deletion
   (disposable account only), all tabs.
3. **Product → Archive** with **Any iOS Device (arm64)** → Distribute App →
   App Store Connect → upload.
4. App Store Connect: create version **1.3.0**, add build 7, fill metadata
   from `APP_STORE_METADATA.md`, upload screenshots, answer privacy +
   export compliance, submit for review.

## Version history

- 1.2.1 (build 6) — Aug 20, 2026. Previous store release (Manus).
- 1.3.0 (build 7) — Sep 20, 2026. Current web app: 제자반 challenge,
  quiz fixes (EN/KO), Bible AI home card hidden, store/pet updates.
