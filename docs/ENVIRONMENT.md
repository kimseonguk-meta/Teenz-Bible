# Teenz Bible 설정·환경 변수·비밀 관리

> **핵심 결론:** 2026-08-18 기준 Teenz Bible의 배포된 PWA, Firebase Functions, iOS 앱은 런타임에 `.env` 파일을 요구하지 않습니다. 따라서 필수 환경 변수 누락 때문에 앱이 실행되지 않는 상태는 아닙니다. `.env.example`은 로컬에서 Firebase CLI를 비대화형으로 실행해야 할 때만 사용하는 운영자 템플릿입니다.

## 1. 현재 GitHub에 추적되는 설정 파일

| 파일 | 용도 | GitHub 추적 여부 | 비밀값 여부 |
|---|---|---:|---:|
| `firebase.json` | Hosting, Functions, RTDB rules 배포 경로 | 예 | 아니오 |
| `app/database.rules.json` | 실제 RTDB 권한 규칙의 원본 | 예 | 아니오 |
| `functions/package.json` | Cloud Functions Node 20·Firebase dependencies | 예 | 아니오 |
| `native-ios/capacitor.config.json` | iOS bundle ID, webDir, updater·auth plugin 설정 | 예 | 아니오 |
| `native-ios/ios/App/App/Info.plist` | iOS 권한 설명 | 예 | 아니오 |
| `native-ios/ios/App/Podfile` | native pods (GoogleSignIn, Camera 등) | 예 | 아니오 |
| `native-ios/ios/App/App/GoogleService-Info.plist` | Firebase iOS client configuration | 예 | **서버 비밀 아님** |
| `.env.example` | 선택적인 local Firebase CLI credential 경로 템플릿 | 예 | 아니오 |

`GoogleService-Info.plist`의 Firebase client identifiers/API key는 iOS 클라이언트 설정용 값이다. iOS 앱에 포함되어야 하며, Firebase Console에서 API restrictions와 bundle ID restrictions를 관리해야 한다. Firebase Admin private key나 service account JSON과 혼동하지 않는다.

## 2. GitHub에 절대 넣지 말아야 할 항목

| 항목 | 예시 | 안전한 보관 위치 |
|---|---|---|
| Firebase service account | `*-firebase-adminsdk-*.json`, `*service-account*.json` | 소유자의 password manager 또는 접근 제어된 secret store |
| Apple signing material | `.p12`, `.p8`, `.mobileprovision`, `.cer` | Apple Developer 계정, Xcode Keychain, password manager |
| 개인 인증값 | OAuth client secret, personal access token, demo password | password manager 또는 해당 플랫폼의 secrets 기능 |
| Local Firebase state | `.firebase/` | 로컬 개발 컴퓨터에서만 유지 |

`.gitignore`는 위 파일 형식을 기본적으로 차단한다. 새 비밀 파일을 만들면 먼저 `git status`로 추적 대상이 아닌지 확인한다.

## 3. 로컬 Firebase 배포 인증

### A. 권장: Firebase CLI 로그인 세션

개인 Mac에서 Firebase 소유자 계정으로 로그인할 수 있다면 별도 `.env` 파일이 필요 없다.

```bash
npx --yes firebase-tools@latest login
npx --yes firebase-tools@latest deploy --only hosting --project teens-bible-94271
```

### B. 자동화/비대화형 환경: service account

자동화 환경에서는 `.env.example`을 복사해 `.env`를 만들고, service account JSON의 **절대 경로**만 지정한다.

```bash
cp .env.example .env
# .env 안의 GOOGLE_APPLICATION_CREDENTIALS 경로를 실제 로컬 경로로 변경
set -a
source .env
set +a
npx --yes firebase-tools@latest deploy --only hosting --project teens-bible-94271 --non-interactive
```

`GOOGLE_APPLICATION_CREDENTIALS`는 배포 CLI 인증에만 사용된다. 현재 Cloud Function `deleteOwnAccount`는 배포 후 Firebase/Google 런타임의 기본 서비스 계정을 사용하며 별도 환경 변수를 읽지 않는다.

## 4. 현재 환경 변수 감사 결과

| 검사 항목 | 결과 |
|---|---|
| GitHub `main`의 `.env`/`.env.example` | 이전에는 없음. 현재 안전한 `.env.example` 추가 |
| `functions/`의 `process.env`, `dotenv`, `functions.config()` 참조 | 없음 |
| GitHub에 추적된 service-account/private key 파일명 | 없음 |
| Firebase 배포 대상 | `firebase.json`으로 명시됨 |
| 현재 앱 런타임에 필요한 환경 변수 | 없음 |

## 5. 새로운 외부 API를 추가할 때

새 API 키를 도입할 때는 다음 원칙을 지킨다.

1. 브라우저 JavaScript에 서버 비밀키를 넣지 않는다.
2. 필요한 경우 Firebase Functions 또는 별도 backend에서 키를 사용한다.
3. 개발 환경에서는 `.env.example`에 **변수 이름과 설명만** 추가한다. 실제 값은 절대 넣지 않는다.
4. production secret은 Firebase/Google Cloud Secret Manager 또는 승인된 CI secret store에 넣는다.
5. GitHub push 전 `git diff --cached`와 `git status`를 확인한다.

## 6. 다음 작업자가 확인할 빠른 체크

```bash
git status --short
cat .env.example
cat firebase.json
node --check functions/index.js
```

> 비밀값이 노출되었다고 의심되면, Git history에서 지우는 것만으로 충분하지 않을 수 있다. 해당 키·service account·Apple key를 즉시 교체/폐기하고 접근 로그를 확인한다.
