from pathlib import Path
text = Path('/home/ubuntu/teenz-bible-github-sync-v1153/app/assets/index-GemFix1173.js').read_text()
for needle in ('FloatingPet.tsx', 'fixed z-[45]'):
    print('NEEDLE', needle)
    pos = 0
    count = 0
    while True:
        pos = text.find(needle, pos)
        if pos < 0 or count >= 8:
            break
        print('POS', pos)
        print(text[max(0, pos-1800):pos+1800])
        pos += len(needle)
        count += 1
