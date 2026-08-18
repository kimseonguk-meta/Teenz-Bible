## Cover

# Teenz Bible
## 프로젝트 인수인계 및 운영 기준선

2026년 8월 기준 · 다음 개발자·AI·운영자용

## Slide 1

# 지금 인계받는 기준선

- **GitHub main**: 최신 문서·설정·앱 기준의 단일 출발점
- **Live PWA / OTA**: Firebase Hosting 기반 runtime **1.1.127**
- **iOS**: Version **1.2.1**, App Store Build **6**
- **심사 상태**: Build 6는 2026-08-18 기준 Apple 심사 대기 상태 — 행동 전 현재 화면 재확인

출처: GitHub `main`, App Store Connect 제출 기준

## Slide 2

# 구조는 “웹 원본 + iOS shell + OTA”

- `app/`이 Firebase Hosting의 **유일한 웹 원본**
- Capacitor iOS shell은 `native-ios/web/`을 base bundle로 사용
- Xcode `public/`은 embedded web bundle 미러
- iOS 앱은 Hosting manifest와 ZIP을 내려받아 **다음 재시작에 OTA 적용**

> 핵심: 웹 수정은 보통 OTA, native 변경만 새 App Store binary

## Slide 3

# 수정 위치를 먼저 분류하라

| 변경 유형 | 작업 위치 | Xcode Archive |
|---|---|---|
| UI·CSS·웹 JavaScript·문구 | `app/` + 새 OTA ZIP | 불필요 |
| Firebase RTDB 권한 | `app/database.rules.json` | 불필요 |
| 서버 계정 삭제 logic | `functions/index.js` | 불필요 |
| Swift·plugin·권한·OAuth·icon·signing | `native-ios/` | 필요 |

- 과거 최상위 runtime/ZIP 파일은 역사적 복구 자료
- **새 작업은 반드시 `app/`에서 시작**

## Slide 4

# Firebase는 세 가지를 분리해 배포한다

| 대상 | 원본 | 주의점 |
|---|---|---|
| Hosting / PWA / OTA | `app/` | manifest·ZIP checksum·size 일치 필수 |
| RTDB Rules | `app/database.rules.json` | 배포 시 live rules 전체를 교체 |
| Cloud Functions | `functions/` | Auth·계정 삭제 regression 테스트 |

- 기본 프로젝트는 **`teens-bible-94271`** (`.firebaserc`)
- Console 수동 Rules 수정은 반드시 Git 원본에도 반영

## Slide 5

# UGC 안전 기능은 App Store 핵심 기준

- **Delete Account**: 체크박스 + `DELETE` 입력 + 최근 로그인 10분
- **Report**: `safetyReports`에 신고자 검증 후 기록, client read 차단
- **Block**: `blocks`에서 owner만 읽기·수정, Cheer 차단
- **후속 보안 우선순위**: `reports`, `flaggedChapters`, `adminTokens`, meme nodes의 넓은 write 권한 최소화

> Block·Report 규칙을 단순화하거나 삭제하지 않는다.

## Slide 6

# iOS는 workspace·Pods·권한이 생명선

- `App.xcodeproj`가 아니라 **`App.xcworkspace`**를 연다
- `pod install --repo-update` 후 GoogleSignIn·CapacitorCamera 확인
- `SceneDelegate`의 Firebase Authentication plugin 등록 보존
- `Info.plist`의 Camera / Photo Library usage descriptions 보존

다음 iOS 업로드는 **Build 7 이상** · Archive 대상은 **Any iOS Device (arm64)**

## Slide 7

# OTA는 “다운로드 후 재시작”이다

- Manifest: `https://teens-bible-94271.web.app/ota/latest.json`
- ZIP root에 `index.html` 필요
- SHA-256과 byte size는 `latest.json`과 정확히 일치해야 함
- iPad 검증: **열기 → 30초 대기 → background → 다시 열기**

| 새 native base bundle이 필요할 때 |
|---|
| `app/` → `native-ios/web/` 동기화 → `cap sync ios` → Xcode Archive |

## Slide 8

# GitHub에는 코드, 외부에는 권한을 보관한다

| GitHub main에 보존 | 별도 안전 보관 |
|---|---|
| PWA·OTA·Functions·Rules·iOS source | Firebase Admin service account JSON |
| `.firebaserc`, `.nvmrc`, `.env.example` | Apple `.p8` / `.p12` / provisioning profile |
| AI·운영·환경·첫날 체크리스트 문서 | Apple/Firebase/App Store Connect 계정 복구 수단 |

- 실제 secret, token, password, signing material은 GitHub에 절대 커밋하지 않는다
- 사용자 데이터·Firebase Auth 사용자도 소스 저장소 밖에서 별도 백업한다

## Slide 9

# 다음 AI·개발자의 첫 30분

1. GitHub `main` clone 후 `AI_CONTINUITY_GUIDE.md`부터 읽기
2. `HANDOFF` → `ENVIRONMENT` → `NEW_DEVELOPER_CHECKLIST` → iOS README 순서로 확인
3. 요청을 **웹 OTA / Firebase / native iOS / App Store**로 분류
4. 실제 Galaxy·iPad 테스트 전에는 해결 선언 금지
5. 관련 파일만 Git stage·commit하고, 배포·제출은 사용자 확인 후 실행

> 시작 프롬프트는 `docs/AI_CONTINUITY_GUIDE.md`에 그대로 복사 가능한 형태로 보관됨.
