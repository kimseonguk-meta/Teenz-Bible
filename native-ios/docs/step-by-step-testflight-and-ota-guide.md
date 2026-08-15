# Teenz Bible iOS 자동 업데이트 복구 가이드

## 목표와 가장 중요한 원칙

목표는 **Firebase를 업데이트 서버로 계속 사용**하면서, iPhone·iPad의 App Store 앱이 웹 번들(HTML, CSS, JavaScript, 이미지)을 다음 앱 실행 때 자동 반영하도록 만드는 것입니다. 이를 위해 Capgo의 **무료 오픈소스 Updater 플러그인**을 앱 내부에 한 번 넣어야 합니다. Capgo Cloud 가입이나 결제는 하지 않습니다.

> 이 작업의 핵심은 “Firebase를 바꾸는 것”이 아니라, 현재 App Store 1.1 앱에 없는 **업데이트 수신 엔진을 새 iOS 바이너리에 한 번 넣는 것**입니다. 이 새로운 바이너리가 App Store에 배포된 뒤부터 Firebase OTA가 작동합니다.

| 누가 하는가 | 해야 할 일 |
|---|---|
| 제가 진행 | Firebase OTA ZIP을 Capgo CLI 호환 형식으로 만들고, Firebase manifest·웹 배포·검증 절차를 유지합니다. |
| Seonguk님이 Mac에서 진행 | Apple 로그인, 코드 서명, TestFlight 업로드 및 App Store Connect 제출을 합니다. 이 단계는 Apple 인증서와 계정 권한 때문에 반드시 Mac/Xcode에서 해야 합니다. |

## 시작 전 준비

Mac에 최신 Xcode와 Node.js LTS, pnpm이 있어야 합니다. 또한 **현재 Teenz Bible이 등록된 동일한 Apple Developer Team**에 로그인되어 있어야 합니다. 다른 Team을 선택하면 `com.teenzbible.app`을 쓸 수 없습니다.

GitHub 저장소 `kimseonguk-meta/Teenz-Bible`의 최신 `main`을 Mac에 내려받습니다. 이 저장소의 `native-ios` 폴더가 iOS 프로젝트입니다.

```bash
git clone https://github.com/kimseonguk-meta/Teenz-Bible.git
cd Teenz-Bible/native-ios
pnpm install
pnpm exec cap sync ios
open ios/App/App.xcodeproj
```

Xcode가 열리면 좌측에서 **App** 프로젝트와 **App** target을 선택합니다. `Signing & Capabilities` 탭에서 Team을 현재 App Store 앱을 올린 Apple Developer Team으로 설정합니다. `Bundle Identifier`는 반드시 아래 값이어야 합니다.

```text
com.teenzbible.app
```

## 1단계 — Xcode에서 새 native 버전 준비

`General` 탭의 `Identity` 섹션에서 다음 값을 정합니다.

| Xcode 항목 | 권장 값 | 이유 |
|---|---|---|
| Version | `1.2.0` | 현재 App Store 1.1보다 높은 새 native 버전 |
| Build | `1`이 이미 사용됐으면 `2` 이상 | App Store Connect는 같은 Version 안에서 Build가 항상 증가해야 함 |
| Bundle Identifier | `com.teenzbible.app` | 기존 App Store 앱과 동일해야 기존 앱의 업데이트가 됨 |
| Deployment Target | iOS 15.0 이상 | 현재 앱과 Updater 플러그인의 호환 기준 |

Xcode가 `Signing Certificate`나 provisioning profile 문제를 표시하면, Team 선택 후 **Automatically manage signing**을 켭니다. 그래도 해결되지 않으면 그 메시지의 스크린샷만 보내면 됩니다. Apple 인증서나 비밀번호는 보내지 않아도 됩니다.

## 2단계 — 먼저 실제 iPad에서 로컬 설치 확인

iPad를 USB로 Mac에 연결하고 기기에서 “이 컴퓨터를 신뢰”합니다. Xcode 상단의 실행 기기 목록에서 연결된 iPad를 고릅니다. 그다음 **Run** 버튼을 누릅니다.

이 단계에서 확인할 것은 세 가지입니다. 앱이 열리고, 로그인/홈 화면이 보이며, 앱이 바로 종료되지 않아야 합니다. 이 로컬 Run은 App Store에 아무것도 올리지 않으며, 서명과 native shell이 기기에서 정상 동작하는지 확인하는 안전한 사전 점검입니다.

## 3단계 — TestFlight용 Archive 만들기

Xcode 상단의 실행 대상에서 실제 iPad 대신 **Any iOS Device (arm64)** 를 선택합니다. 메뉴에서 다음을 실행합니다.

```text
Product → Archive
```

Archive가 완료되면 Organizer가 열립니다. 목록에서 방금 생성한 archive를 선택하고 **Distribute App**을 누릅니다. 이어서 아래 순서로 선택합니다.

```text
App Store Connect → Upload → Automatically manage signing → Upload
```

Xcode가 업로드를 완료하면 App Store Connect의 TestFlight 탭에 새 build가 처리됩니다. 보통 처리에 시간이 걸릴 수 있습니다. Build 상태가 “Ready to Test”가 되면 본인 계정을 Internal Tester로 추가합니다.

## 4단계 — TestFlight에서 Firebase OTA가 실제로 적용되는지 검증

이 단계가 가장 중요합니다. **App Store에 제출하기 전에 반드시 TestFlight에서 통과해야 합니다.** TestFlight를 통해 새 1.2.0 이상 버전을 iPad에 설치합니다. 기존 App Store 1.1을 같은 앱 위에 업데이트 설치해도 됩니다.

첫 번째 실행에서는 새 native shell과 내장 웹 bundle이 열립니다. Wi-Fi에 연결한 상태로 1분 정도 둡니다. 그 후 앱을 홈 화면으로 보냅니다. 10초 뒤 앱을 다시 열거나, 완전히 종료한 뒤 다시 엽니다.

현재 구현은 다운로드 직후 화면을 강제로 새로고침하는 방식이 아니라, 안전하게 다음 background/restart에 bundle을 활성화하는 `next()` 방식입니다. 따라서 첫 화면을 열자마자 달라지지 않아도 정상이며, **한 번 background 또는 재실행하는 동작이 필요**합니다.

| 확인 항목 | 통과 기준 |
|---|---|
| Firebase manifest 확인 | TestFlight 앱이 `ota/latest.json`의 최신 버전을 인식함 |
| ZIP 다운로드 | Firebase Hosting ZIP이 다운로드됨 |
| 적용 예약 | 앱을 background로 보낸 뒤 다음 실행에서 최신 bundle이 열림 |
| 앱 안정성 | 새 화면이 열린 뒤 10초 이상 정상 작동하고 로그인·Home·Bible·Ranking이 열림 |
| 롤백 없음 | 앱이 이전 화면으로 갑자기 되돌아가지 않음 |

문제가 있으면 Mac에 iPad를 다시 연결한 상태로 Xcode 하단 Console을 엽니다. 아래 문구가 보이면 정상 흐름입니다.

```text
[OTA] Update available:
[OTA] Bundle downloaded:
[OTA] Bundle queued for next background/restart:
```

`Failed to initialize updater`, `Update check failed`, `checksum`, `unzip`, `rollback` 등의 문구가 보이면 그 부분만 복사하거나 스크린샷을 보내면 됩니다. 그 로그로 Firebase URL, ZIP 형식, checksum, native 플러그인 중 어디가 문제인지 바로 구분할 수 있습니다.

## 5단계 — TestFlight 통과 후 App Store에 배포

TestFlight에서 자동 업데이트가 한 번이라도 성공한 뒤에만 App Store 제출을 진행합니다. App Store Connect에서 해당 build를 선택하고 기존 App Store 버전 1.1의 새 버전으로 제출합니다. 앱의 주된 목적은 동일한 Bible reading/gamification 앱이므로, release note에는 다음처럼 간단히 적으면 됩니다.

```text
Improved reliability and performance. This update prepares Teenz Bible for faster content and experience improvements.
```

이번 **한 번**은 native Updater를 넣기 위한 App Store 심사가 필요합니다. 승인되어 사용자 기기에 1.2.0 이상이 설치된 후에는, UI·문구·웹 로직·이미지 같은 일반 변경은 Firebase OTA로 운영할 수 있습니다.

## 이후 평소 업데이트 방식

App Store 1.2.0 이상이 설치된 이후의 운영 흐름은 다음처럼 단순합니다.

| 변경 종류 | 배포 방법 |
|---|---|
| 화면 디자인, 텍스트, React/JS, CSS, 이미지, Firebase 데이터 연동 | 제가 Firebase Hosting + Firebase OTA ZIP으로 배포 |
| 사용자가 업데이트를 받는 시점 | Wi-Fi/네트워크 연결 상태에서 앱을 열고, 이후 앱을 background로 보내거나 재실행한 뒤 |
| Swift, Capacitor 플러그인, 카메라/푸시 권한, Info.plist, 앱 아이콘, native SDK | 새 App Store native build 필요 |

## 절대 하지 않을 것

이 절차는 Capgo Cloud 비용을 사용하지 않습니다. 별도 Capgo 계정, API key, 유료 채널, Capgo 서버를 만들지 않습니다. Firebase Hosting과 Realtime Database가 계속 OTA server 역할을 하고, 오픈소스 플러그인은 iOS 안에서 HTTPS ZIP을 내려받아 안전하게 적용하는 역할만 합니다. 수동 self-hosted 방식에서는 `autoUpdate: off`와 앱 코드의 download/next 흐름을 조합하는 것이 공식 문서의 방식입니다. [1]

또한 TestFlight 검증 전에는 Firebase manifest의 버전을 실험용으로 여러 번 바꾸지 않습니다. 제가 Capgo CLI 형식 ZIP과 checksum을 준비한 뒤, 한 개의 명확한 시험 버전으로 검증해야 원인을 빠르게 파악할 수 있습니다. 공식 문서는 자체 호스팅 Updater ZIP을 Capgo CLI로 생성하고, ZIP 루트에 `index.html`을 포함하도록 안내합니다. [2]

## 지금 바로 할 첫 번째 행동

Mac에서 아래 명령까지만 실행해 주세요.

```bash
git clone https://github.com/kimseonguk-meta/Teenz-Bible.git
cd Teenz-Bible/native-ios
pnpm install
pnpm exec cap sync ios
open ios/App/App.xcodeproj
```

그다음 Xcode가 열렸을 때 **`Signing & Capabilities` 화면의 Team 선택이 보이는 상태**만 확인하면 됩니다. Team을 선택할 수 있으면 “Xcode 열었어”라고 알려 주세요. 그 시점에 제가 TestFlight에 올리기 직전의 Firebase OTA bundle 형식과 프로젝트 설정을 최종 점검하는 다음 단계를 안내하겠습니다.

## References

[1]: https://capgo.app/docs/plugins/updater/self-hosted/manual-update/ "Capgo Capacitor Updater — Manual Update"

[2]: https://capgo.app/docs/plugins/updater/self-hosted/auto-update/ "Capgo Capacitor Updater — Self-hosted Auto Update"
