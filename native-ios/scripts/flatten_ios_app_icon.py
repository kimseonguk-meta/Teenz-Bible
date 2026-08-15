#!/usr/bin/env python3
"""Flatten the source Teenz Bible iOS icon into an Apple-compliant opaque PNG."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets-source" / "teenz-bible-app-icon-source.png"
DESTINATION = ROOT / "ios" / "App" / "App" / "Assets.xcassets" / "AppIcon.appiconset" / "AppIcon-512@2x.png"
BACKGROUND = (23, 18, 13)  # Teenz Bible dark-brown brand surface (#17120d)
EXPECTED_SIZE = (1024, 1024)

source = Image.open(SOURCE).convert("RGBA")
if source.size != EXPECTED_SIZE:
    raise ValueError(f"Expected {EXPECTED_SIZE[0]}×{EXPECTED_SIZE[1]} source icon, got {source.size}")

opaque = Image.new("RGB", source.size, BACKGROUND)
opaque.paste(source, mask=source.getchannel("A"))
opaque.save(DESTINATION, "PNG", optimize=True)

verified = Image.open(DESTINATION)
if verified.size != EXPECTED_SIZE or verified.mode != "RGB":
    raise RuntimeError(f"Output must be opaque 1024×1024 RGB PNG; got {verified.size} {verified.mode}")
print(f"Created opaque App Icon: {DESTINATION}")
