#!/usr/bin/env python3
"""Add seasonal meme rotation logic to app.html"""
import re

APP_FILE = "/home/ubuntu/teens-bible-app/firebase-deploy/app.html"

with open(APP_FILE, 'r') as f:
    content = f.read()

# The seasonal meme URLs arrays and date-based logic
seasonal_code = '''
  // === SEASONAL MEME ROTATION ===
  var seasonalMemes = {
    christmas: [
      'memes/christmas_001.jpg','memes/christmas_002.jpg','memes/christmas_003.png',
      'memes/christmas_004.jpg','memes/christmas_005.jpg','memes/christmas_006.jpg'
    ],
    easter: [
      'memes/easter_001.jpg','memes/easter_002.jpg','memes/easter_003.jpg',
      'memes/easter_004.jpg','memes/easter_005.jpg','memes/easter_006.jpg','memes/easter_007.jpg'
    ],
    thanksgiving: [
      'memes/thanksgiving_001.jpg','memes/thanksgiving_002.jpg','memes/thanksgiving_003.jpg',
      'memes/thanksgiving_004.jpg','memes/thanksgiving_005.jpg','memes/thanksgiving_006.jpg'
    ],
    lent: [
      'memes/lent_001.jpg','memes/lent_002.jpg'
    ],
    backtoschool: [
      'memes/school_001.jpg','memes/school_002.jpg','memes/school_003.jpg',
      'memes/school_004.jpg','memes/school_005.jpg'
    ]
  };
  
  function getActiveSeason() {
    var now = new Date();
    var month = now.getMonth() + 1; // 1-12
    var day = now.getDate();
    
    // Christmas season: Dec 1 - Jan 6
    if (month === 12 || (month === 1 && day <= 6)) return 'christmas';
    
    // Easter season: varies, roughly mid-March to mid-April
    // Use a fixed window: March 15 - April 30
    if ((month === 3 && day >= 15) || month === 4) return 'easter';
    
    // Lent: Feb 15 - March 14 (roughly)
    if ((month === 2 && day >= 15) || (month === 3 && day < 15)) return 'lent';
    
    // Thanksgiving: Nov 1 - Nov 30
    if (month === 11) return 'thanksgiving';
    
    // Back to school: Aug 15 - Sep 15 and Feb 15 - Mar 5 (Korean school start)
    if ((month === 8 && day >= 15) || (month === 9 && day <= 15)) return 'backtoschool';
    if (month === 2 && day >= 20 && day <= 28) return 'backtoschool';
    
    return null;
  }
  
  var activeSeason = getActiveSeason();
  if (activeSeason && seasonalMemes[activeSeason]) {
    // Mix seasonal memes into the regular rotation (add them to the pool)
    allMemeUrls = allMemeUrls.concat(seasonalMemes[activeSeason]);
  }
'''

# Insert the seasonal code right after "var allMemeUrls = memeUrls.slice();"
# and before "var approvedMemesLoaded = false;"
target = "var allMemeUrls = memeUrls.slice();\n  var approvedMemesLoaded = false;"
replacement = "var allMemeUrls = memeUrls.slice();\n" + seasonal_code + "\n  var approvedMemesLoaded = false;"

if target in content:
    content = content.replace(target, replacement)
    print("✓ Inserted seasonal rotation logic")
else:
    print("✗ Could not find insertion point")
    # Try alternate format
    target2 = "var allMemeUrls = memeUrls.slice();"
    if target2 in content:
        content = content.replace(target2, "var allMemeUrls = memeUrls.slice();\n" + seasonal_code, 1)
        print("✓ Inserted seasonal rotation logic (alternate)")
    else:
        print("✗ FAILED: Could not find allMemeUrls line")
        exit(1)

with open(APP_FILE, 'w') as f:
    f.write(content)

print("Done! Seasonal meme rotation added.")
