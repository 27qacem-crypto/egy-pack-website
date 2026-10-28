/* EGY PACK — shared helpers for the Product Studio and Pallet Wrapping scenes.
   (The hero scene keeps its own code in hero3d.js.) */
import * as THREE from 'three';

export const BRAND = {
  navy: 0x0a1a4a,
  navyDeep: 0x030820,
  cyan: 0x00e5ff
};

export const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isSmallScreen = () => window.matchMedia('(max-width: 860px)').matches;

export function createRenderer(canvas, { shadows = false, alpha = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha, powerPreference: 'high-performance' });
  // Device pixel ratio limit: sharp enough on retina, cheap enough on phones
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSmallScreen() ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  if (shadows) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }
  return renderer;
}

/* Deterministic pseudo-random numbers so textures look the same on every load */
export function seededRandom(seed = 7) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

export function canvasTexture(w, h, draw, { srgb = true, repeat = false } = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const tex = new THREE.CanvasTexture(c);
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  if (repeat) tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function cardboardTexture(seed = 11) {
  const rand = seededRandom(seed);
  return canvasTexture(256, 128, (g, w, h) => {
    g.fillStyle = '#9a7246'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 700; i++) {
      g.fillStyle = `rgba(${60 + rand() * 60},${40 + rand() * 40},${20 + rand() * 20},${rand() * 0.25})`;
      g.fillRect(rand() * w, rand() * h, 1 + rand() * 5, 1);
    }
    g.strokeStyle = 'rgba(60,38,18,.55)'; g.lineWidth = 2;
    for (let k = -1; k < 3; k++) { g.beginPath(); g.moveTo(k * w / 2, h); g.lineTo(k * w / 2 + w, 0); g.stroke(); }
  });
}

export function radialGlowTexture(inner = 'rgba(0,229,255,0.5)', mid = 'rgba(0,140,255,0.15)') {
  return canvasTexture(256, 256, (g, w) => {
    const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    gr.addColorStop(0, inner);
    gr.addColorStop(0.45, mid);
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, w);
  });
}

/**
 * Builds a stretch-film roll standing on its axis (Y up), centred on the origin.
 * v: { radius, height, core, tint, opacity }
 * opts.transmission: physically based see-through film (heavier, used in the studio);
 *                    otherwise a cheaper alpha-blended film.
 */
export function buildFilmRoll(v, { transmission = true, segments = 128, seed = 7 } = {}) {
  const rand = seededRandom(seed);
  const R = v.radius, H = v.height, CORE = v.core, CORE_IN = v.core * 0.82, BEVEL = Math.min(0.06, R * 0.06);
  const group = new THREE.Group();

  // Lathe profile: bottom face → bevel → side → bevel → top face
  const pts = [], regions = [];
  const range = (kind, fn, n) => {
    const s = pts.length;
    for (let i = 0; i < n; i++) pts.push(fn(i / (n - 1)));
    regions.push([s, pts.length - 1, kind]);
  };
  range('cap', t => new THREE.Vector2(CORE + t * (R - BEVEL - CORE), -H / 2), 24);
  range('bevel', t => { const a = -Math.PI / 2 + t * Math.PI / 2; return new THREE.Vector2(R - BEVEL + Math.cos(a) * BEVEL, -H / 2 + BEVEL + Math.sin(a) * BEVEL); }, 6);
  range('side', t => new THREE.Vector2(R + Math.sin(t * Math.PI) * R * 0.012, -H / 2 + BEVEL + t * (H - 2 * BEVEL)), 24);
  range('bevel', t => { const a = t * Math.PI / 2; return new THREE.Vector2(R - BEVEL + Math.cos(a) * BEVEL, H / 2 - BEVEL + Math.sin(a) * BEVEL); }, 6);
  range('cap', t => new THREE.Vector2(R - BEVEL - t * (R - BEVEL - CORE), H / 2), 24);

  const N = pts.length - 1;
  const map = canvasTexture(256, 1024, (g, w, h) => {
    g.fillStyle = '#dce8f4'; g.fillRect(0, 0, w, h);
    regions.forEach(([s, e, kind]) => {
      const y0 = (s / N) * h, y1 = (e / N) * h;
      if (kind === 'cap') {
        // concentric wound layers on the roll faces
        for (let y = y0; y < y1; y += 0.8 + rand() * 1.2) {
          const c = 200 + rand() * 50;
          g.fillStyle = `rgba(${c - 40},${c - 10},${c + 5},${0.25 + rand() * 0.45})`;
          g.fillRect(0, y, w, 0.5 + rand());
        }
      } else if (kind === 'side') {
        for (let i = 0; i < 50; i++) {
          const y = y0 + rand() * (y1 - y0);
          g.fillStyle = `rgba(255,255,255,${rand() * 0.25})`; g.fillRect(0, y, w, 1 + rand() * 2);
          g.fillStyle = `rgba(150,190,225,${rand() * 0.18})`; g.fillRect(0, y + 2, w, 1 + rand() * 2);
        }
        for (let i = 0; i < 18; i++) {
          g.fillStyle = `rgba(255,255,255,${0.05 + rand() * 0.12})`;
          g.fillRect(rand() * w, y0, 1 + rand() * 3, y1 - y0);
        }
      }
    });
  });
  map.wrapS = THREE.RepeatWrapping;

  const filmMat = transmission
    ? new THREE.MeshPhysicalMaterial({
        color: v.tint, map, metalness: 0, roughness: 0.08, transmission: v.opacity, thickness: R * 1.3, ior: 1.5,
        attenuationColor: new THREE.Color(0x9fd8ff), attenuationDistance: 2.2,
        clearcoat: 1, clearcoatRoughness: 0.06, iridescence: 0.3, iridescenceIOR: 1.3, envMapIntensity: 1.4
      })
    : new THREE.MeshPhysicalMaterial({
        color: v.tint, map, metalness: 0, roughness: 0.12, transparent: true, opacity: 0.55 + v.opacity * 0.35,
        clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.3
      });
  const film = new THREE.Mesh(new THREE.LatheGeometry(pts, segments), filmMat);
  film.castShadow = true;
  group.add(film);

  // Cardboard core
  const coreTex = cardboardTexture(seed + 3);
  const coreLen = H + 0.12 * (H / 2.4);
  const coreMat = new THREE.MeshStandardMaterial({ map: coreTex, roughness: 0.85, side: THREE.DoubleSide, envMapIntensity: 0.5 });
  const coreOuter = new THREE.Mesh(new THREE.CylinderGeometry(CORE, CORE, coreLen, 48, 1, true), coreMat);
  coreOuter.castShadow = true;
  const coreInner = new THREE.Mesh(new THREE.CylinderGeometry(CORE_IN, CORE_IN, coreLen, 48, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x4a3420, roughness: 0.95, side: THREE.BackSide }));
  group.add(coreOuter, coreInner);
  const lipGeo = new THREE.RingGeometry(CORE_IN, CORE, 48);
  const lipMat = new THREE.MeshStandardMaterial({ color: 0xb08656, roughness: 0.8, side: THREE.DoubleSide });
  [-1, 1].forEach(s => {
    const lip = new THREE.Mesh(lipGeo, lipMat);
    lip.rotation.x = -Math.PI / 2 * s;
    lip.position.y = (coreLen / 2) * s;
    group.add(lip);
  });

  return { group, dispose: () => disposeObject(group), height: coreLen, radius: R };
}

/* Frees every geometry, material and texture under an object */
export function disposeObject(root) {
  const seen = new Set();
  root.traverse(o => {
    if (o.geometry && !seen.has(o.geometry)) { seen.add(o.geometry); o.geometry.dispose(); }
    const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
    mats.forEach(m => {
      if (seen.has(m)) return;
      seen.add(m);
      Object.values(m).forEach(val => { if (val && val.isTexture && !seen.has(val)) { seen.add(val); val.dispose(); } });
      m.dispose();
    });
  });
}

export const clamp01 = x => Math.min(1, Math.max(0, x));
export const smooth = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
export const easeOutCubic = x => 1 - Math.pow(1 - clamp01(x), 3);
export const lerp = (a, b, t) => a + (b - a) * t;
