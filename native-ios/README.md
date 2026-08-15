# Teenz Bible iOS Rebuild — Firebase OTA Recovery

이 폴더는 원래 iOS 소스가 복구 자료와 GitHub 이력에 남아 있지 않아 새로 구성한 **동일 App Store bundle ID (`com.teenzbible.app`)**의 Capacitor iOS 프로젝트입니다.

현재 Firebase OTA 최신 버전은 **v1.1.69**입니다. 앱은 Firebase Realtime Database의 `ota/latest.json`을 GET으로 확인하고, 업데이트 ZIP을 내려받은 뒤 `CapacitorUpdater.next()`로 다음 백그라운드/재실행에 적용합니다. **Capgo Cloud 계정이나 유료 서비스는 사용하지 않습니다.** Firebase는 계속 manifest와 ZIP을 제공하고, 앱 내부의 오픈소스 `@capgo/capacitor-updater` 플러그인만 수신·검증·활성화를 담당합니다.

## 포함된 복구 항목

| 항목 | 구성 |
|---|---|
| Bundle ID | `com.teenzbible.app` |
| 표시 이름 | `Teenz Bible` |
| iOS 제출 버전 | `1.2.0` / build `1` |
| iOS Updater | `@capgo/capacitor-updater` `8.51.5` |
| Firebase OTA | Realtime Database `ota/latest.json` → Firebase Hosting ZIP (self-hosted, Capgo Cloud 미사용) |
| 적용 방식 | 다운로드 후 `next({ id })`; 앱 백그라운드/재실행 때 적용 |
| 실패 복구 | `notifyAppReady`, 10초 ready timeout, 실패·이전 번들 자동 정리 |
| 아이콘 | 현재 Teenz Bible PWA 아이콘을 1024px AppIcon으로 반영 |

## Mac에서 여는 방법

1. 이 폴더 전체를 Mac으로 복사합니다.
2. 터미널에서 프로젝트 루트로 이동합니다.

```bash
pnpm install
pnpm exec cap sync ios
open ios/App/App.xcodeproj
```

3. Xcode의 **Signing & Capabilities**에서 Apple Developer Team을 `com.teenzbible.app`에 연결합니다. 기존 App Store 앱과 같은 Apple Developer 계정이어야 합니다.
4. App target의 **Version**은 `1.2.0`, **Build**는 이전 App Store Connect 빌드보다 큰 값으로 설정합니다. Build `1`이 이미 사용된 경우 `2` 이상으로 올립니다.
5. 실제 iPhone/iPad에서 먼저 Run을 실행합니다.

## TestFlight OTA 검증

1. 새 iOS 빌드를 TestFlight에 올리고 기기에 설치합니다.
2. 앱을 Wi‑Fi에서 열어 1~2분 둡니다.
3. 앱을 홈 화면으로 보내거나 완전히 종료합니다.
4. 앱을 다시 엽니다. Firebase에서 예약된 최신 PWA가 적용됩니다.
5. Home, Bible, Ranking, Store, Profile 화면이 정상적으로 열리는지 확인합니다.
6. Xcode Console에서 `[OTA] Update available`, `[OTA] Bundle downloaded`, `Bundle queued for next background/restart` 로그를 확인합니다.

## OTA ZIP 생성 전환

현재 공개 Firebase OTA ZIP은 Python 표준 ZIP으로 생성된 이력이 있습니다. 새 iOS 셸을 TestFlight에 올리기 전에는 OTA 생성 방식을 **`@capgo/cli bundle zip`**으로 전환해야 합니다. 공식 Updater 문서는 CLI가 만든 ZIP, 루트 `index.html`, 그리고 CLI가 산출한 checksum을 요구합니다. 이 전환과 Firebase manifest 갱신은 운영 작업으로 별도 검증합니다.

## 중요 제약

이 Linux 작업 환경에서는 Xcode, Apple 코드서명 인증서, App Store Connect 전송 도구를 실행할 수 없습니다. 따라서 Archive, TestFlight 업로드, App Store 제출은 Apple Developer 권한이 있는 Mac에서 수행해야 합니다.

한 번 이 네이티브 업데이트가 App Store에 배포되면, 이후 HTML/CSS/JavaScript/이미지 변경은 Firebase OTA 방식으로 적용됩니다. iOS 플러그인, 권한, Info.plist, Swift 변경은 항상 새 App Store 바이너리가 필요합니다.
