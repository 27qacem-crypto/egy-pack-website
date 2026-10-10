/* EGY PACK — bilingual content (Arabic first, English second).
   Arabic is written directly in index.html; this file holds the English
   strings and switches between the two. Elements marked .alt-lang show the
   other language as a secondary line (English under Arabic, and vice versa). */
(function () {
  'use strict';

  var STORAGE_KEY = 'egypack-lang';
  var DEFAULT_LANG = 'ar';

  var en = {
    'meta.title': 'EGY PACK | إيجي باك — Industrial Stretch Film Manufacturing',
    'meta.description': 'EGY PACK (إيجي باك) — industrial stretch film manufacturing.',

    'loader.label': 'Loading EGY PACK',

    'nav.homeLabel': 'EGY PACK home',
    'nav.label': 'Main',
    'nav.toggle': 'Toggle menu',
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.products': 'Products',
    'nav.technology': 'Technology',
    'nav.industries': 'Industries',
    'nav.quote': 'Get a Quote',

    'common.tbcShort': 'TBC',

    'hero.eyebrow': 'Industrial Stretch Film Manufacturing',
    'hero.title': 'Engineered to <span class="text-cyan">Hold</span><br />\n          the World Together',
    'hero.alt': 'إيجي باك — للاستريتش الصناعي',
    'hero.lead': 'Industrial stretch film for pallet wrapping and protecting goods in storage and transport.\n          [Company introduction — to be provided by EGY PACK]',
    'hero.ctaProducts': 'Explore Products',
    'hero.ctaQuote': 'Request a Quote',
    'hero.stat1': 'Key figure 1',
    'hero.stat2': 'Key figure 2',
    'hero.stat3': 'Key figure 3',
    'hero.scroll': 'Scroll down',

    'about.eyebrow': 'About EGY PACK',
    'about.title': 'About <span class="text-silver">EGY PACK</span>',
    'about.body': 'EGY PACK manufactures industrial stretch film.\n            [Company overview — history, facilities and capabilities to be provided by EGY PACK]',
    'about.alt': 'إيجي باك لصناعة الاستريتش الصناعي.\n            [نبذة عن الشركة — يتم توفيرها من إيجي باك]',
    'about.cap1': '[Capability 1 — to be confirmed]',
    'about.cap2': '[Capability 2 — to be confirmed]',
    'about.cap3': '[Capability 3 — to be confirmed]',
    'about.metric1': 'Metric 1',
    'about.metric2': 'Metric 2',
    'about.metric3': 'Metric 3',

    'products.eyebrow': 'Product Range',
    'products.title': 'Stretch Film <span class="text-cyan">Solutions</span>',
    'products.sub': 'Product names, descriptions and specifications to be confirmed by EGY PACK.',
    'products.p1': 'Machine Stretch Film',
    'products.p2': 'Hand Stretch Film',
    'products.p3': 'Pre-Stretched Film',
    'products.p4': 'Colored &amp; Custom Film',
    'products.desc': '[Product description — to be provided]',
    'products.width': 'Width: TBC',
    'products.thickness': 'Thickness: TBC',
    'products.core': 'Core: TBC',

    'studio.eyebrow': '3D Product Studio',
    'studio.title': 'Explore the Roll from <span class="text-cyan">Every Angle</span>',
    'studio.canvasLabel': '3D model of a stretch-film roll that you can rotate and zoom',
    'studio.loading': 'Loading the 3D view…',
    'studio.fallback': 'The 3D view is not supported on this device. You can still choose a product and review its specifications.',
    'studio.illustrative': 'Illustrative model',
    'studio.hint': 'Drag to rotate · Scroll or pinch to zoom',
    'studio.tools': 'View tools',
    'studio.rotateLeft': 'Rotate left',
    'studio.rotateRight': 'Rotate right',
    'studio.zoomIn': 'Zoom in',
    'studio.zoomOut': 'Zoom out',
    'studio.reset': 'Reset view',
    'studio.choose': 'Choose a product',
    'studio.note': 'Specifications are pending confirmation by EGY PACK. The 3D model is for illustration only.',
    'studio.quote': 'Request a Quote for This Product',
    'spec.width': 'Width',
    'spec.thickness': 'Thickness',
    'spec.length': 'Roll length',
    'spec.weight': 'Roll weight',
    'spec.core': 'Core diameter',
    'spec.color': 'Color',

    'wrap.canvasLabel': '3D demonstration of a pallet being wrapped with stretch film',
    'wrap.eyebrow': 'Interactive Experience',
    'wrap.title': 'Experience the <span class="text-cyan">Protection</span>',
    'wrap.sub': 'Scroll down to watch a pallet being wrapped with stretch film. Illustrative demonstration.',
    'wrap.stage': 'Stage',
    'wrap.c1': 'A ready load: cartons stacked on a wooden pallet, still unwrapped.',
    'wrap.c2': 'The stretch-film roll moves into position.',
    'wrap.c3': 'Wrapping starts at the base, tying the load to the pallet.',
    'wrap.c4': 'The film climbs layer over layer around the cartons.',
    'wrap.c5': 'The load is wrapped from base to top.',
    'wrap.c6': 'The load is now fully wrapped and ready to ship.',
    'wrap.replay': 'Replay',
    'wrap.pause': 'Pause',
    'wrap.play': 'Play',
    'wrap.drag': 'Drag to rotate the pallet',

    'tech.eyebrow': 'Manufacturing Technology',
    'tech.title': 'How We <span class="text-silver">Manufacture</span>',
    'tech.sub': 'Process steps to be confirmed by EGY PACK.',
    'tech.s1': 'Raw Materials',
    'tech.s2': 'Extrusion',
    'tech.s3': 'Quality Control',
    'tech.s4': 'Winding &amp; Packing',
    'tech.desc': '[Description — to be provided]',

    'ind.eyebrow': 'Industries We Serve',
    'ind.title': 'Industries <span class="text-cyan">We Serve</span>',
    'ind.sub': 'List of industries to be confirmed by EGY PACK.',
    'ind.i1': '[Industry 1 — TBC]',
    'ind.i2': '[Industry 2 — TBC]',
    'ind.i3': '[Industry 3 — TBC]',
    'ind.i4': '[Industry 4 — TBC]',

    'contact.eyebrow': 'Contact',
    'contact.title': 'Let\'s Wrap <span class="text-cyan">Your Next Load</span>',
    'contact.body': 'Tell us about your wrapping requirements and we will get back to you.',
    'contact.details': 'Phone: [TBC] · Email: [TBC] · Address: [TBC]',
    'contact.alt': 'تواصل معنا للحصول على عرض سعر',

    'form.name': 'Full name',
    'form.email': 'Email',
    'form.product': 'Product',
    'form.message': 'Message',
    'form.submit': 'Send Request',
    'form.error': 'Please complete all required fields with a valid email.',
    'form.ok': 'Preview only: this form is not connected yet, so nothing was sent.',

    'footer.tagline': 'Industrial Stretch Film Manufacturing',
    'footer.alt': 'إيجي باك للاستريتش الصناعي',
    'footer.label': 'Footer',
    'footer.contact': 'Contact',
    'footer.rights': 'EGY PACK. All rights reserved.'
  };

  // Arabic strings that only exist in script (not in the page markup)
  var ar = {
    'meta.title': document.title,
    'meta.description': '',
    'form.error': 'يرجى استكمال جميع الحقول المطلوبة وإدخال بريد إلكتروني صحيح.',
    'form.ok': 'معاينة فقط: النموذج غير متصل بعد، لذلك لم يتم إرسال أي شيء.'
  };

  var metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) ar['meta.description'] = metaDesc.getAttribute('content');

  // Capture the Arabic markup as the source of truth for the Arabic language
  var textEls = document.querySelectorAll('[data-i18n]');
  textEls.forEach(function (el) {
    var key = el.getAttribute('data-i18n');
    if (!(key in ar)) ar[key] = el.innerHTML;
  });
  var attrEls = document.querySelectorAll('[data-i18n-attr]');
  attrEls.forEach(function (el) {
    el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
      var parts = pair.split(':');
      if (!(parts[1] in ar)) ar[parts[1]] = el.getAttribute(parts[0]);
    });
  });

  var dict = { ar: ar, en: en };
  var current = DEFAULT_LANG;

  function readStored() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function store(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* storage unavailable */ }
  }
  function t(key) {
    var v = dict[current][key];
    return v == null ? (ar[key] == null ? key : ar[key]) : v;
  }

  function apply(lang) {
    if (!dict[lang]) lang = DEFAULT_LANG;
    current = lang;
    var root = document.documentElement;
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';

    textEls.forEach(function (el) { el.innerHTML = t(el.getAttribute('data-i18n')); });
    attrEls.forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var parts = pair.split(':');
        el.setAttribute(parts[0], t(parts[1]));
      });
    });

    // Secondary line in the other language
    document.querySelectorAll('.alt-lang').forEach(function (el) {
      var altIsArabic = lang === 'en';
      el.lang = altIsArabic ? 'ar' : 'en';
      el.dir = altIsArabic ? 'rtl' : 'ltr';
      el.classList.toggle('ar', altIsArabic);
    });

    document.title = t('meta.title');
    if (metaDesc) metaDesc.setAttribute('content', t('meta.description'));

    var btn = document.getElementById('langSwitch');
    if (btn) {
      var next = lang === 'ar' ? 'en' : 'ar';
      btn.textContent = next === 'en' ? 'EN' : 'عربي';
      btn.lang = next;
      btn.setAttribute('aria-label', next === 'en' ? 'Switch to English' : 'التبديل إلى العربية');
    }

    // Clear any form message so it is not left in the previous language
    var status = document.getElementById('formStatus');
    if (status) { status.textContent = ''; status.classList.remove('is-error'); }

    document.dispatchEvent(new CustomEvent('egypack:langchange', { detail: { lang: lang } }));
  }

  // Initial language: ?lang= in the URL, then the visitor's last choice, then Arabic
  var fromUrl = null;
  try { fromUrl = new URLSearchParams(location.search).get('lang'); } catch (e) { /* old browser */ }
  var initial = (fromUrl && dict[fromUrl]) ? fromUrl : (readStored() || DEFAULT_LANG);
  apply(initial);

  var switchBtn = document.getElementById('langSwitch');
  if (switchBtn) {
    switchBtn.addEventListener('click', function () {
      var next = current === 'ar' ? 'en' : 'ar';
      apply(next);
      store(next);
    });
  }

  window.EGY_I18N = {
    t: t,
    lang: function () { return current; },
    set: function (lang) { apply(lang); store(lang); }
  };
})();
