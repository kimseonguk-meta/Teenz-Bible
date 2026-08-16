#!/usr/bin/env bash
set -euo pipefail

# Restores the Capacitor iOS project to one dependency manager: CocoaPods.
# Run from native-ios on macOS: bash scripts/restore-cocoapods-auth.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NATIVE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_DIR="$(cd "$NATIVE_DIR/.." && pwd)"
IOS_DIR="$NATIVE_DIR/ios/App"
PROJECT_FILE="native-ios/ios/App/App.xcodeproj/project.pbxproj"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="$REPO_DIR/.ios-cocoapods-recovery-$TIMESTAMP"

if ! command -v pod >/dev/null 2>&1; then
  echo "CocoaPods is required but 'pod' was not found. Install CocoaPods, then run this script again."
  exit 1
fi

mkdir -p "$BACKUP_DIR"
if [ -f "$IOS_DIR/App.xcodeproj/project.pbxproj" ]; then
  cp "$IOS_DIR/App.xcodeproj/project.pbxproj" "$BACKUP_DIR/project.pbxproj.before-recovery"
fi
if [ -d "$IOS_DIR/CapApp-SPM" ]; then
  cp -R "$IOS_DIR/CapApp-SPM" "$BACKUP_DIR/CapApp-SPM.before-recovery"
fi

echo "Saved a local recovery backup to: $BACKUP_DIR"

echo "Removing the incomplete Swift Package Manager integration..."
rm -rf "$IOS_DIR/CapApp-SPM"
rm -rf "$IOS_DIR/App.xcworkspace"
rm -rf "$IOS_DIR/Pods"
rm -f "$IOS_DIR/Podfile.lock"
rm -rf "$IOS_DIR/App.xcodeproj/project.xcworkspace/xcshareddata/swiftpm"

# Restore only the Xcode project definition from the checked-in, CocoaPods-based project.
git -C "$REPO_DIR" restore --source=HEAD -- "$PROJECT_FILE"

echo "Synchronizing Capacitor for CocoaPods..."
cd "$NATIVE_DIR"
pnpm exec cap sync ios

# Capacitor's generated Podfile uses the plugin's Lite subspec by default.
# Google Sign-In requires the Google subspec, while Apple Sign-In remains included.
sed -i '' "s/pod 'CapacitorFirebaseAuthentication'/pod 'CapacitorFirebaseAuthentication\\/Google'/" "$IOS_DIR/Podfile"

echo "Installing CocoaPods dependencies..."
cd "$IOS_DIR"
pod install

echo
printf '%s\n' "Recovery complete. Open this CocoaPods workspace (not App.xcodeproj):"
printf '%s\n' "  $IOS_DIR/App.xcworkspace"
open "$IOS_DIR/App.xcworkspace"
