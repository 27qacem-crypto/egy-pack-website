/* EGY PACK — Hero 3D scene: rotating industrial stretch-film roll
   with cinematic lighting (Three.js). */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const canvas = document.getElementById('hero3d');
const hero = canvas.closest('.hero');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const sceneReady = () => document.dispatchEvent(new CustomEvent('egypack:scene-ready'));

/* Brand palette */
const NAVY = 0x0a1a4a;
const CYAN = 0x00e5ff;

function makeCanvas(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/* Deterministic pseudo-random so the film looks the same on every load */
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

try {
  init();
} catch (err) {
  console.warn('EGY PACK 3D scene unavailable:', err);
  hero.classList.add('no-webgl');
  sceneReady();
}

function init() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = makeCanvas(1024, 1024, (g, w, h) => {
    const grad = g.createRadialGradient(w * 0.62, h * 0.45, 20, w * 0.55, h * 0.5, w * 0.75);
    grad.addColorStop(0, '#163694');
    grad.addColorStop(0.35, '#0a1a4a');
    grad.addColorStop(1, '#030820');
    g.fillStyle = grad; g.fillRect(0, 0, w, h);
  });
  scene.fog = new THREE.Fog(NAVY, 9, 22);

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0.4, 8);

  /* Studio reflections */
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

  /* ---------------- Cinematic lighting ---------------- */
  scene.add(new THREE.AmbientLight(0x1b3a8f, 0.35));

  const key = new THREE.SpotLight(0xffffff, 140, 30, Math.PI / 6, 0.6, 1.6);
  key.position.set(-5, 6, 6);
  scene.add(key, key.target);

  const rim = new THREE.SpotLight(CYAN, 220, 30, Math.PI / 5, 0.7, 1.4);
  rim.position.set(5, 2, -5);
  scene.add(rim, rim.target);

  const fill = new THREE.DirectionalLight(0x3a6bff, 0.9);
  fill.position.set(-4, -3, 2);
  scene.add(fill);

  const sweep = new THREE.PointLight(0xbff6ff, 18, 8, 1.5); // travelling highlight
  scene.add(sweep);

  /* ---------------- The roll ---------------- */
  const R = 1.0;          // outer film radius
  const H = 2.5;          // roll width (height)
  const CORE_R = 0.34;    // cardboard core outer radius
  const CORE_IN = 0.28;   // cardboard core inner radius
  const BEVEL = 0.06;

  const stage = new THREE.Group();   // positions + turntable
  const tilt = new THREE.Group();    // hero angle of the roll
  const spinner = new THREE.Group(); // spins around the roll axis
  stage.add(tilt); tilt.add(spinner);
  scene.add(stage);
  tilt.rotation.set(0.32, 0, -0.42);

  // Lathe profile: bottom face (inside → out), bevel, side, bevel, top face (out → inside)
  const pts = [];
  const regions = []; // [startIndex, endIndex, kind]
  const pushRange = (kind, fn, n) => {
    const s = pts.length;
    for (let i = 0; i < n; i++) pts.push(fn(i / (n - 1)));
    regions.push([s, pts.length - 1, kind]);
  };
  pushRange('cap', t => new THREE.Vector2(CORE_R + t * (R - BEVEL - CORE_R), -H / 2), 40);
  pushRange('bevel', t => {
    const a = -Math.PI / 2 + t * Math.PI / 2;
    return new THREE.Vector2(R - BEVEL + Math.cos(a) * BEVEL, -H / 2 + BEVEL + Math.sin(a) * BEVEL);
  }, 8);
  pushRange('side', t => new THREE.Vector2(R + Math.sin(t * Math.PI) * 0.012, -H / 2 + BEVEL + t * (H - 2 * BEVEL)), 40);
  pushRange('bevel', t => {
    const a = t * Math.PI / 2;
    return new THREE.Vector2(R - BEVEL + Math.cos(a) * BEVEL, H / 2 - BEVEL + Math.sin(a) * BEVEL);
  }, 8);
  pushRange('cap', t => new THREE.Vector2(R - BEVEL - t * (R - BEVEL - CORE_R), H / 2), 40);

  // Texture mapped along the profile: concentric wound layers on the faces,
  // soft circumferential sheen bands on the side.
  const N = pts.length - 1;
  const filmTex = makeCanvas(512, 2048, (g, w, h) => {
    g.fillStyle = '#dce8f4'; g.fillRect(0, 0, w, h);
    regions.forEach(([s, e, kind]) => {
      const y0 = (s / N) * h, y1 = (e / N) * h;
      if (kind === 'cap') {
        for (let y = y0; y < y1; y += 1 + rand() * 1.4) {
          const v = 200 + rand() * 50;
          g.fillStyle = `rgba(${v - 40},${v - 10},${v + 5},${0.25 + rand() * 0.45})`;
          g.fillRect(0, y, w, 0.6 + rand());
        }
      } else if (kind === 'side') {
        for (let i = 0; i < 70; i++) {
          const y = y0 + rand() * (y1 - y0);
          g.fillStyle = `rgba(255,255,255,${rand() * 0.25})`;
          g.fillRect(0, y, w, 1 + rand() * 3);
          g.fillStyle = `rgba(150,190,225,${rand() * 0.18})`;
          g.fillRect(0, y + 3, w, 1 + rand() * 2);
        }
        // subtle wrinkles that make the rotation readable
        for (let i = 0; i < 26; i++) {
          const x = rand() * w;
          g.fillStyle = `rgba(255,255,255,${0.05 + rand() * 0.12})`;
          g.fillRect(x, y0, 1 + rand() * 4, y1 - y0);
        }
      }
    });
  });
  filmTex.wrapS = THREE.RepeatWrapping;

  const filmMat = new THREE.MeshPhysicalMaterial({
    color: 0xc4d9ee,
    map: filmTex,
    metalness: 0.0,
    roughness: 0.08,
    transmission: 0.8,
    thickness: 1.4,
    ior: 1.5,
    attenuationColor: new THREE.Color(0x9fd8ff),
    attenuationDistance: 2.2,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    iridescence: 0.35,
    iridescenceIOR: 1.3,
    specularIntensity: 1,
    envMapIntensity: 1.4,
  });
  const film = new THREE.Mesh(new THREE.LatheGeometry(pts, 160), filmMat);
  spinner.add(film);

  // Cardboard core
  const cardboardTex = makeCanvas(512, 256, (g, w, h) => {
    g.fillStyle = '#9a7246'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 1400; i++) {
      g.fillStyle = `rgba(${60 + rand() * 60},${40 + rand() * 40},${20 + rand() * 20},${rand() * 0.25})`;
      g.fillRect(rand() * w, rand() * h, 1 + rand() * 6, 1);
    }
    g.strokeStyle = 'rgba(60,38,18,.55)'; g.lineWidth = 3;
    for (let k = -1; k < 3; k++) { g.beginPath(); g.moveTo(k * w / 2, h); g.lineTo(k * w / 2 + w, 0); g.stroke(); } // spiral seam
  });
  const coreMat = new THREE.MeshStandardMaterial({ map: cardboardTex, roughness: 0.85, metalness: 0, side: THREE.DoubleSide, envMapIntensity: 0.5 });
  const coreLen = H + 0.14;
  const coreOuter = new THREE.Mesh(new THREE.CylinderGeometry(CORE_R, CORE_R, coreLen, 64, 1, true), coreMat);
  const coreInner = new THREE.Mesh(
    new THREE.CylinderGeometry(CORE_IN, CORE_IN, coreLen, 64, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x4a3420, roughness: 0.95, side: THREE.BackSide })
  );
  spinner.add(coreOuter, coreInner);
  const lipGeo = new THREE.RingGeometry(CORE_IN, CORE_R, 64);
  [-1, 1].forEach(s => {
    const lip = new THREE.Mesh(lipGeo, new THREE.MeshStandardMaterial({ color: 0xb08656, roughness: 0.8, side: THREE.DoubleSide }));
    lip.rotation.x = -Math.PI / 2 * s;
    lip.position.y = (coreLen / 2) * s;
    spinner.add(lip);
  });

  /* ---------------- Unwinding film tail ---------------- */
  const TAIL_L = 2.1, SEG_X = 64, SEG_Y = 16;
  const tailGeo = new THREE.PlaneGeometry(1, 1, SEG_X, SEG_Y);
  const tailBase = tailGeo.attributes.position.array.slice(); // x,y in [-0.5, 0.5]
  const tailMat = new THREE.MeshPhysicalMaterial({
    color: 0xe6f4ff,
    metalness: 0,
    roughness: 0.12,
    transmission: 0.92,
    thickness: 0.04,
    ior: 1.45,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
    iridescence: 0.8,
    iridescenceIOR: 1.35,
    iridescenceThicknessRange: [200, 600],
    envMapIntensity: 1.6,
    depthWrite: false,
  });
  const tail = new THREE.Mesh(tailGeo, tailMat);
  tilt.add(tail); // stays attached while the roll spins (the film feeds from the roll)
  const TH0 = -0.35; // angle where the film leaves the roll

  function updateTail(t) {
    const p = tailGeo.attributes.position.array;
    const c = Math.cos(TH0), s = Math.sin(TH0);
    for (let i = 0; i < p.length; i += 3) {
      const u = tailBase[i] + 0.5;          // 0 at roll → 1 at free end
      const v = tailBase[i + 1];            // -0.5..0.5 across the width
      const d = u * TAIL_L;
      const neck = 1 - 0.18 * Math.pow(u, 1.4); // film necks-in as it stretches
      const wave = Math.sin(d * 2.6 - t * 1.8 + v * 1.5) * 0.09 * u * u
                 + Math.sin(d * 5.0 - t * 2.6) * 0.025 * u;
      const out = 0.004 + 0.18 * u * u + wave;   // drift away from tangent
      const y = v * (H - 0.02) * neck - 0.12 * u * u;
      p[i]     = R * c - s * d + c * out;
      p[i + 1] = y + Math.sin(t * 1.2 + d) * 0.03 * u;
      p[i + 2] = R * s + c * d + s * out;
    }
    tailGeo.attributes.position.needsUpdate = true;
    tailGeo.computeVertexNormals();
  }
  updateTail(0);

  /* ---------------- Futuristic stage details ---------------- */
  const glowTex = makeCanvas(256, 256, (g, w) => {
    const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    gr.addColorStop(0, 'rgba(0,229,255,0.55)');
    gr.addColorStop(0.4, 'rgba(0,140,255,0.18)');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, w);
  });
  const floorGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(6, 6),
    new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })
  );
  floorGlow.rotation.x = -Math.PI / 2;
  floorGlow.position.y = -1.95;
  stage.add(floorGlow);

  const ringMat = new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false });
  const rings = [1.65, 2.05].map((r, i) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.006 + i * 0.002, 8, 200), ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -1.9 + i * 0.02;
    stage.add(ring);
    return ring;
  });
  // segmented HUD ring
  const hud = new THREE.Group();
  for (let i = 0; i < 48; i++) {
    if (i % 6 === 5) continue;
    const seg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.004, 0.025), ringMat);
    const a = (i / 48) * Math.PI * 2;
    seg.position.set(Math.cos(a) * 2.4, -1.9, Math.sin(a) * 2.4);
    seg.rotation.y = -a + Math.PI / 2;
    hud.add(seg);
  }
  stage.add(hud);

  // Floating dust particles
  const PCOUNT = window.innerWidth < 700 ? 220 : 520;
  const pPos = new Float32Array(PCOUNT * 3);
  for (let i = 0; i < PCOUNT; i++) {
    pPos[i * 3] = (rand() - 0.5) * 14;
    pPos[i * 3 + 1] = (rand() - 0.5) * 8;
    pPos[i * 3 + 2] = (rand() - 0.5) * 8 - 1;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const dotTex = makeCanvas(64, 64, (g, w) => {
    const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(160,240,255,.6)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, w);
  });
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
    size: 0.05, map: dotTex, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xaef4ff,
  }));
  scene.add(particles);

  /* ---------------- Post-processing ---------------- */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.38, 0.55, 0.9);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  /* ---------------- Layout / resize ---------------- */
  let baseX = 0, baseY = 0, lookX = 0, lookY = 0;
  function resize() {
    const w = hero.clientWidth, h = hero.clientHeight;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    bloom.setSize(w, h);
    camera.aspect = w / h;
    const narrow = camera.aspect < 0.9;
    camera.position.z = narrow ? 11 : 8;
    camera.updateProjectionMatrix();
    // desktop: roll to the right of the headline; mobile: above the headline
    baseX = narrow ? 0 : Math.min(2.6, 1.3 + (camera.aspect - 1) * 1.7);
    baseY = narrow ? 2.5 : 0.0;
    lookX = narrow ? 0 : baseX * 0.35;
    lookY = narrow ? 0 : baseY * 0.6;
    stage.scale.setScalar(narrow ? 0.52 : 0.84);
  }
  window.addEventListener('resize', resize);
  resize();

  /* ---------------- Interaction ---------------- */
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener('pointermove', e => {
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  let scrollY = 0;
  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 }).observe(hero);

  /* ---------------- Animate ---------------- */
  const clock = new THREE.Clock();
  const speed = reduceMotion ? 0.15 : 1;
  let intro = 0; // cinematic entrance once the loader fades
  let introStarted = false;
  document.addEventListener('egypack:loaded', () => { introStarted = true; });
  setTimeout(() => { introStarted = true; }, 6500);

  function frame() {
    requestAnimationFrame(frame);
    if (!visible || document.hidden) { clock.getDelta(); return; }
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime * speed;
    if (introStarted) intro = Math.min(1, intro + dt * 0.55);
    const ease = 1 - Math.pow(1 - intro, 3);

    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;

    stage.position.set(baseX + pointer.x * 0.15, baseY - (1 - ease) * 0.6 - scrollY * 0.0012, -(1 - ease) * 2.5);
    stage.rotation.y = t * 0.32 + pointer.x * 0.35 + (1 - ease) * -1.2;
    tilt.rotation.x = 0.32 + pointer.y * 0.12 + Math.sin(t * 0.6) * 0.04;
    spinner.rotation.y = -t * 0.9;
    stage.position.y += Math.sin(t * 0.9) * 0.06;

    updateTail(t);
    rings[0].rotation.z = t * 0.4;
    rings[1].rotation.z = -t * 0.25;
    hud.rotation.y = -t * 0.15;
    ringMat.opacity = 0.35 + Math.sin(t * 2) * 0.12;
    particles.rotation.y = t * 0.02;
    particles.position.y = Math.sin(t * 0.3) * 0.15;

    // travelling highlight sweeping across the film
    sweep.position.set(stage.position.x + Math.cos(t * 0.7) * 2.6, stage.position.y + Math.sin(t * 0.5) * 1.2, 2.2 + Math.sin(t * 0.7) * 1.2);
    key.target.position.copy(stage.position);
    rim.target.position.copy(stage.position);

    camera.position.x = pointer.x * 0.25;
    camera.position.y = 0.4 - pointer.y * 0.18;
    camera.lookAt(lookX, lookY, 0);

    composer.render();
  }

  // Compile shaders & render the first frame before announcing readiness
  renderer.compile(scene, camera);
  composer.render();
  sceneReady();
  frame();
}
