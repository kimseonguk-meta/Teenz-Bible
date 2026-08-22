# OTA 1.1.182 Bible Meme modal 검증

Home 탭에서 Bible Meme 이미지를 터치해 전체화면 상세 modal을 열었다. 실제 DOM은 다음 구조를 사용한다.

- `data-loc="client/src/pages/Home.tsx:567"`: X 닫기 버튼
- `data-loc="client/src/pages/Home.tsx:571"`: 하단 액션 rail
- `data-loc="client/src/pages/Home.tsx:572"`: Share·Save 2열 grid
- `data-loc="client/src/pages/Home.tsx:573"`: Share
- `data-loc="client/src/pages/Home.tsx:599"`: Save

OTA 1.1.182에서 측정한 결과:

- modal app shell: x=400, width=480
- rail: x=400, width=480, bottom=1297.75
- Share: x=412..609, y=1239.75..1281.75
- Save: x=625..822, y=1239.75..1281.75
- X: x=826..870, y=1237.75..1281.75

X·Share·Save의 bottom edge가 모두 1281.75px로 일치하고, X는 Share·Save rail의 오른쪽 끝에 4px 간격으로 정렬되었다. X는 modal 전체 viewport가 아니라 480px app shell 축에 맞춰 배치되었다. `__tbLoadingFallbackGuard` property는 false이고, `tb-native-stale-loading` class는 사용하지 않는다.

Meme modal을 X로 닫은 뒤 Bible 탭으로 이동했다. Bible 화면에서 Old Testament·New Testament, Genesis·Exodus·Leviticus 카드와 하단 탭이 정상 표시되었으며 검은 화면이나 Error Boundary는 확인되지 않았다.

Bible에서 Ranking으로 이동한 뒤 Global/My Crew, Week/All, Crew 영역과 랭킹 카드가 정상 표시되었다. Meme modal 전용 CSS 변경이 Ranking layout을 변경하지 않았고 검은 화면도 확인되지 않았다.

Ranking에서 Store로 이동한 뒤 My Items, Reader/Frames/Pets, My Collection 카드와 하단 탭이 정상 표시되었다. Meme modal 전용 정렬 변경으로 Store 화면이 검게 변하거나 깨지지 않았다.

Store에서 Profile로 이동한 뒤 Profile card, This Week, Reading Badges, Weekly Goal, My Crews, Reading Reminders와 하단 탭이 정상 표시되었다. Meme modal 전용 CSS 변경으로 Profile 화면이 검게 변하거나 Error Boundary가 발생하지 않았다.
