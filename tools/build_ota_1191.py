from pathlib import Path
import hashlib
import json
import shutil
import zipfile

repo = Path('/home/ubuntu/teenz-bible-github-sync-v1153')
src = repo / 'app'
dst = Path('/tmp/teenz-ota-1191-final')
zip_path = Path('/tmp/teenz-1.1.191-final.zip')

if dst.exists():
    shutil.rmtree(dst)
if zip_path.exists():
    zip_path.unlink()

def ignore(directory, names):
    if Path(directory).resolve() == src.resolve():
        return {'ota'}
    return set()

shutil.copytree(src, dst, ignore=ignore)
index = (dst / 'index.html').read_text(encoding='utf-8')
assert 'runtime-fixes-1.1.191.js' in index
assert 'runtime-fixes-1.1.191.css' in index
assert 'assets/index-GemFix1184.js' in index
assert not any(f'index-GemFix{v}' in index for v in ('1185', '1186', '1187', '1188', '1189'))
runtime = (dst / 'runtime-fixes-1.1.191.js').read_text(encoding='utf-8')
for marker in ['__tbLoadingFallbackGuard', 'tb-native-stale-loading', 'installLoadingFallbackGuard', 'hideStaleFallbacks', 'scheduleHideStaleFallbacks']:
    assert marker not in runtime, marker
for bridge in ['installResetProgressBridge', 'installReadingGateCloseBridge', 'installHomeBackupDismissBridge', 'installHomeBackupCardPresentation']:
    assert bridge in runtime, bridge
assert '[data-loc="client/src/pages/Profile.tsx:1141"]' in runtime
assert '[data-loc="client/src/pages/Profile.tsx:1142"]' in runtime
assert '[data-loc="client/src/pages/Profile.tsx:1141"]' in (dst / 'runtime-fixes-1.1.191.css').read_text(encoding='utf-8')
assert '[data-loc="client/src/pages/Profile.tsx:1142"]' in (dst / 'runtime-fixes-1.1.191.css').read_text(encoding='utf-8')
main = dst / 'assets/index-GemFix1184.js'
assert main.exists()
assert main.read_bytes() == (src / 'assets/index-GemFix1184.js').read_bytes()
for v in ('1185', '1186', '1187', '1188', '1189'):
    assert not list((dst / 'assets').glob(f'*{v}*.js'))
with zipfile.ZipFile(zip_path, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
    for path in sorted(dst.rglob('*')):
        if path.is_file() and 'ota' not in path.parts:
            zf.write(path, path.relative_to(dst).as_posix())
sha256 = hashlib.sha256(zip_path.read_bytes()).hexdigest()
size = zip_path.stat().st_size
ota_dir = src / 'ota'
ota_dir.mkdir(exist_ok=True)
shutil.copy2(zip_path, ota_dir / '1.1.191.zip')
manifest = {'version': '1.1.191', 'url': 'https://teens-bible-94271.web.app/ota/1.1.191.zip', 'checksum': sha256, 'size': size}
(ota_dir / 'latest.json').write_text(json.dumps(manifest, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')
print(json.dumps({'zip': str(zip_path), 'sha256': sha256, 'size': size, 'files': sum(1 for p in dst.rglob('*') if p.is_file()), 'manifest': manifest}, ensure_ascii=False, indent=2))
