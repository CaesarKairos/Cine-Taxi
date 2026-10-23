"""Convert Kenney Car Kit 3.1 GLBs into small, editable semantic meshes.

Usage: python scripts/prepare-models.py path/to/Models/GLB\ format
Requires Pillow only at authoring time. See licenses/Kenney-Car-Kit.txt.
"""
import sys, json, struct, math
from pathlib import Path
from collections import defaultdict
from PIL import Image

root = Path(sys.argv[1])
out = Path('public/models')
out.mkdir(parents=True, exist_ok=True)
image = Image.open(root/'Textures/colormap.png').convert('RGB')

def convert(source, target, sx=1, sy=1, sz=1):
    data=(root/(source+'.glb')).read_bytes()
    length=struct.unpack_from('<I',data,12)[0]
    doc=json.loads(data[20:20+length]); buffer=data[28+length:]
    def read(index):
        a=doc['accessors'][index]; view=doc['bufferViews'][a['bufferView']]
        size={'VEC3':3,'VEC2':2,'SCALAR':1}[a['type']]
        fmt={5126:'f',5123:'H',5125:'I',5121:'B'}[a['componentType']]
        offset=view.get('byteOffset',0)+a.get('byteOffset',0)
        return list(struct.iter_unpack('<'+fmt*size,buffer[offset:offset+a['count']*size*struct.calcsize(fmt)]))
    groups=defaultdict(list); wheels=[]
    for node in doc['nodes']:
        if 'mesh' not in node: continue
        if node['name'].startswith('wheel-'):
            # The original tire axes are the authoritative chassis attachment points.
            t=node.get('translation',[0,0,0]); pr=doc['meshes'][node['mesh']]['primitives'][0]; points=read(pr['attributes']['POSITION']); wheels.append([round((min(p[c] for p in points)+max(p[c] for p in points))/2*scale+t[c]*scale,5) for c,scale in enumerate([sx,sy,sz])])
            continue
        if node['name']!='body':continue
        primitive=doc['meshes'][node['mesh']]['primitives'][0]
        pos=read(primitive['attributes']['POSITION']); uv=read(primitive['attributes']['TEXCOORD_0']); indices=read(primitive['indices'])
        t=node.get('translation',[0,0,0])
        for i in range(0,len(indices),3):
            ids=[indices[k][0] for k in range(i,i+3)]
            u,v=[sum(uv[j][c] for j in ids)/3 for c in (0,1)]
            r,g,b=image.getpixel((min(511,int(u*512)),min(511,int(v*512))))
            xyz=[[pos[j][c]+t[c] for c in range(3)] for j in ids]
            x,y,z=[sum(p[c] for p in xyz)/3 for c in range(3)]
            # Original lamps are replaced by mountable components. Glass is separated
            # from the palette texture, so its material and window area remain editable.
            if r>180 and g<85 and z<-.8: continue
            if z<-.95 and y<.43 and max(abs(p[0]) for p in xyz)<.25:continue
            if r>175 and g>200 and b>244 and y>.75: kind='glass'
            elif r>175 and g>170 and b>175 and max(r,g,b)-min(r,g,b)<50: kind='chrome'
            elif (int(u*4),int(v*4))==(0,3) and z>.8: kind='headlight'
            elif max(r,g,b)<95: kind='rubber'
            elif b>r+12 and abs(r-g)<12: kind='lower'
            else: kind='paint'
            if kind=='lower' and y<.35:kind='dark'
            # Clear the original rear bumper/central exhaust, retaining wheel arches.
            if z<(-1.33 if source in ['hatchback-sports','suv-luxury'] else -1.19) and y<.54 and kind in ['lower','chrome','dark']:continue
            for p in xyz:groups[kind].extend([round(p[0]*sx,5),round(p[1]*sy,5),round(p[2]*sz,5)])
    model={'source':source,'parts':dict(groups),'axles':wheels}
    (out/(target+'.json')).write_text(json.dumps(model,separators=(',',':')))
    print(target,source,[(k,len(v)//9) for k,v in groups.items()])

convert('sedan','sedan')
convert('hatchback-sports','hatch',sy=1.08,sz=.86)
convert('sedan-sports','coupe',sx=1.02,sy=.93,sz=1.06)
convert('sedan-sports','muscle',sx=1.19,sy=1.04,sz=1.15)
convert('suv-luxury','wagon',sx=.98,sy=.90,sz=1.07)

