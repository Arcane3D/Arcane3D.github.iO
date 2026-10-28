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
