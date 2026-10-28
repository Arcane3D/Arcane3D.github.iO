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
