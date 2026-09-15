import json, re, sys
book = sys.argv[1]; num = int(sys.argv[2]); new = eval(sys.argv[3])
new_ko = eval(sys.argv[4]) if len(sys.argv)>4 else None
epath = 'client/src/data/allBibleData.json'
en = json.load(open(epath, encoding='utf-8'))
c = [c for c in en[book] if c['num']==num][0]
assert len(c['paragraphs']) == len(new), (book, num, len(c['paragraphs']), len(new))
c['verseRanges'] = new
json.dump(en, open(epath,'w',encoding='utf-8'), ensure_ascii=False, indent=2)
path = 'client/src/data/gospelDataKo.ts'
lines = open(path, encoding='utf-8').read().split('\n')
b0 = next(i for i,l in enumerate(lines) if l.strip() == f'"{book}": [')
bend = next(i for i in range(b0+1, len(lines)) if lines[i] == '  ],')
cs = next(k for k in range(b0, bend) if re.match(r'^\s+"num": %d,$' % num, lines[k]))
ce = next(k for k in range(cs, bend) if lines[k] in ('    },', '    }'))
ks = next(k for k in range(cs, ce) if '"verseRanges"' in lines[k])
vl = []
for k in range(ks+1, ce):
    t = lines[k].strip()
    if t in ('],', ']'): break
    vl.append(k)
nk = new_ko or new
assert len(vl) == len(nk), (book, num, len(vl), len(nk))
for li, rv in zip(vl, nk):
    lines[li] = f'        "{rv}",'
lines[vl[-1]] = lines[vl[-1]].rstrip(',')
open(path, 'w', encoding='utf-8').write('\n'.join(lines))
print(f'{book} {num} fixed')
