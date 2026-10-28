# Muhammad Abdullah (virkabd): 3D Glass Portfolio

Static site. Run it with a local server so ES modules load:

    cd portfolio && python3 -m http.server 8000   # open http://localhost:8000

- `index.html`: page markup
- `css/style.css`: glassmorphism styles, responsive layout
- `js/data.js`: all content, pulled from behance.net/virkabd (127 projects, tools, fields, services, links)
- `js/main.js`: renders sections, filters, search, card tilt, reveal animations
- `js/scene.js`: Three.js hero (transmission glass objects, mouse/gyro parallax, pauses offscreen, falls back to CSS when WebGL is missing)
- `js/vendor/`: Three.js r160, vendored so the 3D scene works offline
- `assets/`: avatar, banner, and project covers (WebP, 720px)

## Shop section (3D printable assets)
- `js/shop-data.js` – 172 models collected from Cults3D (Arcane3Ds) and Thangs (Lightdesignstudio); prices as listed in USD. Cults3D sale prices show only until the sale end date stored with the listing.
- `js/shop.js` – renders the glass cards, store/category filters, search and load-more.
- `assets/shop/*.webp` – original white-PLA renders with transparent backgrounds (no store photos are used).

## Shop-first view + portfolio toggle

- The site opens on the **Shop** by default. The glass pill toggle in the nav switches to the **Portfolio**
  (About / Work / Skills / Services). Contact is shared by both views.
- Switching plays a full-page liquid wave sweep and a staggered 3D card flip (~900 ms). With
  `prefers-reduced-motion` it falls back to a short crossfade.
- Deep links: `/#portfolio`, `/?view=portfolio`, `/#about`, `/#work`, `/#skills`, `/#services` open the portfolio.
  A plain `/` always opens the shop. The browser Back button returns to the previous view.
- The logic is in `js/view.js`. The view classes `.v-shop` / `.v-portfolio` are in `css/style.css`.

## Shop theme (light) + hero image

- The shop view uses a white/pearl theme with frosted white glass (all `html[data-view="shop"]` overrides at the end of
  `css/style.css`). The portfolio keeps the dark theme. The page wave takes the destination theme's colours, so the
  light/dark swap happens under the wave.
- Shop hero image: `assets/hero-shop.webp` (1280×720, desktop/tablet) and `assets/hero-shop-mobile.webp` (930×640 crop, ≤760px),
  served through `<picture>`. It's an AI-generated CGI render. The edges are feathered with a CSS mask and multiplied into the page background.
- The WebGL glass scene only shows (and only renders) in the portfolio view.

## Loading screen + performance

- **Loading screen:** a frosted-glass card with a progress ring and "Virk.3D". It uses inline critical CSS and JS in `<head>`, so it paints before anything else, and it is dark in the portfolio view.
  It hides once the web fonts, the hero image and the first row of product images are ready, with a hard cap of 2.5 s. On a fast connection that takes about 0.3 s. With reduced motion it uses a static ring and a quick fade.
- **Three.js:** `js/scene.js` is no longer loaded up front.
  - `view.js` imports it only when the portfolio view is shown: after the switch animation, or when the page is idle on a `#portfolio` deep link.
  - Hovering or focusing the toggle only *downloads* it (modulepreload).
  - The scene doesn't render while the shop is showing.
- **Scripts:** all are `defer`.
- **Fonts:** Google Fonts loads without blocking render, trimmed to the weights in use. Metric-matched fallback fonts avoid layout shift when the web fonts swap in.
- **Images:**
  - Product images have 360px variants (`assets/shop/pNNN-360.webp`) served with `srcset`/`sizes`; the first row loads eagerly at low priority and the rest lazily.
  - The avatar is now a 64/144px WebP.
  - Every image has width/height set to prevent layout shift.
- **Rendering:**
  - Live `backdrop-filter` blur stays only on the nav and the hero card. Grid cards, toolbars and the contact panel use semi-opaque glass instead.
  - Below 1100px or on touch screens, only the nav keeps its blur.
  - Background glows are static, and the product images no longer float continuously.
  - The status-dot pulse uses transform/opacity.
  - There are no permanent `will-change` layers.
