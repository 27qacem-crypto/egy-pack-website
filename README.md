# egy-pack-website
Official EGY PACK 3D Industrial Website — إيجي باك للاستريتش الصناعي

## Structure
- `index.html` — single-page site (hero, about, products, technology, industries, contact)
- `css/style.css` — brand styles (Deep Navy, White, Metallic Silver, Electric Cyan)
- `js/site-config.js` — **official company & contact details** (phone, WhatsApp, email, messages) and the Facebook URL placeholder
- `js/i18n.js` — Arabic-first content with an English switch (remembers the visitor's choice; `?lang=en` opens English)
- `js/main.js` — loader, navigation, scroll reveals, counters, card tilt, contact form validation
- `js/hero3d.js` — Three.js hero: rotating 3D stretch-film roll with cinematic lighting
- `js/experiences.js` — product catalog UI (selection, weight calculator, WhatsApp quote) and wrapping section UI; detects WebGL and lazy-loads the two scenes below
- `js/studio3d.js` — Smart Product Catalog 3D view (orbit, zoom, reset, auto-framing per product, product switching)
- `js/wrap3d.js` — scroll-driven pallet wrapping scene ("Experience the Protection")
- `js/three-utils.js` — shared helpers for the two new scenes (roll builder, textures, disposal)
- `js/product-data.js` — **official product data** (4 rolls: widths and weight ranges only; add other specs only once confirmed)
- `vendor/three/` — Three.js r160 served locally (no CDN), with only the add-ons the site uses
- `assets/images/logo.png` — official EGY PACK logo (unaltered)
- `favicon.ico` — official app icon (also at `assets/images/app_icon.ico`)

## Run locally
Serve the folder with any static server, e.g. `python3 -m http.server 8080`, then open http://localhost:8080.
Three.js is served locally from `vendor/three/` via an import map.
If WebGL is unavailable, the hero falls back to a static gradient, and the Product Studio and wrapping section show static illustrations.

## Illustrative images (temporary)
`assets/images/process/` (5 manufacturing stages) and `assets/images/industries/` (3 industries) hold
**temporary illustrative 3D renders**, labelled on the site as "صورة توضيحية / Illustrative image".
They are not photographs of the EGY PACK factory. To use real photos, replace each file with a photo
of the same name (WebP, about 960×640, 3:2), and remove the label and note once all are real.
