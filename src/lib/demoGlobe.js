/* ============================================================
   demoGlobe.js — AWS Global Backbone (interactive + fancy)
   Drag to spin · hover a region (globe turns it to front + radar ping, its
   arcs light) · click to broadcast · wheel to zoom · double-click to reset.
   Comet-tail traffic · day/night terminator · ground glow. No numbers.
   ============================================================ */
import * as THREE from 'three';
import { makeStage, makeOrbit, makePicker, makeTrail, discTexture, ringTexture } from './caseDemoCore.js';

const REGIONS = [
  [45, -120], [37, -122], [38, -77], [41, -88], [-23, -46], [4, -74],
  [53, -8], [51, 0], [48, 2], [50, 8], [59, 18], [19, 72],
  [1, 103], [35, 139], [37, 127], [-33, 151], [24, 54], [25, 55],
  [-33, 18], [6, 3], [30, 31], [22, 114],
];
const PAIRS = [
  [0, 1], [1, 2], [2, 3], [0, 3], [2, 4], [4, 5], [2, 6], [6, 7], [7, 8], [8, 9],
  [9, 10], [6, 9], [2, 7], [9, 11], [11, 16], [16, 17], [9, 16], [11, 12], [12, 21], [21, 13],
  [13, 14], [12, 15], [11, 18], [18, 19], [19, 20], [20, 16], [18, 4], [0, 13], [1, 15], [13, 15],
  [12, 16], [9, 20], [5, 4], [7, 9], [14, 13], [12, 11], [2, 8], [15, 21],
];
function llToVec(lat, lng, r) {
  const phi = (90 - lat) * Math.PI / 180, th = (lng + 180) * Math.PI / 180;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
}

export function initGlobe(canvas, opts = {}) {
  const stage = makeStage(canvas, { fov: 38, fog: 0.045, bloomStrength: 0.85, bloomThreshold: 0.14 });
  const { scene, camera, reduce } = stage;
  const accent = new THREE.Color(opts.accent || '#8FB4FF');
  const LAV = new THREE.Color('#B9A6FF'), PINK = new THREE.Color('#FF9EC4');
  const DISC = discTexture(), RING = ringTexture();
  const disposables = [DISC, RING];

  camera.position.set(0, 0.2, 7.0);
  let camZ = 7.0, camZTarget = 7.0;
  const group = new THREE.Group(); scene.add(group);
  const R = 2.2;
  const orbit = makeOrbit(canvas, { idle: reduce ? 0 : 0.0016, restX: -0.18, x0: -0.18, parallax: 0.08, breathe: 0.01 });
  orbit.onReset(() => { camZTarget = 7.0; });
  const picker = makePicker(canvas, camera);

  // ground glow puddle (stays under the globe)
  const puddleMat = new THREE.SpriteMaterial({ map: DISC, color: accent.getHex(), transparent: true, opacity: 0.22, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending });
  const puddle = new THREE.Sprite(puddleMat); puddle.scale.set(R * 3.0, R * 1.1, 1); puddle.position.set(0, -R * 1.16, -0.2); puddle.renderOrder = -3; scene.add(puddle); disposables.push(puddleMat);

  // atmosphere
  const atmoMat = new THREE.SpriteMaterial({ map: DISC, color: accent.getHex(), transparent: true, opacity: 0.16, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending });
  const atmo = new THREE.Sprite(atmoMat); atmo.scale.setScalar(R * 3.1); atmo.renderOrder = -2; group.add(atmo); disposables.push(atmoMat);

  const sGeo = new THREE.SphereGeometry(R, 44, 30);
  const wGeo = new THREE.WireframeGeometry(sGeo);
  const wMat = new THREE.LineBasicMaterial({ color: 0x6a5f8c, transparent: true, opacity: 0.09, depthWrite: false });
  group.add(new THREE.LineSegments(wGeo, wMat)); disposables.push(sGeo, wGeo, wMat);

  const iGeo = new THREE.SphereGeometry(R * 0.99, 36, 24);
  const iMat = new THREE.MeshBasicMaterial({ color: 0x0c0a12, transparent: true, opacity: 0.92, fog: false });
  group.add(new THREE.Mesh(iGeo, iMat)); disposables.push(iGeo, iMat);

  // surface dot-field with day/night terminator
  const M = 460, dotDirs = [], dotPos = new Float32Array(M * 3), dotCol = new Float32Array(M * 3);
  const dotBase = new THREE.Color(0x9a8cc4), gold = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < M; i++) {
    const y = 1 - (i / (M - 1)) * 2, rr = Math.sqrt(1 - y * y), th = gold * i;
    const d = new THREE.Vector3(Math.cos(th) * rr, y, Math.sin(th) * rr); dotDirs.push(d);
    const p = d.clone().multiplyScalar(R * 1.002);
    dotPos[i * 3] = p.x; dotPos[i * 3 + 1] = p.y; dotPos[i * 3 + 2] = p.z;
  }
  const dotGeo = new THREE.BufferGeometry();
  dotGeo.setAttribute('position', new THREE.BufferAttribute(dotPos, 3));
  dotGeo.setAttribute('color', new THREE.BufferAttribute(dotCol, 3));
  const dotMat = new THREE.PointsMaterial({ map: DISC, size: 0.05, vertexColors: true, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
  group.add(new THREE.Points(dotGeo, dotMat)); disposables.push(dotGeo, dotMat);

  const node = REGIONS.map((c) => llToVec(c[0], c[1], R * 1.004));
  const regionSprites = node.map((p, idx) => {
    const m = new THREE.SpriteMaterial({ map: DISC, color: accent.getHex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const sp = new THREE.Sprite(m); sp.position.copy(p); sp.scale.setScalar(0.14); sp.userData.idx = idx; group.add(sp); disposables.push(m);
    return sp;
  });

  // arcs + comet-tail pulses
  const arcs = [], pulses = [];
  PAIRS.forEach((pr, i) => {
    const a = node[pr[0]], b = node[pr[1]];
    const mid = a.clone().add(b).multiplyScalar(0.5);
    const lift = 1.12 + 0.55 * (a.distanceTo(b) / (2 * R));
    mid.normalize().multiplyScalar(R * lift);
    const curve = new THREE.QuadraticBezierCurve3(a.clone(), mid, b.clone());
    const g = new THREE.BufferGeometry().setFromPoints(curve.getPoints(46));
    const col = i % 3 === 0 ? PINK : (i % 3 === 1 ? accent : LAV);
    const m = new THREE.LineBasicMaterial({ color: col.getHex(), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    group.add(new THREE.Line(g, m)); disposables.push(g, m);
    arcs.push({ m, pr, phase: Math.random() * Math.PI * 2, base: 0.26 + Math.random() * 0.26 });
    for (let k = 0; k < 2; k++) pulses.push({ curve, arc: i, pr, col, t: Math.random(), spd: 0.0024 + Math.random() * 0.004 });
  });
  const trail = makeTrail(group, { count: pulses.length, len: 7, size: 0.085, tex: DISC });
  pulses.forEach((p, i) => trail.setColor(i, p.col, 1.1));

  // ring pool (radar pings + broadcast ripples)
  const rings = [];
  for (let i = 0; i < 6; i++) {
    const m = new THREE.SpriteMaterial({ map: RING, color: accent.getHex(), transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, opacity: 0 });
    const sp = new THREE.Sprite(m); sp.renderOrder = 11; group.add(sp); disposables.push(m);
    rings.push({ sp, m, born: -1, dur: 760, max: 2.4 });
  }
  function fireRing(pos, dur, max, color) {
    const r = rings.find((x) => x.born < 0) || rings[0];
    r.sp.position.copy(pos); r.m.color.set(color); r.born = performance.now(); r.dur = dur; r.max = max;
  }

  let focus = -1, lastKey = '', boostUntil = 0, boostRegion = -1;
  function recolorTrails() {
    const b = boostRegion >= 0 && performance.now() < boostUntil ? boostRegion : -1;
    for (let i = 0; i < pulses.length; i++) {
      const p = pulses[i], lit = (focus >= 0 && (p.pr[0] === focus || p.pr[1] === focus)) || (b >= 0 && (p.pr[0] === b || p.pr[1] === b));
      trail.setColor(i, p.col, focus >= 0 || b >= 0 ? (lit ? 1.5 : 0.12) : 1.1);
    }
  }
  const onMove = (e) => {
    if (orbit.dragging) return;
    const hit = picker(regionSprites, e);
    const idx = hit ? hit.object.userData.idx : -1;
    if (idx !== focus) {
      focus = idx;
      canvas.style.cursor = hit ? 'pointer' : '';
      if (idx >= 0) { orbit.spinTo(-Math.atan2(node[idx].x, node[idx].z)); fireRing(node[idx], 1100, 1.7, accent.getHex()); }
    }
  };
  const onLeave = () => { focus = -1; };
  canvas.addEventListener('mousemove', onMove);
  canvas.addEventListener('mouseleave', onLeave);
  orbit.onTap((e) => {
    const hit = picker(regionSprites, e); if (!hit) return;
    const idx = hit.object.userData.idx;
    fireRing(node[idx], 820, 2.6, PINK.getHex()); boostRegion = idx; boostUntil = performance.now() + 1500;
  });
  const onWheel = (e) => { e.preventDefault(); e.stopPropagation(); camZTarget = Math.max(5.0, Math.min(9.6, camZTarget + e.deltaY * 0.0022)); };
  canvas.addEventListener('wheel', onWheel, { passive: false });

  const sun = new THREE.Vector3();
  stage.onFrame((now) => {
    orbit.apply(group, now);
    camZ += (camZTarget - camZ) * 0.08; camera.position.z = camZ;

    // day/night terminator on the dot-field
    sun.set(Math.cos(now * 0.00018), 0.35, Math.sin(now * 0.00018)).normalize();
    for (let i = 0; i < M; i++) {
      const lit = Math.max(0.12, Math.min(1.1, dotDirs[i].dot(sun) * 0.6 + 0.55));
      dotCol[i * 3] = dotBase.r * lit; dotCol[i * 3 + 1] = dotBase.g * lit; dotCol[i * 3 + 2] = dotBase.b * lit;
    }
    dotGeo.attributes.color.needsUpdate = true;

    const boosting = now < boostUntil ? boostRegion : -1;
    const key = focus + '|' + boosting;
    if (key !== lastKey) { recolorTrails(); lastKey = key; }

    for (let i = 0; i < arcs.length; i++) {
      const a = arcs[i], lit = (focus >= 0 && (a.pr[0] === focus || a.pr[1] === focus)) || (boosting >= 0 && (a.pr[0] === boosting || a.pr[1] === boosting));
      const breath = a.base * (0.5 + 0.5 * Math.sin(now * 0.0012 + a.phase));
      a.m.opacity = (focus >= 0 || boosting >= 0) ? (lit ? Math.min(1, breath * 1.7 + 0.18) : breath * 0.14) : breath;
    }
    for (let i = 0; i < regionSprites.length; i++) regionSprites[i].scale.setScalar((i === focus || i === boosting) ? 0.22 : 0.14);

    for (let i = 0; i < pulses.length; i++) {
      const p = pulses[i], hot = (focus >= 0 && (p.pr[0] === focus || p.pr[1] === focus)) || (boosting >= 0 && (p.pr[0] === boosting || p.pr[1] === boosting));
      const prev = p.t; p.t += reduce ? 0 : p.spd * (hot ? 2.4 : 1);
      const pt = p.curve.getPoint(p.t % 1);
      if (p.t >= 1) { p.t -= 1; trail.reset(i, pt.x, pt.y, pt.z); } else trail.push(i, pt.x, pt.y, pt.z);
      void prev;
    }
    trail.flush();

    for (let i = 0; i < rings.length; i++) {
      const rp = rings[i]; if (rp.born < 0) continue;
      const age = (now - rp.born) / rp.dur;
      if (age >= 1) { rp.born = -1; rp.m.opacity = 0; continue; }
      rp.sp.scale.setScalar(0.3 + age * rp.max); rp.m.opacity = 0.9 * (1 - age);
    }
    atmoMat.opacity = 0.14 + 0.04 * Math.sin(now * 0.001);
    puddleMat.opacity = 0.2 + 0.05 * Math.sin(now * 0.0016);
  });
  stage.begin();

  return {
    destroy() {
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
      canvas.removeEventListener('wheel', onWheel);
      orbit.destroy(); trail.dispose();
      disposables.forEach((d) => { try { d.dispose && d.dispose(); } catch (e) { /* noop */ } });
      stage.destroy();
    },
  };
}
