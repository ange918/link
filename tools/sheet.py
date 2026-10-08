import sys
from PIL import Image
out=sys.argv[1]; fs=sys.argv[2:]
ims=[Image.open(f) for f in fs]
w,h=ims[0].size; s=640/w
ims=[im.resize((640,int(h*s))) for im in ims]
H=ims[0].size[1]; rows=(len(ims)+1)//2
sheet=Image.new('RGB',(1280,H*rows))
for i,im in enumerate(ims): sheet.paste(im,((i%2)*640,(i//2)*H))
sheet.save(out)
