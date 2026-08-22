# Teenz Bible — 인수인계 README

> 이 README는 2026년 8월 22일 기준 Teenz Bible 프로젝트의 **실제 저장소 구조, Firebase 운영 방식, iOS 빌드 경계, 최신 OTA 상태, 데이터 보호 원칙**을 한 곳에 정리한 문서다. 다음 작업자는 먼저 이 파일과 `docs/TEENZ_BIBLE_MASTER_HANDOFF.md`를 읽고, 그 다음 사용자의 최신 요청을 확인한다.

## 1. 프로젝트 개요

Teenz Bible은 영어를 주로 사용하는 10대 청소년이 성경을 더 쉽게 읽고, 성경 내용을 퀴즈·오디오·AI 질문·지도·밈·크루 활동과 함께 탐색할 수 있도록 만든 모바일 중심 Bible PWA다. 핵심 콘텐츠는 중학생도 이해하기 쉬운 영어 성경 읽기이며, 영어보다 한국어가 편한 사용자를 위해 한국어 성경 번역도 제공한다. 앱의 인터페이스는 영어를 기본으로 유지하되, 성경 읽기 화면에서 언어를 선택할 수 있게 하는 것이 제품의 기본 방향이다.

서비스에는 성경 목록과 Reader, 검색·북마크·오디오, Bible AI, Bible Map, Home의 progress·streak·Daily Bible Meme, Ranking·Cheer·Report, Crew 생성·가입, Gem Store, Profile·사진 변경이 포함된다. 테마 시스템은 이전에 여러 문제를 일으켜 제품 결정으로 제거된 상태이며, 이후 작업에서 다시 복원하면 안 된다.

### 웹앱과 iOS 앱의 관계

| 표면 | 주소·식별자 | 역할 |
|---|---|---|
| Firebase Hosting PWA | [teens-bible-94271.web.app](https://teens-bible-94271.web.app/) | `app/`의 정적 HTML·CSS·JavaScript를 직접 제공한다. Galaxy Chrome, 데스크톱 Chrome, iPad Safari/PWA에서 사용할 수 있다. |
| iOS App Store 앱 | Teenz Bible, App Store ID `6769426651` | Capacitor 8.5.0 기반의 native WebView shell이다. 웹 bundle을 내장하고 Firebase Hosting의 OTA manifest를 확인한다. |
| OTA | `https://teens-bible-94271.web.app/ota/latest.json` | 웹 UI·JavaScript·CSS·문구·이미지 변경을 App Store 새 binary 없이 전달한다. 다운로드 후 background/restart에서 활성화된다. |

현재 공개 웹 기준은 **OTA 1.1.195**이며, iOS native 기준은 **Version 1.2.1, Build 6**다. OTA가 실제로 활성화되었는지는 manifest 다운로드가 아니라 앱 재시작 뒤 화면과 `window.__TEENZ_BIBLE_RUNTIME_FIXES__.version`을 확인해야 한다.

## 2. 기술 스택

### Frontend와 배포

현재 GitHub 복구 저장소에는 원래의 읽기 쉬운 `client/src/*.tsx` 전체가 없고, Firebase Hosting에서 복구한 Vite/React production bundle과 versioned runtime patch가 canonical 실행 기준이다. `inferred-react-source-paths.md`는 bundle 분석으로 추정한 원래 모듈 목록일 뿐, 수정 가능한 원본 TypeScript tree라고 간주하면 안 된다.

| 영역 | 실제 기준 |
|---|---|
| UI framework | React production bundle, React 19.1.1 문자열이 bundle에 포함됨 |
| Build style | Vite가 생성한 정적 bundle 구조로 복구됨 |
| Canonical web source | `app/` |
| Main bundle | `app/assets/index-GemFix1184.js` — 안정 기준, 이름 변경 금지 |
| Runtime fixes | `app/runtime-fixes-1.1.195.js`, `app/runtime-fixes-1.1.195.css` |
| PWA | `manifest.json`, `sw.js`, `firebase-messaging-sw.js` |
| Fonts | Google Fonts의 Cinzel, Fredoka, Nunito, Noto Sans KR 링크 |

### Firebase와 backend

Firebase project는 `teens-bible-94271`이며, `firebase.json`에 Hosting·Cloud Functions·Realtime Database Rules가 지정되어 있다. 이 프로젝트는 **Firestore가 아니라 Firebase Realtime Database(RTDB)** 를 사용한다. 따라서 DOCX에서 요청한 “Firestore JSON export”라는 표현은 현재 구조와 다르며, 실제 데이터 보존을 위해 RTDB 전체 JSON export를 만들었다.

| Firebase surface | 실제 사용 |
|---|---|
| Hosting | `app/`를 `teens-bible-94271` site로 배포한다. 모든 SPA route는 `/index.html`로 rewrite된다. |
| Realtime Database | 사용자 progress, profile, crews, ranking snapshot, notifications, reports, meme reactions/submissions, safety data를 저장한다. |
| Firestore | 현재 저장소·Rules·클라이언트 구조에서 사용 증거가 확인되지 않았다. RTDB export를 사용한다. |
| Cloud Functions | `functions/index.js`의 HTTPS `deleteOwnAccount`가 Bearer Firebase ID token과 최근 로그인 10분 조건을 확인한 뒤 Auth·RTDB 데이터를 정리한다. |
| Firebase Auth | Google·Apple sign-in 및 Firebase user session에 사용된다. |
| Firebase Storage | 이 복구본의 주요 이미지 asset은 `manus-storage/`와 Hosting URL에 있으며, 별도 Storage API 사용 여부는 새 작업 전에 확인한다. |

### iOS

iOS 앱은 React Native나 Flutter 앱이 아니다. `native-ios/` 안의 Capacitor iOS shell이 `native-ios/web/`에 있는 정적 web bundle을 WebView로 표시하며, CocoaPods로 Capacitor와 plugin을 연결한다. iOS native entry는 반드시 `native-ios/ios/App/App.xcworkspace`를 열어야 한다. `App.xcodeproj`를 직접 열면 Pods 의존성이 누락될 수 있다.

| iOS 항목 | 값 |
|---|---|
| Bundle ID | `com.teenzbible.app` |
| Native version | `1.2.1` |
| Last known build | Build 6 |
| Minimum iOS | 15.0 |
| Capacitor | `@capacitor/core`, `@capacitor/ios`, CLI `8.5.0` |
| Auth plugin | `@capacitor-firebase/authentication` `8.4.0` |
| Camera plugin | `@capacitor/camera` `8.2.2` |
| OTA plugin | `@capgo/capacitor-updater` `8.51.5` |
| Firebase JS SDK | `firebase` `^12.17.1` |
| Native dependency manager | CocoaPods |

## 3. 저장소 구조

```text
.
├── app/                         # Firebase Hosting canonical static PWA source
│   ├── index.html               # active web shell and runtime references
│   ├── assets/                  # React/Vite production chunks and data chunks
│   ├── manus-storage/           # images, icons, pets, maps, memes, textures
│   ├── runtime-fixes-1.1.195.js # latest runtime safety and UI bridges
│   ├── runtime-fixes-1.1.195.css
│   ├── database.rules.json      # RTDB Rules source of truth
│   └── ota/                     # latest manifest and verified OTA ZIP
├── functions/                   # Cloud Functions source; deleteOwnAccount
├── native-ios/                  # Capacitor shell, web mirror, iOS workspace
│   ├── web/                     # copy of web bundle used by Capacitor
│   ├── ios/App/App.xcworkspace  # open this file in Xcode
│   ├── capacitor.config.json
│   └── package.json
├── docs/                        # master handoff, continuity, environment, QA guides
├── reports/                     # audit and version-specific QA records
├── tools/                       # safe OTA build scripts
├── designs/                    # design references and mockups
├── icons/                      # PWA icons
├── firebase.json               # Hosting, Functions, RTDB deployment config
├── .firebaserc                 # project alias: teens-bible-94271
├── .env.example                # credential path template only
├── database.rules.json         # historical/root copy; active Rules file is app/database.rules.json
├── START_SUCCESSOR_AI.command  # macOS successor-AI setup helper
└── inferred-react-source-paths.md # inferred original client/src module map
```

주요 추정 원본 경로와 현재 bundle은 다음처럼 대응한다. 실제 수정은 `app/`에서 시작한다.

| 제품 영역 | 추정 원본 module | 현재 bundle |
|---|---|---|
| Home, Daily Meme, progress | `client/src/pages/Home.tsx` | `app/assets/index-GemFix1184.js` |
| Bible 목록·Reader·오디오·북마크 | `client/src/pages/Bible.tsx` | `app/assets/Bible-o7ln52A-.js` |
| Bible AI | `client/src/pages/BibleAI.tsx` | `app/assets/BibleAI-Q7OImf6U.js` |
| Bible Map | `client/src/pages/BibleMap.tsx` | `app/assets/BibleMap-D3wubcX8.js` |
| Ranking·Cheer·Report | `client/src/pages/Leaderboard.tsx` | `app/assets/Leaderboard-Tbac8wCI.js` |
| Profile·Crew·사진 | `client/src/pages/Profile.tsx` | `app/assets/Profile-DeU5glts.js` |
| Store | `client/src/pages/Store.tsx` | `app/assets/Store-CuzA7Kry.js` |
| Layout·Auth·Game state | `App.tsx`, `AppLayout.tsx`, `GameContext.tsx` | `index-GemFix1184.js` |

## 4. 데이터 구조

### RTDB 경로

현재 `app/database.rules.json`이 권한과 주요 경로의 기준이다.

| RTDB path | 목적·주의 |
|---|---|
| `userData/$uid` | 사용자 progress와 개인 게임 상태. 본인만 read/write. |
| `users/$uid` | 공개 profile 일부. read가 공개로 남아 있으므로 private 정보 추가 금지. |
| `groupMeta/$groupCode` | Crew metadata. 로그인 사용자 read/write 범위를 바꾸기 전 클라이언트 호출을 함께 조사한다. |
| `userGroups/$uid` | 사용자의 Crew membership. 본인 write. |
| `groups/$groupCode/members/$uid` | Crew membership/profile snapshot. |
| `rankSnapshots` | Ranking snapshot. 현재 authenticated read/write. |
| `classConfig` | 학교 class configuration. 공개 read. |
| `notifications/$recipientUid/encouragements/$senderUid` | Cheer 수신 알림. Rules가 sender·recipient·type·createdAt을 검증한다. |
| `reports` | 기존 일반 report/feedback 데이터. 현재 Rules가 넓으므로 보안 개선 시 기존 호출을 먼저 테스트한다. |
| `flaggedChapters` | 성경 콘텐츠 flag. 현재 Rules가 넓다. |
| `memeReactions` | Daily Meme reactions. |
| `memeSubmissions` | Meme submission data. |
| `blocks/$ownerUid/$blockedUid` | owner 본인만 관리하는 차단 목록. 삭제·생성 조건을 약화하지 않는다. |
| `safetyReports/$reportId` | reporter 본인만 생성, client read 금지. Report v3 safety flow와 연결된다. |
| `feedbacks` | 사용자 feedback. |
| `adminTokens` | 현재 Rules가 넓으므로 새 관리자 기능을 추가할 때 최우선 보안 검토 대상이다. |

### 로컬·정적 데이터

Bible 영어와 한국어 번역 데이터는 lazy-loaded static asset으로 bundle에 포함되며 IndexedDB cache key는 `teensBibleCache`다. English Bible data와 Korean Gospel/Bible data는 `app/assets/`의 data chunks 또는 bundle에서 로드된다. 브라우저 localStorage에는 session-independent UI/game preference와 일부 progress/group cache가 남을 수 있으므로 PWA 삭제만으로 Firebase Auth session이 자동 삭제된다고 가정하지 않는다.

지원 콘텐츠 언어는 **English와 Korean**이다. 기본 앱 UI 언어는 English이며, Reader 안에서 성경 본문 언어를 선택한다. 성경 콘텐츠는 청소년 친화적이고 이해하기 쉬운 표현을 목표로 하며, 새 콘텐츠를 추가할 때 비속어·욕설·의도하지 않은 부적절한 표현을 별도로 검수한다.

### 데이터 export

2026-08-22에 실제 Firebase RTDB 전체 export를 로컬에 생성했다.

```text
private-exports/rtdb-export-2026-08-22.normalized.json
```

파일 크기는 약 1.4 MB이며 최상위 path는 `classConfig`, `groupMeta`, `groups`, `memeReactions`, `notifications`, `ota`, `rankSnapshots`, `userData`, `userGroups`, `users`다. 이 파일에는 사용자 데이터가 포함될 수 있으므로 `.gitignore`의 `private-exports/`로 보호하며 GitHub에 절대 push하지 않는다. GitHub에는 실제 사용자 데이터가 아니라 Rules 원본과 export 보관 지침만 둔다. Firestore export는 현재 구조상 별도로 만들지 않았다.

## 5. 핵심 기능과 구현 위치

| 기능 | 구현 위치·현재 상태 |
|---|---|
| Home dashboard | `Home.tsx` 추정 module와 main bundle. 프로필 요약, reading progress, streak, Bible AI 진입, Daily Meme, Daily location을 표시한다. |
| Bible 목록 | `Bible.tsx` 추정 module와 `Bible-o7ln52A-.js`. Old/New Testament, 책·chapter 목록, 읽은 chapter 상태를 제공한다. |
| Bible Reader | 같은 Bible bundle. 영어/한국어 본문, 글자 크기, 북마크, Reader audio, chapter navigation이 있다. 승인된 audio rail은 OTA 1.1.194에 적용됐고 1.1.195에서도 유지된다. |
| Bible search/bookmark | Reader 관련 React handlers와 local/Firebase state를 사용한다. 새 변경 전 실제 DOM loc를 확인한다. |
| Bible AI | `BibleAI.tsx` 추정 module. 질문 입력·답변·추천 질문·Back navigation이 있다. Bible AI에서는 사진 prompt나 `REVEAL THY VISAGE`를 복원하지 않는다. |
| Bible Map | `BibleMap.tsx` 추정 module. 성경 장소와 진행 상태를 보여준다. 제거된 Theme UI를 다시 연결하지 않는다. |
| Daily Bible Meme | `Home.tsx` loc 419 카드. reaction buttons, Share, Save, full-screen meme view를 제공한다. OTA 1.1.195에서 Share 모달과 Save fallback이 추가됐다. |
| Ranking | `Leaderboard.tsx` 추정 module. Global/My Crew, Week/All, member modal, Cheer, Report flow가 있다. Block은 active UI에서 제거됐다. |
| Report safety flow | More actions → `Report this member` → `Are you sure?` → `Continue` → required reason + optional details → `Submit`. reason 없이 Submit은 비활성화된다. |
| Crew | `JoinCrew.tsx`·Profile 관련 bundle. Crew 생성, join, close, switch를 제공한다. |
| Cheer | Ranking member modal 및 notification path. 수신, confetti, 24-hour restriction은 실제 iPad에서 재확인해야 한다. |
| Gem Store | `Store.tsx` 추정 module. Gem으로 아이템을 구매하고 적용한다. Theme 아이템과 Theme system은 제품 결정으로 삭제되어야 한다. |
| Profile | `Profile.tsx` 추정 module. avatar, photo sheet, crop/save, Crew actions, account deletion이 있다. iOS Take Photo/Gallery는 실제 iPad에서 OTA 활성화 후 확인한다. |
| Delete Account | `functions/index.js`의 `deleteOwnAccount`. 실제 주 계정이 아니라 disposable test account로만 검증한다. |
| PWA/OTA | `app/index.html`, `app/ota/latest.json`, versioned runtime. 새 OTA는 ZIP root의 `index.html`, checksum, size를 모두 맞춘다. |

## 6. 디자인·콘텐츠 시스템

현재 제품의 visual direction은 **dark leather + antique gold**다. 주요 색상은 어두운 갈색/검정 leather surface, 금색 `#D4AF37` 계열 highlight, 밝은 cream text, 보조 teal/green notification이다. 폰트는 제목에 Cinzel 또는 Fredoka, 본문과 UI에는 Nunito, Korean text에는 Noto Sans KR을 사용한다. 금색 stitch와 ornate corner는 핵심 brand motif지만, modal의 주요 버튼·닫기 버튼·Share/Save 간격은 모바일에서 명확하게 보여야 한다.

`app/manus-storage/`에는 Bible place 사진, pet 상태 이미지, UI 아이콘, meme 이미지(`meme_001` 등), leather texture와 corner assets가 있다. `app/index.html`은 Google Fonts를 외부 링크로 불러온다. 각 image/font의 라이선스와 상업 이용 조건은 App Store 제출 전에 원 출처를 다시 확인해야 하며, 저장소 안에 별도의 완전한 license ledger가 있다고 가정하지 않는다.

틴즈 콘텐츠는 현재 static bundle/data와 `manus-storage` assets에 분산되어 있다. 새 밈이나 성경 번역을 추가할 때는 먼저 콘텐츠 검수표를 만들고, 욕설·저속어·성적·혐오·위험한 표현·저작권 문제가 없는지 확인한다. 사용자가 제출하는 UGC는 RTDB Rules와 moderation 운영을 함께 고려한다.

## 7. 배포·운영

### Hosting deploy

운영 전 project ID를 확인한다.

```bash
cd Teenz-Bible
git pull --ff-only origin main
cat .firebaserc
cat app/ota/latest.json
npx --yes firebase-tools deploy --only hosting --project teens-bible-94271
```

이 저장소에서 non-interactive service account deploy를 할 때는 실제 service account JSON의 절대 경로를 `GOOGLE_APPLICATION_CREDENTIALS`로 지정한다. 실제 JSON은 GitHub에 올리지 않는다.

```bash
GOOGLE_APPLICATION_CREDENTIALS=/secure/path/teens-bible-firebase-adminsdk.json \
npx --yes firebase-tools deploy --only hosting --project teens-bible-94271 --non-interactive
```

### RTDB Rules deploy

`app/database.rules.json` 전체를 검토한 뒤에만 실행한다.

```bash
npx --yes firebase-tools deploy --only database --project teens-bible-94271
```

Rules는 작은 수정처럼 보여도 live Rules 전체를 교체하므로, `blocks`와 `safetyReports` 보호를 절대 삭제하지 않는다.

### Cloud Functions deploy

```bash
cd functions
npm install
node --check index.js
cd ..
npx --yes firebase-tools deploy --only functions --project teens-bible-94271
```

### OTA 만들기

현재 최종 OTA는 다음과 같다.

```text
Version: 1.1.195
Manifest: app/ota/latest.json
ZIP: app/ota/1.1.195.zip
SHA-256: 4b9cd86f583d6b6b22c606c0931f2e99b34ba1f33973613f0d95b716807f2249
Size: 68,830,875 bytes
Builder: tools/build_ota_1195.py
```

새 web fix는 이전 runtime을 덮어쓰지 않고 새 versioned JS/CSS를 복제한다. `app/index.html`의 JS/CSS version, builder, ZIP, manifest를 같은 버전으로 맞춘 뒤 `node --check`, builder assertion, `unzip -t`, SHA-256, live manifest를 모두 확인한다. 안정 main bundle `index-GemFix1184.js`는 이름을 바꾸지 않는다. Loading DOM guard와 broad self-triggering MutationObserver를 새로 추가하지 않는다.

### iOS build와 OTA 판단

| 변경 | 처리 |
|---|---|
| HTML, CSS, JavaScript, 문구, static image, Firebase web call | 보통 새 OTA만 필요 |
| RTDB Rules | Firebase database deploy 필요, 새 App Store binary 불필요 |
| Cloud Function | Functions deploy 필요, 새 App Store binary 불필요 |
| Swift, Capacitor plugin, Podfile, Info.plist, permission, entitlement, icon, signing | 새 Xcode Archive 필요 |
| native Apple/Google login 또는 native Camera/Photo picker | 새 native build 필요할 수 있음 |

native build가 필요할 때는 다음 순서를 사용한다.

```bash
cd native-ios
nvm use
corepack enable
pnpm install --frozen-lockfile
cp -a ../app/. web/
pnpm exec cap sync ios
cd ios/App
pod install --repo-update
open App.xcworkspace
```

Xcode에서는 `App` target, Team, bundle ID `com.teenzbible.app`, Version `1.2.1`, 기존 업로드보다 큰 Build 번호를 확인한다. App Store submit/release는 사용자의 확인 없이는 실행하지 않는다.

## 8. 환경변수·비밀정보

배포된 PWA, Functions, iOS 앱은 런타임에 `.env`를 요구하지 않는다. 저장소의 `.env.example`에는 local Firebase CLI 인증용 변수 이름만 있다.

```text
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/teens-bible-service-account.json
```

GitHub에 올리면 안 되는 것은 Firebase Admin service account JSON, Apple `.p8`·`.p12`·provisioning profile, OAuth client secret, access token, 테스트 비밀번호, 2FA recovery code다. iOS의 `GoogleService-Info.plist`는 client configuration이며 server Admin key와 다르지만, 별도 민감정보 정책에 따라 관리한다. 새 AI는 secret 값을 채팅에 붙여넣지 않는다.

## 9. App Store Connect 인수인계

현재 알려진 App Store 식별자는 ID `6769426651`, native bundle ID `com.teenzbible.app`, 마지막 기준 Version `1.2.1` Build 6이다. App Store Connect의 review/release 상태는 과거 문서보다 계정에 로그인한 최신 화면을 우선한다.

설명문 초안, subtitle, keywords, privacy/review notes, 스크린샷 슬롯 계획은 [`docs/APP_STORE_CONNECT_METADATA.md`](docs/APP_STORE_CONNECT_METADATA.md)에 따로 기록한다. 저장소에 실제 App Store Connect API key나 signing asset을 넣지 않는다. `app/manus-storage/`의 앱 이미지와 별도의 디자인 reference는 후보 자산이지, Apple 제출용 스크린샷이 이미 준비됐다는 뜻은 아니다.

## 10. 현재 상태와 남은 TODO

### 완료된 핵심 작업

2026-08-22 기준으로 다음 항목이 구현 또는 기록되어 있다. Web/PWA의 loading·black-screen·DOM guard 회귀를 줄이는 안전 runtime layer, profile modal/사진 sheet 보정, Crew modal close, Bible AI Back·추천 질문, Ranking report safety flow, Theme 제거, Reader audio rail redesign, Meme Share 모달, Meme Save fallback, RTDB Rules와 Delete Account 함수가 포함된다. 최신 공개 OTA는 1.1.195이며 Meme Share/Save 수정은 public browser에서 확인하고 GitHub commit `b7f5fb6`에 기록했다.

### 실제 기기에서 남은 확인

브라우저 검증은 iOS native 동작을 완전히 대신하지 못한다. 다음은 실제 iPad에서 확인한다.

| 우선순위 | 확인할 것 |
|---|---|
| P0 | 앱을 완전히 종료하고 다시 열어 OTA 1.1.195가 활성화되는지 확인 |
| P0 | Home Meme Share를 눌러 `Share Bible Meme` 모달과 iOS share sheet 확인 |
| P0 | Home Meme Save를 눌러 Photos 저장 또는 share sheet의 `Save Image` 확인 |
| P0 | Profile avatar → Take Photo / Choose from Gallery에서 camera·Photos picker 확인 |
| P1 | Apple/Google login, Crew create/join/close, Cheer 수신·confetti·24-hour limit |
| P1 | Bible AI Back/input, Reader audio, lower toolbar, modal safe area |
| P2 | 실제 disposable account의 Delete Account server cleanup |

### 다음 개선 아이디어

새 작업자는 먼저 안정성보다 기능을 넓히지 말고, 실제 iPad smoke test checklist를 자동화할 수 있는 최소한의 DOM/Playwright 테스트와 Cloud Function emulator 테스트를 추가하는 것이 좋다. 이후 RTDB의 `reports`, `flaggedChapters`, `memeReactions`, `memeSubmissions`, `adminTokens`에 대한 최소 권한 Rules와 moderation workflow를 데이터 migration 계획과 함께 검토한다. Gem Store 아이템 적용은 구매 전후 state·재시작·로그아웃·다른 device에서 각각 검증한다.

## 11. Hatch Coco가 시작할 첫 절차

새 Mac에서 다음만 먼저 실행한다.

```bash
gh repo clone kimseonguk-meta/Teenz-Bible
cd Teenz-Bible
git pull --ff-only origin main
git status --short
cat README.md
cat docs/TEENZ_BIBLE_MASTER_HANDOFF.md
cat app/ota/latest.json
```

그 다음 사용자의 문제를 **web UI / Firebase data·Rules / Cloud Functions / native iOS / App Store metadata** 중 하나로 분류한다. 실제 device에서 확인하기 전에는 “해결 완료”라고 말하지 않는다. 변경은 관련 파일만 stage하고, `git diff --check`와 실제 public URL 검증 후 commit한다.

새 AI에게 전달할 짧은 문장은 다음과 같다.

```text
Teenz Bible 프로젝트를 이어서 작업해줘. 먼저 GitHub main의 README.md와 docs/TEENZ_BIBLE_MASTER_HANDOFF.md를 읽고, app/의 최신 OTA 1.1.195와 iOS Version 1.2.1 Build 6 기준을 확인해줘. 이 저장소는 일반적인 원본 TSX 프로젝트가 아니라 Firebase Hosting에서 복구한 React/Vite static bundle + versioned runtime 구조야. 사용자에게는 한국어로 한 단계씩 안내하고, 실제 Galaxy/iPad 검증 전에는 완료라고 단정하지 마.
```

## 12. 참고 문서

- [`docs/TEENZ_BIBLE_MASTER_HANDOFF.md`](docs/TEENZ_BIBLE_MASTER_HANDOFF.md)
- [`docs/AI_CONTINUITY_GUIDE.md`](docs/AI_CONTINUITY_GUIDE.md)
- [`docs/HANDOFF.md`](docs/HANDOFF.md)
- [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md)
- [`docs/NEW_DEVELOPER_CHECKLIST.md`](docs/NEW_DEVELOPER_CHECKLIST.md)
- [`docs/NEXT_AI_TROUBLESHOOTING.md`](docs/NEXT_AI_TROUBLESHOOTING.md)
- [`docs/APP_STORE_CONNECT_METADATA.md`](docs/APP_STORE_CONNECT_METADATA.md)
- [`docs/CONVERSATION_DECISIONS.md`](docs/CONVERSATION_DECISIONS.md)
- [`native-ios/README.md`](native-ios/README.md)
- [`inferred-react-source-paths.md`](inferred-react-source-paths.md)

## References

[1]: https://github.com/kimseonguk-meta/Teenz-Bible "Teenz Bible GitHub repository"
[2]: https://teens-bible-94271.web.app/ "Teenz Bible live PWA"
[3]: https://firebase.google.com/docs/cli "Firebase CLI documentation"
[4]: https://capacitorjs.com/docs/ios "Capacitor iOS documentation"
[5]: https://capgo.app/docs/plugins/updater/self-hosted/manual-update/ "Capgo self-hosted manual OTA documentation"

[1] [2] [3] [4] [5]
