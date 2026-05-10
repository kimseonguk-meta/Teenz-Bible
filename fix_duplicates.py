#!/usr/bin/env python3
"""Fix duplicate function definitions in app.html"""

with open('/home/ubuntu/teens-bible-app/firebase-deploy/app.html', 'r') as f:
    content = f.read()

# The problem: renderProfile() has the photo functions AND var APP_ICON_URL inside it
# We need to remove the duplicate functions from inside renderProfile and keep APP_ICON_URL at the right level

# Find and fix: "function renderProfile() {\n  // Profile Photo Management\nfunction getProfilePhoto..."
# Should be just: "function renderProfile() {\n  var APP_ICON_URL..."

old_renderProfile_start = """function renderProfile() {
  // Profile Photo Management
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
var APP_ICON_URL"""

new_renderProfile_start = """function renderProfile() {
  var APP_ICON_URL"""

if old_renderProfile_start in content:
    content = content.replace(old_renderProfile_start, new_renderProfile_start)
    print("✓ Removed duplicate functions from inside renderProfile()")
else:
    print("WARNING: Could not find the exact duplicate block")

# Also check if there's a duplicate "// Profile Photo Management" comment with first set
# The first set should be at the top of the main script
count = content.count("function getProfilePhoto")
print(f"getProfilePhoto count: {count}")

with open('/home/ubuntu/teens-bible-app/firebase-deploy/app.html', 'w') as f:
    f.write(content)

print("Done!")
