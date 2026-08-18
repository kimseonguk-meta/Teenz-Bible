# Teenz Bible 운영·개발 인수인계

> **목적:** 이 문서는 Teenz Bible을 처음 이어받는 개발자 또는 운영자가 현재 서비스 기준선을 복구하고, 웹 OTA·Firebase·iOS·App Store 작업을 안전하게 이어갈 수 있도록 작성한 운영 문서입니다.
> **최종 갱신:** 2026-08-18 (GMT+8)
> **기준 GitHub 브랜치:** [`main`](https://github.com/kimseonguk-meta/Teenz-Bible/tree/main)
> **앱 릴리스 기준 커밋:** `844ed22` (Build 6 iOS base bundle/OTA 1.1.127) 및 `45b8369` (iOS Firebase 규칙 미러)
> **비밀·환경 변수 관리:** [`docs/ENVIRONMENT.md`](ENVIRONMENT.md)를 반드시 함께 읽는다.
> **첫 작업일 체크리스트:** [`docs/NEW_DEVELOPER_CHECKLIST.md`](NEW_DEVELOPER_CHECKLIST.md)를 순서대로 실행한다.
> **다음 AI용 맥락:** [`docs/AI_FINAL_SUMMARY.md`](AI_FINAL_SUMMARY.md)를 먼저 읽고, 이어서 [`docs/AI_CONTINUITY_GUIDE.md`](AI_CONTINUITY_GUIDE.md)를 읽고 작업을 시작한다.

## 1. 현재 서비스 기준선

| 영역 | 현재 기준 | 확인 위치 |
|---|---|---|
| GitHub | `kimseonguk-meta/Teenz-Bible`, `main` | [Repository](https://github.com/kimseonguk-meta/Teenz-Bible) |
| PWA/Hosting | `https://teens-bible-94271.web.app/` | Firebase Hosting site `teens-bible-94271` |
| Firebase project | `teens-bible-94271` | `firebase.json` |
| 현재 웹·OTA 런타임 | **1.1.127** | `app/index.html`, `app/ota/latest.json` |
| iOS App Store version | **1.2.1 (Build 6)** | `native-ios/ios/App/App.xcodeproj/project.pbxproj` |
| iOS bundle identifier | `com.teenzbible.app` | `native-ios/capacitor.config.json` |
| 최소 iOS | 15.0 | Xcode project / iOS README |
| App Store 제출 상태 (문서 작성 시점) | 2026-08-18 Build 6 재제출 완료, **Waiting for Review** | App Store Connect |
| TestFlight | 1.2.1 (6) 테스트 가능 | TestFlight |

현재 공개된 PWA와 iOS base bundle은 모두 runtime **1.1.127**을 참조한다. OTA 매니페스트의 검증 기준은 다음과 같다.

```json
{
  "version": "1.1.127",
  "url": "https://teens-bible-94271.web.app/ota/1.1.127.zip",
  "checksum": "28ec587b6338acbd7e259a5a9052ec8ad8e3a84101332156ceee047ad6bc5a7c",
  "size": 34389074
}
```

> **중요:** 앱 실행 중인 사용자가 바로 새 OTA를 쓰는 구조가 아니다. iOS 앱은 새 ZIP을 내려받아 다음 background/restart 때 활성화한다. 수정 확인은 항상 **앱 열기 → 약 30초 대기 → 백그라운드로 보내기 → 다시 열기** 순서로 한다.

## 2. 프로젝트 구조와 책임 구분

| 경로 | 역할 | 반드시 최신 상태로 유지할 대상 |
|---|---|---|
| `app/` | Firebase Hosting이 실제로 배포하는 PWA 정적 파일 | **웹 변경의 원본 기준** |
| `app/runtime-fixes-1.1.127.js/.css` | Runtime DOM·CSS 패치 | 현재 PWA가 직접 로드 |
| `app/ota/latest.json` | iOS Updater가 읽는 최신 OTA 메타데이터 | 버전·URL·SHA-256·size |
| `app/ota/1.1.127.zip` | iOS가 내려받는 OTA bundle | ZIP root에 `index.html` 필요 |
| `functions/index.js` | `deleteOwnAccount` Cloud Function | Firebase Auth 검증·최근 로그인·RTDB 정리 |
| `app/database.rules.json` | 실제 Firebase RTDB 배포 규칙 | Block·Report 권한 제어 포함 |
| `native-ios/web/` | Capacitor `webDir` | 다음 native 빌드의 웹 원본 |
| `native-ios/ios/App/App/public/` | Xcode가 실제 앱에 포함하는 웹 번들 | Archive 재현용 사본 |
| `native-ios/ios/App/App/` | Swift, Info.plist, Firebase plugin | 로그인·카메라·권한 등 native 기능 |
| `native-ios/ios/App/Podfile` | CocoaPods dependencies | GoogleSignIn·CapacitorCamera 포함 |
| `docs/` | 유지보수 문서 | 새 작업마다 갱신 권장 |

`app/`, `native-ios/web/`, `native-ios/ios/App/App/public/`의 최신 `index.html`, `ota/latest.json`, 1.1.127 runtime JS/CSS와 OTA ZIP은 같은 릴리스 기준을 가리켜야 한다. Build 6 기준선은 GitHub `main`의 `844ed22`와 `45b8369`에 보존되어 있다.

## 3. 보안·안전 기능 기준선

| 기능 | 구현 위치 | 현재 보호 원칙 |
|---|---|---|
| 계정 삭제 | `functions/index.js` + runtime 1.1.127 | 체크박스와 `DELETE` 입력, 최근 로그인 10분 요구, Auth·RTDB 데이터 정리 |
| Block | RTDB `blocks/{ownerUid}/{blockedUid}` | 본인만 읽기·생성·삭제 가능 |
| Report | RTDB `safetyReports/{reportId}` | 신고자는 본인 UID로만 생성, 클라이언트 읽기 차단 |
| Cheer | RTDB notifications 규칙 | sender/recipient UID 검증 |
| Apple 로그인 | Swift Firebase bridge + Sign in with Apple entitlement | iOS native build 필요 영역 |
| Google 로그인 | `GoogleSignIn` CocoaPod + Swift bridge | iOS native build 필요 영역 |
| 프로필 사진 | `@capacitor/camera` + `Info.plist` 권한 설명 | iOS native build 필요 영역 |

현재 RTDB 규칙에는 `blocks`, `safetyReports`가 포함되어 있으며, iOS web/public 미러에도 같은 규칙 사본이 있다. 규칙을 변경하면 반드시 `app/database.rules.json`을 수정하고 Firebase Database Rules를 배포한 뒤, 필요하면 두 iOS 미러도 함께 갱신한다.

## 4. 새 웹/OTA 릴리스 절차

이 절차는 **UI, JavaScript, CSS, 문구, 이미지, Firebase 웹 동작**처럼 native binary가 필요 없는 변경에 사용한다.

### 4.1 안전한 작업 시작

```bash
git clone https://github.com/kimseonguk-meta/Teenz-Bible.git
cd Teenz-Bible
git checkout main
git pull --ff-only origin main
```

작업 전 현재 기준을 기록한다.

```bash
git log -1 --oneline
git status --short
cat app/ota/latest.json
```

### 4.2 새 runtime 만들기

1. 현재 번호를 기준으로 다음 번호를 정한다. 예: `1.1.127` → `1.1.128`.
2. `runtime-fixes-1.1.127.js/.css`를 새 번호 파일로 복사한다.
3. JavaScript의 `PATCH_VERSION`을 새 번호로 바꾼다.
4. `app/index.html`의 runtime CSS/JS 참조를 새 번호로 바꾼다.
5. PWA에서 로그인·프로필·랭킹·모달 등 실제 영향을 받는 모바일 화면을 확인한다.
6. JavaScript 문법을 확인한다.

```bash
node --check app/runtime-fixes-1.1.128.js
```

### 4.3 OTA ZIP과 manifest 만들기

현재 1.1.127처럼 **ZIP root에 `index.html`이 존재하는 구조**를 유지한다. 검증된 직전 ZIP을 staging 디렉터리에 푼 뒤, 새 `index.html`과 새 runtime JS/CSS만 교체하는 방법이 가장 안전하다.

```bash
ROOT="$PWD/app"
STAGE="/tmp/teenz-ota-1.1.128"
rm -rf "$STAGE"
mkdir -p "$STAGE"
unzip -q "$ROOT/ota/1.1.127.zip" -d "$STAGE"
cp "$ROOT/index.html" "$ROOT/runtime-fixes-1.1.128.js" "$ROOT/runtime-fixes-1.1.128.css" "$STAGE/"
(
  cd "$STAGE"
  zip -qr "$ROOT/ota/1.1.128.zip" .
)
sha256sum "$ROOT/ota/1.1.128.zip"
stat -c '%s' "$ROOT/ota/1.1.128.zip"
unzip -tq "$ROOT/ota/1.1.128.zip"
```

그 뒤 `app/ota/latest.json`의 `version`, `url`, `checksum`, `size`를 새 값으로 갱신한다. `checksum`과 `size`가 실제 ZIP과 다르면 iOS OTA는 실패한다.

### 4.4 Firebase Hosting 배포와 라이브 검증

Firebase 권한은 **저장소에 넣지 말고** 소유자 계정 또는 별도 안전한 서비스 계정으로 제공한다. 서비스 계정 JSON, Apple 인증서, `.p12`, 비밀키, API secret은 GitHub에 커밋하지 않는다. 자세한 local CLI 인증 및 `.env.example` 사용법은 [`docs/ENVIRONMENT.md`](ENVIRONMENT.md)를 따른다.

```bash
# 예시: 로그인한 Firebase CLI 환경
npx --yes firebase-tools@latest deploy --only hosting --project teens-bible-94271
```

배포 후 매니페스트와 ZIP을 실제 Hosting에서 다시 확인한다.

```bash
curl -fsSL 'https://teens-bible-94271.web.app/ota/latest.json?verify=1'
curl -fsSL 'https://teens-bible-94271.web.app/ota/1.1.128.zip?verify=1' -o /tmp/teenz-ota.zip
sha256sum /tmp/teenz-ota.zip
```

마지막으로 GitHub에 **runtime JS/CSS, `index.html`, `latest.json`, 새 ZIP**을 함께 커밋하고 `main`에 push한다. 새 OTA ZIP만 올리고 `index.html` 또는 manifest를 빠뜨리지 않는다.

## 5. Firebase Functions·Rules 배포 절차

| 변경 종류 | 파일 | 배포 명령 예시 |
|---|---|---|
| 계정 삭제 등 server logic | `functions/index.js` | `firebase deploy --only functions` |
| RTDB 권한 | `app/database.rules.json` | `firebase deploy --only database` |
| PWA/OTA 파일 | `app/` | `firebase deploy --only hosting` |

`deleteOwnAccount`는 Firebase ID token을 검증하고, `auth_time`이 최근 10분 이내인 경우에만 실행한다. 인증 오류가 발생하면 사용자는 다시 Apple 또는 Google 로그인을 한 뒤 삭제를 재시도해야 한다.

> Firebase Console에서 Rules를 수동으로 수정했다면, 동일한 변경을 반드시 `app/database.rules.json`에도 반영한다. 그렇지 않으면 다음 배포가 Console의 수정 내용을 덮어쓴다.

## 6. 새 iOS binary가 필요한 경우

다음 변경은 OTA만으로 배포하지 말고 새로운 Xcode Archive와 App Store Connect upload가 필요하다.

| 새 native binary 필요 | OTA만으로 가능 |
|---|---|
| Swift/Objective-C 코드 | runtime JS/CSS 수정 |
| Capacitor plugin 추가·업데이트 | 화면 레이아웃·텍스트·이미지 |
| `Info.plist` 권한 문구 | Firebase 웹 로직 |
| App icon·entitlement·signing | Report/Block UI와 웹 동작 |
| Apple/Google native auth 구성 | OTA manifest 및 web bundle |

### 6.1 Mac에서 iOS 프로젝트 준비

```bash
cd ~/Teenz-Bible/native-ios/ios/App
pod install
open App.xcworkspace
```

> **항상 `App.xcworkspace`를 열고, `App.xcodeproj`는 직접 열지 않는다.** CocoaPods로 연결된 GoogleSignIn, CapacitorCamera, Firebase 의존성이 workspace에 포함된다.

Archive 전 Xcode에서 확인할 값은 다음과 같다.

| 항목 | Build 6 기준 |
|---|---|
| Target | `App` |
| Team | Teenz Bible App Store listing을 소유한 Apple Developer Team |
| Bundle Identifier | `com.teenzbible.app` |
| Version | `1.2.1` |
| Build | 다음 업로드 가능 번호. 1.2.1 기준 Build 6은 이미 Apple에 업로드됨 |
| Device destination | `Any iOS Device (arm64)` |

`Product → Clean Build Folder` 후 `Product → Archive`를 실행한다. Organizer에서 `Distribute App → App Store Connect → Upload`를 선택한다.

### 6.2 native build 전 web bundle 동기화

새 iOS binary가 최신 PWA 기준을 처음부터 포함해야 한다면, `app/` 기준선과 다음 두 사본을 같이 맞춘다.

```bash
cp -a app/. native-ios/web/
cp -a native-ios/web/. native-ios/ios/App/App/public/
```

그 후 Git에서 `app/`, `native-ios/web/`, `native-ios/ios/App/App/public/`의 `index.html`, runtime JS/CSS, `ota/latest.json`, 새 OTA ZIP이 같은 버전을 가리키는지 확인한다. `cordova.js` 계열은 Capacitor가 생성하는 지원 파일이므로 일반적으로 삭제하지 않는다.

## 7. App Store Connect 운영 기준

| 항목 | Build 6 제출 기준 |
|---|---|
| App Store version | 1.2.1 |
| Build | 6 |
| TestFlight | 1.2.1 (6) ready to test |
| App Review Notes | 로그인 선택 사항, Apple/Google 로그인, Delete Account, Report/Block 설명 포함 |
| 제출 상태 | 2026-08-18 기준 Waiting for Review |

심사자 메모에는 다음을 명확히 적는다.

1. Bible 읽기 핵심 기능은 로그인 없이도 가능하다.
2. Apple/Google 로그인은 progress/profile backup을 위한 선택 기능이다.
3. Report/Block 위치는 ranking member profile이다.
4. Delete Account는 Profile에서 체크박스와 `DELETE` 입력을 거친다.
5. 인앱 결제는 없으며, 앱은 무료다.

심사 상태가 `Waiting for Review` 또는 `In Review`인 동안에는 별도 수정이 필요하지 않은 한 **Cancel Submission을 누르지 않는다.** Apple이 로그인 정보나 동작을 질문하면 App Store Connect의 메시지와 이메일을 우선 확인한다.

## 8. 복구와 장애 대응

### 8.1 GitHub 기준으로 복구

```bash
git fetch origin
git log --oneline origin/main -20
# 특정 커밋 상태를 조사
git show --stat <commit>
# 로컬 실험을 버리고 최신 main으로 되돌릴 때만 사용
git reset --hard origin/main
```

`git reset --hard`는 로컬 작업을 삭제하므로, 먼저 `git status`와 `git stash push --include-untracked -m "backup-before-recovery"`를 사용한다.

### 8.2 OTA 장애

1. `app/ota/latest.json`의 URL·checksum·size를 확인한다.
2. Hosting URL에서 ZIP을 내려받아 SHA-256을 비교한다.
3. ZIP root에 `index.html`이 있는지 `unzip -l`로 확인한다.
4. iPad에서 앱을 열고 30초 대기 후 background/restart한다.
5. 필요하면 `latest.json`을 이전 검증 ZIP 버전으로 되돌려 Hosting을 다시 배포한다.

### 8.3 iOS native 장애

1. `pod install`을 다시 실행한다.
2. `App.xcworkspace`로 열었는지 확인한다.
3. `Podfile`에 `GoogleSignIn`, `CapacitorCamera`가 있는지 확인한다.
4. `SceneDelegate.swift`의 `TeenzFirebaseAuthenticationPlugin` 등록을 확인한다.
5. `Info.plist`의 camera/photo library usage descriptions를 확인한다.

## 9. 우선순위가 높은 후속 작업

| 우선순위 | 작업 | 이유 |
|---|---|---|
| 높음 | Apple 심사 상태 확인 및 요청 대응 | Build 6가 심사 대기 상태임 |
| 높음 | Firebase RTDB rules의 `adminTokens`, meme 관련 공개 read/write 권한 재검토 | teen 서비스에서는 최소 권한 원칙이 중요함 |
| 높음 | 원래 React/TypeScript 소스를 장기적으로 복원·정리 | 현재 `app/assets` 중심의 배포 복구본과 runtime injection은 유지보수 비용이 큼 |
| 중간 | 신고 검토·제재 운영 절차와 담당자 연락 경로 문서화 | Report 기능은 운영 대응이 있어야 실질적인 안전장치가 됨 |
| 중간 | privacy policy와 support page를 장기적으로 독립 도메인/문서로 정리 | App Store 심사·사용자 지원 신뢰성 향상 |
| 낮음 | OTA 자동화 script와 CI 검토 | 수동 ZIP·checksum 실수를 줄일 수 있음 |

## 10. 새 개발자에게 전달할 최소 정보

새 작업을 시작하는 사람에게 다음만 전달하면 된다.

> GitHub `main`을 clone한 뒤 `docs/AI_FINAL_SUMMARY.md`, `docs/AI_CONTINUITY_GUIDE.md`, `docs/HANDOFF.md`, `docs/ENVIRONMENT.md`, `docs/NEW_DEVELOPER_CHECKLIST.md`, `native-ios/README.md`를 이 순서로 읽으세요.
 현재 PWA/OTA는 1.1.127, App Store native version은 1.2.1 Build 6입니다. `app/`이 Firebase Hosting의 원본 기준이고, iOS native build 전에는 `native-ios/web/` 및 `native-ios/ios/App/App/public/`을 같은 버전으로 맞추세요. 서비스 계정·Apple 인증서·비밀키는 GitHub에 넣지 말고 소유자에게 안전한 별도 채널로 받으세요.

## References

[1]: https://github.com/kimseonguk-meta/Teenz-Bible "Teenz Bible GitHub repository"
[2]: https://teens-bible-94271.web.app/ "Teenz Bible live PWA"
[3]: https://capacitorjs.com/docs/ios "Capacitor iOS documentation"
[4]: https://capgo.app/docs/plugins/updater/self-hosted/manual-update/ "Capgo self-hosted manual update documentation"

[1] [2] [3] [4]
