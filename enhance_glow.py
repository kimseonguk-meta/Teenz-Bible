#!/usr/bin/env python3
"""Enhance the neon glow to be more intense - matching the mockup's very bright borders"""
import re

INPUT = 'firebase-deploy/app.html'
with open(INPUT, 'r', encoding='utf-8') as f:
    html = f.read()

# Make card borders brighter and glow more intense
replacements = [
    # Home card - increase glow intensity
    (
        'border: 1.5px solid rgba(139, 92, 246, 0.6); border-radius: 16px; padding: 20px; margin-bottom: 16px; box-shadow: 0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.1), inset 0 1px 0 rgba(139, 92, 246, 0.2);',
        'border: 2px solid rgba(139, 92, 246, 0.8); border-radius: 16px; padding: 20px; margin-bottom: 16px; box-shadow: 0 0 25px rgba(139, 92, 246, 0.5), 0 0 50px rgba(139, 92, 246, 0.2), inset 0 1px 0 rgba(139, 92, 246, 0.3);'
    ),
    # Profile stat box - more glow
    (
        '.profile-stat-box { background: rgba(15, 10, 50, 0.7); backdrop-filter: blur(12px); border: 1.5px solid rgba(139, 92, 246, 0.6); border-radius: 12px; padding: 14px 8px; text-align: center; box-shadow: 0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.1); }',
        '.profile-stat-box { background: rgba(15, 10, 50, 0.65); backdrop-filter: blur(12px); border: 2px solid rgba(139, 92, 246, 0.7); border-radius: 12px; padding: 14px 8px; text-align: center; box-shadow: 0 0 25px rgba(139, 92, 246, 0.4), 0 0 50px rgba(139, 92, 246, 0.15); }'
    ),
    # Profile grid item - more glow
    (
        '.profile-grid-item { background: rgba(15, 10, 50, 0.6); backdrop-filter: blur(12px); border: 1.5px solid rgba(139, 92, 246, 0.5); border-radius: 14px; padding: 16px 10px; text-align: center; cursor: pointer; transition: transform 0.15s, border-color 0.2s, background 0.2s, box-shadow 0.2s; box-shadow: 0 0 12px rgba(139, 92, 246, 0.2); }',
        '.profile-grid-item { background: rgba(15, 10, 50, 0.55); backdrop-filter: blur(12px); border: 2px solid rgba(139, 92, 246, 0.6); border-radius: 14px; padding: 16px 10px; text-align: center; cursor: pointer; transition: transform 0.15s, border-color 0.2s, background 0.2s, box-shadow 0.2s; box-shadow: 0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.1); }'
    ),
    # Stat boxes
    (
        "border: 1.5px solid rgba(139, 92, 246, 0.6);\n  box-shadow: 0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.1);\n}",
        "border: 2px solid rgba(139, 92, 246, 0.75);\n  box-shadow: 0 0 25px rgba(139, 92, 246, 0.5), 0 0 50px rgba(139, 92, 246, 0.2);\n}"
    ),
    # Level bar
    (
        "border: 1.5px solid rgba(139, 92, 246, 0.6);\n  box-shadow: 0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.1);\n}",
        "border: 2px solid rgba(139, 92, 246, 0.75);\n  box-shadow: 0 0 25px rgba(139, 92, 246, 0.5), 0 0 50px rgba(139, 92, 246, 0.2);\n}"
    ),
]

count = 0
for old, new in replacements:
    if old in html:
        html = html.replace(old, new, 1)
        count += 1

print(f"Enhanced {count} glow definitions")

with open(INPUT, 'w', encoding='utf-8') as f:
    f.write(html)
print("Done!")
