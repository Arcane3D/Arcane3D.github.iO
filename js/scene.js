import * as THREE from 'three';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

const canvas = document.getElementById('scene');
const hero = document.getElementById('hero');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

function fail(){ document.documentElement.classList.add('no-webgl'); canvas.style.display='none'; }

let renderer;
try {
  const test = document.createElement('canvas');
  if (!(test.getContext('webgl2') || test.getContext('webgl'))) throw new Error('no webgl');
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
} catch (e) { fail(); }

if (renderer) init();

function init(){
  const isMobile = () => innerWidth < 760;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, isMobile() ? 1.5 : 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(3, 4, 5); scene.add(key);
  const rim1 = new THREE.PointLight(0x7c5cff, 40, 20); rim1.position.set(-4, 2, 2); scene.add(rim1);
  const rim2 = new THREE.PointLight(0x22d3ee, 35, 20); rim2.position.set(4, -3, 2); scene.add(rim2);

  // Colourful backdrop that the glass refracts
  const backdrop = new THREE.Group(); scene.add(backdrop);
  const orbCols = [0x7c5cff, 0x22d3ee, 0xff5fa2, 0xffb35c, 0x5b8cff];
  const orbs = [];
  orbCols.forEach((c, i) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.5 + (i % 3) * 0.25, 32, 32),
      new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.9 }));
    const a = (i / orbCols.length) * Math.PI * 2;
    m.position.set(Math.cos(a) * 2.6, Math.sin(a) * 1.8, -3.5 - (i % 2));
    m.userData = { a, r: 2.2 + (i % 2) * 0.8, s: 0.15 + i * 0.03 };
    backdrop.add(m); orbs.push(m);
  });

  // Glass material
  const glass = (tint = 0xffffff, ior = 1.5, irid = 0.6) => new THREE.MeshPhysicalMaterial({
    color: tint, metalness: 0, roughness: 0.05, transmission: 1, thickness: 1.2, ior,
    iridescence: irid, iridescenceIOR: 1.3, iridescenceThicknessRange: [100, 600],
    clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.3, specularIntensity: 1,
    attenuationColor: new THREE.Color(tint), attenuationDistance: 3,
  });

  const seg = isMobile() ? 0.6 : 1;
  const group = new THREE.Group(); scene.add(group);
  const items = [
    { g: new THREE.TorusKnotGeometry(0.95, 0.32, Math.round(220 * seg), Math.round(36 * seg)), m: glass(0xf2eeff, 1.5, 0.8), p: [0, 0.1, 0], s: 1.15 },
    { g: new THREE.IcosahedronGeometry(0.75, 0), m: glass(0xe0fbff, 1.6, 0.4), p: [-2.1, 1.35, -0.6], s: 1 },
    { g: new THREE.TorusGeometry(0.55, 0.2, 32, Math.round(96 * seg)), m: glass(0xffe6f2, 1.45, 0.7), p: [2.0, -1.3, 0.4], s: 1 },
    { g: new THREE.OctahedronGeometry(0.5, 0), m: glass(0xfff3e0, 1.6, 0.3), p: [2.1, 1.5, -1], s: 1 },
    { g: new THREE.SphereGeometry(0.42, 48, 48), m: glass(0xeef2ff, 1.33, 1), p: [-1.9, -1.45, 0.6], s: 1 },
    { g: new THREE.CapsuleGeometry(0.22, 0.7, 12, 24), m: glass(0xe9fff8, 1.5, 0.5), p: [0.2, -1.9, 1.2], s: 1 },
  ];
  const meshes = items.map((it, i) => {
    const mesh = new THREE.Mesh(it.g, it.m);
    mesh.position.set(...it.p); mesh.scale.setScalar(it.s);
    mesh.rotation.set(Math.random() * 3, Math.random() * 3, 0);
    mesh.userData = { base: new THREE.Vector3(...it.p), sp: 0.25 + Math.random() * 0.35, ph: Math.random() * 6.28, rs: (Math.random() - .5) * 0.6 };
    group.add(mesh); return mesh;
  });

  // Sparkle particles
  const N = isMobile() ? 120 : 260, pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { pos[i*3] = (Math.random()-.5)*14; pos[i*3+1] = (Math.random()-.5)*9; pos[i*3+2] = (Math.random()-.5)*6 - 1; }
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.03, color: 0xcfd6ff, transparent: true, opacity: 0.7, depthWrite: false }));
  scene.add(pts);

  // Layout: objects on the right on wide screens, centred & smaller on narrow
  function layout(){
    const w = hero.clientWidth, h = hero.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    if (w < 760) { const half = 9 * Math.tan(THREE.MathUtils.degToRad(20)), y = half * (1 - 2 * 175 / h); group.position.set(0, y, 0); group.scale.setScalar(0.5); backdrop.position.set(0, y, -1); }
    else if (w < 960) { group.position.set(1.6, 1.6, 0); group.scale.setScalar(0.7); backdrop.position.set(1.4, 1.4, 0); }
    else { group.position.set(2.4, 0.15, 0); group.scale.setScalar(1); backdrop.position.set(2.4, 0, 0); }
  }
  layout();
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(layout, 120); });

  // Interaction
  const mouse = new THREE.Vector2(), target = new THREE.Vector2();
  addEventListener('pointermove', e => { target.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight * 2 - 1)); }, { passive: true });
  if (window.DeviceOrientationEvent && matchMedia('(pointer:coarse)').matches) {
    addEventListener('deviceorientation', e => { if (e.gamma != null) target.set(THREE.MathUtils.clamp(e.gamma / 30, -1, 1), THREE.MathUtils.clamp((e.beta - 45) / 30, -1, 1)); }, { passive: true });
  }
  let scrollK = 0;
  addEventListener('scroll', () => { scrollK = Math.min(1, scrollY / (hero.clientHeight || 1)); }, { passive: true });

  // Only render while visible
  let visible = true, running = false;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); }, { threshold: 0 }).observe(hero);
  // canvas is hidden in the shop view: pause there, resume (and re-measure) when the portfolio shows
  new MutationObserver(() => { if (document.documentElement.dataset.view !== 'shop') { layout(); start(); } }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-view'] });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) start(); });

  const clock = new THREE.Clock();
  function frame(){
    if (!visible || document.hidden || document.documentElement.dataset.view === 'shop') { running = false; return; }
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime * (reduce ? 0.15 : 1);
    mouse.lerp(target, 0.06);
    meshes.forEach((m, i) => {
      const u = m.userData;
      m.rotation.x += dt * u.sp * 0.6; m.rotation.y += dt * (u.sp + u.rs);
      m.position.y = u.base.y + Math.sin(t * 0.8 + u.ph) * 0.18;
      m.position.x = u.base.x + Math.cos(t * 0.6 + u.ph) * 0.08 + mouse.x * 0.15 * (i % 2 ? 1 : -1);
    });
    orbs.forEach(o => { const u = o.userData; const a = u.a + t * u.s; o.position.x = Math.cos(a) * u.r; o.position.y = Math.sin(a * 1.3) * 1.6; });
    group.rotation.y = mouse.x * 0.35 + scrollK * 0.8;
    group.rotation.x = -mouse.y * 0.25 + scrollK * 0.3;
    pts.rotation.y = t * 0.02 + mouse.x * 0.05;
    camera.position.x = mouse.x * 0.4; camera.position.y = mouse.y * 0.3 - scrollK * 1.2;
    camera.lookAt(0, -scrollK * 0.8, 0);
    renderer.render(scene, camera);
  }
  function start(){ if (!running) { running = true; clock.getDelta(); frame(); } }
  start();
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); fail(); });
}
