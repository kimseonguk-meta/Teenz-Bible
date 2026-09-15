import json, re, sys

BOOKS = ['Numbers','Deuteronomy','Joshua']
en = json.load(open('/home/hatch/workspace/teenz-fix/client/src/data/allBibleData.json'))

def parse_range(r):
    if r is None: return set()
    m = re.match(r'^(\d+)(?:-(\d+))?$', r.strip())
    if not m: return None  # malformed
    a, b = int(m.group(1)), int(m.group(2) or m.group(1))
    return set(range(a, b+1))

out = {}
for b in BOOKS:
    ko = json.load(open(f'/tmp/ko_books/{b}.json'))
    ech = {c['num']: c for c in en[b]}
    book_out = {}
    for c in ko:
        n = c['num']; e = ech[n]
        probs = []
        kp, kv = c['paragraphs'], c['verseRanges']
        ep, ev = e['paragraphs'], e['verseRanges']
        if len(kp) != len(kv): probs.append(f'LENGTH MISMATCH: {len(kp)} paras vs {len(kv)} ranges')
        if len(ep) != len(ev): probs.append(f'EN LENGTH MISMATCH: {len(ep)} vs {len(ev)}')
        for i,p in enumerate(kp):
            if not p.strip(): probs.append(f'EMPTY KO para {i}')
            if '�' in p: probs.append(f'BROKEN CHAR KO para {i}')
        for i,p in enumerate(ep):
            if '�' in p: probs.append(f'BROKEN CHAR EN para {i}')
        seen = {}
        for i,p in enumerate(kp):
            s = p.strip()
            if s in seen: probs.append(f'DUP KO para {i} == para {seen[s]}')
            else: seen[s]=i
        # title check: assume index 0 with null range is § title
        # coverage comparison
        kcov, ecov = set(), set()
        malformed = []
        for i,r in enumerate(kv):
            s = parse_range(r)
            if s is None and r is not None: malformed.append((i,r))
            else: kcov |= (s or set())
        for i,r in enumerate(ev):
            s = parse_range(r)
            if s is not None: ecov |= s
        if malformed: probs.append(f'MALFORMED KO ranges: {malformed}')
        only_en = sorted(ecov - kcov); only_ko = sorted(kcov - ecov)
        if only_en: probs.append(f'VERSES IN EN NOT COVERED BY KO RANGES: {only_en}')
        if only_ko: probs.append(f'VERSES IN KO RANGES NOT IN EN: {only_ko}')
        book_out[str(n)] = probs
    out[b] = book_out

json.dump(out, open('/home/hatch/workspace/teenz-fix/review/work/mech.json','w'), ensure_ascii=False, indent=1)
# summary
for b in BOOKS:
    n_prob = sum(1 for v in out[b].values() if v)
    print(b, f'{n_prob}/chapters with mechanical flags')
