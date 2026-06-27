/* ============================================================
   failoverNet.js — interactive backbone topology + failover demo
   ------------------------------------------------------------
   A small but REAL network: AWS-region nodes, weighted/capacitied links,
   live traffic routed by Dijkstra over the *current* (non-cut) graph.

   DIRECTION A — pure visual narrative. ZERO numbers, ZERO panels: the network
   tells its own story entirely through motion and light —
     · cables are coloured by live link utilisation (cool→warm→hot)
     · the busiest cable breathes; cut cables go dim/amber-dashed
     · cutting a link sends a shock-ring pulse at the break (reconvergence)
     · dropped flows leak red packets at their source
     · hovering lights a cable (or a node's whole fan-out); the rest dims
     · tracing two nodes lights the live shortest path between them

   Interactions:
     · click a CABLE      → cut / heal it (flows re-route instantly)
     · click TWO NODES    → trace the shortest route between them (lit path)
     · double-click empty  → heal everything
     · move the cursor     → gentle parallax tilt (the whole scene leans)

   Pauses off-screen / tab-hidden; static under reduced-motion.
   TUNABLES: SCALE / ARC_LIFT / PACKET_SPEED / PARALLAX / NODE_Y / FIT_PAD
             (top of init).
   ============================================================ */
import * as THREE from 'three';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

/* ---- topology (positions are abstract plane coords: x = west→east, z = north→south) ---- */
const NODES = [
  { id: 'us-west-2', x: -5.2, z: -0.6 },
  { id: 'us-east-1', x: -3.3, z: -0.1 },
  { id: 'sa-east-1', x: -2.7, z: 2.7 },
  { id: 'eu-west-1', x: -0.6, z: -1.2 },
  { id: 'eu-central-1', x: 0.7, z: -1.9 },
  { id: 'ap-south-1', x: 2.6, z: 0.3 },
  { id: 'ap-southeast-1', x: 4.2, z: 1.3 },
  { id: 'ap-northeast-1', x: 4.9, z: -1.2 },
  { id: 'ap-southeast-2', x: 5.0, z: 2.9 },
  { id: 'me-central-1', x: 1.8, z: -0.5 },
  { id: 'af-south-1', x: 0.6, z: 2.6 },
];
const NAME = NODES.map((n) => n.id);
const LINKS = [
  { a: 0, b: 1, w: 30, cap: 100 },   // us-west-2 — us-east-1
  { a: 1, b: 3, w: 70, cap: 100 },   // us-east-1 — eu-west-1 (transatlantic A)
  { a: 1, b: 4, w: 80, cap: 60 },    // us-east-1 — eu-central-1 (transatlantic B, redundant)
  { a: 1, b: 2, w: 60, cap: 40 },    // us-east-1 — sa-east-1
  { a: 3, b: 4, w: 12, cap: 100 },   // eu-west-1 — eu-central-1
  { a: 4, b: 5, w: 90, cap: 60 },    // eu-central-1 — ap-south-1
  { a: 5, b: 6, w: 35, cap: 60 },    // ap-south-1 — ap-southeast-1
  { a: 6, b: 7, w: 40, cap: 80 },    // ap-southeast-1 — ap-northeast-1
  { a: 6, b: 8, w: 45, cap: 40 },    // ap-southeast-1 — ap-southeast-2
  { a: 0, b: 7, w: 95, cap: 80 },    // us-west-2 — ap-northeast-1 (transpacific)
  { a: 5, b: 7, w: 70, cap: 40 },    // ap-south-1 — ap-northeast-1 (APAC redundancy)
  { a: 2, b: 3, w: 110, cap: 30 },   // sa-east-1 — eu-west-1 (long backup)
  { a: 4, b: 7, w: 135, cap: 40 },   // eu-central-1 — ap-northeast-1 (long backup)
  { a: 4, b: 9, w: 55, cap: 60 },    // eu-central-1 — me-central-1
  { a: 5, b: 9, w: 30, cap: 60 },    // ap-south-1 — me-central-1
  { a: 9, b: 10, w: 65, cap: 40 },   // me-central-1 — af-south-1
  { a: 2, b: 10, w: 80, cap: 40 },   // sa-east-1 — af-south-1 (south atlantic)
  { a: 3, b: 10, w: 90, cap: 40 },   // eu-west-1 — af-south-1
  { a: 0, b: 3, w: 120, cap: 30 },   // us-west-2 — eu-west-1 (polar backup)
  { a: 5, b: 8, w: 85, cap: 30 },    // ap-south-1 — ap-southeast-2 (APAC redundancy)
  // --- added: more backbone links (extra redundancy / reroute options) ---
  { a: 7, b: 8, w: 85, cap: 40 },    // ap-northeast-1 — ap-southeast-2 (Tokyo ↔ Sydney)
  { a: 6, b: 9, w: 75, cap: 50 },    // ap-southeast-1 — me-central-1 (Singapore ↔ Middle East)
  { a: 3, b: 5, w: 95, cap: 40 },    // eu-west-1 — ap-south-1 (Europe ↔ India shortcut)
  { a: 5, b: 10, w: 88, cap: 30 },   // ap-south-1 — af-south-1 (Mumbai ↔ Cape Town)
  { a: 0, b: 8, w: 105, cap: 40 },   // us-west-2 — ap-southeast-2 (transpacific south)
  { a: 4, b: 10, w: 80, cap: 40 },   // eu-central-1 — af-south-1 (Europe ↔ Africa)
];
const FLOWS = [
  { s: 0, d: 6, bw: 18 },   // us-west-2 → ap-southeast-1
  { s: 1, d: 7, bw: 22 },   // us-east-1 → ap-northeast-1
  { s: 2, d: 4, bw: 12 },   // sa-east-1 → eu-central-1
  { s: 3, d: 8, bw: 10 },   // eu-west-1 → ap-southeast-2
  { s: 1, d: 5, bw: 16 },   // us-east-1 → ap-south-1
  { s: 9, d: 1, bw: 12 },   // me-central-1 → us-east-1
  { s: 10, d: 7, bw: 9 },   // af-south-1 → ap-northeast-1
  { s: 4, d: 8, bw: 8 },    // eu-central-1 → ap-southeast-2
];
const TOTAL_BW = FLOWS.reduce((s, f) => s + f.bw, 0);

const COOL = new THREE.Color('#8FB4FF');
const LAV = new THREE.Color('#B9A6FF');
const PINK = new THREE.Color('#FF9EC4');
const AMBER = new THREE.Color('#E8B06A');
const ROUTE = new THREE.Color('#EAE3F6');
const REDPK = new THREE.Color('#FF6B6B');
const DIM = new THREE.Color('#3b3357');
const MONO = "'IBM Plex Mono', ui-monospace, monospace";

function discTex() {
  const s = 64, cv = document.createElement('canvas'); cv.width = cv.height = s;
  const x = cv.getContext('2d'), g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.45, 'rgba(255,255,255,.6)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.beginPath(); x.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2); x.fill();
  return new THREE.CanvasTexture(cv);
}
function ringTex() {
  const s = 128, cv = document.createElement('canvas'); cv.width = cv.height = s;
  const x = cv.getContext('2d');
  x.strokeStyle = 'rgba(255,255,255,1)'; x.lineWidth = 7;
  x.beginPath(); x.arc(s / 2, s / 2, s / 2 - 10, 0, Math.PI * 2); x.stroke();
  return new THREE.CanvasTexture(cv);
}
function labelSprite(text) {
  const fs = 40, pad = 10, cv = document.createElement('canvas');
  let x = cv.getContext('2d');
  const font = '500 ' + fs + 'px ' + MONO;
  x.font = font; const tw = Math.ceil(x.measureText(text).width);
  cv.width = tw + pad * 2; cv.height = fs + pad * 2;
  x = cv.getContext('2d'); x.font = font; x.textBaseline = 'middle';
  x.shadowColor = 'rgba(8,6,14,0.95)'; x.shadowBlur = 7;
  x.fillStyle = '#D8CFEC'; x.fillText(text, pad, cv.height / 2);
  const tex = new THREE.CanvasTexture(cv); tex.minFilter = THREE.LinearFilter;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false }));
  const h = 0.46, asp = cv.width / cv.height; sp.scale.set(h * asp, h, 1);
  return sp;
}

/* a billboard "pill" sprite whose text can be (re)drawn — hover tooltips + transient floaters */
function makeChip() {
  const cv = document.createElement('canvas');
  const tex = new THREE.CanvasTexture(cv); tex.minFilter = THREE.LinearFilter;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false, opacity: 0 });
  const sp = new THREE.Sprite(mat); sp.renderOrder = 12;
  function draw(text, accent) {
    const fs = 34, padX = 24, padY = 14;
    let c = cv.getContext('2d'); c.font = '600 ' + fs + 'px ' + MONO;
    const tw = Math.ceil(c.measureText(text).width);
    cv.width = tw + padX * 2; cv.height = fs + padY * 2;
    c = cv.getContext('2d'); c.font = '600 ' + fs + 'px ' + MONO; c.textBaseline = 'middle';
    const r = cv.height / 2, W = cv.width, H = cv.height;
    c.beginPath();
    c.moveTo(r, 0); c.arcTo(W, 0, W, H, r); c.arcTo(W, H, 0, H, r); c.arcTo(0, H, 0, 0, r); c.arcTo(0, 0, W, 0, r); c.closePath();
    c.fillStyle = 'rgba(17,12,25,0.92)'; c.fill();
    c.lineWidth = 2.5; c.strokeStyle = accent || 'rgba(185,166,255,0.55)'; c.stroke();
    c.fillStyle = '#EAE3F6'; c.fillText(text, padX, H / 2 + 1);
    tex.needsUpdate = true;
    const hh = 0.48, a = W / H; sp.scale.set(hh * a, hh, 1);
  }
  return { sp, mat, tex, draw };
}

export function initFailoverNet(canvas, opts = {}) {
  if (!canvas) return { reset() {}, destroy() {} };
  const onStats = typeof opts.onStats === 'function' ? opts.onStats : () => {};
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ===== TUNABLES ===== */
  const SCALE = 1.6;          // overall size
  const ARC_LIFT = 0.26;      // how high the cables arch (× link length) — more = more 3D
  const PACKET_SPEED = 1.0;   // traffic speed
  const PARALLAX = 0.16;      // pointer tilt amount (whole scene leans)
  const NODE_Y = 0.58;        // nodes float this high over the grid floor (depth)
  const Z_STRETCH = 3.5;      // spread the topology north-south so it fills a tall box (extends down)
  const X_STRETCH = 1.6;      // spread the topology east-west (extends left + right)
  const FIT_PAD = 0.6;        // camera framing margin (smaller = network fills more)
  const SHIFT_X = -4.0;       // pan the network: + = right, − = left
  const SHIFT_Y = -1.0;       // pan the network: + = up,   − = down
  /* ==================== */

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.9));
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  const VIEW_DIR = new THREE.Vector3(0, 0.5, 1.0).normalize(); // low, oblique 3/4 view = more depth
  const group = new THREE.Group();
  group.scale.setScalar(SCALE);
  scene.add(group);

  const DISC = discTex();
  const RING = ringTex();
  const disposables = [DISC, RING];

  // floor anchor points (y=0) and elevated node points (discs/cables float above the grid)
  // x/z are stretched so the topology fills the tall column (extends down + left/right)
  const P = NODES.map((n) => new THREE.Vector3(n.x * X_STRETCH, 0, n.z * Z_STRETCH));
  const ND = NODES.map((n) => new THREE.Vector3(n.x * X_STRETCH, NODE_Y, n.z * Z_STRETCH));

  // adjacency + edge lookup
  const adj = NODES.map(() => []);
  const edgeKey = (u, v) => (u < v ? u + '-' + v : v + '-' + u);
  const edgeOf = {};
  LINKS.forEach((l, li) => { adj[l.a].push({ to: l.b, w: l.w, li }); adj[l.b].push({ to: l.a, w: l.w, li }); edgeOf[edgeKey(l.a, l.b)] = li; });

  const down = new Set();                 // cut link indices
  const routeLinks = new Set();           // links on the active traced route
  let linkUtil = LINKS.map(() => 0);
  let hoverLink = -1, hoverNode = -1, lastConv = 0, hotLi = -1;
  let routeSrc = -1, routeDst = -1, routePath = null;

  /* ---------- grid floor ---------- */
  (function grid() {
    const seg = [], x0 = -6.5 * X_STRETCH, x1 = 6.5 * X_STRETCH, z0 = -3.6 * Z_STRETCH, z1 = 4.2 * Z_STRETCH;
    for (let x = x0; x <= x1; x += 1) seg.push(x, 0, z0, x, 0, z1);
    for (let z = z0; z <= z1; z += 1) seg.push(x0, 0, z, x1, 0, z);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(seg, 3));
    const m = new THREE.LineBasicMaterial({ color: 0x6a5f8c, transparent: true, opacity: 0.07, depthWrite: false });
    group.add(new THREE.LineSegments(g, m)); disposables.push(g, m);
  })();

  /* ---------- arcs (cable geometry) ---------- */
  const SEG = 18;
  function arcPts(a, b) {
    const A = ND[a], B = ND[b], lift = Math.max(0.5, Math.min(1.5, A.distanceTo(B) * ARC_LIFT));
    const pts = [];
    for (let i = 0; i <= SEG; i++) {
      const t = i / SEG, p = A.clone().lerp(B, t);
      p.y += lift * Math.sin(Math.PI * t);
      pts.push(p);
    }
    return pts;
  }
  const linkArc = LINKS.map((l) => arcPts(l.a, l.b));

  /* ---------- visible links (fat lines) + invisible hit cylinders ---------- */
  const lineMats = [];
  const hitMeshes = [];
  LINKS.forEach((l, li) => {
    const pts = linkArc[li], flat = [];
    for (let i = 0; i < pts.length - 1; i++) flat.push(pts[i].x, pts[i].y, pts[i].z, pts[i + 1].x, pts[i + 1].y, pts[i + 1].z);
    const geo = new LineSegmentsGeometry(); geo.setPositions(flat);
    const mat = new LineMaterial({ color: 0x6a5f8c, linewidth: 3.2, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, dashed: false });
    mat.resolution.set(800, 600);
    const obj = new LineSegments2(geo, mat); obj.computeLineDistances();
    group.add(obj); disposables.push(geo, mat);
    l._obj = obj; l._mat = mat; lineMats.push(mat);

    const A = ND[l.a], B = ND[l.b], mid = A.clone().lerp(B, 0.5); mid.y += Math.max(0.5, Math.min(1.5, A.distanceTo(B) * ARC_LIFT)) * 0.7;
    const dir = B.clone().sub(A); const len = dir.length();
    const cyl = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.22, len, 6, 1, true),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    );
    cyl.position.copy(mid);
    cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    cyl.userData.li = li; group.add(cyl); hitMeshes.push(cyl); disposables.push(cyl.geometry, cyl.material);
  });

  /* ---------- nodes (pillar + glow disc + label) ---------- */
  const nodeObjs = [];
  P.forEach((p, i) => {
    const pg = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(p.x, 0, p.z), new THREE.Vector3(p.x, NODE_Y, p.z)]);
    const pm = new THREE.LineBasicMaterial({ color: 0x8d7fb8, transparent: true, opacity: 0.32, depthWrite: false });
    group.add(new THREE.Line(pg, pm)); disposables.push(pg, pm);
    const am = new THREE.SpriteMaterial({ map: DISC, color: 0x6a5f8c, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending });
    const anchor = new THREE.Sprite(am); anchor.position.set(p.x, 0.02, p.z); anchor.scale.setScalar(0.16); group.add(anchor); disposables.push(am);
    const dm = new THREE.SpriteMaterial({ map: DISC, color: LAV.getHex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const disc = new THREE.Sprite(dm); disc.position.set(p.x, NODE_Y, p.z); disc.scale.setScalar(0.42);
    disc.userData.ni = i; group.add(disc); disposables.push(dm);
    const lab = labelSprite(NAME[i]); lab.position.set(p.x, NODE_Y + 0.56, p.z); group.add(lab); disposables.push(lab.material.map, lab.material);
    nodeObjs.push({ disc, dm, lab, base: 0.42, ph: Math.random() * Math.PI * 2 });
  });
  const nodeDiscs = nodeObjs.map((o) => o.disc);

  /* ---------- packets ---------- */
  const PER = 4;
  const packets = [];
  FLOWS.forEach((f, fi) => {
    for (let k = 0; k < PER; k++) {
      const m = new THREE.SpriteMaterial({ map: DISC, color: 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
      const sp = new THREE.Sprite(m); sp.scale.setScalar(0.15); group.add(sp);
      packets.push({ sp, m, fi, t: k / PER }); disposables.push(m);
    }
  });

  const rings = []; // transient shock-ring pulses at cut points
  const floaters = []; // transient text read-outs (e.g. "↻ NN ms")
  const tip = makeChip(); group.add(tip.sp); disposables.push(tip.mat, tip.tex);

  /* ---------- routing ---------- */
  function dijkstra(s, d) {
    const dist = new Array(NODES.length).fill(Infinity), prev = new Array(NODES.length).fill(-1), vis = new Array(NODES.length).fill(false);
    dist[s] = 0;
    for (let it = 0; it < NODES.length; it++) {
      let u = -1, best = Infinity;
      for (let i = 0; i < NODES.length; i++) if (!vis[i] && dist[i] < best) { best = dist[i]; u = i; }
      if (u < 0) break; vis[u] = true; if (u === d) break;
      adj[u].forEach(({ to, w, li }) => { if (down.has(li)) return; const nd = dist[u] + w; if (nd < dist[to]) { dist[to] = nd; prev[to] = u; } });
    }
    if (dist[d] === Infinity) return null;
    const path = []; for (let v = d; v >= 0; v = prev[v]) path.unshift(v);
    return path;
  }
  function pathLinks(path) {
    if (!path) return null;
    const seq = [];
    for (let i = 0; i < path.length - 1; i++) seq.push(edgeOf[edgeKey(path[i], path[i + 1])]);
    return seq;
  }
  function buildPoly(f) {
    if (!f.linkSeq) { f.poly = null; return; }
    const poly = [];
    let cur = f.s;
    f.linkSeq.forEach((li) => {
      const l = LINKS[li], pts = linkArc[li], fwd = (l.a === cur);
      const ordered = fwd ? pts : pts.slice().reverse();
      ordered.forEach((p, idx) => { if (idx === 0 && poly.length) return; poly.push(p); });
      cur = fwd ? l.b : l.a;
    });
    f.poly = poly;
  }
  function sameSeq(a, b) {
    if (!a && !b) return true; if (!a || !b) return false; if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false; return true;
  }

  function recompute(report, srcLi) {
    let changed = 0, dropped = 0;
    FLOWS.forEach((f) => {
      const prevSeq = f.linkSeq;
      f.path = dijkstra(f.s, f.d);
      f.linkSeq = pathLinks(f.path);
      f.dropped = !f.path;
      buildPoly(f);
      if (report) { if (!sameSeq(prevSeq, f.linkSeq)) { changed++; } if (f.dropped) dropped++; }
    });
    linkUtil = LINKS.map(() => 0);
    FLOWS.forEach((f) => { if (f.linkSeq) f.linkSeq.forEach((li) => { linkUtil[li] += f.bw; }); });
    if (report) lastConv = Math.round(Math.min(190, 70 + changed * 24 + Math.random() * 30));
    if (routeSrc >= 0 && routeDst >= 0) recomputeRoute();
    updateLinkVisuals();
    pushStats();
    if (report && typeof srcLi === 'number' && srcLi >= 0) { spawnRing(srcLi); spawnFloatText(srcLi, '↻ ' + lastConv + ' ms', 'rgba(232,176,106,0.8)'); }
  }

  function pushStats() {
    let maxUtil = 0, maxLi = -1;
    LINKS.forEach((l, li) => { if (down.has(li)) return; const u = linkUtil[li] / l.cap; if (u > maxUtil) { maxUtil = u; maxLi = li; } });
    hotLi = maxLi;
    const affPct = Math.round((FLOWS.filter((f) => f.dropped).reduce((s, f) => s + f.bw, 0) / TOTAL_BW) * 100);
    // invisible live region only (no on-screen numbers) — keeps the demo accessible
    onStats('Backbone live — ' + down.size + ' link' + (down.size === 1 ? '' : 's') + ' down, ' + affPct + '% traffic dropped.');
  }

  function utilColor(u) {
    const c = new THREE.Color();
    if (u < 0.6) c.copy(COOL).lerp(LAV, u / 0.6);
    else if (u < 0.85) c.copy(LAV).lerp(PINK, (u - 0.6) / 0.25);
    else c.copy(PINK).lerp(AMBER, Math.min(1, (u - 0.85) / 0.25));
    return c;
  }
  function updateLinkVisuals() {
    const onPath = LINKS.map(() => false);
    FLOWS.forEach((f) => { if (f.linkSeq) f.linkSeq.forEach((li) => { onPath[li] = true; }); });
    const focus = hoverNode;
    LINKS.forEach((l, li) => {
      const mat = l._mat, isDown = down.has(li), isHoverL = li === hoverLink;
      if (isDown) {
        mat.color.copy(AMBER); mat.opacity = isHoverL ? 0.9 : 0.5;
        if (!mat.dashed) { mat.dashed = true; mat.dashSize = 0.28; mat.gapSize = 0.22; mat.needsUpdate = true; l._obj.computeLineDistances(); }
        return;
      }
      if (mat.dashed) { mat.dashed = false; mat.needsUpdate = true; }
      if (routeLinks.has(li)) { mat.color.copy(ROUTE); mat.opacity = 1.0; return; }
      const inc = focus >= 0 && (l.a === focus || l.b === focus);
      if (focus >= 0 && !inc) { mat.color.copy(DIM); mat.opacity = 0.1; return; }
      const u = linkUtil[li] / l.cap;
      if (onPath[li]) { mat.color.copy(utilColor(u)); mat.opacity = (isHoverL || inc) ? 1.0 : 0.6 + 0.3 * Math.min(1, u); }
      else { mat.color.copy(DIM); mat.opacity = (isHoverL || inc) ? 0.7 : 0.3; }
    });
  }

  function refreshTooltip() {
    if (hoverLink >= 0) {
      const l = LINKS[hoverLink], isD = down.has(hoverLink), u = Math.round((linkUtil[hoverLink] / l.cap) * 100);
      tip.draw(isD ? (NAME[l.a] + ' ⇎ ' + NAME[l.b] + ' · DOWN') : (NAME[l.a] + ' → ' + NAME[l.b] + ' · ' + u + '% · ' + l.w + 'ms · ' + l.cap + 'G'), isD ? 'rgba(232,176,106,0.7)' : 'rgba(185,166,255,0.55)');
      const mid = linkArc[hoverLink][Math.round(SEG / 2)];
      tip.sp.position.set(mid.x, mid.y + 0.42, mid.z); tip.mat.opacity = 1;
    } else if (hoverNode >= 0) {
      const deg = adj[hoverNode].filter((e) => !down.has(e.li)).length, n = ND[hoverNode];
      tip.draw(NAME[hoverNode] + ' · ' + deg + ' link' + (deg === 1 ? '' : 's'), 'rgba(185,166,255,0.6)');
      tip.sp.position.set(n.x, n.y + 0.95, n.z); tip.mat.opacity = 1;
    } else { tip.mat.opacity = 0; }
  }

  /* ---------- route explorer (pure-visual: lights the live shortest path) ---------- */
  function recomputeRoute() {
    routeLinks.clear(); routePath = null;
    if (routeSrc < 0 || routeDst < 0) return;
    routePath = dijkstra(routeSrc, routeDst);
    if (routePath) pathLinks(routePath).forEach((li) => routeLinks.add(li));
  }
  function clearRoute() {
    if (routeSrc < 0 && routeDst < 0) return;
    routeSrc = -1; routeDst = -1; routeLinks.clear(); routePath = null;
    updateLinkVisuals();
  }
  function handleNodeClick(ni) {
    if (routeSrc < 0) { routeSrc = ni; routeDst = -1; }
    else if (routeSrc === ni && routeDst < 0) { routeSrc = -1; }
    else if (routeDst < 0) { routeDst = ni; }
    else { routeSrc = ni; routeDst = -1; }
    recomputeRoute(); updateLinkVisuals();
  }

  /* ---------- shock-ring pulse (visual reconvergence cue, no number) ---------- */
  function spawnRing(li) {
    const m = new THREE.SpriteMaterial({ map: RING, color: AMBER.getHex(), transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, opacity: 0.9 });
    const sp = new THREE.Sprite(m); sp.renderOrder = 11;
    const mid = linkArc[li][Math.round(SEG / 2)];
    sp.position.copy(mid); sp.scale.setScalar(0.3); group.add(sp);
    rings.push({ sp, m, born: performance.now(), life: 760 });
  }

  /* ---------- transient floating text (e.g. "↻ NN ms" at the cut, rises + fades) ---------- */
  function spawnFloatText(li, text, accent) {
    const c = makeChip(); c.draw(text, accent);
    const mid = linkArc[li][Math.round(SEG / 2)];
    c.sp.position.set(mid.x, mid.y + 0.5, mid.z); c.mat.opacity = 0; c.sp.renderOrder = 13;
    group.add(c.sp);
    floaters.push({ sp: c.sp, mat: c.mat, tex: c.tex, born: performance.now(), life: 1500, y0: mid.y + 0.5 });
  }

  /* ---------- interaction ---------- */
  const ray = new THREE.Raycaster(); ray.params.Line = { threshold: 0.3 };
  const ndc = new THREE.Vector2(-5, -5);
  const mouse = new THREE.Vector2(0, 0); let mouseIn = false;
  function setNDC(clientX, clientY) {
    const r = canvas.getBoundingClientRect();
    ndc.x = ((clientX - r.left) / r.width) * 2 - 1;
    ndc.y = -((clientY - r.top) / r.height) * 2 + 1;
    mouse.x = ndc.x; mouse.y = ndc.y; mouseIn = true;
  }
  function pickNode() { ray.setFromCamera(ndc, camera); const h = ray.intersectObjects(nodeDiscs, false); return h.length ? h[0].object.userData.ni : -1; }
  function pickLink() { ray.setFromCamera(ndc, camera); const h = ray.intersectObjects(hitMeshes, false); return h.length ? h[0].object.userData.li : -1; }
  function toggleLink(li) {
    if (li < 0) return;
    if (down.has(li)) down.delete(li); else down.add(li);
    const l = LINKS[li];
    if (l._obj && l._obj.scale) { l._obj.scale.setScalar(0.92); setTimeout(() => { if (l._obj) l._obj.scale.setScalar(1); }, 130); }
    recompute(true, li);
  }

  const onMove = (e) => {
    setNDC(e.clientX, e.clientY);
    const ni = pickNode(); const li = ni < 0 ? pickLink() : -1;
    if (ni !== hoverNode || li !== hoverLink) { hoverNode = ni; hoverLink = li; updateLinkVisuals(); refreshTooltip(); }
    canvas.style.cursor = (ni >= 0 || li >= 0) ? 'pointer' : 'default';
  };
  const onLeave = () => {
    ndc.set(-5, -5); mouseIn = false;
    if (hoverNode !== -1 || hoverLink !== -1) { hoverNode = -1; hoverLink = -1; updateLinkVisuals(); refreshTooltip(); }
  };
  const onDown = (e) => {
    setNDC(e.clientX, e.clientY);
    const ni = pickNode(); if (ni >= 0) { handleNodeClick(ni); return; }
    const li = pickLink(); if (li >= 0) { toggleLink(li); return; }
    clearRoute();
  };
  const onDbl = (e) => {
    setNDC(e.clientX, e.clientY);
    if (pickNode() >= 0 || pickLink() >= 0) return;
    if (down.size) { down.clear(); recompute(true); }
    clearRoute();
  };
  const onTouchStart = (e) => { const t = e.touches[0]; if (!t) return; setNDC(t.clientX, t.clientY); };
  const onTouchEnd = () => {
    const ni = pickNode(); if (ni >= 0) { handleNodeClick(ni); ndc.set(-5, -5); mouseIn = false; return; }
    const li = pickLink(); if (li >= 0) { toggleLink(li); } else { clearRoute(); }
    ndc.set(-5, -5); mouseIn = false;
  };
  canvas.addEventListener('mousemove', onMove);
  canvas.addEventListener('mouseleave', onLeave);
  canvas.addEventListener('mousedown', onDown);
  canvas.addEventListener('dblclick', onDbl);
  canvas.addEventListener('touchstart', onTouchStart, { passive: true });
  canvas.addEventListener('touchend', onTouchEnd);

  /* ---------- loop ---------- */
  let rafId = 0, destroyed = false, visible = true, cw = 800, ch = 600;
  function animate() {
    if (destroyed) return;
    const now = performance.now();
    // gentle parallax + slow idle drift (the whole scene leans)
    const idleY = reduce ? 0 : Math.sin(now * 0.00022) * 0.06;
    const idleX = reduce ? 0 : Math.sin(now * 0.00017 + 1.3) * 0.03;
    const tgY = (mouseIn && !reduce ? mouse.x * PARALLAX : 0) + idleY;
    const tgX = (mouseIn && !reduce ? -mouse.y * (PARALLAX * 0.6) : 0) + idleX;
    group.rotation.y += (tgY - group.rotation.y) * 0.06;
    group.rotation.x += (tgX - group.rotation.x) * 0.06;

    for (let i = 0; i < nodeObjs.length; i++) {
      const nd = nodeObjs[i];
      const tw = reduce ? 0.85 : 0.6 + 0.4 * Math.sin(now * 0.001 + nd.ph);
      const isRoute = (i === routeSrc || i === routeDst);
      const hot = (i === hoverNode) || isRoute;
      nd.dm.color.copy(isRoute ? ROUTE : LAV);
      nd.dm.opacity = (hot ? 1 : 0.55 + 0.35 * tw);
      nd.disc.scale.setScalar(nd.base * (hot ? 1.35 : 0.92 + 0.16 * tw));
    }

    // busiest live cable breathes
    if (hotLi >= 0 && !down.has(hotLi) && !routeLinks.has(hotLi)) {
      const s = 0.5 + 0.5 * Math.sin(now * 0.004);
      LINKS[hotLi]._mat.opacity = Math.min(1, 0.7 + 0.3 * s);
    }

    for (let p = 0; p < packets.length; p++) {
      const pk = packets[p], f = FLOWS[pk.fi];
      if (f.dropped) {
        // leak red packets at the source
        if (!reduce) { pk.t += 0.012 * PACKET_SPEED; if (pk.t >= 1) pk.t -= 1; }
        const src = ND[f.s];
        pk.sp.position.set(src.x + (pk.t - 0.5) * 0.22, src.y - pk.t * 0.85, src.z + (pk.t - 0.5) * 0.22);
        pk.m.color.copy(REDPK); pk.m.opacity = 0.85 * (1 - pk.t);
        continue;
      }
      if (!f.poly) { pk.m.opacity = 0; continue; }
      pk.m.color.setHex(0xffffff);
      if (!reduce) pk.t += (0.0022 + 0.0012 * (pk.fi % 2)) * PACKET_SPEED;
      if (pk.t >= 1) pk.t -= 1;
      const poly = f.poly, fpos = pk.t * (poly.length - 1), i0 = Math.floor(fpos), i1 = Math.min(poly.length - 1, i0 + 1);
      pk.sp.position.lerpVectors(poly[i0], poly[i1], fpos - i0);
      const onR = f.linkSeq && f.linkSeq.some((li) => routeLinks.has(li));
      pk.m.opacity = onR ? 1 : 0.9;
    }

    // shock-ring pulses expand + fade
    for (let i = rings.length - 1; i >= 0; i--) {
      const rg = rings[i], age = (now - rg.born) / rg.life;
      if (age >= 1) { group.remove(rg.sp); try { rg.m.dispose(); } catch (e) { /* noop */ } rings.splice(i, 1); continue; }
      rg.sp.scale.setScalar(0.3 + age * 1.8);
      rg.m.opacity = 0.9 * (1 - age);
    }

    // transient text read-outs rise + fade
    for (let i = floaters.length - 1; i >= 0; i--) {
      const fl = floaters[i], age = (now - fl.born) / fl.life;
      if (age >= 1) { group.remove(fl.sp); try { fl.tex.dispose(); fl.mat.dispose(); } catch (e) { /* noop */ } floaters.splice(i, 1); continue; }
      fl.sp.position.y = fl.y0 + age * 0.7;
      fl.mat.opacity = age < 0.15 ? age / 0.15 : (1 - (age - 0.15) / 0.85);
    }

    renderer.render(scene, camera);
    rafId = 0;
    if (visible && !destroyed && !document.hidden) rafId = requestAnimationFrame(animate);
  }
  function start() { if (rafId || destroyed || !visible || document.hidden) return; rafId = requestAnimationFrame(animate); }
  function stop() { if (rafId) { cancelAnimationFrame(rafId); rafId = 0; } }

  // frame the whole topology with margin (network fills the canvas)
  const fitCenter = new THREE.Vector3();
  let fitRadius = 6;
  (function computeBounds() {
    const box = new THREE.Box3();
    ND.forEach((p) => box.expandByPoint(p));
    box.getCenter(fitCenter);
    fitRadius = 0;
    ND.forEach((p) => { fitRadius = Math.max(fitRadius, p.distanceTo(fitCenter)); });
    fitRadius += 1.6;  // room for labels + arc apexes
  })();
  function fitCamera() {
    const vFov = (camera.fov * Math.PI) / 180;
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
    const half = Math.min(vFov, hFov) / 2;
    const wc = fitCenter.clone().multiplyScalar(SCALE);
    wc.x -= SHIFT_X; wc.y -= SHIFT_Y;   // pan the network within the frame
    const dist = ((fitRadius * SCALE) / Math.sin(half)) * FIT_PAD;
    camera.position.copy(wc).add(VIEW_DIR.clone().multiplyScalar(dist));
    camera.lookAt(wc);
    camera.updateProjectionMatrix();
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    cw = r.width || 800; ch = r.height || 600;
    renderer.setSize(cw, ch, false); camera.aspect = cw / ch;
    fitCamera();
    lineMats.forEach((m) => m.resolution.set(cw, ch));
  }
  const onResize = () => resize();
  const onVis = () => { if (document.hidden) stop(); else start(); };
  window.addEventListener('resize', onResize);
  document.addEventListener('visibilitychange', onVis);
  let io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver((es) => { const v = es.some((e) => e.isIntersecting); if (v === visible) return; visible = v; if (v) { resize(); start(); } else stop(); }, { rootMargin: '160px 0px' });
    io.observe(canvas);
  }
  let ro = null;
  if ('ResizeObserver' in window) {
    ro = new ResizeObserver(() => { if (!destroyed) resize(); });
    ro.observe(canvas);
  }

  recompute(false);     // initial routes + visuals
  resize();
  start();
  setTimeout(resize, 300);

  return {
    reset() { down.clear(); lastConv = 0; clearRoute(); recompute(true); },
    destroy() {
      destroyed = true; stop();
      if (io) io.disconnect();
      if (ro) ro.disconnect();
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
      canvas.removeEventListener('mousedown', onDown);
      canvas.removeEventListener('dblclick', onDbl);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchend', onTouchEnd);
      rings.forEach((rg) => { try { rg.m.dispose(); } catch (e) { /* noop */ } });
      floaters.forEach((fl) => { try { fl.tex.dispose(); fl.mat.dispose(); } catch (e) { /* noop */ } });
      disposables.forEach((d) => { try { d.dispose(); } catch (e) { /* noop */ } });
      try { renderer.dispose(); } catch (e) { /* noop */ }
    },
  };
}