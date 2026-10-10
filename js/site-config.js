/* EGY PACK — official company & contact configuration (single source of truth).
   Values below come from the company's official Facebook page details. */
window.EGY_CONFIG = {
  companyName: { ar: 'مؤسسة إيجي باك للاسترتش الصناعي', en: 'EGY PACK' },
  description: {
    ar: 'تصنيع وتقطيع وتجارة الاسترتش الصناعي.',
    en: 'Industrial Stretch Film Manufacturing, Cutting & Trading.'
  },

  phone: { display: '01003070334', international: '+201003070334', href: 'tel:+201003070334' },
  whatsapp: { display: '+201065786620', number: '201065786620' },   // wa.me needs digits only
  email: 'egypack2014@gmail.com',

  whatsappGreeting: {
    ar: 'مرحبًا، أريد الاستفسار عن منتجات الاسترتش الصناعي لدى إيجي باك.',
    en: 'Hello, I would like to inquire about EGY PACK industrial stretch film products.'
  },

  /* CONFIGURATION PLACEHOLDER — official Facebook page URL.
     Leave empty until the exact URL is confirmed; the footer link only appears once this is set.
     Example: 'https://www.facebook.com/<official-page>' */
  facebookUrl: ''
};

/* Builds a wa.me link with a correctly encoded prefilled message */
window.EGY_CONFIG.whatsappLink = function (text) {
  return 'https://wa.me/' + window.EGY_CONFIG.whatsapp.number + (text ? '?text=' + encodeURIComponent(text) : '');
};
