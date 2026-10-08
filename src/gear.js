// Train d'atterrissage procédural (illustration) : jambes, amortisseurs chromés, bogies, pneus.
import * as THREE from 'three';

const mats = () => ({
  paint: new THREE.MeshPhysicalMaterial({ color: 0xe3e6ea, metalness: 0.25, roughness: 0.38, clearcoat: 0.4 }),
  chrome: new THREE.MeshPhysicalMaterial({ color: 0xeeeeee, metalness: 1, roughness: 0.12 }),
  tire: new THREE.MeshPhysicalMaterial({ color: 0x151517, metalness: 0, roughness: 0.82, side: THREE.DoubleSide }),
  hub: new THREE.MeshPhysicalMaterial({ color: 0xaeb3ba, metalness: 0.9, roughness: 0.28 }),
  dark: new THREE.MeshPhysicalMaterial({ color: 0x3a3f47, metalness: 0.6, roughness: 0.45 }),
});

function cylBetween(a, b, r, mat, seg = 20) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, dir.length(), seg), mat);
  m.position.copy(a).addScaledVector(dir, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  return m;
}

function tireGeometry(ro, ri, w) {
  // profil arrondi du pneu, tourné autour de l'axe Y puis couché sur Z (essieu latéral)
  const pts = [], c = w * 0.32, n = 8;
  pts.push(new THREE.Vector2(ri, -w / 2));
  for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 + (i / n) * (Math.PI / 2); pts.push(new THREE.Vector2(ro - c + Math.cos(a) * c, -w / 2 + c + Math.sin(a) * c)); }
  for (let i = 0; i <= n; i++) { const a = (i / n) * (Math.PI / 2); pts.push(new THREE.Vector2(ro - c + Math.cos(a) * c, w / 2 - c + Math.sin(a) * c)); }
  pts.push(new THREE.Vector2(ri, w / 2));
  const g = new THREE.LatheGeometry(pts, 40);
  g.rotateX(Math.PI / 2);
  return g;
}

function wheel(M, ro, ri, w) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(tireGeometry(ro, ri, w), M.tire));
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(ri * 1.02, ri * 1.02, w * 0.86, 28), M.hub);
  hub.rotation.x = Math.PI / 2; g.add(hub);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(ri * 0.35, ri * 0.35, w * 0.92, 16), M.dark);
  cap.rotation.x = Math.PI / 2; g.add(cap);
  return g;
}

// side : +1 tribord (z+), -1 bâbord
function mainGear(M, L, side) {
  const g = new THREE.Group();
  const top = new THREE.Vector3(0, 0, 0), mid = new THREE.Vector3(0, -L * 0.55, 0), bot = new THREE.Vector3(0, -L + 0.25, 0);
  g.add(cylBetween(top, mid, 0.2, M.paint));
  g.add(cylBetween(mid.clone().add(new THREE.Vector3(0, 0.15, 0)), bot, 0.14, M.chrome));
  // contrefiche latérale
  g.add(cylBetween(new THREE.Vector3(0, -L * 0.45, 0), new THREE.Vector3(0, -0.15, -1.3 * side), 0.07, M.dark));
  // compas (torque link)
  g.add(cylBetween(new THREE.Vector3(0.18, -L * 0.6, 0), new THREE.Vector3(0.28, -L * 0.75, 0), 0.04, M.dark));
  g.add(cylBetween(new THREE.Vector3(0.28, -L * 0.75, 0), new THREE.Vector3(0.16, -L + 0.35, 0), 0.04, M.dark));
  // bogie à 4 roues
  const axleY = -L;
  const beam = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.18, 0.2), M.paint);
  beam.position.set(0, axleY + 0.05, 0); g.add(beam);
  for (const dx of [-0.85, 0.85]) {
    g.add(cylBetween(new THREE.Vector3(dx, axleY, -0.62), new THREE.Vector3(dx, axleY, 0.62), 0.07, M.dark));
    for (const dz of [-0.5, 0.5]) { const w = wheel(M, 0.62, 0.36, 0.42); w.position.set(dx, axleY, dz); g.add(w); }
  }
  return g;
}

function noseGear(M, L) {
  const g = new THREE.Group();
  g.add(cylBetween(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -L * 0.55, 0), 0.15, M.paint));
  g.add(cylBetween(new THREE.Vector3(0, -L * 0.5, 0), new THREE.Vector3(0, -L + 0.1, 0), 0.1, M.chrome));
  g.add(cylBetween(new THREE.Vector3(0, -L * 0.4, 0), new THREE.Vector3(-1.2, -0.1, 0), 0.06, M.dark));
  g.add(cylBetween(new THREE.Vector3(0, -L, -0.42), new THREE.Vector3(0, -L, 0.42), 0.06, M.dark));
  for (const dz of [-0.3, 0.3]) { const w = wheel(M, 0.46, 0.26, 0.3); w.position.set(0, -L, dz); g.add(w); }
  return g;
}

// Repère du modèle : x vers le nez, y vers le haut, z vers tribord. Sol visé : y ≈ -6.4
export function buildGear() {
  const M = mats();
  const root = new THREE.Group(); root.name = 'train';
  const nose = noseGear(M, 3.35); nose.name = 'train_avant';
  const pivNose = new THREE.Group(); pivNose.position.set(25.2, -2.6, 0); pivNose.add(nose);
  const right = mainGear(M, 4.0, 1); const left = mainGear(M, 4.0, -1);
  const pivR = new THREE.Group(); pivR.position.set(1.2, -1.75, 5.1); pivR.add(right);
  const pivL = new THREE.Group(); pivL.position.set(1.2, -1.75, -5.1); pivL.add(left);
  root.add(pivNose, pivR, pivL);
  const legs = [
    { name: 'train_avant', pivot: pivNose, leg: nose, retract: (o, k) => { o.rotation.z = (Math.PI / 2) * k; } },
    { name: 'train_D', pivot: pivR, leg: right, retract: (o, k) => { o.rotation.x = (Math.PI / 2) * k; } },
    { name: 'train_G', pivot: pivL, leg: left, retract: (o, k) => { o.rotation.x = -(Math.PI / 2) * k; } },
  ];
  for (const l of legs) l.base = l.pivot.position.clone();
  root.traverse((o) => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } });
  return { root, legs, materials: Object.values(M) };
}
