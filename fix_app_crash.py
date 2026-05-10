#!/usr/bin/env python3
"""
Fix the app crash: getProfilePhoto is defined in the LAST script block (line ~13218)
but called during renderHome() in the MAIN script block (line ~3290).
renderHome() is called at init time (line ~7467) BEFORE the last script block loads.

Solution: Move the photo functions into the main script block, right before renderHome definition.
"""

with open('/home/ubuntu/teens-bible-app/firebase-deploy/app.html', 'r') as f:
    content = f.read()

# The photo functions block to remove from the later script
photo_block = """// Profile Photo Management
function getProfilePhoto() {
  return localStorage.getItem('teensBibleProfilePhoto') || '';
}
function setProfilePhoto(dataUrl) {
  localStorage.setItem('teensBibleProfilePhoto', dataUrl);
}
function triggerPhotoUpload() {
  var input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = function(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      // Resize to 200x200 to save localStorage space
      var img = new Image();
      img.onload = function() {
        var canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        var ctx = canvas.getContext('2d');
        // Crop to square
        var size = Math.min(img.width, img.height);
        var sx = (img.width - size) / 2;
        var sy = (img.height - size) / 2;
        ctx.drawImage(img, sx, sy, size, size, 0, 0, 200, 200);
        var dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setProfilePhoto(dataUrl);
        // Update all avatar displays
        updateAllAvatars();
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };
  input.click();
}
function updateAllAvatars() {
  var photo = getProfilePhoto();
  // Update home header avatar
  var homeAvatar = document.querySelector('.home-avatar-img');
  if (homeAvatar) homeAvatar.src = photo || 'https://d2xsxph8kpxj0f.cloudfront.net/310519663322885440/eyf7JgudwZUosztoRMCJZY/icon-fixed-128_b837e611.png';
  // Update profile page avatar
  var profileAvatar = document.querySelector('.profile-avatar-img');
  if (profileAvatar) profileAvatar.src = photo || 'https://d2xsxph8kpxj0f.cloudfront.net/310519663322885440/eyf7JgudwZUosztoRMCJZY/icon-fixed-128_b837e611.png';
  // Update nav profile icon
  var navProfileIcon = document.querySelector('.nav-profile-icon');
  if (navProfileIcon && photo) {
    navProfileIcon.src = photo;
    navProfileIcon.style.display = 'block';
    var emojiSpan = navProfileIcon.previousElementSibling;
    if (emojiSpan) emojiSpan.style.display = 'none';
  }
}"""

# Check if this block exists
if photo_block in content:
    # Remove it from the later position
    content = content.replace(photo_block, '')
    print("✓ Removed photo functions from later script block")
else:
    print("WARNING: Exact block not found, trying line-by-line approach")
    # Try to find and remove by looking for the marker
    lines = content.split('\n')
    new_lines = []
    skip = False
    skip_count = 0
    for i, line in enumerate(lines):
        if '// Profile Photo Management' in line and i > 10000:
            # This is the one in the later block (after line 10000)
            skip = True
            skip_count = 0
            continue
        if skip:
            skip_count += 1
            # The block ends after updateAllAvatars closing brace (about 55 lines)
            if skip_count > 50 and line.strip() == '}':
                skip = False
                continue
            continue
        new_lines.append(line)
    content = '\n'.join(new_lines)
    print("✓ Removed photo functions using line-by-line approach")

# Now insert the photo functions into the main script block
# Insert right before "function renderHome()" which is called at init
insert_marker = "function renderHome() {"

# Simple version of the functions (no comments to avoid matching issues)
photo_funcs_insert = """// Profile Photo Management (moved here so available at init)
function getProfilePhoto() {
  return localStorage.getItem('teensBibleProfilePhoto') || '';
}
function setProfilePhoto(dataUrl) {
  localStorage.setItem('teensBibleProfilePhoto', dataUrl);
}
function triggerPhotoUpload() {
  var input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = function(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      var img = new Image();
      img.onload = function() {
        var canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        var ctx = canvas.getContext('2d');
        var size = Math.min(img.width, img.height);
        var sx = (img.width - size) / 2;
        var sy = (img.height - size) / 2;
        ctx.drawImage(img, sx, sy, size, size, 0, 0, 200, 200);
        var dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setProfilePhoto(dataUrl);
        updateAllAvatars();
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };
  input.click();
}
function updateAllAvatars() {
  var photo = getProfilePhoto();
  var homeAvatar = document.querySelector('.home-avatar-img');
  if (homeAvatar) homeAvatar.src = photo || 'https://d2xsxph8kpxj0f.cloudfront.net/310519663322885440/eyf7JgudwZUosztoRMCJZY/icon-fixed-128_b837e611.png';
  var profileAvatar = document.querySelector('.profile-avatar-img');
  if (profileAvatar) profileAvatar.src = photo || 'https://d2xsxph8kpxj0f.cloudfront.net/310519663322885440/eyf7JgudwZUosztoRMCJZY/icon-fixed-128_b837e611.png';
  var navProfileIcon = document.querySelector('.nav-profile-icon');
  if (navProfileIcon && photo) {
    navProfileIcon.src = photo;
    navProfileIcon.style.display = 'block';
    var emojiSpan = navProfileIcon.previousElementSibling;
    if (emojiSpan) emojiSpan.style.display = 'none';
  }
}

"""

# Check if already inserted (avoid double insertion)
if "// Profile Photo Management (moved here so available at init)" in content:
    print("Photo functions already in main block, skipping insertion")
else:
    # Find the first occurrence of renderHome function definition
    idx = content.find(insert_marker)
    if idx > 0:
        content = content[:idx] + photo_funcs_insert + content[idx:]
        print("✓ Inserted photo functions before renderHome()")
    else:
        print("ERROR: Could not find renderHome() marker!")

# Verify
count = content.count("function getProfilePhoto")
print(f"Final getProfilePhoto count: {count}")

with open('/home/ubuntu/teens-bible-app/firebase-deploy/app.html', 'w') as f:
    f.write(content)

print("Done! File saved.")
