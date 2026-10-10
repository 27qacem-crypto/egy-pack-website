/* EGY PACK — Product Studio + "Experience the Protection" controller.
   Wires the bilingual UI immediately (it works without WebGL), detects WebGL,
   and lazy-loads each 3D scene only when its section approaches the viewport. */
import { PRODUCTS, findProduct, isFixedWeight } from './product-data.js';

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
  const descEl = document.getElementById('studioDesc');
  const radios = Array.from(root.querySelectorAll('[data-product]'));
  const form = document.getElementById('calcForm');
  const weightIn = document.getElementById('calcWeight');
  const qtyIn = document.getElementById('calcQty');
  const nameIn = document.getElementById('calcName');
  const phoneIn = document.getElementById('calcPhone');
  const weightHelp = document.getElementById('calcWeightHelp');
  const totalEl = document.getElementById('calcTotal');
  const status = document.getElementById('calcStatus');
  let selected = PRODUCTS[0].id;
  let api = null;

  /* ---------- Formatting & parsing (accepts Arabic-Indic digits and ٫ or , decimals) ---------- */
  const fmt = n => String(Math.round(n * 100) / 100);
  const fill = (key, vars) => tr(key, key).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
  const toAscii = v => v
    .replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, d => String(d.charCodeAt(0) - 0x06F0))
    .replace(/[٫,]/g, '.').trim();
  const parseNum = v => { const t = toAscii(v); return /^\d+(\.\d+)?$/.test(t) ? parseFloat(t) : NaN; };
  const parseInt10 = v => { const t = toAscii(v); return /^\d+$/.test(t) ? parseInt(t, 10) : NaN; };
  const validPhone = v => /^\+?\d{8,15}$/.test(toAscii(v).replace(/[\s\-().]/g, ''));

  function rangeText(p) {
    const kg = tr('unit.kg', 'kg');
    return isFixedWeight(p) ? `${fmt(p.weight.min)} ${kg} ${tr('calc.fixedTag', '(fixed)')}` : `${fmt(p.weight.min)} – ${fmt(p.weight.max)} ${kg}`;
  }

  /* ---------- Rendering (re-run on language change; the 3D view is left alone) ---------- */
  function renderProduct() {
    const p = findProduct(selected);
    nameEl.setAttribute('data-i18n', p.nameKey);   // i18n keeps these in sync on language switch
    nameEl.innerHTML = tr(p.nameKey, nameEl.innerHTML);
    descEl.setAttribute('data-i18n', p.descKey);
    descEl.innerHTML = tr(p.descKey, descEl.innerHTML);
    document.getElementById('specWidth').textContent = p.widthCm ? `${p.widthCm} ${tr('unit.cm', 'cm')}` : tr('spec.notSpecified', 'Not specified');
    document.getElementById('specWeight').textContent = rangeText(p);
    root.querySelectorAll('.js-range').forEach(el => { el.textContent = rangeText(findProduct(el.getAttribute('data-range'))); });

    const fixed = isFixedWeight(p);
    weightIn.readOnly = fixed;
    weightIn.classList.toggle('is-fixed', fixed);
    if (fixed) weightIn.value = fmt(p.weight.min);
    weightIn.placeholder = fixed ? '' : `${fmt(p.weight.min)} – ${fmt(p.weight.max)}`;
    weightHelp.textContent = fixed ? fill('calc.fixed', { w: fmt(p.weight.min) }) : fill('calc.range', { min: fmt(p.weight.min), max: fmt(p.weight.max) });
    qtyIn.placeholder = '1';
    updateTotal();
  }

  /* ---------- Validation + live total ---------- */
  function readInputs() {
    const p = findProduct(selected);
    const w = parseNum(weightIn.value);
    const q = parseInt10(qtyIn.value);
    return {
      p, w, q,
      weightOk: !isNaN(w) && w >= p.weight.min && w <= p.weight.max,
      qtyOk: !isNaN(q) && q >= 1 && q <= 1000000,
      phoneOk: phoneIn.value.trim() === '' || validPhone(phoneIn.value)
    };
  }
  function updateTotal() {
    const r = readInputs();
    totalEl.textContent = r.weightOk && r.qtyOk ? `${fmt(r.w * r.q)} ${tr('unit.kg', 'kg')}` : '—';
    return r;
  }
  [weightIn, qtyIn].forEach(el => el.addEventListener('input', () => {
    el.parentElement.classList.remove('has-error');
    updateTotal();
  }));

  form.addEventListener('submit', e => {
    e.preventDefault();
    const r = updateTotal();
    weightIn.parentElement.classList.toggle('has-error', !r.weightOk);
    qtyIn.parentElement.classList.toggle('has-error', !r.qtyOk);
    phoneIn.parentElement.classList.toggle('has-error', !r.phoneOk);
    const errors = [];
    if (!r.weightOk) errors.push(fill('calc.errWeight', { min: fmt(r.p.weight.min), max: fmt(r.p.weight.max) }));
    if (!r.qtyOk) errors.push(tr('calc.errQty', 'Enter a whole number of rolls (1 or more).'));
    if (!r.phoneOk) errors.push(tr('calc.errPhone', 'The phone number is not valid.'));
    status.classList.toggle('is-error', errors.length > 0);
    if (errors.length) { status.textContent = errors.join(' '); return; }

    const kg = tr('unit.kg', 'kg');
    const lines = [tr('wa.c.title', 'Quotation request — EGY PACK'), ''];
    lines.push(`${tr('wa.c.product', 'Product')}: ${tr(r.p.nameKey, r.p.id)}`);
    if (r.p.widthCm) lines.push(`${tr('wa.c.width', 'Roll width')}: ${r.p.widthCm} ${tr('unit.cm', 'cm')}`);
    lines.push(`${tr('wa.c.weight', 'Requested weight per roll')}: ${fmt(r.w)} ${kg} ${tr('wa.c.requested', '')}`.trim());
    lines.push(`${tr('wa.c.rolls', 'Number of rolls')}: ${r.q}`);
    lines.push(`${tr('wa.c.total', 'Estimated total weight')}: ${fmt(r.w * r.q)} ${kg}`);
    if (nameIn.value.trim()) lines.push(`${tr('wa.c.name', 'Name')}: ${nameIn.value.trim()}`);
    if (phoneIn.value.trim()) lines.push(`${tr('wa.c.phone', 'Phone')}: ${toAscii(phoneIn.value)}`);

    const cfg = window.EGY_CONFIG;
    const url = cfg ? cfg.whatsappLink(lines.join('\n')) : 'https://wa.me/201065786620?text=' + encodeURIComponent(lines.join('\n'));
    form.setAttribute('data-wa-url', url);
    // Opens the official chat with the message ready; the customer still presses Send in WhatsApp.
    const win = window.open(url, '_blank');
    if (win) { try { win.opener = null; } catch (err) { /* cross-origin */ } }
    status.textContent = '';
    const msg = document.createElement('span');
    msg.textContent = tr('form.opened', 'WhatsApp has opened with your request. To send it, press Send inside WhatsApp.') + ' ' + tr('form.fallback', 'If WhatsApp did not open, use this link:') + ' ';
    const a = document.createElement('a');
    a.href = url; a.target = '_blank'; a.rel = 'noopener';
    a.textContent = tr('form.fallbackLink', 'Open WhatsApp with your request');
    status.append(msg, a);
  });

  function select(id, { focus = false } = {}) {
    const prev = selected;
    selected = findProduct(id).id;
    radios.forEach(btn => {
      const on = btn.getAttribute('data-product') === selected;
      btn.setAttribute('aria-checked', String(on));
      btn.tabIndex = on ? 0 : -1;
      if (on && focus) btn.focus();
    });
    if (prev !== selected) {
      // a weight entered for another product is not carried over
      if (!isFixedWeight(findProduct(selected))) weightIn.value = '';
      weightIn.parentElement.classList.remove('has-error');
      status.textContent = ''; status.classList.remove('is-error');
    }
    renderProduct();
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

  document.addEventListener('egypack:langchange', () => {
    status.textContent = ''; status.classList.remove('is-error');   // never leave a message in the old language
    renderProduct();
  });
  renderProduct();

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
