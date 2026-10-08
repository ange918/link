// Cabine procédurale (illustration) : plancher, rangées de sièges 3-3-3, balisage lumineux.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export function buildCabin({ light = false } = {}) {
  const root = new THREE.Group(); root.name = 'cabine';
  const FLOOR_Y = -1.05;
  const M = {
    floor: new THREE.MeshPhysicalMaterial({ color: 0x2a2f3a, roughness: 0.9 }),
    carpet: new THREE.MeshPhysicalMaterial({ color: 0x1b2030, roughness: 0.95 }),
    fabric: new THREE.MeshPhysicalMaterial({ color: 0x27324a, roughness: 0.78, sheen: 0.6, sheenColor: new THREE.Color(0x6f7fa8) }),
    cover: new THREE.MeshPhysicalMaterial({ color: 0xe9e4d8, roughness: 0.7 }),
    wall: new THREE.MeshPhysicalMaterial({ color: 0xd8d6d0, roughness: 0.55 }),
    strip: new THREE.MeshBasicMaterial({ color: 0xf2c46b }),
  };
  const x0 = -12, x1 = 23;
  const floor = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0 + 1.4, 0.06, 5.4), M.floor);
  floor.position.set((x0 + x1) / 2 + 0.4, FLOOR_Y - 0.03, 0); root.add(floor);
  const aisles = [-0.955, 0.955];
  for (const z of aisles) {
    const c = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0 + 1, 0.012, 0.48), M.carpet);
    c.position.set((x0 + x1) / 2 + 0.4, FLOOR_Y + 0.006, z); root.add(c);
    for (const s of [-1, 1]) {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0 + 1, 0.02, 0.025), M.strip);
      strip.position.set((x0 + x1) / 2 + 0.4, FLOOR_Y + 0.015, z + s * 0.235); root.add(strip);
    }
  }
  const seg = light ? 1 : 2;
  const cushion = new RoundedBoxGeometry(0.46, 0.13, 0.44, seg, 0.05).translate(0, 0.44, 0);
  const back = new RoundedBoxGeometry(0.11, 0.72, 0.44, seg, 0.05).translate(0, 0.36, 0).rotateZ(0.13).translate(-0.2, 0.46, 0);
  const leg = new THREE.BoxGeometry(0.36, 0.38, 0.05).toNonIndexed().translate(0, 0.19, 0);
  const fabricGeo = mergeGeometries([cushion, back, leg]);
  const coverGeo = new RoundedBoxGeometry(0.12, 0.2, 0.4, seg, 0.04).translate(0, 0.09, 0).rotateZ(0.13).translate(-0.31, 1.13, 0);
  const cols = [-2.38, -1.91, -1.44, -0.47, 0, 0.47, 1.44, 1.91, 2.38];
  const rows = [];
  for (let x = x1 - 0.6; x > x0; x -= 0.82) { if (x > 7.6 && x < 9.6) continue; rows.push(x); }
  const n = rows.length * cols.length;
  const seats = new THREE.InstancedMesh(fabricGeo, M.fabric, n);
  const covers = new THREE.InstancedMesh(coverGeo, M.cover, n);
  const m = new THREE.Matrix4(); let i = 0;
  for (const x of rows) for (const z of cols) { m.makeTranslation(x, FLOOR_Y, z); seats.setMatrixAt(i, m); covers.setMatrixAt(i, m); i++; }
  root.add(seats, covers);
  // cloisons (offices / portes)
  for (const x of [7.4, 9.9, x1 + 0.4]) {
    for (const z of [-1.95, 1.95]) {
      const w = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.25, 1.4), M.wall);
      w.position.set(x, FLOOR_Y + 0.62, z); root.add(w);
    }
  }
  return { root, materials: Object.values(M), seatCount: n, rowCount: rows.length };
}
