#!/usr/bin/env python3
"""Add cache busting to all meme image URL references in app.html"""

with open('/home/ubuntu/teens-bible-app/firebase-deploy/app.html', 'r') as f:
    content = f.read()

# Fix hot meme thumbnails
old1 = "var url = allUrls[item.idx] || ('memes/meme_' + String(item.idx + 1).padStart(3, '0') + '.jpg');"
new1 = "var url = (allUrls[item.idx] || ('memes/meme_' + String(item.idx + 1).padStart(3, '0') + '.jpg')) + '?v=20260510';"
if old1 in content:
    content = content.replace(old1, new1)
    print("✓ Fixed hot meme thumbnail URLs")
else:
    print("✗ Could not find hot meme thumbnail pattern")

# Fix hot meme detail view
old2 = "var url = allUrls[idx] || ('memes/meme_' + String(idx + 1).padStart(3, '0') + '.jpg');"
new2 = "var url = (allUrls[idx] || ('memes/meme_' + String(idx + 1).padStart(3, '0') + '.jpg')) + '?v=20260510';"
if old2 in content:
    content = content.replace(old2, new2)
    print("✓ Fixed hot meme detail URLs")
else:
    print("✗ Could not find hot meme detail pattern")

# Also add cache-control header hint in firebase.json
with open('/home/ubuntu/teens-bible-app/firebase-deploy/app.html', 'w') as f:
    f.write(content)

# Update firebase.json to set short cache for memes
import json
firebase_json_path = '/home/ubuntu/teens-bible-app/firebase.json'
with open(firebase_json_path, 'r') as f:
    firebase_config = json.load(f)

# Add headers for memes directory
hosting = firebase_config.get('hosting', {})
if isinstance(hosting, list):
    hosting = hosting[0]

if 'headers' not in hosting:
    hosting['headers'] = []

# Add no-cache header for memes
meme_header = {
    "source": "memes/**",
    "headers": [
        {"key": "Cache-Control", "value": "no-cache, must-revalidate"}
    ]
}

# Check if already exists
exists = False
for h in hosting.get('headers', []):
    if h.get('source') == 'memes/**':
        exists = True
        h['headers'] = [{"key": "Cache-Control", "value": "no-cache, must-revalidate"}]
        break

if not exists:
    hosting['headers'].append(meme_header)

if isinstance(firebase_config.get('hosting'), list):
    firebase_config['hosting'][0] = hosting
else:
    firebase_config['hosting'] = hosting

with open(firebase_json_path, 'w') as f:
    json.dump(firebase_config, f, indent=2)

print("✓ Updated firebase.json with no-cache headers for memes")
print("\nDone!")
