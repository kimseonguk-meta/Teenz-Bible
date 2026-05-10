#!/usr/bin/env python3
"""Add time-based greeting to app.html"""

APP_FILE = "/home/ubuntu/teens-bible-app/firebase-deploy/app.html"

with open(APP_FILE, 'r') as f:
    content = f.read()

# 1. Add the getTimeGreeting function right before getPlayerName function
greeting_function = '''function getTimeGreeting() {
  var h = new Date().getHours();
  var name = getPlayerName() || 'there';
  if (h >= 5 && h < 12) return 'Good morning, ' + name + '! ☀️';
  if (h >= 12 && h < 17) return 'Good afternoon, ' + name + '! 👋';
  if (h >= 17 && h < 21) return 'Good evening, ' + name + '! 🌅';
  return 'Hey ' + name + '! 🌙';
}
'''

# Insert before getPlayerName
target_func = "function getPlayerName() {"
if target_func in content:
    content = content.replace(target_func, greeting_function + "\n" + target_func)
    print("✓ Added getTimeGreeting() function")
else:
    print("✗ Could not find getPlayerName function")
    exit(1)

# 2. Replace the greeting line to use getTimeGreeting()
old_greeting = "'Hey ' + (getPlayerName() || 'there') + '! 👋'"
new_greeting = "getTimeGreeting()"

if old_greeting in content:
    content = content.replace(old_greeting, new_greeting)
    print("✓ Updated greeting to use getTimeGreeting()")
else:
    print("✗ Could not find old greeting")
    exit(1)

with open(APP_FILE, 'w') as f:
    f.write(content)

print("Done!")
