import { NodeIO } from '@gltf-transform/core';
const io = new NodeIO(); const doc = await io.read('raw/amvlab/models/A350_nologo.glb');
const node = doc.getRoot().listNodes().find(n=>n.getMesh()); const M=node.getWorldMatrix();
const pos=node.getMesh().listPrimitives()[0].getAttribute('POSITION');
const P=[]; for(let i=0;i<pos.getCount();i++){const v=pos.getElement(i,[]); P.push([M[0]*v[0]+M[4]*v[1]+M[8]*v[2]+M[12], M[1]*v[0]+M[5]*v[1]+M[9]*v[2]+M[13], M[2]*v[0]+M[6]*v[1]+M[10]*v[2]+M[14]]);}
for (const x0 of [-30,-25,-20,-10,0,10,20,25,28,30,32,33]) { const s=P.filter(p=>Math.abs(p[0]-x0)<1 && Math.abs(p[2])<3.4 && p[1]>-2.5); if(!s.length){console.log(x0,'none');continue;} const ys=s.map(p=>p[1]), zs=s.map(p=>p[2]); console.log(x0,'y',Math.min(...ys).toFixed(2),Math.max(...ys).toFixed(2),'z',Math.min(...zs).toFixed(2),Math.max(...zs).toFixed(2), s.length); }
