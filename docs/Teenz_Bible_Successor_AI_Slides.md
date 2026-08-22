## Cover
- Title: Teenz Bible Successor AI Handoff
- Subtitle: Meta.AI & Project Hatch를 위한 완벽한 시작 가이드
- Presenter: Manus AI

## Slide 1
- Title: Teenz Bible 현재 상태
- Subtitle: 2026년 8월 18일 기준
- Content:
  - **Firebase PWA & OTA:** 버전 1.1.127 배포 완료
  - **iOS App:** 버전 1.2.1 (Build 6) App Store 심사 대기 중 (Waiting for Review)
  - **UGC 안전 기능:** Delete Account, Report, Block 적용 완료
  - **GitHub:** `main` 브랜치에 모든 코드, OTA, 문서 보존 완료

## Slide 2
- Title: 단일 마스터 가이드
- Subtitle: TEENZ_BIBLE_MASTER_HANDOFF.md
- Content:
  - **모든 인수인계 문서를 하나로 통합:** GitHub 저장소의 `docs/TEENZ_BIBLE_MASTER_HANDOFF.md`가 유일한 최상위 기준선입니다.
  - **포함 내용:** 현재 기준선, OTA 원칙, Firebase 배포, iOS Xcode 빌드, 안전 기능, 테스트 절차
  - **새 AI의 첫 행동:** 이 문서를 가장 먼저 읽고 프로젝트 전체 맥락을 파악해야 합니다.

## Slide 3
- Title: 원클릭 시작 스크립트
- Subtitle: START_SUCCESSOR_AI.command
- Content:
  - **안전한 초기화:** 더러운 로컬 작업 폴더를 건드리지 않고, 깨끗한 새 clone을 만들어 시작합니다.
  - **프롬프트 자동 생성:** `Documents/Teenz_Bible_Next_AI_Prompt.txt`에 새 AI용 시작 프롬프트를 만듭니다.
  - **문서 자동 열기:** 마스터 인수인계 문서와 프롬프트 파일을 Mac에서 자동으로 엽니다.

## Slide 4
- Title: Firebase 및 OTA 원칙
- Subtitle: 웹 수정은 OTA로, 네이티브는 Xcode로
- Content:
  - **유일한 웹 원본:** `app/` 디렉터리가 모든 PWA와 OTA의 기준입니다.
  - **OTA 우선:** React UI, CSS, 웹 로직 수정은 Firebase Hosting에 OTA ZIP으로 배포합니다.
  - **네이티브 빌드 최소화:** Swift 코드, Capacitor 플러그인, 권한 변경 시에만 Xcode Archive(Build 7 이상)가 필요합니다.

## Slide 5
- Title: iOS 및 Xcode 빌드 원칙
- Subtitle: App.xcworkspace 사용 필수
- Content:
  - **올바른 열기:** 반드시 `native-ios/ios/App/App.xcworkspace`를 열어야 CocoaPods가 정상 작동합니다.
  - **의존성 재현:** 새 Mac에서는 `pod install --repo-update` 후 `Podfile.lock`을 커밋해 환경을 고정하세요.
  - **웹 번들 동기화:** 새 네이티브 빌드 전 `cap sync ios`로 최신 웹 소스를 iOS 내부에 반영해야 합니다.

## Slide 6
- Title: 비밀값 및 권한 관리
- Subtitle: GitHub에 올리면 안 되는 것들
- Content:
  - **Firebase Admin JSON:** 서비스 계정 키는 암호화된 개인 저장소에 별도 보관하세요.
  - **Apple Signing:** `.p8`, `.p12`, Provisioning Profile은 Mac Keychain에서 직접 관리해야 합니다.
  - **보안 설정:** `.env.example`과 `.gitignore`가 실수로 비밀값이 커밋되는 것을 막아줍니다.

## Slide 7
- Title: App Store 심사 주의사항
- Subtitle: 제출 후 함부로 취소 금지
- Content:
  - **현재 상태:** Build 6가 `Waiting for Review` 상태입니다.
  - **사용자 확인 필수:** App Store 제출 취소, 릴리스, 거절 대응 등은 반드시 사용자와 상의 후 진행하세요.
  - **최신 상태 확인:** 과거 문서를 믿지 말고, 작업 전 App Store Connect 화면을 다시 확인하세요.

## Closing
- Title: 준비 완료
- Subtitle: 8월 23일 이후에도 프로젝트는 안전하게 계속됩니다.
