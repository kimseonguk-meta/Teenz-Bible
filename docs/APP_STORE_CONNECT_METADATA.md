# App Store Connect Metadata Handoff

이 문서는 Teenz Bible App Store listing을 다음 담당자가 이어서 관리할 수 있도록 작성한 **제출용 초안과 확인 항목**이다. 실제 App Store Connect의 현재 값과 Apple review 상태가 이 문서보다 우선한다. 이 저장소에는 App Store Connect API key, Apple signing certificate, provisioning profile, private OAuth key를 보관하지 않는다.

## Known identifiers

| Field | Value | Verification |
|---|---|---|
| App name | Teenz Bible | User-provided/current listing name |
| App Store ID | `6769426651` | User-provided; confirm in App Store Connect |
| Bundle ID | `com.teenzbible.app` | `native-ios` project |
| Current native version | `1.2.1` | Last handoff/build record |
| Last known build | `6` | Confirm latest status in App Store Connect |
| Minimum iOS | `15.0` | Native project setting |
| Website | https://teens-bible-94271.web.app/ | Firebase Hosting |

## Suggested listing copy

### Subtitle draft

`A Bible app made easier for teens`

### Promotional text draft

`Read the Bible in clear English or Korean, ask Bible AI your questions, listen along, collect gems, and explore Scripture with your crew.`

### Full description draft

`Teenz Bible helps teens discover the Bible in a way that feels clear, friendly, and easy to return to.`

`Read Scripture in simple English or Korean, choose a chapter, adjust the reading experience, listen with the Reader audio bar, and save verses that matter to you. When you have a question, Bible AI gives you a place to ask and explore. Bible Map connects passages with places, while Bible Meme and daily progress add a light, shareable moment to the day.`

`Build a reading habit with progress, streaks, quizzes, gems, and Gem Store items. Join or create a Crew, encourage friends with Cheer, and use the Report flow when community content needs attention. Profile tools help you manage your account and photo.`

`Teenz Bible is designed for young readers, families, youth groups, and anyone who wants a more approachable way to spend time in Scripture. The app interface is in English, with English and Korean Bible reading options.`

`Some features require an internet connection and sign-in. Community features should be used respectfully. Bible AI responses are for exploration and do not replace a pastor, parent, teacher, or trusted adult.`

### Keyword draft

`bible,teen,bible study,scripture,christian,devotional,reading,quiz,prayer,youth`

Before submission, check Apple’s keyword character limit and remove any duplicated words already present in the app name or subtitle. Do not claim features that are not currently live.

### Category and age review notes

Proposed primary category: **Reference**. A secondary category such as Education may be considered if it matches the current listing. The final age rating must be answered truthfully in App Store Connect based on the actual community, AI, user-photo, and content features. Because the app contains user-generated reactions/submissions and social interactions, the review notes should explain the Report flow, account controls, and how Apple reviewers can access a disposable test account.

## Screenshot plan

The repository contains app UI assets and design references, but it does not prove that an Apple-compliant screenshot set has already been uploaded to App Store Connect. Capture fresh screenshots on the supported iPad/iPhone sizes using the latest native build or the current live PWA only as a visual reference. Do not place fake device frames over screenshots unless Apple’s current submission rules allow the exact treatment.

| Slot | Screen to capture | Suggested caption |
|---|---|---|
| 1 | Home dashboard with progress and Continue Reading | `A clear place to start your reading habit` |
| 2 | Bible Reader showing English chapter text | `Read Scripture in clear, teen-friendly English` |
| 3 | Reader language/audio/bookmark controls | `Listen, adjust, and save what speaks to you` |
| 4 | Bible AI question and answer screen | `Ask questions as you explore the Bible` |
| 5 | Bible Map and discovered place | `Connect Bible stories with real places` |
| 6 | Crew/Ranking with Cheer | `Read together and encourage your Crew` |
| 7 | Gem Store with a successfully applied item | `Make progress feel rewarding` |
| 8 | Profile and account controls | `Keep your reading journey in one place` |

The final set must be captured after verifying that no loading spinner, error toast, stale theme UI, hidden modal, or black-screen regression appears. Never include real users’ names, emails, profile photos, or private notifications in App Store screenshots.

## Reviewer notes draft

`To test the app, use the supplied disposable test account or create a new account. From Home, open Continue Reading or Bible to view a chapter. Bible AI is available from Home. Crew and Ranking features require a signed-in account. The Report flow is available from a member’s More actions menu; Block is not exposed in the active UI. Profile photo actions require camera/photo permissions on a real device. Delete Account should be tested only with a disposable account and requires the confirmation safeguards.`

The owner should update this note with the actual review credentials only inside App Store Connect. Never commit those credentials to GitHub or place them in a chat message.

## Submission checklist

1. Confirm the latest App Store Connect listing, app name, bundle ID, version, build, review status, privacy answers, age rating, and export compliance.
2. Confirm the screenshots match the latest live UI and supported device dimensions.
3. Confirm Sign in with Apple, Google sign-in, camera/photo picker, Report, account deletion safeguards, and OTA behavior on a real iPad.
4. Confirm the privacy policy URL and any data collection declarations are current.
5. Upload only after the owner reviews the metadata and explicitly approves the submission.

## Important boundary

Web UI changes such as the 1.1.195 Bible Meme Share/Save fix are delivered through Firebase OTA and do not by themselves require a new App Store binary. Changes to Swift, Capacitor plugins, Info.plist permissions, native authentication, Camera/photo integration, icons, entitlements, or signing require a new Xcode Archive and a higher build number.
