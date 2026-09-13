#!/usr/bin/env python3
"""Overlay classic meme top/bottom captions on a base image.

Usage:
    python3 overlay_meme.py <input.jpg> <output.jpg|png> "<TOP TEXT>" "<BOTTOM TEXT>"

Keeps the classic Impact-style look: bold white text with black stroke,
auto-shrinking to fit within 30% of image height per band.
"""
import sys
from PIL import Image, ImageDraw, ImageFont

FONT_PATH = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"


def meme_text(draw, W, H, text, y_center, base_size=92):
    size = base_size
    while size > 20:
        font = ImageFont.truetype(FONT_PATH, size)
        words, lines, cur = text.split(), [], ""
        for w in words:
            t = (cur + " " + w).strip()
            if draw.textlength(t, font=font) <= W * 0.94:
                cur = t
            else:
                lines.append(cur)
                cur = w
        lines.append(cur)
        bh = sum(draw.textbbox((0, 0), l, font=font)[3] for l in lines) + 12 * (len(lines) - 1)
        if bh <= H * 0.30:
            break
        size -= 6
    font = ImageFont.truetype(FONT_PATH, size)
    y = y_center - bh / 2
    for line in lines:
        bb = draw.textbbox((0, 0), line, font=font)
        x = (W - (bb[2] - bb[0])) / 2 - bb[0]
        draw.text((x, y), line, font=font, fill="white",
                  stroke_width=max(2, size // 18), stroke_fill="black")
        y += (bb[3] - bb[1]) + 12


def main():
    if len(sys.argv) != 5:
        print(__doc__)
        sys.exit(1)
    src, dst, top, bottom = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
    img = Image.open(src).convert("RGB")
    W, H = img.size
    d = ImageDraw.Draw(img)
    meme_text(d, W, H, top, H * 0.10)
    meme_text(d, W, H, bottom, H * 0.90)
    if dst.lower().endswith(".png"):
        img.save(dst, "PNG")
    else:
        img.save(dst, "JPEG", quality=88)
    print("ok", dst, img.size)


if __name__ == "__main__":
    main()
