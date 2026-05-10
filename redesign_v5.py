#!/usr/bin/env python3
"""
Teenz Bible - Neon Cosmic Redesign v5
Strategy: Instead of trying to override inline styles with CSS selectors,
we directly REPLACE the CSS class definitions in the <style> block.
The app uses CSS classes (.home-card, .nav, .hero, etc.) - we rewrite those definitions.
We also replace specific inline style patterns in the HTML body.
"""

import re

INPUT = '/home/ubuntu/teens-bible-app/firebase-deploy/app.html'
OUTPUT = '/home/ubuntu/teens-bible-app/firebase-deploy/app.html'

with open(INPUT, 'r', encoding='utf-8') as f:
    html = f.read()

# ============================================================
# STEP 1: Replace existing CSS class definitions with neon cosmic versions
# ============================================================

replacements = [
    # HOME CARD - the main card style used throughout
    (
        '.home-card { background: linear-gradient(160deg, #1a2d4a, #152238); border: 1px solid rgba(56, 189, 248, 0.15); border-radius: 16px; padding: 20px; margin-bottom: 16px; }',
        '.home-card { background: rgba(15, 10, 50, 0.7); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1.5px solid rgba(139, 92, 246, 0.6); border-radius: 16px; padding: 20px; margin-bottom: 16px; box-shadow: 0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.1), inset 0 1px 0 rgba(139, 92, 246, 0.2); }'
    ),
    # HOME CARD LABEL
    (
        '.home-card-label { font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }',
        '.home-card-label { font-size: 13px; color: #a78bfa; text-transform: uppercase; letter-spacing: 0.5px; text-shadow: 0 0 8px rgba(167, 139, 250, 0.5); }'
    ),
    # HOME PROGRESS BAR
    (
        '.home-progress-fill { height: 100%; background: linear-gradient(90deg, #22d3ee, #06b6d4); border-radius: 3px; transition: width 0.5s; }',
        '.home-progress-fill { height: 100%; background: linear-gradient(90deg, #8B5CF6, #A78BFA, #06B6D4); border-radius: 3px; transition: width 0.5s; box-shadow: 0 0 10px rgba(139, 92, 246, 0.6); }'
    ),
    # HOME RESUME BUTTON
    (
        '.home-resume-btn { display: inline-block; margin-top: 14px; padding: 10px 24px; background: linear-gradient(135deg, #06b6d4, #0891b2); color: white; border-radius: 25px; font-weight: 600; font-size: 14px; cursor: pointer; }',
        '.home-resume-btn { display: inline-block; margin-top: 14px; padding: 10px 24px; background: linear-gradient(135deg, #8B5CF6, #7C3AED); color: white; border-radius: 25px; font-weight: 600; font-size: 14px; cursor: pointer; box-shadow: 0 0 15px rgba(139, 92, 246, 0.5); border: 1px solid rgba(167, 139, 250, 0.4); }'
    ),
    # STREAK CARD - change from red/orange to neon purple
    (
        '.streak-card { background:linear-gradient(135deg, rgba(255,107,107,0.12), rgba(255,159,67,0.08)); border:1px solid rgba(255,107,107,0.25); border-radius:16px; padding:16px; margin-bottom:16px; display:flex; align-items:center; gap:14px; }',
        '.streak-card { background: rgba(15, 10, 50, 0.7); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1.5px solid rgba(255, 215, 0, 0.5); border-radius: 16px; padding: 16px; margin-bottom: 16px; display:flex; align-items:center; gap:14px; box-shadow: 0 0 15px rgba(255, 215, 0, 0.2), 0 0 30px rgba(255, 215, 0, 0.1); }'
    ),
    # STREAK COUNT COLOR
    (
        ".streak-count { font-family:'Bangers',cursive; font-size:28px; color:#FF6B6B; }",
        ".streak-count { font-family:'Bangers',cursive; font-size:28px; color:#FFD700; text-shadow: 0 0 10px rgba(255, 215, 0, 0.5); }"
    ),
    # VOTD CARD
    (
        '.votd-card { background: linear-gradient(160deg, #0c2d4a, #0a1e3a); border-color: rgba(56, 189, 248, 0.2); }',
        '.votd-card { background: rgba(15, 10, 50, 0.7); border-color: rgba(139, 92, 246, 0.5); box-shadow: 0 0 15px rgba(139, 92, 246, 0.2); }'
    ),
    # MEME CARD
    (
        '.meme-card { cursor: pointer; transition: transform 0.2s; overflow: visible; }',
        '.meme-card { cursor: pointer; transition: transform 0.2s; overflow: visible; border-color: rgba(236, 72, 153, 0.5) !important; box-shadow: 0 0 15px rgba(236, 72, 153, 0.2) !important; }'
    ),
    # STREAK CARD (second definition)
    (
        '.streak-card { background: linear-gradient(160deg, #1a2d4a, #152238); }',
        '.streak-card { background: rgba(15, 10, 50, 0.7); backdrop-filter: blur(12px); border: 1.5px solid rgba(255, 215, 0, 0.5); box-shadow: 0 0 15px rgba(255, 215, 0, 0.2); }'
    ),
    # NAV - already has some neon but let's enhance
    (
        'background: rgba(13, 11, 46, 0.85); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);\n  border-top: 1.5px solid rgba(139, 92, 246, 0.35); box-shadow: 0 -4px 20px rgba(139, 92, 246, 0.1);',
        'background: rgba(8, 5, 30, 0.95); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);\n  border-top: 2px solid rgba(139, 92, 246, 0.6); box-shadow: 0 -4px 30px rgba(139, 92, 246, 0.3), 0 -2px 15px rgba(139, 92, 246, 0.2);'
    ),
    # NAV ACTIVE BUTTON
    (
        '.nav-btn.active { color: #A78BFA; filter: drop-shadow(0 0 8px rgba(167, 139, 250, 0.6)); }',
        '.nav-btn.active { color: #C4B5FD; filter: drop-shadow(0 0 12px rgba(167, 139, 250, 0.8)); text-shadow: 0 0 15px rgba(167, 139, 250, 0.9); }'
    ),
    (
        '.nav-btn.active .icon { transform: scale(1.15); filter: drop-shadow(0 0 8px rgba(167, 139, 250, 0.7)); }',
        '.nav-btn.active .icon { transform: scale(1.2); filter: drop-shadow(0 0 15px rgba(167, 139, 250, 0.9)); }'
    ),
    # HERO CARD - make the border glow brighter
    (
        'border: 2px solid rgba(255, 215, 0, 0.45);\n  box-shadow: 0 0 25px rgba(255, 215, 0, 0.2), 0 0 50px rgba(255, 215, 0, 0.08), inset 0 1px 0 rgba(255,215,0,0.15);',
        'border: 2px solid rgba(255, 215, 0, 0.7);\n  box-shadow: 0 0 30px rgba(255, 215, 0, 0.4), 0 0 60px rgba(255, 215, 0, 0.15), inset 0 1px 0 rgba(255,215,0,0.25);'
    ),
    # STAT BOXES
    (
        '.stat {\n  padding: 20px 10px;\n  text-align: center;\n  background: rgba(15, 12, 50, 0.6);\n  backdrop-filter: blur(10px);\n  -webkit-backdrop-filter: blur(10px);\n  border: 1.5px solid rgba(139, 92, 246, 0.35);\n  box-shadow: 0 0 12px rgba(139, 92, 246, 0.1);\n}',
        '.stat {\n  padding: 20px 10px;\n  text-align: center;\n  background: rgba(15, 10, 50, 0.7);\n  backdrop-filter: blur(12px);\n  -webkit-backdrop-filter: blur(12px);\n  border: 1.5px solid rgba(139, 92, 246, 0.6);\n  box-shadow: 0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.1);\n}'
    ),
    # LEVEL BAR
    (
        '.level-bar {\n  padding: 16px; margin: 16px 0;\n  background: rgba(15, 12, 50, 0.6);\n  backdrop-filter: blur(10px);\n  -webkit-backdrop-filter: blur(10px);\n  border: 1.5px solid rgba(139, 92, 246, 0.35);\n  box-shadow: 0 0 12px rgba(139, 92, 246, 0.1);\n}',
        '.level-bar {\n  padding: 16px; margin: 16px 0;\n  background: rgba(15, 10, 50, 0.7);\n  backdrop-filter: blur(12px);\n  -webkit-backdrop-filter: blur(12px);\n  border: 1.5px solid rgba(139, 92, 246, 0.6);\n  box-shadow: 0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.1);\n}'
    ),
    # XP FILL - make it glow more
    (
        '.xp-fill {\n  height: 100%;\n  border-radius: 10px;\n  background: linear-gradient(90deg, #8B5CF6, #A78BFA, #06B6D4);\n  transition: width 0.5s;\n  box-shadow: 0 0 14px rgba(139,92,246,0.8), 0 0 28px rgba(167,139,250,0.4), 0 0 40px rgba(6,182,212,0.2);\n}',
        '.xp-fill {\n  height: 100%;\n  border-radius: 10px;\n  background: linear-gradient(90deg, #8B5CF6, #C084FC, #06B6D4);\n  transition: width 0.5s;\n  box-shadow: 0 0 20px rgba(139,92,246,1), 0 0 40px rgba(167,139,250,0.6), 0 0 60px rgba(6,182,212,0.3);\n}'
    ),
    # PROFILE AVATAR RING
    (
        '.profile-avatar-ring { width: 80px; height: 80px; border-radius: 50%; border: 3px solid; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; transition: box-shadow 0.3s; overflow: visible; position: relative; }',
        '.profile-avatar-ring { width: 80px; height: 80px; border-radius: 50%; border: 3px solid rgba(139, 92, 246, 0.8); display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; transition: box-shadow 0.3s; overflow: visible; position: relative; box-shadow: 0 0 25px rgba(139, 92, 246, 0.7), 0 0 50px rgba(139, 92, 246, 0.4), inset 0 0 15px rgba(139, 92, 246, 0.2); animation: avatarGlow 3s ease-in-out infinite; }'
    ),
    # PROFILE STAT BOX
    (
        '.profile-stat-box { background: rgba(15, 12, 50, 0.6); backdrop-filter: blur(10px); border: 1.5px solid rgba(139, 92, 246, 0.35); border-radius: 12px; padding: 14px 8px; text-align: center; box-shadow: 0 0 10px rgba(139, 92, 246, 0.1); }',
        '.profile-stat-box { background: rgba(15, 10, 50, 0.7); backdrop-filter: blur(12px); border: 1.5px solid rgba(139, 92, 246, 0.6); border-radius: 12px; padding: 14px 8px; text-align: center; box-shadow: 0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.1); }'
    ),
    # PROFILE GRID ITEM
    (
        '.profile-grid-item { background: rgba(15, 12, 50, 0.5); backdrop-filter: blur(8px); border: 1.5px solid rgba(139, 92, 246, 0.25); border-radius: 14px; padding: 16px 10px; text-align: center; cursor: pointer; transition: transform 0.15s, border-color 0.2s, background 0.2s, box-shadow 0.2s; }',
        '.profile-grid-item { background: rgba(15, 10, 50, 0.6); backdrop-filter: blur(12px); border: 1.5px solid rgba(139, 92, 246, 0.5); border-radius: 14px; padding: 16px 10px; text-align: center; cursor: pointer; transition: transform 0.15s, border-color 0.2s, background 0.2s, box-shadow 0.2s; box-shadow: 0 0 12px rgba(139, 92, 246, 0.2); }'
    ),
    # STORE CARD V2
    (
        ".store-card-v2 { background:linear-gradient(160deg, #1a2a4a, #152040); border:1px solid rgba(139,92,246,0.25); border-radius:20px; padding:20px; max-width:380px; width:90%; max-height:82vh; overflow-y:auto; display:flex; flex-direction:column; }",
        ".store-card-v2 { background: rgba(15, 10, 50, 0.85); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); border: 1.5px solid rgba(139,92,246,0.6); border-radius:20px; padding:20px; max-width:380px; width:90%; max-height:82vh; overflow-y:auto; display:flex; flex-direction:column; box-shadow: 0 0 30px rgba(139, 92, 246, 0.3), 0 0 60px rgba(139, 92, 246, 0.1); }"
    ),
    # STORE TAB ACTIVE
    (
        ".store-tab-v2.active { background:rgba(139,92,246,0.2); color:#c4b5fd; }",
        ".store-tab-v2.active { background:rgba(139,92,246,0.3); color:#e9d5ff; box-shadow: 0 0 10px rgba(139, 92, 246, 0.4); border: 1px solid rgba(139, 92, 246, 0.5); }"
    ),
    # STORE QUICK ITEM
    (
        ".store-quick-item { text-align:center; padding:12px 4px; border-radius:12px; background:rgba(15,12,50,0.5); border:1px solid rgba(65,110,160,0.2); cursor:pointer; transition:all 0.2s; }",
        ".store-quick-item { text-align:center; padding:12px 4px; border-radius:12px; background:rgba(15,10,50,0.6); border:1px solid rgba(139,92,246,0.4); cursor:pointer; transition:all 0.2s; box-shadow: 0 0 8px rgba(139, 92, 246, 0.2); }"
    ),
    # STORE LIST ITEM
    (
        ".store-list-item { display:flex; align-items:center; justify-content:space-between; padding:10px 12px; margin-bottom:6px; border-radius:10px; background:rgba(15,12,50,0.4); border:1px solid rgba(139,92,246,0.15); }",
        ".store-list-item { display:flex; align-items:center; justify-content:space-between; padding:10px 12px; margin-bottom:6px; border-radius:10px; background:rgba(15,10,50,0.6); border:1px solid rgba(139,92,246,0.4); box-shadow: 0 0 8px rgba(139, 92, 246, 0.15); }"
    ),
    # BODY BACKGROUND - make it more cosmic
    (
        "background: linear-gradient(180deg, #050318 0%, #0A0630 30%, #12083D 60%, #050318 100%);",
        "background: linear-gradient(180deg, #050318 0%, #0A0A2E 25%, #12083D 50%, #0A0630 75%, #050318 100%);"
    ),
]

# Apply all replacements
count = 0
for old, new in replacements:
    if old in html:
        html = html.replace(old, new)
        count += 1
        print(f"✅ Replaced: {old[:60]}...")
    else:
        print(f"⚠️  Not found: {old[:60]}...")

print(f"\n=== Applied {count}/{len(replacements)} CSS replacements ===\n")

# ============================================================
# STEP 2: Remove the old ineffective redesign override CSS
# ============================================================
# Remove the old NEON COSMIC REDESIGN block that used inline style selectors
old_redesign_start = '/* ============================================ */\n/* NEON COSMIC REDESIGN - AGGRESSIVE OVERRIDE   */\n/* ============================================ */'
old_redesign_end = '/* ============================================ */\n/* END NEON COSMIC REDESIGN                     */\n/* ============================================ */'

if old_redesign_start in html and old_redesign_end in html:
    start_idx = html.index(old_redesign_start)
    end_idx = html.index(old_redesign_end) + len(old_redesign_end)
    html = html[:start_idx] + '/* OLD REDESIGN REMOVED - NOW USING DIRECT CLASS MODIFICATIONS */' + html[end_idx:]
    print("✅ Removed old ineffective redesign override block")

# ============================================================
# STEP 3: Add enhanced CSS at the end of the last </style> block
# ============================================================
# Find the last </style> tag and inject our enhanced styles before it
enhanced_css = """
/* ============================================ */
/* NEON COSMIC v5 - ENHANCED GLOW & ANIMATIONS  */
/* ============================================ */

/* Avatar glow animation */
@keyframes avatarGlow {
  0%, 100% { box-shadow: 0 0 25px rgba(139, 92, 246, 0.7), 0 0 50px rgba(139, 92, 246, 0.4); border-color: rgba(139, 92, 246, 0.8); }
  50% { box-shadow: 0 0 35px rgba(139, 92, 246, 0.9), 0 0 70px rgba(139, 92, 246, 0.5); border-color: rgba(167, 139, 250, 1); }
}

/* Card hover/active glow pulse */
.home-card:active, .streak-card:active {
  box-shadow: 0 0 30px rgba(139, 92, 246, 0.5), 0 0 60px rgba(139, 92, 246, 0.2) !important;
  border-color: rgba(167, 139, 250, 0.8) !important;
}

/* Neon text for important labels */
.home-card-label, .votd-ref {
  color: #a78bfa !important;
  text-shadow: 0 0 8px rgba(167, 139, 250, 0.5) !important;
}

/* Gold accent for streak/special elements */
.streak-num, .streak-count {
  color: #FFD700 !important;
  text-shadow: 0 0 12px rgba(255, 215, 0, 0.5) !important;
}

/* Enhanced floating crystals */
[style*="floatCrystal"] {
  opacity: 0.8 !important;
  filter: drop-shadow(0 0 10px rgba(139, 92, 246, 0.8)) !important;
}

/* Profile invite button neon */
.profile-invite {
  background: linear-gradient(135deg, #8B5CF6, #7C3AED) !important;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.5) !important;
  border: 1px solid rgba(167, 139, 250, 0.5) !important;
}

/* Stats card glow */
.stats-card {
  border-color: rgba(139, 92, 246, 0.5) !important;
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.2) !important;
}

/* Leaderboard enhancements */
.lb-podium-card {
  border: 1.5px solid rgba(139, 92, 246, 0.6) !important;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.3) !important;
  background: rgba(15, 10, 50, 0.7) !important;
  backdrop-filter: blur(12px) !important;
}
.lb-podium-card.gold {
  border-color: rgba(255, 215, 0, 0.7) !important;
  box-shadow: 0 0 25px rgba(255, 215, 0, 0.4), 0 0 50px rgba(255, 215, 0, 0.15) !important;
}
.lb-podium-card.silver {
  border-color: rgba(139, 92, 246, 0.6) !important;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.3) !important;
}
.lb-podium-card.bronze {
  border-color: rgba(205, 127, 50, 0.6) !important;
  box-shadow: 0 0 20px rgba(205, 127, 50, 0.3) !important;
}

/* Leaderboard rows */
.lb-row {
  background: rgba(15, 10, 50, 0.5) !important;
  border: 1px solid rgba(139, 92, 246, 0.3) !important;
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.15) !important;
  border-radius: 12px !important;
}

/* Nav bar active indicator glow line */
.nav-btn.active::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 25%;
  right: 25%;
  height: 3px;
  background: linear-gradient(90deg, #8B5CF6, #C084FC);
  border-radius: 2px;
  box-shadow: 0 0 10px rgba(139, 92, 246, 0.8), 0 0 20px rgba(139, 92, 246, 0.4);
}

/* Enhanced cosmic background particles */
body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(2px 2px at 20% 30%, rgba(139, 92, 246, 0.4), transparent),
    radial-gradient(2px 2px at 40% 70%, rgba(6, 182, 212, 0.3), transparent),
    radial-gradient(1px 1px at 60% 20%, rgba(255, 255, 255, 0.3), transparent),
    radial-gradient(1px 1px at 80% 50%, rgba(167, 139, 250, 0.3), transparent),
    radial-gradient(2px 2px at 10% 80%, rgba(236, 72, 153, 0.2), transparent),
    radial-gradient(1px 1px at 70% 90%, rgba(255, 255, 255, 0.2), transparent),
    radial-gradient(1px 1px at 30% 50%, rgba(139, 92, 246, 0.2), transparent),
    radial-gradient(2px 2px at 90% 10%, rgba(6, 182, 212, 0.2), transparent);
  pointer-events: none;
  z-index: 0;
  animation: starTwinkle 8s ease-in-out infinite alternate;
}

@keyframes starTwinkle {
  0% { opacity: 0.6; }
  100% { opacity: 1; }
}

/* Make sure app content is above the star background */
.app {
  position: relative;
  z-index: 1;
}

/* Hot memes card */
.hot-memes-card {
  border-color: rgba(255, 215, 0, 0.4) !important;
  box-shadow: 0 0 12px rgba(255, 215, 0, 0.2) !important;
}

/* Continue card enhanced glow */
.continue-card {
  border-color: rgba(139, 92, 246, 0.6) !important;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.1) !important;
}

/* XP bar track darker */
.xp-track, .home-progress-bar, .profile-xp-bar {
  background: rgba(5, 5, 30, 0.8) !important;
  border: 1px solid rgba(139, 92, 246, 0.2) !important;
}

/* Profile XP fill */
.profile-xp-fill {
  background: linear-gradient(90deg, #8B5CF6, #C084FC, #06B6D4) !important;
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.8) !important;
}

/* Store action button buy */
.store-action-btn.buy {
  background: linear-gradient(135deg, #8B5CF6, #7C3AED) !important;
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.5) !important;
}

/* Journey/Bible book cards */
.book-card, .journey-book {
  background: rgba(15, 10, 50, 0.6) !important;
  border: 1px solid rgba(139, 92, 246, 0.4) !important;
  box-shadow: 0 0 10px rgba(139, 92, 246, 0.2) !important;
}

/* Chapter buttons */
.ch-btn {
  background: rgba(15, 10, 50, 0.5) !important;
  border: 1px solid rgba(139, 92, 246, 0.3) !important;
}
.ch-btn.read {
  background: rgba(139, 92, 246, 0.2) !important;
  border-color: rgba(139, 92, 246, 0.6) !important;
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.3) !important;
}

/* Settings rows */
.setting-row {
  background: rgba(15, 10, 50, 0.5) !important;
  border: 1px solid rgba(139, 92, 246, 0.25) !important;
  border-radius: 12px !important;
}

/* Reading screen */
.reading-content {
  background: rgba(10, 8, 40, 0.8) !important;
}

/* Quiz cards */
.quiz-option {
  background: rgba(15, 10, 50, 0.6) !important;
  border: 1px solid rgba(139, 92, 246, 0.3) !important;
  border-radius: 12px !important;
}
.quiz-option:active, .quiz-option.selected {
  border-color: rgba(139, 92, 246, 0.8) !important;
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.4) !important;
}

/* Badges */
.badge-item {
  background: rgba(15, 10, 50, 0.5) !important;
  border: 1px solid rgba(139, 92, 246, 0.3) !important;
  border-radius: 50% !important;
  box-shadow: 0 0 10px rgba(139, 92, 246, 0.2) !important;
}

/* Chat messages */
.chat-msg-ai {
  background: rgba(15, 10, 50, 0.7) !important;
  border: 1px solid rgba(139, 92, 246, 0.3) !important;
  border-radius: 16px !important;
}
.chat-msg-user {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(109, 40, 217, 0.4)) !important;
  border: 1px solid rgba(139, 92, 246, 0.5) !important;
  border-radius: 16px !important;
}

/* Chat input */
.chat-input-area {
  background: rgba(10, 8, 40, 0.9) !important;
  border-top: 1px solid rgba(139, 92, 246, 0.3) !important;
}
.chat-input-area input, .chat-input-area textarea {
  background: rgba(15, 10, 50, 0.8) !important;
  border: 1px solid rgba(139, 92, 246, 0.4) !important;
  border-radius: 20px !important;
  color: #e2e8f0 !important;
}

/* ============================================ */
/* END NEON COSMIC v5                           */
/* ============================================ */
"""

# Find the last </style> tag and insert before it
last_style_end = html.rfind('</style>')
if last_style_end != -1:
    html = html[:last_style_end] + enhanced_css + '\n' + html[last_style_end:]
    print("✅ Injected enhanced neon cosmic CSS before last </style>")

# ============================================================
# STEP 4: Fix inline styles that conflict with our design
# ============================================================

# Fix inline background colors on cards that override our CSS
inline_fixes = [
    # Fix any inline background that uses the old blue-dark gradient
    ('background:linear-gradient(160deg, #1a2d4a, #152238)', 'background:rgba(15,10,50,0.7)'),
    ('background: linear-gradient(160deg, #1a2d4a, #152238)', 'background: rgba(15,10,50,0.7)'),
    ('background:linear-gradient(160deg,#1a2d4a,#152238)', 'background:rgba(15,10,50,0.7)'),
    # Fix old border colors
    ('border:1px solid rgba(56,189,248,0.15)', 'border:1.5px solid rgba(139,92,246,0.5)'),
    ('border: 1px solid rgba(56, 189, 248, 0.15)', 'border: 1.5px solid rgba(139, 92, 246, 0.5)'),
    ('border:1px solid rgba(56,189,248,0.2)', 'border:1.5px solid rgba(139,92,246,0.5)'),
    ('border: 1px solid rgba(56, 189, 248, 0.2)', 'border: 1.5px solid rgba(139, 92, 246, 0.5)'),
    # Fix button colors from cyan to purple
    ('background:linear-gradient(135deg,#06b6d4,#0891b2)', 'background:linear-gradient(135deg,#8B5CF6,#7C3AED)'),
    ('background: linear-gradient(135deg, #06b6d4, #0891b2)', 'background: linear-gradient(135deg, #8B5CF6, #7C3AED)'),
]

inline_count = 0
for old, new in inline_fixes:
    occurrences = html.count(old)
    if occurrences > 0:
        html = html.replace(old, new)
        inline_count += occurrences
        print(f"✅ Fixed {occurrences}x inline: {old[:50]}...")

print(f"\n=== Fixed {inline_count} inline style occurrences ===\n")

# ============================================================
# STEP 5: Write the result
# ============================================================
with open(OUTPUT, 'w', encoding='utf-8') as f:
    f.write(html)

print(f"✅ Done! File saved to {OUTPUT}")
print(f"   File size: {len(html):,} bytes")
