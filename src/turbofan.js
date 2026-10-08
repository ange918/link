// Turboréacteur à double flux procédural, en vue écorchée (illustration, proportions approximatives).
// Axe moteur = +X (soufflante à l'avant, en +X). Unités : mètres. La moitié tournée vers +Z est ouverte.
import * as THREE from 'three';

const TAU = Math.PI * 2;

function lathe(profile, mat, open = true, seg = 72) {
  // profil [rayon, x] ; LatheGeometry tourne autour de Y, on couche ensuite l'axe sur X
  const pts = profile.map(([r, x]) => new THREE.Vector2(r, x));
  const g = new THREE.LatheGeometry(pts, seg, open ? Math.PI : 0, open ? Math.PI : TAU);
  g.rotateZ(-Math.PI / 2); // Y -> X
  const m = new THREE.Mesh(g, mat);
  return m;
}

function bladeGeometry(rIn, rOut, chord, thick, twist) {
  const g = new THREE.BoxGeometry(thick, rOut - rIn, chord, 1, 6, 1);
  g.translate(0, (rIn + rOut) / 2, 0);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i), t = (y - rIn) / (rOut - rIn);
    const a = (0.35 + twist * t);
    const x = p.getX(i), z = p.getZ(i);
    p.setXYZ(i, x * Math.cos(a) - z * Math.sin(a), y, x * Math.sin(a) + z * Math.cos(a));
  }
  g.computeVertexNormals();
  return g;
}

function bladeRing(count, rIn, rOut, chord, thick, twist, mat) {
  const geo = bladeGeometry(rIn, rOut, chord, thick, twist);
  geo.rotateY(Math.PI / 2); // corde le long de l'axe moteur
  const im = new THREE.InstancedMesh(geo, mat, count);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), ax = new THREE.Vector3(1, 0, 0);
  for (let i = 0; i < count; i++) { q.setFromAxisAngle(ax, (i / count) * TAU); m.makeRotationFromQuaternion(q); im.setMatrixAt(i, m); }
  return im;
}

export function buildTurbofan() {
  const M = {
    paint: new THREE.MeshPhysicalMaterial({ color: 0xf2f4f7, roughness: 0.32, metalness: 0.05, clearcoat: 0.8, clearcoatRoughness: 0.18, side: THREE.DoubleSide }),
    liner: new THREE.MeshPhysicalMaterial({ color: 0x3a4250, roughness: 0.7, metalness: 0.3, side: THREE.DoubleSide }),
    casing: new THREE.MeshPhysicalMaterial({ color: 0x8c939c, roughness: 0.35, metalness: 1, side: THREE.DoubleSide }),
    titanium: new THREE.MeshPhysicalMaterial({ color: 0xc9ced6, roughness: 0.24, metalness: 1 }),
    fanBlade: new THREE.MeshPhysicalMaterial({ color: 0x9aa3ad, roughness: 0.3, metalness: 0.9 }),
    hot: new THREE.MeshPhysicalMaterial({ color: 0x6b5a4a, roughness: 0.45, metalness: 1 }),
    glow: new THREE.MeshBasicMaterial({ color: 0xff9a3c, toneMapped: false, side: THREE.DoubleSide }),
    dark: new THREE.MeshPhysicalMaterial({ color: 0x1d222a, roughness: 0.5, metalness: 0.6 }),
  };
  const root = new THREE.Group(); root.name = 'turbofan';
  const statics = new THREE.Group(), lp = new THREE.Group(), hp = new THREE.Group();
  root.add(statics, lp, hp);

  // nacelle (demi-coque) : extérieur + paroi intérieure
  statics.add(lathe([[1.62, 4.25], [1.86, 4.05], [1.98, 3.4], [2.0, 2.2], [1.94, 0.6], [1.8, -0.8], [1.58, -1.9]], M.paint));
  statics.add(lathe([[1.62, 4.25], [1.56, 3.9], [1.6, 3.2], [1.6, 2.4], [1.55, 1.2], [1.45, -0.6], [1.38, -1.9]], M.liner));
  // carter de soufflante (anneau métallique visible dans la coupe)
  statics.add(lathe([[1.6, 3.3], [1.6, 2.5]], M.casing));
  // capot du cœur (demi) et tuyère primaire
  statics.add(lathe([[0.62, 2.35], [0.98, 1.9], [1.02, 0.8], [1.05, -0.5], [1.08, -1.8], [0.98, -3.1], [0.82, -3.9]], M.paint));
  statics.add(lathe([[0.6, 2.2], [0.62, 1.6], [0.5, 0.95], [0.44, 0.2], [0.46, -0.1]], M.casing)); // conduit compresseur
  statics.add(lathe([[0.55, -0.15], [0.74, -0.35], [0.78, -1.05], [0.6, -1.3]], M.hot)); // chemise de combustion
  statics.add(lathe([[0.62, -1.35], [0.7, -1.7], [0.84, -2.2], [0.92, -3.0], [0.86, -3.85]], M.hot)); // carter turbine
  // flamme : anneau lumineux dans la chambre
  const flame = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.07, 12, 64, Math.PI), M.glow);
  flame.rotation.y = Math.PI / 2; flame.position.x = -0.7; statics.add(flame);
  for (const x of [-0.45, -0.95]) { const f2 = flame.clone(); f2.position.x = x; f2.scale.setScalar(0.92); statics.add(f2); }
  // injecteurs
  for (let i = 0; i < 9; i++) {
    const a = Math.PI * (i / 8);
    const inj = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.3, 8), M.dark);
    inj.rotation.z = Math.PI / 2; inj.position.set(-0.2, Math.sin(a) * 0.62, Math.cos(a) * 0.62); statics.add(inj);
  }
  // cône d'éjection
  statics.add(lathe([[0.001, -5.0], [0.22, -4.5], [0.42, -3.7], [0.5, -3.0], [0.48, -2.6]], M.hot, false, 48));

  // attelage basse pression : cône, soufflante, compresseur BP, turbine BP
  const spinner = lathe([[0.001, 3.55], [0.18, 3.45], [0.38, 3.2], [0.52, 2.9], [0.58, 2.6]], M.titanium, false, 48);
  lp.add(spinner);
  const fan = bladeRing(20, 0.5, 1.56, 0.62, 0.05, 0.9, M.fanBlade); fan.position.x = 2.85; lp.add(fan);
  const lpcX = [2.2, 1.95, 1.7];
  lpcX.forEach((x, i) => { const r = bladeRing(36, 0.62, 0.95 - i * 0.04, 0.16, 0.025, 0.5, M.titanium); r.position.x = x; lp.add(r); });
  const lptX = [-2.15, -2.45, -2.75, -3.05, -3.35];
  lptX.forEach((x, i) => { const r = bladeRing(56, 0.5, 0.78 + i * 0.03, 0.14, 0.02, 0.4, M.hot); r.position.x = x; lp.add(r); });
  const lpShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 6.0, 20), M.casing); lpShaft.rotation.z = Math.PI / 2; lpShaft.position.x = -0.2; lp.add(lpShaft);

  // attelage haute pression : compresseur HP, turbine HP
  const hpcX = [1.35, 1.15, 0.95, 0.77, 0.6, 0.45, 0.32, 0.2];
  hpcX.forEach((x, i) => { const r = bladeRing(48, 0.28, 0.58 - i * 0.017, 0.1, 0.018, 0.4, M.titanium); r.position.x = x; hp.add(r); });
  const hptX = [-1.5, -1.75];
  hptX.forEach((x) => { const r = bladeRing(60, 0.3, 0.66, 0.13, 0.025, 0.3, M.hot); r.position.x = x; hp.add(r); });
  const hpDrum = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.29, 3.4, 32), M.casing);
  hpDrum.rotation.z = Math.PI / 2; hpDrum.position.x = -0.2; hp.add(hpDrum);

  // ouverture tournée vers +Z : les demi-lathes couvrent par défaut un côté, on les oriente
  statics.rotation.x = -Math.PI / 2;
  root.traverse((o) => { if (o.isMesh) { o.frustumCulled = false; } });

  // ancres d'étiquettes (repère moteur, avant rotation des rotors)
  const anchors = [
    { code: 'A', name: 'Soufflante', tag: 'Flux froid', desc: "Aspire l'air, le flux froid pousse", p: [2.85, 0.4, 0.95] },
    { code: 'B', name: 'Compresseur BP', tag: 'Basse pression', desc: 'Premiers étages de compression', p: [1.95, 0.25, 0.6] },
    { code: 'C', name: 'Compresseur HP', tag: 'Haute pression', desc: "Comprime l'air avant la combustion", p: [0.8, 0.15, 0.4] },
    { code: 'D', name: 'Chambre de combustion', tag: 'Cœur chaud', desc: 'Le carburant brûle dans l’air comprimé', p: [-0.7, 0.55, -0.1], main: true },
    { code: 'E', name: 'Turbines HP et BP', tag: 'Détente', desc: 'Entraînent compresseurs et soufflante', p: [-2.4, 0.2, 0.5] },
    { code: 'F', name: 'Tuyère', tag: 'Échappement', desc: 'Éjecte les gaz chauds', p: [-4.1, 0.15, 0.3] },
  ];
  return { root, lp, hp, materials: Object.values(M), anchors };
}
