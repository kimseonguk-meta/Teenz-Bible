import json, sys
# usage: save.py <Book>   reads fix entries from stdin JSON: {ch: {range_fixes:{}, edits:[{index,find,replace,reason}], flagged:[]}}
# Deep-merges into existing chapter entries (never replaces them).
book = sys.argv[1]
path = f'/home/hatch/workspace/teenz-fix/review/work/wip_{book}.json'
try: wip = json.load(open(path))
except FileNotFoundError: wip = {}
new = json.load(sys.stdin)
for ch, entry in new.items():
    cur = wip.get(ch, {})
    # normalize legacy 'fixes' key to 'edits'
    if 'fixes' in cur and 'edits' not in cur:
        cur['edits'] = cur.pop('fixes')
    for k, v in entry.items():
        kk = 'edits' if k == 'fixes' else k
        if kk in ('edits', 'flagged') and isinstance(v, list):
            cur.setdefault(kk, [])
            # append, avoiding exact duplicates
            for item in v:
                if item not in cur[kk]:
                    cur[kk].append(item)
        elif kk == 'range_fixes' and isinstance(v, dict):
            cur.setdefault(kk, {}).update(v)
        else:
            cur[kk] = v
    wip[ch] = cur
json.dump(wip, open(path,'w'), ensure_ascii=False, indent=1)
print(f'saved {book}: chapters {sorted(wip.keys(), key=int)}')
