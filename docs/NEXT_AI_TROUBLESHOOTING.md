# Teenz Bible — 다음 AI 핵심 트러블슈팅 가이드

이 문서는 2026년 8월 23일 이후 Meta.AI, Project Hatch 또는 다른 AI 에이전트가 Teenz Bible의 남은 기능 개발과 빌드 오류를 안전하게 해결하기 위한 실행 가이드다. 모든 문제는 **현재 기기·현재 버전·현재 Git commit·재현 경로**를 먼저 기록한 뒤 분류한다.

> 기본 원칙: 한 번에 한 단계만 안내하고, 오류가 난 화면이나 명령 출력을 확인한 뒤 다음 단계로 이동한다. 원인을 확인하지 않은 채 새 runtime을 여러 개 덧대거나, Firebase Rules·native 설정·App Store 상태를 추측으로 바꾸지 않는다.

## 1. 최초 진단 순서

문제를 받으면 먼저 다음 정보를 수집한다.

| 확인 항목 | 확인 방법 |
|---|---|
| 사용자 기기 | Galaxy PWA, iPad native, Mac, Simulator 중 하나로 확정 |
| 앱 버전 | PWA의 runtime 버전 또는 iOS Version/Build 확인 |
| Git 기준선 | `git log -1 --oneline`, `git status --short` |
| 재현 경로 | 예: Profile → avatar → Choose from Gallery |
| 예상 동작 | 사용자가 기대한 결과를 한 문장으로 기록 |
| 실제 동작 | 무반응, 위치 이탈, 오류 문구, 오래된 UI 등으로 기록 |
| 최초 발생 시점 | 최근 OTA/native/Firebase 변경과 비교 |

그 다음 원인을 **웹 UI·Firebase·native iOS·App Store/운영** 중 하나로 분리한다. 버튼이 무반응이면 먼저 DOM selector와 capture handler를 확인하고, iPad에서만 발생하면 native bridge·viewport·safe-area·OTA 적용 여부를 별도로 확인한다.

## 2. 깨끗한 기준선이 아닌 로컬 폴더에서 시작한 경우

오래된 복구 폴더에는 과거 runtime, OTA ZIP, reports, `node_modules`, generated iOS bundle이 함께 남아 있을 수 있다. 이런 폴더에서 바로 수정하지 않는다.

```bash
git fetch origin main
git status --short
git rev-list --left-right --count HEAD...origin/main
```

tracked 변경이나 대량 untracked 파일이 있으면 삭제하지 말고 사용자에게 보고한다. 가장 안전한 해결은 새 폴더에서 시작하는 것이다.

```bash
gh repo clone kimseonguk-meta/Teenz-Bible "$HOME/Teenz-Bible-clean"
cd "$HOME/Teenz-Bible-clean"
cat docs/TEENZ_BIBLE_MASTER_HANDOFF.md
```

## 3. PWA·웹 UI 버튼이 무반응일 때

첫째, live PWA가 새 runtime을 실제로 읽고 있는지 확인한다. 둘째, 해당 요소의 `data-loc`, `id`, `aria-label`, `getBoundingClientRect()`를 확인한다. 셋째, React의 원래 handler가 실행되는지와 runtime capture-phase handler가 실행되는지를 분리한다. 넷째, overlay가 클릭을 가로채는지 `elementFromPoint()`로 확인한다.

확인 순서는 다음과 같다.

```text
1. 현재 URL에 cache-busting query를 붙여 새로 연다.
2. document.documentElement.dataset.tbSecureDeleteInstalled 같은 runtime marker를 확인한다.
3. 문제 요소의 computed style, rect, z-index, pointer-events를 확인한다.
4. 같은 동작을 Galaxy 일반 모드·시크릿 모드에서 각각 재현한다.
5. CSS만의 문제인지 JS handler의 문제인지 분리한다.
```

CSS/UI 수정이면 `app/`의 새 versioned runtime JS/CSS에만 수정하고, `app/index.html`도 같은 버전을 가리키게 한다. 기존 `runtime-fixes-1.1.116` 같은 과거 파일을 현재 기준으로 사용하지 않는다.

## 4. OTA가 적용되지 않을 때

현재 manifest는 Firebase Hosting의 다음 주소에서 읽는다.

```text
https://teens-bible-94271.web.app/ota/latest.json
```

확인 순서는 다음과 같다.

```bash
curl -fsSL 'https://teens-bible-94271.web.app/ota/latest.json?check=timestamp'
```

manifest의 `version`, ZIP URL, SHA-256, byte size가 실제 ZIP과 일치해야 한다. ZIP은 최상위에 `index.html`을 포함해야 한다. iOS OTA는 다운로드 즉시 현재 화면을 바꾸는 방식이 아니라 `updater.next({id})` 후 다음 background/restart에서 활성화되는 방식이다.

사용자에게는 다음 순서만 안내한다.

```text
앱 열기 → 약 30초 대기 → 홈 화면으로 나가기 → 앱을 다시 열기 → runtime marker와 화면 기능 확인
```

여전히 구버전이면 다음을 확인한다.

| 가능 원인 | 조치 |
|---|---|
| 첫 실행에서 다운로드만 완료 | 앱을 background/restart해 활성화 |
| manifest가 구버전 | Hosting deploy와 cache-busting URL 확인 |
| checksum/size 불일치 | ZIP을 다시 만들고 manifest를 다시 계산 |
| ZIP root 오류 | 압축을 풀었을 때 최상위에 `index.html`이 있는지 확인 |
| native webDir가 구버전 | `app/` → `native-ios/web/` → `cap sync ios` 확인 |
| PWA Service Worker 캐시 | 새 탭/시크릿 모드와 hard reload로 비교 |

## 5. OTA ZIP·manifest 오류

새 OTA를 만들 때는 이전 검증 ZIP을 staging에 풀고 필요한 새 `index.html`, runtime JS/CSS만 교체한다. 이후 다음을 확인한다.

```bash
unzip -l app/ota/NEW_VERSION.zip | head
unzip -p app/ota/NEW_VERSION.zip index.html >/dev/null
shasum -a 256 app/ota/NEW_VERSION.zip
wc -c < app/ota/NEW_VERSION.zip
```

manifest는 실제 결과를 기준으로 작성한다. ZIP만 올리고 manifest를 갱신하지 않거나, manifest만 바꾸고 ZIP checksum을 확인하지 않는 것은 금지한다.

## 6. Firebase deploy·Rules·Functions 오류

production 배포 전에 Firebase project를 고정한다.

```bash
cat .firebaserc
npx --yes firebase-tools@latest use teens-bible-94271
```

배포 대상은 세 가지로 분리한다.

```bash
firebase deploy --only hosting
firebase deploy --only database
firebase deploy --only functions
```

`database.rules.json` 전체를 검토하지 않고 Rules를 배포하지 않는다. 특히 `blocks`와 `safetyReports`를 삭제하거나 공개 읽기로 바꾸지 않는다. Rules 수정 후에는 차단 목록이 owner-only인지, 신고 생성이 authenticated reporter-bound인지, 신고 목록 read가 차단되는지 확인한다.

`deleteOwnAccount` 문제가 있으면 다음을 분리 확인한다.

1. Bearer Firebase ID token이 전달되는가.
2. Firebase ID token 검증이 성공하는가.
3. `auth_time`이 최근 10분 조건을 통과하는가.
4. RTDB multi-path cleanup이 실패하지 않는가.
5. 마지막에 `auth.deleteUser(uid)`가 성공하는가.

실제 삭제는 disposable test account로만 수행한다. 주 계정으로 함수 테스트를 하지 않는다. service account JSON은 명령 출력·AI 대화·GitHub에 붙여넣지 않는다.

## 7. Firebase 로그인 또는 Google/Apple 로그인 문제

PWA와 iOS native를 먼저 분리한다. PWA에서 정상이고 iPad에서만 실패하면 Firebase 웹 로직보다 native bridge, URL scheme, Podfile, SceneDelegate, entitlements, Info.plist, GoogleService-Info.plist를 먼저 확인한다.

| 증상 | 우선 확인 |
|---|---|
| `Connecting to Google`에서 멈춤 | GoogleSignIn Pod, URL scheme, native plugin registration, callback 흐름 |
| Apple 로그인 오류 | Sign in with Apple capability, redirect/callback, SceneDelegate registration |
| 로그인 버튼 자체가 안 보임 | fresh install/로그아웃 상태, profile/onboarding gate, 현재 web bundle 버전 |
| PWA는 되지만 iPad만 실패 | native build가 필요한 변경인지, OTA가 아니라 Build 업데이트가 필요한지 |
| `No Firebase App` 또는 auth 초기화 오류 | Firebase client config, bundle ID, web/native 초기화 경로 |

native 설정을 수정했다면 OTA만으로 끝내지 않는다. `App.xcworkspace`를 열고 `pod install`, `cap sync ios`, native smoke test, Archive가 필요할 수 있다.

## 8. CocoaPods·Xcode 빌드 오류

반드시 workspace를 사용한다.

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

`App.xcodeproj`를 열었을 때 생기는 `framework not found`, `module not found`, GoogleSignIn/CapacitorCamera 누락 오류는 workspace와 Pods 문제일 가능성이 높다. 먼저 Xcode를 닫고 `pod install` 결과를 확인한 뒤 workspace를 다시 연다.

| 빌드 증상 | 조치 |
|---|---|
| Pods가 보이지 않음 | `pod install --repo-update`, `.xcworkspace` 재오픈 |
| Swift module 누락 | Podfile·Podfile.lock·Target membership 확인 |
| Signing 오류 | Apple Developer Team, bundle ID `com.teenzbible.app`, certificate/profile 확인 |
| duplicate symbols | Podfile 중복 선언과 수동 framework 추가 여부 확인 |
| 오래된 웹 UI로 Archive됨 | `app/`을 `native-ios/web/`에 동기화 후 `cap sync ios` |
| Build 번호 충돌 | App Store Connect의 마지막 build보다 큰 번호 사용 |
| Archive 대상 없음 | `Any iOS Device (arm64)` 선택 |

`Podfile.lock`이 없는 기준선에서는 새 Mac에서 생성되는 lockfile을 검토한 뒤, dependency를 고정할 필요가 있는 작업에서 커밋을 권장한다.

## 9. iPad에서 위치·터치·safe-area가 깨질 때

iPad에서만 modal이 오른쪽으로 밀리거나 아래 버튼이 안 눌리면 다음을 분리한다.

1. OTA가 실제 활성화됐는가.
2. viewport 좌표와 `visualViewport`를 혼용하고 있지 않은가.
3. safe-area inset 때문에 실제 touch target이 화면 밖으로 밀리지 않았는가.
4. overlay의 stacking context와 `pointer-events`가 맞는가.
5. 하드웨어 키보드·가로/세로 회전·Stage Manager 상태가 영향을 주는가.

`getBoundingClientRect()`의 위치와 사용자가 보는 위치가 다르면 좌표계 보정을 먼저 검토한다. CSS를 크게 바꾸기 전에 문제 modal의 rect, 부모 transform, fixed/absolute 기준 조상, z-index를 기록한다. 모바일에서 최소 44px touch target을 유지한다.

## 10. Delete Account·Report·Block 문제

Delete Account는 체크박스와 정확한 `DELETE` 입력을 모두 요구해야 한다. 버튼이 비활성화된 것은 안전장치일 수 있으므로, 먼저 어떤 조건이 충족되지 않았는지 화면 문구를 확인한다. `A friend` 같은 잘못된 fallback 이름은 사용하지 말고 실제 프로필 이름 또는 중립적인 account label을 사용한다.

Report/Block은 Ranking member modal에서 실제 touch가 작동하는지 확인한다. Block은 차단된 상대에게 Cheer를 보내지 못하게 해야 하며, Report는 신고자 bound write만 허용되어야 한다. UI만 고쳤다고 안전 기능이 완료된 것으로 말하지 말고 RTDB 기록과 Rules까지 확인한다.

## 11. App Store·TestFlight 문제

App Store Connect의 현재 화면이 과거 문서보다 우선한다. TestFlight 이메일은 테스트 가능을 뜻할 뿐 App Store 승인·출시를 뜻하지 않는다. 다음 행동은 사용자 확인 없이 하지 않는다.

- Cancel Submission
- Add for Review / Submit for Review
- Release 또는 phased release 변경
- 새 Build 업로드
- App Privacy, Review Notes, screenshots 변경

Build 번호는 App Store Connect에서 이미 사용한 번호보다 커야 한다. 현재 문서의 Build 6은 역사적 기준이므로 새 Archive 전에는 항상 최신 상태를 확인한다.

## 12. 실패한 시도 처리 규칙

같은 명령을 무작정 반복하지 않는다. 오류 출력에서 첫 번째 실제 원인과 마지막 요약을 분리해 기록한다. 변경 전에는 `git diff --check`, JavaScript 문법 검사, 관련 파일 diff를 확인한다. 배포 실패 후에는 live Hosting·Firebase Rules·Functions·App Store 상태를 추측으로 바꾸지 않는다.

> 최종 보고에는 반드시 “재현한 기기”, “수정한 파일”, “배포한 대상”, “검증한 결과”, “아직 사용자가 확인해야 하는 단계”를 구분해서 적는다.

## References

[1]: https://github.com/kimseonguk-meta/Teenz-Bible "Teenz Bible GitHub repository"
[2]: https://teens-bible-94271.web.app/ "Live Teenz Bible PWA"
[3]: https://firebase.google.com/docs/cli "Firebase CLI documentation"
[4]: https://capacitorjs.com/docs/ios "Capacitor iOS documentation"

[1] [2] [3] [4]

## Appendix: Related Files

- `docs/TEENZ_BIBLE_MASTER_HANDOFF.md`
- `START_SUCCESSOR_AI.command`
- `app/runtime-fixes-1.1.127.js`
- `app/runtime-fixes-1.1.127.css`
- `app/ota/latest.json`
- `app/database.rules.json`
- `functions/index.js`
- `native-ios/README.md`
- `native-ios/ios/App/App.xcworkspace`
- `native-ios/ios/App/App/SceneDelegate.swift`
- `native-ios/ios/App/App/Info.plist`
- `native-ios/ios/App/Podfile`
- `native-ios/ios/App/App.xcodeproj/project.pbxproj`

## 13. Meta.AI·Project Hatch 대화형 프롬프트

다음 AI에게는 이 문서의 마지막에 있는 별도 프롬프트 전문을 사용한다.

- `docs/META_AI_PROJECT_HATCH_CONVERSATIONAL_PROMPT.txt`
- 원클릭 실행 후 생성되는 `Documents/Teenz_Bible_Next_AI_Prompt.txt`

이 프롬프트는 문제 신고 → 확인 질문 → 원인 분류 → 한 단계 실행 → 결과 확인 → 수정·검증·배포 승인 순서로 AI가 대화하도록 강제한다.
#### References

[1]: https://github.com/kimseonguk-meta/Teenz-Bible "Teenz Bible GitHub repository"
[2]: https://teens-bible-94271.web.app/ "Live Teenz Bible PWA"
[3]: https://firebase.google.com/docs/cli "Firebase CLI documentation"
[4]: https://capacitorjs.com/docs/ios "Capacitor iOS documentation"

[1] [2] [3] [4]
