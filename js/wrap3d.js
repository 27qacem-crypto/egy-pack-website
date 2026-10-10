/* EGY PACK — "Experience the Protection" pallet-wrapping scene.
   A rotary-arm wrapper winds a film band around a stacked pallet. The wound film
   is real geometry (a helical ribbon around the load) revealed with a draw range,
   so it is exact, smooth and fully reversible with scroll. */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  BRAND, createRenderer, canvasTexture, radialGlowTexture, buildFilmRoll, disposeObject,
  seededRandom, reduceMotion, isSmallScreen, clamp01, smooth, lerp
} from './three-utils.js';

/* ---------- Load geometry (metres) ---------- */
const PALLET = { L: 1.2, W: 0.8, H: 0.144 };
const BOX = { x: 0.6, y: 0.38, z: 0.4 };
const LAYERS = 3;
const LOAD_TOP = PALLET.H + LAYERS * BOX.y;

/* ---------- Wrap plan ---------- */
const BAND = 0.42;                  // film band height on the load
const REVS = 9;                     // total revolutions
const Y_BASE = 0.03 + BAND / 2;     // first wraps also catch the pallet deck
const Y_TOP = LOAD_TOP + 0.02 - BAND / 2;
const ARM_R = 1.0;                  // rotary arm radius (roll orbit)
const ARM_Y = 2.05;                 // overhead arm height
const ROLL = { radius: 0.11, height: 0.5, core: 0.04, tint: 0xc4d9ee, opacity: 0.8 };
const LEAD = 0.42;                  // roll runs ahead of the contact point (radians)

/* ---------- Timeline (t = 0…1) ---------- */
export const STAGES = [0, 0.12, 0.25, 0.40, 0.72, 0.88]; // start of stages 1…6
const T_WRAP0 = 0.25, T_BASE = 0.40, T_RISE = 0.72, T_TOP = 0.82, T_DONE = 0.88;

function revsAt(t) {
  if (t <= T_WRAP0) return 0;
  if (t <= T_BASE) return lerp(0, 2, (t - T_WRAP0) / (T_BASE - T_WRAP0));
  if (t <= T_RISE) return lerp(2, 7, (t - T_BASE) / (T_RISE - T_BASE));
  if (t <= T_TOP) return lerp(7, REVS, (t - T_RISE) / (T_TOP - T_RISE));
  return REVS;
}
function bandY(u) {
  if (u <= 2) return Y_BASE;
  if (u >= 7) return Y_TOP;
  return lerp(Y_BASE, Y_TOP, (u - 2) / 5);
}
export function stageAt(t) {
  let s = 0;
  for (let i = 0; i < STAGES.length; i++) if (t >= STAGES[i] - 1e-6) s = i;
  return s; // 0-based
}

/* Rounded-rectangle perimeter around the load (x/z plane) */
function makePerimeter(hx, hz, r) {
  const Lx = 2 * (hx - r), Lz = 2 * (hz - r), A = Math.PI * r / 2;
  const total = 2 * Lx + 2 * Lz + 4 * A;
  const segs = [
    { len: Lz, f: s => [hx, -(hz - r) + s, 1, 0] },
    { len: A, f: s => { const a = s / r; return [hx - r + r * Math.cos(a), hz - r + r * Math.sin(a), Math.cos(a), Math.sin(a)]; } },
    { len: Lx, f: s => [(hx - r) - s, hz, 0, 1] },
    { len: A, f: s => { const a = Math.PI / 2 + s / r; return [-(hx - r) + r * Math.cos(a), hz - r + r * Math.sin(a), Math.cos(a), Math.sin(a)]; } },
    { len: Lz, f: s => [-hx, (hz - r) - s, -1, 0] },
    { len: A, f: s => { const a = Math.PI + s / r; return [-(hx - r) + r * Math.cos(a), -(hz - r) + r * Math.sin(a), Math.cos(a), Math.sin(a)]; } },
    { len: Lx, f: s => [-(hx - r) + s, -hz, 0, -1] },
    { len: A, f: s => { const a = 1.5 * Math.PI + s / r; return [hx - r + r * Math.cos(a), -(hz - r) + r * Math.sin(a), Math.cos(a), Math.sin(a)]; } }
  ];
  return {
    total,
    // fraction 0…1 → [x, z, nx, nz]
    at(frac) {
      let s = (((frac % 1) + 1) % 1) * total;
      for (const g of segs) { if (s <= g.len) return g.f(s); s -= g.len; }
      return segs[0].f(0);
    }
  };
}

export function initWrap({ canvas, stage, onUpdate }) {
  const small = isSmallScreen();
  const renderer = createRenderer(canvas, { shadows: true });
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BRAND.navyDeep);
  scene.fog = new THREE.Fog(BRAND.navyDeep, 7, 16);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(new RoomEnvironment(renderer), 0.04);
  scene.environment = envRT.texture;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 40);

  /* ---------- Lights ---------- */
  scene.add(new THREE.HemisphereLight(0x8fb4ff, 0x020515, 0.3));
  const key = new THREE.SpotLight(0xffffff, 60, 18, Math.PI / 6, 0.55, 1.4);
  key.position.set(-2.6, 5.5, 3.2);
  key.target.position.set(0, 0.6, 0);
  key.castShadow = true;
  key.shadow.mapSize.set(small ? 512 : 1024, small ? 512 : 1024);
  key.shadow.camera.near = 1; key.shadow.camera.far = 14;
  key.shadow.radius = 5;
  key.shadow.bias = -0.0004;
  scene.add(key, key.target);
  const rim = new THREE.SpotLight(BRAND.cyan, 38, 16, Math.PI / 5, 0.7, 1.5);
  rim.position.set(2.2, 3.2, -4.2);
  rim.target.position.set(0, 0.7, 0);
  scene.add(rim, rim.target);
  const fill = new THREE.DirectionalLight(0x8fb0ff, 0.35);
  fill.position.set(4, 1.5, 2);
  scene.add(fill);

  /* ---------- Industrial floor ---------- */
  const floorTex = canvasTexture(256, 256, (g, w) => {
    g.fillStyle = '#070f30'; g.fillRect(0, 0, w, w);
    g.strokeStyle = 'rgba(0,229,255,0.10)'; g.lineWidth = 2;
    g.strokeRect(0, 0, w, w);
  }, { repeat: true });
  floorTex.repeat.set(16, 16);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(24, 24),
    new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.82, metalness: 0.2, envMapIntensity: 0.4 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  const pool = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    new THREE.MeshBasicMaterial({ map: radialGlowTexture('rgba(0,229,255,0.28)', 'rgba(0,110,255,0.08)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })
  );
  pool.rotation.x = -Math.PI / 2;
  pool.position.y = 0.002;
  scene.add(pool);

  // Everything that turns when the visitor drags at the end
  const rig = new THREE.Group();
  scene.add(rig);

  /* ---------- Wooden pallet ---------- */
  const rand = seededRandom(21);
  const woodTex = canvasTexture(256, 64, (g, w, h) => {
    g.fillStyle = '#b48a58'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) {
      g.strokeStyle = `rgba(${90 + rand() * 40},${60 + rand() * 30},${30 + rand() * 20},${0.25 + rand() * 0.3})`;
      g.lineWidth = 0.5 + rand() * 1.5;
      g.beginPath();
      const y = rand() * h;
      g.moveTo(0, y);
      g.bezierCurveTo(w * 0.3, y + (rand() - 0.5) * 8, w * 0.7, y + (rand() - 0.5) * 8, w, y + (rand() - 0.5) * 4);
      g.stroke();
    }
  });
  const woodMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.78, envMapIntensity: 0.5 });
  const blockMat = new THREE.MeshStandardMaterial({ map: woodTex, color: 0xd9c2a0, roughness: 0.85, envMapIntensity: 0.5 });
  const pallet = new THREE.Group();
  const addBoard = (geo, mat, x, y, z) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = true; m.receiveShadow = true;
    pallet.add(m);
  };
  const bottomGeo = new THREE.BoxGeometry(PALLET.L, 0.022, 0.1);
  const blockGeo = new THREE.BoxGeometry(0.145, 0.078, 0.1);
  const stringerGeo = new THREE.BoxGeometry(0.145, 0.022, PALLET.W);
  const topGeo = new THREE.BoxGeometry(PALLET.L, 0.022, 0.12);
  const xs = [-0.5275, 0, 0.5275], zs = [-0.35, 0, 0.35];
  zs.forEach(z => addBoard(bottomGeo, woodMat, 0, 0.011, z));
  xs.forEach(x => zs.forEach(z => addBoard(blockGeo, blockMat, x, 0.061, z)));
  xs.forEach(x => addBoard(stringerGeo, woodMat, x, 0.111, 0));
  [-0.34, -0.17, 0, 0.17, 0.34].forEach(z => addBoard(topGeo, woodMat, 0, 0.133, z));
  rig.add(pallet);

  /* ---------- Stacked cartons ---------- */
  const boxTex = canvasTexture(256, 256, (g, w, h) => {
    g.fillStyle = '#b07f4c'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 500; i++) {
      g.fillStyle = `rgba(${70 + rand() * 50},${45 + rand() * 30},${20 + rand() * 15},${rand() * 0.18})`;
      g.fillRect(rand() * w, rand() * h, 1 + rand() * 4, 1);
    }
    g.fillStyle = 'rgba(215,190,150,0.55)';           // packing tape
    g.fillRect(w * 0.44, 0, w * 0.12, h);
    g.strokeStyle = 'rgba(60,35,15,0.45)'; g.lineWidth = 4; // carton edges
    g.strokeRect(2, 2, w - 4, h - 4);
  });
  const boxMat = new THREE.MeshStandardMaterial({ map: boxTex, roughness: 0.88, envMapIntensity: 0.45 });
  const boxes = new THREE.InstancedMesh(new THREE.BoxGeometry(BOX.x - 0.006, BOX.y - 0.004, BOX.z - 0.006), boxMat, LAYERS * 4);
  boxes.castShadow = true; boxes.receiveShadow = true;
  const m4 = new THREE.Matrix4(), col = new THREE.Color();
  let bi = 0;
  for (let l = 0; l < LAYERS; l++) {
    for (let ix = 0; ix < 2; ix++) for (let iz = 0; iz < 2; iz++) {
      m4.makeTranslation((ix - 0.5) * BOX.x, PALLET.H + BOX.y * (l + 0.5), (iz - 0.5) * BOX.z);
      boxes.setMatrixAt(bi, m4);
      boxes.setColorAt(bi, col.setHSL(0.08, 0.25, 0.78 + rand() * 0.18));
      bi++;
    }
  }
  rig.add(boxes);

  /* ---------- Wound film: helical ribbon around the load ---------- */
  const perim = makePerimeter(PALLET.L / 2 + 0.008, PALLET.W / 2 + 0.008, 0.035);
  const M = small ? 96 : 140;                  // samples per revolution
  const K = REVS * M + 1;                      // total samples
  const pos = new Float32Array(K * 2 * 3);
  const uv = new Float32Array(K * 2 * 2);
  const idx = new Uint32Array((K - 1) * 6);
  const sample = (u, out, o) => {
    const [x, z, nx, nz] = perim.at(u);
    const off = 0.004 + 0.0024 * u;            // each new layer sits just outside the last
    const yc = bandY(u);
    out[o] = x + nx * off; out[o + 1] = yc - BAND / 2; out[o + 2] = z + nz * off;
    out[o + 3] = x + nx * off; out[o + 4] = yc + BAND / 2; out[o + 5] = z + nz * off;
  };
  for (let k = 0; k < K; k++) {
    const u = k / M;
    sample(u, pos, k * 6);
    const along = u * perim.total / BAND;
    uv.set([along, 0, along, 1], k * 4);
    if (k < K - 1) {
      const a = k * 2, b = a + 1, c = a + 2, d = a + 3;
      idx.set([a, c, b, b, c, d], k * 6);
    }
  }
  const ribbonGeo = new THREE.BufferGeometry();
  ribbonGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  ribbonGeo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  ribbonGeo.setIndex(new THREE.BufferAttribute(idx, 1));
  ribbonGeo.computeVertexNormals();
  ribbonGeo.setDrawRange(0, 0);
  const basePos = pos.slice();

  // Film alpha: faint stretch striations, slightly roped (denser) edges
  const filmAlpha = canvasTexture(64, 128, (g, w, h) => {
    g.fillStyle = 'rgb(56,56,56)'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) {
      const c = 48 + rand() * 45;
      g.fillStyle = `rgb(${c},${c},${c})`;
      g.fillRect(0, rand() * h, w, 1 + rand() * 2);
    }
    const edge = g.createLinearGradient(0, 0, 0, h);
    edge.addColorStop(0, 'rgba(200,200,200,1)'); edge.addColorStop(0.05, 'rgba(110,110,110,0)');
    edge.addColorStop(0.95, 'rgba(110,110,110,0)'); edge.addColorStop(1, 'rgba(200,200,200,1)');
    g.fillStyle = edge; g.fillRect(0, 0, w, h);
  }, { srgb: false, repeat: true });
  const filmMat = new THREE.MeshPhysicalMaterial({
    color: 0xdff1ff, alphaMap: filmAlpha, transparent: true, opacity: 1,
    roughness: 0.14, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.1,
    envMapIntensity: 1.5, side: THREE.DoubleSide, depthWrite: false
  });
  const ribbon = new THREE.Mesh(ribbonGeo, filmMat);
  ribbon.renderOrder = 2;
  ribbon.frustumCulled = false;
  rig.add(ribbon);

  /* ---------- Free film between the load and the roll ---------- */
  const FS = 10;
  const freeGeo = new THREE.BufferGeometry();
  const freePos = new Float32Array((FS + 1) * 2 * 3);
  const freeUv = new Float32Array((FS + 1) * 2 * 2);
  const freeIdx = [];
  for (let j = 0; j <= FS; j++) {
    freeUv.set([j / FS, 0, j / FS, 1], j * 4);
    if (j < FS) { const a = j * 2; freeIdx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  }
  freeGeo.setAttribute('position', new THREE.BufferAttribute(freePos, 3));
  freeGeo.setAttribute('uv', new THREE.BufferAttribute(freeUv, 2));
  freeGeo.setIndex(freeIdx);
  const freeMat = filmMat.clone();
  freeMat.alphaMap = filmAlpha;
  const freeFilm = new THREE.Mesh(freeGeo, freeMat);
  freeFilm.renderOrder = 3;
  freeFilm.frustumCulled = false;
  rig.add(freeFilm);

  /* ---------- Roll on a rotary arm ---------- */
  const roll = buildFilmRoll(ROLL, { transmission: false, segments: 48, seed: 5 });
  const metal = new THREE.MeshStandardMaterial({ color: 0x4a5875, metalness: 0.85, roughness: 0.35, envMapIntensity: 0.9 });
  const unitRod = new THREE.CylinderGeometry(1, 1, 1, 16);
  const mast = new THREE.Mesh(unitRod, metal);           // vertical rod holding the roll
  const arm = new THREE.Mesh(unitRod, metal);            // overhead arm to the pivot
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.12, 24), metal);
  hub.position.set(0, ARM_Y, 0);
  const accent = new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.006, 8, 48), new THREE.MeshBasicMaterial({ color: BRAND.cyan }));
  accent.rotation.x = Math.PI / 2;
  accent.position.set(0, ARM_Y - 0.06, 0);
  const machine = new THREE.Group();
  machine.add(roll.group, mast, arm, hub, accent);
  [mast, arm, hub].forEach(m => { m.castShadow = true; });
  rig.add(machine);

  const vA = new THREE.Vector3(), vB = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  function placeRod(mesh, a, b, radius) {
    const len = vB.copy(b).sub(a).length();
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.scale.set(radius, Math.max(len, 0.001), radius);
    mesh.quaternion.setFromUnitVectors(up, vB.normalize());
  }

  /* ---------- Apply timeline ---------- */
  let patched = -1; // vertex pair index temporarily moved to the exact contact point
  const contact = new Float32Array(6);
  function applyTimeline(t) {
    const u = revsAt(t);

    // Wound ribbon: reveal whole segments, then stretch the last vertex pair to the exact contact point
    const kFloat = u * M;
    const k = Math.min(K - 2, Math.floor(kFloat));
    if (patched >= 0) { pos.set(basePos.subarray(patched * 6, patched * 6 + 6), patched * 6); patched = -1; }
    if (u > 0) {
      sample(u, contact, 0);
      const next = Math.min(K - 1, k + 1);
      pos.set(contact, next * 6);
      patched = next;
      ribbonGeo.setDrawRange(0, (k + 1) * 6);
    } else {
      ribbonGeo.setDrawRange(0, 0);
    }
    ribbonGeo.attributes.position.needsUpdate = true;

    // Roll / arm position
    const [cx, cz] = perim.at(u);
    const theta0 = Math.atan2(cz, cx) + LEAD;
    let rr = ARM_R, ry = bandY(u), th = theta0;
    if (t < T_WRAP0) {                         // stage 1–2: arm swings in from its parked spot
      const k2 = smooth((t - STAGES[1]) / (T_WRAP0 - STAGES[1]));
      rr = lerp(2.7, ARM_R, k2); ry = lerp(1.65, Y_BASE, k2); th = theta0 - (1 - k2) * 0.9;
    } else if (t > T_TOP) {                    // stage 5–6: arm retracts after the cut
      const k5 = smooth((t - T_TOP) / (T_DONE - T_TOP));
      rr = lerp(ARM_R, 2.9, k5); ry = lerp(Y_TOP, 1.75, k5); th = theta0 + k5 * 0.7;
    }
    const rx = Math.cos(th) * rr, rz = Math.sin(th) * rr;
    roll.group.position.set(rx, ry, rz);
    roll.group.rotation.y = -u * perim.total / ROLL.radius * 0.15;
    placeRod(mast, vA.set(rx, ry - ROLL.height / 2 - 0.06, rz), new THREE.Vector3(rx, ARM_Y, rz), 0.014);
    placeRod(arm, vA.set(rx, ARM_Y, rz), new THREE.Vector3(0, ARM_Y, 0), 0.018);
    machine.visible = t > 0.06;
    // fade the machine in/out by scale so it never pops
    const showK = smooth((t - 0.06) / 0.06) * (1 - smooth((t - 0.93) / 0.05));
    machine.scale.setScalar(Math.max(0.001, showK));

    // Free film from the last contact point to the roll
    let span = 0;
    if (t >= T_WRAP0 - 0.004 && t <= T_DONE) span = t > T_TOP ? 1 - smooth((t - T_TOP) / (T_DONE - T_TOP - 0.02)) : 1;
    freeFilm.visible = span > 0.01;
    if (freeFilm.visible) {
      const sx = contact[0], sz = contact[2];
      const yc = u > 0 ? bandY(u) : Y_BASE;
      // point on the roll surface facing the load
      const dx = sx - rx, dz = sz - rz, dl = Math.hypot(dx, dz) || 1;
      const ex = rx + (dx / dl) * ROLL.radius, ez = rz + (dz / dl) * ROLL.radius, ey = ry;
      const tx = u > 0 ? sx : perim.at(0)[0] * 1.01, tz = u > 0 ? sz : perim.at(0)[1] * 1.01;
      for (let j = 0; j <= FS; j++) {
        const s = (j / FS) * span;
        const neck = 1 - 0.16 * Math.sin(Math.PI * (j / FS)) * span;  // film necks in while stretched
        const h = BAND * neck / 2;
        const px = lerp(tx, ex, s), pz = lerp(tz, ez, s), py = lerp(yc, ey, s);
        freePos.set([px, py - h, pz, px, py + h, pz], j * 6);
      }
      freeGeo.attributes.position.needsUpdate = true;
      freeGeo.computeVertexNormals();
    }
  }

  /* ---------- Camera path (spherical keyframes around the load) ---------- */
  const KEYS = [
    { t: 0.00, r: 4.7, az: 0.78, el: 0.42, ty: 0.62 },
    { t: 0.12, r: 4.2, az: 0.62, el: 0.36, ty: 0.68 },
    { t: 0.25, r: 3.8, az: 0.36, el: 0.30, ty: 0.62 },
    { t: 0.56, r: 3.7, az: -0.12, el: 0.36, ty: 0.78 },
    { t: 0.82, r: 4.0, az: -0.42, el: 0.46, ty: 0.82 },
    { t: 1.00, r: 3.6, az: 0.58, el: 0.22, ty: 0.66 }
  ];
  let fit = 1;
  const camState = { r: 0, az: 0, el: 0, ty: 0 };
  function cameraAt(t) {
    let a = KEYS[0], b = KEYS[KEYS.length - 1];
    for (let i = 0; i < KEYS.length - 1; i++) if (t >= KEYS[i].t && t <= KEYS[i + 1].t) { a = KEYS[i]; b = KEYS[i + 1]; break; }
    const k = smooth((t - a.t) / ((b.t - a.t) || 1));
    camState.r = lerp(a.r, b.r, k) * fit;
    camState.az = lerp(a.az, b.az, k);
    camState.el = lerp(a.el, b.el, k);
    camState.ty = lerp(a.ty, b.ty, k);
    return camState;
  }
  function placeCamera(t) {
    const c = cameraAt(t);
    camera.position.set(
      Math.sin(c.az) * Math.cos(c.el) * c.r,
      c.ty + Math.sin(c.el) * c.r,
      Math.cos(c.az) * Math.cos(c.el) * c.r
    );
    camera.lookAt(0, c.ty, 0);
  }

  /* ---------- Drag to rotate (only once the load is wrapped) ---------- */
  let yaw = 0, yawVel = 0, dragging = false, lastX = 0, dragEnabled = false;
  canvas.addEventListener('pointerdown', e => {
    if (!dragEnabled) return;
    dragging = true; lastX = e.clientX; yawVel = 0;
    canvas.setPointerCapture(e.pointerId);
    stage.classList.add('is-dragging');
    wake();
  });
  canvas.addEventListener('pointermove', e => {
    if (!dragging) return;
    const dx = e.clientX - lastX; lastX = e.clientX;
    const d = dx / Math.max(1, canvas.clientWidth) * Math.PI * 1.6;
    yaw += d; yawVel = d;
    wake();
  });
  const endDrag = () => { dragging = false; stage.classList.remove('is-dragging'); };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);

  /* ---------- Timeline driver: scroll or autoplay ---------- */
  let target = 0, shown = -1, mode = 'scroll', playing = false, autoT = 0;
  const AUTO_SECONDS = 12;
  function setScrollProgress(p) {
    target = clamp01(p);
    if (mode === 'auto') return;
    wake();
  }
  function replay() { mode = 'auto'; autoT = 0; playing = true; shown = 0; wake(); notify(); }
  function togglePlay() {
    if (mode !== 'auto') return;
    if (autoT >= 1) { autoT = 0; }
    playing = !playing; wake(); notify();
  }
  function useScroll() { if (mode === 'auto') { mode = 'scroll'; playing = false; wake(); notify(); } }

  function notify() {
    if (onUpdate) onUpdate({ t: Math.max(0, shown), stage: stageAt(Math.max(0, shown)), mode, playing, dragEnabled });
  }

  /* ---------- Size ---------- */
  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Keep the load clear of the text: shift the view away from the heading side
    // (heading is on the right in Arabic, on the left in English; on phones it sits on top)
    const portrait = camera.aspect < 1;
    const side = document.documentElement.dir === 'rtl' ? 1 : -1;
    camera.setViewOffset(w, h, portrait ? 0 : side * w * 0.14, portrait ? -h * 0.02 : 0, w, h);
    camera.updateProjectionMatrix();
    fit = portrait ? Math.min(1.9, 1 / Math.pow(camera.aspect, 0.75)) : 1;
    shown = -1; // force a redraw
    wake();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(stage);
  document.addEventListener('egypack:langchange', resize);

  /* ---------- Loop ---------- */
  let visible = false, running = false, rafId = 0, last = 0, disposed = false;
  function wake() { if (visible && !running && !disposed) { running = true; last = performance.now(); rafId = requestAnimationFrame(frame); } }
  function frame(now) {
    const dt = Math.min(0.25, (now - last) / 1000); last = now;  // real time, so slow devices still keep up
    let goal = target;
    if (mode === 'auto') {
      if (playing) { autoT = Math.min(1, autoT + dt / AUTO_SECONDS); if (autoT >= 1) playing = false; }
      goal = autoT;
    }
    const prev = shown;
    // smooth follow; snaps when close so it settles exactly
    let next = shown < 0 ? goal : shown + (goal - shown) * (1 - Math.exp(-dt * (mode === 'auto' ? 30 : 9)));
    if (Math.abs(goal - next) < 0.0004) next = goal;
    shown = next;

    const wasEnabled = dragEnabled;
    dragEnabled = shown >= 0.97;
    if (!dragEnabled && !dragging) yaw *= Math.pow(0.0015, dt);     // ease back to the default view
    else if (!dragging) { yaw += yawVel; yawVel *= Math.pow(0.02, dt); if (Math.abs(yawVel) < 1e-5) yawVel = 0; }
    rig.rotation.y = yaw;

    applyTimeline(shown);
    placeCamera(shown);
    renderer.render(scene, camera);
    if (shown !== prev || wasEnabled !== dragEnabled) notify();

    const busy = shown !== goal || playing || dragging || yawVel !== 0 || (!dragEnabled && Math.abs(yaw) > 1e-4);
    if (visible && busy) rafId = requestAnimationFrame(frame);
    else running = false;
  }
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) wake(); }, { threshold: 0 });
  io.observe(stage);

  resize();
  applyTimeline(0); placeCamera(0);
  renderer.compile(scene, camera);
  renderer.render(scene, camera);

  function dispose() {
    disposed = true;
    cancelAnimationFrame(rafId);
    io.disconnect(); ro.disconnect();
    document.removeEventListener('egypack:langchange', resize);
    disposeObject(scene);
    envRT.dispose();
    renderer.dispose();
  }

  return { setScrollProgress, replay, togglePlay, useScroll, dispose, get mode() { return mode; } };
}
