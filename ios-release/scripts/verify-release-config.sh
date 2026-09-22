#!/bin/bash
# verify-release-config.sh — iOS App Store release gate.
# Fails loudly if ios-release/capacitor.config.json drifts from the design intent:
# the App Store binary MUST load the live PWA (server.url) so PWA deploys
# auto-update the iOS app with no new binary. A bundled-only build silently
# strands iOS users on stale content (this happened with 1.3.0 build 7).
set -euo pipefail

RELEASE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CONFIG="$RELEASE_DIR/capacitor.config.json"
EXPECTED_URL="https://teens-bible-94271.web.app"
EXPECTED_APPID="com.teenzbible.app"

fail() { echo "RELEASE GATE FAILED: $1" >&2; exit 1; }

[ -f "$CONFIG" ] || fail "capacitor.config.json not found at $CONFIG"

URL="$(python3 -c "import json;print(json.load(open('$CONFIG')).get('server',{}).get('url',''))")"
APPID="$(python3 -c "import json;print(json.load(open('$CONFIG')).get('appId',''))")"

[ "$APPID" = "$EXPECTED_APPID" ] || fail "appId is '$APPID', expected '$EXPECTED_APPID'"
[ "$URL" = "$EXPECTED_URL" ] || fail "server.url is '$URL', expected '$EXPECTED_URL'. The App Store build MUST load the live PWA — without it, iOS users stay on stale bundled content until a new binary passes review."

[ -d "$RELEASE_DIR/web" ] || fail "web/ dir missing — run the web build copy step first"
[ -f "$RELEASE_DIR/GoogleService-Info.plist" ] || fail "GoogleService-Info.plist missing in ios-release/ (causes black-screen crash on launch)"

echo "RELEASE GATE OK: appId=$APPID server.url=$URL"
