import json, re, sys
book = sys.argv[1]; num = int(sys.argv[2])
en = json.load(open('client/src/data/allBibleData.json', encoding='utf-8'))
c = [c for c in en[book] if c['num']==num][0]
path = 'client/src/data/gospelDataKo.ts'
lines = open(path, encoding='utf-8').read().split('\n')
b0 = next(i for i,l in enumerate(lines) if l.strip() == f'"{book}": [')
bend = next(i for i in range(b0+1, len(lines)) if lines[i] == '  ],')
cs = next(k for k in range(b0, bend) if re.match(r'^\s+"num": %d,$' % num, lines[k]))
ce = next(k for k in range(cs, bend) if lines[k] in ('    },', '    }'))
ks = next(k for k in range(cs, ce) if '"verseRanges"' in lines[k])
kr = []
for k in range(ks+1, ce):
    t = lines[k].strip()
    if t in ('],', ']'): break
    kr.append(t.strip('",'))
ps = next(k for k in range(cs, ce) if '"paragraphs"' in lines[k])
ke = next(k for k in range(ps+1, ce) if '"verseRanges"' in lines[k])
kp, buf = [], ''
for k in range(ps+1, ke):
    t = lines[k].strip()
    if t in ('],', ']', '['):
        if buf: kp.append(buf); buf=''
        continue
    if t.startswith('"'):
        cc = t[1:]
        if cc.endswith('",') or cc.endswith('"'):
            cc = cc[:-2] if cc.endswith('",') else cc[:-1]
            kp.append(buf + cc); buf = ''
        else:
            buf += cc
if buf: kp.append(buf)
print(f'EN {book}{num}: {len(c["paragraphs"])}p ranges={c["verseRanges"]}')
print(f'KO {book}{num}: {len(kp)}p ranges={kr}')
N = int(sys.argv[3]) if len(sys.argv)>3 else len(c['paragraphs'])
for i in range(min(N, len(c['paragraphs']))):
    print(f'===== EN[{i}] r={c["verseRanges"][i] if i < len(c["verseRanges"]) else "?"} =====')
    print(c['paragraphs'][i][:1400])
    if i < len(kp):
        print(f'----- KO[{i}] r={kr[i] if i < len(kr) else "?"} -----')
        print(kp[i][:900])
