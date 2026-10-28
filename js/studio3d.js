/* EGY PACK — Interactive 3D Product Studio.
   Orbit (drag / touch), zoom (wheel / pinch / buttons), reset, and animated
   product switching. Renders only while visible and only when something moves. */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  BRAND, createRenderer, canvasTexture, radialGlowTexture, buildFilmRoll, disposeObject,
  reduceMotion, isSmallScreen, easeOutCubic, lerp
} from './three-utils.js';
import { findProduct } from './product-data.js';

// Camera viewing direction; the distance is fitted to each product's size
const HOME_DIR = new THREE.Vector3(4.2, 2.7, 5.1).normalize();
const PLATFORM_TOP = 0.0;

export function initStudio({ canvas, viewport, productId, onInteract }) {
  const renderer = createRenderer(canvas, { shadows: true });
  const scene = new THREE.Scene();
  scene.background = canvasTexture(512, 512, (g, w, h) => {
    const gr = g.createRadialGradient(w * 0.5, h * 0.42, 10, w * 0.5, h * 0.5, w * 0.72);
    gr.addColorStop(0, '#13307f'); gr.addColorStop(0.45, '#0a1a4a'); gr.addColorStop(1, '#030820');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(new RoomEnvironment(renderer), 0.04);
  scene.environment = envRT.texture;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 60);
  const home = { pos: new THREE.Vector3(), target: new THREE.Vector3(), min: 3.6, max: 11 };

  /* ---------- Lighting (studio three-point + soft shadow) ---------- */
  scene.add(new THREE.HemisphereLight(0x9fc4ff, 0x030820, 0.35));
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(-3.5, 7, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(isSmallScreen() ? 512 : 1024, isSmallScreen() ? 512 : 1024);
  key.shadow.camera.left = -3; key.shadow.camera.right = 3;
  key.shadow.camera.top = 3; key.shadow.camera.bottom = -3;
  key.shadow.camera.near = 1; key.shadow.camera.far = 20;
  key.shadow.radius = 6;
  key.shadow.bias = -0.0005;
  scene.add(key);
  const rim = new THREE.SpotLight(BRAND.cyan, 90, 25, Math.PI / 5, 0.7, 1.5);
  rim.position.set(4, 4, -5);
  rim.target.position.set(0, 1, 0);
  scene.add(rim, rim.target);
  const fill = new THREE.DirectionalLight(0x3a6bff, 0.7);
  fill.position.set(5, 1, 3);
  scene.add(fill);

  /* ---------- Presentation platform ---------- */
  const platform = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(2.1, 2.25, 0.32, 96),
    new THREE.MeshStandardMaterial({ color: 0x0d1d55, metalness: 0.75, roughness: 0.38, envMapIntensity: 0.9 })
  );
  base.position.y = PLATFORM_TOP - 0.16;
  base.receiveShadow = true;
  const top = new THREE.Mesh(
    new THREE.CylinderGeometry(1.95, 1.95, 0.02, 96),
    new THREE.MeshStandardMaterial({ color: 0x16285e, metalness: 0.4, roughness: 0.25, envMapIntensity: 1.1 })
  );
  top.position.y = PLATFORM_TOP + 0.005;
  top.receiveShadow = true;
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.03, 0.012, 8, 160),
    new THREE.MeshBasicMaterial({ color: BRAND.cyan })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = PLATFORM_TOP + 0.005;
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(7, 7),
    new THREE.MeshBasicMaterial({ map: radialGlowTexture('rgba(0,229,255,0.35)', 'rgba(0,120,255,0.1)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })
  );
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = -0.33;
  platform.add(base, top, ring, glow);
  scene.add(platform);

  /* ---------- Controls ---------- */
  const controls = new OrbitControls(camera, canvas);

  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;

  controls.minPolarAngle = 0.15;
  controls.maxPolarAngle = 1.48;   // never look from under the platform
  controls.rotateSpeed = 0.8;
  controls.zoomSpeed = 0.8;
  controls.autoRotate = !reduceMotion();
  controls.autoRotateSpeed = 0.7;
  controls.update();

  let idleTimer = 0;
  const pauseAutoRotate = () => {
    controls.autoRotate = false;
    clearTimeout(idleTimer);
    if (!reduceMotion()) idleTimer = setTimeout(() => { controls.autoRotate = true; wake(); }, 6000);
  };
  controls.addEventListener('start', () => { pauseAutoRotate(); if (onInteract) onInteract(); });
  controls.addEventListener('change', () => wake());

  /* ---------- Products ---------- */
  let current = null;  // { id, roll }
  const tweens = [];
  function tween(duration, update, done) {
    const tw = { t0: performance.now(), duration: reduceMotion() ? Math.min(duration, 1) : duration, update, done };
    tweens.push(tw);
    wake();
    return tw;
  }

  function placeRoll(roll) {
    roll.group.position.y = PLATFORM_TOP + roll.height / 2 + 0.01;
  }

  // Fit the camera to a product: rolls range from 10 cm to jumbo size
  function computeHome(visual) {
    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const extent = Math.max(visual.height * 1.25, visual.radius * 2.6, 1.1);
    const fitH = extent / (2 * Math.tan(vFov / 2));
    const dist = fitH * 1.4 / Math.min(1, camera.aspect);
    home.target.set(0, PLATFORM_TOP + visual.height * 0.5, 0);
    home.pos.copy(home.target).addScaledVector(HOME_DIR, dist);
    home.min = dist * 0.45;
    home.max = dist * 1.8;
    controls.minDistance = home.min;
    controls.maxDistance = home.max;
  }
  function flyHome(duration) {
    const p0 = camera.position.clone(), t0 = controls.target.clone();
    tween(duration, k => {
      const e = easeOutCubic(k);
      camera.position.lerpVectors(p0, home.pos, e);
      controls.target.lerpVectors(t0, home.target, e);
    });
  }

  function setProduct(id) {
    if (current && current.id === id) return;
    const product = findProduct(id);
    const next = { id: product.id, roll: buildFilmRoll(product.visual, { transmission: true, segments: isSmallScreen() ? 96 : 128 }) };
    placeRoll(next.roll);
    next.roll.group.scale.setScalar(0.001);
    scene.add(next.roll.group);

    const prev = current;
    current = next;
    current.visual = product.visual;
    computeHome(product.visual);
    if (prev) flyHome(800);
    else { camera.position.copy(home.pos); controls.target.copy(home.target); controls.update(); }
    if (prev) {
      const g = prev.roll.group, startRot = g.rotation.y;
      tween(320, k => {
        const e = easeOutCubic(k);
        g.scale.setScalar(Math.max(0.001, 1 - e));
        g.rotation.y = startRot + e * 1.2;
      }, () => { scene.remove(g); prev.roll.dispose(); });
    }
    const g = next.roll.group;
    tween(620, k => {
      // slight overshoot for a "placed on the stand" feel
      const e = k < 1 ? 1 - Math.pow(1 - k, 3) * Math.cos(k * Math.PI * 1.1) : 1;
      g.scale.setScalar(Math.max(0.001, e));
      g.rotation.y = (1 - k) * -1.4;
    });
    // start the new one after the old one shrinks
    tweens[tweens.length - 1].t0 += prev ? 220 : 0;
  }

  /* ---------- Camera helpers (buttons) ---------- */
  const tmp = new THREE.Vector3();
  function rotateBy(radians) {
    pauseAutoRotate();
    const offset = tmp.copy(camera.position).sub(controls.target);
    const sph = new THREE.Spherical().setFromVector3(offset);
    const from = sph.theta, to = sph.theta + radians;
    tween(520, k => {
      sph.theta = lerp(from, to, easeOutCubic(k));
      camera.position.setFromSpherical(sph).add(controls.target);
    });
  }
  function zoomBy(factor) {
    pauseAutoRotate();
    const offset = camera.position.clone().sub(controls.target);
    const from = offset.length();
    const to = THREE.MathUtils.clamp(from * factor, home.min, home.max);
    const dir = offset.normalize();
    tween(420, k => {
      camera.position.copy(controls.target).addScaledVector(dir, lerp(from, to, easeOutCubic(k)));
    });
  }
  function reset() {
    pauseAutoRotate();
    flyHome(700);
  }

  /* ---------- Size ---------- */
  function resize() {
    const w = viewport.clientWidth, h = viewport.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = camera.aspect < 0.8 ? 44 : 35;
    camera.updateProjectionMatrix();
    if (current) computeHome(current.visual);
    wake();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(viewport);

  /* ---------- Loop: only while visible, only when something changes ---------- */
  let visible = false, running = false, dirty = true, rafId = 0, disposed = false;
  // The IntersectionObserver can miss the entry if the scene loads mid-scroll, so double-check
  const onScreen = () => { const r = viewport.getBoundingClientRect(); return r.bottom > 0 && r.top < window.innerHeight && r.width > 0; };
  function wake() { dirty = true; if (!visible) visible = onScreen(); if (visible && !running && !disposed) { running = true; rafId = requestAnimationFrame(frame); } }
  function frame(now) {
    let active = false;
    for (let i = tweens.length - 1; i >= 0; i--) {
      const tw = tweens[i];
      const k = Math.min(1, Math.max(0, (now - tw.t0) / tw.duration));
      tw.update(k);
      active = true;
      if (k >= 1) { tweens.splice(i, 1); if (tw.done) tw.done(); }
    }
    const moved = controls.update();
    if (dirty || moved || active) renderer.render(scene, camera);
    dirty = false;
    if (visible && (moved || active || controls.autoRotate)) {
      rafId = requestAnimationFrame(frame);
    } else {
      running = false;
    }
  }
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) wake();
  }, { threshold: 0.05 });
  io.observe(viewport);
  const onVis = () => { if (!document.hidden) wake(); };
  document.addEventListener('visibilitychange', onVis);
  const onScroll = () => { if (!visible) wake(); };   // backup for a missed IntersectionObserver entry
  window.addEventListener('scroll', onScroll, { passive: true });

  resize();               // size first, so the first product is framed for the real aspect
  setProduct(productId);
  renderer.compile(scene, camera);
  renderer.render(scene, camera);

  function dispose() {
    disposed = true;
    cancelAnimationFrame(rafId);
    clearTimeout(idleTimer);
    io.disconnect(); ro.disconnect();
    document.removeEventListener('visibilitychange', onVis);
    window.removeEventListener('scroll', onScroll);
    controls.dispose();
    disposeObject(scene);
    if (scene.background) scene.background.dispose();
    envRT.dispose();
    renderer.dispose();
  }

  return { setProduct, rotateBy, zoomBy, reset, dispose };
}
