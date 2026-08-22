# OTA 1.1.180 검은 화면 수정 검증

Home에서 Bible 탭으로 이동한 직후 화면에는 전체 shell이 사라지지 않고 단일 `Loading...` fallback과 하단 탭이 표시되었다. 1.1.179의 검은 화면 상태와 달리, route transition 중 필요한 Loading UI가 보존되었다. lazy Bible 화면이 완료되는지 추가 대기 검증이 필요하다.

Bible lazy 화면이 완료된 뒤 Old Testament·New Testament, Genesis·Exodus 등 본문 카드와 하단 탭이 정상적으로 표시되었다. 전체 app shell은 더 이상 숨겨지지 않았다. 화면 상단에 단일 Loading fallback 문구가 남아 있지만, 검은 화면은 재현되지 않았고 Bible 본문은 접근 가능했다. 이 단일 Loading 표시가 별도 잔여 문제인지 console 수치로 추가 확인한다.

Bible에서 Ranking으로 이동했을 때 Ranking 헤더, Global/My Crew, Week/All, Crew 영역과 하단 탭이 정상 표시되었다. 단일 Loading 문구는 남아 있지만 전체 shell은 검게 숨겨지지 않았다. 다음으로 Store와 Profile 전환을 확인한다.

Ranking에서 Store로 이동한 뒤 Store header, My Items/Reader/Frames/Pets, My Collection 카드와 하단 탭이 표시되었다. 화면 배경은 어두웠지만 전체 app shell이 숨겨진 검은 화면은 아니었고 Store 콘텐츠가 정상 접근 가능했다.

Store에서 Profile로 이동한 뒤 Profile card, This Week, Reading Badges, Weekly Goal과 하단 탭이 정상 표시되었다. 단일 Loading 문구가 상단에 남아 있지만 전체 화면 black-out은 재현되지 않았다. Home→Bible→Ranking→Store→Profile 전환 경로에서 1.1.179의 전체 shell 숨김 현상은 1.1.180에서 재현되지 않았다.
