import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'draco3d.decoder': await draco3d.createDecoderModule()});
const f = process.argv[2];
const doc = await io.read(f);
const root = doc.getRoot();
console.log('==', f, 'ext:', root.listExtensionsUsed().map(e=>e.extensionName).join(','));
console.log('materials:', root.listMaterials().map(m=>m.getName()+'['+m.getBaseColorFactor().map(x=>x.toFixed(2))+']'+(m.getBaseColorTexture()?'T':'')).join(' | '));
console.log('textures:', root.listTextures().length, 'anims:', root.listAnimations().map(a=>a.getName()).join(','));
function walk(n, d){ const m=n.getMesh(); let s=''; if(m){ let tris=0; for(const p of m.listPrimitives()){const i=p.getIndices(); tris+= (i?i.getCount():p.getAttribute('POSITION').getCount())/3; } s=` mesh=${m.getName()} prims=${m.listPrimitives().length} tris=${tris} mats=${m.listPrimitives().map(p=>p.getMaterial()?.getName()).join('/')}`;}
 console.log('  '.repeat(d)+'- '+n.getName()+' t='+n.getTranslation().map(x=>x.toFixed(2))+s); for(const c of n.listChildren()) walk(c,d+1);}
for (const sc of root.listScenes()) for (const n of sc.listChildren()) walk(n,1);
