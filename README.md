# egy-pack-website
Official EGY PACK 3D Industrial Website — إيجي باك للاستريتش الصناعي

## Structure
- `index.html` — single-page site (hero, about, products, technology, industries, contact)
- `css/style.css` — brand styles (Deep Navy, White, Metallic Silver, Electric Cyan)
- `js/i18n.js` — Arabic-first content with an English switch (remembers the visitor's choice; `?lang=en` opens English)
- `js/main.js` — loader, navigation, scroll reveals, counters, card tilt, contact form validation
- `js/hero3d.js` — Three.js hero: rotating 3D stretch-film roll with cinematic lighting
- `js/experiences.js` — wires the Product Studio and wrapping section UI, detects WebGL, lazy-loads the two scenes below
- `js/studio3d.js` — interactive 3D Product Studio (orbit, zoom, reset, product switching)
- `js/wrap3d.js` — scroll-driven pallet wrapping scene ("Experience the Protection")
- `js/three-utils.js` — shared helpers for the two new scenes (roll builder, textures, disposal)
- `js/product-data.js` — **editable product data**: replace the `null` spec values once confirmed
- `vendor/three/` — Three.js r160 served locally (no CDN), with only the add-ons the site uses
- `assets/images/logo.png` — official EGY PACK logo (unaltered)
- `favicon.ico` — official app icon (also at `assets/images/app_icon.ico`)

## Run locally
Serve the folder with any static server, e.g. `python3 -m http.server 8080`, then open http://localhost:8080.
Three.js is served locally from `vendor/three/` via an import map.
If WebGL is unavailable, the hero falls back to a static gradient, and the Product Studio and wrapping section show static illustrations.
