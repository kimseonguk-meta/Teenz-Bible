#!/bin/bash
#
# Teenz Bible iOS 1.3.0 (build 7) — one-command Mac setup.
# Run from the repo root:  bash ios-release/scripts/bootstrap-ios.sh
#
# What it does:
#   1. Builds the web app (client/dist/public)
#   2. Copies it into ios-release/web
#   3. Installs the Capacitor iOS shell deps
#   4. Generates ios/App via `cap add ios` (first run only, SPM template)
#   5. Installs our Info.plist (permissions) + AppIcon set
#   6. Syncs web assets + native plugins (SPM - no CocoaPods needed)
#   7. Sets MARKETING_VERSION=1.3.0 and CURRENT_PROJECT_VERSION=7
#   8. Opens ios/App/App.xcodeproj
#
# Package manager note (Capacitor 8):
#   Capacitor 8 defaults to Swift Package Manager for iOS.
#   All 3 of our plugins (firebase-authentication, app, camera) ship
#   Package.swift, so SPM is fully supported. CocoaPods is intentionally
#   not used - one less toolchain (Ruby/Homebrew) to break.
#
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
RELEASE_DIR="$REPO_ROOT/ios-release"
APP_VERSION="1.3.0"
APP_BUILD="7"

echo "==> 0. Prerequisites"
xcodebuild -version >/dev/null || { echo "ERROR: Xcode not installed."; exit 1; }
command -v node >/dev/null || { echo "ERROR: Node.js not installed."; exit 1; }

echo "==> 1. Building web app"
cd "$REPO_ROOT"
# sparse-checkout 환경에서는 client/ 가 빠져 있을 수 있음 (웹 빌드에 필요)
if [ ! -d "client" ]; then
  echo "client/ missing - adding to sparse checkout..."
  git sparse-checkout add client
fi
npm install
npm run build
test -f dist/public/index.html || { echo "ERROR: web build missing."; exit 1; }

echo "==> 2. Copying web bundle into ios-release/web"
rm -rf "$RELEASE_DIR/web"
cp -R dist/public "$RELEASE_DIR/web"

echo "==> 3. Installing iOS shell dependencies"
cd "$RELEASE_DIR"
npm install

echo "==> 4. Generating native iOS project (first run only)"
if [ ! -d "ios/App/App.xcodeproj" ]; then
  # Capacitor 8 default package manager is SPM (Swift Package Manager).
  # Explicit flag so a future CLI default change can't silently flip us.
  npx cap add ios --packagemanager SPM
else
  echo "    ios project already exists, skipping 'cap add ios'"
fi

echo "==> 5. Installing Info.plist (permissions) and AppIcon set"
cp "$RELEASE_DIR/Info.plist" ios/App/App/Info.plist
rm -rf ios/App/App/Assets.xcassets/AppIcon.appiconset
cp -R "$RELEASE_DIR/AppIcon.appiconset" ios/App/App/Assets.xcassets/AppIcon.appiconset

echo "==> 6. Syncing web assets + native plugins (SPM)"
npx cap sync ios
# NOTE: no `pod install` - the SPM template has no Podfile by design.
# Xcode resolves Swift packages (CapApp-SPM + plugins) on first open.

echo "==> 7. Setting version $APP_VERSION (build $APP_BUILD)"
PBXPROJ="ios/App/App.xcodeproj/project.pbxproj"
sed -i '' "s/MARKETING_VERSION = [^;]*;/MARKETING_VERSION = $APP_VERSION;/g" "$PBXPROJ"
sed -i '' "s/CURRENT_PROJECT_VERSION = [^;]*;/CURRENT_PROJECT_VERSION = $APP_BUILD;/g" "$PBXPROJ"
grep -o "MARKETING_VERSION = [^;]*" "$PBXPROJ" | sort -u
grep -o "CURRENT_PROJECT_VERSION = [^;]*" "$PBXPROJ" | sort -u

echo ""
echo "==> Done. Opening workspace — next steps in Xcode:"
echo "    1. Select the 'App' target > Signing & Capabilities"
echo "       - Team: your Apple Developer Team (owner of the Teenz Bible listing)"
echo "       - Enable 'Automatically manage signing', Bundle ID: com.teenzbible.app"
echo "    2. Connect a real iPhone/iPad, press Run — smoke test the app"
echo "    3. Product > Archive (Any iOS Device arm64) > Distribute App > App Store Connect"
echo "       (first Xcode open resolves Swift packages - needs network, takes a few minutes)"
open ios/App/App.xcodeproj
