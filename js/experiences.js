/* EGY PACK — Product Studio + "Experience the Protection" controller.
   Wires the bilingual UI immediately (it works without WebGL), detects WebGL,
   and lazy-loads each 3D scene only when its section approaches the viewport. */
import { PRODUCTS, SPEC_FIELDS, findProduct } from './product-data.js';

const tr = (key, fallback) => (window.EGY_I18N ? window.EGY_I18N.t(key) : fallback);
const lang = () => (window.EGY_I18N ? window.EGY_I18N.lang() : document.documentElement.lang || 'ar');

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) { return false; }
}
const WEBGL = hasWebGL();

/* Run `load` once when `el` comes within `margin` of the viewport */
function whenNear(el, margin, load) {
  if (!('IntersectionObserver' in window)) { load(); return; }
  const io = new IntersectionObserver(entries => {
    if (entries.some(e => e.isIntersecting)) { io.disconnect(); load(); }
  }, { rootMargin: margin });
  io.observe(el);
}

const cleanups = [];
window.addEventListener('pagehide', () => cleanups.forEach(fn => { try { fn(); } catch (e) { /* ignore */ } }));

/* =========================================================
   Feature 1 — Interactive 3D Product Studio
   ========================================================= */
(function studio() {
  const root = document.getElementById('studio');
  if (!root) return;
  const viewport = document.getElementById('studioViewport');
  const canvas = document.getElementById('studioCanvas');
  const loading = document.getElementById('studioLoading');
  const fallback = document.getElementById('studioFallback');
  const hint = document.getElementById('studioHint');
  const nameEl = document.getElementById('studioName');
  const radios = Array.from(root.querySelectorAll('[data-product]'));
  const specEls = Array.from(root.querySelectorAll('[data-spec]'));
  let selected = PRODUCTS[0].id;
  let api = null;

  function renderSpecs() {
    const p = findProduct(selected);
    specEls.forEach(dd => {
      const v = p.specs[dd.getAttribute('data-spec')];
      const text = v ? (v[lang()] || v.ar || v.en) : tr('common.tbcShort', 'TBC');
      dd.textContent = text;
      dd.classList.toggle('tbc', !v);
    });
  }

  function select(id, { focus = false } = {}) {
    selected = findProduct(id).id;
    radios.forEach(btn => {
      const on = btn.getAttribute('data-product') === selected;
      btn.setAttribute('aria-checked', String(on));
      btn.tabIndex = on ? 0 : -1;
      if (on && focus) btn.focus();
    });
    const key = findProduct(selected).nameKey;
    nameEl.setAttribute('data-i18n', key);   // keeps the name in sync on language switch
    nameEl.innerHTML = tr(key, nameEl.innerHTML);
    renderSpecs();
    if (api) api.setProduct(selected);
  }

  radios.forEach((btn, i) => {
    btn.addEventListener('click', () => select(btn.getAttribute('data-product')));
    btn.addEventListener('keydown', e => {
      const rtl = document.documentElement.dir === 'rtl';
      const fwd = ['ArrowDown', rtl ? 'ArrowLeft' : 'ArrowRight'];
      const back = ['ArrowUp', rtl ? 'ArrowRight' : 'ArrowLeft'];
      let n = null;
      if (fwd.includes(e.key)) n = (i + 1) % radios.length;
      if (back.includes(e.key)) n = (i - 1 + radios.length) % radios.length;
      if (n !== null) { e.preventDefault(); select(radios[n].getAttribute('data-product'), { focus: true }); }
    });
  });

  // Toolbar
  root.querySelectorAll('[data-act]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!api) return;
      const act = btn.getAttribute('data-act');
      if (act === 'rotate-left') api.rotateBy(-Math.PI / 4);
      if (act === 'rotate-right') api.rotateBy(Math.PI / 4);
      if (act === 'zoom-in') api.zoomBy(0.8);
      if (act === 'zoom-out') api.zoomBy(1.25);
      if (act === 'reset') api.reset();
    });
  });

  // Request a quote for the selected product: pre-select it in the contact form
  document.getElementById('studioQuote').addEventListener('click', () => {
    const select = document.getElementById('cProduct');
    if (select) select.value = selected;
    const contact = document.getElementById('contact');
    if (contact) contact.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const name = document.getElementById('cName');
    if (name) setTimeout(() => name.focus({ preventScroll: true }), 700);
  });

  document.addEventListener('egypack:langchange', renderSpecs);
  renderSpecs();

  function showFallback() {
    loading.hidden = true;
    hint.hidden = true;
    canvas.hidden = true;
    fallback.hidden = false;
    root.classList.add('is-static');
  }

  if (!WEBGL) { showFallback(); return; }

  whenNear(viewport, '400px 0px', () => {
    import('./studio3d.js').then(mod => {
      api = mod.initStudio({
        canvas, viewport, productId: selected,
        onInteract: () => hint.classList.add('is-faded')
      });
      loading.hidden = true;
      root.classList.add('is-ready');
      cleanups.push(() => api.dispose());
    }).catch(err => {
      console.warn('EGY PACK product studio unavailable:', err);
      showFallback();
    });
  });
})();

/* =========================================================
   Feature 2 — Experience the Protection (scroll-driven wrapping)
   ========================================================= */
(function wrapping() {
  const section = document.getElementById('protection');
  if (!section) return;
  const track = document.getElementById('wrapTrack');
  const stageEl = document.getElementById('wrapStage');
  const canvas = document.getElementById('wrapCanvas');
  const fallback = document.getElementById('wrapFallback');
  const captions = Array.from(document.querySelectorAll('#wrapCaptions li'));
  const stageNum = document.getElementById('wrapStageNum');
  const bar = document.getElementById('wrapProgress');
  const replayBtn = document.getElementById('wrapReplay');
  const playBtn = document.getElementById('wrapPlay');
  const pauseLabel = document.getElementById('wrapPauseLabel');
  const playLabel = document.getElementById('wrapPlayLabel');
  const dragHint = document.getElementById('wrapDragHint');
  let api = null, lastStage = -1;

  function showStage(i) {
    if (i === lastStage) return;
    lastStage = i;
    captions.forEach((li, n) => li.classList.toggle('is-active', n === i));
    stageNum.textContent = String(i + 1);
  }

  function scrollProgress() {
    const r = track.getBoundingClientRect();
    const range = r.height - window.innerHeight;
    return range > 0 ? Math.min(1, Math.max(0, -r.top / range)) : 0;
  }

  function staticMode() {
    section.classList.add('is-static');
    canvas.hidden = true;
    fallback.hidden = false;
    replayBtn.hidden = true;
  }

  if (!WEBGL) { staticMode(); return; }

  whenNear(section, '600px 0px', () => {
    import('./wrap3d.js').then(mod => {
      api = mod.initWrap({
        canvas, stage: stageEl,
        onUpdate: s => {
          showStage(s.stage);
          bar.style.transform = `scaleX(${s.t.toFixed(4)})`;
          const auto = s.mode === 'auto';
          playBtn.hidden = !auto || s.t >= 1;
          pauseLabel.hidden = !s.playing;
          playLabel.hidden = s.playing;
          dragHint.hidden = !s.dragEnabled;
          section.classList.toggle('can-drag', s.dragEnabled);
        }
      });
      section.classList.add('is-ready');
      cleanups.push(() => api.dispose());

      let lastY = window.scrollY;
      const onScroll = () => {
        // a deliberate scroll hands control back from autoplay to the scroll position
        if (api.mode === 'auto' && Math.abs(window.scrollY - lastY) > 24) api.useScroll();
        if (api.mode !== 'auto') lastY = window.scrollY;
        api.setScrollProgress(scrollProgress());
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      onScroll();

      replayBtn.addEventListener('click', () => { lastY = window.scrollY; api.replay(); });
      playBtn.addEventListener('click', () => { lastY = window.scrollY; api.togglePlay(); });
    }).catch(err => {
      console.warn('EGY PACK wrapping scene unavailable:', err);
      staticMode();
    });
  });
})();
