# Teenz Bible iOS OTA 자동 업데이트 미적용 — 원인 진단

## 결론

**Firebase 배포가 App Store에서 설치한 Teenz Bible에 적용되지 않는 직접적인 이유는, 현재 App Store 배포본이 OTA 로더를 포함한 새 iOS 셸이 아니라는 점입니다.** App Store 공개 버전은 **1.1**이며, 현재 GitHub에 있는 Firebase OTA 복구용 Capacitor iOS 셸은 **1.2.0 / build 1**을 목표로 구성되어 있습니다. 즉, Firebase는 최신 웹 파일과 OTA ZIP을 정상적으로 제공하고 있어도, 기기에 설치된 App Store 1.1 바이너리에는 그 ZIP을 찾아서 다운로드·검증·다음 실행에 활성화할 네이티브 기반이 없습니다. [1]

> Firebase Hosting은 **이미 설치된 iOS 바이너리의 웹 콘텐츠 URL**을 바꿀 수는 있지만, 그 바이너리에 없던 네이티브 Updater 플러그인·설정·초기 OTA 로더를 새로 주입할 수는 없습니다. 이 선행 기능은 최소 한 번의 TestFlight/App Store 네이티브 업데이트로 전달되어야 합니다.

## 확인된 증거

| 점검 항목 | 확인 결과 | 의미 |
|---|---|---|
| 공개 App Store 배포본 | `com.teenzbible.app`, 버전 **1.1**, 2026-06-15 릴리스 | 실제 이용자가 설치하는 바이너리는 1.1이다. [1] |
| 복구된 iOS 프로젝트 | `com.teenzbible.app`, `MARKETING_VERSION = 1.2.0`, build `1` | OTA를 지원하도록 새로 구성한 셸은 App Store 1.1과 다른 차기 네이티브 릴리스 후보이다. |
| iOS 셸 도입 이력 | GitHub에서 `native-ios` 복구 셸이 2026-08-14에 처음 추가됨 | App Store 1.1 출시 이후에 복구된 소스이므로, 그 셸이 1.1에 포함돼 있었다고 볼 근거가 없다. |
| 현재 Firebase OTA | `latest.json`은 **1.1.69** ZIP을 가리키며 SHA-256 일치 확인 | 서버 측 게시 자체는 정상이다. 문제는 기기 쪽의 OTA 수신·적용 경로다. |
| 새 셸의 수동 OTA 코드 | 네이티브 플랫폼에서 `notifyAppReady()` → Firebase `ota/latest.json` GET → `download()` → `next()`를 실행하도록 포함 | 새 1.2.0 셸을 먼저 설치하면 Firebase 기반 수동 OTA 경로를 사용할 수 있는 구조다. |

## “`autoUpdate: off`”의 의미

현재 복구 셸의 `capacitor.config.json`에는 `autoUpdate: "off"`가 설정되어 있습니다. 이것은 오류가 아니라 **Capgo Cloud를 쓰지 않고 Firebase를 자체 OTA 서버로 사용하기 위한 수동 모드**입니다. 이 모드에서 자동 적용은 네이티브 설정만으로 발생하지 않습니다. 앱에 포함된 JavaScript가 Firebase manifest를 읽고 `CapacitorUpdater.download()`와 `next()`를 호출해야 합니다. 공식 문서도 수동 모드에서는 `autoUpdate: off`, `notifyAppReady()`, 그리고 앱 코드에서의 download/set 또는 next 흐름을 요구합니다. [2] [3]

현재 복구 셸의 웹 번들에는 그 수동 로더가 존재하지만, **이 웹 번들을 실행할 Updater 네이티브 플러그인이 App Store 1.1 안에 이미 있었는지는 확인되지 않았으며, 복구 프로젝트의 도입 시점과 버전 불일치는 없었을 가능성이 매우 높음을 보여 줍니다.** 따라서 Firebase 배포만 반복해도 App Store 1.1은 최신 ZIP을 적용하지 못합니다.

## 추가로 반드시 바로잡아야 할 위험 요인

현재 Firebase OTA ZIP은 Python의 표준 `zipfile`로 만들고 있습니다. 반면 Updater 공식 문서는 **Capgo CLI로 ZIP을 생성해야 하며 일반 ZIP 유틸리티는 호환되지 않을 수 있다**고 명시합니다. 또한 OTA ZIP은 루트에 `index.html`이 있어야 하고, production web bundle의 필요한 전체 콘텐츠만 포함해야 합니다. [3]

현재 Python ZIP은 압축 무결성은 정상이고 루트 `index.html`도 포함하지만, 이는 iOS 플러그인 호환을 보장하지 않습니다. 따라서 새 iOS 셸을 배포하기 전에 OTA 제작 방식을 **`@capgo/cli bundle zip` 기반으로 교체**해야 합니다. 이것은 App Store 1.1이 업데이트되지 않는 1차 원인과 별개지만, 새 셸이 배포된 뒤에도 OTA 적용 실패를 일으킬 수 있는 2차 위험입니다.

| 구분 | 현재 상태 | 필요한 조치 |
|---|---|---|
| App Store 네이티브 셸 | 1.1 배포 상태 | OTA 로더를 포함한 1.2.0 이상 새 바이너리를 TestFlight 후 App Store에 배포 |
| OTA 실행 방식 | Firebase 자체 호스팅 수동 방식 | 유지 가능. Cloud 서비스는 필요 없음. |
| OTA ZIP 생성 | Python 표준 ZIP | Capgo CLI 형식 ZIP으로 교체 |
| OTA 활성화 시점 | `next()` 방식 | 다운로드 후 앱을 백그라운드로 보내거나 완전히 종료한 뒤 재실행 시 활성화되도록 TestFlight에서 검증 |
| 네이티브 변경 | Firebase로 불가 | 플러그인·Swift·Info.plist·권한 변경은 항상 App Store 바이너리 업데이트 필요 |

## 복구 순서

첫째, 현재 GitHub의 `native-ios` 프로젝트를 Mac에서 열고 `com.teenzbible.app` 서명과 provisioning을 기존 Apple Developer 계정으로 연결해야 합니다. Xcode에서 native version을 **1.2.0**, build number를 App Store Connect의 기존 build보다 큰 값으로 설정합니다.

둘째, Firebase OTA bundle 생성 스크립트를 Capgo CLI 기반으로 바꿉니다. 생성 후 `index.html`이 ZIP 루트에 있는지, CLI가 반환한 SHA-256을 Firebase `ota/latest.json`의 `checksum`에 넣었는지 검증합니다. 이 ZIP은 Firebase Hosting에 배포하고, manifest는 HTTPS URL을 반환해야 합니다. [3]

셋째, 새 iOS 바이너리를 바로 전체 App Store에 내지 말고 **TestFlight에 먼저 배포**합니다. TestFlight 기기에서 앱을 열고 Wi-Fi 상태로 잠시 둔 다음, 앱을 홈 화면으로 보내거나 완전히 종료합니다. 다시 열었을 때, Firebase의 더 높은 OTA 버전이 적용되는지 확인합니다. 이때 Xcode Console에 `CapacitorUpdater`, `Bundle downloaded`, `Bundle queued for next background/restart` 로그가 나타나야 합니다.

마지막으로 TestFlight에서 성공이 재현되면 App Store에 새 native binary를 제출합니다. 그 이후에는 HTML·CSS·JS·이미지 같은 웹 번들 변경은 Firebase OTA로 배포할 수 있습니다. 단, iOS 플러그인, Swift, 권한, `Info.plist` 변경은 그때도 새 App Store 심사가 필요합니다.

## 정확한 현재 상태

| 질문 | 답변 |
|---|---|
| Firebase Hosting v1.1.69은 정상 배포되었는가? | 예. 공개 PWA와 `ota/latest.json` 및 ZIP SHA-256은 일치한다. |
| 왜 App Store 앱은 그대로인가? | 설치된 1.1 native binary가 OTA 수신·적용 기반을 갖춘 복구 셸이 아니기 때문이다. |
| Capgo Cloud 비용이 필요한가? | 아니요. 현재 의도한 Firebase self-hosted 수동 OTA 방식으로 구현할 수 있다. |
| App Store 심사를 완전히 피할 수 있는가? | 최초 OTA 지원 셸 배포와 모든 native 변경에는 심사가 필요하다. 이후 웹 bundle 범위의 변경은 Firebase OTA로 가능하다. [2] [3] |
| 지금 당장 해야 할 핵심 한 가지는? | **OTA 로더를 내장한 새 iOS binary를 TestFlight로 먼저 올리는 것**이다. |

## References

[1]: https://apps.apple.com/sg/app/teenz-bible/id6769426651 "Teenz Bible on the Singapore App Store"

[2]: https://capgo.app/docs/plugins/updater/self-hosted/manual-update/ "Capgo Capacitor Updater — Manual Update"

[3]: https://capgo.app/docs/plugins/updater/self-hosted/auto-update/ "Capgo Capacitor Updater — Self-hosted Auto Update"
