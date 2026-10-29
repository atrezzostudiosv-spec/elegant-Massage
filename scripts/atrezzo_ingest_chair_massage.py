#!/usr/bin/env python3
"""Atrezzo Elegant Massage / Chair massage photo ingestion.

Safely writes two responsive WebP variants from one actual, local, AI-generated
image. This command does not fetch or guess a source image; it fails closed.
The ChatGPT generation is provided in the phase-4 delivery archive.
Usage:
    python scripts/atrezzo_ingest_chair_massage.py /path/to/chair-original.png

Outputs are in assets/images; commit binary files before changing the page CSS.
"""
from __future__ import annotations
import hashlib
import json
import sys
from pathlib import Path
from PIL import Image, ImageOps

OUTPUT = Path("assets/images")
OUTPUT.mkdir(parents=True, exist_ok=True)
SCENES = [
    ("elegant-massage-chair-massage-cinematic-desktop.webp", (1600, 900), (0.50, 0.50), 84),
    ("elegant-massage-chair-massage-cinematic-mobile.webp", (900, 1200), (0.75, 0.50), 84),
]

def main():
    if len(sys.argv) != 2:
        raise SystemExit("Pass one locally supplied approved original image path.")
    source = Path(sys.argv[1])
    if not source.is_file():
        raise SystemExit("Missing approved source image: " + str(source))
    with Image.open(source) as opened:
        opened.load()
        image = ImageOps.exif_transpose(opened).convert("RGB")
    if image.width < 1200 or image.height < 800:
        raise SystemExit(f"Unexpectedly small source: {image.size}")
    results = []
    for filename, size, focal, quality in SCENES:
        cropped = ImageOps.fit(image, size, method=Image.Resampling.LANCZOS, centering=focal)
        path = OUTPUT / filename
        cropped.save(path, "WEBP", quality=quality, method=6)
        with Image.open(path) as check:
            check.verify()
        results.append({"filename":str(path),"dimensions":list(size),
           "bytes":path.stat().st_size,
           "sha256":hashlib.sha256(path.read_bytes()).hexdigest()})
    manifest=Path("docs/FASE-04-CHAIR-MASSAGE-ARCHIVOS.json")
    manifest.write_text(json.dumps({"provenance":"AI-generated illustrative scene, NOT real personnel or premises",
       "source_name":source.name,
       "source_sha256":hashlib.sha256(source.read_bytes()).hexdigest(),
       "assets":results},indent=2)+"\n",encoding="utf-8")
    print(json.dumps(results,indent=2))

if __name__=="__main__":
    main()
