from pathlib import Path
text = Path('/home/ubuntu/teenz-bible-github-sync-v1153/app/assets/index-GemFix1173.js').read_text()
for needle in ('createRoot', 'ErrorBoundary', 'FloatingPet.tsx:719'):
    print('NEEDLE', needle)
    pos = text.find(needle)
    print('position', pos)
    if pos >= 0:
        print(text[max(0, pos-7000):pos+9000])
