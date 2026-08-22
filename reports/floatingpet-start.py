from pathlib import Path
text = Path('/home/ubuntu/teenz-bible-github-sync-v1153/app/assets/index-GemFix1173.js').read_text()
needle = 'client/src/components/FloatingPet.tsx'
pos = text.find(needle)
print('first path position', pos)
for marker in ('function ', '=>{', 'N.forwardRef'):
    p = text.rfind(marker, 0, pos)
    print(marker, p)
start = max(0, pos-14000)
print(text[start:pos+3000])
