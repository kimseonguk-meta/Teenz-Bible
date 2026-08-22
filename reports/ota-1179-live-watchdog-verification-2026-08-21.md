# OTA 1.1.179 지속 화면 복구 검증

Firebase Hosting에 OTA 1.1.179를 배포했다.

캐시 우회 URL `https://teens-bible-94271.web.app/store?ota=1179`에서 실제 entry는 `assets/index-GemFix1179.js`로 로드되었다. DOM 측정 결과 `Loading...` 개수는 0, active `.tb-page`는 1개였다.

runtime 상태도 직접 확인했다.

- `root.__tbLoadingFallbackGuard`: true
- `root.__tbLoadingFallbackObserver`: 등록됨
- `root.__tbLoadingFallbackInterval`: 등록됨

이번 guard는 MutationObserver와 500ms 보조 점검을 사용하며, `focus`, `pageshow`, `visibilitychange`, Capacitor `appStateChange` 이벤트에서도 다시 점검한다. 기존 React bundle을 실행 중에 교체하지 않고, stale Loading panel의 표시만 안전하게 숨긴다.
