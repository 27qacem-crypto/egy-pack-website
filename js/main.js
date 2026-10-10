/* EGY PACK — UI interactions (loader, navigation, reveals, counters, form) */
(function () {
  'use strict';

  var body = document.body;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Loading screen ---------- */
  var loader = document.getElementById('loader');
  var progressEl = document.getElementById('loaderProgress');
  var progress = 0;
  var pageLoaded = false;
  var sceneReady = false;
  var startTime = Date.now();
  var MIN_SHOW = 1400;   // keep the brand on screen briefly
  var MAX_WAIT = 6000;   // never block the page if the 3D scene fails

  var ticker = setInterval(function () {
    var target = (pageLoaded ? 50 : 0) + (sceneReady ? 50 : 0);
    progress = Math.min(progress + Math.max(1, (Math.max(target, 85) - progress) * 0.08), pageLoaded && sceneReady ? 100 : 90);
    if (progressEl) progressEl.style.width = progress + '%';
  }, 60);

  function tryHideLoader(force) {
    if (!loader || loader.classList.contains('is-hidden')) return;
    if (!force && !(pageLoaded && sceneReady)) return;
    var wait = Math.max(0, MIN_SHOW - (Date.now() - startTime));
    setTimeout(function () {
      clearInterval(ticker);
      if (progressEl) progressEl.style.width = '100%';
      setTimeout(function () {
        loader.classList.add('is-hidden');
        body.classList.remove('is-loading');
        document.dispatchEvent(new CustomEvent('egypack:loaded'));
      }, 250);
    }, wait);
  }

  window.addEventListener('load', function () { pageLoaded = true; tryHideLoader(); });
  document.addEventListener('egypack:scene-ready', function () { sceneReady = true; tryHideLoader(); });
  setTimeout(function () { tryHideLoader(true); }, MAX_WAIT);

  /* ---------- Navigation ---------- */
  var nav = document.getElementById('nav');
  var toggle = document.getElementById('navToggle');
  var links = document.querySelectorAll('.nav__links a');

  function onScroll() { nav.classList.toggle('is-scrolled', window.scrollY > 20); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  links.forEach(function (a) {
    a.addEventListener('click', function () {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* Active section highlighting */
  if ('IntersectionObserver' in window) {
    var sectionObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { sectionObs.observe(s); });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); revealObs.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 80 + 'ms';
      revealObs.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Animated counters ---------- */
  function runCounter(el) {
    var end = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduceMotion) { el.textContent = end + suffix; return; }
    var dur = 1600, t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window) {
    var countObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { runCounter(e.target); countObs.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { countObs.observe(c); });
  } else {
    counters.forEach(runCounter);
  }

  /* ---------- 3D tilt cards ---------- */
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.tilt').forEach(function (card) {
      card.addEventListener('mousemove', function (ev) {
        var r = card.getBoundingClientRect();
        var x = (ev.clientX - r.left) / r.width;
        var y = (ev.clientY - r.top) / r.height;
        card.style.transform = 'perspective(800px) rotateX(' + ((0.5 - y) * 10) + 'deg) rotateY(' + ((x - 0.5) * 12) + 'deg) translateY(-4px)';
        card.style.setProperty('--mx', x * 100 + '%');
        card.style.setProperty('--my', y * 100 + '%');
      });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });
  }

  /* ---------- Quotation form → prefilled WhatsApp message ---------- */
  var form = document.getElementById('contactForm');
  var cfg = window.EGY_CONFIG;
  function tr(key, fallback) { return window.EGY_I18N ? window.EGY_I18N.t(key) : fallback; }
  function currentLang() { return window.EGY_I18N ? window.EGY_I18N.lang() : 'ar'; }
  // Accept Arabic-Indic / Persian digits and common separators in phone numbers
  function normalizeDigits(v) {
    return v.replace(/[٠-٩]/g, function (d) { return String(d.charCodeAt(0) - 0x0660); })
            .replace(/[۰-۹]/g, function (d) { return String(d.charCodeAt(0) - 0x06F0); });
  }
  function validPhone(v) { return /^\+?\d{8,15}$/.test(normalizeDigits(v).replace(/[\s\-().]/g, '')); }

  var status = document.getElementById('formStatus');
  if (form && cfg) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var get = function (id) { return document.getElementById(id).value.trim(); };
      var checks = [
        ['cName', get('cName') !== ''],
        ['cPhone', validPhone(get('cPhone'))],
        ['cQty', get('cQty') !== '']
      ];
      var ok = true;
      checks.forEach(function (c) {
        document.getElementById(c[0]).parentElement.classList.toggle('has-error', !c[1]);
        if (!c[1]) ok = false;
      });
      status.classList.toggle('is-error', !ok);
      if (!ok) { status.textContent = tr('form.error', 'Please enter your name, a valid phone number and the quantity.'); return; }

      var product = document.getElementById('cProduct');
      var dash = '—';
      var lines = [
        tr('wa.q.title', 'Quotation request — EGY PACK'),
        '',
        tr('wa.q.name', 'Name') + ': ' + get('cName'),
        tr('wa.q.company', 'Company') + ': ' + (get('cCompany') || dash)
      ].concat(document.getElementById('cIndustry').value ? [
        tr('wa.q.industry', 'Business type') + ': ' + document.getElementById('cIndustry').options[document.getElementById('cIndustry').selectedIndex].text.trim()
      ] : []).concat([
        tr('wa.q.phone', 'Phone') + ': ' + normalizeDigits(get('cPhone')),
        tr('wa.q.product', 'Product') + ': ' + product.options[product.selectedIndex].text.trim(),
        tr('wa.q.qty', 'Quantity') + ': ' + get('cQty'),
        tr('wa.q.notes', 'Notes') + ': ' + (get('cMsg') || dash)
      ]);
      var url = cfg.whatsappLink(lines.join('\n'));
      form.setAttribute('data-wa-url', url);   // handy for checking the generated link

      // Open the official WhatsApp chat. Nothing is sent until the customer presses Send there,
      // so the message below never claims the request was delivered.
      var win = window.open(url, '_blank');
      if (win) { try { win.opener = null; } catch (e) { /* cross-origin */ } }
      status.textContent = '';
      var p1 = document.createElement('span');
      p1.textContent = tr('form.opened', 'WhatsApp has opened with your request. To send it, press Send inside WhatsApp.') + ' ';
      var p2 = document.createElement('span');
      p2.textContent = tr('form.fallback', 'If WhatsApp did not open, use this link:') + ' ';
      var a = document.createElement('a');
      a.href = url; a.target = '_blank'; a.rel = 'noopener';
      a.textContent = tr('form.fallbackLink', 'Open WhatsApp with your request');
      status.appendChild(p1); status.appendChild(p2); status.appendChild(a);
    });
  }

  /* ---------- Industry cards → quotation form with the industry preselected ---------- */
  document.querySelectorAll('.ind-card[data-industry]').forEach(function (card) {
    card.addEventListener('click', function (ev) {
      var sel = document.getElementById('cIndustry');
      if (!sel) return;
      ev.preventDefault();
      sel.value = card.getAttribute('data-industry');
      var contact = document.getElementById('contact');
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      contact.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      setTimeout(function () { document.getElementById('cName').focus({ preventScroll: true }); }, reduce ? 0 : 700);
    });
  });

  /* ---------- WhatsApp links follow the active language ---------- */
  function syncWhatsApp() {
    if (!cfg) return;
    var href = cfg.whatsappLink(cfg.whatsappGreeting[currentLang()] || cfg.whatsappGreeting.ar);
    document.querySelectorAll('.js-wa').forEach(function (a) { a.href = href; });
  }
  syncWhatsApp();
  document.addEventListener('egypack:langchange', syncWhatsApp);

  /* Facebook link appears only once its official URL is configured */
  var fb = document.getElementById('footerFacebook');
  if (fb && cfg && cfg.facebookUrl) { fb.querySelector('a').href = cfg.facebookUrl; fb.hidden = false; }

  /* ---------- Floating WhatsApp button ---------- */
  var waFloat = document.getElementById('waFloat');
  if (waFloat && 'IntersectionObserver' in window) {
    // On small screens, step aside while the 3D controls fill the bottom of the screen
    var busy = new Set();
    var small = window.matchMedia('(max-width: 860px)');
    var update = function () { waFloat.classList.toggle('is-tucked', small.matches && busy.size > 0); };
    var tuckObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) busy.add(e.target); else busy.delete(e.target); });
      update();
    }, { threshold: 0.15 });
    // …and while a form with its own WhatsApp button is on screen
    ['studioViewport', 'wrapStage', 'calcForm', 'contactForm'].forEach(function (id) { var el = document.getElementById(id); if (el) tuckObs.observe(el); });
    if (small.addEventListener) small.addEventListener('change', update);
  }

  /* ---------- Footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
