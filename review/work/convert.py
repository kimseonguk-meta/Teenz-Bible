import json, re, sys
from collections import defaultdict

# Converts work/wip_<Book>.json -> review/ko_patches_<Book>.json
# WIP edits use {index, find, replace, reason} substrings;
# final content_fixes use {index, old, new, reason} with full paragraphs.

BOOK = sys.argv[1]
NCH = int(sys.argv[2])

wip = json.load(open(f'/home/hatch/workspace/teenz-fix/review/work/wip_{BOOK}.json'))
src = json.load(open(f'/tmp/ko_books/{BOOK}.json'))

def parse_range(r):
    # returns True if valid single verse or range like "12" or "12-16"
    return bool(re.fullmatch(r'\d+(-\d+)?', str(r)))

chapters = {}
errors = []
for n in range(1, NCH + 1):
    c = str(n)
    e = wip.get(c, {})
    src_ch = src[n - 1]
    src_paras = src_ch['paragraphs']
    src_ranges = src_ch['verseRanges']

    # --- range_fixes ---
    rf = {}
    for idx_s, new_r in e.get('range_fixes', {}).items():
        idx = int(idx_s)
        if idx < 0 or idx >= len(src_ranges):
            errors.append(f"{BOOK} ch{c}: range_fix index {idx} out of bounds")
            continue
        if not parse_range(new_r):
            errors.append(f"{BOOK} ch{c}: invalid range value {new_r!r} at {idx}")
            continue
        old_r = str(src_ranges[idx])
        if old_r == str(new_r):
            print(f"  note: {BOOK} ch{c}[{idx}] range already {old_r} — skipping no-op")
            continue
        rf[str(idx)] = str(new_r)

    # --- content_fixes ---
    by_idx = defaultdict(list)
    for x in e.get('edits', []):
        by_idx[int(x['index'])].append(x)
    cf = []
    for idx in sorted(by_idx):
        if idx < 0 or idx >= len(src_paras):
            errors.append(f"{BOOK} ch{c}: edit index {idx} out of bounds")
            continue
        old = src_paras[idx]
        work = old
        reasons = []
        for x in by_idx[idx]:
            f, r = x['find'], x['replace']
            if f not in work:
                errors.append(f"{BOOK} ch{c}[{idx}]: find not in paragraph: {f[:60]!r}")
                continue
            if f == r:
                errors.append(f"{BOOK} ch{c}[{idx}]: find==replace (no-op)")
                continue
            work = work.replace(f, r, 1)
            reasons.append(x.get('reason', ''))
        if work == old:
            errors.append(f"{BOOK} ch{c}[{idx}]: no change applied")
            continue
        cf.append({
            "index": idx,
            "old": old,
            "new": work,
            "reason": " | ".join([r for r in reasons if r]),
        })

    flagged = list(e.get('flagged', []))
    ok = not rf and not cf and not flagged
    chapters[c] = {
        "range_fixes": rf,
        "content_fixes": cf,
        "flagged": flagged,
        "ok": ok,
    }

out = {"book": BOOK, "chapters": chapters}
if errors:
    print("ERRORS:")
    for er in errors:
        print(" ", er)
    sys.exit(1)
json.dump(out, open(f'/home/hatch/workspace/teenz-fix/review/ko_patches_{BOOK}.json', 'w'),
          ensure_ascii=False, indent=1)
ncf = sum(len(v['content_fixes']) for v in chapters.values())
nrf = sum(len(v['range_fixes']) for v in chapters.values())
nfl = sum(len(v['flagged']) for v in chapters.values())
nok = sum(1 for v in chapters.values() if v['ok'])
print(f"{BOOK}: {NCH} chapters, content_fixes={ncf} range_fixes={nrf} flagged={nfl} ok-clean={nok}")
