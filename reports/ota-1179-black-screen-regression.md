# OTA 1.1.179 검은 화면 회귀

2026-08-21 웹에서 `/?ota=1179`로 Home을 연 뒤 Bible 탭을 클릭했다. Home은 정상적으로 보였지만 URL이 `/bible`로 바뀐 직후 화면이 거의 검게 변했고, Faithy Pet 이미지 일부만 보였다. 따라서 iPad 스크린샷의 현상은 iPad에만 국한되지 않고 1.1.179 공통 runtime에서 재현된다.

현재 가장 유력한 원인은 지속 Loading guard가 이전 Home의 `.tb-page`가 아직 DOM에 남아 있는 route 전환 순간에 새 Bible lazy route의 Loading fallback을 stale panel로 잘못 판단하여 숨기는 것이다. 그 결과 새 페이지가 로드되는 동안 사용자에게 보여줄 Loading UI가 사라져 검은 배경만 남을 수 있다.

## DOM 원인 확정

검은 화면 상태의 DOM을 직접 추적했다. Bible `.tb-page` 자체는 존재하지만, 조상인 전체 앱 shell `div.h-screen.flex...`에 `tb-native-stale-loading`, `display:none`, `visibility:hidden`이 적용되어 있었다. 기존 guard가 Loading span에서 위로 올라가며 처음 만나는 `h-screen flex`를 Loading panel로 오인했고, 실제로는 앱 전체 shell을 숨겼다. 따라서 1.1.179 black-out의 직접 원인은 명확하다: guard가 fallback의 가장 가까운 wrapper가 아니라 전체 shell을 선택했다.
