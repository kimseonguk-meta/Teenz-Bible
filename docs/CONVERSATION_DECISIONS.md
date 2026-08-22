# Teenz Bible — Important Conversation Decisions

이 문서는 다음 AI가 과거 작업 맥락을 다시 추측하지 않도록, 사용자가 실제 대화에서 확정한 중요한 제품 결정을 요약한다. 최신 코드·manifest·실기기 확인 결과가 이 요약보다 우선한다.

## Product direction

Teenz Bible의 핵심 가치는 영어를 주로 사용하는 중학생·10대가 성경을 부담 없이 읽도록 **쉽고 명확한 영어 번역**을 제공하는 것이다. 영어보다 한국어가 편한 학생을 위해 Reader에는 한국어 성경 읽기 옵션도 둔다. 앱 UI는 영어 중심이지만 Reader 언어는 사용자가 선택한다.

성경 콘텐츠는 신뢰성과 청소년 적합성을 우선한다. 비속어, 욕설, 저속한 표현, 의도하지 않은 성적·혐오 표현이 발견되면 번역·콘텐츠를 다시 검수한다. 새 콘텐츠를 빠르게 늘리기보다 모든 언어와 chapter에서 반복 검수할 수 있는 절차를 유지한다.

## Design decisions

기본 visual direction은 **dark leather + antique gold**이며, 금색 stitch와 ornate corner motif를 유지한다. 단, 장식은 버튼의 가독성과 touch target을 해치면 안 된다. mobile 화면에서 modal, close, share, save, cheer 버튼은 겹치지 않고 손가락으로 쉽게 눌려야 한다.

Gem Store의 Theme 기능은 삭제하기로 결정했다. Theme을 다시 도입하거나 다른 페이지에 우연히 적용하는 코드를 추가하지 않는다. Gem Store는 구매 가능한 일반 아이템과 아이템 적용 state를 안정적으로 유지하는 방향이다. Mystery Box도 위험성이 커서 제거 결정이 내려졌다.

Bible AI에는 `REVEAL THY VISAGE`나 사진을 요구하는 prompt를 표시하지 않는다. Profile avatar를 사용자가 명시적으로 눌렀을 때만 photo sheet를 연다. Profile photo sheet가 열리더라도 전체 화면이 원인 없이 blur 되거나 화면 밖으로 밀리지 않아야 한다.

## Safety and community decisions

Ranking에서 Block 버튼은 active UI에서 제거했다. 사용자가 `More actions`를 연 뒤 `Report this member`를 선택하고, `Are you sure?` 화면에서 `Continue`를 누른 다음 required reason과 optional details를 입력하는 Report v3 흐름을 사용한다. reason을 선택하기 전에는 Submit을 활성화하지 않는다.

UGC 관련 RTDB path인 `blocks`와 `safetyReports`는 현재 보호 Rules를 보존한다. Rules 전체를 읽지 않고 단순화하지 않는다. `reports`, `flaggedChapters`, `memeReactions`, `memeSubmissions`, `adminTokens`는 후속 최소 권한 검토 대상이지만, 기존 client 호출과 migration 계획 없이 즉시 잠그지 않는다.

Delete Account는 accidental deletion을 막기 위해 confirmation checkbox와 정확한 `DELETE` 입력을 요구하며, 최근 sign-in 조건과 server cleanup을 사용한다. 실제 주 계정으로 삭제 테스트를 하지 않고 disposable test account만 사용한다.

## Deployment decisions

웹 HTML·CSS·JavaScript·문구·static image 변경은 우선 Firebase Hosting OTA로 처리한다. 최신 공개 기준은 1.1.195다. 새 runtime은 이전 runtime을 덮어쓰지 않고 새 versioned JS/CSS와 manifest·ZIP을 함께 만든다. ZIP checksum과 size가 manifest와 일치하지 않으면 배포하지 않는다.

Swift, Capacitor plugin, Podfile, Info.plist permission, native Apple/Google login, native Camera/photo integration, app icon, entitlement, signing 변경은 OTA만으로 처리하지 않고 새 Xcode Archive가 필요하다. iOS project는 반드시 `App.xcworkspace`를 열며 `App.xcodeproj`를 직접 열지 않는다.

OTA가 다운로드됐다는 사실만으로 업데이트가 활성화됐다고 말하지 않는다. iOS에서는 앱을 열고 약 30초 기다린 뒤 App Switcher에서 완전히 종료하고 다시 열어 실제 DOM과 기능을 확인한다. 실제 iPad 확인 전에는 camera, gallery, native share sheet, Photos save가 해결됐다고 단정하지 않는다.

## Recent verified fixes

1. Ranking Report v3는 1.1.192에서 공개 검증됐다.
2. Reader audio rail redesign은 1.1.194에서 공개 검증됐다. 기존 large translucent panel 대신 compact leather rail을 사용한다.
3. Profile native photo input tap bridge는 1.1.193에서 구현됐지만 실제 iPad picker presentation은 iPad에서 확인해야 한다.
4. Bible Meme Share·Save fix는 1.1.195에서 공개 검증됐다. Share는 `Share Bible Meme` 모달을 열고, Save는 Photos/native share/download/open fallback을 사용하며 이전 `Could not save meme` 오류를 노출하지 않는다.

## Handoff boundary

GitHub는 코드·Rules 원본·문서·검증된 OTA artifact를 보관하지만 Firebase 사용자 데이터, service account JSON, Apple keys, OAuth secrets, passwords, 2FA recovery codes는 보관하지 않는다. RTDB 전체 export는 2026-08-22에 로컬 `private-exports/`에 생성했으며 `.gitignore`로 보호한다.
