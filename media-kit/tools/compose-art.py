# Builds marketing images from the rendered key art + logo.
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageEnhance
import os, glob
import pathlib
K=str(pathlib.Path(__file__).resolve().parent.parent)
art=Image.open(f'{K}/art/keyart-clean.jpg').convert('RGB')
fire=Image.open(f'{K}/art/fireplace-clean.jpg').convert('RGB')
logo=Image.open(f'{K}/logo/logo-transparent.png').convert('RGBA')
bbox=logo.getbbox(); logo=logo.crop(bbox)


def cover(img, w, h, focus=(0.5,0.5)):
    r=max(w/img.width, h/img.height)
    im=img.resize((int(img.width*r)+1, int(img.height*r)+1), Image.LANCZOS)
    x=int((im.width-w)*focus[0]); y=int((im.height-h)*focus[1])
    return im.crop((x,y,x+w,y+h))

def vignette(im, strength=0.55, side='left'):
    w,h=im.size
    g=Image.new('L',(w,h),0); d=ImageDraw.Draw(g)
    for x in range(w):
        t = x/w if side=='left' else 1-x/w
        a = int(255*strength*max(0,1-t*1.6))
        d.line([(x,0),(x,h)],fill=a)
    dark=Image.new('RGB',(w,h),(5,8,22))
    return Image.composite(dark, im, g)

def place_logo(im, height_frac, pos=('left',0.07), y_frac=0.5):
    w,h=im.size
    lh=int(h*height_frac); lw=int(logo.width*lh/logo.height)
    if lw > w*0.9: lw=int(w*0.9); lh=int(logo.height*lw/logo.width)
    lg=logo.resize((lw,lh), Image.LANCZOS)
    x = int(w*pos[1]) if pos[0]=='left' else (w-lw)//2
    y = int((h-lh)*y_frac)
    shadow=Image.new('RGBA',lg.size,(0,0,0,0)); shadow.putalpha(lg.split()[3].point(lambda a:int(a*0.55)))
    shadow=shadow.filter(ImageFilter.GaussianBlur(max(2,lh//30)))
    base=im.convert('RGBA'); base.alpha_composite(shadow,(x+lh//40,y+lh//30)); base.alpha_composite(lg,(x,y))
    return base.convert('RGB')

out={}
# itch.io cover 630x500, banner 960x? , GitHub social 1280x640, capsule 460x215, header 1920x480
out['art/itch-cover-630x500.png']=place_logo(vignette(cover(art,630,500,(0.55,0.5)),0.7),0.5,('center',0),0.42)
out['art/github-social-1280x640.png']=place_logo(vignette(cover(art,1280,640,(0.5,0.5)),0.75),0.62,('left',0.06),0.5)
out['art/banner-1920x480.png']=place_logo(vignette(cover(art,1920,480,(0.5,0.55)),0.8),0.8,('left',0.06),0.5)
out['art/capsule-460x215.png']=place_logo(vignette(cover(art,460,215),0.75),0.82,('left',0.05),0.5)
out['art/wallpaper-1920x1080.png']=place_logo(vignette(art,0.65),0.42,('left',0.06),0.22)
out['art/wallpaper-fireplace-1920x1080.png']=place_logo(vignette(fire,0.0,'left'),0.3,('center',0),0.06)
for k,v in out.items(): v.save(f'{K}/{k}', optimize=True)

# square icon: star + E.L.F. on night gradient
def icon(sz):
    im=Image.new('RGB',(sz,sz),(11,16,34)); d=ImageDraw.Draw(im)
    for y in range(sz):
        t=y/sz; d.line([(0,y),(sz,y)],fill=(int(11+30*t),int(16+10*t),int(34+40*(1-t))))
    elf=logo.crop((0,58,logo.width,196))
    eb=elf.getbbox(); elf=elf.crop(eb)
    lw=int(sz*0.84); lh=int(elf.height*lw/elf.width)
    im=im.convert('RGBA'); im.alpha_composite(elf.resize((lw,lh),Image.LANCZOS),((sz-lw)//2,(sz-lh)//2+sz//20))
    d=ImageDraw.Draw(im)
    import math
    cx,cy,r=sz/2,sz*0.17,sz*0.09
    pts=[(cx+math.cos(-math.pi/2+i*math.pi/5)*(r if i%2==0 else r*0.45), cy+math.sin(-math.pi/2+i*math.pi/5)*(r if i%2==0 else r*0.45)) for i in range(10)]
    d.polygon(pts,fill=(255,231,163))
    return im.convert('RGB')
for s in (512,256,128,64):
    icon(s).save(f'{K}/logo/icon-{s}.png', optimize=True)
icon(512).save(f'{K}/logo/icon-512.ico' if False else f'{K}/logo/icon-512.png')
# logo on dark background for light-mode surfaces
bg=Image.new('RGBA',(logo.width+120,logo.height+100),(11,16,34,255)); bg.alpha_composite(logo,(60,50)); bg.convert('RGB').save(f'{K}/logo/logo-on-night.png')
logo.save(f'{K}/logo/logo-transparent.png')
print('composed', list(out))
