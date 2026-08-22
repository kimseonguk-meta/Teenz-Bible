from pathlib import Path
import shutil

ROOT = Path('/home/ubuntu/teenz-bible-github-sync-v1153/app')

# Remove stale malformed copies from the interrupted attempt.
for path in (ROOT / 'assets').glob('*1172*.js1173.js'):
    path.unlink()

# Copy every JS asset whose filename contains 1172 and rewrite internal references.
for source in (ROOT / 'assets').glob('*1172*.js'):
    target = source.with_name(source.name.replace('1172', '1173'))
    target.write_bytes(source.read_bytes().replace(b'1172', b'1173'))

# The entry/runtime/CSS files are not under assets.
for source_name, target_name in (
    ('runtime-fixes-1.1.172.js', 'runtime-fixes-1.1.173.js'),
    ('runtime-fixes-1.1.172.css', 'runtime-fixes-1.1.173.css'),
):
    source = ROOT / source_name
    target = ROOT / target_name
    target.write_bytes(source.read_bytes().replace(b'1172', b'1173'))

# Keep the PWA entry aligned with the new runtime and entry chunk.
index = ROOT / 'index.html'
index.write_bytes(index.read_bytes().replace(b'1.1.172', b'1.1.173').replace(b'GemFix1172', b'GemFix1173'))

print('created 1.1.173 assets')
for path in sorted((ROOT / 'assets').glob('*1173*.js')):
    print(path.name)
print('runtime-fixes-1.1.173.js')
print('runtime-fixes-1.1.173.css')
print('index.html updated')
