import json, re, sys
n = int(sys.argv[1])
en = json.load(open('client/src/data/allBibleData.json', encoding='utf-8'))
src = open('client/src/data/gospelDataKo.ts', encoding='utf-8').read()
def ko_ch(n):
    _b = re.search(r'"Psalms": \[(.*?)\n  \],', src, re.S).group(1)
    m = re.search(r'\{\s*"num": %d,(.*?)(?:\n    \},|\n    \}\s*$)' % n, _b, re.S)
    body = m.group(1)
    plist = re.findall(r'^        "(.*)",?$', body.split('"verseRanges"')[0], re.M)
    vraw = body.split('"verseRanges": [',1)[1].split('      ]')[0]
    vlist = [x.strip().rstrip(',').strip('"') for x in vraw.strip().split('\n') if x.strip()]
    return plist, vlist
c = [c for c in en['Psalms'] if c['num']==n][0]
kp, kv = ko_ch(n)
print(f'EN Ps{n}: {len(c["paragraphs"])} paras | ranges: {c["verseRanges"]}')
print(f'KO Ps{n}: {len(kp)} paras | ranges: {kv}')
for lang, plist in (('EN', c['paragraphs']), ('KO', kp)):
    print(f'##### {lang} #####')
    for i, p in enumerate(plist):
        print(f'[{i}]: {p}\n')
