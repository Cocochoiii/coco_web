/* ============================================================
   caseBackground.js — full-bleed 3D background for case-study pages
   ------------------------------------------------------------
   ONE shared engine, selected per page by `motif`. Each motif is a tiny
   builder that fills the shared node/arc/packet buffers (and optionally
   sets a per-frame `motifTick` for bespoke motion):

     globe   — wireframe Earth, AWS regions, great-circle backbone arcs,
               flowing packets, periodic link failover.            (AWS)
     mars    — central hub + a swarm of live socket connections with
               heartbeats; links churn (connect/drop).             (Mars)
     ubiwell — layered biosignal waveforms with event particles
               streaming along them.                          (UbiWell)
     audi    — left→right pipeline DAG (sources → transforms →
               warehouse) with downstream packets; sink pulses.    (Audi)
     wpp     — scattered identity nodes that merge into clusters,
               edges forming as they resolve.                       (WPP)
     rag     — embedding point-cloud; a query lands and its nearest
               neighbours light up + link.                         (RAG)

   Rendered dim + slow + oversized so it reads as a BACKDROP. Legibility
   is enforced in case-bg.css (canvas opacity + blur + a dark scrim over
   the reading column). The loop pauses while off-screen or tab-hidden.

   QUICK TUNABLES: INTENSITY / SCALE / SPEED / SHIFT_X / SHIFT_Y (below).
   Damping knobs (opacity / blur / scrim) are CSS vars in case-bg.css.
   ============================================================ */
import * as THREE from 'three';

const DEG = Math.PI / 180;

/* real AWS regions (lat, lon) — globe motif */
const REGIONS = [
  { lat: 38.95, lon: -77.45 }, { lat: 40.4, lon: -83.0 }, { lat: 45.9, lon: -119.7 },
  { lat: 45.5, lon: -73.6 }, { lat: -23.5, lon: -46.6 }, { lat: 53.4, lon: -6.3 },
  { lat: 50.1, lon: 8.7 }, { lat: 59.3, lon: 18.1 }, { lat: -33.9, lon: 18.4 },
  { lat: 19.1, lon: 72.9 }, { lat: 1.35, lon: 103.8 }, { lat: -33.9, lon: 151.2 },
  { lat: 35.6, lon: 139.7 }, { lat: 37.5, lon: 127.0 },
];
const ARC_PAIRS = [
  [0, 5], [0, 6], [0, 4], [0, 2], [0, 3], [2, 12], [12, 10], [10, 9],
  [10, 11], [6, 9], [5, 7], [6, 8], [12, 13], [5, 6], [4, 8],
];

function llToVec3(lat, lon, r) {
  const phi = (90 - lat) * DEG, theta = (lon + 180) * DEG;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}
function discTex() {
  const s = 64, cv = document.createElement('canvas'); cv.width = cv.height = s;
  const x = cv.getContext('2d'), g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.45, 'rgba(255,255,255,.6)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.beginPath(); x.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2); x.fill();
  return new THREE.CanvasTexture(cv);
}
const smooth = (t) => t * t * (3 - 2 * t);

export function initCaseBackground(canvas, opts = {}) {
  if (!canvas) return { setScrollProgress() {}, destroy() {} };
  const motif = opts.motif || 'field';
  const accent = new THREE.Color(opts.accent || '#8FB4FF');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ===== TUNABLES — the "big but readable" knobs ===== */
  const INTENSITY = 1.0;   // brightness of lines/nodes (lower = dimmer backdrop)
  const SCALE     = 1.32;  // overall size; >1 overflows the viewport (huge)
  const SPEED     = 1.0;   // global motion speed (keep it slow)
  const SHIFT_X   = 0.0;   // nudge the whole motif off-center (+right)
  const SHIFT_Y   = 0.0;   // nudge vertically (+up)
  /* ================================================== */

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 9);
  const group = new THREE.Group();
  group.position.set(SHIFT_X, SHIFT_Y, 0);
  group.scale.setScalar(SCALE);
  scene.add(group);

  const DISC = discTex();
  const disposables = [];
  const nodes = [];     // { sp, base, ph, boost }
  const arcs = [];      // { pts:[Vec3], mat, base, down, downUntil }
  const packets = [];   // { sp, ai, t, spd }
  let motifTick = null; // optional per-frame hook set by a builder
  let cw = 800, ch = 600, rafId = 0, destroyed = false, visible = true;
  let autoRot = 0, scrollP = 0, scrollEased = 0, nextFail = 0;

  /* ---------- shared builders' helpers ---------- */
  function addNode(pos, size) {
    const m = new THREE.SpriteMaterial({ map: DISC, color: accent.getHex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const sp = new THREE.Sprite(m); sp.position.copy(pos); sp.scale.setScalar(size);
    group.add(sp); disposables.push(m);
    const nd = { sp, base: size, ph: Math.random() * Math.PI * 2, boost: 0 };
    nodes.push(nd); return nd;
  }
  function addArc(pts, opacity, colorHex) {
    const ag = new THREE.BufferGeometry().setFromPoints(pts);
    const am = new THREE.LineBasicMaterial({ color: colorHex != null ? colorHex : accent.getHex(), transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false });
    group.add(new THREE.Line(ag, am)); disposables.push(ag, am);
    const a = { pts, mat: am, base: opacity, down: false, downUntil: 0 };
    arcs.push(a); return a;
  }
  function seedPackets(count, size) {
    for (let i = 0; i < count; i++) {
      const ai = Math.floor(Math.random() * arcs.length);
      const m = new THREE.SpriteMaterial({ map: DISC, color: 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
      const sp = new THREE.Sprite(m); sp.scale.setScalar(size);
      group.add(sp); packets.push({ sp, ai, t: Math.random(), spd: (0.0016 + Math.random() * 0.0028) * SPEED }); disposables.push(m);
    }
  }

  /* ---------- motif builders ---------- */
  function buildGlobe() {
    const R = 3.2, segs = [];
    for (let la = -60; la <= 60; la += 30) {
      const r2 = R * Math.cos(la * DEG), y = R * Math.sin(la * DEG); let prev = null;
      for (let lo = 0; lo <= 360; lo += 10) { const v = [r2 * Math.cos(lo * DEG), y, r2 * Math.sin(lo * DEG)]; if (prev) segs.push(prev[0], prev[1], prev[2], v[0], v[1], v[2]); prev = v; }
    }
    for (let lo = 0; lo < 360; lo += 30) {
      let prev = null;
      for (let la = -90; la <= 90; la += 10) { const r2 = R * Math.cos(la * DEG), y = R * Math.sin(la * DEG); const v = [r2 * Math.cos(lo * DEG), y, r2 * Math.sin(lo * DEG)]; if (prev) segs.push(prev[0], prev[1], prev[2], v[0], v[1], v[2]); prev = v; }
    }
    const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(segs, 3));
    const gm = new THREE.LineBasicMaterial({ color: 0x6a5f8c, transparent: true, opacity: 0.22 * INTENSITY, blending: THREE.AdditiveBlending, depthWrite: false });
    group.add(new THREE.LineSegments(gg, gm)); disposables.push(gg, gm);
    const verts = REGIONS.map((rg) => llToVec3(rg.lat, rg.lon, R * 1.004));
    verts.forEach((p) => addNode(p, 0.17));
    ARC_PAIRS.forEach(([ia, ib]) => {
      if (ia === ib) return;
      const a = verts[ia].clone().normalize(), b = verts[ib].clone().normalize();
      const W = Math.acos(THREE.MathUtils.clamp(a.dot(b), -1, 1)), pts = [], SEG = 64;
      for (let i = 0; i <= SEG; i++) {
        const t = i / SEG; let v;
        if (W < 1e-3) v = a.clone();
        else { const s1 = Math.sin((1 - t) * W) / Math.sin(W), s2 = Math.sin(t * W) / Math.sin(W); v = a.clone().multiplyScalar(s1).add(b.clone().multiplyScalar(s2)).normalize(); }
        pts.push(v.multiplyScalar(R * (1 + 0.16 * Math.sin(Math.PI * t))));
      }
      addArc(pts, 0.55 * INTENSITY);
    });
    seedPackets(Math.min(28, arcs.length * 2), 0.085);
  }

  function buildMars() {
    const hub = new THREE.Vector3(0, 0, 0);
    addNode(hub, 0.3);
    const NE = 46;
    for (let i = 0; i < NE; i++) {
      const u = Math.random(), v = Math.random(), th = u * Math.PI * 2, ph = Math.acos(2 * v - 1);
      const rr = 3.7 * (0.62 + Math.random() * 0.42);
      const p = new THREE.Vector3(rr * Math.sin(ph) * Math.cos(th), rr * Math.sin(ph) * Math.sin(th) * 0.78, rr * Math.cos(ph));
      addNode(p, 0.12);
      addArc([hub.clone(), p.clone()], 0.24 * INTENSITY);
    }
    seedPackets(Math.min(36, arcs.length), 0.07);
  }

  function buildUbiwell() {
    const span = 5.4, LINES = 5;
    function wave(x, li) {
      let y = 0.46 * Math.sin(x * 1.25 + li * 1.7) + 0.16 * Math.sin(x * 3.2 + li);
      const m = (((x + li * 0.8) % 2.4) + 2.4) % 2.4;
      if (m < 0.1) y += 0.85 * (1 - m / 0.1);
      return y;
    }
    for (let li = 0; li < LINES; li++) {
      const baseY = (li - (LINES - 1) / 2) * 0.95, z = (Math.random() - 0.5) * 1.3, pts = [];
      for (let x = -span; x <= span; x += 0.12) pts.push(new THREE.Vector3(x, baseY + wave(x, li), z));
      addArc(pts, 0.38 * INTENSITY);
    }
    for (let k = 0; k < 12; k++) addNode(new THREE.Vector3((Math.random() - 0.5) * span * 1.6, (Math.random() - 0.5) * 4.2, (Math.random() - 0.5) * 2), 0.09);
    seedPackets(Math.min(28, arcs.length * 5), 0.07);
  }

  function buildAudi() {
    const stages = [4, 3, 2, 1], xs = [-4.2, -1.4, 1.4, 4.0], cols = [];
    stages.forEach((cnt, si) => {
      const arr = [];
      for (let j = 0; j < cnt; j++) {
        const y = (j - (cnt - 1) / 2) * 1.5, z = (Math.random() - 0.5) * 0.8;
        arr.push(addNode(new THREE.Vector3(xs[si], y, z), si === stages.length - 1 ? 0.28 : 0.15));
      }
      cols.push(arr);
    });
    for (let si = 0; si < stages.length - 1; si++) {
      cols[si].forEach((a) => {
        const nxt = cols[si + 1].slice().sort((p, q) => Math.abs(p.sp.position.y - a.sp.position.y) - Math.abs(q.sp.position.y - a.sp.position.y));
        for (let k = 0; k < Math.min(2, nxt.length); k++) addArc([a.sp.position.clone(), nxt[k].sp.position.clone()], 0.22 * INTENSITY);
      });
    }
    seedPackets(Math.min(32, arcs.length * 2), 0.075);
    const sink = cols[cols.length - 1][0];
    motifTick = (now) => {
      const t = (now % 2600) / 2600;
      sink.boost = 0.55 * Math.max(0, Math.sin((1 - t) * Math.PI));
    };
  }

  function buildWpp() {
    const NP = 52, CN = 6, centers = [];
    for (let c = 0; c < CN; c++) {
      const th = (c / CN) * Math.PI * 2;
      centers.push(new THREE.Vector3(Math.cos(th) * 2.3, Math.sin(th) * 1.7, (Math.random() - 0.5) * 0.8));
    }
    const edgePos = new Float32Array(NP * 6);
    const eg = new THREE.BufferGeometry(); eg.setAttribute('position', new THREE.Float32BufferAttribute(edgePos, 3));
    const em = new THREE.LineBasicMaterial({ color: accent.getHex(), transparent: true, opacity: 0.16 * INTENSITY, blending: THREE.AdditiveBlending, depthWrite: false });
    group.add(new THREE.LineSegments(eg, em)); disposables.push(eg, em);
    const items = [];
    for (let i = 0; i < NP; i++) {
      const home = new THREE.Vector3((Math.random() - 0.5) * 8.2, (Math.random() - 0.5) * 5.6, (Math.random() - 0.5) * 2);
      const nd = addNode(home.clone(), 0.12);
      items.push({ nd, home, center: centers[i % CN] });
    }
    motifTick = (now) => {
      const T = 7200, ph = (now % T) / T;
      let k;
      if (ph < 0.45) k = smooth(ph / 0.45);
      else if (ph < 0.7) k = 1;
      else k = 1 - smooth((ph - 0.7) / 0.3);
      const arr = eg.attributes.position.array;
      for (let i = 0; i < items.length; i++) {
        const it = items[i], p = it.home.clone().lerp(it.center, k), o = i * 6;
        it.nd.sp.position.copy(p);
        arr[o] = p.x; arr[o + 1] = p.y; arr[o + 2] = p.z;
        arr[o + 3] = it.center.x; arr[o + 4] = it.center.y; arr[o + 5] = it.center.z;
      }
      eg.attributes.position.needsUpdate = true;
      em.opacity = (0.05 + 0.18 * k) * INTENSITY;
    };
  }

  function buildRag() {
    const NP = 120, R = 4.0, pos3 = [];
    for (let i = 0; i < NP; i++) {
      const u = Math.random(), v = Math.random(), th = u * Math.PI * 2, ph = Math.acos(2 * v - 1);
      const rr = R * (0.32 + Math.random() * 0.68);
      const p = new THREE.Vector3(rr * Math.sin(ph) * Math.cos(th), rr * Math.sin(ph) * Math.sin(th) * 0.82, rr * Math.cos(ph));
      pos3.push(p); addNode(p, 0.085);
    }
    const qm = new THREE.SpriteMaterial({ map: DISC, color: 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const q = new THREE.Sprite(qm); q.scale.setScalar(0.22); group.add(q); disposables.push(qm);
    const K = 6, linkPos = new Float32Array(K * 6);
    const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(linkPos, 3));
    const lm = new THREE.LineBasicMaterial({ color: accent.getHex(), transparent: true, opacity: 0.5 * INTENSITY, blending: THREE.AdditiveBlending, depthWrite: false });
    group.add(new THREE.LineSegments(lg, lm)); disposables.push(lg, lm);
    let nbr = [], cycleEnd = 0;
    function newQuery(now) {
      const qp = new THREE.Vector3((Math.random() - 0.5) * R * 1.4, (Math.random() - 0.5) * R * 1.1, (Math.random() - 0.5) * R * 0.9);
      q.position.copy(qp);
      nbr = pos3.map((p, idx) => [idx, p.distanceToSquared(qp)]).sort((a, b) => a[1] - b[1]).slice(0, K).map((e) => e[0]);
      const arr = lg.attributes.position.array;
      for (let k = 0; k < K; k++) {
        const p = pos3[nbr[k]], o = k * 6;
        arr[o] = qp.x; arr[o + 1] = qp.y; arr[o + 2] = qp.z;
        arr[o + 3] = p.x; arr[o + 4] = p.y; arr[o + 5] = p.z;
      }
      lg.attributes.position.needsUpdate = true;
      cycleEnd = now + 2800;
    }
    motifTick = (now) => {
      if (now > cycleEnd) newQuery(now);
      const t = (cycleEnd - now) / 2800;
      const fade = Math.max(0, Math.min(1, t < 0.15 ? t / 0.15 : (t > 0.85 ? (1 - t) / 0.15 : 1)));
      lm.opacity = (0.1 + 0.5 * fade) * INTENSITY;
      qm.opacity = 0.3 + 0.7 * fade;
      for (let i = 0; i < nodes.length; i++) nodes[i].boost = 0;
      for (let n = 0; n < nbr.length; n++) nodes[nbr[n]].boost = 0.65 * fade;
    };
  }

  function buildField() {
    const NP = 90, R = 4.2, pts3 = [];
    for (let i = 0; i < NP; i++) {
      const u = Math.random(), v = Math.random(), th = u * Math.PI * 2, ph = Math.acos(2 * v - 1), rr = R * (0.55 + Math.random() * 0.45);
      const p = new THREE.Vector3(rr * Math.sin(ph) * Math.cos(th), rr * Math.sin(ph) * Math.sin(th) * 0.7, rr * Math.cos(ph));
      pts3.push(p); addNode(p, 0.11);
    }
    for (let i = 0; i < NP; i++) {
      const cand = [];
      for (let j = 0; j < NP; j++) if (j !== i) cand.push([j, pts3[i].distanceToSquared(pts3[j])]);
      cand.sort((a, b) => a[1] - b[1]);
      for (let k = 0; k < 2; k++) { const j = cand[k][0]; if (j < i) continue; addArc([pts3[i].clone(), pts3[j].clone()], 0.16 * INTENSITY); }
    }
    seedPackets(Math.min(22, arcs.length), 0.06);
  }

  const CFG = {
    globe: { orbit: true, churn: 1.0, build: buildGlobe },
    mars: { orbit: true, churn: 2.4, build: buildMars },
    ubiwell: { orbit: false, churn: 0, build: buildUbiwell },
    audi: { orbit: false, churn: 0, build: buildAudi },
    wpp: { orbit: false, churn: 0, build: buildWpp },
    rag: { orbit: true, churn: 0, build: buildRag },
    field: { orbit: true, churn: 0, build: buildField },
  };
  const cfg = CFG[motif] || CFG.field;
  cfg.build();

  /* ---------- loop ---------- */
  function animate() {
    if (destroyed) return;
    const now = performance.now();
    scrollEased += (scrollP - scrollEased) * 0.06;
    if (cfg.orbit) {
      if (!reduce) autoRot += 0.0006 * SPEED;
      group.rotation.y = autoRot + scrollEased * Math.PI * 0.5;
      group.rotation.x = -0.16 + (reduce ? 0 : Math.sin(autoRot * 0.4) * 0.04);
    } else {
      group.rotation.y = -0.18 + scrollEased * 0.35 + (reduce ? 0 : Math.sin(now * 0.00012) * 0.05);
      group.rotation.x = -0.04;
    }

    if (motifTick) motifTick(now);

    for (let i = 0; i < nodes.length; i++) {
      const nd = nodes[i];
      const tw = reduce ? 0.85 : (0.6 + 0.4 * Math.sin(now * 0.001 + nd.ph));
      nd.sp.material.opacity = Math.min(1.2, tw + nd.boost) * INTENSITY;
      const s = nd.base * (0.9 + 0.2 * tw) * (1 + nd.boost * 0.6);
      nd.sp.scale.setScalar(s);
    }

    if (cfg.churn > 0 && !reduce) {
      if (now > nextFail) {
        arcs[Math.floor(Math.random() * arcs.length)].downUntil = now + 1100;
        nextFail = now + 2400 / cfg.churn + Math.random() * (3200 / cfg.churn);
      }
      for (let i = 0; i < arcs.length; i++) { const a = arcs[i]; a.down = now < a.downUntil; a.mat.opacity = a.down ? 0.05 : a.base; }
    }

    for (let p = 0; p < packets.length; p++) {
      const pk = packets[p]; pk.t += pk.spd;
      if (pk.t >= 1) { pk.t = 0; pk.ai = Math.floor(Math.random() * arcs.length); }
      const arc = arcs[pk.ai], pts = arc.pts;
      const f = pk.t * (pts.length - 1), i0 = Math.floor(f), i1 = Math.min(pts.length - 1, i0 + 1);
      pk.sp.position.lerpVectors(pts[i0], pts[i1], f - i0);
      pk.sp.material.opacity = arc.down ? 0 : 0.85 * INTENSITY;
    }

    renderer.render(scene, camera);
    rafId = 0;
    if (visible && !destroyed && !document.hidden) rafId = requestAnimationFrame(animate);
  }
  function start() { if (rafId || destroyed || !visible || document.hidden) return; rafId = requestAnimationFrame(animate); }
  function stop() { if (rafId) { cancelAnimationFrame(rafId); rafId = 0; } }

  /* ---------- sizing / lifecycle ---------- */
  function resize() {
    const r = canvas.getBoundingClientRect();
    cw = r.width || window.innerWidth; ch = r.height || window.innerHeight;
    renderer.setSize(cw, ch, false); camera.aspect = cw / ch; camera.updateProjectionMatrix();
  }
  const onResize = () => resize();
  const onVisibility = () => { if (document.hidden) stop(); else start(); };
  window.addEventListener('resize', onResize);
  document.addEventListener('visibilitychange', onVisibility);
  let io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver((entries) => {
      const vis = entries.some((e) => e.isIntersecting);
      if (vis === visible) return;
      visible = vis; if (visible) { resize(); start(); } else { stop(); }
    }, { rootMargin: '200px 0px' });
    io.observe(canvas);
  }

  resize();
  start();
  setTimeout(resize, 300);

  return {
    setScrollProgress(p) { scrollP = Math.max(0, Math.min(1, p)); },
    destroy() {
      destroyed = true; stop();
      if (io) io.disconnect();
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      disposables.forEach((d) => { try { d.dispose(); } catch (e) { /* noop */ } });
      try { DISC.dispose(); } catch (e) { /* noop */ }
      try { renderer.dispose(); } catch (e) { /* noop */ }
    },
  };
}
