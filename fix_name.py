#!/usr/bin/env python3
"""
Fix the name display issue:
1. In social.js: After saving teensBibleProfile, also save playerName to localStorage
2. In app.html: Update getPlayerName to also check teensBibleProfile as fallback
3. Fix the greeting emoji to be on the same line
"""

# Fix 1: social.js - add playerName sync in both completeOnboarding functions
with open('/home/ubuntu/teens-bible-app/firebase-deploy/social.js', 'r') as f:
    social = f.read()

# In completeOnboardingAsIndividual
old1 = "localStorage.setItem('teensBibleProfile', JSON.stringify(userProfile));\n  syncUserData();\n  \n  const overlay = document.getElementById('onboarding-overlay');"
new1 = "localStorage.setItem('teensBibleProfile', JSON.stringify(userProfile));\n  localStorage.setItem('playerName', _onboardNickname);\n  if (typeof setPlayerName === 'function') setPlayerName(_onboardNickname);\n  syncUserData();\n  \n  const overlay = document.getElementById('onboarding-overlay');"

if old1 in social:
    social = social.replace(old1, new1)
    print("✓ Fixed completeOnboardingAsIndividual in social.js")
else:
    print("✗ Could not find completeOnboardingAsIndividual target")

# In completeOnboarding (nasum member)
old2 = "localStorage.setItem('teensBibleProfile', JSON.stringify(userProfile));\n  \n  // Save to Firebase\n  syncUserData();"
new2 = "localStorage.setItem('teensBibleProfile', JSON.stringify(userProfile));\n  localStorage.setItem('playerName', _onboardNickname);\n  if (typeof setPlayerName === 'function') setPlayerName(_onboardNickname);\n  \n  // Save to Firebase\n  syncUserData();"

if old2 in social:
    social = social.replace(old2, new2)
    print("✓ Fixed completeOnboarding in social.js")
else:
    print("✗ Could not find completeOnboarding target")

with open('/home/ubuntu/teens-bible-app/firebase-deploy/social.js', 'w') as f:
    f.write(social)

# Fix 2: app.html - Update getPlayerName to check teensBibleProfile as fallback
with open('/home/ubuntu/teens-bible-app/firebase-deploy/app.html', 'r') as f:
    app = f.read()

old_func = """function getPlayerName() {
  return localStorage.getItem('playerName') || '';
}"""

new_func = """function getPlayerName() {
  var name = localStorage.getItem('playerName');
  if (name) return name;
  // Fallback: check teensBibleProfile nickname
  try {
    var profile = JSON.parse(localStorage.getItem('teensBibleProfile') || '{}');
    if (profile.nickname) {
      localStorage.setItem('playerName', profile.nickname);
      return profile.nickname;
    }
  } catch(e) {}
  return '';
}"""

if old_func in app:
    app = app.replace(old_func, new_func)
    print("✓ Updated getPlayerName with teensBibleProfile fallback")
else:
    print("✗ Could not find getPlayerName function")

# Fix 3: Put emoji inline with greeting text (no line break)
# The current getTimeGreeting returns text with emoji that might wrap
# Let's make the emoji part of the same span with nowrap
old_greeting_func = """function getTimeGreeting() {
  var h = new Date().getHours();
  var name = getPlayerName() || 'there';
  if (h >= 5 && h < 12) return 'Good morning, ' + name + '! ☀️';
  if (h >= 12 && h < 17) return 'Good afternoon, ' + name + '! 👋';
  if (h >= 17 && h < 21) return 'Good evening, ' + name + '! 🌅';
  return 'Hey ' + name + '! 🌙';
}"""

new_greeting_func = """function getTimeGreeting() {
  var h = new Date().getHours();
  var name = getPlayerName() || 'there';
  if (h >= 5 && h < 12) return 'Good morning, ' + name + '! <span style="display:inline">☀️</span>';
  if (h >= 12 && h < 17) return 'Good afternoon, ' + name + '! <span style="display:inline">👋</span>';
  if (h >= 17 && h < 21) return 'Good evening, ' + name + '! <span style="display:inline">🌅</span>';
  return 'Hey ' + name + '! <span style="display:inline">🌙</span>';
}"""

if old_greeting_func in app:
    app = app.replace(old_greeting_func, new_greeting_func)
    print("✓ Fixed emoji display in greeting")
else:
    print("✗ Could not find getTimeGreeting function")

with open('/home/ubuntu/teens-bible-app/firebase-deploy/app.html', 'w') as f:
    f.write(app)

print("\nDone! All fixes applied.")
