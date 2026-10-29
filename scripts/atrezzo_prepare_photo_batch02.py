#!/usr/bin/env python3
"""Atrezzo Elegant Massage: editorial photography batch02.
Sources: Pexels royalty-free photos (manifest records provenance). All images illustrative.
Produces responsive WebP; never modifies actual client/location photographs.
"""
from __future__ import annotations
import hashlib, io, json, math
from pathlib import Path
from PIL import Image, ImageOps, ImageEnhance, ImageFilter
import requests

ROOT=Path("assets/images")
ROOT.mkdir(parents=True,exist_ok=True)
SRC={
 "couples":dict(id=19695952,slug="a-man-and-a-woman-taking-a-massage",author="Jonathan Borba",focal=(.5,.5)),
 "four":dict(id=5888079,slug="a-woman-having-a-back-massage",author="Gustavo Fring",focal=(.52,.5)),
 "chair":dict(id=4085451,slug="getting-a-back-massage",author="Stephanie Allen",focal=(.48,.5)),
 "combo_foot":dict(id=5240676,slug="focused-masseuse-doing-feet-massage",author="Anete Lusina",focal=(.50,.5)),
 "combo_back":dict(id=4599392,slug="masseuse-massaging-a-person-s-back",author="Antoni Shkraba",focal=(.50,.5)),
}
def download(name,meta):
    ident=meta["id"]
    url=f"https://images.pexels.com/photos/{ident}/pexels-photo-{ident}.jpeg?auto=compress&cs=tinysrgb&w=2400"
    r=requests.get(url,timeout=45,headers={"User-Agent":"Atrezzo-EditorialPhotoBuilder/1.1"})
    r.raise_for_status()
    if not r.headers.get("Content-Type","").startswith("image/") or not (50_000<len(r.content)<28_000_000):
        raise ValueError(f"{name}: invalid photo response")
    with Image.open(io.BytesIO(r.content)) as im:
        im.load()
        im=ImageOps.exif_transpose(im).convert("RGB")
        if min(im.size)<1000: raise ValueError(f"{name}: source too small {im.size}")
    return im,dict(
      id=ident,author=meta["author"],url=f"https://www.pexels.com/photo/{meta['slug']}-{ident}/",
      asset_url=url,license="https://www.pexels.com/license/",raw_sha256=hashlib.sha256(r.content).hexdigest(),
      source_resolution=list(im.size),use="illustrative licensed stock, not business staff/facilities"
    )
def mood(im):
    # Soft, restrained warm editorial color grading. No untruthful scene creation.
    im=ImageEnhance.Color(im).enhance(.92)
    im=ImageEnhance.Contrast(im).enhance(1.035)
    return im
def fit(im,sz,focus=(.5,.5)):
    return ImageOps.fit(im,sz,method=Image.Resampling.LANCZOS,centering=focus)
def write(im,name,quality=84):
    path=ROOT/name
    im.save(path,"WEBP",quality=quality,method=6)
    with Image.open(path) as chk:
        chk.verify()
    return dict(path=str(path),bytes=path.stat().st_size,sha256=hashlib.sha256(path.read_bytes()).hexdigest(),
                width=im.width,height=im.height)
def mobile_couples(im):
    # Art-directed two-guest split. Left and right views of the SAME genuine source photo,
    # not synthetic anatomy, retaining both clients in narrow mobile viewport.
    w,h=im.size
    left=im.crop((0,0,round(.54*w),h))
    right=im.crop((round(.46*w),0,w,h))
    dest=Image.new("RGB",(900,1200),(34,47,38))
    pw=444
    a=fit(left,(pw,1200),(.5,.52))
    b=fit(right,(pw,1200),(.5,.52))
    dest.paste(a,(0,0));dest.paste(b,(456,0))
    return dest
photos={};sources={}
for name,meta in SRC.items():
    photo,source=download(name,meta)
    photos[name]=mood(photo)
    sources[name]=source

manifest=[]
def item(name,route,category,alt,source_ids,outputs,notes=""):
    manifest.append(dict(scene=name,page=route,category=category,alt=alt,
        sources=[sources[k] for k in source_ids],outputs=outputs,notes=notes))

couples=photos["couples"]
out=[write(fit(couples,(1600,900),(.50,.47)),"elegant-massage-couples-batch02-desktop.webp"),
     write(mobile_couples(couples),"elegant-massage-couples-batch02-mobile.webp")]
item("couples","/massage-services/couples-massage/","licensed_stock_illustrative",
     "Illustrative photograph of two guests receiving massage treatments",["couples"],out,
     "Mobile version is two editorial cropped views of the same photo for both guests to remain visible; NOT new rooms or real Elegant Massage clientele.")

four=photos["four"]
out=[write(fit(four,(1600,900),(.50,.5)),"elegant-massage-four-hands-batch02-desktop.webp"),
     write(fit(four,(900,1200),(.5,.5)),"elegant-massage-four-hands-batch02-mobile.webp")]
item("four-hands","/massage-services/four-hands-massage/","licensed_stock_illustrative",
     "Illustrative scene of two massage therapists working on one client",["four"],out,
     "Composition to be human-inspected; does NOT prove business-specific technique.")

chair=photos["chair"]
out=[write(fit(chair,(1600,900),(.52,.48)),"elegant-massage-chair-batch02-desktop.webp"),
     write(fit(chair,(900,1200),(.50,.47)),"elegant-massage-chair-batch02-mobile.webp")]
item("chair-massage","/massage-services/chair-massage/","licensed_stock_illustrative",
     "Illustrative seated chair-massage session",["chair"],out,
     "Chair equipment is illustrative, not a claim about available facilities.")

foot,back=photos["combo_foot"],photos["combo_back"]
def combo_canvas(width,height):
    # Editorial two-panel visual of feet + back, NEVER an impossible single body position.
    # Both are clearly separated by a narrow dark rule.
    out=Image.new("RGB",(width,height),(36,53,43))
    if width>height:
        s1=round(width*.52);s2=width-s1-10
        out.paste(fit(foot,(s1,height),(.48,.5)),(0,0))
        out.paste(fit(back,(s2,height),(.52,.5)),(s1+10,0))
    else:
        s1=round(height*.5);s2=height-s1-10
        out.paste(fit(foot,(width,s1),(.5,.5)),(0,0))
        out.paste(fit(back,(width,s2),(.5,.5)),(0,s1+10))
    return out
out=[write(combo_canvas(1600,900),"elegant-massage-combination-batch02-desktop.webp"),
     write(combo_canvas(900,1200),"elegant-massage-combination-batch02-mobile.webp")]
item("combination-massage","/massage-services/combination-massage/","licensed_stock_illustrative",
     "Editorial two-scene composition showing foot and back massage separately",
     ["combo_foot","combo_back"],out,
     "Separate techniques depicted on two distinct photographs; does not imply simultaneous treatment or exact appointment inclusions.")

p=Path("docs/FASE-04-LOTE-02-MANIFEST.json")
p.parent.mkdir(parents=True,exist_ok=True)
p.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print(json.dumps({x["scene"]:[o["path"] for o in x["outputs"]] for x in manifest},indent=2))

# Review sheet is built exclusively for QA, not part of website or committed assets.
from PIL import ImageDraw
qa=Path("qa-artifacts")
qa.mkdir(exist_ok=True)
thumb=(400,290)
board=Image.new("RGB",(4*thumb[0],2*(thumb[1]+28)),(248,245,239))
draw=ImageDraw.Draw(board)
for idx,scene in enumerate(manifest):
    for j,asset in enumerate(scene["outputs"]):
        with Image.open(asset["path"]) as im:
            display=ImageOps.contain(im.convert("RGB"),thumb)
            x=idx*thumb[0]+(thumb[0]-display.width)//2
            y=j*(thumb[1]+28)+(thumb[1]-display.height)//2
            board.paste(display,(x,y))
            draw.text((idx*thumb[0]+10,j*(thumb[1]+28)+thumb[1]+4),
                      f"{scene['scene']} | {['desktop','mobile'][j]}",fill=(31,47,36))
board.save(qa/"elegant-batch02-contact-sheet.jpg",quality=85)
