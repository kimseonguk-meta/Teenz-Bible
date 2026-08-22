from pathlib import Path
text = Path('/home/ubuntu/teenz-bible-github-sync-v1153/app/assets/index-GemFix1173.js').read_text()
needle = 'if(!Qe||o==="/bible-ai"||c)return null'
pos = text.find(needle)
print('position', pos)
print(text[max(0,pos-8500):pos+300])
