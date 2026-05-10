#!/usr/bin/env python3
"""
Redesign Teenz Bible UI to match the slide presentation style:
- Deep navy background (#0A0A2E)
- Neon purple accents (#8B5CF6, #A78BFA)
- Gold highlights (#FFD700)
- Glassmorphism cards
- Purple glow effects
"""

filepath = '/home/ubuntu/teens-bible-app/firebase-deploy/app.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = [
    # Body backgrounds
    ('background: #060a20', 'background: #0A0A2E'),
    ('background:#060a20', 'background:#0A0A2E'),
    ('background-color: #060a20', 'background-color: #0A0A2E'),
    ('background: #0a1628', 'background: #0A0A2E'),
    ('background:#0a1628', 'background:#0A0A2E'),
    ('background: #0d1b2a', 'background: #0A0A2E'),
    
    # Card backgrounds -> glassmorphism
    ('background: linear-gradient(135deg, #1a3a5c, #0d2240)', 'background: rgba(139, 92, 246, 0.08); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px)'),
    ('background:linear-gradient(135deg, #1a3a5c, #0d2240)', 'background: rgba(139, 92, 246, 0.08); backdrop-filter: blur(12px)'),
    ('background: linear-gradient(135deg, #1e3a5f, #0f2744)', 'background: rgba(139, 92, 246, 0.08); backdrop-filter: blur(12px)'),
    ('background: linear-gradient(135deg,#1a3a5c,#0d2240)', 'background: rgba(139, 92, 246, 0.08); backdrop-filter: blur(12px)'),
    ('background: linear-gradient(145deg, #1a3a5c, #0d2240)', 'background: rgba(139, 92, 246, 0.08); backdrop-filter: blur(12px)'),
    
    # Card borders -> purple
    ('border: 1px solid #2c4565', 'border: 1px solid rgba(139, 92, 246, 0.3)'),
    ('border:1px solid #2c4565', 'border:1px solid rgba(139, 92, 246, 0.3)'),
    ('border: 1px solid #253a58', 'border: 1px solid rgba(139, 92, 246, 0.3)'),
    ('border: 1px solid #1e3250', 'border: 1px solid rgba(139, 92, 246, 0.3)'),
    ('border: 1px solid rgba(70, 115, 170, 0.3)', 'border: 1px solid rgba(139, 92, 246, 0.3)'),
    ('border: 1px solid rgba(70,115,170,0.3)', 'border: 1px solid rgba(139, 92, 246, 0.3)'),
    
    # Cyan accents -> purple
    ('#00E5FF', '#A78BFA'),
    ('#00e5ff', '#A78BFA'),
    
    # Active nav amber -> purple
    ('color: #F59E0B', 'color: #A78BFA'),
    ('color:#F59E0B', 'color:#A78BFA'),
    ('color: #f59e0b', 'color: #A78BFA'),
    
    # Progress bars
    ('background: linear-gradient(90deg, #00E5FF, #00B8D4)', 'background: linear-gradient(90deg, #8B5CF6, #A78BFA)'),
    ('background: linear-gradient(90deg, #FFD700, #FFA000)', 'background: linear-gradient(90deg, #8B5CF6, #C084FC)'),
    
    # Nav bar
    ('background: linear-gradient(180deg, #0d2240, #091a30)', 'background: rgba(10, 10, 46, 0.9); backdrop-filter: blur(20px)'),
    ('border-top: 1px solid #1e3250', 'border-top: 1px solid rgba(139, 92, 246, 0.4)'),
    
    # Buttons
    ('background: linear-gradient(135deg, #00E5FF, #00B8D4)', 'background: linear-gradient(135deg, #8B5CF6, #7C3AED)'),
    ('background: #00B8D4', 'background: #7C3AED'),
    ('background:#00B8D4', 'background:#7C3AED'),
    ('background: #00b8d4', 'background: #7C3AED'),
    
    # Text shadows
    ('text-shadow: 0 0 10px #F59E0B', 'text-shadow: 0 0 10px #A78BFA'),
    ('text-shadow: 0 0 10px #f59e0b', 'text-shadow: 0 0 10px #A78BFA'),
    
    # Section headers
    ('color: #4FC3F7', 'color: #C4B5FD'),
    ('color:#4FC3F7', 'color:#C4B5FD'),
    ('color: #4fc3f7', 'color: #C4B5FD'),
    
    # Darker card variants
    ('background: #0d2240', 'background: rgba(15, 15, 50, 0.7)'),
    ('background:#0d2240', 'background:rgba(15, 15, 50, 0.7)'),
    ('background: #091a30', 'background: rgba(10, 10, 40, 0.8)'),
    ('background:#091a30', 'background:rgba(10, 10, 40, 0.8)'),
    ('background: #0f2744', 'background: rgba(15, 15, 50, 0.6)'),
    ('background:#0f2744', 'background:rgba(15, 15, 50, 0.6)'),
    
    # More card patterns
    ('background: #1a3a5c', 'background: rgba(139, 92, 246, 0.12)'),
    ('background:#1a3a5c', 'background:rgba(139, 92, 246, 0.12)'),
    ('background: #253a58', 'background: rgba(139, 92, 246, 0.08)'),
    ('background:#253a58', 'background:rgba(139, 92, 246, 0.08)'),
    ('background: #1e3a5f', 'background: rgba(139, 92, 246, 0.1)'),
    
    # Hover states
    ('background: rgba(0, 229, 255, 0.1)', 'background: rgba(139, 92, 246, 0.15)'),
    ('background: rgba(0,229,255,0.1)', 'background: rgba(139, 92, 246, 0.15)'),
    
    # Box shadows
    ('box-shadow: 0 0 20px rgba(0, 229, 255, 0.3)', 'box-shadow: 0 0 20px rgba(139, 92, 246, 0.3)'),
    ('box-shadow: 0 0 20px rgba(0,229,255,0.3)', 'box-shadow: 0 0 20px rgba(139, 92, 246, 0.3)'),
    
    # Stat card backgrounds
    ('background: linear-gradient(135deg, #1a3a5c, #253a58)', 'background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.25)'),
    ('background: linear-gradient(135deg, #0d2240, #1a3a5c)', 'background: rgba(139, 92, 246, 0.08); border: 1px solid rgba(139, 92, 246, 0.2)'),
]

for old, new in replacements:
    content = content.replace(old, new)

# Add particle animation CSS
particle_css = """
/* Purple Particle Animation */
@keyframes particleFloat {
  0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
  25% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
  50% { transform: translateY(-40px) translateX(-5px); opacity: 0.4; }
  75% { transform: translateY(-20px) translateX(15px); opacity: 0.5; }
}
.particle-bg::before {
  content: '';
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(ellipse at 20% 50%, rgba(139, 92, 246, 0.05) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 20%, rgba(167, 139, 250, 0.03) 0%, transparent 40%);
  pointer-events: none;
  z-index: 0;
}
"""
content = content.replace('</style>', particle_css + '\n</style>', 1)

# Add particle-bg class to body
content = content.replace('<body>', '<body class="particle-bg">', 1)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ UI Redesign applied successfully!")
print(f"File size: {len(content):,} bytes")
