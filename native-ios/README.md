# Teenz Bible iOS 1.2.1 — Firebase OTA Shell

## What this project is

This folder contains the rebuilt iOS shell for Teenz Bible with the same App Store bundle identifier, `com.teenzbible.app`. It is the one-time native release required to let the App Store app receive later HTML, CSS, JavaScript, and image updates from Firebase.

The project uses **CocoaPods**, not Swift Package Manager. This is intentional. The previous Swift Package Manager build could fail in Xcode 26 with `Missing package product 'CapApp-SPM'`. The rebuilt project has no `CapApp-SPM` dependency and links Capacitor plugins through the generated `Podfile` instead.

| Item | Configuration |
|---|---|
| Bundle identifier | `com.teenzbible.app` |
| Native version | `1.2.1` |
| Minimum iOS | 15.0 |
| Native dependency manager | CocoaPods |
| Capacitor | 8.5.0 |
| Open-source OTA engine | `@capgo/capacitor-updater` 8.51.5 |
| OTA server | Firebase Realtime Database `ota/latest.json` → Firebase Hosting ZIP |
| Capgo Cloud account or billing | **Not used** |
| Bundle activation | Download with `next({ id })`; activate at the next app background/restart |

## One-command Mac setup

Before the first build, make sure Xcode has the iOS platform installed. CocoaPods is also required once on the Mac. If `pod --version` does not return a version, install it with Homebrew:

```bash
brew install cocoapods
```

Then run the setup script from this folder:

```bash
./bootstrap-ios-cocoapods.sh
```

The script installs the JavaScript dependencies, synchronizes the native iOS project, runs `pod install`, and opens the correct file:

```text
ios/App/App.xcworkspace
```

> Always open **`App.xcworkspace`**, never `App.xcodeproj`. The workspace loads the CocoaPods-generated native dependencies, including Capacitor and the OTA updater.

## Xcode settings

Open the `App` target and check the following before building:

| Xcode field | Required value |
|---|---|
| Team | The same Apple Developer Team that owns the current Teenz Bible App Store listing |
| Bundle Identifier | `com.teenzbible.app` |
| Version | `1.2.1` or a later App Store version |
| Build | A number greater than any build already uploaded for that version |
| Signing | Automatically manage signing enabled |

First select a physically connected and trusted iPhone or iPad, then click **Run**. The 1.2.1 native version intentionally differs from the earlier local test build so the Updater's `resetWhenUpdate: true` setting removes any legacy downloaded OTA bundle before the newest Firebase bundle is checked. After the local build succeeds, use **Product → Archive** with **Any iOS Device (arm64)** selected and upload the archive to TestFlight.

## Firebase OTA behavior

The embedded web bundle checks Firebase only when running in the native app. It calls `notifyAppReady()`, reads `https://teens-bible-94271-default-rtdb.firebaseio.com/ota/latest.json`, downloads the newer bundle, and queues it with `next({ id })`. Therefore a newly downloaded OTA becomes active after the app is sent to the background or fully restarted.

Before TestFlight testing, create the OTA ZIP with `@capgo/cli bundle zip`, publish the CLI-generated checksum to Firebase `latest.json`, and verify that the ZIP has `index.html` at its root. Do not use an arbitrary standard ZIP generator for the production iOS bundle.

## Native-versus-OTA rule

Firebase OTA is appropriate for web bundle changes such as UI, React/JavaScript, CSS, text, images, and Firebase-backed web behavior. A new App Store binary is still required for Swift code, Capacitor plugins, iOS permissions, `Info.plist`, app icons, or other native changes.

## References

- [Capacitor — CocoaPods and Swift Package Manager](https://capacitorjs.com/docs/ios/spm)
- [Capgo Updater — Self-hosted Manual Update](https://capgo.app/docs/plugins/updater/self-hosted/manual-update/)
- [Capgo Updater — Self-hosted Auto Update](https://capgo.app/docs/plugins/updater/self-hosted/auto-update/)
