from pathlib import Path
p = Path('/home/ubuntu/teenz-bible-github-sync-v1153/app/assets/Profile-DeU5glts.js')
s = p.read_text(errors='ignore')
for needle in ['Join Crew', 'Create Crew', 'Enter invite code', 'Bible Crew 2026']:
    start = 0
    print(f'\n=== {needle} ===')
    count = 0
    while count < 5:
        i = s.find(needle, start)
        if i < 0:
            break
        print('INDEX', i)
        print(s[max(0, i-1200):i+1800])
        start = i + len(needle)
        count += 1
