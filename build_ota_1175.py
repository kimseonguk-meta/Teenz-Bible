from pathlib import Path

ROOT = Path('/home/ubuntu/teenz-bible-github-sync-v1153/app')
for pattern in ('*1175*.js',):
    for path in (ROOT / 'assets').glob(pattern):
        path.unlink()
for name in ('runtime-fixes-1.1.175.js', 'runtime-fixes-1.1.175.css'):
    path = ROOT / name
    if path.exists():
        path.unlink()

for source in (ROOT / 'assets').glob('*1172*.js'):
    target = source.with_name(source.name.replace('1172', '1175'))
    data = source.read_bytes().replace(b'1172', b'1175')
    target.write_bytes(data)

for source_name, target_name in (
    ('runtime-fixes-1.1.172.js', 'runtime-fixes-1.1.175.js'),
    ('runtime-fixes-1.1.172.css', 'runtime-fixes-1.1.175.css'),
):
    source = ROOT / source_name
    target = ROOT / target_name
    data = source.read_bytes().replace(b'1172', b'1175').replace(b'1.1.174', b'1.1.175')
    target.write_bytes(data)

index = ROOT / 'index.html'
data = index.read_bytes().replace(b'1.1.174', b'1.1.175').replace(b'GemFix1174', b'GemFix1175')
index.write_bytes(data)
print('created 1.1.175 assets')
