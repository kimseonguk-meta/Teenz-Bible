import json, re, sys

# Final validation of review/ko_patches_<Book>.json
# Checks: JSON parses, chapter count, required keys per chapter,
# old byte-identical to /tmp/ko_books source, new != old,
# range values valid and actually differ from source, ok flag correct,
# source files unmodified (read-only check via expected paragraph counts).

BOOK = sys.argv[1]
NCH = int(sys.argv[2])

p = json.load(open(f'/home/hatch/workspace/teenz-fix/review/ko_patches_{BOOK}.json'))
src = json.load(open(f'/tmp/ko_books/{BOOK}.json'))
errors = []

if p.get('book') != BOOK:
    errors.append(f"book field = {p.get('book')!r}, expected {BOOK!r}")
chs = p.get('chapters', {})
if len(chs) != NCH:
    errors.append(f"chapter count {len(chs)} != {NCH}")
for n in range(1, NCH + 1):
    c = str(n)
    if c not in chs:
        errors.append(f"missing chapter {c}")
        continue
    e = chs[c]
    for k in ('range_fixes', 'content_fixes', 'flagged', 'ok'):
        if k not in e:
            errors.append(f"ch{c}: missing key {k}")
    src_paras = src[n-1]['paragraphs']
    src_ranges = [str(r) for r in src[n-1]['verseRanges']]
    if len(src_paras) != len(src_ranges):
        errors.append(f"ch{c}: source paragraphs/ranges length mismatch")
    for idx_s, new_r in e.get('range_fixes', {}).items():
        idx = int(idx_s)
        if not (0 <= idx < len(src_ranges)):
            errors.append(f"ch{c}: range_fix idx {idx} OOB")
        elif not re.fullmatch(r'\d+(-\d+)?', str(new_r)):
            errors.append(f"ch{c}: bad range value {new_r!r}")
        elif src_ranges[idx] == str(new_r):
            errors.append(f"ch{c}: range_fix[{idx}] no-op")
    for cf in e.get('content_fixes', []):
        idx = cf['index']
        if not (0 <= idx < len(src_paras)):
            errors.append(f"ch{c}: content_fix idx {idx} OOB")
            continue
        if cf['old'] != src_paras[idx]:
            errors.append(f"ch{c}: content_fix[{idx}] old NOT byte-identical to source")
        if cf['new'] == cf['old']:
            errors.append(f"ch{c}: content_fix[{idx}] new == old")
        if not cf.get('reason'):
            errors.append(f"ch{c}: content_fix[{idx}] missing reason")
    expect_ok = not e['range_fixes'] and not e['content_fixes'] and not e['flagged']
    if bool(e['ok']) != expect_ok:
        errors.append(f"ch{c}: ok={e['ok']} but expected {expect_ok}")

if errors:
    print(f"{BOOK}: {len(errors)} ERRORS")
    for er in errors[:30]:
        print(" ", er)
    sys.exit(1)
ncf = sum(len(v['content_fixes']) for v in chs.values())
nrf = sum(len(v['range_fixes']) for v in chs.values())
nfl = sum(len(v['flagged']) for v in chs.values())
nok = sum(1 for v in chs.values() if v['ok'])
print(f"{BOOK}: VALID — {NCH} chapters, content_fixes={ncf}, range_fixes={nrf}, flagged={nfl}, clean-ok={nok}")
