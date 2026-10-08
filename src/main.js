import '@fontsource/sora/latin-200.css';
import '@fontsource/sora/latin-300.css';
import '@fontsource/sora/latin-400.css';
import '@fontsource/sora/latin-500.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/b612-mono/latin-400.css';
import './style.css';

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CHAPTERS } from './content.js';
import { buildGear } from './gear.js';
import { buildCabin } from './cabin.js';
import { buildTurbofan } from './turbofan.js';
import { buildCockpit } from './cockpit.js';

gsap.registerPlugin(ScrollTrigger);
const BASE = import.meta.env.BASE_URL;
const reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
let reduced = reduceMQ.matches;
const coarse = window.matchMedia('(pointer: coarse)').matches;
const TOTAL = String(CHAPTERS.length).padStart(2, '0');

/* ------------------------------------------------------------------ DOM */
const ARROW_L = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13 8H3M7 4 3 8l4 4"/></svg>';
const ARROW_R = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';
const ORIGIN = {
  model: 'Pièce du modèle 3D',
  procedural: 'Ajout procédural, à titre d’illustration',
};
const frag = document.createDocumentFragment();
CHAPTERS.forEach((c, j) => {
  const s = document.createElement('section');
  s.className = 'chapter'; s.id = c.id; s.dataset.index = String(j + 2);
  s.setAttribute('aria-labelledby', `t-${c.id}`);
  const prev = j === 0 ? { id: 'eclate', label: 'Vue éclatée' } : { id: CHAPTERS[j - 1].id, label: `${CHAPTERS[j - 1].num} ${CHAPTERS[j - 1].short}` };
  const next = j === CHAPTERS.length - 1 ? { id: 'final', label: 'Réassemblage' } : { id: CHAPTERS[j + 1].id, label: `${CHAPTERS[j + 1].num} ${CHAPTERS[j + 1].short}` };
  s.innerHTML = `
    <article class="panel">
      <span class="tick tl"></span><span class="tick tr"></span><span class="tick bl"></span><span class="tick br"></span>
      <p class="sec-num"><b>${c.num}</b> / ${TOTAL} — ${c.kicker}</p>
      <h2 id="t-${c.id}">${c.title}</h2>
      <p class="p-desc">${c.text}</p>
      <ul class="chips" aria-label="Éléments clés">${c.tags.map((t) => `<li>${t}</li>`).join('')}</ul>
      <p class="origin">${c.originText ?? ORIGIN[c.origin]}</p>
      <div class="panel__nav">
        <span class="panel__hint" aria-hidden="true">← ${prev.label} · ${next.label} →</span>
        <a class="round" href="#${prev.id}" aria-label="Précédent : ${prev.label}">${ARROW_L}</a>
        <a class="round" href="#${next.id}" aria-label="Suivant : ${next.label}">${ARROW_R}</a>
      </div>
    </article>`;
  frag.appendChild(s);
});
document.getElementById('chapters').replaceWith(frag);

const sections = [...document.querySelectorAll('#story > .chapter')];
const LABELS = ["Vue d'ensemble", 'Vue éclatée', ...CHAPTERS.map((c) => c.title), 'Réassemblage'];
const NUMS = ['', '', ...CHAPTERS.map((c) => c.num), ''];
const prog = document.getElementById('progress');
prog.innerHTML = CHAPTERS.map((c, j) => `<li><a class="seg" href="#${c.id}" data-k="${j + 2}"><i><b></b></i><span>${c.num}</span><em>${c.short}</em></a></li>`).join('');
const segs = [...prog.querySelectorAll('.seg')];
const chapterLabel = document.getElementById('chapterLabel');
const chapterNum = document.getElementById('chapterNum');
const bigNum = document.getElementById('bigNum');
let active = -1;
function setActive(i) {
  if (i === active) return;
  active = i;
  segs.forEach((a) => {
    const k = +a.dataset.k;
    a.classList.toggle('on', k === i); a.classList.toggle('done', k < i);
    if (k === i) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current');
  });
  chapterLabel.textContent = LABELS[i];
  chapterNum.innerHTML = NUMS[i] ? `<b>${NUMS[i]}</b> / ${TOTAL}` : '';
  bigNum.textContent = NUMS[i];
  bigNum.classList.toggle('is-on', !!NUMS[i]);
  if (reduced) jumpTo(i);
}
function setProgress(p) { // p : position dans la timeline (0 → 9)
  for (const a of segs) a.style.setProperty('--fill', THREE.MathUtils.clamp(p - (+a.dataset.k - 1), 0, 1).toFixed(3));
}

/* ------------------------------------------------------------------ État unique animé par la timeline */
const GROUPS = ['fuselage', 'cockpit', 'ailes', 'moteurs', 'empennage', 'train', 'cabine'];
const NODE_GROUP = {
  fuselage: 'fuselage', cockpit: 'cockpit', aile_G: 'ailes', aile_D: 'ailes',
  mat_G: 'moteurs', mat_D: 'moteurs', nacelle_G: 'moteurs', nacelle_D: 'moteurs', soufflante_G: 'moteurs', soufflante_D: 'moteurs',
  derive: 'empennage', stabilisateur_G: 'empennage', stabilisateur_D: 'empennage',
  train_avant: 'train', train_G: 'train', train_D: 'train',
};
// Vecteurs de sortie dans le repère du fuselage (x : vers le nez, y : haut, z : tribord), en mètres
// (distances d'éclatement de la direction visuelle)
const EXIT = {
  fuselage: [0, 0, 0], cockpit: [9, 0.6, 0],
  aile_G: [0, -0.6, -8], aile_D: [0, -0.6, 8],
  mat_G: [4, -5.5, -13], mat_D: [4, -5.5, 13],
  nacelle_G: [4, -5.5, -13], nacelle_D: [4, -5.5, 13],
  soufflante_G: [4, -5.5, -13], soufflante_D: [4, -5.5, 13],
  derive: [-8, 5, 0], stabilisateur_G: [-8, 0.8, -4], stabilisateur_D: [-8, 0.8, 4],
  train_avant: [3, -6.5, 0], train_G: [0, -6.5, -2.5], train_D: [0, -6.5, 2.5],
  cabine: [0, 9, 0],
};
// Une position caméra, un point visé et une focale par chapitre (repère du modèle)
const v3 = (x, y, z) => ({ x, y, z });
const SHOTS = {
  hero: { fov: 26, pos: v3(86, 26, 100), tgt: v3(2, 0, 0) },
  overview: { fov: 30, pos: v3(88, 60, 104), tgt: v3(2, -3, 0) },
  wide: { fov: 30, pos: v3(84, 50, 102), tgt: v3(2, -2, 0) },
  fuselage: { fov: 30, pos: v3(40, 34, 110), tgt: v3(0, 2, 0) },
  cockpit: { fov: 42, pos: v3(32.2, 1.9, 3.4), tgt: v3(38.9, 0.0, 0) },
  ailes: { fov: 32, pos: v3(32, 118, 108), tgt: v3(-2, -2, 0) },
  moteurs: { fov: 30, mob: 1.35, pos: v3(16, -3.6, 44), tgt: v3(10.7, -8.75, 23.6) },
  empennage: { fov: 30, pos: v3(-82, 26, 52), tgt: v3(-40, 7, 0) },
  train: { fov: 30, pos: v3(50, -9, 38), tgt: v3(8, -10.5, 0) },
  cabine: { fov: 32, pos: v3(36, 36, 50), tgt: v3(1, 8, 0) },
  final: { fov: 28, pos: v3(-80, 26, 100), tgt: v3(0, 1, 0) },
};
const S = {
  cam: { ...SHOTS.hero.pos }, tgt: { ...SHOTS.hero.tgt }, lens: { fov: SHOTS.hero.fov, mob: 1 },
  ex: Object.fromEntries(GROUPS.map((g) => [g, 0])),
  dim: Object.fromEntries(GROUPS.map((g) => [g, 0])),
  gear: 0, cabin: 0, nose: 0, cut: 0,
};

const REST = 0.45; // écart des pièces non présentées pendant les chapitres
const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.inOut' } });
const camTo = (shot, at, d) => tl
  .to(S.cam, { ...SHOTS[shot].pos, duration: d }, at)
  .to(S.tgt, { ...SHOTS[shot].tgt, duration: d }, at)
  .to(S.lens, { fov: SHOTS[shot].fov, mob: SHOTS[shot].mob ?? 1, duration: d }, at);
// 0 → 1 : vue éclatée complète, sorties décalées
camTo('overview', 0.15, 0.7);
['cockpit', 'empennage', 'ailes', 'moteurs', 'train'].forEach((g, i) => tl.to(S.ex, { [g]: 1, duration: 0.5 }, 0.22 + i * 0.06));
tl.to(S, { gear: 1, duration: 0.45 }, 0.2);
// chapitres : la pièce se détache, la caméra s'approche et tient le plan, puis repart en plan large
CHAPTERS.forEach((c, j) => {
  const k = j + 2, a = k - 0.82, m = k - 0.55;
  camTo('wide', a, 0.27);
  camTo(c.id, m, 0.32);
  if (j === 0) {
    GROUPS.filter((g) => g !== 'fuselage').forEach((g) => tl.to(S.dim, { [g]: 1, duration: 0.3 }, a));
  } else {
    const prev = CHAPTERS[j - 1].part;
    tl.to(S.dim, { [prev]: 1, duration: 0.27 }, a);
    if (j === 1) ['ailes', 'moteurs', 'empennage', 'train'].forEach((g, i) => tl.to(S.ex, { [g]: REST, duration: 0.3 }, a + i * 0.03));
    else tl.to(S.ex, { [prev]: REST, duration: 0.27 }, a);
    tl.to(S.dim, { [c.part]: 0, duration: 0.3 }, m);
    tl.to(S.ex, { [c.part]: 1, duration: 0.32 }, m);
  }
  if (c.part === 'cockpit') { tl.to(S, { nose: 1, duration: 0.24, ease: 'power2.out' }, m + 0.12); tl.to(S, { nose: 0, duration: 0.18, ease: 'power2.in' }, k + 0.18); }
  if (c.part === 'moteurs') { tl.to(S, { cut: 1, duration: 0.26, ease: 'power2.out' }, m + 0.1); tl.to(S, { cut: 0, duration: 0.18, ease: 'power2.in' }, k + 0.18); }
  if (c.part === 'cabine') tl.to(S, { cabin: 1, duration: 0.3 }, m - 0.05);
});
// 8 → 9 : remontage décalé, retour au plan large
tl.to(S, { cabin: 0, duration: 0.3 }, 8.4);
tl.to(S.dim, { ...Object.fromEntries(GROUPS.map((g) => [g, 0])), duration: 0.3 }, 8.2);
camTo('final', 8.2, 0.62);
['cabine', 'moteurs', 'ailes', 'empennage', 'cockpit', 'train'].forEach((g, i) => tl.to(S.ex, { [g]: 0, duration: 0.38 }, 8.2 + i * 0.07));
tl.to(S, { gear: 0, duration: 0.3 }, 8.55);
tl.set({}, {}, 9);

/* ------------------------------------------------------------------ Three.js */
const canvas = document.getElementById('scene');
const loader = document.getElementById('loader');
const loaderBar = document.getElementById('loaderBar');
const loaderText = document.getElementById('loaderText');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
} catch (e) {
  document.documentElement.classList.add('no-webgl');
  document.getElementById('fallback').hidden = false;
  loader.classList.add('is-done');
}

const GHOST = 0x9fc3e0, ACCENT = 0x5cc8ff;
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0a0e14, 90, 230);
const camera = new THREE.PerspectiveCamera(30, 1, 0.3, 900);
const root = new THREE.Group(); scene.add(root);
const meshes = new Map(); // nom → { obj, base }
const groupMats = Object.fromEntries(GROUPS.map((g) => [g, []]));
const ghost = {}; // groupe → { fill, line, rim }
const groupCenter = {};
let gear, cabin, engine, cockpit, fans = [], accent, grid;
let distScale = 1, isMobile = false, ready = false, needsRender = true, lensFov = 30;

function fresnelMat() {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    uniforms: { uColor: { value: new THREE.Color(0x8ec9ff) }, uPower: { value: 2.6 }, uStrength: { value: 0 } },
    vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 wp = modelMatrix*vec4(position,1.); vN = normalize(mat3(modelMatrix)*normal); vV = normalize(cameraPosition-wp.xyz); gl_Position = projectionMatrix*viewMatrix*wp; }',
    fragmentShader: 'uniform vec3 uColor; uniform float uPower; uniform float uStrength; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.-abs(dot(normalize(vN),normalize(vV))), uPower); gl_FragColor = vec4(uColor*f*uStrength, f*uStrength); }',
  });
}
function gridMat() {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uColor: { value: new THREE.Color(GHOST) }, uFade: { value: 140 }, uAlpha: { value: 1 } },
    vertexShader: 'varying vec3 vW; void main(){ vec4 wp = modelMatrix*vec4(position,1.); vW = wp.xyz; gl_Position = projectionMatrix*viewMatrix*wp; }',
    fragmentShader: `uniform vec3 uColor; uniform float uFade; uniform float uAlpha; varying vec3 vW;
      float line(vec2 p, float s, float w){ vec2 g = abs(fract(p/s-.5)-.5)/fwidth(p/s); return 1.-min(min(g.x,g.y)/w,1.); }
      void main(){ float d = length(vW.xz); float fade = smoothstep(uFade, 10., d);
        float a = line(vW.xz, 5., 1.)*.10 + line(vW.xz, 25., 1.2)*.20;
        gl_FragColor = vec4(uColor, a*fade*uAlpha); }`,
  });
}
function track(group, mat) {
  groupMats[group].push({ mat, transparent: mat.transparent, opacity: mat.opacity ?? 1 });
}
// fantôme : remplissage très léger + arêtes + liseré fresnel, attachés à chaque maillage
function addGhost(group, mesh, edgeAngle = 28) {
  const G = ghost[group];
  const fill = new THREE.Mesh(mesh.geometry, G.fill); fill.renderOrder = 3; fill.raycast = () => {};
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, edgeAngle), G.line); edges.renderOrder = 4;
  const rim = new THREE.Mesh(mesh.geometry, G.rim); rim.renderOrder = 5;
  for (const o of [fill, edges, rim]) { o.frustumCulled = false; mesh.add(o); }
  mesh.userData.ghost = { fill, edges, rim };
}

if (renderer) {
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  // 4 lumières de la direction visuelle : key chaude, rim froide, hémisphère, ponctuelle d'accent sur la pièce
  const key = new THREE.DirectionalLight(0xfff4e6, 2.6); key.position.set(-40, 60, 50); scene.add(key);
  const rimL = new THREE.DirectionalLight(0x8ec9ff, 3.0); rimL.position.set(30, 25, -60); scene.add(rimL);
  scene.add(new THREE.HemisphereLight(0xc9daf0, 0x0b0f16, 0.4));
  accent = new THREE.PointLight(ACCENT, 0, 40, 1.5); scene.add(accent);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;

  grid = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), gridMat());
  grid.rotation.x = -Math.PI / 2; grid.position.y = -16; grid.renderOrder = -1; scene.add(grid);

  for (const g of GROUPS) {
    ghost[g] = {
      fill: new THREE.MeshBasicMaterial({ color: GHOST, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }),
      line: new THREE.LineBasicMaterial({ color: GHOST, transparent: true, opacity: 0, depthWrite: false }),
      rim: fresnelMat(),
    };
  }

  const showProgress = (pct) => {
    loaderBar.style.transform = `scaleX(${pct / 100})`;
    loaderText.textContent = `Chargement du modèle 3D… ${pct} %`;
  };
  const gltfLoader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  gltfLoader.loadAsync(`${BASE}models/avion.glb`, (e) => {
    const total = e.lengthComputable ? e.total : 180000;
    showProgress(Math.min(99, Math.round((e.loaded / total) * 100)));
  }).then((gltf) => {
    setupModel(gltf.scene);
    loaderText.textContent = 'Préparation de la scène…';
    resize();
    // précompile les éléments cachés au départ (train, cabine, intérieur, moteur écorché) pour éviter un à-coup
    for (const o of [gear.root, cabin.root, engine.root, cockpit.root]) o.visible = true;
    renderer.compile(scene, camera);
    ready = true;
    render(0);
    requestAnimationFrame(() => {
      loader.classList.add('is-done');
      ScrollTrigger.refresh();
    });
  }).catch((err) => {
    console.error(err);
    loaderText.textContent = 'Le modèle 3D n’a pas pu être chargé. Le contenu texte reste disponible.';
    loader.classList.add('is-error');
    setTimeout(() => loader.classList.add('is-done'), 2500);
  });
}

function setupModel(model) {
  const meshList = [];
  model.traverse((o) => { if (o.isMesh) meshList.push(o); });
  let noseGeo = null;
  for (const o of meshList) {
    const group = NODE_GROUP[o.name];
    if (!group) continue;
    // la compression meshopt quantifie les sommets (transform de déquantification sur le nœud) :
    // on repasse en flottants dans le repère du modèle avant de recentrer chaque pièce
    o.updateWorldMatrix(true, false);
    const geo = new THREE.BufferGeometry();
    for (const [k, a] of Object.entries(o.geometry.attributes)) {
      const arr = new Float32Array(a.count * a.itemSize);
      for (let i = 0; i < a.count; i++) for (let c2 = 0; c2 < a.itemSize; c2++) arr[i * a.itemSize + c2] = a.getComponent(i, c2);
      geo.setAttribute(k, new THREE.BufferAttribute(arr, a.itemSize));
    }
    geo.setIndex(o.geometry.index);
    geo.applyMatrix4(o.matrixWorld);
    if (o.name === 'cockpit') noseGeo = geo.clone();
    o.geometry.dispose();
    o.geometry = geo;
    o.position.set(0, 0, 0); o.quaternion.identity(); o.scale.set(1, 1, 1);
    o.geometry.computeBoundingBox();
    const c = o.geometry.boundingBox.getCenter(new THREE.Vector3());
    o.geometry.translate(-c.x, -c.y, -c.z);
    const isFan = o.name.startsWith('soufflante');
    const isBody = group === 'fuselage' || group === 'cockpit';
    const mat = new THREE.MeshPhysicalMaterial({
      map: o.material.map,
      roughness: isFan ? 0.3 : 0.34,
      metalness: isFan ? 0.8 : 0.05,
      clearcoat: isFan ? 0 : 0.8,
      clearcoatRoughness: 0.12,
      side: isBody || isFan ? THREE.DoubleSide : THREE.FrontSide,
    });
    o.material.dispose();
    o.material = mat;
    track(group, mat);
    root.add(o);
    o.position.copy(c);
    meshes.set(o.name, { obj: o, base: c.clone() });
    addGhost(group, o);
    if (isFan) fans.push(o);
  }
  gear = buildGear();
  root.add(gear.root);
  gear.materials.forEach((m) => track('train', m));
  const gearMeshes = []; gear.root.traverse((o) => { if (o.isMesh && !o.isInstancedMesh) gearMeshes.push(o); });
  gearMeshes.forEach((o) => addGhost('train', o, 40));
  cabin = buildCabin({ light: coarse || window.innerWidth < 760 });
  root.add(cabin.root);
  cabin.materials.forEach((m) => track('cabine', m));

  // poste de pilotage intérieur, rattaché au nez (suit sa sortie)
  cockpit = buildCockpit(noseGeo);
  const nose = meshes.get('cockpit');
  cockpit.root.position.copy(nose.base).multiplyScalar(-1);
  nose.obj.add(cockpit.root);
  cockpit.mats = cockpit.materials.map((m) => ({ mat: m, opacity: m.opacity, transparent: m.transparent }));

  // moteur écorché : remplace la nacelle droite au chapitre moteurs
  engine = buildTurbofan();
  const nac = meshes.get('nacelle_D');
  engine.root.position.set(7.15 - nac.base.x, -3.25 - nac.base.y, 10.6 - nac.base.z);
  engine.root.scale.setScalar(1.08);
  nac.obj.add(engine.root);
  engine.mats = engine.materials.map((m) => ({ mat: m, opacity: m.opacity ?? 1, transparent: m.transparent }));

  // centres des groupes (position de base), pour la lumière d'accent
  const box = new THREE.Box3();
  for (const g of GROUPS) {
    box.makeEmpty();
    for (const [name, { obj }] of meshes) if (NODE_GROUP[name] === g) box.expandByObject(obj);
    if (g === 'train') box.expandByObject(gear.root);
    if (g === 'cabine') box.expandByObject(cabin.root);
    groupCenter[g] = box.isEmpty() ? new THREE.Vector3() : box.getCenter(new THREE.Vector3());
  }
  buildCallouts();
}

function fade(list, k) {
  for (const it of list) {
    const m = it.mat, op = it.opacity * k;
    const tr = it.transparent || op < 0.995;
    if (m.transparent !== tr) { m.transparent = tr; m.needsUpdate = true; }
    m.opacity = op;
    m.depthWrite = op > 0.5;
  }
}

const tmpV = new THREE.Vector3();
function applyState(t) {
  for (const [name, { obj, base }] of meshes) {
    const e = EXIT[name], k = S.ex[NODE_GROUP[name]];
    obj.position.set(base.x + e[0] * k, base.y + e[1] * k, base.z + e[2] * k);
  }
  if (gear) {
    const g = S.gear, kTr = S.ex.train;
    gear.root.visible = g > 0.01;
    for (const l of gear.legs) {
      const e = EXIT[l.name];
      l.pivot.position.set(l.base.x + e[0] * kTr, l.base.y + e[1] * kTr, l.base.z + e[2] * kTr);
      l.retract(l.leg, 1 - g);
    }
  }
  if (cabin) {
    const e = EXIT.cabine, k = S.ex.cabine;
    cabin.root.position.set(e[0] * k, e[1] * k, e[2] * k);
    cabin.root.visible = S.cabin > 0.01;
  }
  // atténuation façon « fantôme » : les autres pièces deviennent des silhouettes bleutées, sans disparaître
  let focusMode = 0, focus = null, best = 2;
  for (const g of GROUPS) { focusMode = Math.max(focusMode, S.dim[g]); if (g !== 'cabine' && S.dim[g] < best) { best = S.dim[g]; focus = g; } }
  if (S.cabin > 0.5) focus = 'cabine';
  // le fuselage passe en fantôme quand la cabine est soulevée
  const dimOf = (g) => (g === 'fuselage' || g === 'cockpit' ? Math.max(S.dim[g], S.cabin) : g === 'cabine' ? 0 : S.dim[g]);
  for (const g of GROUPS) {
    const d = dimOf(g);
    let solid = 1 - d;
    if (g === 'cockpit') solid *= 1 - 0.96 * S.nose;
    if (g === 'cabine') solid = S.cabin;
    fade(groupMats[g], solid);
    const G = ghost[g]; if (!G) continue;
    const gl = g === 'cockpit' ? Math.max(d, S.nose) : d;
    G.fill.opacity = 0.06 * gl;
    G.line.opacity = 0.3 * gl;
    G.rim.uniforms.uStrength.value = 1.25 * (1 - d) * focusMode * (g === 'cockpit' ? 1 - 0.75 * S.nose : 1);
    G.fill.visible = G.fill.opacity > 0.001; G.line.visible = G.line.opacity > 0.001; G.rim.visible = G.rim.uniforms.uStrength.value > 0.001;
  }
  // moteur écorché : la nacelle droite et sa soufflante laissent la place à la coupe
  if (engine) {
    const cut = S.cut;
    for (const n of ['nacelle_D', 'soufflante_D']) {
      const o = meshes.get(n).obj, gh = o.userData.ghost;
      o.material.opacity *= 1 - cut; if (cut > 0) { o.material.transparent = true; o.material.depthWrite = cut < 0.5; }
      o.material.visible = cut < 0.99;
      gh.fill.visible = gh.fill.visible && cut < 0.5; gh.edges.visible = gh.edges.visible && cut < 0.5; gh.rim.visible = gh.rim.visible && cut < 0.5;
    }
    engine.root.visible = cut > 0.01;
    if (engine.root.visible) fade(engine.mats, cut);
  }
  if (cockpit) {
    cockpit.root.visible = S.nose > 0.02;
    if (cockpit.root.visible) fade(cockpit.mats, Math.min(1, S.nose * 1.4));
  }
  // lumière d'accent au-dessus de la pièce présentée
  if (focus && focusMode > 0.01) {
    const e = groupExit(focus);
    accent.position.copy(groupCenter[focus]).add(e).add(tmpV.set(6, 6, 8));
    if (focus === 'moteurs') accent.position.set(17, -3, 30);
    if (focus === 'cockpit') accent.position.set(34, 3, 2);
    accent.intensity = 60 * focusMode * (focus === 'cockpit' ? 1 - 0.75 * S.nose : 1);
  } else accent.intensity = 0;
  // caméra (recul sur les écrans étroits) et brouillard mis à la même échelle
  const tx = S.tgt.x, ty = S.tgt.y, tz = S.tgt.z;
  const ds = distScale * (1 + (S.lens.mob - 1) * THREE.MathUtils.clamp((distScale - 1) / 0.6, 0, 1));
  camera.position.set(tx + (S.cam.x - tx) * ds, ty + (S.cam.y - ty) * ds, tz + (S.cam.z - tz) * ds);
  camera.lookAt(tx, ty, tz);
  const fov = S.lens.fov + (isMobile ? 12 : 0);
  if (Math.abs(fov - lensFov) > 0.01) { lensFov = fov; camera.fov = fov; camera.updateProjectionMatrix(); }
  scene.fog.near = 90 * distScale; scene.fog.far = 230 * distScale;
  // rotation des soufflantes / attelages et léger flottement (désactivés en mouvement réduit)
  if (!reduced) {
    for (const f of fans) f.rotation.x += 0.06;
    if (engine?.root.visible) { engine.lp.rotation.x += 0.012; engine.hp.rotation.x += 0.03; }
    root.position.y = Math.sin(t * 0.0005) * 0.3;
  } else root.position.y = 0;
}
function groupExit(g) {
  const map = { fuselage: 'fuselage', cockpit: 'cockpit', ailes: 'aile_D', moteurs: 'nacelle_D', empennage: 'derive', train: 'train_avant', cabine: 'cabine' };
  const e = EXIT[map[g]], k = S.ex[g];
  return tmpV.set(g === 'ailes' ? 0 : e[0] * k, e[1] * k, g === 'ailes' || g === 'moteurs' ? 0 : e[2] * k).clone();
}

/* ------------------------------------------------------------------ Étiquettes (callouts) */
const callLayer = document.getElementById('callouts');
const callSvg = callLayer.querySelector('svg');
const CALL_SETS = [];
function buildCallouts() {
  const mk = (owner, list, amt) => {
    const set = { owner, amt, items: [] };
    list.forEach((a, i) => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.innerHTML = `<path fill="none"/><circle class="ring" r="${a.main ? 9 : 7}"/><circle class="dot" r="3"/><text class="code" text-anchor="middle" dy="4">${a.code}</text>`;
      if (a.main) g.classList.add('main');
      callSvg.appendChild(g);
      const el = document.createElement('div');
      el.className = 'cl-label';
      el.innerHTML = `<div class="t">${a.code} · ${a.tag}</div><div class="n">${a.name}</div>`;
      callLayer.appendChild(el);
      set.items.push({ a, g, path: g.querySelector('path'), ring: g.querySelector('.ring'), dot: g.querySelector('.dot'), code: g.querySelector('.code'), el, up: i % 2 === 0, p: new THREE.Vector3(...a.p) });
    });
    CALL_SETS.push(set);
  };
  mk(engine.root, engine.anchors, () => S.cut);
  mk(cockpit.root, cockpit.anchors.map((a) => ({ ...a })), () => S.nose);
}
const proj = new THREE.Vector3();
function updateCallouts() {
  const w = window.innerWidth, h = window.innerHeight;
  const panelRight = w >= 1000 ? Math.min(w * 0.4, 560) : 0;
  for (const set of CALL_SETS) {
    const k = set.amt();
    const show = k > 0.6 && ready;
    const op = THREE.MathUtils.clamp((k - 0.6) / 0.4, 0, 1);
    set.items.forEach((it, i) => {
      it.vis = false;
      if (!show) { it.g.style.display = 'none'; it.el.style.display = 'none'; return; }
      proj.copy(it.p).applyMatrix4(set.owner.matrixWorld).project(camera);
      const ax = (proj.x * 0.5 + 0.5) * w, ay = (-proj.y * 0.5 + 0.5) * h;
      const off = proj.z > 1 || ax < -20 || ax > w + 20 || ay < -20 || ay > h + 20;
      it.g.style.display = off ? 'none' : ''; it.g.style.opacity = op;
      it.ring.setAttribute('cx', ax); it.ring.setAttribute('cy', ay); it.dot.setAttribute('cx', ax); it.dot.setAttribute('cy', ay);
      it.code.setAttribute('x', ax); it.code.setAttribute('y', ay - 14);
      if (w < 1000 || off) { it.el.style.display = 'none'; it.path.setAttribute('d', ''); return; }
      it.code.style.display = 'none';
      it.ax = ax; it.ay = ay; it.vis = true;
    });
    // libellés en deux rangées (au-dessus / au-dessous des ancres), répartis sur la largeur libre
    // dans l'ordre des ancres : segment à 45°, puis verticale et horizontale jusqu'au libellé
    const shown = set.items.filter((it) => it.vis).sort((p1, p2) => p1.ax - p2.ax);
    if (!shown.length) continue;
    const minY = Math.min(...shown.map((it) => it.ay)), maxY = Math.max(...shown.map((it) => it.ay));
    const rows = [shown.filter((_, n) => n % 2 === 0), shown.filter((_, n) => n % 2 === 1)];
    const L = panelRight + 24, R = w - 24;
    rows.forEach((row, r) => {
      const ey = r === 0 ? Math.max(108, minY - 130) : Math.min(h - 120, maxY + 130);
      const slot = (R - L) / Math.max(row.length, 1);
      row.forEach((it, k) => {
        if (!it.lw) { it.el.style.display = ''; it.lw = it.el.offsetWidth || 180; }
        const lx = Math.round(L + k * slot + (slot - it.lw) / 2);
        const sy = Math.sign(ey - it.ay) || -1, d = Math.abs(ey - it.ay);
        let pts;
        if (it.ax >= lx - 6 && it.ax <= lx + it.lw + 6) {
          pts = `M${it.ax},${it.ay} L${it.ax},${ey + (sy < 0 ? 24 : -24)}`;
        } else {
          const side = it.ax < lx ? 1 : -1, tx = side === 1 ? lx - 6 : lx + it.lw + 6;
          const run = Math.min(Math.abs(tx - it.ax), d), exx = it.ax + side * run, exy = it.ay + sy * run;
          pts = `M${it.ax},${it.ay} L${exx},${exy} L${exx},${ey} L${tx},${ey}`;
        }
        it.path.setAttribute('d', pts);
        it.el.style.display = ''; it.el.style.opacity = op;
        it.el.style.transform = `translate(${lx}px, ${ey}px) translateY(-50%)`;
      });
    });
  }
}

function render(t) {
  if (!ready) return;
  applyState(t);
  renderer.render(scene, camera);
  updateCallouts();
  needsRender = false;
}
function loop(t) {
  if (!reduced || needsRender) render(t);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

function resize() {
  if (!renderer) return;
  const w = window.innerWidth, h = window.innerHeight;
  isMobile = w < 760;
  const cap = isMobile || coarse ? 1.5 : 1.75;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, cap));
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  if (w >= 1000) camera.setViewOffset(w, h, -w * 0.16, 0, w, h);
  else if (!isMobile) camera.setViewOffset(w, h, -w * 0.08, h * 0.1, w, h);
  else camera.setViewOffset(w, h, 0, h * (h < 720 ? 0.24 : 0.17), w, h);
  const aspect = w / h;
  distScale = aspect >= 1.25 ? 1 : THREE.MathUtils.clamp(1.25 / aspect * 0.62, 1, 1.9);
  lensFov = -1;
  camera.updateProjectionMatrix();
  needsRender = true;
}
window.addEventListener('resize', resize);

/* ------------------------------------------------------------------ Scroll */
let master;
function jumpTo(i) {
  // mouvement réduit : pas de trajet caméra, simple fondu entre deux plans fixes
  canvas.classList.add('is-fading');
  setTimeout(() => {
    tl.seek(i);
    setProgress(i);
    needsRender = true;
    canvas.classList.remove('is-fading');
  }, 180);
}
function setupScroll() {
  ScrollTrigger.getAll().forEach((s) => s.kill());
  master = null;
  sections.forEach((s, i) => ScrollTrigger.create({
    trigger: s, start: 'top center', end: 'bottom center',
    onToggle: (self) => self.isActive && setActive(i),
  }));
  const story = document.getElementById('story');
  if (reduced) {
    tl.seek(Math.max(0, active));
    setProgress(Math.max(0, active));
    needsRender = true;
    return;
  }
  master = ScrollTrigger.create({
    trigger: story, start: 'top top', end: 'bottom bottom',
    animation: tl, scrub: 1.1,
    onUpdate: (self) => setProgress(self.progress * 9),
    snap: { snapTo: 1 / (sections.length - 1), duration: { min: 0.3, max: 0.9 }, delay: 0.15, ease: 'power1.inOut', inertia: false },
  });
  // apparition discrète des panneaux
  document.querySelectorAll('.panel, .hero').forEach((p) => {
    gsap.fromTo(p, { autoAlpha: 0, y: 18 }, {
      autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out',
      scrollTrigger: { trigger: p, start: 'top 85%', end: 'bottom 15%', toggleActions: 'play reverse play reverse' },
    });
  });
}
setupScroll();
reduceMQ.addEventListener('change', (e) => {
  reduced = e.matches;
  gsap.set('.panel, .hero', { clearProps: 'all' });
  active = -1;
  setupScroll();
  ScrollTrigger.refresh();
});

// liens internes : défilement doux (instantané si mouvement réduit)
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const el = document.querySelector(a.getAttribute('href'));
  if (!el) return;
  e.preventDefault();
  el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  history.replaceState(null, '', a.getAttribute('href'));
  if (el.matches('section')) el.querySelector('h1, h2')?.setAttribute('tabindex', '-1');
});

// API de test pour les captures headless (lecture de l'état, rendu forcé, caméra libre)
window.__demo = { tl, S, sections,
  get ready() { return ready; },
  render: () => { needsRender = true; render(performance.now()); },
  freeCam(pos, tgt, fov) { Object.assign(S.cam, pos); Object.assign(S.tgt, tgt); S.lens.fov = fov; render(performance.now()); },
};
