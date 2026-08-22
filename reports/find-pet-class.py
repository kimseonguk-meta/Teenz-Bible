from pathlib import Path
text = Path('/home/ubuntu/teenz-bible-github-sync-v1153/app/assets/index-GemFix1173.js').read_text()
needle = 'fixed z-[45] select-none touch-none transition-transform duration-500 ease-out'
pos = text.find(needle)
print('position', pos)
print(text[max(0, pos-2600):pos+4200] if pos >= 0 else 'not found')
