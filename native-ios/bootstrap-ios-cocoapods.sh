#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

if ! command -v pod >/dev/null 2>&1; then
  cat >&2 <<'EOF'
CocoaPods is required for this rebuilt iOS project.
Install it once with: brew install cocoapods
Then run this script again.
EOF
  exit 1
fi

if ! command -v pnpm >/dev/null 2>&1; then
  cat >&2 <<'EOF'
pnpm is required.
Install it with: corepack enable && corepack prepare pnpm@11.21.0 --activate
Then run this script again.
EOF
  exit 1
fi

pnpm install --frozen-lockfile
pnpm exec cap sync ios

pushd ios/App >/dev/null
pod install --repo-update
popd >/dev/null

open ios/App/App.xcworkspace
