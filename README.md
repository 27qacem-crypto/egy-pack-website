# egy-pack-website
Official EGY PACK 3D Industrial Website — إيجي باك للاستريتش الصناعي

## Structure
- `index.html` — single-page site (hero, about, products, technology, industries, contact)
- `css/style.css` — brand styles (Deep Navy, White, Metallic Silver, Electric Cyan)
- `js/i18n.js` — Arabic-first content with an English switch (remembers the visitor's choice; `?lang=en` opens English)
- `js/main.js` — loader, navigation, scroll reveals, counters, card tilt, contact form validation
- `js/hero3d.js` — Three.js hero: rotating 3D stretch-film roll with cinematic lighting
- `assets/images/logo.png` — official EGY PACK logo (unaltered)
- `favicon.ico` — official app icon (also at `assets/images/app_icon.ico`)

## Run locally
Serve the folder with any static server, e.g. `python3 -m http.server 8080`, then open http://localhost:8080.
Three.js is loaded from the jsDelivr CDN via an import map.
If WebGL is unavailable, the hero falls back to a static gradient.
