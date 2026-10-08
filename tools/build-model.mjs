// Découpe le modèle A350 (amvlab, CC BY 4.0) en pièces nommées pour la vue éclatée.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import * as THREE from 'three';
import { LoopSubdivision } from 'three-subdivide';
import { toCreasedNormals, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
// V2 : subdivision de Loop (three-subdivide, MIT) + normales lissées avec angle seuil
const ITER = { cockpit: 1, nacelle_G: 2, nacelle_D: 2 }; // fuselage non subdivisé : la livrée se déformait
const SUBDIV = process.env.SUBDIV !== '0';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const src = await io.read('raw/amvlab/models/A350_nologo.glb');
const node = src.getRoot().listNodes().find(n => n.getMesh());
const M = node.getWorldMatrix();
const prim = node.getMesh().listPrimitives()[0];
const pos = prim.getAttribute('POSITION'), nor = prim.getAttribute('NORMAL'), uv = prim.getAttribute('TEXCOORD_0');
const idx = prim.getIndices().getArray();
const n = pos.getCount();
const OFF = [0, 1.4, 0];
const P = [], N = [], U = [];
for (let i = 0; i < n; i++) {
  const v = pos.getElement(i, []), w = nor.getElement(i, []);
  P.push([M[0]*v[0]+M[4]*v[1]+M[8]*v[2]+M[12]-OFF[0], M[1]*v[0]+M[5]*v[1]+M[9]*v[2]+M[13]-OFF[1], M[2]*v[0]+M[6]*v[1]+M[10]*v[2]+M[14]-OFF[2]]);
  let nx = M[0]*w[0]+M[4]*w[1]+M[8]*w[2], ny = M[1]*w[0]+M[5]*w[1]+M[9]*w[2], nz = M[2]*w[0]+M[6]*w[1]+M[10]*w[2];
  const l = Math.hypot(nx, ny, nz) || 1; N.push([nx/l, ny/l, nz/l]); U.push(uv.getElement(i, []));
}
// composantes connexes (soudure par position)
const key = p => p.map(x => Math.round(x*1000)).join(',');
const map = new Map(), rep = new Int32Array(n);
for (let i = 0; i < n; i++) { const k = key(P[i]); if (!map.has(k)) map.set(k, i); rep[i] = map.get(k); }
const par = Int32Array.from({ length: n }, (_, i) => i);
const f = x => { while (par[x] !== x) { par[x] = par[par[x]]; x = par[x]; } return x; };
for (let t = 0; t < idx.length; t += 3) { const a = f(rep[idx[t]]); par[f(rep[idx[t+1]])] = a; par[f(rep[idx[t+2]])] = a; }
const comp = new Map();
for (let t = 0; t < idx.length; t += 3) { const r = f(rep[idx[t]]); if (!comp.has(r)) comp.set(r, { tris: [], min: [1e9,1e9,1e9], max: [-1e9,-1e9,-1e9] }); const c = comp.get(r); c.tris.push(t); for (let k = 0; k < 3; k++) { const p = P[idx[t+k]]; for (let j = 0; j < 3; j++) { c.min[j] = Math.min(c.min[j], p[j]); c.max[j] = Math.max(c.max[j], p[j]); } } }
const parts = {};
const add = (name, t) => (parts[name] ??= []).push(t);
for (const c of comp.values()) {
  const cx = (c.min[0]+c.max[0])/2, cy = (c.min[1]+c.max[1])/2, cz = (c.min[2]+c.max[2])/2, sx = c.max[0]-c.min[0], sz = c.max[2]-c.min[2];
  const side = cz > 0 ? 'D' : 'G'; // +z = côté droit (tribord)
  let name;
  if (c.tris.length > 1000) { // fuselage + une aile soudée
    for (const t of c.tris) {
      const cen = [0,1,2].map(j => (P[idx[t]][j]+P[idx[t+1]][j]+P[idx[t+2]][j])/3);
      if (Math.abs(cen[2]) > 3.2 && cen[0] > -16 && cen[0] < 12) add('aile_' + (cen[2] > 0 ? 'D' : 'G'), t);
      else if (cen[0] > 27) add('cockpit', t);
      else add('fuselage', t);
    }
    continue;
  }
  if (c.max[1] > 8) name = 'derive';
  else if (c.min[0] < -24 && c.max[1] < 4) name = 'stabilisateur_' + side;
  else if (sz > 15) name = 'aile_' + side;
  else if (sx < 1.5 && c.min[0] > 9) name = 'soufflante_' + side;
  else if (c.min[1] < -3.5) name = 'nacelle_' + side;
  else if (sx > 12 && sz < 1.2 && c.min[0] < -2) name = 'mat_' + side;
  else name = 'aile_' + side; // carénages de rails de volets
  for (const t of c.tris) add(name, t);
}
// nouveau document
const { Document } = await import('@gltf-transform/core');
const doc = new Document();
const buf = doc.createBuffer();
const oldMat = prim.getMaterial(), oldTex = oldMat.getBaseColorTexture();
const tex = doc.createTexture('livree').setImage(oldTex.getImage()).setMimeType(oldTex.getMimeType());
const mat = doc.createMaterial('peinture').setBaseColorTexture(tex).setRoughnessFactor(0.4).setMetallicFactor(0.1);
const scene = doc.createScene('avion');
const rootN = doc.createNode('avion'); scene.addChild(rootN);
for (const [name, tris] of Object.entries(parts)) {
  let remap = new Map(), p = [], nn = [], uu = [], ii = [];
  for (const t of tris) for (let k = 0; k < 3; k++) { const o = idx[t+k]; if (!remap.has(o)) { remap.set(o, remap.size); p.push(...P[o]); nn.push(...N[o]); uu.push(...U[o]); } ii.push(remap.get(o)); }
  const it = SUBDIV ? (ITER[name] ?? 0) : 0;
  if (it > 0) {
    let g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(nn, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uu, 2));
    g.setIndex(ii);
    g = LoopSubdivision.modify(g, it, { split: false, uvSmooth: false, preserveEdges: true, flatOnly: false });
    g = toCreasedNormals(g, THREE.MathUtils.degToRad(38));
    g = mergeVertices(g, 1e-5);
    p = Array.from(g.attributes.position.array); nn = Array.from(g.attributes.normal.array); uu = Array.from(g.attributes.uv.array); ii = Array.from(g.index.array);
  }
  const pr = doc.createPrimitive()
    .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(new Float32Array(p)).setBuffer(buf))
    .setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(new Float32Array(nn)).setBuffer(buf))
    .setAttribute('TEXCOORD_0', doc.createAccessor().setType('VEC2').setArray(new Float32Array(uu)).setBuffer(buf))
    .setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(ii)).setBuffer(buf))
    .setMaterial(mat);
  rootN.addChild(doc.createNode(name).setMesh(doc.createMesh(name).addPrimitive(pr)));
  console.log(name.padEnd(18), 'tris', tris.length, '->', ii.length / 3);
}
doc.getRoot().getAsset().extras = { source: 'amvlab/aircraft-models A350_nologo.glb', license: 'CC BY 4.0', changes: 'découpé en pièces nommées, recentré' };
await new NodeIO().write('raw/avion-pieces.glb', doc);
