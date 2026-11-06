#!/usr/bin/env python3
"""Deterministic Open Graph image for Elegant Massage. No user photos fabricated."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import os

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "brand" / "elegant-massage-social-share.png"
OUT.parent.mkdir(parents=True, exist_ok=True)
SIZE = (1200, 630)
OCEAN = "#254460"
IVORY = "#F5F1EA"
SAGE = "#CCECC7"
font_candidates = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
    "/usr/share/fonts/truetype/liberation2/LiberationSerif-Regular.ttf",
]
italic_candidates = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Italic.ttf",
    "/usr/share/fonts/truetype/liberation2/LiberationSerif-Italic.ttf",
]
sans_candidates = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
]

def face(candidates, size):
    for filename in candidates:
        if os.path.isfile(filename):
            return ImageFont.truetype(filename, size)
    return ImageFont.load_default()

im = Image.new("RGB", SIZE, OCEAN)
draw = ImageDraw.Draw(im)
draw.rectangle((35,35,1165,595), outline=SAGE, width=2)
draw.line((90,132,345,132), fill=SAGE, width=3)
draw.text((92,202), "Elegant Massage", font=face(font_candidates, 91), fill=IVORY)
draw.text((95,360), "FLOWER MOUND  ·  TEXAS", font=face(sans_candidates, 22), fill=SAGE)
draw.text((95,455), "Touch, Considered.", font=face(italic_candidates, 47), fill=IVORY)
im.save(OUT, "PNG", optimize=True)
print("Generated", OUT.relative_to(ROOT), OUT.stat().st_size, "bytes", im.size)
