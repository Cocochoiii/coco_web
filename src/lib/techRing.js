/* ============================================================
   techRing.js — a slowly self-rotating 3D ring of tech "chips"
   (Three.js r128, ES modules). Each chip is a billboarded sprite, so the
   text always faces the camera and stays crisp. Deliberately NO connecting
   lines — that node/edge motif belongs to the Tech Stack section only.

   Chips render the tech NAME now (zero assets). To swap in real icon SVGs
   later, replace chipTexture() with an image-texture loader that reads e.g.
   /public/tech/<name>.svg and falls back to the text chip when missing.

   The render loop pauses while off-screen or while the tab is hidden, and the
   whole scene is disposed on destroy() — same lifecycle as techNetwork.js.

   QUICK TUNABLES: RING_R, TILT, AUTO, camera z
   ============================================================ */
import * as THREE from 'three';

export function initTechRing(canvas, items) {
  if (!canvas) return { setScrollProgress() {}, destroy() {} };
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const list = (items || []).filter(Boolean);

  /* ===== TUNABLES ===== */
  const RING_R = 3.7;   // ring radius (the ring is now the whole Stack visual -> large)
  const TILT = -0.34;   // ring tilt (rad) so it reads as 3D, not a flat circle
  const AUTO = 0.0008;  // idle spin speed — kept slow so the Stack ring stays "background" vs the Impact coverflow

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  const maxAniso = renderer.capabilities && renderer.capabilities.getMaxAnisotropy
    ? renderer.capabilities.getMaxAnisotropy() : 1;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 100);
  camera.position.set(0, 0, 10.6);
  const group = new THREE.Group();
  group.rotation.x = TILT;
  scene.add(group);

  /* ---- chip texture: rounded pill + tech name (lavender on plum) ---- */
  function chipTexture(text) {
    const fs = 44, padX = 28, padY = 18;
    let cv = document.createElement('canvas');
    let x = cv.getContext('2d');
    const font = '500 ' + fs + "px 'IBM Plex Mono', ui-monospace, monospace";
    x.font = font;
    const tw = Math.ceil(x.measureText(text).width);
    const w = tw + padX * 2;
    const h = fs + padY * 2;
    cv.width = w; cv.height = h;
    x = cv.getContext('2d');
    const r = h / 2;
    x.beginPath();
    x.moveTo(r, 0);
    x.arcTo(w, 0, w, h, r);
    x.arcTo(w, h, 0, h, r);
    x.arcTo(0, h, 0, 0, r);
    x.arcTo(0, 0, w, 0, r);
    x.closePath();
    const g = x.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, 'rgba(31,24,48,0.94)');
    g.addColorStop(1, 'rgba(24,18,34,0.94)');
    x.fillStyle = g; x.fill();
    x.lineWidth = 2; x.strokeStyle = 'rgba(185,166,255,0.55)'; x.stroke();
    x.font = font; x.textBaseline = 'middle'; x.textAlign = 'center';
    x.fillStyle = '#EAE3F6';
    x.fillText(text, w / 2, h / 2 + 1);
    const tex = new THREE.CanvasTexture(cv);
    tex.minFilter = THREE.LinearFilter;
    tex.anisotropy = Math.min(4, maxAniso);
    return { tex, asp: w / h };
  }

  const sprites = [];
  let built = false;
  function build() {
    if (built || !list.length) return;
    built = true;
    const n = list.length;
    for (let i = 0; i < n; i++) {
      const { tex, asp } = chipTexture(list[i]);
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false });
      const sp = new THREE.Sprite(mat);
      const ang = (i / n) * Math.PI * 2;
      sp.position.set(Math.cos(ang) * RING_R, 0, Math.sin(ang) * RING_R);
      const baseH = 0.54;
      sp.scale.set(baseH * asp, baseH, 1);
      sp.userData = { baseH, asp };
      group.add(sp);
      sprites.push(sp);
    }
    resize();
  }

  /* ---- depth shading: front chips bigger + brighter, drawn on top ---- */
  const tmp = new THREE.Vector3();
  function shade() {
    for (let i = 0; i < sprites.length; i++) {
      const sp = sprites[i];
      tmp.copy(sp.position).applyMatrix4(group.matrixWorld);
      const t = THREE.MathUtils.clamp((tmp.z + RING_R) / (2 * RING_R), 0, 1); // 1 = closest
      sp.material.opacity = 0.34 + 0.66 * t;
      const s = sp.userData.baseH * (0.82 + 0.34 * t);
      sp.scale.set(s * sp.userData.asp, s, 1);
      sp.renderOrder = Math.round(t * 100);
    }
  }

  /* ---- state ---- */
  let rafId = 0, destroyed = false, visible = false;
  let dragging = false, lastX = 0;
  let scrollRot = 0, scrollEased = 0, idle = 0;
  let cw = 800, ch = 360;

  function start() { if (rafId || destroyed || !visible || document.hidden) return; rafId = requestAnimationFrame(animate); }
  function stop() { if (rafId) { cancelAnimationFrame(rafId); rafId = 0; } }

  function animate() {
    if (destroyed) return;
    scrollEased += (scrollRot - scrollEased) * 0.07;
    if (dragging) {
      idle = group.rotation.y - scrollEased; // keep base synced while dragging
    } else {
      if (!reduce) idle += AUTO;
      group.rotation.y += ((idle + scrollEased) - group.rotation.y) * 0.12;
    }
    group.rotation.x = TILT;
    group.updateMatrixWorld(true);
    shade();
    renderer.render(scene, camera);
    if (visible && !destroyed && !document.hidden) rafId = requestAnimationFrame(animate);
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    cw = r.width || canvas.clientWidth || 800;
    ch = r.height || canvas.clientHeight || 360;
    renderer.setSize(cw, ch, false);
    camera.aspect = cw / ch;
    camera.updateProjectionMatrix();
  }

  /* ---- listeners (mouse drag = yaw only; touch scrolls the page normally) ---- */
  const onMouseDown = (e) => { dragging = true; lastX = e.clientX; };
  const onMouseMove = (e) => { if (dragging) { group.rotation.y += (e.clientX - lastX) * 0.007; lastX = e.clientX; } };
  const onMouseUp = () => { dragging = false; };
  const onResize = () => resize();
  const onWinLoad = () => resize();

  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
  window.addEventListener('resize', onResize);
  window.addEventListener('load', onWinLoad);

  const onVisibility = () => { if (document.hidden) stop(); else start(); };
  document.addEventListener('visibilitychange', onVisibility);

  let io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver((entries) => {
      const vis = entries.some((e) => e.isIntersecting);
      if (vis === visible) return;
      visible = vis;
      if (visible) { resize(); start(); } else { stop(); }
    }, { rootMargin: '200px 0px' });
    io.observe(canvas);
  } else {
    visible = true;
  }

  function setScrollProgress(p) {
    p = Math.max(0, Math.min(1, p));
    scrollRot = (p - 0.5) * Math.PI * 1.4; // turn the ring as the section passes through
  }

  function destroy() {
    destroyed = true;
    stop();
    if (io) io.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    canvas.removeEventListener('mousedown', onMouseDown);
    canvas.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('load', onWinLoad);
    sprites.forEach((sp) => {
      if (sp.material) { if (sp.material.map) sp.material.map.dispose(); sp.material.dispose(); }
    });
    try { renderer.dispose(); } catch (e) { /* noop */ }
  }

  // build after fonts are ready so the chip text measures correctly
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(build);
    setTimeout(build, 1600);
  } else {
    build();
  }
  setTimeout(resize, 400);

  return { setScrollProgress, destroy };
}
