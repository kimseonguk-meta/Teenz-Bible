# Teenz Bible — Successor AI Handoff Package Index

이 문서는 Hatch의 Coco 또는 다른 후속 AI가 Teenz Bible 작업을 시작할 때 사용하는 **첫 번째 읽기 순서**다. 모든 경로는 GitHub 저장소 root 기준이다.

## 1. 먼저 읽을 파일

| 순서 | 파일 | 읽어야 하는 이유 |
|---|---|---|
| 1 | `README.md` | 프로젝트 개요, 실제 기술 스택, 저장소 구조, 기능, 데이터, 배포, iOS 경계를 한 번에 확인한다. |
| 2 | `docs/TEENZ_BIBLE_MASTER_HANDOFF.md` | 운영 규칙, OTA 절차, Firebase Rules, native build 주의사항, 안전 경계를 확인한다. |
| 3 | `docs/AI_FINAL_SUMMARY.md` | 최신 OTA 1.1.195, 알려진 위험, 남은 iPad 검증 항목을 확인한다. |
| 4 | `docs/CONVERSATION_DECISIONS.md` | Theme 제거, Report flow, 콘텐츠 품질, 디자인 원칙 등 사용자 확정 결정을 확인한다. |
| 5 | `docs/APP_STORE_CONNECT_METADATA.md` | App Store 설명·keywords·screenshots·review notes 초안과 확인되지 않은 metadata를 구분한다. |
| 6 | `native-ios/README.md` | Capacitor/CocoaPods/Xcode workspace와 OTA/native 변경 경계를 확인한다. |
| 7 | `docs/ENVIRONMENT.md` | `.env`, service account, Apple key, OAuth secret의 보안 경계를 확인한다. |
| 8 | `docs/NEXT_AI_TROUBLESHOOTING.md` | 자주 발생하는 PWA·OTA·Firebase·Xcode 오류의 원인 분리 절차를 확인한다. |

## 2. 현재 기준선

| 항목 | 값 |
|---|---|
| GitHub | `https://github.com/kimseonguk-meta/Teenz-Bible` |
| Firebase project | `teens-bible-94271` |
| Live PWA | `https://teens-bible-94271.web.app/` |
| Latest OTA | `1.1.195` |
| iOS native | Version `1.2.1`, Build `6` |
| Web canonical source | `app/` |
| Stable React bundle | `app/assets/index-GemFix1184.js` |
| iOS workspace | `native-ios/ios/App/App.xcworkspace` |

## 3. 마지막 공개 수정

OTA 1.1.195에서 Bible Meme `Share`는 `Share Bible Meme` 모달을 열며, `Save`는 Photos/native share/download/open fallback을 사용한다. 공개 browser에서 runtime 1.1.195, Share modal, Save success notice를 확인했다. 실제 iPad의 native share sheet, Photos save, Profile camera/gallery picker는 iPad에서 별도 확인해야 한다.

## 4. 데이터 export와 보안

실제 운영 데이터가 있는 Firebase 서비스는 Firestore가 아니라 **Realtime Database**다. 2026-08-22에 생성한 전체 RTDB export는 로컬의 `private-exports/rtdb-export-2026-08-22.normalized.json`에만 보관한다. 사용자 데이터가 포함될 수 있어 `.gitignore`로 보호하며 GitHub에 올리지 않는다. 서비스 계정 JSON, Apple signing material, OAuth secret, password도 GitHub에 올리지 않는다.

## 5. 첫 실행 명령

```bash
gh repo clone kimseonguk-meta/Teenz-Bible
cd Teenz-Bible
git pull --ff-only origin main
git status --short
cat README.md
cat docs/TEENZ_BIBLE_MASTER_HANDOFF.md
cat app/ota/latest.json
```

사용자에게는 한국어로 한 단계씩 안내한다. 실제 Galaxy 또는 iPad 확인 전에는 모바일 기능을 해결했다고 단정하지 않는다. Firebase production deploy, OTA publish, Xcode Archive, App Store submit/release는 서로 다른 작업이며, 되돌리기 어려운 작업은 사용자 확인을 받은 후 실행한다.

## 6. 시작 프롬프트

```text
Teenz Bible 프로젝트를 이어서 작업해줘. GitHub main의 README.md, docs/TEENZ_BIBLE_MASTER_HANDOFF.md, docs/AI_FINAL_SUMMARY.md를 먼저 읽어줘. 현재 기준은 Firebase project teens-bible-94271, Live PWA https://teens-bible-94271.web.app/, OTA 1.1.195, iOS Version 1.2.1 Build 6이야. 이 프로젝트는 일반적인 원본 TSX 프로젝트가 아니라 Firebase Hosting에서 복구한 React/Vite static bundle + versioned runtime 구조야. app/이 웹 canonical source이고, native-ios는 Capacitor/CocoaPods WebView shell이야. 사용자에게 한국어로 한 단계씩 안내하고, 실제 Galaxy/iPad 검증 전에는 완료라고 단정하지 마. 먼저 현재 기준선과 위험요소를 요약한 뒤 내가 다음 문제를 설명할게.
```

## References

[1]: https://github.com/kimseonguk-meta/Teenz-Bible "Teenz Bible GitHub repository"
[2]: https://teens-bible-94271.web.app/ "Teenz Bible live PWA"
[3]: https://teens-bible-94271.web.app/ota/latest.json "Current OTA manifest"
[4]: https://firebase.google.com/docs/cli "Firebase CLI documentation"
[5]: https://capacitorjs.com/docs/ios "Capacitor iOS documentation"

[1] [2] [3] [4] [5]
