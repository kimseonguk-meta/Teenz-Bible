# Teenz Bible — App Store Connect 업로드 전 최종 점검표

**대상 빌드:** Version 1.2.1 / Build 6 (업로드용)  
**현재 확인된 상태:** iPad 직접 설치 빌드에서 앱 실행, Apple·Google 네이티브 브리지, Camera/Photo Library 연결, Profile 사진 sheet 및 Cheer viewport 보정이 반영됨.

> **결론:** 지금 바로 Archive를 만들기 전에 아래의 **출시 차단 항목 3개**와 **실기기 smoke test**를 마쳐야 합니다. 특히 Crew·Ranking처럼 다른 이용자의 이름, 사진 또는 Crew 이름이 노출되는 기능은 Apple의 사용자 생성 콘텐츠(UGC) 기준에 해당할 가능성이 있습니다.

## A. 출시를 막는 항목

| 우선순위 | 확인 또는 조치 | 완료 기준 | 이유 |
|---|---|---|---|
| **P0** | **UGC 안전장치 확인** | 다른 이용자의 이름, 사진, Crew 이름 등 이용자 생성 정보가 노출된다면, 이용자가 **신고**, **차단**, 그리고 운영자에게 연락할 방법을 제공해야 함 | Apple은 UGC/소셜 기능에 부적절한 게시물 필터, 신고 체계, 악성 이용자 차단, 공개 연락처를 요구함. 현재 앱에서 `Send Feedback`은 보이지만, **Report/Block이 실제로 있는지는 확인되지 않음**. [1] |
| **P0** | **계정 삭제를 테스트 계정으로 실제 실행** | Profile의 Delete Account가 계정과 연결 데이터를 삭제하고, 완료/예상 시간을 명확히 안내함 | 계정 생성 앱은 앱 안에서 전체 계정 삭제 시작을 제공해야 함. 단순 비활성화나 이메일 문의만으로는 부족함. Sign in with Apple 사용자는 토큰 revoke 처리도 점검해야 함. [2] |
| **P0** | **App Privacy 정보 재검토** | 실제 수집 데이터와 제3자 SDK(Firebase Authentication, Realtime Database, Storage, FCM 등)의 처리 내용을 App Store Connect에 사실대로 입력 | Apple은 개인정보 처리방침 URL과 실제 앱·제3자 코드의 데이터 처리 내역을 정확히 공개하도록 요구함. [3] |

## B. iPad 실기기 smoke test

테스트용 계정을 두 개 준비해 A와 B로 표기합니다. 각 행을 실제 iPad에서 통과해야 합니다.

| 기능 | 테스트 방법 | 통과 기준 |
|---|---|---|
| Apple 로그인 | A 계정 로그아웃 또는 앱을 삭제한 뒤 Apple 로그인 | 로그인 후 Profile, Reading Progress가 정상 표시됨 |
| Google 로그인 | 같은 방식으로 Google 로그인 | `Connecting to Google`에서 멈추지 않고 로그인 완료 |
| Camera | Profile → 아바타 → Take Photo | 시스템 카메라 권한 문구가 자연스럽게 나타나며 사진 선택 후 프로필에 반영됨 |
| Gallery | Profile → 아바타 → Choose from Gallery | 사진 라이브러리 선택 후 프로필에 반영되고 앱 재시작 뒤에도 유지됨 |
| Cheer | Ranking → 다른 사용자 → Cheer 및 Close | 팝업이 중앙에 표시되고 Close는 즉시 닫힘; Cheer 수신자는 Profile에서 응원·콘페티를 확인; 24시간 제한 안내 확인 |
| Crew | 새 계정으로 Create Crew 및 Join Crew | 폼이 중앙에 열리고 X/Cancel이 닫히며 생성·가입 결과가 Ranking에 반영됨 |
| Bible AI | Bible AI 진입 → 질문 입력 → Back | 응답 흐름, 키보드, 하단 입력창, Back 버튼이 모두 정상 |
| OTA 안정성 | 앱 완전 종료 → 재실행 → 30초 대기 → 다시 종료·실행 | Profile 사진 sheet와 Cheer UI가 구형으로 되돌아가지 않음 |
| Delete Account | **테스트 계정만** 사용해 실행 | 계정 삭제가 실제로 수행되고 재로그인 시 새 계정 상태 또는 접근 불가 상태 확인 |

## C. App Store Connect 입력값

| 항목 | 업로드 전 확인 |
|---|---|
| 버전/빌드 | **Version 1.2.1 / Build 6**. Build 5는 기존에 업로드했거나 설치 테스트에 사용했을 수 있으므로 새 upload에는 숫자를 올림 |
| 스크린샷 | 최신 UI를 사용. Apple 로그인, Bible AI, Ranking/Crew, Profile 중 실제 핵심 경험을 보여주며 Login/스플래시만 사용하지 않음 [1] |
| 설명·키워드 | 과장된 기능, 미구현 기능, 타 앱 이름, 가격 정보 없음. Teen 대상이므로 문구도 연령 적합하게 작성 |
| 지원 URL | 실제로 열리고 연락 가능한 지원 페이지/이메일을 제공. 앱 내 Privacy Policy·Send Feedback 링크도 모두 눌러 확인 [4] |
| Privacy Policy URL | 앱 내 문서, App Store Connect URL, 실제 데이터 처리 방식이 서로 일치 |
| App Privacy | 이메일·이름(로그인), 사용자 콘텐츠/프로필 사진(해당 시), 식별자·진단·알림 토큰 등 실제 수집 항목을 정확히 선언. Firebase·Capgo 등 제3자 SDK 포함 [3] |
| 연령 등급 | 성경의 성인 주제나 사용자 상호작용을 포함해 질문에 사실대로 답변. Kids Category를 선택하지 않는 한 `For Kids` 문구 사용 금지 [1] |
| App Review Notes | 로그인 방식, 데모 계정, 리뷰어가 Crew/Cheer를 확인하는 간단한 경로, Bible AI의 목적을 구체적으로 적음. 로그인 기능 앱은 리뷰에 사용할 계정/접근 방법을 제공해야 함 [1][4] |
| Export Compliance | 업로드 시 Apple 질문에 실제 사용 암호화 방식을 기준으로 답변. HTTPS/Firebase 표준 암호화만 쓴다고 자동으로 추정하지 말고, 표시되는 문구를 확인한 뒤 선택 |

## D. 권장 App Review Notes 초안

아래는 App Store Connect의 **Notes for Review**에 붙여 넣을 수 있는 초안입니다. 실제 데모 계정 정보만 교체합니다.

```text
Teenz Bible is a faith-based reading and encouragement app for teens.

Review account:
Email: [DEMO EMAIL]
Password: [DEMO PASSWORD]

Key review paths:
1. Sign in with Apple or Google is available on the welcome screen.
2. Profile > avatar opens Camera, Photo Library, and avatar options.
3. Ranking > select a member opens the profile sheet; tap Cheer to send an in-app encouragement.
4. Profile > Manage Crews supports creating or joining a Crew.
5. Bible AI provides faith-oriented Bible reading questions and answers.

The app contains no paid digital goods or subscriptions in this submission.
Support: [SUPPORT URL OR EMAIL]
Privacy Policy: [PRIVACY POLICY URL]
```

## E. 가장 안전한 진행 순서

1. 위 B의 실기기 테스트를 모두 완료한다.
2. **P0 UGC 안전장치**가 필요한지 확정한다. 필요하면 Report/Block과 운영 프로세스를 넣은 뒤 재테스트한다.
3. 테스트 계정으로 Delete Account를 실제 검증한다.
4. Xcode에서 Build를 **6**으로 변경한 뒤 Archive한다.
5. Organizer에서 App Store Connect로 업로드한다.
6. Processing 완료 후 App Privacy, 스크린샷, 지원 URL, Review Notes, 연령 등급, Export Compliance를 입력한다.
7. TestFlight에서 최소 한 번 설치해 로그인·사진·Cheer를 다시 확인한 뒤 Submit for Review 한다.

## References

[1]: https://developer.apple.com/app-store/review/guidelines/ "Apple — App Review Guidelines"
[2]: https://developer.apple.com/support/offering-account-deletion-in-your-app/ "Apple — Offering account deletion in your app"
[3]: https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy/ "Apple — Manage app privacy"
[4]: https://developer.apple.com/distribute/app-review/ "Apple — App Review"
