# Teenz Bible — 현재 라이브 Firebase 릴리스 복구본

> **현재 운영·배포 기준선:** 새 작업을 시작하기 전에 반드시 [`docs/HANDOFF.md`](docs/HANDOFF.md)를 읽으세요. 이 README의 Hosting 복구 이력은 2026-08-13 기준 정적 복구 기록이며, 이후의 **OTA 1.1.127**, **iOS 1.2.1 (Build 6)**, Firebase 안전 기능·App Store 제출 상태는 인수인계 문서가 최신 기준입니다.


이 폴더는 다음 URL에 현재 서비스 중인 파일을 **Firebase Hosting 릴리스 API 기준으로 전체 복구한 결과**다.

> https://teens-bible-94271.web.app/

## 기준 릴리스

| 항목 | 값 |
|---|---|
| Firebase Hosting site | `teens-bible-94271` |
| 현재 라이브 release type | `ROLLBACK` |
| 현재 라이브 release time | 2026-08-13 15:17:12 UTC |
| 기준 version | `sites/teens-bible-94271/versions/ca0632456d0f7e40` |
| version created | 2026-08-09 00:13:33 UTC |
| 복구 파일 수 | 325개 |
| Hosting API 오류 | 0개 |

`ROLLBACK`은 현재 URL이 과거에 생성된 특정 Hosting 버전으로 되돌려져 있다는 뜻이다. 따라서 이 폴더는 지금 사용자가 접속하는 라이브 사이트와 정확히 같은 정적 파일 집합이다.

## 주요 파일

| 경로 | 내용 |
|---|---|
| `index.html` | 현재 라이브 앱 HTML 셸 |
| `assets/index-CcqAg5kV.js` | 현재 메인 React/Vite 번들 |
| `assets/index-oF6fknfP.css` | 현재 메인 CSS 번들 |
| `assets/*.js` | Bible, Bible AI, 지도, 리더보드, 프로필, 스토어 등 지연 로딩 기능 번들 |
| `assets/*.css` | 화면별 스타일 번들 |
| `manus-storage/` | 현재 배포에 포함된 앱 아이콘·게임 UI·삽화 자산 |
| `icons/`, `manifest.json`, `sw.js`, `firebase-messaging-sw.js` | PWA·알림 관련 파일 |
| `__/firebase/` | Firebase 앱 초기화 파일 |
| `firebase-release-manifest.json` | 파일별 크기, MIME 타입, SHA-256 해시 및 복구 결과 |
| `inferred-react-source-paths.md` | 번들 내부 정보에서 추론한 최신 React 원본 구조 |

## 검증

`firebase-release-manifest.json`에는 Firebase Hosting API에서 확인한 현재 릴리스의 정확한 경로 목록과 각 복구 파일의 SHA-256 해시가 들어 있다. 별도로 추출한 핵심 파일(`index.html`, `manifest.json`, 메인 JavaScript/CSS)의 해시는 라이브 URL에서 재다운로드한 값과 일치한다.

## 매우 중요한 구분

이 폴더는 **현재 라이브 버전의 완전한 정적 배포본**이다. 다만 `assets/*.js`는 Vite가 빌드한 JavaScript 번들이므로, 원래의 읽기 쉬운 TypeScript/TSX 소스 전체와는 다르다. 최신 원본은 `client/src/` 아래 32개 이상의 React 모듈 구조로 제작된 것으로 추론되며, 목록은 `inferred-react-source-paths.md`에 기록되어 있다.

이제부터 버그를 수정할 때는 이 폴더를 실행 기준으로 삼고, export에서 발견된 예전 파란색 HTML(`v61` 등)은 현재 버전으로 되돌리는 데 사용하지 않는다.
