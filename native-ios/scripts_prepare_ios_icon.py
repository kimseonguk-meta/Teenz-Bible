from pathlib import Path
from PIL import Image

source = Path('/home/ubuntu/teenz-bible-current-working-copy/app/icons/icon-512.png')
target = Path('/home/ubuntu/teenz-bible-ios-rebuild/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png')

with Image.open(source) as image:
    image = image.convert('RGBA')
    image = image.resize((1024, 1024), Image.Resampling.LANCZOS)
    image.save(target, format='PNG', optimize=True)

with Image.open(target) as check:
    assert check.size == (1024, 1024)
print(f'Prepared iOS AppIcon: {target} {check.size[0]}x{check.size[1]}')
