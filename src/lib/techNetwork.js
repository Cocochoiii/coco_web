/* ============================================================
   techNetwork.js — 3D Tech Stack network (Three.js r128, ES modules)
   Ported from the original network.js. Transparent canvas (no post-processing);
   the glow comes from additive sprites + a static CSS glow behind the canvas.
   The render loop pauses while the section is off-screen or the tab is hidden.

   QUICK TUNABLES: R, GROUP_Y, LINEWIDTH, SPREAD
   ============================================================ */
import * as THREE from 'three';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

import { CLUSTERS, TIER1, TIER2 } from '../data/content.js';

export function initTechNetwork(canvas) {
  if (!canvas) return { setScrollProgress() {}, focusTech() {}, destroy() {} };
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ===== TUNABLES ===== */
  const R = 3.3;          // sphere radius (bigger = bigger ball)
  const GROUP_Y = 0.2;   // move ball DOWN -> negative
  const LINEWIDTH = 3.5;  // connecting-line thickness (px)
  const SPREAD = 1.95;    // node spacing

  /* ---- data ---- */
  function tierOf(n) { return TIER1[n] ? 1 : (TIER2[n] ? 2 : 3); }
  function weightOf(t) { return t === 1 ? 1.5 : (t === 2 ? 1.2 : 0.9); }

  const TECH = [];
  CLUSTERS.forEach((cl, ci) => {
    cl.items.forEach((n) => {
      const t = tierOf(n);
      TECH.push({ name: n, color: cl.color, cl: ci, tier: t, w: weightOf(t) });
    });
  });
  const N = TECH.length, GOLD = Math.PI * (3 - Math.sqrt(5));

  /* ---- three basics ---- */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 100);
  camera.position.set(0, 0, 8.4);
  const group = new THREE.Group();
  group.position.y = GROUP_Y;
  scene.add(group);

  /* ---- helpers ---- */
  function discTex() {
    const s = 64, cv = document.createElement('canvas'); cv.width = cv.height = s;
    const x = cv.getContext('2d'), g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.45, 'rgba(255,255,255,.6)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.beginPath(); x.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2); x.fill();
    return new THREE.CanvasTexture(cv);
  }
  const DISC = discTex();

  function makeLabel(text, w) {
    const fs = 46, pad = 12, cv = document.createElement('canvas');
    let x = cv.getContext('2d');
    const font = '500 ' + fs + "px 'IBM Plex Mono', ui-monospace, monospace";
    x.font = font; const tw = Math.ceil(x.measureText(text).width);
    cv.width = tw + pad * 2; cv.height = fs + pad * 2;
    x = cv.getContext('2d'); x.font = font; x.textBaseline = 'middle';
    x.shadowColor = 'rgba(8,6,14,0.98)'; x.shadowBlur = 8;
    x.fillStyle = '#EAE3F6'; x.fillText(text, pad, cv.height / 2);
    const tex = new THREE.CanvasTexture(cv); tex.minFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false });
    const sp = new THREE.Sprite(mat);
    const h = 0.15 + 0.04 * w, asp = cv.width / cv.height;
    sp.scale.set(h * asp, h, 1); sp.userData.baseH = h; sp.userData.asp = asp;
    return sp;
  }
  function tangents(c) {
    let t1 = new THREE.Vector3(0, 1, 0).cross(c);
    if (t1.lengthSq() < 1e-4) t1.set(1, 0, 0);
    t1.normalize();
    const t2 = c.clone().cross(t1).normalize();
    return [t1, t2];
  }
  function clusterPoints(center, K, capR) {
    const t = tangents(center), pts = [];
    for (let m = 0; m < K; m++) {
      const idx = m + 0.5, rr = Math.sqrt(idx / K) * capR, a = idx * GOLD;
      pts.push(center.clone().addScaledVector(t[0], Math.cos(a) * rr).addScaledVector(t[1], Math.sin(a) * rr).normalize());
    }
    return pts;
  }

  /* ---- state ---- */
  let nodes = [], dotMeshes = [], adj = [], edges = [], packets = [];
  let fatGeo = null, fatMat = null, lineObj = null, edgeBaseCol, edgeCols;
  let started = false, lastHover = -2, cw = 800, ch = 600;
  let rafId = 0, destroyed = false, visible = true;

  // interaction state
  const ray = new THREE.Raycaster(), mouse = new THREE.Vector2(-5, -5);
  let hoverI = -1, focusI = -1, focusUntil = 0, targetRy = null;
  let dragging = false, lastX = 0, lastY = 0, velY = 0.0019, velX = 0;
  const AUTO = 0.0019, MINZ = 6.0, MAXZ = 11.0;
  let idleSpin = 0, scrollRot = 0, scrollRotEased = 0, scrollZoom = null;
  const tmp = new THREE.Vector3(), labW = new THREE.Vector3(), ndc = new THREE.Vector3();

  function addEdge(i, j) {
    for (let e = 0; e < edges.length; e++) {
      if ((edges[e][0] === i && edges[e][1] === j) || (edges[e][0] === j && edges[e][1] === i)) return;
    }
    edges.push([i, j]); adj[i].push(j); adj[j].push(i);
  }

  function build() {
    if (started || destroyed) return; started = true;
    const centers = CLUSTERS.map((_, i) => {
      const y = 1 - (i / (CLUSTERS.length - 1)) * 2, rd = Math.sqrt(1 - y * y), th = GOLD * i;
      return new THREE.Vector3(Math.cos(th) * rd, y, Math.sin(th) * rd);
    });
    const clusterPts = centers.map((c, ci) => clusterPoints(c, CLUSTERS[ci].items.length, SPREAD));
    const ccount = {};

    for (let i = 0; i < N; i++) {
      const ci = TECH[i].cl, m = (ccount[ci] = (ccount[ci] || 0)); ccount[ci]++;
      const pos = clusterPts[ci][m].clone().multiplyScalar(R);
      const col = new THREE.Color(TECH[i].color);
      const dot = new THREE.Sprite(new THREE.SpriteMaterial({ map: DISC, color: TECH[i].color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      const base = 0.15 * TECH[i].w;
      dot.scale.set(base, base, 1); dot.position.copy(pos); dot.userData.i = i;
      group.add(dot); dotMeshes.push(dot);
      const lab = makeLabel(TECH[i].name, TECH[i].w); lab.position.copy(pos).multiplyScalar(1.12); group.add(lab);
      nodes.push({ pos, dot, lab, col, base, tier: TECH[i].tier, cur: 1, target: 1 });
      adj.push([]);
    }
    for (let i = 0; i < N; i++) {
      const cand = [];
      for (let j = 0; j < N; j++) {
        if (j !== i && TECH[j].cl === TECH[i].cl) cand.push([j, nodes[i].pos.distanceToSquared(nodes[j].pos)]);
      }
      cand.sort((a, b) => a[1] - b[1]);
      for (let k = 0; k < Math.min(2, cand.length); k++) addEdge(i, cand[k][0]);
    }
    const hubs = centers.map((c, cci) => {
      let bi = -1, bd = 1e9;
      for (let j = 0; j < N; j++) {
        if (TECH[j].cl === cci) {
          const d = nodes[j].pos.clone().normalize().distanceToSquared(c);
          if (d < bd) { bd = d; bi = j; }
        }
      }
      return bi;
    });
    for (let i = 0; i < hubs.length; i++) addEdge(hubs[i], hubs[(i + 1) % hubs.length]);
    addEdge(hubs[0], hubs[2]);

    const p2 = []; edgeBaseCol = []; edgeCols = new Float32Array(edges.length * 6);
    edges.forEach((e) => {
      const a = nodes[e[0]], b = nodes[e[1]];
      p2.push(a.pos.x, a.pos.y, a.pos.z, b.pos.x, b.pos.y, b.pos.z);
      edgeBaseCol.push(a.col.r, a.col.g, a.col.b, b.col.r, b.col.g, b.col.b);
    });

    fatGeo = new LineSegmentsGeometry(); fatGeo.setPositions(p2);
    fatMat = new LineMaterial({ linewidth: LINEWIDTH, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
    const rr = canvas.getBoundingClientRect(); fatMat.resolution.set(rr.width || 800, rr.height || 600);
    lineObj = new LineSegments2(fatGeo, fatMat); lineObj.computeLineDistances(); group.add(lineObj);
    applyEdgeColors(-1);

    const PN = Math.min(30, edges.length);
    for (let i = 0; i < PN; i++) {
      const ei = Math.floor(Math.random() * edges.length);
      const pk = new THREE.Sprite(new THREE.SpriteMaterial({ map: DISC, color: nodes[edges[ei][0]].col.getHex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      pk.scale.set(0.062, 0.062, 1); group.add(pk);
      packets.push({ sp: pk, e: ei, t: Math.random(), spd: 0.003 + Math.random() * 0.0055 });
    }

    resize();
    start(); // begins the loop only if the section is currently on-screen
  }

  function applyEdgeColors(h) {
    const hovering = h >= 0;
    for (let e = 0; e < edges.length; e++) {
      const inc = hovering ? (edges[e][0] === h || edges[e][1] === h) : false;
      const f = hovering ? (inc ? 1.3 : 0.06) : 0.42;
      for (let v = 0; v < 6; v++) edgeCols[e * 6 + v] = edgeBaseCol[e * 6 + v] * f;
    }
    fatGeo.setColors(edgeCols);
  }

  /* ---- render loop with start/stop (paused while off-screen or tab hidden) ---- */
  function start() {
    if (rafId || destroyed || !visible || document.hidden) return;
    rafId = requestAnimationFrame(animate);
  }
  function stop() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
  }

  /* ---- animation loop ---- */
  function animate() {
    if (destroyed) return;
    const focusActive = (focusI >= 0 && performance.now() < focusUntil);
    scrollRotEased += (scrollRot - scrollRotEased) * 0.07;
    if (dragging) {
      group.rotation.x = THREE.MathUtils.clamp(group.rotation.x, -0.9, 0.9);
      idleSpin = group.rotation.y - scrollRotEased;
    } else if (focusActive && targetRy !== null) {
      group.rotation.y += (targetRy - group.rotation.y) * 0.08;
      group.rotation.x += (0 - group.rotation.x) * 0.08;
      idleSpin = group.rotation.y - scrollRotEased;
    } else {
      if (!reduce) idleSpin += (hoverI >= 0 ? AUTO * 0.15 : AUTO);
      // subtle tilt toward the cursor while it's over the canvas (adds life when idle)
      const over = Math.abs(mouse.x) <= 1 && Math.abs(mouse.y) <= 1;
      const tiltY = (!reduce && over) ? mouse.x * 0.18 : 0;   // yaw toward cursor
      const tiltX = (!reduce && over) ? -mouse.y * 0.13 : 0;  // pitch toward cursor
      group.rotation.y += ((idleSpin + scrollRotEased + tiltY) - group.rotation.y) * 0.09;
      velX *= 0.85;
      group.rotation.x += velX + ((tiltX - group.rotation.x) * 0.06);
      group.rotation.x = THREE.MathUtils.clamp(group.rotation.x, -0.9, 0.9);
    }
    if (scrollZoom !== null && !dragging) {
      camera.position.z += (scrollZoom - camera.position.z) * 0.06;
    }
    group.updateMatrixWorld(true);
    camera.updateMatrixWorld();

    if (!dragging) {
      ray.setFromCamera(mouse, camera);
      const hit = ray.intersectObjects(dotMeshes, false);
      hoverI = hit.length ? hit[0].object.userData.i : -1;
    }
    const hl = hoverI >= 0 ? hoverI : (focusActive ? focusI : -1);
    const hovering = hl >= 0;
    if (hl !== lastHover) { applyEdgeColors(hl); lastHover = hl; }
    let nbr = null;
    if (hovering) { nbr = {}; nbr[hl] = 1; adj[hl].forEach((x) => { nbr[x] = 1; }); }

    // phase 1: desired label opacity + depth/dot state
    const cands = []; let k, nd;
    for (k = 0; k < N; k++) {
      nd = nodes[k];
      tmp.copy(nd.pos).applyMatrix4(group.matrixWorld);
      nd._depth = Math.pow(THREE.MathUtils.clamp((tmp.z + R) / (2 * R), 0, 1), 2.2);
      nd._on = !hovering || !!nbr[k];
      nd._hot = (k === hl);
      nd._des = nd._hot ? 1 : (hovering ? (nd._on ? 0.95 : 0) : ((nd.tier <= 2 ? (nd.tier === 1 ? 1 : 0.85) : 0) * nd._depth));
      nd._blk = false;
      if (nd._des > 0.12) cands.push(nd);
    }
    // phase 2: screen-space de-overlap
    cands.sort((a, b) => { if (a._hot !== b._hot) return a._hot ? -1 : 1; if (b._des !== a._des) return b._des - a._des; return a.tier - b.tier; });
    const vHalf = Math.tan(camera.fov * Math.PI / 360), boxes = [];
    for (let c = 0; c < cands.length; c++) {
      nd = cands[c];
      labW.copy(nd.pos).multiplyScalar(1.12).applyMatrix4(group.matrixWorld);
      ndc.copy(labW).project(camera);
      if (ndc.z > 1) { nd._blk = true; continue; }
      const sx = (ndc.x * 0.5 + 0.5) * cw, sy = (-ndc.y * 0.5 + 0.5) * ch;
      const d = camera.position.distanceTo(labW), ppw = ch / (2 * d * vHalf);
      const hpx = nd.lab.userData.baseH * (nd._hot ? 1.3 : 1) * ppw, wpx = hpx * nd.lab.userData.asp;
      const box = { x: sx - wpx / 2 - 3, y: sy - hpx / 2 - 3, w: wpx + 6, h: hpx + 6 };
      let ov = false;
      for (let bi = 0; bi < boxes.length; bi++) {
        const o = boxes[bi];
        if (box.x < o.x + o.w && box.x + box.w > o.x && box.y < o.y + o.h && box.y + box.h > o.y) { ov = true; break; }
      }
      if (ov) nd._blk = true; else boxes.push(box);
    }
    // phase 3: apply
    for (k = 0; k < N; k++) {
      nd = nodes[k];
      nd.lab.material.opacity = nd._blk ? 0 : nd._des;
      nd.dot.material.opacity = nd._hot ? 1 : (hovering ? (nd._on ? (0.5 + 0.5 * nd._depth) : 0.08) : (0.5 + 0.7 * nd._depth));
      nd.target = nd._hot ? 1.6 : (nd._on && hovering ? 1.18 : 1);
      nd.cur += (nd.target - nd.cur) * 0.18;
      const lh = nd.lab.userData.baseH * (nd._hot ? 1.3 : 1);
      nd.lab.scale.set(lh * nd.lab.userData.asp, lh, 1);
      const ds = nd.base * nd.cur; nd.dot.scale.set(ds, ds, 1);
    }

    for (let p = 0; p < packets.length; p++) {
      const pk = packets[p]; pk.t += pk.spd;
      if (pk.t >= 1) { pk.t = 0; pk.e = Math.floor(Math.random() * edges.length); pk.sp.material.color.set(nodes[edges[pk.e][0]].col.getHex()); }
      pk.sp.position.lerpVectors(nodes[edges[pk.e][0]].pos, nodes[edges[pk.e][1]].pos, pk.t);
      const incp = hovering ? (edges[pk.e][0] === hl || edges[pk.e][1] === hl) : false;
      pk.sp.material.opacity = hovering ? (incp ? 1 : 0.04) : 0.7;
    }

    canvas.style.cursor = hovering ? 'pointer' : (dragging ? 'grabbing' : 'grab');
    renderer.render(scene, camera);
    rafId = 0;
    if (visible && !destroyed && !document.hidden) rafId = requestAnimationFrame(animate);
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    cw = r.width || canvas.clientWidth || window.innerWidth;
    ch = r.height || canvas.clientHeight || Math.round(window.innerHeight * 0.74);
    renderer.setSize(cw, ch, false); camera.aspect = cw / ch; camera.updateProjectionMatrix();
    if (fatMat) fatMat.resolution.set(cw, ch);
  }

  function setMouse(x, y) {
    const r = canvas.getBoundingClientRect();
    mouse.x = ((x - r.left) / r.width) * 2 - 1;
    mouse.y = -((y - r.top) / r.height) * 2 + 1;
  }

  /* ---- listeners (kept as named fns for clean teardown) ---- */
  const onMouseMove = (e) => {
    if (dragging) {
      velY = (e.clientX - lastX) * 0.006; velX = (e.clientY - lastY) * 0.006;
      group.rotation.y += velY; group.rotation.x = THREE.MathUtils.clamp(group.rotation.x + velX, -0.9, 0.9);
      lastX = e.clientX; lastY = e.clientY;
    }
    setMouse(e.clientX, e.clientY);
  };
  const onMouseLeave = () => mouse.set(-5, -5);
  const onMouseDown = (e) => { dragging = true; focusUntil = 0; velY = velX = 0; lastX = e.clientX; lastY = e.clientY; };
  const onMouseUp = () => { dragging = false; };
  const onTouchStart = (e) => { const t = e.touches[0]; dragging = true; velY = velX = 0; lastX = t.clientX; lastY = t.clientY; setMouse(t.clientX, t.clientY); };
  const onTouchMove = (e) => { const t = e.touches[0]; velY = (t.clientX - lastX) * 0.006; velX = (t.clientY - lastY) * 0.006; group.rotation.y += velY; group.rotation.x = THREE.MathUtils.clamp(group.rotation.x + velX, -0.9, 0.9); lastX = t.clientX; lastY = t.clientY; setMouse(t.clientX, t.clientY); };
  const onTouchEnd = () => { dragging = false; mouse.set(-5, -5); };
  const onResize = () => resize();
  const onWinLoad = () => resize();

  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseleave', onMouseLeave);
  canvas.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('touchstart', onTouchStart, { passive: true });
  canvas.addEventListener('touchmove', onTouchMove, { passive: true });
  canvas.addEventListener('touchend', onTouchEnd);
  window.addEventListener('resize', onResize);
  window.addEventListener('load', onWinLoad);

  // pause the render loop when the section is off-screen, or the tab is hidden
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
  }

  /* ---- public API ---- */
  function setScrollProgress(p) {
    p = Math.max(0, Math.min(1, p));
    scrollRot = p * Math.PI * 0.9;
    scrollZoom = THREE.MathUtils.clamp(9.2 - p * 2.2, MINZ, MAXZ);
  }
  function focusTech(name) {
    if (!nodes.length) return;
    const ln = String(name).toLowerCase(); let idx = -1;
    for (let i = 0; i < nodes.length; i++) { if (TECH[i].name.toLowerCase() === ln) { idx = i; break; } }
    if (idx < 0) return;
    const raw = -Math.atan2(nodes[idx].pos.x, nodes[idx].pos.z), cur = group.rotation.y;
    let d = raw - cur; d = Math.atan2(Math.sin(d), Math.cos(d));
    targetRy = cur + d; focusI = idx; focusUntil = performance.now() + 3000;
  }
  function destroy() {
    destroyed = true;
    stop();
    if (io) io.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    canvas.removeEventListener('mousemove', onMouseMove);
    canvas.removeEventListener('mouseleave', onMouseLeave);
    canvas.removeEventListener('mousedown', onMouseDown);
    window.removeEventListener('mouseup', onMouseUp);
    canvas.removeEventListener('touchstart', onTouchStart);
    canvas.removeEventListener('touchmove', onTouchMove);
    canvas.removeEventListener('touchend', onTouchEnd);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('load', onWinLoad);
    try { renderer.dispose(); } catch (e) {}
  }

  // build after fonts are ready so label sprites measure correctly
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(build);
    setTimeout(build, 1600);
  } else {
    build();
  }
  setTimeout(resize, 400);

  return { setScrollProgress, focusTech, destroy };
}
