# iPad Loading regression findings — 2026-08-21

## User evidence
The iPad screenshots show one, two, and three visible `Loading...` spinners on Home, Profile, and Store respectively. The active page content and bottom navigation remain visible underneath, so this is not a simple centered full-screen initial loader. It indicates stale or repeated React Suspense fallback layers during native route/OTA startup.

## Web comparison
The deployed web session runs `runtime-fixes-1.1.176.js` and `assets/index-GemFix1176.js`. Home, Profile, and Store direct routes eventually render normally. The remote latest manifest reports OTA 1.1.176 with checksum `276be21b6341d8add7f2d5c1a781d12fec4d8a383ec0580878271978490cd8f6` and size `62611265`.

## Source facts
The remote core contains one literal `Loading...` string in `client/src/App.tsx` lines 35–37, used as the fallback of one top-level React `Suspense` in `App.tsx` lines 45–47. The Profile lazy chunk contains no literal `Loading...`, no `Suspense`, and no `GW` fallback reference. Therefore the repeated iPad spinners are not three independent Profile/Store data loaders; they are repeated or stale top-level route fallback layers, most likely caused by native WKWebView OTA/cache startup or a failed lazy-module transition that leaves prior fallback DOM visible.

## Current conclusion
Do not treat this as a color/design issue or Firebase content issue. Web rendering is healthy; iOS native WebView needs a route-safe fallback cleanup/recovery guard, preferably native-only and non-destructive, so real page content is not hidden by stale duplicate Suspense layers. Existing modal, navigation, and Profile photo fixes must remain unchanged.
