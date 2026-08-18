# Teenz Bible — 다음 AI용 연속성 가이드

> **사용 대상:** Teenz Bible을 새로 이어받는 AI 에이전트 또는 개발 보조자
> **마지막 기술 기준선:** 2026-08-18 (GMT+8)
> **GitHub 기준 브랜치:** [`main`](https://github.com/kimseonguk-meta/Teenz-Bible/tree/main)
> **앱 릴리스 기준:** PWA/OTA `1.1.127`, iOS `1.2.1 (Build 6)`

이 문서는 일반 인수인계 문서가 아니라, **다음 AI가 첫 대화부터 무엇을 이해하고 어떤 실수를 피해야 하는지** 기록한 작업 연속성 가이드다. 작업을 시작하기 전에 [`HANDOFF.md`](HANDOFF.md), [`ENVIRONMENT.md`](ENVIRONMENT.md), [`NEW_DEVELOPER_CHECKLIST.md`](NEW_DEVELOPER_CHECKLIST.md), [`../native-ios/README.md`](../native-ios/README.md)를 함께 읽는다.

## 1. AI에게 바로 붙여넣을 시작 프롬프트

아래 블록은 다음 AI에게 그대로 전달할 수 있다.

```text
Teenz Bible 프로젝트를 이어서 작업해줘. 사용자는 비기술적이며 한국어로 아주 짧고 단계별 안내를 원한다. 작업 전 GitHub main을 pull하고 docs/AI_CONTINUITY_GUIDE.md, docs/HANDOFF.md, docs/ENVIRONMENT.md, docs/NEW_DEVELOPER_CHECKLIST.md, native-ios/README.md를 읽어라.

현재 기준은 Firebase Hosting PWA/OTA 1.1.127과 iOS 1.2.1 Build 6이다. app/이 유일한 웹 원본 기준이며, native-ios/web과 native-ios/ios/App/App/public은 iOS base bundle 미러다. 웹 UI/JS/CSS 수정은 원칙적으로 OTA로 배포하고 Xcode 재빌드는 하지 않는다. Swift, Capacitor plugin, Info.plist, Apple/Google native login, camera/photo permission, icon/signing 변경만 새 iOS Archive가 필요하다.

사용자에게 실제 기기 테스트 없이 해결됐다고 말하지 마라. Galaxy PWA와 iPad iOS 앱의 터치/모달/OTA를 우선 검증하라. Firebase Rules·Functions·Hosting은 서로 별도 배포 대상이다. 서비스 계정 JSON, Apple key/certificate, OAuth secret은 절대 GitHub에 커밋하지 마라. App Store Connect의 현재 상태는 과거 기록이므로 제출·취소·릴리스 전에 반드시 사용자가 제공한 최신 화면 또는 실제 로그인 세션으로 확인하라.

현재 알려진 보안 후속 과제는 RTDB rules의 reports, flaggedChapters, adminTokens, memeReactions, memeSubmissions 권한 최소화다. blocks와 safetyReports 보호 규칙은 유지해야 한다. 커밋할 때는 현재 작업과 직접 관련된 파일만 stage하고, 과거 runtime/OTA 복구 파일이나 node_modules를 무분별하게 커밋하지 마라.
```

## 2. 프로젝트를 한 문장으로 설명하면

Teenz Bible은 Firebase Hosting에서 제공되는 **복구된 정적 PWA**를 기반으로 하며, Capacitor/CocoaPods iOS shell이 같은 웹 번들을 내장하고 Firebase Hosting의 self-hosted OTA ZIP을 받아 다음 재시작에 활성화하는 구조다.

> **가장 중요한 구조 원칙:** 읽기 쉬운 원래 React/TSX source 전체가 아닌, 현재 live 배포본과 versioned runtime injection 파일이 실질적 작업 기준이다. 따라서 무작정 구조를 재작성하지 말고, 먼저 현재 live PWA와 `app/`의 runtime 기준을 비교한다.

## 3. 현재 기능·배포 상태

| 영역 | 현재 상태 | 다음 AI가 알아야 할 점 |
|---|---|---|
| Live PWA | `https://teens-bible-94271.web.app/` | `app/`이 Firebase Hosting public root |
| Runtime/OTA | `1.1.127` | `app/index.html`과 `app/ota/latest.json`이 같은 버전을 가리켜야 함 |
| iOS binary | `1.2.1 (Build 6)` | App Store binary 기준. 다음 업로드는 새 Build 번호 필요 |
| OTA 활성화 | `updater.next({id})` | 다운로드 후 **다음 background/restart**에서 적용됨 |
| Apple/Google login | iOS native bridge로 수정됨 | 실제 iPad에서만 최종 판단 |
| Profile photo | Camera/Gallery native permission 포함 | `Info.plist`, Camera pod를 보존 |
| Delete Account | Cloud Function + multi-step UI | 체크박스 + `DELETE` + 최근 로그인 10분 |
| UGC safety | Report/Block 포함 | `blocks`, `safetyReports` RTDB rules 유지 |
| App Store review | 2026-08-18 기준 Build 6 재제출 후 Waiting for Review | 현재 상태는 App Store Connect에서 재확인 필요 |

## 4. 사용자와 협업하는 방식

사용자는 **한국어**를 사용하며 개발자가 아니다. 다음 행동 원칙을 따른다.

| 해야 할 일 | 피해야 할 일 |
|---|---|
| Mac/Xcode 작업은 Terminal부터 한 줄씩 안내 | 긴 명령 목록을 한 번에 보내기 |
| 사용자가 보낸 스크린샷의 현재 상태를 먼저 읽기 | 과거 화면을 현재 상태로 가정하기 |
| 실제 iPad/Galaxy 테스트를 요청하고 결과를 확인 | 브라우저 콘솔만 보고 mobile bug가 해결됐다고 단정하기 |
| 비가역적 행동(심사 제출, 취소, 배포)은 분명히 확인받기 | App Store 제출/취소를 사용자의 명시 동의 없이 수행하기 |
| 오류가 난 명령은 화면을 받은 뒤 한 단계씩 복구 | 같은 실패 명령을 반복시키기 |
| GitHub에는 관련 파일만 stage·commit | 작업 폴더의 오래된 runtime, node_modules, 로컬 캐시를 한꺼번에 커밋 |

사용자는 이전에 UI 문제를 여러 번 겪었다. 특히 **버튼이 눌리지 않음, modal이 옆으로 밀림, X/Close가 닫히지 않음, Avatar touch 무반응**과 같은 모바일 interaction 회귀를 최우선으로 다룬다.

## 5. 파일 지도: 어디를 수정해야 하는가

| 필요 작업 | 우선 확인 파일 | 주의사항 |
|---|---|---|
| PWA UI/동작 | `app/runtime-fixes-1.1.127.js/.css`, `app/index.html` | 새 수정은 새 versioned runtime 파일로 만든다 |
| OTA manifest | `app/ota/latest.json` | ZIP URL·SHA-256·size를 실제 파일과 일치시킨다 |
| OTA ZIP | `app/ota/1.1.127.zip` | root에 `index.html` 필요 |
| Firebase Rules | `app/database.rules.json` | Console 수동 변경은 반드시 파일에도 반영 |
| Account deletion server | `functions/index.js` | Firebase Auth ID token 및 최근 로그인 조건 유지 |
| iOS web source | `native-ios/web/` | Capacitor `webDir` |
| Xcode embedded web | `native-ios/ios/App/App/public/` | `cap sync ios`가 webDir를 반영함 |
| iOS OAuth bridge | `native-ios/ios/App/App/SceneDelegate.swift` | `TeenzFirebaseAuthenticationPlugin` 등록 보존 |
| iOS permissions | `native-ios/ios/App/App/Info.plist` | Camera/Photo descriptions 보존 |
| Native dependencies | `native-ios/ios/App/Podfile` | GoogleSignIn, CapacitorCamera 보존 |
| iOS version/build | `native-ios/ios/App/App.xcodeproj/project.pbxproj` | 현재 version 1.2.1, Build 6 |

**수정하지 말아야 할 기준:** 저장소 최상위의 오래된 `runtime-fixes-1.1.xx.*`, 과거 ZIP, 복구 asset은 현재 app source of truth가 아니다. 새 작업은 `app/`에서 시작한다.

## 6. Firebase 작업 절차와 위험 지점

### 배포 대상은 세 가지로 분리한다

| 배포 대상 | 원본 | 명령 예시 | 위험 |
|---|---|---|---|
| Hosting/PWA/OTA | `app/` | `firebase deploy --only hosting` | manifest·ZIP mismatch면 iOS OTA 실패 |
| RTDB rules | `app/database.rules.json` | `firebase deploy --only database` | live rule 전체를 덮어씀 |
| Cloud Functions | `functions/` | `firebase deploy --only functions` | auth/data deletion regression 가능 |

배포 전 반드시 Firebase 프로젝트가 `teens-bible-94271`인지 확인한다.

```bash
cat .firebaserc
npx --yes firebase-tools@latest projects:list
npx --yes firebase-tools@latest use teens-bible-94271
```

### Firebase 보안 주의사항

`blocks`와 `safetyReports`는 App Store UGC 안전 기능의 핵심이다. 권한 검증을 약화시키지 않는다.

그러나 현재 다음 RTDB 노드는 공개 쓰기 또는 넓은 권한이 남아 있어 별도 보안 작업이 필요하다.

```text
reports
flaggedChapters
adminTokens
memeReactions
memeSubmissions
```

다음 AI는 이들을 즉시 깨뜨리지 말고, 먼저 데이터 구조·기존 클라이언트 호출·관리자 운영 방식·migration 계획을 확인한 뒤 최소 권한 rules를 설계한다.

### 비밀값

`.env`는 현재 runtime 필수 파일이 아니다. `GOOGLE_APPLICATION_CREDENTIALS`는 local Firebase CLI 자동 배포용 선택 사항이다. 다음 파일은 절대 GitHub에 넣지 않는다.

```text
Firebase service-account JSON
Apple .p8/.p12/.mobileprovision/.cer
OAuth client secret
개인 access token
테스트 계정 비밀번호
```

## 7. OTA 작업 순서

웹 레이어 변경은 보통 Xcode 없이 다음 순서로 처리한다.

1. 현재 `1.1.127`을 새 버전(예: `1.1.128`)으로 복사한다.
2. JS의 `PATCH_VERSION`, `index.html`의 CSS/JS 참조를 새 버전으로 바꾼다.
3. PWA에서 실제 touch/modal/overlay 동작을 확인한다.
4. 검증된 이전 ZIP을 staging에 풀고 새 `index.html`, 새 runtime JS/CSS를 넣어 새 ZIP을 만든다.
5. 새 ZIP의 SHA-256과 byte size로 `app/ota/latest.json`을 갱신한다.
6. Hosting에 배포하고 live URL에서 manifest와 ZIP checksum을 다시 확인한다.
7. iPad에서 **열기 → 30초 대기 → background/restart → 다시 열기**로 활성화 확인한다.
8. 관련 `app/` 파일과 새 ZIP을 GitHub에 함께 커밋한다.

현재 runtime이 실제로 읽는 manifest URL은 다음이다.

```text
https://teens-bible-94271.web.app/ota/latest.json
```

OTA는 `autoUpdate: off`인 native 설정을 대체하는 manual bridge다. 새 ZIP은 `updater.next({ id })`로 다음 restart에만 적용된다.

## 8. iOS 작업 순서

### 새 binary가 필요한 변경

| 새 App Store binary 필요 | OTA로 가능 |
|---|---|
| Swift 코드 | JS/CSS/UI 문구 |
| Capacitor plugin | Ranking/Report/Block 웹 UI |
| `Info.plist` permission | runtime modal layout |
| Apple/Google native auth | Firebase 웹 데이터 동작 |
| App icon, entitlement, signing | 최신 OTA ZIP/manifest |

### Mac 준비

```bash
cd native-ios
nvm use
corepack enable
pnpm install --frozen-lockfile
pnpm exec cap sync ios
cd ios/App
pod install --repo-update
open App.xcworkspace
```

> **절대 `App.xcodeproj`를 직접 열지 않는다.** CocoaPods native dependency가 빠져 Google login, Camera, Firebase 동작이 달라질 수 있다.

Xcode 설정 기준은 `App` target, bundle ID `com.teenzbible.app`, iOS 15.0+, current version `1.2.1`, Build 6보다 큰 새 번호, **Any iOS Device (arm64)**다.

### iOS base bundle 동기화

새 native Archive 전에 다음을 놓치면 안 된다.

```bash
# repository root
cp -a app/. native-ios/web/
cd native-ios
pnpm exec cap sync ios
```

이 단계가 없으면 App Store에서 새로 설치한 사용자가 OTA를 받기 전 구버전 UI를 볼 수 있다. `public/`은 generated mirror이지만 현재 재현 기준으로 GitHub에도 보존되어 있다.

`Podfile.lock`은 현 기준 main에 없다. 첫 `pod install --repo-update` 후 생성되는 lockfile을 검토하고, native dependency가 변경되는 후속 작업에서는 lockfile을 함께 커밋하는 것을 권장한다.

## 9. 현재 테스트 최소 기준

| 환경 | 반드시 확인할 기능 |
|---|---|
| Galaxy PWA | Crew create/join/close, Profile avatar/photo sheet, Ranking modal, Bible AI input/back |
| iPad iOS | Apple Login, Google Login, Camera, Gallery, Profile photo, Cheer, OTA restart |
| 두 계정 | Cheer 수신·conffetti·24h 제한, Report, Block |
| 테스트 계정 | Delete Account UI guard 및 end-to-end 삭제 |
| App Store | screenshot, privacy, support URL, App Review Notes, Build 연결 |

Delete Account의 실제 삭제는 **테스트 계정**에서만 한다. 성공 여부 판단은 `DELETE` input 활성화만으로 충분하지 않으며, 서버의 Auth 삭제와 RTDB data cleanup까지 확인한다.

## 10. GitHub·문서 작업 방식

새 AI는 작업 시작과 종료 때 다음을 확인한다.

```bash
git pull --ff-only origin main
git status --short
git diff --cached --check
```

- 현재 변경과 무관한 historic runtime/ZIP, `node_modules`, `.firebase/`, Apple signing material을 stage하지 않는다.
- 큰 OTA ZIP을 커밋할 때는 `index.html`, manifest, runtime JS/CSS와 같은 버전인지 확인한다.
- 제출/배포 후에는 GitHub `main` commit hash를 사용자에게 알려준다.
- 문서의 날짜·버전·App Store 상태가 바뀌면 `HANDOFF.md`와 이 문서를 함께 갱신한다.

## 11. 다음 AI가 시작할 첫 행동

1. 사용자에게 현재 원하는 변경 또는 Apple 상태 화면을 요청한다.
2. GitHub `main`을 pull하고 현재 `app/ota/latest.json` 및 docs를 읽는다.
3. 변경이 web/native/Firebase/App Store 중 어디에 속하는지 분류한다.
4. 사용자의 실제 기기와 현재 화면을 기준으로 재현한다.
5. 안전한 staging·검증·배포·GitHub commit 순서를 수행한다.

## References

[1]: https://github.com/kimseonguk-meta/Teenz-Bible "Teenz Bible GitHub main"
[2]: https://teens-bible-94271.web.app/ "Live Teenz Bible PWA"
[3]: https://firebase.google.com/docs/cli "Firebase CLI documentation"
[4]: https://capacitorjs.com/docs/ios "Capacitor iOS documentation"

[1] [2] [3] [4]
