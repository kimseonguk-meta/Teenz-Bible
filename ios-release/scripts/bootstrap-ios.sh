#!/bin/bash
#
# Teenz Bible iOS 1.3.0 (build 7) — one-command Mac setup.
# Run from the repo root:  bash ios-release/scripts/bootstrap-ios.sh
#
# What it does:
#   1. Builds the web app (client/dist/public)
#   2. Copies it into ios-release/web
#   3. Installs the Capacitor iOS shell deps
#   4. Generates ios/App via `cap add ios` (first run only)
#   5. Installs our Info.plist (permissions) + AppIcon set
#   6. Syncs web assets, runs pod install
#   7. Sets MARKETING_VERSION=1.3.0 and CURRENT_PROJECT_VERSION=7
#   8. Opens ios/App/App.xcworkspace
#
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
RELEASE_DIR="$REPO_ROOT/ios-release"
APP_VERSION="1.3.0"
APP_BUILD="7"

echo "==> 0. Prerequisites"
xcodebuild -version >/dev/null || { echo "ERROR: Xcode not installed."; exit 1; }
if ! command -v pod >/dev/null 2>&1; then
  echo "Installing CocoaPods via Homebrew..."
  brew install cocoapods
fi
command -v node >/dev/null || { echo "ERROR: Node.js not installed."; exit 1; }

echo "==> 1. Building web app"
cd "$REPO_ROOT"
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
  npx cap add ios
else
  echo "    ios project already exists, skipping 'cap add ios'"
fi

echo "==> 5. Installing Info.plist (permissions) and AppIcon set"
cp "$RELEASE_DIR/Info.plist" ios/App/App/Info.plist
rm -rf ios/App/App/Assets.xcassets/AppIcon.appiconset
cp -R "$RELEASE_DIR/AppIcon.appiconset" ios/App/App/Assets.xcassets/AppIcon.appiconset

echo "==> 6. Syncing web assets + pod install"
npx cap sync ios
cd ios/App && pod install && cd "$RELEASE_DIR"

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
open ios/App/App.xcworkspace
