import json, re
BOOKS = ['Numbers','Deuteronomy','Joshua']
# crude/vulgar/slang candidates to eyeball in context
patterns = [
 r'씨발', r'좆', r'병신', r'지랄', r'개새끼', r'개자식', r'미친[놈년]', r'개화나',
 r'순삭', r'뒤졌다', r'뒤져', r'뒈져', r'죽어버려', r'꺼져', r'닥쳐', r'꺼지',
 r'염병', r'엿', r'썅', r'느금', r'니미', r'개같', r'개소리', r'헛소리',
 r'꼴값', r'꼴보기', r'쓰레기[놈년새]', r'인간쓰레기', r'또라이', r'돌아이',
 r'정신나간', r'미쳤냐', r'돌았냐', r'바보새끼', r'멍청이새끼', r'새끼들아',
 r'년놈', r'걸레', r'창녀', r'음란', r'색정', r'따먹', r'섹스', r'자위',
 r'바보천치', r'등신', r'멍청', r'쪼다', r'호구', r'빡대가리', r'대가리',
 r'뒤통수', r'뒷담', r'까불', r'나대', r'설쳐', r'지껄', r'헛짓', r'개판',
 r'아수라', r'난장판', r'개떡', r'망했다', r'쪽팔', r'창피', r'쪽팔려',
]
hits = []
for b in BOOKS:
    ko = json.load(open(f'/tmp/ko_books/{b}.json'))
    for c in ko:
        for i,p in enumerate(c['paragraphs']):
            for pat in patterns:
                if re.search(pat, p):
                    hits.append((b, c['num'], i, pat, p[:120]))
                    break
for h in hits:
    print(f'{h[0]} ch{h[1]} para{h[2]} [{h[3]}] :: {h[4]}')
print('TOTAL HITS:', len(hits))
