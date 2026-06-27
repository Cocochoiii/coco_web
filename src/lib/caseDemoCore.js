/* ============================================================
   caseDemoCore.js — shared plumbing for the per-case 3D demos.
   Renderer + camera + RAF loop + off-screen/tab pausing + resize +
   reduced-motion + disposal, PLUS shared "feel" upgrades:
   bloom (dynamic import, safe), ACES tone-mapping, fog, springs, comet
   trails, and a rich orbit (inertia · idle spin · parallax · breathing ·
   double-click reset · scroll-velocity kick · spin-to-front).
   ============================================================ */
import * as THREE from 'three';

export function makeStage(canvas, opts = {}) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.85));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = opts.exposure != null ? opts.exposure : 1.18;

  const scene = new THREE.Scene();
  if (opts.fog !== 0) scene.fog = new THREE.FogExp2(0x0c0a12, opts.fog != null ? opts.fog : 0.05);
  const camera = new THREE.PerspectiveCamera(opts.fov || 45, 1, 0.1, 200);

  let cw = 800, ch = 600, rafId = 0, destroyed = false, visible = true;
  let frameCb = null, resizeCb = null;

  // bloom — wanted on desktop only; loaded async so a failure never breaks the demo
  const bloomWanted = !reduce && (window.innerWidth > 640) && opts.bloom !== false;
  let composer = null, bloomPass = null, bloomOn = false;
  if (bloomWanted) {
    renderer.setClearColor(0x0c0a12, 1);   // opaque dark so bloom composites cleanly (edges masked in CSS)
    Promise.all([
      import('three/examples/jsm/postprocessing/EffectComposer.js'),
      import('three/examples/jsm/postprocessing/RenderPass.js'),
      import('three/examples/jsm/postprocessing/UnrealBloomPass.js'),
    ]).then(function (mods) {
      if (destroyed) return;
      const EffectComposer = mods[0].EffectComposer, RenderPass = mods[1].RenderPass, UnrealBloomPass = mods[2].UnrealBloomPass;
      composer = new EffectComposer(renderer);
      composer.setPixelRatio(renderer.getPixelRatio());
      composer.addPass(new RenderPass(scene, camera));
      bloomPass = new UnrealBloomPass(new THREE.Vector2(cw, ch),
        opts.bloomStrength != null ? opts.bloomStrength : 0.72,
        opts.bloomRadius != null ? opts.bloomRadius : 0.5,
        opts.bloomThreshold != null ? opts.bloomThreshold : 0.16);
      composer.addPass(bloomPass);
      composer.setSize(cw, ch);
      bloomOn = true;
    }).catch(function () { bloomOn = false; });
  } else {
    renderer.setClearColor(0x000000, 0);
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    cw = r.width || 800; ch = r.height || 600;
    renderer.setSize(cw, ch, false);
    camera.aspect = cw / ch; camera.updateProjectionMatrix();
    if (composer) composer.setSize(cw, ch);
    if (bloomPass) bloomPass.resolution.set(cw, ch);
    if (resizeCb) resizeCb(cw, ch);
  }
  function loop() {
    if (destroyed) return;
    if (frameCb) frameCb(performance.now());
    if (bloomOn && composer) composer.render(); else renderer.render(scene, camera);
    rafId = 0;
    if (visible && !destroyed && !document.hidden) rafId = requestAnimationFrame(loop);
  }
  function start() { if (rafId || destroyed || !visible || document.hidden) return; rafId = requestAnimationFrame(loop); }
  function stop() { if (rafId) { cancelAnimationFrame(rafId); rafId = 0; } }

  const onResize = () => resize();
  const onVis = () => { if (document.hidden) stop(); else start(); };
  window.addEventListener('resize', onResize);
  document.addEventListener('visibilitychange', onVis);

  let io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver((es) => {
      const v = es.some((e) => e.isIntersecting);
      if (v === visible) return;
      visible = v;
      if (v) { resize(); start(); } else stop();
    }, { rootMargin: '160px 0px' });
    io.observe(canvas);
  }
  let ro = null;
  if ('ResizeObserver' in window) {
    ro = new ResizeObserver(() => { if (!destroyed) resize(); });
    ro.observe(canvas);
  }

  return {
    THREE, renderer, scene, camera, reduce,
    get width() { return cw; },
    get height() { return ch; },
    onFrame(cb) { frameCb = cb; },
    onResize(cb) { resizeCb = cb; },
    begin() { resize(); start(); setTimeout(resize, 300); },
    destroy() {
      destroyed = true; stop();
      if (io) io.disconnect();
      if (ro) ro.disconnect();
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
      try { if (bloomPass) bloomPass.dispose(); } catch (e) { /* noop */ }
      try { if (composer) composer.dispose(); } catch (e) { /* noop */ }
      try { renderer.dispose(); } catch (e) { /* noop */ }
    },
  };
}

/* a soft round sprite texture (shared glow dot) */
export function discTexture() {
  const s = 64, cv = document.createElement('canvas'); cv.width = cv.height = s;
  const x = cv.getContext('2d');
  const g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.45, 'rgba(255,255,255,.55)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.beginPath(); x.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2); x.fill();
  return new THREE.CanvasTexture(cv);
}

/* fibonacci-sphere unit points */
export function fibSphere(n) {
  const pts = [], gold = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), th = gold * i;
    pts.push(new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r));
  }
  return pts;
}

/* tiny critically-damped-ish spring (slight overshoot -> things feel alive) */
export function makeSpring(value, opts = {}) {
  const k = opts.k != null ? opts.k : 0.16;
  const damp = opts.damp != null ? opts.damp : 0.74;
  let v = value, vel = 0, target = value;
  return {
    get value() { return v; },
    set(x) { v = x; vel = 0; target = x; },
    to(x) { target = x; },
    step() { vel += (target - v) * k; vel *= damp; v += vel; return v; },
  };
}

/* comet trails: ONE Points cloud holding `count` trails of length `len`.
   Per item: setColor(i,color) once, reset(i,x,y,z) on teleport, push(i,x,y,z)
   each frame, then flush() once. Head is brightest -> reads as a comet. */
export function makeTrail(group, opts = {}) {
  const count = opts.count, len = opts.len != null ? opts.len : 6;
  const tex = opts.tex || discTexture();
  const ownTex = !opts.tex;
  const pos = new Float32Array(count * len * 3);
  const col = new Float32Array(count * len * 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({ map: tex, size: opts.size != null ? opts.size : 0.12, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
  const points = new THREE.Points(geo, mat); points.frustumCulled = false; group.add(points);
  const tc = new THREE.Color();
  function setColor(i, color, gain) {
    tc.copy(color); const g0 = gain != null ? gain : 1;
    for (let k = 0; k < len; k++) {
      const f = Math.pow(1 - k / len, 1.5) * g0, b = (i * len + k) * 3;
      col[b] = tc.r * f; col[b + 1] = tc.g * f; col[b + 2] = tc.b * f;
    }
    geo.attributes.color.needsUpdate = true;
  }
  function reset(i, x, y, z) { const base = i * len; for (let k = 0; k < len; k++) { const b = (base + k) * 3; pos[b] = x; pos[b + 1] = y; pos[b + 2] = z; } }
  function push(i, x, y, z) {
    const base = i * len;
    for (let k = len - 1; k > 0; k--) { const d = (base + k) * 3, s = (base + k - 1) * 3; pos[d] = pos[s]; pos[d + 1] = pos[s + 1]; pos[d + 2] = pos[s + 2]; }
    const h = base * 3; pos[h] = x; pos[h + 1] = y; pos[h + 2] = z;
  }
  function flush() { geo.attributes.position.needsUpdate = true; }
  function dispose() { geo.dispose(); mat.dispose(); if (ownTex) tex.dispose(); }
  return { points, mat, setColor, reset, push, flush, dispose };
}

/* rich orbit: drag (mouse only) with inertia + idle spin + cursor parallax +
   breathing + double-click reset + scroll-velocity kick + spinTo(yaw).
   onTap fires on a click that wasn't a drag. canStartDrag(e) can veto a drag
   (used so other handlers — e.g. dragging an object — can take over). */
export function makeOrbit(canvas, opts = {}) {
  const idle = opts.idle || 0;
  const clampX = opts.clampX != null ? opts.clampX : 0.95;
  const restX = opts.restX || 0;
  const parallax = opts.parallax != null ? opts.parallax : 0.1;
  const breathe = opts.breathe != null ? opts.breathe : 0.012;
  const breatheSpeed = opts.breatheSpeed != null ? opts.breatheSpeed : 0.0009;
  const scrollSpin = opts.scrollSpin != null ? opts.scrollSpin : 0.00008;
  const canStart = opts.canStartDrag || null;

  let dragging = false, lastX = 0, lastY = 0, moved = 0;
  let rotY = opts.y0 || 0, rotX = (opts.x0 != null ? opts.x0 : restX), vY = 0, vX = 0;
  let pmx = 0, pmy = 0, pxE = 0, pyE = 0;
  let spinTarget = null, lastScroll = window.scrollY || 0;
  let tapCb = null, resetCb = null;
  const isMouse = (e) => !e.pointerType || e.pointerType === 'mouse';

  function down(e) {
    if (!isMouse(e)) return;
    if (canStart && !canStart(e)) return;
    dragging = true; moved = 0; lastX = e.clientX; lastY = e.clientY; vY = vX = 0; spinTarget = null;
    canvas.style.cursor = 'grabbing';
  }
  function move(e) {
    if (!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    rotY += dx * 0.006; rotX += dy * 0.006;
    rotX = Math.max(-clampX, Math.min(clampX, rotX));
    vY = dx * 0.006; vX = dy * 0.006;
    moved += Math.abs(dx) + Math.abs(dy);
    lastX = e.clientX; lastY = e.clientY;
  }
  function up(e) {
    if (!dragging) return; dragging = false; canvas.style.cursor = '';
    if (moved < 6 && tapCb && isMouse(e)) tapCb(e);
  }
  function hover(e) { const r = canvas.getBoundingClientRect(); pmx = ((e.clientX - r.left) / r.width) * 2 - 1; pmy = ((e.clientY - r.top) / r.height) * 2 - 1; }
  function leave() { pmx = 0; pmy = 0; }
  function dbl() { vX = 0; vY = 0; spinTarget = null; rotX = restX; if (resetCb) resetCb(); }
  function onScroll() {
    const y = window.scrollY || 0, dy = y - lastScroll; lastScroll = y;
    vY += Math.max(-0.05, Math.min(0.05, dy * scrollSpin));
  }
  canvas.addEventListener('pointerdown', down);
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
  canvas.addEventListener('mousemove', hover);
  canvas.addEventListener('mouseleave', leave);
  canvas.addEventListener('dblclick', dbl);
  window.addEventListener('scroll', onScroll, { passive: true });

  return {
    get dragging() { return dragging; },
    onTap(cb) { tapCb = cb; },
    onReset(cb) { resetCb = cb; },
    spinTo(yaw) { spinTarget = yaw; },
    apply(group, now) {
      const t = now != null ? now : performance.now();
      if (!dragging) {
        rotY += vY; vY *= 0.94;
        rotX += vX; vX *= 0.9;
        rotX += (restX - rotX) * 0.04;
        if (spinTarget != null) {
          let d = spinTarget - rotY; d = Math.atan2(Math.sin(d), Math.cos(d));
          rotY += d * 0.08; if (Math.abs(d) < 0.01) spinTarget = null;
        } else { rotY += idle; }
      }
      pxE += ((dragging ? 0 : pmx * parallax) - pxE) * 0.06;
      pyE += ((dragging ? 0 : pmy * parallax) - pyE) * 0.06;
      group.rotation.y = rotY + pxE;
      group.rotation.x = Math.max(-1.25, Math.min(1.25, rotX + pyE));
      const b = 1 + breathe * Math.sin(t * breatheSpeed);
      group.scale.setScalar(b);
    },
    destroy() {
      canvas.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      canvas.removeEventListener('mousemove', hover);
      canvas.removeEventListener('mouseleave', leave);
      canvas.removeEventListener('dblclick', dbl);
      window.removeEventListener('scroll', onScroll);
    },
  };
}

/* raycast helper: pick(objects, mouseEvent) -> first intersection or null.
   pointsThreshold widens hits for Points clouds (RAG doc hover). */
export function makePicker(canvas, camera, pointsThreshold) {
  const ray = new THREE.Raycaster();
  if (pointsThreshold != null) ray.params.Points.threshold = pointsThreshold;
  const v = new THREE.Vector2();
  function setRay(e) {
    const r = canvas.getBoundingClientRect();
    v.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    v.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    ray.setFromCamera(v, camera);
  }
  const fn = function (objects, e) { setRay(e); const hits = ray.intersectObjects(objects, false); return hits.length ? hits[0] : null; };
  fn.ray = ray; fn.setRay = setRay;
  return fn;
}

/* stroked-ring sprite texture (expanding shockwave / radar / halo rings) */
export function ringTexture() {
  const s = 128, cv = document.createElement('canvas'); cv.width = cv.height = s;
  const x = cv.getContext('2d');
  x.strokeStyle = 'rgba(255,255,255,1)'; x.lineWidth = 6;
  x.beginPath(); x.arc(s / 2, s / 2, s / 2 - 9, 0, Math.PI * 2); x.stroke();
  return new THREE.CanvasTexture(cv);
}
