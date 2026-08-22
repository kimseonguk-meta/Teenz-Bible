# OTA 1.1.181 DOM guard 제거 검증

OTA 1.1.181은 검은 화면을 유발한 Loading DOM guard와 `.tb-native-stale-loading` CSS 규칙을 완전히 제거했다.

캐시 우회 웹 URL `https://teens-bible-94271.web.app/?ota=1181`에서 Home을 열고 Bible 탭을 클릭했다. 전환 중 단일 Loading fallback이 표시되었으며, 대기 후 Bible 본문이 정상적으로 표시되었다. Old Testament·New Testament, Genesis·Exodus·Leviticus 등 성경 카드와 하단 탭이 모두 보였다. 전체 app shell이 숨겨지는 검은 화면은 재현되지 않았다.

배포 entry는 `runtime-fixes-1.1.181.js`, `runtime-fixes-1.1.181.css`, `assets/index-GemFix1181.js`를 사용했다.
