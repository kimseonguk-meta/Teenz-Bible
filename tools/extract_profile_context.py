from pathlib import Path
import re
p = next(Path('/home/ubuntu/teenz-bible-github-sync-v1153/app/assets').glob('Profile-*.js'))
s = p.read_text(errors='ignore')
for term in ['My Crews', 'Join Crew', 'Create Crew', '2159']:
    print('\nTERM', term)
    for m in list(re.finditer(re.escape(term), s))[:5]:
        a=max(0,m.start()-1200); b=min(len(s),m.end()+1800)
        print(s[a:b])
        print('\n---\n')
        break
print('FILE', p, 'BYTES', len(s))

# Print readable fragments containing data-loc references and nearby JSX-like text.
for m in re.finditer(r'data-loc.{0,120}2159.{0,700}', s):
    print('\nLOCFRAG\n', s[max(0,m.start()-800):m.end()+1000])
    break
