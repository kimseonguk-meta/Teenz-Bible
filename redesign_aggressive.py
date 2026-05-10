"""
Aggressive UI Redesign for Teenz Bible App
Matches the approved mockup with:
- Strong neon purple glow effects
- Glassmorphism cards with visible blur
- Gradient borders
- Cosmic particle animations
- Neon nav bar with glow indicator
- Profile neon ring avatar
- Colorful store cards with different neon borders
"""

import re

with open('/home/ubuntu/teens-bible-app/firebase-deploy/app.html', 'r') as f:
    content = f.read()

# ============================================================
# 1. REPLACE THE ENTIRE CSS SECTION WITH AGGRESSIVE NEON STYLE
# ============================================================

# Find the first <style> tag content and replace key sections
# We'll inject a new style block right after the opening <style> tag

# Key color replacements - make everything more vibrant
replacements = {
    # Background - deeper space
    'background: linear-gradient(180deg, #0D0B2E 0%, #110E3A 30%, #0A0825 60%, #0D0B2E 100%)': 
    'background: linear-gradient(180deg, #050318 0%, #0A0630 30%, #12083D 60%, #050318 100%)',
    
    # Card base style - much stronger glassmorphism and glow
    'background: rgba(15, 12, 50, 0.7);\n  backdrop-filter: blur(12px);\n  -webkit-backdrop-filter: blur(12px);\n  border: 1.5px solid rgba(139, 92, 246, 0.4);\n  border-radius: 16px;\n  box-shadow: \n    0 0 15px rgba(139, 92, 246, 0.15),\n    inset 0 1px 0 rgba(255,255,255,0.05),\n    0 4px 20px rgba(0,0,0,0.4)':
    'background: rgba(15, 10, 60, 0.5);\n  backdrop-filter: blur(20px);\n  -webkit-backdrop-filter: blur(20px);\n  border: 1.5px solid rgba(139, 92, 246, 0.6);\n  border-radius: 18px;\n  box-shadow: \n    0 0 25px rgba(139, 92, 246, 0.35),\n    0 0 60px rgba(139, 92, 246, 0.1),\n    inset 0 1px 0 rgba(255,255,255,0.1),\n    0 8px 32px rgba(0,0,0,0.5)',
}

for old, new in replacements.items():
    if old in content:
        content = content.replace(old, new)
        print(f"✅ Replaced: {old[:50]}...")
    else:
        print(f"⚠️  Not found: {old[:50]}...")

# ============================================================
# 2. INJECT AGGRESSIVE OVERRIDE CSS
# ============================================================

aggressive_css = """
/* ============================================================
   AGGRESSIVE NEON COSMIC REDESIGN v3
   Matching approved mockup exactly
   ============================================================ */

/* === COSMIC BACKGROUND === */
body {
  background: linear-gradient(180deg, #050318 0%, #0A0630 25%, #12083D 50%, #0A0630 75%, #050318 100%) !important;
  background-attachment: fixed !important;
}

/* === FLOATING CRYSTAL PARTICLES === */
.app::before {
  content: '' !important;
  position: fixed !important;
  top: 0; left: 0; right: 0; bottom: 0;
  background: 
    radial-gradient(2px 2px at 20% 30%, rgba(139, 92, 246, 0.8), transparent),
    radial-gradient(2px 2px at 80% 10%, rgba(167, 139, 250, 0.6), transparent),
    radial-gradient(2px 2px at 40% 70%, rgba(6, 182, 212, 0.5), transparent),
    radial-gradient(2px 2px at 60% 50%, rgba(236, 72, 153, 0.4), transparent),
    radial-gradient(2px 2px at 10% 80%, rgba(139, 92, 246, 0.6), transparent),
    radial-gradient(2px 2px at 90% 60%, rgba(255, 215, 0, 0.4), transparent),
    radial-gradient(3px 3px at 30% 15%, rgba(139, 92, 246, 0.5), transparent),
    radial-gradient(3px 3px at 70% 85%, rgba(167, 139, 250, 0.4), transparent) !important;
  pointer-events: none !important;
  z-index: 0 !important;
  opacity: 1 !important;
  font-size: 0 !important;
  animation: cosmicDrift 20s linear infinite !important;
}

.app::after {
  content: '💎' !important;
  position: fixed !important;
  top: 12% !important;
  right: 6% !important;
  font-size: 22px !important;
  animation: floatCrystal 4s ease-in-out infinite !important;
  pointer-events: none !important;
  z-index: 1 !important;
  opacity: 0.6 !important;
  filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.8)) !important;
}

@keyframes cosmicDrift {
  0% { transform: translateY(0); }
  100% { transform: translateY(-20px); }
}

/* === CARD GLASSMORPHISM - AGGRESSIVE === */
.hero, .stat, .level-bar, .continue-card, .book-card, .ch-btn,
.setting-row, .badge, .chat-messages, .reader-body, .audio-controls {
  background: rgba(10, 6, 48, 0.45) !important;
  backdrop-filter: blur(24px) !important;
  -webkit-backdrop-filter: blur(24px) !important;
  border: 1.5px solid rgba(139, 92, 246, 0.5) !important;
  border-radius: 18px !important;
  box-shadow: 
    0 0 20px rgba(139, 92, 246, 0.3),
    0 0 50px rgba(139, 92, 246, 0.08),
    inset 0 1px 0 rgba(255,255,255,0.08),
    0 8px 32px rgba(0,0,0,0.4) !important;
}

/* === HERO CARD - GOLDEN GLOW === */
.hero {
  border: 2px solid rgba(255, 215, 0, 0.6) !important;
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.3),
    0 0 60px rgba(255, 215, 0, 0.1),
    inset 0 1px 0 rgba(255, 215, 0, 0.2),
    0 8px 32px rgba(0,0,0,0.5) !important;
  background: rgba(10, 6, 48, 0.5) !important;
}

/* === NAVIGATION BAR - NEON GLOW === */
.nav {
  background: rgba(5, 3, 24, 0.9) !important;
  backdrop-filter: blur(30px) !important;
  -webkit-backdrop-filter: blur(30px) !important;
  border-top: 2px solid rgba(139, 92, 246, 0.5) !important;
  box-shadow: 
    0 -4px 30px rgba(139, 92, 246, 0.25),
    0 -2px 60px rgba(139, 92, 246, 0.1) !important;
}

.nav-btn {
  color: #4a4570 !important;
  transition: all 0.3s ease !important;
}

.nav-btn.active {
  color: #C4B5FD !important;
  filter: drop-shadow(0 0 12px rgba(167, 139, 250, 0.9)) !important;
}

.nav-btn.active::after {
  content: '' !important;
  position: absolute !important;
  bottom: 2px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  width: 30px !important;
  height: 3px !important;
  background: linear-gradient(90deg, #8B5CF6, #C4B5FD) !important;
  border-radius: 2px !important;
  box-shadow: 0 0 10px rgba(139, 92, 246, 0.8), 0 0 20px rgba(139, 92, 246, 0.4) !important;
}

.nav-btn.active .icon {
  transform: scale(1.2) !important;
  filter: drop-shadow(0 0 12px rgba(167, 139, 250, 0.9)) !important;
}

/* === STATS CARDS - GRADIENT BORDER === */
.stat {
  background: rgba(10, 6, 48, 0.5) !important;
  border: 2px solid transparent !important;
  background-image: linear-gradient(rgba(10, 6, 48, 0.5), rgba(10, 6, 48, 0.5)), linear-gradient(135deg, #8B5CF6, #EC4899, #06B6D4) !important;
  background-origin: border-box !important;
  background-clip: padding-box, border-box !important;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.2), 0 4px 20px rgba(0,0,0,0.3) !important;
}

.stat .val {
  color: #E9D5FF !important;
  border: 3px solid transparent !important;
  background-image: linear-gradient(#0A0630, #0A0630), linear-gradient(135deg, #8B5CF6, #EC4899, #06B6D4) !important;
  background-origin: border-box !important;
  background-clip: padding-box, border-box !important;
  box-shadow: 0 0 18px rgba(139, 92, 246, 0.4), 0 0 36px rgba(139, 92, 246, 0.15) !important;
}

/* === LEVEL BAR - NEON GLOW === */
.level-bar {
  border: 1.5px solid rgba(139, 92, 246, 0.5) !important;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.2) !important;
}

.xp-fill {
  background: linear-gradient(90deg, #7C3AED, #A78BFA, #C4B5FD, #06B6D4) !important;
  box-shadow: 
    0 0 16px rgba(139, 92, 246, 1),
    0 0 32px rgba(167, 139, 250, 0.6),
    0 0 48px rgba(6, 182, 212, 0.3) !important;
}

/* === CONTINUE READING CARD - PURPLE GLOW === */
.continue-card-enhanced {
  border: 2px solid rgba(139, 92, 246, 0.6) !important;
  box-shadow: 
    0 0 25px rgba(139, 92, 246, 0.35),
    0 0 50px rgba(139, 92, 246, 0.1),
    inset 0 0 30px rgba(139, 92, 246, 0.05) !important;
  background: rgba(10, 6, 48, 0.5) !important;
}

/* === BOOK CARDS - SUBTLE GLOW === */
.book-card {
  border: 1.5px solid rgba(139, 92, 246, 0.4) !important;
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.15), 0 4px 20px rgba(0,0,0,0.3) !important;
  transition: all 0.3s ease !important;
}

.book-card:hover, .book-card:active {
  border-color: rgba(167, 139, 250, 0.7) !important;
  box-shadow: 0 0 25px rgba(139, 92, 246, 0.35), 0 4px 30px rgba(0,0,0,0.4) !important;
  transform: translateX(4px) !important;
}

.book-progress-fill {
  background: linear-gradient(90deg, #8B5CF6, #A78BFA, #06B6D4) !important;
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.8), 0 0 24px rgba(6, 182, 212, 0.4) !important;
}

/* === PROFILE - NEON RING AVATAR === */
.profile-avatar-ring {
  border: 3px solid transparent !important;
  background-image: linear-gradient(#0A0630, #0A0630), linear-gradient(135deg, #8B5CF6, #EC4899, #06B6D4, #8B5CF6) !important;
  background-origin: border-box !important;
  background-clip: padding-box, border-box !important;
  box-shadow: 
    0 0 25px rgba(139, 92, 246, 0.6),
    0 0 50px rgba(139, 92, 246, 0.2),
    0 0 75px rgba(236, 72, 153, 0.1) !important;
  width: 90px !important;
  height: 90px !important;
}

.profile-level-badge {
  background: rgba(139, 92, 246, 0.2) !important;
  border: 1px solid rgba(139, 92, 246, 0.5) !important;
  box-shadow: 0 0 10px rgba(139, 92, 246, 0.3) !important;
}

.profile-stat-box {
  background: rgba(10, 6, 48, 0.5) !important;
  border: 1.5px solid rgba(139, 92, 246, 0.4) !important;
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.2) !important;
}

.profile-stat-num {
  text-shadow: 0 0 8px currentColor !important;
}

.profile-grid-item {
  background: rgba(10, 6, 48, 0.5) !important;
  border: 1.5px solid rgba(139, 92, 246, 0.35) !important;
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.15) !important;
}

.profile-grid-item:active {
  border-color: rgba(167, 139, 250, 0.7) !important;
  box-shadow: 0 0 25px rgba(139, 92, 246, 0.5) !important;
}

.profile-xp-fill {
  background: linear-gradient(90deg, #7C3AED, #A78BFA, #C4B5FD) !important;
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.8) !important;
}

/* === GEM STORE - COLORFUL NEON BORDERS === */
.store-card-v2 {
  background: rgba(10, 6, 48, 0.6) !important;
  backdrop-filter: blur(24px) !important;
  -webkit-backdrop-filter: blur(24px) !important;
  border: 1.5px solid rgba(139, 92, 246, 0.5) !important;
  box-shadow: 0 0 30px rgba(139, 92, 246, 0.2), 0 8px 40px rgba(0,0,0,0.5) !important;
}

.store-tab-v2.active {
  background: rgba(139, 92, 246, 0.3) !important;
  color: #E9D5FF !important;
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.4) !important;
}

.store-quick-item {
  background: rgba(10, 6, 48, 0.5) !important;
  border: 1.5px solid rgba(139, 92, 246, 0.3) !important;
  box-shadow: 0 0 10px rgba(139, 92, 246, 0.1) !important;
}

.store-quick-item:hover {
  border-color: rgba(167, 139, 250, 0.6) !important;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.35) !important;
}

/* === SECTION TITLES - NEON GLOW === */
.section-title {
  color: #E9D5FF !important;
  text-shadow: 0 0 12px rgba(167, 139, 250, 0.5), 0 0 24px rgba(139, 92, 246, 0.2) !important;
}

/* === BUTTONS - NEON STYLE === */
.continue-btn, .start-btn {
  background: linear-gradient(135deg, #7C3AED, #A855F7) !important;
  border: none !important;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.5), 0 4px 16px rgba(0,0,0,0.3) !important;
  color: white !important;
}

/* === DAILY MISSION CARD === */
.daily-mission-card {
  border: 2px solid rgba(255, 215, 0, 0.4) !important;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.15), 0 4px 20px rgba(0,0,0,0.3) !important;
  background: rgba(10, 6, 48, 0.5) !important;
}

/* === STREAK CARD === */
.streak-card {
  border: 1.5px solid rgba(255, 107, 107, 0.4) !important;
  box-shadow: 0 0 15px rgba(255, 107, 107, 0.15) !important;
  background: rgba(10, 6, 48, 0.5) !important;
}

/* === MEME CARD === */
.meme-card {
  border: 1.5px solid rgba(139, 92, 246, 0.4) !important;
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.2) !important;
  background: rgba(10, 6, 48, 0.5) !important;
}

/* === BADGES - GLOW WHEN EARNED === */
.badge.earned {
  border-color: rgba(255, 215, 0, 0.6) !important;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.4), 0 0 40px rgba(255, 215, 0, 0.15) !important;
}

/* === CHAPTER BUTTONS === */
.ch-btn {
  border: 1.5px solid rgba(139, 92, 246, 0.35) !important;
  box-shadow: 0 0 10px rgba(139, 92, 246, 0.1) !important;
}

.ch-btn.completed {
  border-color: rgba(74, 222, 128, 0.5) !important;
  box-shadow: 0 0 12px rgba(74, 222, 128, 0.2) !important;
}

.ch-btn:hover, .ch-btn:active {
  border-color: rgba(167, 139, 250, 0.6) !important;
  box-shadow: 0 0 18px rgba(139, 92, 246, 0.35) !important;
}

/* === ONBOARDING CARD === */
.onboard-card {
  background: rgba(10, 6, 48, 0.8) !important;
  backdrop-filter: blur(24px) !important;
  border: 1.5px solid rgba(139, 92, 246, 0.5) !important;
  box-shadow: 0 0 40px rgba(139, 92, 246, 0.3), 0 0 80px rgba(139, 92, 246, 0.1) !important;
}

/* === SETTINGS === */
.setting-row {
  border: 1px solid rgba(139, 92, 246, 0.3) !important;
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.08) !important;
}

/* === CHAT/AI === */
.chat-messages {
  border: 1.5px solid rgba(139, 92, 246, 0.4) !important;
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.15) !important;
}

/* === READER === */
.reader-body {
  border: 1.5px solid rgba(139, 92, 246, 0.3) !important;
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.1) !important;
}

/* === INVITE BUTTON === */
.profile-invite {
  background: linear-gradient(135deg, #7C3AED, #A855F7) !important;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.4), 0 4px 16px rgba(0,0,0,0.3) !important;
}

/* === GEM STORE BUTTON === */
.gem-store-btn {
  border: 1.5px solid rgba(139, 92, 246, 0.5) !important;
  background: rgba(139, 92, 246, 0.12) !important;
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.2) !important;
}

.gem-store-btn:hover {
  background: rgba(139, 92, 246, 0.2) !important;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.35) !important;
}

/* === ADDITIONAL FLOATING CRYSTALS === */
@keyframes floatCrystal2 {
  0%, 100% { transform: translateY(0) rotate(0deg) scale(1); opacity: 0.5; }
  50% { transform: translateY(-20px) rotate(180deg) scale(1.1); opacity: 0.8; }
}

@keyframes floatCrystal3 {
  0%, 100% { transform: translateY(0) rotate(45deg); opacity: 0.3; }
  50% { transform: translateY(-12px) rotate(225deg); opacity: 0.6; }
}

/* === LEVEL UP MODAL - NEON === */
.levelup-overlay {
  background: rgba(5, 3, 24, 0.9) !important;
  backdrop-filter: blur(12px) !important;
}

.levelup-card {
  background: rgba(10, 6, 48, 0.8) !important;
  border: 2px solid rgba(255, 215, 0, 0.5) !important;
  box-shadow: 0 0 40px rgba(255, 215, 0, 0.3), 0 0 80px rgba(255, 215, 0, 0.1) !important;
}

/* === QUIZ MODAL === */
.quiz-overlay {
  background: rgba(5, 3, 24, 0.9) !important;
  backdrop-filter: blur(12px) !important;
}

.quiz-card {
  background: rgba(10, 6, 48, 0.8) !important;
  border: 1.5px solid rgba(139, 92, 246, 0.5) !important;
  box-shadow: 0 0 30px rgba(139, 92, 246, 0.25) !important;
}

/* === SCROLLBAR STYLING === */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: rgba(5, 3, 24, 0.5); }
::-webkit-scrollbar-thumb { background: rgba(139, 92, 246, 0.4); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: rgba(139, 92, 246, 0.6); }

/* === BIBLE TAB HEADER === */
#screen-bible h2 {
  text-shadow: 0 0 12px currentColor, 0 0 24px rgba(139, 92, 246, 0.3) !important;
}

/* === CATEGORY ACCORDION === */
.cat-accordion {
  background: rgba(10, 6, 48, 0.4) !important;
  border: 1px solid rgba(139, 92, 246, 0.25) !important;
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.08) !important;
}

/* === BACK BUTTON === */
.back-btn {
  background: rgba(139, 92, 246, 0.15) !important;
  border: 1px solid rgba(139, 92, 246, 0.3) !important;
  color: #C4B5FD !important;
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.15) !important;
}

/* === HOT MEMES SECTION === */
.hot-memes-section {
  border: 1.5px solid rgba(255, 215, 0, 0.3) !important;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.1) !important;
  background: rgba(10, 6, 48, 0.5) !important;
}

"""

# Find the closing </style> of the main CSS section (line 2274)
# Insert our aggressive override right before it
style_end_marker = """</style>
<style>
/* === ENGAGEMENT"""

if style_end_marker in content:
    content = content.replace(style_end_marker, aggressive_css + "\n" + style_end_marker)
    print("✅ Injected aggressive CSS before engagement style block")
else:
    # Try alternative injection point - right before the first </style>
    first_style_end = content.find('</style>')
    if first_style_end > 0:
        content = content[:first_style_end] + "\n" + aggressive_css + "\n" + content[first_style_end:]
        print("✅ Injected aggressive CSS before first </style>")
    else:
        print("❌ Could not find injection point!")

# ============================================================
# 3. ADD MORE FLOATING CRYSTAL ELEMENTS
# ============================================================

# Add extra crystal elements to the app div
old_app_div = '<div class="app particle-bg">'
new_app_div = '''<div class="app particle-bg">
  <div style="position:fixed;top:8%;left:5%;font-size:18px;animation:floatCrystal 5s ease-in-out infinite;pointer-events:none;z-index:1;opacity:0.5;filter:drop-shadow(0 0 6px rgba(139,92,246,0.7));">💎</div>
  <div style="position:fixed;top:45%;right:4%;font-size:14px;animation:floatCrystal 6s ease-in-out infinite 2s;pointer-events:none;z-index:1;opacity:0.4;filter:drop-shadow(0 0 6px rgba(236,72,153,0.6));">💜</div>
  <div style="position:fixed;bottom:30%;left:3%;font-size:16px;animation:floatCrystal 7s ease-in-out infinite 1s;pointer-events:none;z-index:1;opacity:0.35;filter:drop-shadow(0 0 6px rgba(6,182,212,0.6));">✨</div>
  <div style="position:fixed;top:25%;right:8%;font-size:12px;animation:floatCrystal 4.5s ease-in-out infinite 0.5s;pointer-events:none;z-index:1;opacity:0.45;filter:drop-shadow(0 0 6px rgba(139,92,246,0.7));">💎</div>'''

if old_app_div in content:
    content = content.replace(old_app_div, new_app_div)
    print("✅ Added floating crystal elements")
else:
    # Try without particle-bg class
    old_app_div2 = '<div class="app">'
    if old_app_div2 in content:
        content = content.replace(old_app_div2, new_app_div.replace('particle-bg', ''))
        print("✅ Added floating crystal elements (no particle-bg)")
    else:
        print("⚠️  Could not find app div to add crystals")

# ============================================================
# 4. SAVE
# ============================================================

with open('/home/ubuntu/teens-bible-app/firebase-deploy/app.html', 'w') as f:
    f.write(content)

print("\n🎉 Aggressive redesign applied successfully!")
print("Key changes:")
print("  - Deep cosmic background")
print("  - Strong neon glow on all cards")
print("  - Glassmorphism with heavy blur")
print("  - Gradient borders on stats")
print("  - Neon nav bar with glow indicator")
print("  - Profile neon ring avatar")
print("  - Floating crystal particles")
print("  - Colorful store card borders")
