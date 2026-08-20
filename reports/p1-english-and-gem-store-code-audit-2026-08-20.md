# P1 영어 성경·Gem Store 코드 감사

## 영어 성경 감사

영어 데이터는 66권, 15,667개 문단 레코드로 추출해 단어 경계 기준으로 검사했다. 명백한 profanity 목록(`fuck`, `shit`, `bitch`, `asshole`, `dick`, `cunt`, `bullshit`, `goddamn` 등)은 실제 단어로 발견되지 않았다. 이전 단순 substring 검사에서 `Mushite` 안의 `shit`, `literal` 안의 `lit` 같은 오탐이 생길 수 있으므로, 이번 결과는 단어 경계 검사를 기준으로 한다.

실제 발견된 것은 욕설이 아니라 청소년 대상 번역에서 사용할 수 있는 현대식·구어식 표현이다. 우선 검토 대상은 `legit` 152개 문단, `dude` 143개, `chilling` 106개, `ghosted` 67개, `bro` 55개, `vibe/vibes` 68개, `roast` 23개, `real talk` 16개, `no cap` 14개, `hangout` 11개, `glow-up` 10개, `low-key` 9개 등이다. `gonna`, `gotta`, `totally`, `super`, `awesome` 등은 빈도가 높지만 profanity가 아니며, 앱의 중학생 친화적 말투라는 제품 의도와 함께 판단해야 한다.

현재 영어 데이터에 대해 자동 일괄 치환은 하지 않았다. `ghosted`가 어떤 문맥에서는 `ignored`, 다른 문맥에서는 `avoided`가 되어야 하고, `legit`도 문장에 따라 `genuine`, `true`, `valid`, `really`가 달라질 수 있기 때문이다. 문맥별 후보는 `reports/english-slang-context-audit-2026-08-20.md`에 기록했다.

## Gem Store 코드 감사

현재 상품 카탈로그는 Theme 13개, Reader Background 13개, Frame 14개, Pet 14개로 구성되어 있다. 각 카테고리에는 기본 무료 항목이 있고 나머지는 Gem 가격을 가진다. Mystery Box 가격은 50 Gems이며, 30% 확률로 15·25·35·50·65·80 Gems 중 하나를 지급하고, 나머지 경우에는 아직 보유하지 않은 유료 아이템을 무작위 지급한다. 모든 항목을 이미 소유한 경우 50 Gems를 지급하는 fallback도 있다.

| 카테고리 | 상품 수 | 가격 범위 | 현재 코드상 적용 방식 |
|---|---:|---:|---|
| Themes | 13 | 무료–250 Gems | `documentElement` CSS variable과 `data-tb-theme` 적용 |
| Reader Backgrounds | 13 | 무료–170 Gems | 장착 상태의 reader background를 읽기 화면에 반영 |
| Frames | 14 | 무료–95 Gems | Profile/avatar 표시 영역의 frame class 적용 |
| Pets | 14 | 120–220 Gems | 장착 Pet 상태와 Pet 표시 영역에 반영 |
| Mystery Box | 1 | 50 Gems | Gem reward 또는 미보유 item reward |

구매 함수는 먼저 Gem 잔액을 확인하고, 잔액이 부족하면 `Not enough gems!`을 반환한다. 이미 `teensBibleInventory`의 `ownedItems`에 있는 id는 `Already owned!`으로 거부하며, 성공 시 잔액을 차감하고 보유 목록을 저장한다. 장착 상태는 `teensBibleEquipped`에 저장하고 `equipped-changed` 및 화면 갱신 이벤트를 발생시킨다. Gem 잔액은 `teensBible` localStorage의 `gems` 필드에 저장된다.

코드 검토만으로는 실제 기기의 시각적 적용, 앱 재시작 후 복원, iOS WebView의 저장소 유지, Mystery Box 애니메이션 종료 여부를 확정할 수 없다. 따라서 다음 P1 단계는 Galaxy PWA와 iPad에서 실제 구매·장착·재시작 테스트를 수행하는 것이다.

## References

1. [Teenz Bible repository](https://github.com/kimseonguk-meta/Teenz-Bible/)
2. [Teenz Bible live PWA](https://teens-bible-94271.web.app/)
