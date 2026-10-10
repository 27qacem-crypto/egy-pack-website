/* EGY PACK — bilingual content (Arabic first, English second).
   Arabic is written directly in index.html; this file holds the English
   strings and switches between the two. Elements marked .alt-lang show the
   other language as a secondary line (English under Arabic, and vice versa). */
(function () {
  'use strict';

  var STORAGE_KEY = 'egypack-lang';
  var DEFAULT_LANG = 'ar';

  var en = {
    'meta.title': 'EGY PACK | مؤسسة إيجي باك للاسترتش الصناعي — Industrial Stretch Film',
    'meta.description': 'EGY PACK: industrial stretch film manufacturing, cutting & trading, with more than 15 years of experience. Phone 01003070334 · WhatsApp +201065786620',

    'company.name': 'EGY PACK',
    'company.exp': 'Industrial Stretch Film Manufacturing, Cutting &amp; Trading — more than 15 years of experience.',
    'company.years': 'Years of experience',
    'company.products': 'Products',
    'company.weights': 'kg weight range',
    'cat.view': 'View in 3D &amp; calculate weight',
    'wa.label': 'Chat with us on WhatsApp',

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


    'hero.eyebrow': 'Industrial Stretch Film Manufacturing',
    'hero.title': 'Engineered to <span class="text-cyan">Hold</span><br />\n          the World Together',
    'hero.alt': 'إيجي باك — للاستريتش الصناعي',
    'hero.lead': 'EGY PACK: industrial stretch film manufacturing, cutting &amp; trading,\n          with more than 15 years of experience.',
    'hero.ctaProducts': 'Explore Products',
    'hero.ctaQuote': 'Request a Quote',
    'hero.scroll': 'Scroll down',

    'about.eyebrow': 'About EGY PACK',
    'about.title': 'About <span class="text-silver">EGY PACK</span>',
    'about.body': 'EGY PACK specializes in industrial stretch film manufacturing, cutting and trading,\n            with more than 15 years of experience in the field.',
    'about.alt': 'مؤسسة إيجي باك للاسترتش الصناعي — تصنيع وتقطيع وتجارة الاسترتش الصناعي.',
    'about.cap1': '[Capability 1 — to be confirmed]',
    'about.cap2': '[Capability 2 — to be confirmed]',
    'about.cap3': '[Capability 3 — to be confirmed]',

    'products.eyebrow': 'Product Range',
    'products.title': 'Stretch Film <span class="text-cyan">Solutions</span>',
    'products.sub': 'Roll widths and weights per EGY PACK official data. Choose a product to view it in 3D and calculate the weight.',

    'studio.eyebrow': 'Smart Product Catalog',
    'studio.title': 'Explore the Roll from <span class="text-cyan">Every Angle</span>',
    'studio.canvasLabel': '3D model of a stretch-film roll that you can rotate and zoom',
    'studio.loading': 'Loading the 3D view…',
    'studio.fallback': 'The 3D view is not supported on this device. You can still choose a product, calculate the weight and request a quote.',
    'studio.illustrative': 'Illustrative model',
    'studio.hint': 'Drag to rotate · Scroll or pinch to zoom',
    'studio.tools': 'View tools',
    'studio.rotateLeft': 'Rotate left',
    'studio.rotateRight': 'Rotate right',
    'studio.zoomIn': 'Zoom in',
    'studio.zoomOut': 'Zoom out',
    'studio.reset': 'Reset view',
    'studio.choose': 'Choose a product',
    'studio.note': 'The 3D models are illustrative. The jumbo roll width has not been specified yet.',
    'spec.width': 'Width',
    'spec.weightRange': 'Weight range',
    'spec.notSpecified': 'Not specified',

    'cat.jumbo': 'Jumbo Stretch Film Roll',
    'cat.jumbo.desc': 'Large jumbo roll produced directly by the primary manufacturing machine.',
    'cat.r50': '50 cm Stretch Film Roll',
    'cat.r50.desc': 'Stretch film roll, 50 cm wide.',
    'cat.r30': '30 cm Stretch Film Roll',
    'cat.r30.desc': 'Stretch film roll, 30 cm wide.',
    'cat.r10': '10 cm Stretch Film Roll',
    'cat.r10.desc': 'Stretch film roll, 10 cm wide, fixed weight.',

    'unit.kg': 'kg',
    'unit.cm': 'cm',
    'calc.title': 'Weight Calculator &amp; Quotation',
    'calc.weight': 'Requested weight per roll (kg)',
    'calc.qty': 'Number of rolls',
    'calc.total': 'Estimated total weight',
    'calc.note': 'The entered weight is a requested weight, not confirmed stock availability. The calculation assumes it is the total weight of one roll.',
    'calc.name': 'Name (optional)',
    'calc.phone': 'Phone number (optional)',
    'calc.quote': 'Request a Quote via WhatsApp',
    'calc.range': 'Available range: {min} – {max} kg',
    'calc.fixed': 'Fixed weight: {w} kg',
    'calc.fixedTag': '(fixed)',
    'calc.errWeight': 'Enter a roll weight between {min} and {max} kg.',
    'calc.errQty': 'Enter a whole number of rolls (1 or more).',
    'calc.errPhone': 'The phone number is not valid.',
    'wa.c.title': 'Quotation request — EGY PACK',
    'wa.c.product': 'Product',
    'wa.c.width': 'Roll width',
    'wa.c.weight': 'Requested weight per roll',
    'wa.c.requested': '(requested; availability to be confirmed)',
    'wa.c.rolls': 'Number of rolls',
    'wa.c.total': 'Estimated total weight',
    'wa.c.name': 'Name',
    'wa.c.phone': 'Phone',

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


    'ind.eyebrow': 'Industries We Serve',
    'ind.title': 'Industries <span class="text-cyan">We Serve</span>',
    'ind.cta': 'Request a quote for this industry',
    'ind.c1.title': 'Factories',
    'ind.c1.alt2': 'المصانع',
    'ind.c1.desc': 'Stretch-film wrapping solutions for industrial products and goods during storage and transport.',
    'ind.c1.alt': 'Illustrative image: factory warehouse with stretch-wrapped pallets and manufacturing equipment',
    'ind.c2.title': 'Traders &amp; Distributors',
    'ind.c2.alt2': 'التجار والموزعون',
    'ind.c2.desc': 'Stretch-film rolls in a range of sizes and weights to meet the needs of traders and distributors.',
    'ind.c2.alt': 'Illustrative image: stretch-film rolls and a stretch-wrapped carton pallet in a warehouse',
    'ind.c3.title': 'Shipping &amp; Logistics',
    'ind.c3.alt2': 'شركات الشحن والنقل',
    'ind.c3.desc': 'Wrapping solutions that help secure and protect goods during transport and storage.',
    'ind.c3.alt': 'Illustrative image: loading dock with a truck and wrapped pallets',

    'mfg.eyebrow': 'Manufacturing Process',
    'mfg.title': 'From Raw Materials <span class="text-cyan">to Finished Products</span>',
    'mfg.s1.title': 'Raw Materials',
    'mfg.s1.alt2': 'الخامات',
    'mfg.s1.desc': 'Production begins by preparing the plastic raw materials used to make industrial stretch film.',
    'mfg.s1.alt': 'Illustrative image: plastic resin pellets in a worker’s hands',
    'mfg.s2.title': 'Film Production',
    'mfg.s2.alt2': 'مرحلة التصنيع',
    'mfg.s2.desc': 'The raw materials enter the primary manufacturing machine to produce industrial stretch film.',
    'mfg.s2.alt': 'Illustrative image: stretch-film production line with a film roll',
    'mfg.s3.title': 'Jumbo Roll Production',
    'mfg.s3.alt2': 'بكرة جامبو',
    'mfg.s3.desc': 'The produced film is collected on jumbo rolls weighing 30 to 40 kg.',
    'mfg.s3.alt': 'Illustrative image: large stretch-film jumbo roll',
    'mfg.s4.title': 'Slitting &amp; Rewinding',
    'mfg.s4.alt2': 'التقطيع وإعادة اللف',
    'mfg.s4.desc': 'Jumbo rolls are slit and rewound to obtain the required widths and weights.',
    'mfg.s4.alt': 'Illustrative image: stretch-film slitting and rewinding machine',
    'mfg.s5.title': 'Finished Products',
    'mfg.s5.alt2': 'المنتجات النهائية',
    'mfg.s5.desc': 'Stretch-film rolls are prepared in their different sizes and weights to meet customer orders.',
    'mfg.s5.alt': 'Illustrative image: finished stretch-film rolls stacked on pallets',
    'media.illustrative': 'Illustrative image',
    'media.note': 'These are temporary illustrative images. They do not show the actual EGY PACK factory and will be replaced with factory photos.',

    'contact.eyebrow': 'Contact',
    'contact.title': 'Let\'s Wrap <span class="text-cyan">Your Next Load</span>',
    'contact.body': 'Tell us about your wrapping requirements and we will get back to you.',
    'contact.phone': 'Phone',
    'contact.whatsappLabel': 'WhatsApp',
    'contact.emailLabel': 'Email',
    'contact.call': 'Call Now',
    'contact.whatsapp': 'Message Us on WhatsApp',
    'contact.email': 'Send an Email',
    'contact.alt': 'تواصل معنا للحصول على عرض سعر',

    'form.name': 'Customer name',
    'form.company': 'Company name (optional)',
    'form.industry': 'Business type (optional)',
    'form.industryNone': '— Select business type —',
    'wa.q.industry': 'Business type',
    'form.phone': 'Phone number',
    'form.product': 'Product type',
    'form.qty': 'Quantity',
    'form.qtyPh': 'e.g. 50 rolls',
    'form.message': 'Additional notes (optional)',
    'form.submit': 'Send Request via WhatsApp',
    'form.hint': 'WhatsApp opens with a ready message containing your details, for you to review and send yourself.',
    'form.error': 'Please enter your name, a valid phone number and the quantity.',
    'form.opened': 'WhatsApp has opened with your request. To send it, press Send inside WhatsApp.',
    'form.fallback': 'If WhatsApp did not open, use this link:',
    'form.fallbackLink': 'Open WhatsApp with your request',
    'wa.q.title': 'Quotation request — EGY PACK',
    'wa.q.name': 'Name',
    'wa.q.company': 'Company',
    'wa.q.phone': 'Phone',
    'wa.q.product': 'Product',
    'wa.q.qty': 'Quantity',
    'wa.q.notes': 'Notes',

    'footer.tagline': 'EGY PACK — Industrial Stretch Film Manufacturing, Cutting &amp; Trading',
    'footer.alt': 'مؤسسة إيجي باك للاسترتش الصناعي',
    'footer.facebook': 'Our Facebook page',
    'footer.label': 'Footer',
    'footer.contact': 'Contact',
    'footer.rights': 'EGY PACK. All rights reserved.'
  };

  // Arabic strings that only exist in script (not in the page markup)
  var ar = {
    'meta.title': document.title,
    'meta.description': '',
    'form.error': 'يرجى إدخال الاسم ورقم هاتف صحيح والكمية.',
    'form.opened': 'تم فتح واتساب برسالة طلبك. لإرسالها اضغط زر الإرسال داخل واتساب.',
    'form.fallback': 'إذا لم يفتح واتساب، استخدم هذا الرابط:',
    'form.fallbackLink': 'افتح واتساب برسالة طلبك',
    'wa.q.title': 'طلب عرض سعر — إيجي باك',
    'wa.q.name': 'الاسم',
    'wa.q.company': 'الشركة',
    'wa.q.phone': 'الهاتف',
    'wa.q.product': 'المنتج',
    'wa.q.qty': 'الكمية',
    'wa.q.notes': 'ملاحظات',
    'wa.q.industry': 'نوع النشاط',
    'spec.notSpecified': 'غير محدد',
    'cat.r50.desc': 'بكرة استريتش بعرض 50 سم.',
    'cat.r30.desc': 'بكرة استريتش بعرض 30 سم.',
    'cat.r10.desc': 'بكرة استريتش بعرض 10 سم، بوزن ثابت.',
    'unit.kg': 'كجم',
    'unit.cm': 'سم',
    'calc.range': 'النطاق المتاح: {min} – {max} كجم',
    'calc.fixed': 'وزن ثابت: {w} كجم',
    'calc.fixedTag': '(ثابت)',
    'calc.errWeight': 'أدخل وزنًا للبكرة بين {min} و{max} كجم.',
    'calc.errQty': 'أدخل عددًا صحيحًا من البكرات (1 أو أكثر).',
    'calc.errPhone': 'رقم الهاتف غير صحيح.',
    'wa.c.title': 'طلب عرض سعر — إيجي باك',
    'wa.c.product': 'المنتج',
    'wa.c.width': 'عرض البكرة',
    'wa.c.weight': 'الوزن المطلوب للبكرة',
    'wa.c.requested': '(وزن مطلوب، والتوفر يتم تأكيده)',
    'wa.c.rolls': 'عدد البكرات',
    'wa.c.total': 'الوزن الإجمالي التقديري',
    'wa.c.name': 'الاسم',
    'wa.c.phone': 'الهاتف'
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
