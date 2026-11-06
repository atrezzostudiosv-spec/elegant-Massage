#!/usr/bin/env python3
"""Generate an Elegant Massage editorial Open Graph card using an existing project illustration."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import os

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'assets/images/martes/body-editorial.webp'
OUT = ROOT / 'assets/brand/elegant-massage-social-share.png'
OUT.parent.mkdir(parents=True, exist_ok=True)
W, H = 1200, 630
if not SOURCE.is_file():
    raise FileNotFoundError(f'Illustrative asset is missing: {SOURCE}')
photo=Image.open(SOURCE).convert('RGB')
s=max(W/photo.width,H/photo.height)
rw,rh=round(photo.width*s),round(photo.height*s)
resized=photo.resize((rw,rh),Image.Resampling.LANCZOS)
left,top=(rw-W)//2,(rh-H)//2
im=resized.crop((left,top,left+W,top+H)).convert('RGBA')
veil=Image.new('RGBA',(W,H),(0,0,0,0))
vd=ImageDraw.Draw(veil)
for x in range(W):
    t=x/W
    if t<.40:
        opacity=234
    elif t<.76:
        opacity=round(234-(t-.40)/.36*183)
    else:
        opacity=51
    vd.line((x,0,x,H),fill=(17,32,34,opacity),width=1)
im=Image.alpha_composite(im,veil)
draw=ImageDraw.Draw(im)
fonts={
 'regular':['/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf','/usr/share/fonts/truetype/liberation2/LiberationSerif-Regular.ttf'],
 'italic':['/usr/share/fonts/truetype/dejavu/DejaVuSerif-Italic.ttf','/usr/share/fonts/truetype/liberation2/LiberationSerif-Italic.ttf'],
 'sans':['/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf','/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf']}
def face(style,size):
    for fn in fonts[style]:
        if os.path.isfile(fn):
            return ImageFont.truetype(fn,size)
    raise RuntimeError(f'Missing font: {style}')
draw.line((70,92,300,92),fill='#B9CBB8',width=2)
draw.text((70,142),'Elegant',font=face('italic',80),fill='#F5F1EA')
draw.text((70,235),'Massage',font=face('regular',80),fill='#F5F1EA')
draw.text((74,383),'FLOWER MOUND  ·  TEXAS',font=face('sans',17),fill='#D4DCCF')
draw.line((72,485,270,485),fill='#B9CBB8',width=1)
draw.text((72,505),'Touch, Considered.',font=face('italic',31),fill='#F5F1EA')
im.convert('RGB').save(OUT,'PNG',optimize=True)
print('Generated',OUT.relative_to(ROOT),OUT.stat().st_size,'bytes',(W,H))
