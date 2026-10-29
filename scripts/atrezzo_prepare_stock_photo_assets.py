#!/usr/bin/env python3
"""Atrezzo: preserve three licensed illustrative photographs as responsive WebP assets.
Run only in the GitHub Actions workflow. Does not alter authentic client photography.
"""
import hashlib
import io
import json
from pathlib import Path
from PIL import Image, ImageOps
import requests

ROOT = Path("assets/images")
ROOT.mkdir(parents=True, exist_ok=True)
SOURCES = [
  {
    "id": "foot-reflexology",
    "photo_id": "5240640",
    "source": "https://www.pexels.com/photo/crop-masseuse-kneading-feet-of-client-5240640/",
    "photographer": "Anete Lusina",
    "filename": "elegant-massage-foot-reflexology-editorial",
    "alt": "Illustrative close-up of hands working on a client's feet during a massage",
    "focus": (0.53, 0.52),
    "route": "/massage-services/foot-reflexology/"
  },
  {
    "id": "couples-massage",
    "photo_id": "7365434",
    "source": "https://www.pexels.com/photo/a-couple-getting-a-massage-7365434/",
    "photographer": "Sergey Torbik",
    "filename": "elegant-massage-couples-editorial",
    "alt": "Illustrative scene of two people enjoying massage treatments together",
    "focus": (0.50, 0.50),
    "route": "/massage-services/couples-massage/"
  },
  {
    "id": "four-hands",
    "photo_id": "5888096",
    "source": "https://www.pexels.com/photo/a-woman-having-a-massage-5888096/",
    "photographer": "Gustavo Fring",
    "filename": "elegant-massage-two-therapists-editorial",
    "alt": "Illustrative photograph showing two practitioners working with one massage client",
    "focus": (0.54, 0.50),
    "route": "/massage-services/four-hands-massage/"
  }
]
manifest = []
for item in SOURCES:
    photo_id = item["photo_id"]
    url = f"https://images.pexels.com/photos/{photo_id}/pexels-photo-{photo_id}.jpeg?auto=compress&cs=tinysrgb&w=2400"
    response = requests.get(url, timeout=40, headers={"User-Agent": "Atrezzo-EditorialPhotoBuilder/1.0"})
    response.raise_for_status()
    if "image" not in response.headers.get("Content-Type", "") or len(response.content) > 30_000_000:
        raise ValueError(f"Invalid source image: {item['id']}")
    original_sha256 = hashlib.sha256(response.content).hexdigest()
    with Image.open(io.BytesIO(response.content)) as image:
        image.load()
        if min(image.size) < 900:
            raise ValueError(f"Insufficient image dimensions for {item['id']}: {image.size}")
        source_size = image.size
        image = ImageOps.exif_transpose(image).convert("RGB")
        outputs = []
        for suffix, dimensions, quality in [("desktop", (1600, 900), 83), ("mobile", (900, 1200), 81)]:
            # Cropped for art direction; original downloaded file isn't represented as a real client photo.
            cropped = ImageOps.fit(image, dimensions, method=Image.Resampling.LANCZOS,
                                   centering=item["focus"])
            dest = ROOT / f"{item['filename']}-{suffix}.webp"
            cropped.save(dest, format="WEBP", quality=quality, method=6)
            with Image.open(dest) as check:
                check.verify()
            outputs.append({"path": str(dest), "width": dimensions[0],
                            "height": dimensions[1], "bytes": dest.stat().st_size,
                            "sha256": hashlib.sha256(dest.read_bytes()).hexdigest()})
        manifest.append({
            "id": item["id"], "page": item["route"], "source": item["source"],
            "download_url": url, "photographer": item["photographer"],
            "license": "https://www.pexels.com/license/",
            "provenance": "licensed_stock_illustrative_not_client_location_or_staff",
            "alt": item["alt"], "source_dimensions": source_size,
            "source_sha256": original_sha256, "output": outputs})
manifest_path = Path("docs/FASE-04-RECURSOS-PRODUCIDOS.json")
manifest_path.parent.mkdir(exist_ok=True)
manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print(json.dumps({"images": len(manifest), "outputs": [e["path"] for i in manifest for e in i["output"]]}, indent=2))
