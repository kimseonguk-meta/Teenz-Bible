# Teenz Bible — 다음 AI용 최종 요약

> 이 문서는 긴 인수인계 자료를 읽기 전에 현재 프로젝트를 정확히 잡기 위한 **짧은 기준선 요약본**이다. 상세 지침은 [`AI_CONTINUITY_GUIDE.md`](AI_CONTINUITY_GUIDE.md), 운영 절차는 [`HANDOFF.md`](HANDOFF.md), 환경·비밀 관리는 [`ENVIRONMENT.md`](ENVIRONMENT.md)를 따른다.

## 현재 기준선

- GitHub 저장소: [`kimseonguk-meta/Teenz-Bible`](https://github.com/kimseonguk-meta/Teenz-Bible), 기준 브랜치 `main`
- Firebase 프로젝트: `teens-bible-94271`
- Live PWA: <https://teens-bible-94271.web.app/>
- 현재 웹/OTA 기준: `1.1.185` — Reader Skin/🎨 Theme trigger 비노출 패치
- 최신 GitHub 커밋: `1c92969` (`chore: preserve latest native iOS assets and handoff docs`)
- 현재 iOS App Store 기준: Version `1.2.1`, Build `6`
- App Store 상태는 시간이 지나면 바뀌므로, 제출·취소·릴리스 전에는 반드시 App Store Connect의 최신 화면을 확인한다.
- 1.1.185 최종 웹 검증: `/bible/genesis/1` 본문 정상, Error Boundary 없음, 사용자 화면에서 `Reader Skin`·`Dark ✓` 비노출. Profile은 초기 진입이 느릴 수 있으나 이후 본문과 사진 sheet가 정상 표시됐다.
- 현재 후속 확인 과제: Profile 초기 Loading 지연, Bible AI 실제 질문 응답, Store 구매·적용의 실계정 검증, 영어·한국어 성경 문체/품질 전수 검수.

## 구조를 이렇게 이해한다

> **`app/` 웹 원본 → `native-ios/web/` Capacitor base bundle → Xcode `public/` embedded bundle + Firebase Hosting OTA**

새 웹 작업은 항상 `app/`에서 시작한다. 최상위의 오래된 `runtime-fixes-1.1.xx.*`, 과거 ZIP, 복구용 asset은 현재 source of truth가 아니다.

웹 UI·CSS·runtime JavaScript·문구·웹 데이터 동작은 보통 OTA로 배포하므로 Xcode 재빌드가 필요하지 않다. Swift, Capacitor plugin, Info.plist permission, Apple/Google native authentication, Camera/Photo native integration, icon, entitlement, signing 변경은 새 iOS Archive가 필요하다.

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
- OTA manifest는 <https://teens-bible-94271.web.app/ota/latest.json>이다.
- OTA는 ZIP을 받은 즉시 적용되지 않는다. 앱 열기 → 약 30초 대기 → background/restart → 다시 열기 순서로 활성화한다.
- 현재 Build 6 다음 native 업로드는 같은 Version을 유지한다면 Build 7 이상이어야 한다.

## 안전 기능과 실제 테스트

Delete Account는 체크박스 동의, `DELETE` 직접 입력, 최근 로그인 10분 조건을 통과해야 하며, 실제 삭제는 테스트 계정으로만 검증한다. 성공 판단은 버튼 활성화가 아니라 Firebase Auth 삭제와 RTDB data cleanup까지 확인하는 것이다.

Report는 `safetyReports`, Block은 `blocks`를 사용한다. Report·Block·Cheer 차단은 실제 iPad와 Galaxy PWA에서 touch interaction까지 검증한다.

## 첫 실행 순서

1. GitHub `main`을 pull한다.
2. 이 문서, `AI_CONTINUITY_GUIDE.md`, `HANDOFF.md`, `ENVIRONMENT.md`, `NEW_DEVELOPER_CHECKLIST.md`, `native-ios/README.md`를 읽는다.
3. `git status --short`로 로컬 변경을 확인한다.
4. 사용자에게 현재 원하는 변경과 최신 App Store Connect 화면을 요청한다.
5. 요청을 web OTA, Firebase, native iOS, App Store 중 하나로 분류한다.
6. Galaxy PWA·iPad 실기기에서 재현하고, 관련 파일만 stage·commit한다.
7. Firebase deploy, OTA publish, App Store submit처럼 되돌리기 어려운 행동은 사용자 확인 후 실행한다.

## 절대 하지 않을 것

실제 service account JSON, Apple `.p8`/`.p12`, provisioning profile, OAuth client secret, access token, 테스트 계정 비밀번호를 GitHub에 커밋하지 않는다. 사용자의 실제 mobile test 없이 “해결 완료”라고 단정하지 않는다. 과거 runtime 파일을 현재 기준으로 수정하지 않는다. `App.xcodeproj`를 직접 열지 않는다. Firebase Console에서 수동으로 바꾼 Rules를 Git 원본과 불일치한 상태로 두지 않는다.

## References

[1]: https://github.com/kimseonguk-meta/Teenz-Bible "Teenz Bible GitHub main"
[2]: https://teens-bible-94271.web.app/ "Live Teenz Bible PWA"
[3]: https://firebase.google.com/docs/cli "Firebase CLI documentation"
[4]: https://capacitorjs.com/docs/ios "Capacitor iOS documentation"

[1] [2] [3] [4]
