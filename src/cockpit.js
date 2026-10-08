// Poste de pilotage procédural (illustration) : planche de bord à écrans, sièges, mini-manches,
// piédestal, panneau supérieur, et vitrage dérivé de la forme du nez.
// Les écrans sont des visuels génériques sans aucune valeur chiffrée.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

function screenTexture(kind) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#05080c'; g.fillRect(0, 0, 256, 256);
  g.lineWidth = 3; g.lineCap = 'round';
  if (kind === 'pfd') {
    // horizon artificiel : ciel / sol, échelle d'assiette sans chiffres, maquette avion
    g.save(); g.beginPath(); g.rect(54, 40, 148, 160); g.clip();
    g.translate(128, 120); g.rotate(-0.08);
    g.fillStyle = '#2f7fd6'; g.fillRect(-160, -200, 320, 200);
    g.fillStyle = '#8a5a2b'; g.fillRect(-160, 0, 320, 200);
    g.strokeStyle = '#fff'; g.beginPath(); g.moveTo(-160, 0); g.lineTo(160, 0); g.stroke();
    g.lineWidth = 2; for (const y of [-40, -20, 20, 40]) { const w = Math.abs(y) === 40 ? 40 : 22; g.beginPath(); g.moveTo(-w, y); g.lineTo(w, y); g.stroke(); }
    g.restore();
    g.strokeStyle = '#ffd23f'; g.lineWidth = 5; g.beginPath(); g.moveTo(84, 120); g.lineTo(112, 120); g.lineTo(112, 128); g.moveTo(172, 120); g.lineTo(144, 120); g.lineTo(144, 128); g.stroke();
    g.fillStyle = '#ffd23f'; g.fillRect(124, 116, 8, 8);
    // bandeaux vitesse / altitude : graduations seules
    g.fillStyle = '#1b2430'; g.fillRect(14, 40, 32, 160); g.fillRect(210, 40, 32, 160);
    g.strokeStyle = '#d8e2ee'; g.lineWidth = 2;
    for (let y = 46; y < 200; y += 14) { g.beginPath(); g.moveTo(36, y); g.lineTo(46, y); g.moveTo(210, y); g.lineTo(220, y); g.stroke(); }
    g.fillStyle = '#1b2430'; g.fillRect(54, 210, 148, 30);
    g.strokeStyle = '#d8e2ee'; for (let x = 60; x < 200; x += 12) { g.beginPath(); g.moveTo(x, 210); g.lineTo(x, 218); g.stroke(); }
  } else if (kind === 'nd') {
    g.strokeStyle = '#e8eef5'; g.lineWidth = 2;
    g.beginPath(); g.arc(128, 200, 150, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
    for (let i = 0; i <= 36; i++) { const a = Math.PI * 1.15 + (i / 36) * Math.PI * 0.7; const r2 = i % 3 === 0 ? 136 : 142; g.beginPath(); g.moveTo(128 + Math.cos(a) * 150, 200 + Math.sin(a) * 150); g.lineTo(128 + Math.cos(a) * r2, 200 + Math.sin(a) * r2); g.stroke(); }
    g.setLineDash([6, 8]); g.beginPath(); g.arc(128, 200, 80, Math.PI * 1.2, Math.PI * 1.8); g.stroke(); g.setLineDash([]);
    g.strokeStyle = '#ff4fd8'; g.lineWidth = 3; g.beginPath(); g.moveTo(128, 196); g.lineTo(150, 120); g.lineTo(190, 70); g.stroke();
    g.strokeStyle = '#ffd23f'; g.lineWidth = 4; g.beginPath(); g.moveTo(128, 186); g.lineTo(128, 214); g.moveTo(114, 196); g.lineTo(142, 196); g.moveTo(120, 210); g.lineTo(136, 210); g.stroke();
    g.fillStyle = '#3ad16a'; for (const [x, y] of [[70, 90], [182, 140], [96, 60]]) { g.beginPath(); g.arc(x, y, 4, 0, Math.PI * 2); g.fill(); }
  } else if (kind === 'ewd') {
    g.strokeStyle = '#e8eef5'; g.lineWidth = 3;
    for (const cx of [72, 184]) {
      g.beginPath(); g.arc(cx, 92, 46, Math.PI * 0.8, Math.PI * 2.05); g.stroke();
      g.strokeStyle = '#3ad16a'; g.beginPath(); g.moveTo(cx, 92); g.lineTo(cx + Math.cos(Math.PI * 1.55) * 40, 92 + Math.sin(Math.PI * 1.55) * 40); g.stroke();
      g.strokeStyle = '#e8eef5';
      g.beginPath(); g.arc(cx, 176, 32, Math.PI * 0.8, Math.PI * 2.05); g.stroke();
    }
    g.fillStyle = '#3ad16a'; for (let i = 0; i < 4; i++) g.fillRect(28, 222 + 0 * i, 40 + i * 30, 0);
    g.fillStyle = '#2a3442'; g.fillRect(16, 222, 224, 22);
  } else {
    // schéma système générique
    g.strokeStyle = '#3ad16a'; g.lineWidth = 3;
    g.strokeRect(40, 50, 60, 40); g.strokeRect(156, 50, 60, 40); g.strokeRect(98, 160, 60, 40);
    g.beginPath(); g.moveTo(70, 90); g.lineTo(70, 130); g.lineTo(186, 130); g.lineTo(186, 90); g.moveTo(128, 130); g.lineTo(128, 160); g.stroke();
    g.strokeStyle = '#4fb8ff'; g.beginPath(); g.moveTo(20, 230); g.lineTo(236, 230); g.stroke();
  }
  // reflet léger
  const grd = g.createLinearGradient(0, 0, 256, 256); grd.addColorStop(0, 'rgba(255,255,255,0.08)'); grd.addColorStop(0.5, 'rgba(255,255,255,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

function overheadTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128;
  const g = c.getContext('2d'); g.fillStyle = '#3a4250'; g.fillRect(0, 0, 256, 128);
  for (let x = 10; x < 250; x += 16) for (let y = 10; y < 120; y += 16) {
    g.fillStyle = '#1a1f27'; g.fillRect(x, y, 11, 9);
    if ((x * 7 + y * 3) % 5 === 0) { g.fillStyle = '#e8eef5'; g.fillRect(x + 2, y + 2, 7, 2); }
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

// noseGeo : géométrie du nez dans le repère du modèle (pour en tirer le vitrage)
export function buildCockpit(noseGeo) {
  const root = new THREE.Group(); root.name = 'cockpit_interieur';
  const FLOOR = -0.85;
  const M = {
    panel: new THREE.MeshPhysicalMaterial({ color: 0x2c333d, roughness: 0.6, metalness: 0.2 }),
    trim: new THREE.MeshPhysicalMaterial({ color: 0x4a5361, roughness: 0.5, metalness: 0.3 }),
    leather: new THREE.MeshPhysicalMaterial({ color: 0x232a33, roughness: 0.62, sheen: 0.15, sheenColor: new THREE.Color(0x56657a) }),
    floor: new THREE.MeshPhysicalMaterial({ color: 0x20252d, roughness: 0.9 }),
    metal: new THREE.MeshPhysicalMaterial({ color: 0xc9ced6, roughness: 0.25, metalness: 1 }),
    grip: new THREE.MeshPhysicalMaterial({ color: 0x111418, roughness: 0.7 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0x9fc3e0, roughness: 0.05, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.02, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false }),
  };
  const screens = [];
  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); root.add(m); return m; };

  add(new THREE.BoxGeometry(3.2, 0.05, 3.4), M.floor, 28.8, FLOOR, 0);
  // planche de bord inclinée (face vers l'arrière, -X)
  const panel = add(new RoundedBoxGeometry(0.12, 0.62, 3.0, 2, 0.04), M.panel, 30.05, 0.05, 0, 0, 0, -0.18);
  // auvent anti-reflet
  add(new RoundedBoxGeometry(0.5, 0.08, 3.0, 2, 0.03), M.panel, 30.15, 0.42, 0, 0, 0, -0.1);
  add(new RoundedBoxGeometry(0.24, 0.12, 1.8, 2, 0.03), M.trim, 30.0, 0.52, 0); // FCU
  // écrans : PFD/ND de chaque côté, EWD au centre, SD sur le piédestal
  const scr = (kind, z, y = 0.08, w = 0.52, h = 0.44, x = 29.98, rz = -0.18) => {
    const mat = new THREE.MeshBasicMaterial({ map: screenTexture(kind), toneMapped: false });
    const m = add(new THREE.PlaneGeometry(w, h), mat, x, y, z, 0, -Math.PI / 2, 0);
    m.rotateX(rz); screens.push(m); return m;
  };
  scr('pfd', -1.22); scr('nd', -0.66); scr('ewd', 0, 0.1, 0.5, 0.46); scr('nd', 0.66); scr('pfd', 1.22);
  // piédestal central avec manettes de poussée
  add(new RoundedBoxGeometry(1.25, 0.42, 0.62, 2, 0.05), M.panel, 29.25, FLOOR + 0.42, 0);
  add(new RoundedBoxGeometry(0.5, 0.36, 0.6, 2, 0.05), M.panel, 29.72, FLOOR + 0.62, 0, 0, 0, -0.5);
  const sd = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.34), new THREE.MeshBasicMaterial({ map: screenTexture('sd'), toneMapped: false }));
  sd.position.set(29.84, FLOOR + 0.66, 0); sd.rotation.set(0, -Math.PI / 2, 0); sd.rotateX(-0.5 - 0.0); sd.rotateX(0); root.add(sd); screens.push(sd);
  for (const z of [-0.12, 0.12]) {
    add(new THREE.CylinderGeometry(0.018, 0.018, 0.22, 8), M.metal, 29.35, FLOOR + 0.72, z, 0, 0, 0.35);
    add(new RoundedBoxGeometry(0.06, 0.05, 0.1, 2, 0.015), M.grip, 29.31, FLOOR + 0.84, z);
  }
  // sièges pilotes + consoles latérales + mini-manches
  for (const s of [-1, 1]) {
    const z = 0.82 * s;
    add(new RoundedBoxGeometry(0.55, 0.14, 0.55, 3, 0.05), M.leather, 28.45, FLOOR + 0.52, z);
    add(new RoundedBoxGeometry(0.16, 0.85, 0.52, 3, 0.06), M.leather, 28.12, FLOOR + 1.0, z, 0, 0, 0.12);
    add(new RoundedBoxGeometry(0.16, 0.22, 0.3, 2, 0.06), M.leather, 28.06, FLOOR + 1.52, z, 0, 0, 0.12);
    add(new THREE.CylinderGeometry(0.06, 0.09, 0.45, 12), M.metal, 28.45, FLOOR + 0.23, z);
    for (const a of [-1, 1]) add(new RoundedBoxGeometry(0.42, 0.06, 0.07, 2, 0.02), M.leather, 28.4, FLOOR + 0.78, z + a * 0.3);
    // console latérale et mini-manche
    const cz = 1.38 * s;
    add(new RoundedBoxGeometry(0.9, 0.55, 0.3, 2, 0.04), M.panel, 28.75, FLOOR + 0.3, cz);
    add(new THREE.CylinderGeometry(0.03, 0.035, 0.08, 10), M.grip, 28.95, FLOOR + 0.6, cz);
    const stick = add(new THREE.CapsuleGeometry(0.035, 0.13, 4, 10), M.grip, 28.95, FLOOR + 0.72, cz, 0, 0, 0.18);
    stick.userData.stick = true;
    // palonniers
    for (const pz of [-0.12, 0.12]) add(new RoundedBoxGeometry(0.06, 0.22, 0.1, 2, 0.02), M.trim, 29.75, FLOOR + 0.16, z + pz, 0, 0, -0.5);
  }
  // panneau supérieur
  const ov = new THREE.Mesh(new RoundedBoxGeometry(1.1, 0.1, 1.2, 2, 0.03), [M.panel, M.panel, M.panel, new THREE.MeshBasicMaterial({ map: overheadTexture(), toneMapped: false }), M.panel, M.panel]);
  ov.position.set(29.1, 1.25, 0); ov.rotation.z = 0.25; root.add(ov);

  // vitrage : triangles de la partie haute-avant du nez, légèrement décalés vers l'intérieur
  if (noseGeo) {
    const src = noseGeo.index ? noseGeo.toNonIndexed() : noseGeo;
    const pos = src.attributes.position, nor = src.attributes.normal;
    const keep = [], keepN = [];
    const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), n = new THREE.Vector3();
    for (let i = 0; i < pos.count; i += 3) {
      a.fromBufferAttribute(pos, i); b.fromBufferAttribute(pos, i + 1); c.fromBufferAttribute(pos, i + 2);
      const cx = (a.x + b.x + c.x) / 3, cy = (a.y + b.y + c.y) / 3, cz = (a.z + b.z + c.z) / 3;
      if (cx > 29.7 && cx < 31.9 && cy > 0.25 && cy < 1.75 && Math.abs(cz) < 1.9) {
        for (const v of [a, b, c]) { n.set(v.x - 30.5, v.y - 0.0, v.z).normalize(); keep.push(v.x - n.x * 0.04, v.y - n.y * 0.04, v.z - n.z * 0.04); }
      }
    }
    if (keep.length) {
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(keep, 3)); g.computeVertexNormals();
      const glass = new THREE.Mesh(g, M.glass); glass.renderOrder = 2; root.add(glass);
    }
  }
  root.traverse((o) => { if (o.isMesh) o.frustumCulled = false; });
  const anchors = [
    { code: 'A', name: 'Écrans de vol', tag: 'Planche de bord', desc: 'Pilotage, navigation, moteurs', p: [29.98, 0.25, -0.9], main: true },
    { code: 'B', name: 'Mini-manche latéral', tag: 'Commandes de vol', desc: 'Commandes de vol électriques', p: [28.95, FLOOR + 0.8, 1.38] },
    { code: 'C', name: 'Piédestal', tag: 'Console centrale', desc: 'Manettes de poussée et écran système', p: [29.3, FLOOR + 0.8, 0] },
    { code: 'D', name: 'Panneau supérieur', tag: 'Plafond', desc: 'Commandes des circuits de l’avion', p: [29.1, 1.3, 0.3] },
  ];
  return { root, materials: Object.values(M), anchors };
}
