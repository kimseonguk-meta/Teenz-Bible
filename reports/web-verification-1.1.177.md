# OTA 1.1.177 웹 검증 — 2026-08-21

배포 후 `https://teens-bible-94271.web.app/`를 열었고 Home 화면에 Google/Apple 연결 카드, Continue Reading, 하단 탭이 표시되었다.

Profile 탭으로 이동했을 때 첫 순간에는 단일 `Loading...` fallback이 보였지만, lazy 화면이 완료된 뒤 Profile 본문이 정상 표시되었다. 화면에는 Anonymous 프로필, 레벨/XP, 배지, Weekly Goal, Delete Account, 하단 탭이 나타났으며 Error Boundary 문구나 중복 Loading 패널은 확인되지 않았다.

이 검증은 웹 브라우저에서 수행했으며, native-only loading guard는 웹에서는 실행되지 않는다.

## 추가 관찰

Gem Store로 이동한 뒤 lazy 화면이 완료된 후에도 DOM/화면에 `Loading...`이 3개 남아 있었다. Store 본문 자체는 My Collection과 Reader/Frames/Pets 선택 영역을 표시했지만, 이 결과는 웹 버전이 완전히 정상이라는 기존 가정과 다르므로 추가 원인 분석이 필요하다. native-only guard는 웹에서 의도적으로 실행되지 않으므로, 이 현상은 Store 내부의 별도 loading 상태 또는 stale fallback이 웹에서도 만들어지는 문제일 가능성이 있다.

## DOM 원인 확인

브라우저 DOM을 직접 확인한 결과 Gem Store에는 `#root .tb-page`가 1개 존재하는 동시에 `client/src/App.tsx:37`에서 생성된 동일한 `Loading...` Suspense fallback panel이 3개 존재했다. 따라서 이 현상은 iPad WKWebView만의 문제가 아니며, 웹에서도 route/lazy transition 중 stale fallback이 누적되는 공통 문제다. guard는 active `.tb-page`가 있을 때 stale fallback을 숨기는 방식으로 native 제한을 제거하고 웹에도 적용해야 한다.

## OTA 1.1.178 재검증

캐시 우회 URL `https://teens-bible-94271.web.app/store?ota=1178`에서 실제 entry script가 `assets/index-GemFix1178.js`로 로드되었다. DOM 측정 결과 `Loading...` 개수는 0, active `.tb-page`는 1개, Error Boundary 문구는 false였다. 즉, 공통 guard 적용 후 Store의 기존 3개 Loading fallback이 화면에 남지 않는다.

Profile 캐시 우회 검증에서도 entry는 `index-GemFix1178.js`, `loadingCount`는 0, `.tb-page`는 1개, Error Boundary는 false였다.

공개 `ota/latest.json`도 `version: 1.1.178`, ZIP URL `/ota/1.1.178.zip`, checksum `76b5b18731e8549adadea54e4cd51d1ab4dfc2ba52ae575618da609423f9610f`, size `62561671`을 반환했다.
