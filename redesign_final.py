#!/usr/bin/env python3
"""
Aggressive UI redesign for Teenz Bible app.
Matches the approved neon cosmic mockup with:
- Strong neon glow on all cards
- Glassmorphism (backdrop-filter blur + semi-transparent)
- Gradient borders (purple to cyan)
- Cosmic particle background (larger, brighter)
- Neon nav bar with glowing active tab
- Profile avatar neon ring
- XP bar with gradient + glow
"""

import re

filepath = '/home/ubuntu/teens-bible-app/firebase-deploy/app.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the </style> tag to inject our override CSS right before it
# This ensures our styles override everything else

override_css = """
/* ============================================ */
/* NEON COSMIC REDESIGN - AGGRESSIVE OVERRIDE   */
/* ============================================ */

/* === GLOBAL BACKGROUND === */
body {
  background: radial-gradient(ellipse at 50% 0%, #1a0533 0%, #0a0a2e 40%, #050520 100%) !important;
  min-height: 100vh;
}

/* === FLOATING CRYSTALS - BIGGER AND BRIGHTER === */
.floating-crystal {
  position: fixed !important;
  width: 20px !important;
  height: 20px !important;
  opacity: 0.7 !important;
  filter: blur(0px) !important;
  z-index: 0 !important;
}

/* === ALL CARDS - GLASSMORPHISM + NEON GLOW === */
div[style*="border-radius"][style*="padding"] {
  background: rgba(20, 10, 60, 0.6) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  border: 1.5px solid rgba(139, 92, 246, 0.6) !important;
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.4), 0 0 30px rgba(139, 92, 246, 0.2), inset 0 0 15px rgba(139, 92, 246, 0.1) !important;
  border-radius: 16px !important;
}

/* === HOME SCREEN CARDS === */
#screen-home div[style*="border-radius"][style*="padding"] {
  background: rgba(15, 8, 50, 0.7) !important;
  backdrop-filter: blur(16px) !important;
  -webkit-backdrop-filter: blur(16px) !important;
  border: 1.5px solid rgba(139, 92, 246, 0.7) !important;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.25), inset 0 1px 0 rgba(255,255,255,0.1) !important;
}

/* === STAT CARDS (XP, Level, Gems) === */
div[style*="display:flex"][style*="justify-content"] > div[style*="text-align:center"] {
  background: rgba(20, 10, 60, 0.8) !important;
  border: 1.5px solid rgba(139, 92, 246, 0.5) !important;
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.4) !important;
  border-radius: 12px !important;
  padding: 12px !important;
}

/* === XP PROGRESS BAR === */
div[style*="height:8px"], div[style*="height: 8px"],
div[style*="height:6px"], div[style*="height: 6px"] {
  background: rgba(30, 20, 60, 0.8) !important;
  border-radius: 10px !important;
  overflow: hidden !important;
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.3) !important;
}

div[style*="height:8px"] > div, div[style*="height: 8px"] > div,
div[style*="height:6px"] > div, div[style*="height: 6px"] > div {
  background: linear-gradient(90deg, #8B5CF6, #06B6D4, #8B5CF6) !important;
  box-shadow: 0 0 10px rgba(139, 92, 246, 0.8), 0 0 20px rgba(6, 182, 212, 0.4) !important;
  border-radius: 10px !important;
  animation: xpGlow 2s ease-in-out infinite !important;
}

/* === BUTTONS === */
button[style*="background"], .btn-primary, button[onclick*="start"] {
  background: linear-gradient(135deg, #8B5CF6, #6D28D9) !important;
  border: none !important;
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.6), 0 4px 15px rgba(0,0,0,0.3) !important;
  color: white !important;
  text-shadow: 0 0 10px rgba(255,255,255,0.3) !important;
}

/* === NAV BAR === */
.nav-bar, div[style*="position:fixed"][style*="bottom:0"],
div[style*="position: fixed"][style*="bottom: 0"] {
  background: rgba(10, 5, 30, 0.95) !important;
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
  border-top: 1.5px solid rgba(139, 92, 246, 0.5) !important;
  box-shadow: 0 -5px 25px rgba(139, 92, 246, 0.3), 0 -2px 10px rgba(0,0,0,0.5) !important;
}

/* Nav active tab glow */
.nav-bar button[style*="color: #"], .nav-bar .active,
div[style*="position:fixed"][style*="bottom:0"] button[style*="color"] {
  text-shadow: 0 0 15px currentColor !important;
  filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.8)) !important;
}

/* === PROFILE AVATAR NEON RING === */
#screen-profile img[style*="border-radius:50%"],
#screen-profile img[style*="border-radius: 50%"],
img[style*="width:80px"][style*="border-radius"],
img[style*="width: 80px"][style*="border-radius"] {
  border: 3px solid rgba(139, 92, 246, 0.8) !important;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.7), 0 0 40px rgba(139, 92, 246, 0.4), inset 0 0 15px rgba(139, 92, 246, 0.3) !important;
  animation: avatarPulse 3s ease-in-out infinite !important;
}

/* === PROFILE MENU ITEMS === */
#screen-profile div[onclick] {
  background: rgba(20, 10, 60, 0.6) !important;
  border: 1px solid rgba(139, 92, 246, 0.4) !important;
  box-shadow: 0 0 10px rgba(139, 92, 246, 0.2) !important;
  border-radius: 12px !important;
  margin: 6px 0 !important;
  transition: all 0.3s ease !important;
}

#screen-profile div[onclick]:hover {
  border-color: rgba(139, 92, 246, 0.8) !important;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.5) !important;
}

/* === LEADERBOARD ITEMS === */
.leaderboard-item, div[style*="display:flex"][style*="align-items:center"][style*="padding"] {
  background: rgba(20, 10, 60, 0.5) !important;
  border: 1px solid rgba(139, 92, 246, 0.3) !important;
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.2) !important;
  border-radius: 12px !important;
  margin: 4px 0 !important;
}

/* Gold border for #1 */
.leaderboard-item:first-child, div[style*="gold"] {
  border: 2px solid rgba(255, 215, 0, 0.7) !important;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.4), 0 0 30px rgba(255, 215, 0, 0.2) !important;
}

/* === GEM STORE CARDS === */
.store-item, .store-card {
  background: rgba(20, 10, 60, 0.7) !important;
  border: 1.5px solid rgba(139, 92, 246, 0.5) !important;
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.3) !important;
  border-radius: 14px !important;
}

/* === MEME CARD === */
div[style*="border-radius"][style*="padding"]:has(img[src*="meme"]),
div[style*="border-radius"][style*="padding"]:has(img[style*="width:100%"]) {
  background: rgba(20, 10, 60, 0.5) !important;
  border: 1.5px solid rgba(236, 72, 153, 0.5) !important;
  box-shadow: 0 0 15px rgba(236, 72, 153, 0.3) !important;
}

/* === STREAK CARD === */
div[style*="border-radius"][style*="padding"]:has(span:first-child) {
  background: rgba(20, 10, 60, 0.6) !important;
}

/* === TEXT COLORS === */
h1, h2, h3, .title {
  color: #FFFFFF !important;
  text-shadow: 0 0 10px rgba(139, 92, 246, 0.3) !important;
}

/* === INVITE FRIENDS BUTTON === */
div[onclick*="invite"], div[onclick*="share"] {
  background: linear-gradient(135deg, #8B5CF6, #A855F7) !important;
  border: none !important;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.5) !important;
  border-radius: 12px !important;
}

/* === ANIMATIONS === */
@keyframes xpGlow {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.3); }
}

@keyframes avatarPulse {
  0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.7), 0 0 40px rgba(139, 92, 246, 0.4); }
  50% { box-shadow: 0 0 30px rgba(139, 92, 246, 0.9), 0 0 60px rgba(139, 92, 246, 0.6); }
}

@keyframes neonBorderPulse {
  0%, 100% { border-color: rgba(139, 92, 246, 0.7); box-shadow: 0 0 15px rgba(139, 92, 246, 0.4); }
  50% { border-color: rgba(6, 182, 212, 0.7); box-shadow: 0 0 20px rgba(6, 182, 212, 0.4); }
}

/* === SCROLLBAR === */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: rgba(10, 10, 46, 0.5); }
::-webkit-scrollbar-thumb { background: rgba(139, 92, 246, 0.6); border-radius: 4px; }

/* === BADGE/LEVEL INDICATOR === */
span[style*="background"][style*="border-radius"][style*="padding"] {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.8), rgba(109, 40, 217, 0.8)) !important;
  border: 1px solid rgba(167, 139, 250, 0.6) !important;
  box-shadow: 0 0 10px rgba(139, 92, 246, 0.5) !important;
  text-shadow: 0 0 5px rgba(255,255,255,0.5) !important;
}

/* === GEMS DISPLAY === */
span[style*="color"][style*="font-weight"]:has(+ span) {
  text-shadow: 0 0 8px currentColor !important;
}

/* ============================================ */
/* END NEON COSMIC REDESIGN                     */
/* ============================================ */
"""

# Insert the override CSS before the closing </style> tag
# Find the LAST </style> tag (the main one)
style_close_positions = [m.start() for m in re.finditer(r'</style>', content)]
if style_close_positions:
    # Insert before the last </style>
    pos = style_close_positions[-1]
    content = content[:pos] + override_css + "\n" + content[pos:]
    print(f"Injected override CSS at position {pos}")
else:
    print("ERROR: No </style> tag found!")
    exit(1)

# Also make the floating crystals bigger and more visible
# Find existing crystal styles and make them more prominent
content = content.replace(
    'opacity: 0.3',
    'opacity: 0.7'
)
content = content.replace(
    'opacity:0.3',
    'opacity:0.7'
)

# Make crystal sizes bigger
content = content.replace(
    "width: '8px'",
    "width: '18px'"
)
content = content.replace(
    "height: '8px'",
    "height: '18px'"
)
content = content.replace(
    "width: '12px'",
    "width: '22px'"
)
content = content.replace(
    "height: '12px'",
    "height: '22px'"
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("DONE - Aggressive neon cosmic redesign applied!")
print("Changes: glassmorphism cards, neon glow borders, gradient XP bar, avatar pulse, nav glow")
