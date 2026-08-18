# Teenz Bible 새 개발자 첫날 체크리스트

> 먼저 [`HANDOFF.md`](HANDOFF.md), [`ENVIRONMENT.md`](ENVIRONMENT.md), [`../native-ios/README.md`](../native-ios/README.md)를 읽는다. 이 문서는 실제 작업 전 확인 순서를 짧게 정리한 것이다.

## 1. 시작 전 기준선 확인

```bash
git clone https://github.com/kimseonguk-meta/Teenz-Bible.git
cd Teenz-Bible
git checkout main
git pull --ff-only origin main
cat .firebaserc
cat app/ota/latest.json
node --version
```

| 확인값 | 기대값 |
|---|---|
| Firebase default project | `teens-bible-94271` |
| PWA/OTA runtime | `1.1.127` 또는 그 이후의 main 기준 최신 번호 |
| iOS native version | `1.2.1` |
| 현재 App Store Build 기준 | 6보다 큰 새 Build 번호가 필요할 때만 증가 |
| Node | 20 (`nvm use` 가능) |

`.env`는 앱 실행에 필수인 파일이 아니다. Firebase CLI를 비대화형으로 실행할 때만 `.env.example`을 복사해 `GOOGLE_APPLICATION_CREDENTIALS`를 로컬에서 설정한다. service account JSON, Apple 키, OAuth secret은 GitHub에 절대 커밋하지 않는다.

## 2. Firebase 작업 전 필수 확인

1. Firebase CLI에서 **`teens-bible-94271`** 프로젝트를 선택했는지 확인한다.
2. Hosting만 바꿀지, RTDB Rules/Functions도 바꿀지 분리한다.
3. Rules는 `app/database.rules.json`이 원본이다. Console에서 수동 수정했다면 반드시 이 파일에도 같은 변경을 반영한다.
4. `firebase deploy --only database`는 해당 파일 전체로 기존 live rule을 덮어쓴다.
5. 개발·테스트 후에만 실제 deploy를 실행한다.

```bash
npx --yes firebase-tools@latest projects:list
npx --yes firebase-tools@latest use teens-bible-94271
# 필요한 대상만 선택해 배포한다.
npx --yes firebase-tools@latest deploy --only hosting --project teens-bible-94271
```

> **RTDB 보안 경고:** 현재 `reports`, `flaggedChapters`, `adminTokens`, `memeReactions`, `memeSubmissions`에는 공개 쓰기 또는 넓은 권한 규칙이 남아 있다. teen/UGC 서비스의 후속 보안 작업으로 반드시 최소 권한 규칙을 설계·테스트해야 한다. 이미 보호된 `blocks`와 `safetyReports` 규칙을 단순화하거나 삭제하지 않는다.

## 3. OTA 작업 전 필수 확인

1. `app/`이 Firebase Hosting의 원본 기준이다.
2. 새 OTA 버전은 새 runtime JS/CSS, `app/index.html`, `app/ota/latest.json`, 새 ZIP을 **한 묶음으로** 바꾼다.
3. `latest.json`의 `checksum`과 `size`는 실제 ZIP의 SHA-256/바이트 수와 반드시 일치해야 한다.
4. ZIP root에 `index.html`이 있어야 한다.
5. iOS 앱은 update 다운로드 후 다음 background/restart에서 활성화한다.

```bash
node --check app/runtime-fixes-1.1.128.js
unzip -tq app/ota/1.1.128.zip
curl -fsSL 'https://teens-bible-94271.web.app/ota/latest.json?verify=1'
```

**실기기 확인:** iPad에서 앱 열기 → 약 30초 대기 → 홈 화면으로 보내기 → 다시 열기. 첫 실행만 보고 OTA가 실패했다고 판단하지 않는다.

## 4. iOS native 변경 작업 전 필수 확인

새 App Store binary가 필요한 변경은 Swift, Capacitor plugin, `Info.plist`, camera/photo permission, Apple/Google login native bridge, icon, entitlement, signing이다. 웹 UI/CSS/JS만 바꾼 경우에는 보통 OTA만 필요하다.

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

| 절대 지켜야 할 점 | 이유 |
|---|---|
| `App.xcworkspace`를 연다 | CocoaPods의 Firebase, GoogleSignIn, Camera dependency를 로드한다. `App.xcodeproj`를 직접 열지 않는다. |
| iOS 15.0 이상을 유지한다 | 현재 프로젝트의 deployment target이다. |
| `GoogleSignIn`, `CapacitorCamera`가 Podfile에 있는지 확인한다 | Google login과 profile camera/gallery의 native dependency다. |
| `SceneDelegate.swift`의 `TeenzFirebaseAuthenticationPlugin` 등록을 보존한다 | iOS native OAuth bridge가 동작하는 데 필요하다. |
| `Info.plist`의 Camera/Photo Library usage description을 보존한다 | 프로필 사진 기능 및 App Store 권한 심사에 필요하다. |
| 새 Archive는 `Any iOS Device (arm64)`로 만든다 | TestFlight/App Store 배포용 Archive 대상이다. |
| Build 번호를 증가시킨다 | Apple은 이미 업로드한 Build 번호를 다시 받지 않는다. |

> `Podfile.lock`은 현재 기준 저장소에 커밋되어 있지 않다. 새 Mac에서 첫 `pod install --repo-update` 실행 후 생성되는 lockfile을 검토해 pod 버전을 고정하고, native 의존성을 변경하는 작업에서는 lockfile도 함께 커밋하는 것을 권장한다.

## 5. iOS base bundle 동기화

새 native binary에 최신 웹을 처음부터 넣으려면 `app/`과 Capacitor webDir를 맞춘다.

```bash
# repository root에서 실행
cp -a app/. native-ios/web/
cd native-ios
pnpm exec cap sync ios
```

`cap sync ios`가 `native-ios/web/` 내용을 Xcode의 `ios/App/App/public/`에 반영한다. `public/`을 오래된 버전으로 남긴 채 Archive하면 새 설치 사용자는 OTA를 받기 전까지 구버전 UI를 보게 된다.

## 6. 배포 전 최소 smoke test

| 영역 | 확인 |
|---|---|
| PWA | Chrome 일반/시크릿에서 Profile, Crew, Ranking modal, Bible AI, photo sheet |
| iOS | Apple Login, Google Login, Camera, Gallery, Profile photo, Cheer, app restart OTA |
| UGC | Report, Block, 24-hour Cheer 동작, Report/Block 표시 |
| Account deletion | 체크박스 + `DELETE` 입력 후 활성화만 확인. 실제 삭제는 테스트 계정으로만 실행 |
| App Store | Build, screenshots, App Review Notes, privacy information, support URL 확인 |

## 7. 긴급 복구 원칙

1. Production 문제가 생기면 먼저 `app/ota/latest.json`, Hosting ZIP SHA-256, 실제 iOS 활성화 단계부터 확인한다.
2. 원인을 모를 때는 새 수정 위에 수정하지 말고 GitHub `main`의 마지막 검증 커밋을 확인한다.
3. `git reset --hard` 전에는 항상 `git status`와 `git stash push --include-untracked`를 실행한다.
4. Firebase Rules/Functions/Hosting 배포는 각각 독립적이므로, 문제가 난 대상만 되돌린다.
