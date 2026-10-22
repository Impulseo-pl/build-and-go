from PIL import Image, ImageOps
import os
S='src-fb'; O='assets/img'
f=lambda n:[x for x in sorted(os.listdir(S)) if x.startswith(n+'_')][0]
names={'01':'bialy-tyl','02':'bialy-bagaznik','03':'bialy-bok','04':'bialy-przod','05':'bialy-drzwi',
'06':'plakat','07':'srebrny-bok','08':'srebrny-drzwi','09':'srebrny-przod','10':'srebrny-wnetrze',
'11':'srebrny-bagaznik','12':'srebrny-kokpit','13':'srebrny-fotele','14':'srebrny-bagaznik-2','15':'srebrny-fotel','16':'srebrny-front'}
for k,v in names.items():
    im=ImageOps.exif_transpose(Image.open(os.path.join(S,f(k)))).convert('RGB')
    im.thumbnail((1600,1600)); im.save(f'{O}/{v}.webp','WEBP',quality=80)
# hero: landscape crops from portrait white photos
for k,v,top in [('04','hero',0.30),('03','hero-bok',0.36)]:
    im=ImageOps.exif_transpose(Image.open(os.path.join(S,f(k)))).convert('RGB')
    w,h=im.size; ch=int(w*0.62); y=int(h*top)
    c=im.crop((0,y,w,y+ch)); c.thumbnail((2400,2400)); c.save(f'{O}/{v}.webp','WEBP',quality=78)
    if v=='hero': c.resize((1200,int(1200*ch/w))).crop((0,0,1200,630)).save(f'{O}/og.jpg',quality=82)
# logo: white on transparent
im=Image.open(os.path.join(S,f('17'))).convert('L')
a=im.point(lambda p: 0 if p<60 else min(255,int((p-60)*255/150)))
bbox=a.getbbox(); a=a.crop(bbox)
lg=Image.new('RGBA',a.size,(255,255,255,0)); lg.putalpha(a)
white=Image.new('RGBA',a.size,(255,255,255,255)); white.putalpha(a)
white.save(f'{O}/logo.png'); print('logo',a.size)
# icon only (top part, above text)
rows=[a.crop((0,y,a.size[0],y+1)).getbbox() is not None for y in range(a.size[1])]
# find gap between icon and text
gap=None
for y in range(int(a.size[1]*0.4),a.size[1]):
    if not rows[y]: gap=y;break
ic=white.crop((0,0,a.size[0],gap)); ic=ic.crop(ic.getbbox()); ic.save(f'{O}/logo-znak.png'); print('icon',ic.size)
fav=Image.new('RGBA',(256,256),(10,10,10,255)); t=ic.copy(); t.thumbnail((200,200)); fav.alpha_composite(t,((256-t.size[0])//2,(256-t.size[1])//2)); fav.save(f'{O}/favicon.png')
