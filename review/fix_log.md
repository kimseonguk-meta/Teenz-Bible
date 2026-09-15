# Teenz Bible 전수 검수 수정 로그 (2026-09-13~)

## 검수 계획 (성욱 2026-09-13 23:25 지시)
- Phase 1: 영어(EN) 전수 검수 — 창세기→요한계시록, 6개 항목, 오류 직접 수정
- Phase 2: 한국어(KO) 전수 검수 — EN 기준으로 KO 대조, 오류 직접 수정
- 컨펌/질문 없이 끝까지 진행, 완료 후 수정 내역 보고

## Phase 1 — EN 수정 기록
(장별/권별 기록)

## 2026-09-14 — E2a worker: Isaiah, Hosea, Joel, Amos, Obadiah, Jonah, Micah, Nahum, Habakkuk, Zephaniah, Haggai, Zechariah, Malachi (EN, MSG 대조 직접 검수)
- 대조 기준: Eugene Peterson, The Message (BibleGateway 직접 열람). 소스 JSON 무수정, Daniel 무수정 확인.
- 패치 파일: review/en_patches_<Book>.json (전 66권 중 13권). 모든 content_fixes.old는 소스에서 바이트 단위로 직접 추출·검증됨.

| 권 | 장 | range 수정 | content 수정 | flagged | 비고 |
|---|---|---|---|---|---|
| Isaiah | 66 | 157 | 127 | 13 | 밈/비속어·조롱 표현 제거(No cap, Yo, GOAT, sneaker-drop 비유, poop/pee 등), MSG divergence 수정(church→place of worship 등). 4개 장 clean. |
| Hosea | 14 | 44 | 4 | 0 | Hosea 7 중복 블록 정상 분할 확인 |
| Joel | 3 | 8 | 0 | 0 | 1, 3장 clean |
| Amos | 9 | 53 | 25 | 1 | provisional 오류 정정: 3:9 Ashdod 아님—MSG는 "Assyria"라 teen이 맞음(수정 불필요, flag 삭제). ch5 range 전면 재매핑, ch7 p14/p15는 중복이 아닌 v10/v11 분할(잘못된 content fix 삭제). "Big yikes"→Doom/Woe, "Yo" 제거 등. |
| Obadiah | 1 | 3 | 0 | 0 | |
| Jonah | 4 | 10 | 0 | 1 | Jonah 2 p1 "He prayed:" 설명 flag |
| Micah | 7 | 26 | 8 | 2 | Micah 5 p5/p6 바이트 동일 중복에 data-duplicate flag 추가 |
| Nahum | 3 | 21 | 15 | 3 | 바이트 동일 중복 문단(1: 2/3·5/6·7/8·11/12, 2: 2/3, 3: 5/6)은 data issue로 flag, 양쪽에 전체 MSG range 부여. ch3 p3=14-15, p4=15-17로 정정. "game over/cancelled/ghost" 제거, 3:15 mistranslation 수정. |
| Habakkuk | 3 | 9 | 0 | 0 | |
| Zephaniah | 3 | 0 | 0 | 0 | 전 장 clean |
| Haggai | 2 | 26 | 0 | 2 | 반복 dialogue opener 정당함 설명 |
| Zechariah | 14 | 66 | 0 | 4 | ch1 provisional range의 계통적 versification 오류 정정([8]=12, [9]=13-15, [10]=16-17, [11]=18, [12]/[13]=19, [14]=20, [15]=21). ch5 p0 "1-0"→"1" 유지. |
| Malachi | 4 | 24 | 0 | 0 | 4장 clean |

- 합계: range 447건, content 179건, flag 26건. 13개 파일 모두 JSON 파싱·장 수·형태·old 바이트일치·유효 range 검증 통과.
- Mojibake(�), 빈 문단, §-only 문단: 13권 전체에서 0건.

## 2026-09-14 — E2b worker: Jeremiah, Lamentations, Ezekiel (EN, MSG 대조 직접 검수)
- 대조 기준: Eugene Peterson, The Message (BibleGateway 직접 열람 + 전 105장 소스 직접 통독). 소스 JSON 무수정(sha256 f5b1a6bc…9ef9ad 확인).
- 패치 파일: review/en_patches_Jeremiah.json, en_patches_Lamentations.json, en_patches_Ezekiel.json — 기존 placeholder(구 스키마 {"Book": {...}}) 제거, E2a 컨벤션({"book","chapters"})으로 교체. 모든 content_fixes.old 바이트 단위 검증됨.
- 병합 과정에서 오염된 range 매핑 정정: Ezek 5(→1-2/3-4), Jer 9(전면 재매핑 13개), Jer 23(13-15·18-20·21-22·23-24·25-27·28-29·30-31), Jer 48(11-17부터 13개 구간 off-by-one 정정), Lam 4(7-8·9·10·11·12·14-15·16·17·18). 전 장 verse coverage gap 0 확인.

| 권 | 장 | range 수정 | content 수정 | flagged | 비고 |
|---|---|---|---|---|---|
| Jeremiah | 52 | 396 | 32 | 0 | 밈/저속 표현 제거(no cap, my guy, tea/spill the tea, screwed→doomed, dumb/stupid→worthless), lynch→plotting to kill me(18:9), poop→manure(9:15·25:28), oak→olive(11:8), 누락 복원(5:31·14:6), 따옴표 중복 제거(11:2·11:4), Israel→Judah(35:1). 6개 장 clean. 내부검토용 flag(Jer 5) 삭제. |
| Lamentations | 5 | 28 | 4 | 0 | beast mode→fury(2:1), for dinner/spit out 제거(2:5), favorite hangout→Temple(2:6), OMG→Oh man(4:1). 2개 장 clean. |
| Ezekiel | 48 | 412 | 20 | 1 | 밈/저속 표현 제거(no cap 8건, my guy 5건, yeet, Ayo, sexy clothes→finest, old goat→arrogant as he is 3건, drip, hookup tents, pornographic idols). ch17 p3/p4는 MSG 17:9-10 동일 본문 이중 paraphrase(data issue) — 양쪽에 전체 range 부여 후 para 4 삭제 권고 flag. ch32 p2/p4 "This is what the Lord GOD is saying" 반복은 각각 32:3·32:11 별개 oracle 도입부이므로 정상 반복으로 유지(삭제 안 함). clean 장 0. |

## 2026-09-14 — Phase 1 EN coordinator: final patch validation & normalization (Coco)
- All 10 review workers completed (A,B,C,C2,D,E,E2a,E2b,F,G). 66 patch files validated.
- Normalized 47 files to uniform schema {"book","chapters":{"N":{"range_fixes":{idx:"a-b"|null},"content_fixes":[{index,old,new,reason}],"flagged":[str],"ok":bool}}}; Daniel additionally carries book-level "title_fixes".
- Dropped 167 no-op range fixes (proposed value == current badge). Kept 8 worker-proposed badge->null fixes (6x § headers + Matthew 1:1 / Luke 3:7 editorial notes).
- Daniel: converted 149 list-style range entries to dict; ch4 title fix -> title_fixes; ch5 para5 unbalanced curly quote closed with ” (worker typed straight quote).
- Job 3: corrected worker off-by-one range indices 3,4,5 -> 2,3,4.
- 19 content fixes kept with synthesized reason (worker omitted reason); every content_fixes.old byte-verified against source.
- Final: 1189 chapters, range 6874, content 446, flagged 247, title 1. Source allBibleData.json untouched (sha256 f5b1a6bc73a235ea).
- Backups of original worker outputs: /tmp/en_patches_backup_orig/

## Phase 1 EN 적용 완료 (2026-09-14)

- 66권 1189장 전체 검수, The Message 원문 대조
- 패치: `review/en_patches_<Book>.json` 66개 (통일 스키마)
- 적용: range fix 6874건, content fix 446건(23개 문단은 다중 수정 병합 → 415개 문단 업데이트), Daniel 4장 title fix 1건
- Song of Solomon·Zephaniah는 clean (변경 없음)
- KO 파일(gospelDataKo.ts)은 손대지 않음 — EN/KO 문단 분할이 장마다 달라 index 매핑 불가, Phase 2에서 KO 문단 기준으로 별도 검수
- 64개 commit, main push 완료 (def038f)
- 남은 작업: flagged 247건 판단 → 적용, 이후 Phase 2 KO 전수 검수

## Phase 1 EN flagged 247건 처리 (2026-09-14)
- 결정 파일: review/flagged_decisions.json (402 ops: delete 161, insert 89, edit 75, keep 77)
- 주요 내용: 요한복음 등 빠진 본문 89구간 복원(The Message 기반 teen paraphrase), compiled-list+조각 중복 161건 삭제, "God's Pinky Promise"→"God's Covenant Promise" 등 톤 수정, 시편 148 teen voice 재작성, 아가 5:4 저속 표현 수정
- Textual variant(마 17:21 등)는 The Message가 생략하므로 제외 유지
- 후속 3건 직접 처리: 신명기 26:5 badge 14→15, 요나 2:1 기도 끝 "no cap" 제거, 누가복음 5:14 빠진 본문 복원
- commit 후 main push 완료

## Phase 2 KO 전수 검수 (2026-09-14, Coco 직접 검수)
- 기준: 최종 EN(allBibleData.json, Phase 1 적용 완료본). KO 원문(/tmp/ko_books) 무수정, 패치 JSON만 생성.
- "ok": 검수 완료 의미로 132장 전체 통일(true).

### Lamentations (5장) — 수정 완료
- range 28건(EN range와 불일치 28건을 EN 의미 대응으로 통일), content 3건, flagged 0건. 5장 전부 ok=true.
- 1:2 '위로해 주는 놈'→'위로해 주는 애', 1:21 '저놈들도'→'저들도'(바깥 큰따옴표 보존 정정), 2:22 '공격할 놈들'→'공격자들'(바깥 큰따옴표 보존 정정).

### Ezekiel (48장) — 패치 생성 + 검증 완료
- `review/ko_patches_Ezekiel.json`: 48장 전부 포함, ok=true 통일.
- range 410건: 전 장 1:1 의미 대응 확인 후 EN range로 통일(17장 제외). 17장은 KO 11문단/EN 10문단 — KO[3]+KO[4]가 EN[3](겔17:9-10)과 중복이므로 KO[0..3]→EN[0..3], KO[5..10]→EN[4..9] 매핑, KO[4]는 flagged(문단 삭제 권고, 패치 규격에 삭제 기능 없음).
- content 46건(46개 문단, 일부 문단 다중 수정): 오역 수정(19:5-8 '나무 칼'→'나무 목고랑'(EN wooden collar), 20:27-29 '창녀의 언덕'→'이교도의 언덕'(EN Pagan Hills), 34:12-17 '힘센 놈들은 못된 짓 못하게 감시'→'힘센 애들도 이용당하지 않게 잘 돌볼 거야'(EN 의미 정반대였음), 45:1-4 '23m 완충 지대'→'230m'(EN 750-foot)); 36장 '하느님' 22회→'하나님'(에스겔 전 장 '하나님' 사용 중 36장만 불일치); EN에 없는 한국어 추가 조롱·저속 표현 최소 완화(똥고집→고집불통, 파리처럼 쓰러질→삭제, 머리 빈 예언자들→아무것도 모르는 예언자들, 징징대→불평해, 시궁창→삭제, 칼맛→칼을 겪게, 쩌리→밑바닥에 있던 자들, 가짜뉴스→거짓 환상, 삥 뜯는→등쳐먹는, 꿀 빨 일→돈 쓸어 담을 일, 손 좀 봐주려고→잡으러 간다, 머리에 피도 안 마른 게!→삭제, 맞짱→상대할 거임, 턱주가리→턱, 헤롱대→빈둥대, 자빠졌고→있고, 지껄였으니까→말했으니까, 꼰대→거만한 왕/파라오(2건), 늙은 염소 같은 놈→인간, 로드킬→끝장, 개엄청/개무시→정말 엄청/완전 무시, 빡빡하고→가혹하고, 내 캐릭터→그 이름, 놈들→사람들/자들(다수), 떨거지 군대→군대, 박살→파괴, 잡일→일(2건), 발정 난 말→막무가내로 날뛰는 종마(EN stallion 비유 유지), 제대로 봤냐→잘 봤지).
- 성적 비유·심판 폭력 자체는 유지(6장 sex-and-religion shrines=EN 동일, 16장 brothel/prostitution=EN 동일, 23장 종마 비유=EN 동일, 35장 심판 무게 유지).
- flagged 1건: 17장 KO[4] 중복 문단 삭제 권고.
- 검증: 48장 전부 포함, old 전건 원문 바이트일치, index 유효, reason 전건 존재, range값 전건 EN 일치, 미커버 range diff 0건.

### Daniel (12장) — 패치 생성 + 검증 완료
- range 149건, content 11건, flagged 0건. 12장 전부 ok=true.
- 주요 수정: '쩐다 하는 사람들'→'잘나가는 사람들', '놈/놈들'→'사람/자', '열폭'→'질투가 나서', '갓벽'→'완벽', '피에 굶주려서'→'승리에 도취돼서'(EN에 없는 잔인함 추가 삭제), 다니엘을 향한 '괜찮은 놈'→'괜찮은 사람'.

### Hosea (14장) — 패치 생성 + 검증 완료
- range 39건, content 8건, flagged 1건. 14장 전부 ok=true.
- 주요 수정: '꼬실 거야'→'말 걸 거야', '놈' 계열 완화, EN에 없는 '돼지처럼' 삭제, '개엄청'→'엄청', '까마귀 떼'→'새 떼'(EN 의미 맞춤), '쩌는 나라'→'대단한 나라'.
- flagged 1건(구조): 7장 KO[1]과 KO[2] byte-identical 중복. KO[1]이 EN[1](r=3-4)+EN[2](r=5-7) 합본 번역이므로 KO[1] range 3-7, KO[2] 삭제 권고. 9장은 중복이 아니라 합본(KO[1]→2-6, KO[2]→7-9, KO[3]→10-13).

### Joel (3장) — 패치 생성 + 검증 완료
- range 8건, content 1건, flagged 0건. 3장 전부 ok=true.
- 2장 '피에 굶주려 싸울 준비가 된 무적의 군대'→'싸울 준비가 된 무적의 군대'(EN에 없는 잔인함 추가 삭제, 심판 자체는 유지).

### Amos (9장) — 패치 생성 + 검증 완료
- range 60건, content 5건, flagged 1건. 9장 전부 ok=true.
- 주요 수정: '놈/놈들'→'자/너네', '아오안'→'신경도 안 쓰는'. 심판 내용은 유지.
- flagged 1건(구조): 9장 KO[1]과 KO[2] byte-identical 중복, KO[2] 삭제 권고. 삭제 후 의미 대응: KO0→EN0, KO1→EN1, KO3→EN2, KO4→EN3, KO5→EN4, KO6→EN5, KO7→EN6, KO8→EN7, KO9→EN8, KO10→EN9 (range 수동 반영).

### Obadiah (1장) — 패치 생성 + 검증 완료
- range 4건, content 0건, flagged 0건. ok=true.
- KO 6문단/EN 5문단은 중복이 아니라 첫 메시지가 둘로 분리된 구조: KO0→EN0 도입, KO1→EN0 인용문(range 1), KO2→EN1(range 2-4), KO3→EN2(range 5-14), KO4→EN3(range 15-18), KO5→EN4(19-21 유지).

### Jonah (4장) — 패치 생성 + 검증 완료
- range 10건, content 4건, flagged 0건. 4장 전부 ok=true.
- 주요 수정: '재앙을 몰고 온 놈'→'사람', '뭐 하는 놈이야?'→'뭐 하는 사람이야?', '이놈이 하나님한테서'→'이 사람이', '쌩까고 나가버렸어'→'성큼성큼 나가버렸어'(EN stormed off 의미 맞춤).
- 2장은 KO 4문단/EN 3문단: KO[0] 기도 도입(r=1), KO[1] '기도 내용은 이랬대'(r=2), KO[2] 기도 본문(r=2-9), KO[3] 물고기 토해냄(r=10).

### Micah (7장) — 패치 생성 + 검증 완료
- range 22건, content 9건, flagged 1건. 7장 전부 ok=true.
- 주요 수정: '놈들'→'자들/사람들' 계열 완화, '이러고 자빠졌네'→'이러고 있네'(EN에 없는 저속함 삭제), '쩌리'→'작아 보이는'(EN towering over 의미 맞춤), '개무시'→'무시', '양아치들'→'허세 부리는 자들', '걱정 ㄴㄴ'→'걱정 마', '참교육'→'확실하게 막아서'(EN 의미 맞춤), '개슬프다'→'너무 슬프다'.
- flagged 1건(구조): 5장 4쌍(byte-identical) 중복 — KO[2]/KO[4]/KO[6]/KO[8] 삭제 권고. KO[1]→2-4(베들레헴), KO[3]→5-6(앗수르), KO[5]→7(이슬 비유), KO[7]→8-9(사자), KO[9]→10-15.
- 7장 '바퀴벌레처럼 빌빌 기게'는 EN snakes and bugs와 비교해 추가 조롱으로 보기 어려워 유지.

### Nahum (3장) — 패치 생성 + 검증 완료
- range 18건, content 4건, flagged 3건. 3장 전부 ok=true.
- 주요 수정: '더 못한 놈'→'더 못한 자', '이놈은 이제 끝났어'→'이제 끝났어', '개살벌'→'완전 살벌', '꿀템'→'공짜'(EN free-for-all 의미 맞춤), '이 창녀 같은 니느웨야'→'니느웨야'(EN에 없는 조롱 추가 삭제), '개똥'→'오물'(EN filth 의미 맞춤), '전시품: 창녀'→'전시품: 배신자'(EN Unfaithful on Display 의미 맞춤).
- flagged 3건(구조): 1장 KO[3](=KO[2] 중복), 2장 KO[3](=KO[2] 중복), 3장 KO[6](=KO[5] 중복) 삭제 권고. 참고: 나훔 1장의 다른 중복 쌍(KO[5]/[6], [7]/[8], [11]/[12])은 EN 원문 자체의 중복 문단을 충실히 따른 것이므로 삭제 대상 아님.

### Habakkuk (3장) — 패치 생성 + 검증 완료
- range 9건, content 6건, flagged 0건. 3장 전부 ok=true.
- 주요 수정: '피에 굶주린 늑대'→'배고픈 늑대'(EN hungry wolves), '놈'→'자/사람', '등쳐먹'→'속여먹'(EN ripping people off), '개박살'→'박살'.

### Zephaniah (3장) — 패치 생성 + 검증 완료
- range 9건, content 2건, flagged 0건. 3장 전부 ok=true.
- 주요 수정: '썩어빠진 세상'→'썩은 세상', '썩은 인간들'→'썩은 사람들', '고개를 저으며 지나감'(EN shake their heads 의미 맞춤).
- 구조: 3장은 중복이 아니라 EN 장절이 한 문단에 둘씩 들어간 분할 구조(KO[7]/KO[8] 모두 EN[7] r=18-20, KO[1]→r=6, KO[2]→r=7 등) — byte-identical 아님을 확인.

### Haggai (2장) — 패치 생성 + 검증 완료
- range 26건, content 2건, flagged 0건. 2장 전부 ok=true.
- 주요 수정: '삐까뻔쩍'→'화려하게'(EN splendor), '걔네'→'그들이'.

### Zechariah (14장) — 패치 생성 + 검증 완료
- range 59건, content 10건, flagged 0건. 14장 전부 ok=true.
- 주요 수정: '씹고'→'무시하고', '행동 개시'→'움직인다'(EN 의미 맞춤), '꿀잠'→'깊은 잠', '짱짱'→'힘이 센', 'ㄴㄴ'→'아니야', '꼴랑'→'고작', '쩐다/쩌는'→'대단한/유명한'(EN great/famous), '꿀'→'좋다'(EN Sweet).
- 구조: 8장 '만군의 주 하나님의 메시지.' 반복은 EN의 'A message from the God of the Angel Armies:' 반복과 일치하는 정상 구조.

### Malachi (4장) — 패치 생성 + 검증 완료
- range 23건, content 6건, flagged 0건. 4장 전부 ok=true.
- 주요 수정: '은행원이나 국회의원'→'총독'(EN your governor 의미 맞춤 — 실질적 오역 수정), '똥을 처발라'→'더러운 쓰레기를 처발라'(EN nasty, rotten trash), '놈들'→'자들', '찐'→'확실함', '걔네'→'그들이'.

## Phase 2 KO 진행 중 메모 (2026-09-14)
- KO verseRanges에 문자열 "null" 136건 발견 (진짜 null이 되어야 함): Matthew 111, Ezra 9, 1Cor 3, 1John 3, 2Chr 3, Joshua 3, 2Sam 2, 1Chr 1, Ruth 1 → 패치 적용 단계에서 일괄 변환 예정
- Revelation: 전반부 격식체(합니다체) vs 후반부 비격식체 혼재 → 100+ 문단 전면 재작성 필요 (flagged). 별도 작업 예정
- Revelation 7장: 144,000 지파 목록에 시므온·레위·잇사갈 누락 → flagged, 적용 단계에서 확인
- Hebrews 12장 p5/p6 range 겹침 → 적용 단계에서 재검증

## Phase 2 KO 적용 완료 (2026-09-14)
- 66권 1189장 전체를 최종 EN과 대조 검수, 패치: review/ko_patches_<Book>.json 66개
- 적용: range fix 7258건, content fix 1756건(12개 문단은 다중 수정 병합 → 1741개 문단 업데이트), literal "null" badge 136건 → null
- 주요 수정: 치명적 오역(출 8:8 정반대 의미, 에 2장, 말 2장, 삿 3:5/17:5, 왕하 20장), 저속 표현 순화(개- 접두사, 놈/놈들, ㅇㅋ, 쫄, 빡- 계열 등), EN에 없는 KO 덧붙임 삭제(시 140편 창작 이미지 등)
- 64개 책별 commit + null-badge sweep, main push 완료 (35c3711)
- 남은 작업: flagged 612건 판단 → 적용, 계시록 합니다체→해체 전면 재작성, 최종 build·배포·production QA

## Phase 2 KO flagged 적용 완료 (2026-09-14)
- ko_flagged_decisions.json 991건 전수 적용 (701장): 장 제목 555건 설정, 중복 문단 155건 삭제, 누락 복원 67건 삽입, 톤/오역 29건 수정, 헤더 위치 이동, 배지 4건 수정, keep 86건
- ko_revelation_rewrite.json 88건 적용: 계시록 1-7, 11-14장 합니다체/해요체 → 해체 전면 재작성
- old byte-identical 전수 검증, paragraphs/verseRanges 길이 일치, esbuild parse OK
- 책별 43개 commit, main push 완료 (dd509c7)
- EN-side 이슈 45건 발견 (KO 범위 밖): holy→honored 오번역 138곳, EN 배지 오류 42건, 민수기 3:32 누락 → 별도 EN follow-up으로 처리 예정

## Phase 1 EN follow-up 적용 (2026-09-14, commit 41c4fc8)
- holy→honored: "138곳" 추정치는 부풀려진 것으로 판명 — 구약 대부분은 The Message 원문 자체가 honored라서 유지(43곳 verified keep), 신약 중심으로 실제 오역 97건 수정 (히 9:2 Holy of Holies, 계 16:1 Temple, 벧전 2:9 holy people, 계 13/17/21 생명책 표현 등)
- EN 배지 79건 수정 (욥 1,2,4,6,29 / 잠 23,30 / 전 8 / 사 6 — 욥 2·전 8의 +1 shift, 잠 23의 격언번호/절번호 혼동 포함)
- 누락 복원 2건 삽입: 민수기 3:32 (엘르아살), 살후 3:13
- 적용 중 allBibleData.json trailing-comma 파손 발견 → strict JSON 복원 후 vite build 성공 확인
- build ✓ (dist/public 생성)

## KO 배지 재조정 (2026-09-14, commit +1)
- 604건 in-text 범위 중복 제거 후, 배지와 in-text 범위가 불일치한 108건 전수 재검증 (The Message 대조)
- 97건 배지 수정 (86건 in-text 범위 채택, 12건 기존 배지 유지, 10건 제3의 값, Rev 15:4 보너스 1건)
- 108건 in-text prefix 제거 완료 → KO 본문에 "1-21-2"식 중복 렌더링 해소
- Rev 1:4 배지 6-8→6-7 (v8 알파오메가 선언이 별도 문단으로 분리되면서 겹침 해소)

## EN 장 제목 수정 (2026-09-14)
- Hebrews 9: "The Ultimate honored Access" → "The Ultimate Holy Access" (The Message 본문이 "Holy Place"/"Holy of Holies" 사용; "honored Access"는 어색한 영어)
- 2 Kings 9: 빈 제목 → "Jehu's Takeover" (예후 기름부음·쿠데타 내용)

## KO 존댓말 스캔 분석 (2026-09-14) — 수정 없음으로 결론
- 15,926 문단 스캔, 6,534건 패턴 매칭(4,151 문단)
- 분석 결과, KO의 경어 사용은 일관된 의도적 스타일:
  1. 내레이션: 십대 반말 ("자, 이게 먼저 있었던 일이래")
  2. 하나님/예수님 동작: 경어 (만드셨대, 말씀하셨대 — 경외 표현으로 자연스러움)
  3. 인용문 속 대화: 상황에 맞는 높임말 (하나님께 말할 때 "숨었습니다")
- 합니다체 537건도 전부 인용문 내 대화체로 문맥상 적절
- 무분별하게 반말로 통일하면 오히려 부자연스러워지므로 수정하지 않음

## 저속 표현 2차 감사 수정 (2026-09-14)
- 총 22건 수정 (EN 15,341문단 + KO 15,926문단 전수 스캔)
- KO 17건: 개고생 5건→몹시 고생/진짜 고생/애쓰고, 구라 6건→거짓말, 머저리 2건(렘 4:22는 하나님 말씀 중이었음)→순화, 꼴좋다→자업자득이지, 개나 줘버린대→내팽개쳐버린대, 개대단한→엄청난, 똥칠→깎아내릴
- EN 2건: Luke 8 "naked, insane guy"/"once-insane guy"→중립적 서술 (정신질환자 조롱 해소)
- 3건: "Pinky Promise" 잔재→"Covenant Promise/언약" (Gen 17 EN, Ps 132 EN+KO 제목)
- 성폭력·자살 희화화: 0건 (모두 엄숙한 톤 확인)

## § 소제목 구조 정리 (2026-09-14, commit ad9b6c0)
- EN 18건: "§헤더\n본문" 형태로 한 문단에 합쳐져 있던 소제목을 분리 — §헤더 단독 문단(badge null) + 본문 문단(기존 badge 유지)
  - Genesis 8: The Water Goes Down(4-5), A Whole New World(13-14), A Promise from God(20-21)
  - Genesis 16: Hagar on the Run(7-8)
  - Genesis 49: Jacob's Last Words(1-2), Reuben(3-4), Simeon & Levi(5-7), Judah(8-12), Zebulun(13), Issachar(14-15), Dan(16-18), A Prayer(18), Gad(19), Asher(20), Naphtali(21), Joseph(22-26), Benjamin(27), The End of an Era(28)
  - 원인: Bible.tsx의 § 문단은 <h3>로 렌더링되며 para.slice(1) 전체가 볼드 헤더가 됨 → 본문까지 볼드로 보이던 렌더 버그
  - 분리 후 EN § 문단 609개 전수 확인: badge null + 개행 없음 (KO는 344개 전부 이미 정상)
- KO 1건: Revelation 16 p1 "일곱 재앙을 쏟아붓다"(badge "1" 중복) → "§일곱 재앙을 쏟아붓다"(badge null). EN Rev 16에는 없는 KO 전용 소제목이었음
- 부수 효과: quiz 정답 문단 탐색(verseRanges 기반)이 §헤더를 더 이상 매칭하지 않음
