# Teenz Bible iOS — Release Provenance Log

"스토어에 지금 뭐가 올라가 있지?"라는 질문에는 이 파일이 답한다.
현재 소스 상태가 아니라, 각 바이너리가 만들어진 시점의 기록으로 적는다.
확인 안 된 것은 "미확인"이라고 적는다. 추측을 사실처럼 적지 않는다.

## 1.2.1 (build 6) — 2026-08-20
- Built by: Manus
- Web content: bundled snapshot (server.url 없음 — 앱에 구 디자인이 그대로 남은 것으로 확인됨, 2026-09-08)
- Auto-update on web deploy: NO

## 1.3.0 (build 7) — 2026-09-20
- Built by: 성욱, MacBook에서 `ios-release/scripts/bootstrap-ios.sh` 실행
- Source: repo commit `216c707` (capacitor.config.json에 `server` 키 없음 — `git show 216c707:...` 로 확인)
- Submitted: 2026-09-20 21:49 SGT경 App Store Connect "Ready to Submit"
- Approved: 2026-09-21 (Apple 리뷰 통과)
- Web content: bundled snapshot (2026-09-20 빌드 시점의 dist/public)
- Auto-update on web deploy: NO
- Note: 2026-09-22에 server.url 누락을 발견하고 repo config에 추가(커밋 `a560a03`) + gate 스크립트(`3c1f7b4`)를 만들었으나, 이후 새 바이너리 제출 없음. 따라서 스토어의 1.3.0은 bundled 빌드인 채로 유지됨.

## 1.4.0 (build 8) — planned
- Requirements: 반드시 server.url이 포함된 config로 빌드할 것 (`verify-release-config.sh` gate가 강제)
- bootstrap-ios.sh의 APP_VERSION/APP_BUILD를 1.4.0 / 8로 올릴 것
- 이 빌드부터 web deploy가 앱에 자동 반영됨
