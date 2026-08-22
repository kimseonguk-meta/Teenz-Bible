# Teenz Bible — 단일 마스터 인수인계 문서

> **이 파일만 먼저 읽어도 된다.** 2026년 8월 23일 이후 Meta.AI, Project Hatch 또는 다른 AI 에이전트가 Teenz Bible을 별도 설명 없이 이어받을 수 있도록 현재 상태·구조·운영 절차·보안 경계·테스트 방법·첫 실행 프롬프트를 한 곳에 모았다.

**최종 기준일:** 2026-08-22 (GMT+8)
**GitHub:** [`kimseonguk-meta/Teenz-Bible`](https://github.com/kimseonguk-meta/Teenz-Bible)
**기준 브랜치:** `main`
**최근 기준 커밋:** 저장소를 clone한 뒤 `git log -1 --oneline`으로 확인
**Firebase project:** `teens-bible-94271`
**Live PWA:** <https://teens-bible-94271.web.app/>
**현재 웹/OTA 기준:** `1.1.195`
**현재 iOS 기준:** Version `1.2.1`, Build `6`

---

## 0. 다음 AI에게 그대로 붙여넣는 시작 프롬프트

아래 블록을 Meta.AI 또는 Project Hatch의 새 대화 첫 메시지로 복사한다.

```text
Teenz Bible 프로젝트를 이어서 작업해줘. 이 프로젝트의 단일 기준 문서는 GitHub main의 docs/TEENZ_BIBLE_MASTER_HANDOFF.md다. 먼저 GitHub 저장소 kimseonguk-meta/Teenz-Bible의 main을 확인하고 이 문서 전체를 읽은 뒤, 현재 기준선과 다음 행동을 한국어로 짧게 요약해줘. 그 다음 내가 해결하고 싶은 문제를 설명하겠다.

사용자는 비기술적이며 한국어로 한 번에 한 단계씩 안내받아야 한다. 긴 명령을 한 번에 주지 말고, 사용자가 실행한 화면을 확인한 뒤 다음 한 단계만 안내해라. 실제 Galaxy PWA 또는 iPad에서 확인하기 전에는 mobile UI 문제가 해결됐다고 단정하지 마라.

현재 기준은 Firebase Hosting PWA/OTA 1.1.127과 iOS Version 1.2.1 Build 6이다. app/이 웹의 유일한 원본이다. native-ios/web과 native-ios/ios/App/App/public은 iOS base bundle 미러다. 웹 UI·CSS·runtime JS·문구 변경은 원칙적으로 OTA로 처리하고, Swift·Capacitor plugin·Info.plist 권한·native Apple/Google login·Camera/Photo native integration·icon·entitlement·signing 변경만 새 Xcode Archive가 필요하다.

Firebase Hosting, RTDB Rules, Cloud Functions는 서로 별도 배포 대상이다. 기본 Firebase project는 teens-bible-94271이다. blocks와 safetyReports의 UGC 안전 Rules를 약화하거나 삭제하지 마라. 실제 service account JSON, Apple .p8/.p12, provisioning profile, OAuth secret, token, 테스트 계정 비밀번호는 절대 GitHub에 커밋하지 마라.

iOS 작업은 App.xcodeproj가 아니라 반드시 native-ios/ios/App/App.xcworkspace를 열어라. App Store 제출·취소·릴리스·Firebase production deploy처럼 되돌리기 어려운 행동은 실행 전에 나에게 확인받아라. App Store 상태는 과거 문서보다 사용자가 제공하는 최신 App Store Connect 화면을 우선한다.

작업 전에는 git pull --ff-only origin main, git status --short, app/ota/latest.json 확인을 수행하고, 변경과 직접 관련된 파일만 stage·commit해라. 이전 runtime/OTA 복구 파일, node_modules, .firebase, Apple signing material은 무분별하게 커밋하지 마라.
```

---

## 1. 지금 인계받는 프로젝트의 정체

Teenz Bible은 Firebase Hosting에서 제공되는 **복구된 정적 PWA**를 중심으로 운영된다. Capacitor/CocoaPods 기반 iOS shell이 웹 번들을 내장하고, native 앱이 Firebase Hosting의 OTA manifest를 확인해 ZIP을 내려받은 뒤 다음 background/restart에 새 웹 runtime을 활성화한다.

이 프로젝트를 일반적인 React 소스 프로젝트처럼 처음부터 재작성하면 안 된다. 현재 live 서비스는 versioned runtime injection 방식으로 안정화되어 있으며, 실제 작업 기준은 `app/`과 현재 iOS bundle 구조다. 저장소의 최상위에 남은 과거 runtime 파일·과거 ZIP·복구 asset은 역사적 자료일 수 있으므로 먼저 사용하지 않는다.

### 현재 기준선 요약

| 영역 | 기준 | 의미 |
|---|---|---|
| GitHub | `main`, 최신 커밋은 `git log -1 --oneline`으로 확인 | 소스·문서·설정의 출발점 |
| Firebase | `teens-bible-94271` | 잘못된 프로젝트 배포 방지 |
| Web source | `app/` | Firebase Hosting의 canonical source |
| PWA/OTA | `1.1.195` | 현재 web runtime·manifest·ZIP 기준 |
| iOS App | Version `1.2.1`, Build `6` | 마지막 App Store 제출 binary 기준 |
| App Store | 2026-08-18 당시 Build 6 재제출 후 `Waiting for Review` | **현재 상태는 App Store Connect에서 재확인** |
| TestFlight | Build 6를 테스트할 수 있다는 Apple 이메일 수신 | TestFlight 가능과 App Store 승인 상태는 서로 다름 |

---

## 2. 저장소 파일 지도

| 작업 목적 | 기준 파일·폴더 | 절대 잊지 말 것 |
|---|---|---|
| PWA UI·웹 동작 | `app/` | 새 웹 작업은 여기서 시작 |
| Versioned runtime | `app/runtime-fixes-1.1.195.js`, `.css` | 새 수정은 새 versioned runtime으로 분리 |
| PWA entry | `app/index.html` | 새 JS/CSS version 참조가 맞아야 함 |
| OTA manifest | `app/ota/latest.json` | ZIP URL·SHA-256·size 일치 필수 |
| OTA ZIP | `app/ota/1.1.195.zip` | ZIP root에 `index.html` 필요 |
| RTDB Rules | `app/database.rules.json` | Firebase Rules의 원본 기준 |
| Cloud Functions | `functions/index.js` | Delete Account 서버 logic 포함 |
| Firebase project mapping | `.firebaserc` | 기본 project `teens-bible-94271` |
| Node 기준 | `.nvmrc` | Node `20` |
| iOS web mirror | `native-ios/web/` | Capacitor `webDir`에 해당 |
| Xcode embedded web | `native-ios/ios/App/App/public/` | `cap sync ios`가 반영하는 bundle |
| iOS native entry | `native-ios/ios/App/App.xcworkspace` | **항상 workspace를 연다** |
| iOS native settings | `Info.plist`, `SceneDelegate.swift`, `Podfile` | 권한·OAuth·Pods 보존 |
| iOS build number | `native-ios/ios/App/App.xcodeproj/project.pbxproj` | Build 6 다음은 Build 7 이상 |
| 운영 문서 | `docs/` | 아래 읽기 순서 참고 |

### 문서 읽기 순서

1. 이 파일: `docs/TEENZ_BIBLE_MASTER_HANDOFF.md`
2. 세부 AI 원칙: `docs/AI_CONTINUITY_GUIDE.md`
3. 운영·복구 절차: `docs/HANDOFF.md`
4. 비밀·환경 변수: `docs/ENVIRONMENT.md`
5. 첫날 체크리스트: `docs/NEW_DEVELOPER_CHECKLIST.md`
6. iOS 절차: `native-ios/README.md`
7. 슬라이드 원본: `docs/Teenz_Bible_Handoff_Slides.md`

---

## 3. 어떤 변경에 어떤 배포가 필요한가

| 변경 | 수정 위치 | 새 Xcode Archive |
|---|---|---|
| 웹 UI, CSS, JavaScript, 문구 | `app/` + 새 OTA ZIP | 보통 불필요 |
| Ranking/Report/Block 웹 UI | `app/` | 보통 불필요 |
| Firebase 웹 데이터 동작 | `app/` | 불필요 |
| RTDB Rules | `app/database.rules.json` | 불필요 |
| Delete Account server | `functions/index.js` | 불필요 |
| Swift 코드 | `native-ios/` | 필요 |
| Capacitor plugin 또는 Podfile | `native-ios/` | 필요 |
| Camera/Photo permission | `Info.plist` | 필요 |
| Apple/Google native authentication | SceneDelegate, native plugin, Podfile | 필요 |
| App icon, entitlement, signing | Xcode native project | 필요 |

> **핵심 판단:** 웹 레이어만 바꾼다면 먼저 OTA를 고려한다. native binary가 필요한 변경인데 OTA만으로 해결하려고 하면 새 설치 사용자와 기존 사용자의 동작이 달라질 수 있다.

---

## 4. Firebase 운영 절차

### 4.1 세 배포 대상을 분리한다

#### Hosting / PWA / OTA

원본은 `app/`이다. Hosting deploy 전에는 새 `index.html`, runtime JS/CSS, ZIP, `latest.json`이 모두 같은 version인지 확인한다.

```bash
firebase deploy --only hosting
```

#### RTDB Rules

원본은 `app/database.rules.json`이다.

```bash
firebase deploy --only database
```

이 명령은 live Rules 전체를 파일 내용으로 교체한다. 작은 수정이라도 전체 Rules를 검토하고 배포한다.

#### Cloud Functions

원본은 `functions/`이다.

```bash
firebase deploy --only functions
```

Delete Account를 바꾸면 Auth token 검증, 최근 로그인 10분 조건, Auth 삭제, RTDB data cleanup을 테스트한다.

### 4.2 배포 전 project 확인

```bash
cat .firebaserc
npx --yes firebase-tools@latest projects:list
npx --yes firebase-tools@latest use teens-bible-94271
```

`.firebaserc`의 기본 project가 다르면 production deploy를 중지한다. Firebase Console에서 Rules를 수동으로 바꿨다면 Git 원본에도 같은 내용을 반영한다.

### 4.3 UGC 안전 Rules

다음 두 영역은 App Store 안전 기능의 핵심이다.

- `blocks`: owner 본인만 자신의 차단 목록을 읽고 수정할 수 있어야 한다.
- `safetyReports`: 로그인한 reporter가 자신의 신고를 생성할 수 있어야 하며, client의 신고 목록 read는 차단되어야 한다.

다음 영역은 현재 넓은 권한 또는 공개 write가 남아 있는 후속 보안 작업 대상이다.

```text
reports
flaggedChapters
adminTokens
memeReactions
memeSubmissions
```

이 후속 작업은 기존 데이터 구조·클라이언트 호출·관리자 운영 방식·migration 계획을 조사한 뒤 최소 권한 Rules를 설계한다. 즉시 Rules를 단순화해 앱을 깨뜨리지 않는다.

---

## 5. OTA 생성·배포·활성화 절차

실제 runtime이 읽는 manifest URL은 다음과 같다.

```text
https://teens-bible-94271.web.app/ota/latest.json
```

새 웹 버전을 배포할 때는 다음 순서를 지킨다.

1. 현재 `1.1.195` runtime을 새 버전으로 복사한다. 예: `1.1.196`.
2. 새 JS의 `PATCH_VERSION`을 바꾼다.
3. `app/index.html`의 runtime JS/CSS 참조를 같은 새 버전으로 바꾼다.
4. Galaxy PWA에서 실제 touch, modal, overlay, navigation을 테스트한다.
5. 검증된 이전 ZIP을 staging에 풀고 새 `index.html`, 새 runtime JS/CSS를 넣는다.
6. ZIP 최상위에 `index.html`이 있는지 확인한다.
7. 실제 ZIP의 SHA-256과 byte size를 계산한다.
8. `app/ota/latest.json`의 version, URL, checksum, size를 갱신한다.
9. Hosting에 deploy한다.
10. live manifest를 받아 ZIP URL·checksum·size를 다시 검증한다.
11. iPad에서 앱 열기 → 30초 대기 → background → 다시 열기로 OTA 활성화를 확인한다.
12. 관련 `app/` 파일과 ZIP만 GitHub에 commit한다.

OTA bridge는 `updater.next({id})`를 사용한다. ZIP이 다운로드됐다는 사실만으로 현재 화면이 즉시 바뀌었다고 말하지 않는다. 다음 background/restart 뒤 실제 DOM과 기능을 다시 확인한다.

---

## 6. iOS 재현·빌드 절차

### 6.1 Native 변경이 있을 때

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

**절대 `App.xcodeproj`를 직접 열지 않는다.** CocoaPods dependency가 누락되어 GoogleSignIn, CapacitorCamera, Firebase 동작이 달라질 수 있다.

### 6.2 반드시 보존할 native 설정

- `SceneDelegate.swift`의 `TeenzFirebaseAuthenticationPlugin` 등록
- `Info.plist`의 `NSCameraUsageDescription`
- `Info.plist`의 `NSPhotoLibraryUsageDescription`
- `Info.plist`의 `NSPhotoLibraryAddUsageDescription`
- `Podfile`의 GoogleSignIn 및 CapacitorCamera
- Firebase iOS client configuration
- iOS bundle ID `com.teenzbible.app`
- iOS deployment target 15.0+

`GoogleService-Info.plist`는 iOS client configuration이므로 native build에 필요할 수 있다. 그러나 Firebase Admin service account private key와는 다르다.

### 6.3 Web bundle 동기화

새 native Archive 전에 repository root에서 다음을 수행한다.

```bash
cp -a app/. native-ios/web/
cd native-ios
pnpm exec cap sync ios
```

그렇지 않으면 App Store에서 새로 설치한 사용자가 OTA를 받기 전 구버전 UI를 먼저 보게 될 수 있다. `native-ios/ios/App/App/public/`은 generated mirror지만 현재 재현 기준으로 저장소에 보존되어 있다.

### 6.4 Archive 기준

- Xcode target: `App`
- Version: 현재 `1.2.1`을 유지한다면 Build 7 이상
- Destination: `Any iOS Device (arm64)`
- Archive: `Product → Archive`
- App Store Connect 업로드 전 실제 iPad에서 native login, camera/gallery, OTA를 확인
- App Store 제출·취소·릴리스는 사용자 확인 후 실행

현재 `Podfile.lock`은 저장소에 고정되어 있지 않다. 새 Mac에서 `pod install --repo-update`가 생성하는 lockfile을 검토하고, native dependency를 바꾸는 작업부터는 lockfile 커밋을 권장한다.

---

## 7. 기능과 테스트 기준

### Galaxy PWA

- Crew create/join/close
- Profile avatar touch 및 photo sheet 위치
- Ranking member modal, Close, Cheer
- Bible AI input 및 Back
- 상단·하단 safe-area와 modal이 화면 밖으로 밀리지 않는지 확인

### iPad iOS

- Apple Login
- Google Login
- Camera와 Gallery
- Profile photo 변경
- Cheer 전송·수신·confetti·24시간 제한
- Report 및 Block
- Bible AI Back/input
- 앱 재시작 후 OTA 적용

### 계정 삭제

실제 삭제는 반드시 disposable test account로만 한다. Delete Account 성공은 다음을 모두 확인해야 한다.

1. 체크박스가 선택되지 않으면 버튼이 비활성화됨.
2. `DELETE`를 정확히 입력해야 버튼이 활성화됨.
3. 최근 로그인 10분 조건을 지킴.
4. Cloud Function이 Firebase Auth 사용자를 삭제함.
5. 관련 RTDB data cleanup이 완료됨.

주 계정으로 삭제 테스트하지 않는다.

---

## 8. GitHub와 외부 백업의 경계

### GitHub에 보관할 것

- `app/`, `functions/`, `native-ios/`
- `.firebaserc`, `.nvmrc`, `.env.example`, `.gitignore`
- Firebase Rules 원본
- AI·운영·환경·첫날·슬라이드 콘텐츠 문서
- OTA manifest와 검증된 OTA ZIP

### GitHub에 절대 보관하지 않을 것

- Firebase Admin service account JSON
- Apple `.p8`, `.p12`, `.cer`, `.mobileprovision`
- OAuth client secret
- access token
- 테스트 계정 비밀번호
- 개인 2FA recovery code
- 사용자 Firebase Auth data 및 private user data

Firebase service account JSON은 GitHub가 아닌 password manager 또는 암호화된 개인 저장소에 보관한다. Apple Developer, Firebase Console, App Store Connect의 소유권·2FA·복구 수단도 별도로 유지한다.

---

## 9. 새 AI가 처음 30분 동안 실행할 절차

### 1단계 — 저장소와 문서 확인

```bash
gh repo clone kimseonguk-meta/Teenz-Bible
cd Teenz-Bible
git pull --ff-only origin main
git status --short
cat docs/TEENZ_BIBLE_MASTER_HANDOFF.md
```

`git status`에 현재 작업과 무관한 변경이 있으면 먼저 사용자에게 보고하고 삭제하지 않는다.

### 2단계 — 기준선 확인

```bash
cat .firebaserc
cat .nvmrc
cat app/ota/latest.json
git log -1 --oneline
```

현재 기준은 Firebase project `teens-bible-94271`, Node 20, OTA 1.1.195, iOS Version 1.2.1 Build 6이다. App Store status는 문서의 기록보다 최신 사용자 화면을 우선한다.

### 3단계 — 요청 분류

사용자의 요청을 다음 네 가지 중 하나로 분류한다.

| 분류 | 첫 확인 위치 |
|---|---|
| 웹/모바일 UI | `app/` + live PWA + Galaxy/iPad 재현 |
| Firebase | `app/database.rules.json`, `functions/`, `.firebaserc` |
| Native iOS | `native-ios/`, `App.xcworkspace`, Pods, Info.plist, SceneDelegate |
| App Store | App Store Connect 최신 화면, Build·metadata·review 상태 |

### 4단계 — 변경·검증·배포

관련 파일만 수정하고, 실제 mobile test 후 `git diff --check`를 실행한다. Firebase production deploy, OTA publish, Xcode Archive, App Store submit은 각각 별도의 행동이며 한 번에 묶지 않는다. 되돌리기 어려운 행동 전에는 사용자에게 확인한다.

---

## 10. 문제 해결 우선순위

1. 먼저 현재 화면·기기·App version·Git commit을 확인한다.
2. 같은 문제를 재현할 수 있는 최소 경로를 만든다.
3. web / Firebase / native / App Store 중 원인을 분리한다.
4. 이전 runtime을 무작정 덧대지 말고 canonical `app/` 기준으로 수정한다.
5. PWA에서 먼저 확인하고, iPad native OTA 적용 후 다시 확인한다.
6. native plugin·permission·OAuth라면 Xcode가 필요한지 판단한다.
7. 배포 전 checksum·version·Build·Rules·project ID를 확인한다.
8. 실패한 명령은 반복하지 말고 오류 화면을 분석한 뒤 다음 한 단계만 실행한다.

---

## 11. 절대 하지 않을 실수

- 사용자의 실제 Galaxy/iPad 테스트 없이 “해결 완료”라고 말하지 않는다.
- `App.xcodeproj`를 직접 열지 않는다.
- Firebase project ID를 확인하지 않고 production deploy하지 않는다.
- RTDB Rules 전체 구조를 읽지 않고 Rules를 배포하지 않는다.
- `blocks`·`safetyReports` 보호 규칙을 삭제하지 않는다.
- service account, Apple key, OAuth secret, token, password를 GitHub에 올리지 않는다.
- 과거 최상위 runtime/ZIP을 현재 source of truth로 사용하지 않는다.
- App Store 제출·취소·릴리스를 사용자 확인 없이 하지 않는다.
- 사용자 계정으로 Delete Account를 테스트하지 않는다.
- ZIP만 올리고 `latest.json`을 갱신하지 않거나, manifest만 바꾸고 ZIP checksum을 확인하지 않는다.

---

## 12. 새 AI 트러블슈팅과 대화형 작업 규칙

실제 개발 오류를 해결할 때는 [`NEXT_AI_TROUBLESHOOTING.md`](NEXT_AI_TROUBLESHOOTING.md)를 먼저 읽는다. 이 가이드는 깨끗한 clone, PWA 버튼 무반응, OTA 미적용, ZIP checksum, Firebase Rules/Functions, Google·Apple 로그인, CocoaPods/Xcode, iPad viewport/safe-area, Delete Account·Report·Block, App Store 상태 문제를 원인별로 분리한다.

Meta.AI 또는 Project Hatch에 붙여넣을 전문 프롬프트는 [`META_AI_PROJECT_HATCH_CONVERSATIONAL_PROMPT.txt`](META_AI_PROJECT_HATCH_CONVERSATIONAL_PROMPT.txt)다. [`START_SUCCESSOR_AI.command`](../START_SUCCESSOR_AI.command)를 실행하면 이 전문이 `Documents/Teenz_Bible_Next_AI_Prompt.txt`로 복사되고 macOS 클립보드에도 복사된다.

## 13. 가장 짧은 시작 문장

다음 AI가 긴 문서를 읽기 전에 사용할 최소 문장은 다음이다.

```text
Teenz Bible을 이어서 작업해줘. GitHub main의 docs/TEENZ_BIBLE_MASTER_HANDOFF.md를 먼저 읽고, 현재 기준선·위험요소·첫 실행 절차를 한국어로 요약해줘. 그 다음 내가 해결할 문제를 설명할게.
```

## 참고 문서

- [`AI_FINAL_SUMMARY.md`](AI_FINAL_SUMMARY.md)
- [`AI_CONTINUITY_GUIDE.md`](AI_CONTINUITY_GUIDE.md)
- [`HANDOFF.md`](HANDOFF.md)
- [`ENVIRONMENT.md`](ENVIRONMENT.md)
- [`NEW_DEVELOPER_CHECKLIST.md`](NEW_DEVELOPER_CHECKLIST.md)
- [`native-ios/README.md`](../native-ios/README.md)
- [`Teenz_Bible_Handoff_Slides.md`](Teenz_Bible_Handoff_Slides.md)
- [`NEXT_AI_TROUBLESHOOTING.md`](NEXT_AI_TROUBLESHOOTING.md)
- [`META_AI_PROJECT_HATCH_CONVERSATIONAL_PROMPT.txt`](META_AI_PROJECT_HATCH_CONVERSATIONAL_PROMPT.txt)
- [`APP_STORE_CONNECT_METADATA.md`](APP_STORE_CONNECT_METADATA.md)
- [`CONVERSATION_DECISIONS.md`](CONVERSATION_DECISIONS.md)
- [`START_SUCCESSOR_AI.command`](../START_SUCCESSOR_AI.command)

## References

[1]: https://github.com/kimseonguk-meta/Teenz-Bible "Teenz Bible GitHub repository"
[2]: https://teens-bible-94271.web.app/ "Live Teenz Bible PWA"
[3]: https://firebase.google.com/docs/cli "Firebase CLI documentation"
[4]: https://capacitorjs.com/docs/ios "Capacitor iOS documentation"

[1] [2] [3] [4]
