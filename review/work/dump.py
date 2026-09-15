import json, sys
en = json.load(open('/home/hatch/workspace/teenz-fix/client/src/data/allBibleData.json'))
book = sys.argv[1]; chs = sys.argv[2].split(',')
ko_all = json.load(open(f'/tmp/ko_books/{book}.json'))
ko = {c['num']: c for c in ko_all}
e = {c['num']: c for c in en[book]}
for n in chs:
    n = int(n); c = ko[n]; ce = e[n]
    print(f'############ {book} ch {n} : {c["title"]} ############')
    print('--- KO ---')
    for i,(p,r) in enumerate(zip(c['paragraphs'], c['verseRanges'])):
        print(f'[KO {i} | rng={r}] {p}')
    print('--- EN ---')
    for i,(p,r) in enumerate(zip(ce['paragraphs'], ce['verseRanges'])):
        print(f'[EN {i} | rng={r}] {p}')
    print()
