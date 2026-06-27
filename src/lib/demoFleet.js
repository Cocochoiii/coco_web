/* ============================================================
   demoFleet.js — Volkswagen · Audi (interactive + fancy)
   Drag to orbit · hover a source to light its conduits · click a source for a
   burst · click empty ground to spawn a new data source. Particles colour-coded
   by source with comet tails; reactor core throbs; blocks flash on arrival;
   Tron floor sweep. No numbers.
   ============================================================ */
import * as THREE from 'three';
import { makeStage, makeOrbit, makePicker, makeTrail, discTexture } from './caseDemoCore.js';

export function initFleet(canvas, opts = {}) {
  const stage = makeStage(canvas, { fov: 42, fog: 0.04, bloomStrength: 0.7 });
  const { scene, camera, reduce } = stage;
  const accent = new THREE.Color(opts.accent || '#9EC0FF');
  const LAV = new THREE.Color('#B9A6FF'), PINK = new THREE.Color('#FF9EC4'), COOL = new THREE.Color('#8FB4FF');
  const DISC = discTexture();
  const disposables = [DISC];

  camera.position.set(0, 2.6, 8.6);
  camera.lookAt(0, 0.6, 0);
  const group = new THREE.Group(); scene.add(group);
  const orbit = makeOrbit(canvas, { idle: 0, restX: 0, parallax: 0.07, breathe: 0.012 });
  const picker = makePicker(canvas, camera);

  (function grid() {
    const seg = [], x0 = -5.5, x1 = 5.5, z0 = -4.5, z1 = 4.5;
    for (let x = x0; x <= x1; x++) seg.push(x, 0, z0, x, 0, z1);
    for (let z = z0; z <= z1; z++) seg.push(x0, 0, z, x1, 0, z);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(seg, 3));
    const m = new THREE.LineBasicMaterial({ color: 0x6a5f8c, transparent: true, opacity: 0.08, depthWrite: false });
    group.add(new THREE.LineSegments(g, m)); disposables.push(g, m);
  })();

  // Tron floor sweep (two scanning bars)
  const palette = [LAV, accent, PINK, COOL];
  function sweeper(horizontal) {
    const g = new THREE.BufferGeometry().setFromPoints(horizontal ? [new THREE.Vector3(-5.5, 0.01, 0), new THREE.Vector3(5.5, 0.01, 0)] : [new THREE.Vector3(0, 0.01, -4.5), new THREE.Vector3(0, 0.01, 4.5)]);
    const m = new THREE.LineBasicMaterial({ color: accent.getHex(), transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending });
    const line = new THREE.Line(g, m); group.add(line); disposables.push(g, m);
    return { g, line, horizontal };
  }
  const sweeps = [sweeper(true), sweeper(false)];

  const PROC = new THREE.Vector3(0, 2.1, 0);
  const sources = [-4.2, -3, -1.6, -0.5, 0.7, 1.8, 3, 4.2].map((x, i) => new THREE.Vector3(x, 0.05, 3.6 - (i % 2) * 0.6));
  const sourceColors = sources.map((_, i) => palette[i % palette.length]);
  const slots = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) slots.push(new THREE.Vector3(-3.6 + c * 1.2, 0.4 + r * 0.72, -3.4));

  const sourceSprites = [];
  function addSourceVisual(s, idx) {
    const c = sourceColors[idx];
    const m = new THREE.SpriteMaterial({ map: DISC, color: c.getHex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const sp = new THREE.Sprite(m); sp.position.copy(s); sp.scale.setScalar(0.32); sp.userData.idx = idx; group.add(sp); disposables.push(m); sourceSprites.push(sp);
    const bg = new THREE.BufferGeometry().setFromPoints([s.clone(), s.clone().setY(1.1)]);
    const bm = new THREE.LineBasicMaterial({ color: c.getHex(), transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending });
    group.add(new THREE.Line(bg, bm)); disposables.push(bg, bm);
  }
  sources.forEach(addSourceVisual);

  const bGeo = new THREE.BoxGeometry(0.42, 0.42, 0.42); disposables.push(bGeo);
  const blocks = [];
  slots.forEach((p) => {
    const m = new THREE.MeshBasicMaterial({ color: LAV.getHex(), transparent: true, opacity: 0.16, depthWrite: false, blending: THREE.AdditiveBlending });
    const cube = new THREE.Mesh(bGeo, m); cube.position.copy(p); group.add(cube); disposables.push(m);
    blocks.push({ m, ph: Math.random() * Math.PI * 2, flash: 0 });
  });

  const coreMat = new THREE.SpriteMaterial({ map: DISC, color: PINK.getHex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const core = new THREE.Sprite(coreMat); core.position.copy(PROC); core.scale.setScalar(1.0); group.add(core); disposables.push(coreMat);
  const rings = [];
  for (let i = 0; i < 3; i++) {
    const rg = new THREE.TorusGeometry(0.5 + i * 0.22, 0.018, 8, 48);
    const rm = new THREE.MeshBasicMaterial({ color: (i === 1 ? accent : (i === 0 ? COOL : LAV)).getHex(), transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending });
    const ring = new THREE.Mesh(rg, rm); ring.position.copy(PROC); ring.rotation.x = Math.PI / 2 + i * 0.5; ring.rotation.y = i * 0.4;
    group.add(ring); disposables.push(rg, rm); rings.push({ ring, spd: 0.0008 + i * 0.0006, axis: i % 2 });
  }

  // conduits — each tied to a source + a destination slot
  const LANES = [], laneSource = [], laneSlot = [], laneMats = [];
  function addLane(si, slotIdx) {
    const s = sources[si], w = slots[slotIdx];
    const inP = PROC.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.7, -0.4, (Math.random() - 0.5) * 0.7));
    const outP = PROC.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.7, 0.35, (Math.random() - 0.5) * 0.7));
    const curve = new THREE.CatmullRomCurve3([s.clone(), inP, outP, w.clone()]);
    const g = new THREE.BufferGeometry().setFromPoints(curve.getPoints(40));
    const m = new THREE.LineBasicMaterial({ color: 0x7d70a8, transparent: true, opacity: 0.12, depthWrite: false, blending: THREE.AdditiveBlending });
    group.add(new THREE.Line(g, m)); disposables.push(g, m);
    LANES.push(curve); laneSource.push(si); laneSlot.push(slotIdx); laneMats.push(m);
  }
  for (let i = 0; i < 20; i++) addLane(i % sources.length, (i * 5) % slots.length);

  // particles = comet trails (head is the particle), colour-coded by source
  const N = 480, parts = [];
  const trail = makeTrail(group, { count: N, len: 4, size: 0.15, tex: DISC });
  for (let i = 0; i < N; i++) {
    const lane = (Math.random() * LANES.length) | 0;
    parts.push({ lane, t: Math.random(), spd: 0.0026 + Math.random() * 0.0034 });
    trail.setColor(i, sourceColors[laneSource[lane]], 1.0);
  }

  let focus = -1, burstSrc = -1, burstUntil = 0, coreThrob = 0, extra = 0;
  const onMove = (e) => {
    if (orbit.dragging) { focus = -1; return; }
    const hit = picker(sourceSprites, e);
    focus = hit ? hit.object.userData.idx : -1;
    canvas.style.cursor = hit ? 'pointer' : '';
  };
  const onLeave = () => { focus = -1; };
  canvas.addEventListener('mousemove', onMove);
  canvas.addEventListener('mouseleave', onLeave);

  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hitW = new THREE.Vector3();
  orbit.onTap((e) => {
    const hit = picker(sourceSprites, e);
    if (hit) { burstSrc = hit.object.userData.idx; burstUntil = performance.now() + 1200; coreThrob = 1; return; }
    if (extra >= 4) return;                          // spawn a new source on empty ground
    picker.setRay(e);
    if (!picker.ray.ray.intersectPlane(groundPlane, hitW)) return;
    group.worldToLocal(hitW);
    const x = Math.max(-5, Math.min(5, hitW.x)), z = Math.max(2.2, Math.min(4.3, hitW.z));
    const s = new THREE.Vector3(x, 0.05, z), si = sources.length;
    sources.push(s); sourceColors.push(palette[si % palette.length]); addSourceVisual(s, si);
    addLane(si, (si * 7) % slots.length); addLane(si, (si * 11 + 3) % slots.length);
    extra++; burstSrc = si; burstUntil = performance.now() + 1400; coreThrob = 1;
  });

  const v = new THREE.Vector3();
  stage.onFrame((now) => {
    orbit.apply(group, now);
    coreThrob *= 0.93;
    core.scale.setScalar((1.0 + 0.14 * Math.sin(now * 0.004)) * (1 + 0.5 * coreThrob));
    coreMat.opacity = 0.85 + 0.15 * coreThrob;
    for (let i = 0; i < rings.length; i++) { const rr = rings[i], sp = rr.spd * (1 + 2 * coreThrob); if (rr.axis) rr.ring.rotation.z = now * sp; else rr.ring.rotation.y = now * sp; }

    // Tron sweep bars
    const sz = ((now * 0.0004) % 1) * 9 - 4.5, sx = ((now * 0.00031) % 1) * 11 - 5.5;
    sweeps[0].line.position.z = sz; sweeps[1].line.position.x = sx;
    sweeps[0].line.material.opacity = 0.35 + 0.2 * Math.sin(now * 0.004);
    sweeps[1].line.material.opacity = 0.3 + 0.2 * Math.cos(now * 0.004);

    const bursting = now < burstUntil ? burstSrc : -1;
    for (let i = 0; i < laneMats.length; i++) {
      const si = laneSource[i], lit = (focus >= 0 && si === focus) || (bursting >= 0 && si === bursting);
      laneMats[i].opacity = focus >= 0 ? (lit ? 0.5 : 0.04) : (bursting >= 0 ? (lit ? 0.5 : 0.12) : 0.12);
    }
    for (let i = 0; i < sourceSprites.length; i++) sourceSprites[i].scale.setScalar((i === focus || i === bursting) ? 0.46 : 0.32);

    for (let i = 0; i < N; i++) {
      const p = parts[i], si = laneSource[p.lane], fast = (bursting >= 0 && si === bursting) ? 3.0 : 1;
      p.t += reduce ? 0 : p.spd * fast;
      LANES[p.lane].getPoint(Math.min(p.t, 1), v);
      if (p.t >= 1) {
        blocks[laneSlot[p.lane]].flash = 1;          // arrival flash
        p.t = 0; p.lane = (Math.random() * LANES.length) | 0;
        trail.setColor(i, sourceColors[laneSource[p.lane]], 1.0);
        LANES[p.lane].getPoint(0, v); trail.reset(i, v.x, v.y, v.z);
      } else trail.push(i, v.x, v.y, v.z);
    }
    trail.flush();

    for (let i = 0; i < blocks.length; i++) { const bl = blocks[i]; bl.flash *= 0.9; bl.m.opacity = 0.14 + 0.16 * (0.5 + 0.5 * Math.sin(now * 0.002 + bl.ph)) + 0.6 * bl.flash; }
  });
  stage.begin();

  return {
    destroy() {
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
      orbit.destroy(); trail.dispose();
      disposables.forEach((d) => { try { d.dispose && d.dispose(); } catch (e) { /* noop */ } });
      stage.destroy();
    },
  };
}
