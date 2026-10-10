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

  /* ---------- Contact form ---------- */
  var form = document.getElementById('contactForm');
  var status = document.getElementById('formStatus');
  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var ok = true;
      ['cName', 'cEmail', 'cMsg'].forEach(function (id) {
        var input = document.getElementById(id);
        var valid = input.value.trim() !== '' && (input.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim()));
        input.parentElement.classList.toggle('has-error', !valid);
        if (!valid) ok = false;
      });
      status.classList.toggle('is-error', !ok);
      if (!ok) { status.textContent = 'Please complete all required fields with a valid email.'; return; }
      status.textContent = 'Preview only: this form is not connected yet, so nothing was sent.';
      form.reset();
    });
  }

  /* ---------- Footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
