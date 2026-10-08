import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(process.argv[2]);
const node = doc.getRoot().listNodes().find(n=>n.getMesh());
const M = node.getWorldMatrix(); console.log('world', M.map(x=>+x.toFixed(3)).join(','));
const prim = node.getMesh().listPrimitives()[0];
const pos = prim.getAttribute('POSITION'), idx = prim.getIndices().getArray();
const tex = doc.getRoot().listTextures()[0]; console.log('tex', tex.getMimeType(), tex.getSize(), tex.getImage().byteLength);
console.log('attrs', prim.listSemantics());
const n = pos.getCount(); const P=[]; for(let i=0;i<n;i++){ const v=pos.getElement(i,[]); P.push([M[0]*v[0]+M[4]*v[1]+M[8]*v[2]+M[12], M[1]*v[0]+M[5]*v[1]+M[9]*v[2]+M[13], M[2]*v[0]+M[6]*v[1]+M[10]*v[2]+M[14]]); }
// weld by position
const key = p=>p.map(x=>Math.round(x*1000)).join(','); const map=new Map(); const rep=new Int32Array(n);
for(let i=0;i<n;i++){const k=key(P[i]); if(!map.has(k)) map.set(k,i); rep[i]=map.get(k);}
const par=new Int32Array(n).map((_,i)=>i); const f=x=>{while(par[x]!==x){par[x]=par[par[x]];x=par[x];}return x;};
for(let t=0;t<idx.length;t+=3){ const a=f(rep[idx[t]]),b=f(rep[idx[t+1]]),c=f(rep[idx[t+2]]); par[b]=a; par[f(c)]=a; }
const comps=new Map(); for(let t=0;t<idx.length;t+=3){ const r=f(rep[idx[t]]); if(!comps.has(r)) comps.set(r,{tris:0,min:[1e9,1e9,1e9],max:[-1e9,-1e9,-1e9]}); const c=comps.get(r); c.tris++; for(let k=0;k<3;k++){const p=P[idx[t+k]]; for(let j=0;j<3;j++){c.min[j]=Math.min(c.min[j],p[j]); c.max[j]=Math.max(c.max[j],p[j]);}}}
const arr=[...comps.values()].sort((a,b)=>b.tris-a.tris); console.log('components', arr.length);
for(const c of arr) console.log(c.tris, 'min', c.min.map(x=>x.toFixed(1)).join(','), 'max', c.max.map(x=>x.toFixed(1)).join(','));
