#!/usr/bin/env python3
"""
Update profile page:
1. Allow user to upload a profile photo (stored in localStorage as base64)
2. Replace Profile tab icon (👤 → more fitting)
3. Replace AI Chat icon (🤖 → more fitting)
4. Show user photo in home header and profile page
"""

with open('/home/ubuntu/teens-bible-app/firebase-deploy/app.html', 'r') as f:
    content = f.read()

# 1. Add profile photo upload function and getter
photo_functions = """
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
}
"""

# Insert photo functions before the renderProfile function
insert_marker = "function renderProfile() {"
content = content.replace(insert_marker, photo_functions + "\n" + insert_marker)

# 2. Update home header: replace app icon with user avatar (clickable to upload)
old_home_header = """'<div class="home-header-row"><img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663322885440/eyf7JgudwZUosztoRMCJZY/icon-fixed-128_b837e611.png" class="home-app-icon" alt="Teenz Bible"/><div class="home-greeting">' + getTimeGreeting() + '</div></div>'"""
new_home_header = """'<div class="home-header-row"><img src="' + (getProfilePhoto() || 'https://d2xsxph8kpxj0f.cloudfront.net/310519663322885440/eyf7JgudwZUosztoRMCJZY/icon-fixed-128_b837e611.png') + '" class="home-app-icon home-avatar-img" alt="Profile" onclick="triggerPhotoUpload()" style="cursor:pointer;object-fit:cover;border-radius:50%;"/><div class="home-greeting">' + getTimeGreeting() + '</div></div>'"""
content = content.replace(old_home_header, new_home_header)

# 3. Update profile page avatar: make it clickable and show user photo
old_profile_avatar = """'<img src="' + APP_ICON_URL + '" class="profile-avatar-img" alt="avatar">'"""
new_profile_avatar = """'<img src="' + (getProfilePhoto() || APP_ICON_URL) + '" class="profile-avatar-img" alt="avatar" onclick="triggerPhotoUpload()" style="cursor:pointer;">' +
        '<div style="position:absolute;bottom:4px;right:4px;background:rgba(0,0,0,0.6);border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:12px;">📷</div>'"""
content = content.replace(old_profile_avatar, new_profile_avatar)

# Make the avatar ring position:relative for the camera icon overlay
old_ring_style = ".profile-avatar-ring { width: 80px; height: 80px; border-radius: 50%; border: 3px solid; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; transition: box-shadow 0.3s; overflow: hidden; }"
new_ring_style = ".profile-avatar-ring { width: 80px; height: 80px; border-radius: 50%; border: 3px solid; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; transition: box-shadow 0.3s; overflow: visible; position: relative; }"
content = content.replace(old_ring_style, new_ring_style)

# 4. Replace nav bar icons
# AI Chat: 🤖 → ✨ (sparkles - represents AI magic, clean and modern)
content = content.replace(
    """<button class="nav-btn" onclick="showScreen('chat')"><span class="icon">🤖</span><span class="nav-label">AI Chat</span></button>""",
    """<button class="nav-btn" onclick="showScreen('chat')"><span class="icon">✨</span><span class="nav-label">AI Chat</span></button>"""
)

# Profile: 👤 → user circle with photo or emoji
content = content.replace(
    """<button class="nav-btn" onclick="showScreen('profile')"><span class="icon">👤</span><span class="nav-label">Profile</span></button>""",
    """<button class="nav-btn" onclick="showScreen('profile')"><span class="icon">⭐</span><span class="nav-label">Profile</span></button>"""
)

# 5. Update home-app-icon CSS to be round for photo
old_icon_css = ".home-app-icon { width: 44px; height: 44px; border-radius: 12px; }"
new_icon_css = ".home-app-icon { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(255,255,255,0.2); }"
content = content.replace(old_icon_css, new_icon_css)

with open('/home/ubuntu/teens-bible-app/firebase-deploy/app.html', 'w') as f:
    f.write(content)

print("✓ Added profile photo upload functionality")
print("✓ Home header: app icon → user photo (clickable)")
print("✓ Profile page: app icon → user photo with camera overlay")
print("✓ AI Chat icon: 🤖 → ✨")
print("✓ Profile icon: 👤 → ⭐")
print("✓ Updated CSS for round avatar")
