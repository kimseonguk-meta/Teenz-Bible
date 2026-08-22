# Teenz Bible — 다음 AI용 최종 요약

> 이 문서는 긴 인수인계 자료를 읽기 전에 현재 프로젝트를 정확히 이해하기 위한 기준선이다. 상세 지침은 [`AI_CONTINUITY_GUIDE.md`](AI_CONTINUITY_GUIDE.md), 운영 절차는 [`HANDOFF.md`](HANDOFF.md), 환경·비밀 관리는 [`ENVIRONMENT.md`](ENVIRONMENT.md), 최종 제품 감사는 [`reports/full-product-audit-2026-08-22.md`](../reports/full-product-audit-2026-08-22.md)를 따른다.

## 현재 기준선

- GitHub 저장소: [`kimseonguk-meta/Teenz-Bible`](https://github.com/kimseonguk-meta/Teenz-Bible), 기준 브랜치 `main`
- 최신 GitHub 커밋: `8767071` — `docs: update successor summary for OTA 1.1.186` (이전 기능/UI 커밋: `3e6befd`)
- Firebase 프로젝트: `teens-bible-94271`
- Live PWA: <https://teens-bible-94271.web.app/>
- 현재 웹/OTA 기준: **1.1.187**
- OTA manifest: <https://teens-bible-94271.web.app/ota/latest.json>
- 현재 iOS App Store 기준: Version `1.2.1`, Build `6`
- App Store 상태는 시간이 지나면 바뀌므로 제출·취소·릴리스 전에는 반드시 App Store Connect의 최신 화면을 확인한다.

OTA 1.1.186은 Profile의 Reset Progress 확인창, Bible Reader 읽기 제한 모달 X, Home 백업 카드 X를 보정했다. OTA 1.1.187은 Home 상단 Google·Apple 로그인/백업 카드를 다른 콘텐츠 섹션과 구분되는 차분한 녹색 계열로 다시 조정하고, X는 시각적으로 작고 보조적인 `×` 아이콘으로 표시한다. 실제 터치 영역은 유지하며 기존 Google·Apple 버튼과 익명 사용자용 카드 표시를 변경하지 않았다.

## 구조를 이렇게 이해한다

> **`app/` 웹 원본 → `native-ios/web/` Capacitor base bundle → Xcode `public/` embedded bundle + Firebase Hosting OTA**

새 웹 작업은 항상 `app/`에서 시작한다. 최상위의 오래된 `runtime-fixes-1.1.xx.*`, 과거 ZIP, 복구용 asset은 현재 source of truth가 아니다. 이번 기준 React bundle은 반드시 `app/assets/index-GemFix1184.js`를 유지한다. React main bundle이나 lazy chunk 파일명을 1185·1186·1187 등으로 바꾸면 이전처럼 Error Boundary가 발생할 수 있다.

웹 UI·CSS·runtime JavaScript·문구·웹 데이터 동작은 보통 OTA로 배포하므로 Xcode 재빌드가 필요하지 않다. Swift, Capacitor plugin, Info.plist permission, Apple·Google native authentication, Camera·Photo native integration, icon, entitlement, signing 변경은 새 iOS Archive가 필요하다.

## Firebase 배포 경계

Hosting/PWA/OTA, RTDB Rules, Cloud Functions는 서로 별도 배포 대상이다.

| 대상 | 원본 | 가장 큰 위험 |
|---|---|---|
| Hosting/PWA/OTA | `app/` | `latest.json`의 ZIP URL·SHA-256·size 불일치 |
| RTDB Rules | `app/database.rules.json` | deploy 시 live rules 전체 덮어쓰기 |
| Cloud Functions | `functions/` | Auth·계정 삭제·데이터 cleanup regression |

배포 전 `.firebaserc`가 올바른 Firebase 프로젝트를 가리키는지 확인한다. `blocks`와 `safetyReports`는 UGC 안전 기능의 핵심이므로 보호 규칙을 약화하거나 제거하지 않는다. `reports`, `flaggedChapters`, `adminTokens`, `memeReactions`, `memeSubmissions`는 넓은 권한을 재검토해야 하는 후속 보안 과제다.

## iOS와 OTA의 필수 규칙

- `App.xcodeproj`가 아니라 반드시 `native-ios/ios/App/App.xcworkspace`를 연다.
- CocoaPods를 설치한 뒤 GoogleSignIn과 CapacitorCamera dependency가 로드되는지 확인한다.
- `SceneDelegate.swift`의 `TeenzFirebaseAuthenticationPlugin` 등록을 유지한다.
- `Info.plist`의 Camera·Photo Library usage descriptions를 유지한다.
- 새 native Archive 전에는 `app/`을 `native-ios/web/`에 동기화하고 `pnpm exec cap sync ios`를 실행한다.
- OTA는 ZIP을 받은 즉시 적용되지 않는다. 앱 열기 → 약 30초 대기 → 앱을 완전히 종료 → 다시 열기 순서로 활성화한다.
- 현재 Build 6 다음 native 업로드는 같은 Version을 유지한다면 Build 7 이상이어야 한다.

## 1.1.187 안전 규칙

`safeRemoveChild` guard는 유지한다. 검은 화면을 일으킨 Loading DOM guard는 절대 재추가하지 않는다. 금지된 구현 패턴은 `__tbLoadingFallbackGuard`, `tb-native-stale-loading`, `installLoadingFallbackGuard`, `hideStaleFallbacks`, `scheduleHideStaleFallbacks`다.

Reset Progress, Reading gate X, Home backup X는 React 렌더링에 종속되지 않도록 runtime bridge에서 처리한다. 다만 runtime bridge를 광범위한 MutationObserver로 감싸면 자기 자신이 만든 mutation을 다시 감지하는 무한 루프가 생길 수 있으므로, 제한된 주기와 예외 격리 방식을 유지한다.

## 제품 감사에서 남은 우선 과제

주요 탐색·Bible AI·Bible Map·Reader·Bible 목록·Ranking·Gem Store·Profile 흐름은 감사 범위에서 대체로 정상이다. 다음 세 항목은 아직 별도 QA가 필요하다.

1. 영어와 한국어 성경 본문 일부에 과도한 구어체·속어·부적절하게 보일 수 있는 표현이 남아 있다. Genesis 1·2, Acts 13, Revelation 1에서 특히 확인되었다. 66권을 무리하게 일괄 치환하지 말고 원문 대조와 장별 콘텐츠 QA를 수행한다.
2. Quiz 버튼의 보상 표기와 결과 화면의 Gem 보상이 다르게 보이는 사례가 있다. 실제 문제·정답·재시도·보상 상수를 단일 기준으로 정리해야 한다.
3. Cheer 수신함과 콘페티는 수신 Cheer가 있는 두 계정으로 실제 iPad에서 검증해야 한다. 현재 감사 계정은 익명·수신 데이터 없음 상태였으며, 푸시 알림 기능은 현재 범위가 아니다.

Gem Store의 Reader/Frames/Pets, 구매·소유권·장착 적용은 실제 계정에서 한 번 더 검증한다. Theme 기능은 제품에서 제거된 상태이므로 새 Theme 기능을 추가하지 않는다. Reader Skin trigger도 사용자 화면에 노출하지 않는다.

## 안전 기능과 실제 테스트

Delete Account는 체크박스 동의, `DELETE` 직접 입력, 최근 로그인 조건을 통과해야 하며 실제 삭제는 테스트 계정으로만 검증한다. 성공 판단은 버튼 활성화가 아니라 Firebase Auth 삭제와 RTDB data cleanup까지 확인하는 것이다.

Report는 `safetyReports`, Block은 `blocks`를 사용한다. Report·Block·Cheer 차단은 실제 iPad와 Galaxy PWA에서 touch interaction까지 검증한다.

## 다음 작업 시작 순서

1. GitHub `main`에서 최신 커밋 `8767071`을 pull한다.
2. 이 문서, `AI_CONTINUITY_GUIDE.md`, `HANDOFF.md`, `ENVIRONMENT.md`, `NEW_DEVELOPER_CHECKLIST.md`, `native-ios/README.md`, 최종 감사 보고서를 읽는다.
3. `git status --short`로 로컬 변경을 확인한다. 저장소에는 과거 `native-ios/`와 여러 asset·OTA 파일이 untracked 상태로 남아 있을 수 있으므로, 사용자가 요청하지 않은 파일은 일괄 add하지 않는다.
4. 사용자에게 현재 원하는 변경과 최신 App Store Connect 화면을 요청한다.
5. 요청을 web OTA, Firebase, native iOS, App Store 중 하나로 분류한다.
6. Galaxy PWA·iPad 실기기에서 재현하고, 관련 파일만 stage·commit한다.
7. Firebase deploy, OTA publish, App Store submit처럼 되돌리기 어려운 행동은 사용자 확인 후 실행한다.

## 절대 하지 않을 것

실제 service account JSON, Apple `.p8`·`.p12`, provisioning profile, OAuth client secret, access token, 테스트 계정 비밀번호를 GitHub에 커밋하지 않는다. 사용자의 실제 mobile test 없이 “해결 완료”라고 단정하지 않는다. 과거 runtime 파일을 현재 기준으로 수정하지 않는다. `App.xcodeproj`를 직접 열지 않는다. Firebase Console에서 수동으로 바꾼 Rules를 Git 원본과 불일치한 상태로 두지 않는다.

## References

[1]: https://github.com/kimseonguk-meta/Teenz-Bible "Teenz Bible GitHub main"
[2]: https://teens-bible-94271.web.app/ "Live Teenz Bible PWA"
[3]: https://teens-bible-94271.web.app/ota/latest.json "Current OTA manifest"
[4]: https://firebase.google.com/docs/cli "Firebase CLI documentation"
[5]: https://capacitorjs.com/docs/ios "Capacitor iOS documentation"
[6]: https://manus.im/backup "Manus data backup page"
