#!/usr/bin/env python3
"""
Teenz Bible UI Redesign v2 - Neon Cosmic Style
Applies the slide presentation's design language to the app:
- Deep space background (#0D0B2E)
- Neon purple glowing borders
- Glassmorphism cards with backdrop-blur
- Multi-color neon accents (purple, gold, cyan, pink, green)
- Floating crystal decorations
- Bold typography with glow effects
"""

import re

FILE = '/home/ubuntu/teens-bible-app/firebase-deploy/app.html'

with open(FILE, 'r', encoding='utf-8') as f:
    content = f.read()

# ============================================================
# 1. BODY & BASE BACKGROUND - Deep space cosmic
# ============================================================
content = content.replace(
    "background: linear-gradient(180deg, #060a20 0%, #070c24 30%, #080e28 60%, #0a1025 100%);",
    "background: linear-gradient(180deg, #0D0B2E 0%, #110E3A 30%, #0A0825 60%, #0D0B2E 100%);"
)

# ============================================================
# 2. CARD BASE STYLE - Glassmorphism with neon purple borders
# ============================================================
old_card_base = """background: linear-gradient(160deg, #2c4565 0%, #253a58 50%, #1e3250 100%);
  border: 1px solid rgba(70, 115, 170, 0.35);
  border-radius: 16px;
  box-shadow: 
    inset 0 1px 0 rgba(255,255,255,0.06),
    0 2px 12px rgba(0,0,0,0.3);"""

new_card_base = """background: rgba(15, 12, 50, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1.5px solid rgba(139, 92, 246, 0.4);
  border-radius: 16px;
  box-shadow: 
    0 0 15px rgba(139, 92, 246, 0.15),
    inset 0 1px 0 rgba(255,255,255,0.05),
    0 4px 20px rgba(0,0,0,0.4);"""

content = content.replace(old_card_base, new_card_base)

# ============================================================
# 3. NAVIGATION BAR - Glassmorphism with purple glow
# ============================================================
content = content.replace(
    "background: linear-gradient(180deg, #253550, #1e3050);",
    "background: rgba(13, 11, 46, 0.85); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);"
)
content = content.replace(
    "border-top: 1px solid rgba(70, 110, 160, 0.25);",
    "border-top: 1.5px solid rgba(139, 92, 246, 0.35); box-shadow: 0 -4px 20px rgba(139, 92, 246, 0.1);"
)

# Nav active state - purple glow
content = content.replace(
    ".nav-btn.active { color: #A78BFA; }",
    ".nav-btn.active { color: #A78BFA; filter: drop-shadow(0 0 8px rgba(167, 139, 250, 0.6)); }"
)
content = content.replace(
    ".nav-btn.active .icon { transform: scale(1.1); filter: drop-shadow(0 0 4px rgba(245,158,11,0.4)); }",
    ".nav-btn.active .icon { transform: scale(1.15); filter: drop-shadow(0 0 8px rgba(167, 139, 250, 0.7)); }"
)

# Inactive nav color
content = content.replace(
    "color: #556080;",
    "color: #5a5880;"
)

# ============================================================
# 4. HERO CARD - Gold neon border with cosmic background
# ============================================================
content = content.replace(
    """background: linear-gradient(145deg, #1a2d4d 0%, #152240 50%, #0f1b35 100%);
  border: 1px solid rgba(255, 215, 0, 0.25);
  box-shadow: 0 0 25px rgba(255, 215, 0, 0.1), inset 0 1px 0 rgba(255,215,0,0.1);""",
    """background: rgba(15, 12, 50, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 2px solid rgba(255, 215, 0, 0.45);
  box-shadow: 0 0 25px rgba(255, 215, 0, 0.2), 0 0 50px rgba(255, 215, 0, 0.08), inset 0 1px 0 rgba(255,215,0,0.15);"""
)

# ============================================================
# 5. STATS - Neon gradient borders
# ============================================================
content = content.replace(
    """background: linear-gradient(160deg, #2c4565 0%, #253a58 100%);
  border: 1px solid rgba(70, 115, 170, 0.35);""",
    """background: rgba(15, 12, 50, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1.5px solid rgba(139, 92, 246, 0.35);
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.1);""",
    1  # Only first occurrence
)

# ============================================================
# 6. LEVEL BAR - Purple neon style
# ============================================================
content = content.replace(
    """.level-bar {
  padding: 16px; margin: 16px 0;
  background: linear-gradient(160deg, #2c4565 0%, #253a58 100%);
  border: 1px solid rgba(70, 115, 170, 0.35);
}""",
    """.level-bar {
  padding: 16px; margin: 16px 0;
  background: rgba(15, 12, 50, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1.5px solid rgba(139, 92, 246, 0.35);
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.1);
}"""
)

# XP fill bar - brighter purple-cyan gradient with stronger glow
content = content.replace(
    """background: linear-gradient(90deg, #A78BFA, #06B6D4);
  transition: width 0.5s;
  box-shadow: 0 0 14px rgba(0,229,255,0.6), 0 0 28px rgba(0,229,255,0.3);""",
    """background: linear-gradient(90deg, #8B5CF6, #A78BFA, #06B6D4);
  transition: width 0.5s;
  box-shadow: 0 0 14px rgba(139,92,246,0.8), 0 0 28px rgba(167,139,250,0.4), 0 0 40px rgba(6,182,212,0.2);"""
)

# ============================================================
# 7. CONTINUE READING CARD - Cyan neon border
# ============================================================
content = content.replace(
    """background: linear-gradient(160deg, #1a3050 0%, #162845 100%);
  border: 1px solid rgba(78, 205, 196, 0.2);""",
    """background: rgba(15, 12, 50, 0.65);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1.5px solid rgba(78, 205, 196, 0.4);
  box-shadow: 0 0 12px rgba(78, 205, 196, 0.15);"""
)

# ============================================================
# 8. BOOK CARDS - Purple neon borders
# ============================================================
content = content.replace(
    """background: linear-gradient(160deg, #2c4565 0%, #253a58 50%, #1e3250 100%);
  border: 1px solid rgba(70, 115, 170, 0.35);
}""",
    """background: rgba(15, 12, 50, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1.5px solid rgba(139, 92, 246, 0.3);
  box-shadow: 0 0 10px rgba(139, 92, 246, 0.08);
}""",
    1  # first occurrence only
)

# ============================================================
# 9. CHAPTER BUTTONS - Subtle purple borders
# ============================================================
content = content.replace(
    """background: linear-gradient(160deg, #283d5c 0%, #223852 50%, #1c3048 100%);
  border: 1px solid rgba(65, 110, 160, 0.32);""",
    """background: rgba(15, 12, 50, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(139, 92, 246, 0.25);"""
)

# ============================================================
# 10. READER BODY - Dark cosmic with subtle border
# ============================================================
content = content.replace(
    """background: linear-gradient(160deg, #1e3250 0%, #182a45 100%);
  border: 1px solid rgba(65, 110, 160, 0.32);""",
    """background: rgba(10, 8, 35, 0.8);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(139, 92, 246, 0.2);"""
)

# ============================================================
# 11. PROFILE PAGE - Neon purple avatar ring and stat boxes
# ============================================================
content = content.replace(
    ".profile-stat-box { background: rgba(15,23,42,0.5); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 14px 8px; text-align: center; }",
    ".profile-stat-box { background: rgba(15, 12, 50, 0.6); backdrop-filter: blur(10px); border: 1.5px solid rgba(139, 92, 246, 0.35); border-radius: 12px; padding: 14px 8px; text-align: center; box-shadow: 0 0 10px rgba(139, 92, 246, 0.1); }"
)

content = content.replace(
    ".profile-grid-item { background: rgba(15,23,42,0.5); border: 1px solid rgba(255,255,255,0.05); border-radius: 14px; padding: 16px 10px; text-align: center; cursor: pointer; transition: transform 0.15s, border-color 0.2s, background 0.2s; }",
    ".profile-grid-item { background: rgba(15, 12, 50, 0.5); backdrop-filter: blur(8px); border: 1.5px solid rgba(139, 92, 246, 0.25); border-radius: 14px; padding: 16px 10px; text-align: center; cursor: pointer; transition: transform 0.15s, border-color 0.2s, background 0.2s, box-shadow 0.2s; }"
)

content = content.replace(
    ".profile-grid-item:active { transform: scale(0.93); border-color: rgba(56, 189, 248, 0.3); background: rgba(15,23,42,0.9); }",
    ".profile-grid-item:active { transform: scale(0.93); border-color: rgba(167, 139, 250, 0.6); background: rgba(15, 12, 50, 0.9); box-shadow: 0 0 15px rgba(139, 92, 246, 0.3); }"
)

# ============================================================
# 12. STORE OVERLAY & CARD - Cosmic glassmorphism
# ============================================================
content = content.replace(
    ".store-overlay { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(5,5,20,0.92); z-index:10002; display:flex; align-items:center; justify-content:center; animation:fadeIn 0.3s; }",
    ".store-overlay { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(8,6,30,0.95); backdrop-filter:blur(8px); z-index:10002; display:flex; align-items:center; justify-content:center; animation:fadeIn 0.3s; }"
)

content = content.replace(
    ".store-card { background:linear-gradient(160deg, #1a2a4a, #152040); border:1px solid rgba(65,110,160,0.3); border-radius:20px; padding:24px; max-width:380px; width:90%; max-height:80vh; overflow-y:auto; }",
    ".store-card { background:rgba(15, 12, 50, 0.9); backdrop-filter:blur(16px); border:1.5px solid rgba(139,92,246,0.4); border-radius:20px; padding:24px; max-width:380px; width:90%; max-height:80vh; overflow-y:auto; box-shadow:0 0 30px rgba(139,92,246,0.15), 0 20px 60px rgba(0,0,0,0.5); }"
)

# Store items - neon borders
content = content.replace(
    ".store-item { display:flex; align-items:center; justify-content:space-between; padding:12px; margin-bottom:8px; border-radius:12px; border:1px solid rgba(65,110,160,0.25); background:rgba(20,35,60,0.5); transition:all 0.2s; }",
    ".store-item { display:flex; align-items:center; justify-content:space-between; padding:12px; margin-bottom:8px; border-radius:12px; border:1px solid rgba(139,92,246,0.25); background:rgba(15,12,50,0.5); backdrop-filter:blur(6px); transition:all 0.2s; }"
)

content = content.replace(
    ".store-item:hover { border-color:rgba(139,92,246,0.4); }",
    ".store-item:hover { border-color:rgba(167,139,250,0.6); box-shadow:0 0 12px rgba(139,92,246,0.2); }"
)

# ============================================================
# 13. BADGES - Neon glow when earned
# ============================================================
content = content.replace(
    """.badge.earned { border-color: rgba(249,202,36,0.4); box-shadow: 0 0 10px rgba(249,202,36,0.2); cursor:pointer; }""",
    """.badge.earned { border-color: rgba(255,215,0,0.5); box-shadow: 0 0 15px rgba(255,215,0,0.3), 0 0 30px rgba(255,215,0,0.1); cursor:pointer; }"""
)

# Badge background
content = content.replace(
    """background: linear-gradient(160deg, #283d5c 0%, #223852 100%);
  border: 1px solid rgba(65, 110, 160, 0.32);
}
.badge.earned""",
    """background: rgba(15, 12, 50, 0.6);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(139, 92, 246, 0.25);
}
.badge.earned"""
)

# ============================================================
# 14. SECTION TITLES - Brighter with purple accent
# ============================================================
content = content.replace(
    ".section-title {\n  font-family: 'Bangers', cursive;\n  font-size: 24px;\n  color: #d0d8e8;",
    ".section-title {\n  font-family: 'Bangers', cursive;\n  font-size: 24px;\n  color: #e8e0f8; text-shadow: 0 0 10px rgba(167, 139, 250, 0.3);"
)

# ============================================================
# 15. PARTICLE BACKGROUND - Stronger cosmic effect
# ============================================================
content = content.replace(
    """.particle-bg::before {
  content: '';
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(ellipse at 20% 50%, rgba(139, 92, 246, 0.05) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 20%, rgba(167, 139, 250, 0.03) 0%, transparent 40%);
  pointer-events: none;
  z-index: 0;
}""",
    """.particle-bg::before {
  content: '';
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(ellipse at 20% 50%, rgba(139, 92, 246, 0.12) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 20%, rgba(167, 139, 250, 0.08) 0%, transparent 40%),
              radial-gradient(ellipse at 50% 80%, rgba(6, 182, 212, 0.05) 0%, transparent 45%);
  pointer-events: none;
  z-index: 0;
}"""
)

# ============================================================
# 16. MISC COLOR UPDATES
# ============================================================

# Update remaining old card backgrounds that weren't caught
content = content.replace(
    "background:rgba(20,35,60,0.4);",
    "background:rgba(15,12,50,0.4);"
)
content = content.replace(
    "background:rgba(20,35,60,0.6);",
    "background:rgba(15,12,50,0.5);"
)
content = content.replace(
    "background:rgba(20,35,60,0.5);",
    "background:rgba(15,12,50,0.45);"
)

# Update old border colors to purple tones
content = content.replace(
    "border:1px solid rgba(65,110,160,0.15);",
    "border:1px solid rgba(139,92,246,0.15);"
)
content = content.replace(
    "border:1px solid rgba(65,110,160,0.25);",
    "border:1px solid rgba(139,92,246,0.2);"
)
content = content.replace(
    "border:1px solid rgba(65,110,160,0.3);",
    "border:1px solid rgba(139,92,246,0.25);"
)
content = content.replace(
    "border:1px solid rgba(65,110,160,0.4);",
    "border:1px solid rgba(139,92,246,0.3);"
)
content = content.replace(
    "border: 1px solid rgba(65, 110, 160, 0.32);",
    "border: 1px solid rgba(139, 92, 246, 0.25);"
)

# Update inline style borders in JS-rendered HTML
content = content.replace(
    "border-color:rgba(65,110,160,0.1);",
    "border-color:rgba(139,92,246,0.1);"
)

# Update background colors in inline styles
content = content.replace(
    "background:rgba(10,18,35,0.6);",
    "background:rgba(13,11,46,0.6);"
)
content = content.replace(
    "background:rgba(10,18,35,0.8);",
    "background:rgba(13,11,46,0.8);"
)

# Journey detail popup
content = content.replace(
    "background:linear-gradient(135deg,#1a2744 0%,#0d1b2a 100%);",
    "background:linear-gradient(135deg,#15103a 0%,#0d0b2e 100%);"
)

# Badge detail card
content = content.replace(
    "background:linear-gradient(160deg,#1a2a4a,#0f1f3a);",
    "background:linear-gradient(160deg,#15103a,#0d0b2e);"
)

# Settings and misc backgrounds
content = content.replace(
    "background:rgba(255,255,255,0.08);",
    "background:rgba(139,92,246,0.1);"
)

# Tab active states - use purple instead of red
content = content.replace(
    "border-color: #FF6B6B;\n  background: rgba(255,107,107,0.15);\n  color: #FF6B6B;\n  text-shadow: 0 0 8px rgba(255,107,107,0.4);\n  box-shadow: 0 0 12px rgba(255,107,107,0.2);",
    "border-color: #A78BFA;\n  background: rgba(167,139,250,0.15);\n  color: #A78BFA;\n  text-shadow: 0 0 8px rgba(167,139,250,0.4);\n  box-shadow: 0 0 12px rgba(167,139,250,0.2);"
)

# Testament tab borders
content = content.replace(
    "border: 2px solid rgba(65,105,155,0.3);",
    "border: 2px solid rgba(139,92,246,0.25);"
)

# ============================================================
# 17. ADD FLOATING CRYSTALS CSS ANIMATION
# ============================================================
crystal_css = """
/* === FLOATING CRYSTALS DECORATION === */
@keyframes floatCrystal {
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.4; }
  50% { transform: translateY(-15px) rotate(180deg); opacity: 0.7; }
}
.app::after {
  content: '💎';
  position: fixed;
  top: 15%;
  right: 8%;
  font-size: 16px;
  animation: floatCrystal 4s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
  opacity: 0.4;
}
.app::before {
  content: '💎';
  position: fixed;
  bottom: 25%;
  left: 5%;
  font-size: 12px;
  animation: floatCrystal 5s ease-in-out infinite 1s;
  pointer-events: none;
  z-index: 0;
  opacity: 0.3;
}
"""

# Insert before the closing </style> tag (first one)
content = content.replace("</style>", crystal_css + "</style>", 1)

# ============================================================
# 18. HOME CARDS - Update inline styles in JS
# ============================================================
# Update home-card backgrounds rendered in JS
content = content.replace(
    "background:linear-gradient(160deg,#1a2a4a,#152040)",
    "background:rgba(15,12,50,0.6);backdrop-filter:blur(10px)"
)

# Update settings screen background
content = content.replace(
    "background:rgba(255,255,255,0.08);border:none;color:#dde4f0;",
    "background:rgba(139,92,246,0.12);border:1px solid rgba(139,92,246,0.2);color:#dde4f0;"
)

print("✅ Redesign v2 applied successfully!")
print("   - Deep space background (#0D0B2E)")
print("   - Glassmorphism cards with backdrop-blur")
print("   - Neon purple borders with glow")
print("   - Floating crystal decorations")
print("   - Enhanced particle background")
print("   - Purple-themed navigation")
print("   - Cosmic store overlay")

with open(FILE, 'w', encoding='utf-8') as f:
    f.write(content)
