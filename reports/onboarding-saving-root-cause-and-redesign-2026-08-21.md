# Teenz Bible 온보딩 Saving 오류 재설계 기록

## 확인된 현재 동작

현재 `app/assets/index-GemFix1154.js`의 `Onboarding.tsx` 반 선택 저장 함수는 `ve=async(j,de)`이며, `A(true)`로 Saving 상태를 켠 뒤 다음 비동기 작업을 순차적으로 기다린다.

1. 현재 Firebase 사용자의 UID 확인 또는 인증 대기.
2. `users/{uid}` 저장.
3. 개인 반이 아니면 `groups/{class}/members/{uid}` 저장.
4. `userGroups/{uid}/{class}` 저장.
5. `users/{uid}/nickname`을 다시 읽어 저장 검증.
6. 환영 보너스 처리 후 `A(false)`와 `i(4)`로 완료.

예외가 정상적으로 발생하면 catch에서 오류 문구를 보여주고 `A(false)`를 실행한다. 그러나 인증·RTDB 작업이 오류 없이 무한 대기하면 catch와 finally까지 도달하지 않아 버튼이 영원히 `Saving...` 상태가 된다.

## 재설계 원칙

- 모든 원격 작업은 AbortController 기반의 제한 시간 안에서만 실행한다.
- 중복 클릭은 저장 중 상태로 차단하고, 모든 종료 경로에서 저장 상태를 해제한다.
- 원격 저장 성공 전에는 `teensBibleProfile`, `teensBibleGroups`, 환영 보너스를 확정 상태로 쓰지 않는다.
- 저장은 동일한 사용자·반 경로에 반복 실행해도 결과가 같은 idempotent PUT/PATCH 방식으로 처리한다.
- 실패 시 로컬에 잘못된 가입 완료 상태를 남기지 않고 JOIN 버튼을 다시 활성화해 재시도 가능하게 한다.
- 앱 재시작 후에는 온보딩 완료 키가 원격 저장 성공 뒤에만 존재하도록 한다.
- 성공 판정은 사용자 저장, 반 멤버 저장, userGroups 저장 후 읽기 검증을 모두 통과해야 한다.

## 직접 원인과 범위

Theme CSS 브리지는 이 저장 함수의 직접 원인이 아니다. 이번 문제는 Theme 작업과 무관하게 기존 온보딩 저장 함수에 남아 있던 무제한 await 결함이 특정 모바일 네트워크·인증 조건에서 다시 노출된 회귀다.

## 다음 구현

현재 core를 1.1.155로 cache-bust하고, 해당 `ve` 함수만 안전한 bounded REST 저장 함수로 교체한다. 기존 디자인·성경 데이터·Theme 로직은 건드리지 않는다.
