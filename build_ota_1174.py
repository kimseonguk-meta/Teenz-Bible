from pathlib import Path

ROOT = Path('/home/ubuntu/teenz-bible-github-sync-v1153/app')
for path in (ROOT / 'assets').glob('*1172*.js1174.js'):
    path.unlink()
for path in (ROOT / 'assets').glob('*1173*.js1174.js'):
    path.unlink()

for source in (ROOT / 'assets').glob('*1172*.js'):
    target = source.with_name(source.name.replace('1172', '1174'))
    target.write_bytes(source.read_bytes().replace(b'1172', b'1174'))

for source_name, target_name in (
    ('runtime-fixes-1.1.172.js', 'runtime-fixes-1.1.174.js'),
    ('runtime-fixes-1.1.172.css', 'runtime-fixes-1.1.174.css'),
):
    source = ROOT / source_name
    target = ROOT / target_name
    target.write_bytes(source.read_bytes().replace(b'1172', b'1174'))

index = ROOT / 'index.html'
index.write_bytes(index.read_bytes().replace(b'1.1.173', b'1.1.174').replace(b'GemFix1173', b'GemFix1174'))
print('created 1.1.174 assets')
print('\n'.join(sorted(p.name for p in (ROOT / 'assets').glob('*1174*.js'))))
