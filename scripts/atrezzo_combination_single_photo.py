#!/usr/bin/env python3
"""Elegant Massage — a SINGLE source photograph for Combination Massage.
Produces two crops of the same genuine Pexels photograph. Illustration only.
The old two-image diptych is preserved for audit but no longer used in the Home.
"""
import hashlib, io, json
from pathlib import Path
import requests
from PIL import Image, ImageOps, ImageEnhance
PHOTO_ID=7365398
SOURCE="https://www.pexels.com/photo/a-man-having-a-back-massage-7365398/"
PHOTO=f"https://images.pexels.com/photos/{PHOTO_ID}/pexels-photo-{PHOTO_ID}.jpeg?auto=compress&cs=tinysrgb&w=2600"
OUT=Path("assets/images")
OUT.mkdir(parents=True,exist_ok=True)
r=requests.get(PHOTO,timeout=50,headers={"User-Agent":"Atrezzo-EditorialImages/1.0"})
r.raise_for_status()
if not r.headers.get("Content-Type","").startswith("image/") or not (100_000<=len(r.content)<=30000000):
    raise ValueError("Combination stock photograph missing or invalid")
with Image.open(io.BytesIO(r.content)) as source:
    source.load()
    source=ImageOps.exif_transpose(source).convert("RGB")
if source.width<1800 or source.height<1000:
    raise ValueError(f"Source too small for a full-screen photograph: {source.size}")
# Gentle cinematic grading, keep skin and environment authentic.
source=ImageEnhance.Color(source).enhance(.88)
source=ImageEnhance.Contrast(source).enhance(1.045)
outputs=[]
for name,size,focus in [
    ("elegant-massage-combination-single-desktop.webp",(1920,1080),(.52,.48)),
    ("elegant-massage-combination-single-mobile.webp",(900,1200),(.56,.47)),
]:
    image=ImageOps.fit(source,size,method=Image.Resampling.LANCZOS,centering=focus)
    destination=OUT/name
    image.save(destination,format="WEBP",quality=85,method=6)
    with Image.open(destination) as verified:
        verified.verify()
    outputs.append({"path":str(destination),"width":size[0],"height":size[1],
      "bytes":destination.stat().st_size,
      "sha256":hashlib.sha256(destination.read_bytes()).hexdigest()})
manifest={
    "purpose":"Combination Massage Home cinematic full-bleed scene, single image (no diptych)",
    "source":SOURCE,
    "source_image_url":PHOTO,
    "photographer":"Sergey Torbik",
    "source_photo_id":PHOTO_ID,
    "license":"https://www.pexels.com/license/",
    "source_sha256":hashlib.sha256(r.content).hexdigest(),
    "origin":"licensed illustrative stock, not real Elegant Massage staff or premises",
    "alt":"Illustrative photograph of a relaxing back massage in a spa setting",
    "outputs":outputs
}
p=Path("docs/FASE-04-COMBINATION-SINGLE-IMAGE.json")
p.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print(json.dumps({"image_source":SOURCE,"outputs":outputs},indent=2))
