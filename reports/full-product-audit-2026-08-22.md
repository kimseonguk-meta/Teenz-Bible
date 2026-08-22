# Teenz Bible 최종 전수 제품 감사 보고서

**감사일:** 2026년 8월 22일  
**감사 대상:** [Teenz Bible 웹/PWA](https://teens-bible-94271.web.app/), Firebase Hosting 배포본 및 OTA 1.1.193 패키지  
**현재 App Store 빌드:** Version 1.2.1, Build 6  
**작성자:** Manus AI

## 1. 감사 목적과 최종 결론

이번 감사는 App Store 배포 이후의 최종 인수인계 단계에서 Home, Bible AI, Bible Map, Bible Reader, Bible 목록, Ranking, Gem Store, Profile의 주요 버튼과 모달을 실제로 열고 눌러 동작을 확인하는 것을 목적으로 진행했다. 단순히 코드가 존재하는지만 확인하지 않고, SPA 재렌더링 이후에도 화면이 유지되는지, 모달의 닫기 동작이 가능한지, 모바일 화면에서 버튼이 눌리는지, 이전에 문제가 되었던 검은 화면과 잘못된 DOM 가드가 재발하지 않는지를 함께 점검했다.

**최종 결론은 다음과 같다.** 주요 사용자 흐름은 전반적으로 작동한다. 감사 중 발견한 UI·기능 결함은 OTA 1.1.186 이후 단계적으로 보정했고, Home 로그인·백업 카드, Profile crop 모달, meme close, 그리고 Ranking 신고 안전 흐름은 각각 후속 OTA에서 다듬었다. Firebase Hosting에는 1.1.193이 배포되었고 공개 manifest, 안정 React 1184 번들 참조, Reader audio redesign을 확인했다. Profile 사진 기능은 브라우저와 native-platform simulation까지 검증했으며 실제 iPad picker 표시는 아직 실기기 확인이 필요하다.

성경 본문 품질, 퀴즈 보상 표기 불일치, Reader의 `v.` 버튼 동작은 이번 OTA에서 임의로 건드리지 않았다. 이 항목들은 기능 고장과 UI 보정의 범위를 넘어 콘텐츠·제품 정책을 다시 결정해야 하므로, 다음 개발자가 별도 콘텐츠 QA 작업으로 이어받아야 한다.

## 2. 배포 상태

| 항목 | 최종 상태 |
|---|---|
| 최신 OTA | **1.1.193 배포 완료** |
| 공개 manifest | `https://teens-bible-94271.web.app/ota/latest.json?final=1193-final`에서 1.1.193 확인 |
| OTA ZIP | `https://teens-bible-94271.web.app/ota/1.1.193.zip` |
| SHA-256 | `40099108d1ba4c45c6fea5e9fb15c92f23d25860d245a0350d8ec8d533ea6a8d` |
| ZIP 크기 | 68,713,710 bytes |
| React 메인 번들 | 기존 검증본 `assets/index-GemFix1184.js` 유지 |
| Loading DOM guard | 재추가하지 않음 |
| Firebase Hosting | 배포 완료, Hosting URL 응답 확인 |
| iOS 적용 방식 | 앱을 완전히 종료한 뒤 다시 열어 OTA가 다음 재시작에서 활성화되도록 해야 함 |

배포 후 정적 검증에서 index는 `runtime-fixes-1.1.193.js`, `runtime-fixes-1.1.193.css`, `assets/index-GemFix1184.js`를 참조했다. 따라서 이전에 문제를 일으켰던 React lazy chunk 이름 변경은 발생하지 않았다.

## 3. 전수 감사 결과

| 영역 | 실제 확인한 흐름 | 결과 |
|---|---|---|
| Home | Bible AI 카드, Continue Reading, 오늘의 밈 반응 4종, Share, Save, Location 카드와 Bible Map 진입 | 정상 |
| Home 로그인 카드 | 익명·신규 사용자에게 Google·Apple 연결 카드 표시, Google·Apple 버튼 존재, X 닫기 동작 | 1.1.186에서 X 닫기 보정, 1.1.187에서 색상·X 시각 강조도 재수정 |
| Bible AI | 입력, 답변 생성, 후속 추천 질문, Clear, Back, 답변의 성경 문맥 링크 | 입력·답변·Clear·Back 정상. 문맥 링크는 새 탭/about:blank 방식으로 열리는 웹 동작이 남음 |
| Bible Map | Old/New Testament 필터, Jerusalem, Galilee, Paul's Journeys, Reset view, List view, 장소 상세 팝업, Acts 13 링크 | 정상 |
| Bible Reader | EN/KR 전환, Aa 글자 크기, Audio 재생·일시정지·속도, My Bookmarks, 이전·다음 챕터, Chapter Complete, Take Quiz, 읽기 제한 안내 | 1.1.193에서 승인된 slim leather audio rail 공개 검증. 480×84px normal-flow panel, 4px gold progress line, 3열 status/speed/Auto-next, Stop 숨김, 본문 비가림. 읽기 제한 X는 1.1.186에서 보정 |
| Bible 목록 | Old/New Testament 전환, Law·History·Poetry·Major Prophets·Minor Prophets·Gospels·Paul's Letters·General Letters·Prophecy 접기·펼치기 | 정상. 카테고리 카드가 접혔다가 다시 복원됨 |
| Ranking | Day/Week/All, 사용자 프로필 팝업, Join Crew, Create Crew, Cheer, More actions, Report 확인·사유 입력 | 1.1.192 공개 검증 완료. Block 제거 |
| Gem Store | Reader/Frames/Pets 탭, 검색, 정렬, rarity 필터, My Items 각 탭, Faithy 장착·해제, 가로 탐색 | 정상. 가로 스와이프가 인접 탭으로 넘어가지 않도록 기존 guard 유지 |
| Profile | 아바타 요약, Edit, Crew 관리, Sound Effects, Member Ranking, Send Feedback, Reading Reminders, Export My Data, Privacy Policy | 정상. 사진 sheet는 웹에서 표시되며 1.1.193 native tap bridge 추가 |
| Profile 보안 작업 | Reset Progress, Delete Account 확인 흐름 | Reset Progress는 1.1.186에서 확인창 보정. Delete Account는 typed confirmation 구조와 취소 흐름 유지 |
| Cheer 수신함 | Profile 하단 ENCOURAGEMENTS 영역 | 현재 감사 계정은 익명·수신 데이터 없음으로 수신 항목이 표시되지 않음. 두 계정 간 실제 수신·콘페티는 별도 실기기 검증 필요 |

### Bible 목록 카테고리 세부 확인

New Testament에서 Gospels를 접으면 Matthew·Mark·Luke·John 카드가 모두 숨겨지고 다시 펼치면 복원됐다. Paul's Letters도 13개 서신 카드가 숨겨졌다가 복원됐다. General Letters는 Hebrews·James·1/2 Peter·1/2/3 John·Jude 8개 카드가 정상 복원됐다. Prophecy는 Revelation 카드가 접혔다가 복원됐다. Old Testament의 Law·History·Poetry·Major Prophets·Minor Prophets도 목록 전환과 카테고리 표시가 정상 동작했다.

### Profile 하단 세부 확인

Profile 진입 직후 짧은 Loading 지연은 있었지만 이후 Anonymous 프로필, Recent Badges, Weekly Goal, My Crews, Reading Reminders, Sound Effects, Manage Crews, Send Feedback, Export My Data, Privacy Policy, Reset Progress, Delete Account가 정상 렌더링됐다. 하단까지 스크롤해도 `ENCOURAGEMENTS` 또는 Cheer 수신 항목은 표시되지 않았다. 현재 계정이 익명이고 수신 Cheer 데이터가 없기 때문일 가능성이 높으므로, 수신 데이터가 있는 두 계정으로 별도 확인해야 한다.

## 4. 1.1.186에서 수정한 결함

### 4.1 Reset Progress가 아무 반응도 하지 않던 문제 — P1

Profile 하단의 `Reset Progress` 버튼은 표시되지만 기존 배포본에서는 React 상태 전환이나 확인창이 나타나지 않는 경우가 재현됐다. 1.1.186에서는 실제 `data-loc`를 대상으로 별도의 capture 단계 이벤트 bridge를 설치했다. 버튼을 누르면 앱의 진행 데이터, XP, Gems, 북마크, 인벤토리, 장착 상태, Bible AI thread 등 기기 내 진행 상태를 지우기 전에 확인창을 먼저 표시한다. 로그인 정보와 Crew membership은 유지된다는 안내도 포함했다.

로컬 1.1.186 패키지에서 다음 확인창이 실제로 생성되는 것을 확인했다.

> Reset your progress? This clears your reading history, XP, Gems, bookmarks, items, and Bible AI threads on this device. Your sign-in and Crew membership stay safe.

`Cancel`을 누르면 확인창이 닫히고 진행 상태를 삭제하지 않는다. 실제 `Reset everything` 확정 동작은 사용자 데이터 삭제가 수반되므로 자동 검증에서는 실행하지 않았다.

### 4.2 Bible Reader 읽기 제한 모달의 X가 닫히지 않던 문제 — P2

`Whoa! Slow down!` 읽기 제한 모달의 X 버튼은 `client/src/pages/Bible.tsx:2640`에 있으며 기존에는 화면상 버튼을 눌러도 모달이 남는 경우가 재현됐다. 1.1.186에서는 해당 X를 모달 overlay의 닫힘 동작과 연결하는 별도 bridge를 추가했다. 기존의 `Go back & read` 경로는 유지하며, 사용자는 이제 X로도 모달을 닫을 수 있어야 한다.

이 기능은 실제 iOS 기기에서 OTA 활성화 후 한 번 더 확인해야 한다. 자동 브라우저에서는 DOM 위치와 이벤트 연결을 확인했지만 네이티브 WebView의 제스처·안전 영역까지 완전히 대체하지는 않는다.

### 4.3 Home 백업 카드 X가 닫히지 않던 문제 — P2

Home 상단의 `Back up your progress` 카드는 Google·Apple 연결을 권장하는 선택적 안내 카드다. X 버튼은 `client/src/pages/Home.tsx:257`에 있으며 기존에는 눌러도 카드가 사라지지 않는 경우가 있었다. 1.1.186에서는 X를 capture 단계에서 처리하고 사용자가 닫은 상태를 `teenzBibleBackupCardDismissed`에 기록한다. SPA 재렌더링 이후에도 닫힌 카드가 다시 나타나지 않도록 했다.

로컬 1.1.186에서 카드의 X를 직접 클릭한 뒤 카드의 `display`가 `none`이 되고 숨김 상태가 기록되는 것을 확인했다.

### 4.4 Home 상단 로그인·백업 카드 UI 개선

사용자 피드백에 따라 이 카드는 Continue Reading, Bible AI, XP와 같은 게임·콘텐츠 섹션과 성격이 다르다는 점을 시각적으로 드러냈다. 기존 가죽 배경 질감은 유지하되 카드 표면에 차분한 녹색·회색 계열을 섞어 **계정 보안 및 기기 간 진행 저장 안내**라는 성격을 구분했다. X는 커다란 금색 버튼처럼 보이지 않도록 시각적인 원형 아이콘을 작게 만들고 가벼운 `×`로 바꾸었으며, 클릭 영역은 모바일에서 누를 수 있는 정도로 유지했다.

Google·Apple 로그인 버튼은 변경하지 않았다. 따라서 이 카드는 사라지기 전까지 두 연결 버튼을 계속 제공하며, 사용자가 실수로 X를 누르도록 X를 과도하게 강조하지 않는다.

## 5. 재발 방지 확인

| 제약 | 확인 결과 |
|---|---|
| Loading DOM guard 재추가 금지 | 금지된 `__tbLoadingFallbackGuard`, `tb-native-stale-loading`, `installLoadingFallbackGuard`, `hideStaleFallbacks`, `scheduleHideStaleFallbacks` 문자열 없음 |
| React chunk 이름 변경 금지 | `index-GemFix1184.js` 유지, 1185·1186 React chunk 생성 없음 |
| safeRemoveChild guard 유지 | 기존 안전 guard 보존 |
| 다른 bridge의 예외가 핵심 기능을 막지 않도록 함 | Reset, Reading gate, Backup card를 독립적인 try/catch 루틴으로 재호출 |
| React 재렌더링 대응 | 제한된 250ms 주기 보정 루틴으로 카드·모달이 다시 생겨도 selector를 재확인 |
| 무한 DOM 감시 금지 | 자기 자신이 만든 style/text mutation을 감시하는 위험한 MutationObserver는 제거함 |

배포 전 로컬 검증에서 Home 카드의 스타일 변화를 광범위한 `MutationObserver`로 감시하면 runtime이 스스로 만든 mutation을 다시 감지하여 무한 루프를 만들 수 있는 위험이 확인됐다. 해당 observer는 최종 패키지에서 제거했다. 최종 runtime은 제한된 주기와 예외 격리 방식을 사용한다.

## 6. 남아 있는 품질·제품 이슈

### 6.1 성경 번역 품질 — P1 콘텐츠 QA

영어와 한국어 본문에서 일부 표현이 중학생용 쉬운 언어의 범위를 넘어 지나치게 구어체로 보이는 사례가 확인됐다. Genesis 1·2 영어에는 `for real`, `totally complete`, `just chilled`, `awesome`, `Seriously`, `super deep sleep`, `Whoa, finally!`와 같은 표현이 반복됐다. Acts 13 영어에서도 부적절하게 느껴질 수 있는 표현이 확인됐고, Revelation 1 한국어는 문장 품질이 특히 낮은 부분이 있었다.

Acts 13에서는 영어와 한국어 모두 본문 내용과 맞지 않는 이전 장 성격의 제목이 상단에 함께 노출되는 장·절 매핑 문제도 확인됐다. 이는 단순한 화면 버그가 아니라 앱의 핵심 가치인 **안전하고 이해하기 쉬운 성경 콘텐츠**에 관한 문제다. 다음 개발자는 66권을 한 번에 자동 치환하기보다 원문 대조, 신학적 의미, 중학생 독해 수준, 비속어, 모욕 표현, 과도한 밈 표현을 기준으로 장별 검수를 수행해야 한다. 영어와 한국어 모두 같은 기준으로 검수하고, 수정본은 별도 콘텐츠 버전과 검수 기록을 남겨야 한다.

### 6.2 Quiz 보상 표기 불일치 — P1 제품 QA

Genesis 1에서 버튼에는 `Take Quiz (+10 XP, +3 💎)`가 표시되었지만 결과 화면에는 `+10 XP, +5 💎`가 표시됐다. 또한 질문·선택지를 거치지 않고 즉시 성공 화면으로 이동하는 것처럼 보였다. 이는 사용자 신뢰와 Gem 경제에 영향을 주는 제품 이슈다. 다음 개발자는 실제 퀴즈 문제·정답·재시도·보상 수량을 명확히 정의한 뒤 버튼 문구와 결과 문구를 동일한 단일 상수에서 표시해야 한다.

### 6.3 Reader `v.` 버튼

Genesis 1 Reader에서 `v.` 버튼은 별도 번역본 메뉴가 아니라 절 번호 표시를 켜는 버튼으로 확인됐다. EN/KR 언어 전환은 동작한다. Theme 기능은 제거된 상태이며 Reader Skin trigger도 숨겨져 있다. 다음 개발자는 `v.` 버튼의 이름과 시각적 의미가 사용자에게 명확한지 제품 결정을 내려야 한다.

### 6.4 Cheer 수신함 실사용 확인

Profile 하단의 ENCOURAGEMENTS는 수신 Cheer 데이터가 있을 때 표시되는 흐름으로 설계되어 있다. 이번 감사 계정은 익명 상태이고 수신 Cheer가 없어 실제 수신 카드와 콘페티를 관찰할 수 없었다. 실제 iPad에서 두 계정으로 로그인한 뒤 A 계정이 B 계정에 Cheer를 보내고 B 계정이 Profile을 다시 열어 보낸 사람·시간·콘페티가 나타나는지 확인해야 한다. 현재 푸시 알림 기능은 범위에 포함되지 않는다.

## 7. iOS 실기기에서 남은 최종 확인

OTA 배포 후 iPad 또는 iPhone에서 앱을 완전히 종료하고 다시 열어야 한다. 최근 앱 화면에서 Teenz Bible을 위로 밀어 완전히 종료한 뒤 다시 실행하고 다음 항목을 순서대로 확인한다.

| 순서 | 확인 항목 | 기대 결과 |
|---:|---|---|
| 1 | Home 상단 로그인 카드 | 기존 가죽 질감은 유지되며 카드 표면이 다른 섹션과 구분되는 차분한 녹색 계열로 보임 |
| 2 | 로그인 카드 X | 작고 보조적인 `×`로 보이며 누르면 카드만 사라짐 |
| 3 | Google·Apple 버튼 | 카드가 표시되는 익명·신규 상태에서 두 버튼이 계속 눌림 |
| 4 | Profile → Reset Progress | 확인창이 열리고 Cancel이 안전하게 닫힘 |
| 5 | Bible Reader → 읽기 제한 | X를 누르면 모달이 닫히며 본문 화면으로 돌아감 |
| 6 | Home·Bible AI·Bible Map·Bible·Ranking·Store·Profile | 검은 화면, Error Boundary, 하단 에러 문구가 나타나지 않음 |
| 7 | 앱 재실행 | OTA 활성화 후 1.1.193 Reader audio와 Profile photo bridge가 유지됨 |
| 8 | Profile → avatar → Change Photo | 웹 sheet 표시. native simulation에서 Camera/Gallery가 각각 올바른 input을 호출 | 실제 iPad picker 표시만 실기기 확인 필요 |

## 8. 인수인계 시 반드시 보존할 파일과 규칙

개발자는 다음 파일을 GitHub 저장소에서 우선 확인해야 한다.

| 파일 | 역할 |
|---|---|
| `app/index.html` | runtime 1.1.193와 안정 React 1184 main chunk 참조 |
| `app/runtime-fixes-1.1.193.js` | OTA 보정 runtime, Ranking Report 안전 흐름, Reader audio polish, native photo input tap bridge, 안전 DOM 처리, crop 모달 host 격리 |
| `app/runtime-fixes-1.1.193.css` | Reader slim leather audio rail, 모바일 UI, 로그인 카드 표현, crop 모달 레이어, meme close 중앙 정렬, Ranking Report UI |
| `app/ota/latest.json` | 현재 OTA 버전·URL·SHA-256·크기 |
| `app/ota/1.1.193.zip` | Firebase Hosting에서 제공되는 최종 OTA 패키지 |
| `app/assets/index-GemFix1184.js` | 이름을 바꾸면 안 되는 검증된 React main bundle |
| `docs/AI_FINAL_SUMMARY.md` | 후속 AI용 프로젝트 상태와 운영 제약 |
| `reports/full-product-audit-2026-08-22.md` | 본 최종 제품 감사 보고서 |
| `reports/meme-modal-public-verification-1190.txt` | 공개 1.1.190 meme 모달 geometry·동작 검증 기록 |
| `reports/meme-close-centering-qa-2026-08-22.txt` | 1.1.191 X 박스 중앙 정렬과 공개 검증 기록 |
| `reports/ranking-report-public-verification-1192.txt` | 1.1.192 Ranking Report 안전 흐름 공개 검증 기록 |

다음 수정에서도 React lazy chunk의 이름을 바꾸지 말아야 한다. 검은 화면을 일으켰던 Loading DOM guard를 다시 추가하면 안 된다. 새 runtime을 만들 때는 기존 안정 패키지를 복사한 뒤 runtime JS/CSS만 버전업하고 ZIP checksum, index 참조, 금지 문자열, main chunk 동일성 검사를 먼저 수행해야 한다.

## 9. OTA 1.1.192 Ranking 신고 안전 흐름

사용자 승인 시안에 따라 Ranking 유저 액션 포털에서 **Block 버튼을 제거**하고, 기본 화면에는 Cheer·More actions·Close만 남겼다. More actions를 펼치면 `Report this member`만 나타난다. Report를 누르면 즉시 신고하지 않고 `Are you sure?` 확인 단계를 거친다. Continue 이후에는 신고 사유 선택, 선택적 추가 설명, Submit report 순서로 진행한다. 신고 사유를 선택하기 전에는 제출 버튼이 비활성화된다. 저장 payload는 기존 `safetyReports.json` 경로를 유지하며 `reason`과 최대 500자의 `details`를 포함한다.

로컬 브라우저와 공개 Firebase Hosting에서 다음을 확인했다.

| 확인 항목 | 결과 |
|---|---|
| Active runtime | `runtime-fixes-1.1.192.js` |
| Block 버튼 | 포털 DOM에 없음 |
| More actions | Report this member 하나만 노출 |
| Report 확인 | Continue 전 확인 대화상자 표시 |
| 신고 폼 | reason select, optional details textarea, Cancel, Submit report 표시 |
| 제출 안전성 | 사유 미선택 시 disabled, 사유 선택 시 enabled |
| 실제 신고 전송 | QA에서는 전송하지 않음. 외부 side effect 방지 |
| 기존 보호 로직 | Profile crop, Reader gate X, safeRemoveChild, 안정 React 1184 보존 |

공개 검증 기록은 [`reports/ranking-report-public-verification-1192.txt`](ranking-report-public-verification-1192.txt)에 저장했다.

## 10. OTA 1.1.193 Reader audio 및 Profile photo

1.1.193은 사용자가 승인한 Reader audio redesign을 실제 적용했다. 공개 Reader에서 오디오를 켜면 패널은 본문을 덮는 대형 translucent overlay가 아니라 header 아래 normal-flow의 480×84px dark leather rail로 표시된다. 상단 4px progress line, Playing·part count, segmented speed controls, Auto next chapter를 3열로 정리했고 Stop 버튼은 숨겼다. 공개 계산값과 화면에서 첫 Scripture paragraph가 panel 아래에 배치되는 것을 확인했다.

Profile photo 문제에는 native Capacitor 환경에서만 capture-phase tap bridge를 추가했다. Photo sheet의 `Take Photo`는 Profile.tsx:1101 (`accept=image/*`, `capture=environment`), `Choose from Gallery`는 Profile.tsx:1120으로 연결되며 두 input 모두 native 환경에서 `display:block`·1px transparent로 유지된다. 로컬 simulation에서 두 버튼의 bound marker와 input.click mapping을 확인했지만, 실제 카메라 권한·Photos picker presentation은 브라우저로 증명할 수 없으므로 iPad에서 최종 확인해야 한다.

## 11. 최종 인수인계 판단

**기능 상태:** 주요 탐색·콘텐츠·소셜·스토어·프로필 흐름은 감사 범위에서 대체로 정상이다.

**이번 릴리스 수정 상태:** Reset Progress 확인창, Reader 읽기 제한 X, Home 백업 카드 X는 이전 OTA에서 보정되었고, 로그인 카드 UI는 1.1.187에서 조정되었다. Profile 사진 crop 모달의 overlay/panel 겹침·오프셋 문제는 OTA 1.1.189에서 보정되었다. 밈 상세 모달 X는 1.1.190·1.1.191에서 보정했다. 1.1.192에서는 Ranking에서 Block을 제거하고 Report를 확인·사유 입력·제출 단계로 분리했다. **1.1.193에서는 승인된 Reader audio rail을 적용하고 native Profile photo input tap bridge의 호출 순서를 보강했다.**

**프로필 사진 crop 검증:** 공개 웹앱에서 아바타 → Choose from Gallery → 사진 업로드 흐름을 재현했다. crop overlay는 앱 shell 전체를 덮는 fixed host로 표시되고, panel은 shell 중앙에 정렬되며, This Week·Recent Badges 등 배경 카드에는 `visibility:hidden`, `opacity:0`, `pointer-events:none`이 적용된다. 수정 후 측정값은 shell/overlay x=400, width=480, y=0, panel x=424, width=432이며, 1.1.191에도 해당 crop host/overlay 보호 로직이 그대로 보존되었다.

**공개 웹 검증:** cache-busting manifest에서 1.1.193, URL `/ota/1.1.193.zip`, SHA-256 `40099108d1ba4c45c6fea5e9fb15c92f23d25860d245a0350d8ec8d533ea6a8d`, size `68,713,710`을 확인했다. 공개 브라우저 runtime은 1.1.193이며, Reader Audio를 실제 클릭해 `HD Playing...` 상태와 slim leather rail을 확인했다. panel은 480×84px, progress는 480×4px, content는 3열 grid였고 Stop은 숨겨졌으며 본문을 가리지 않았다. Ranking Report 안전 흐름과 기존 Profile crop host/overlay selector, Reader gate X, safeRemoveChild guard, 안정 React 1184 번들은 보존했다.

**실기기 상태:** 네이티브 WebView에서 OTA를 실제로 활성화한 뒤의 최종 확인은 사용자의 iPad에서 필요하다. 특히 `Profile → avatar → Take Photo`와 `Choose from Gallery`가 각각 카메라·Photos picker를 표시하는지 직접 눌러야 한다. 브라우저와 native simulation은 통과했지만 실기기 picker 성공을 대신하지 않는다.

**출시 차단 가능성이 높은 남은 문제:** 성경 번역 품질과 Quiz 보상 불일치는 콘텐츠·제품 QA 관점에서 여전히 중요하다. UI 수정만으로 이 두 문제를 해결했다고 간주해서는 안 된다.

**운영 인수인계:** Manus 계정 만료 전 [Manus 데이터 백업 페이지](https://manus.im/backup)에서 반드시 전체 task 데이터를 export해야 한다. 백업은 GitHub 소스 저장소와 별개의 작업이며, GitHub에 소스가 올라가 있어도 Manus 작업 기록·파일 export를 대신하지 않는다.

## References

[1]: https://teens-bible-94271.web.app/ "Teenz Bible Firebase Hosting URL"

[2]: https://teens-bible-94271.web.app/ota/latest.json "Teenz Bible current OTA manifest"

[3]: https://manus.im/backup "Manus data backup page"

[4]: https://firebase.google.com/docs/hosting "Firebase Hosting documentation"
