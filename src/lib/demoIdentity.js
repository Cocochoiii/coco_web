/* ============================================================
   demoIdentity.js — WPP identity resolution (interactive + fancy)
   Drag left/right to scrub coalescence (scatter <-> resolve) · drag up/down to
   tilt · click a cluster to re-resolve just that one · double-click to let it
   auto-cycle again. Fragments fly in with comet tails; clusters flash on lock
   and brighten as they fill. No numbers.
   ============================================================ */
import * as THREE from 'three';
import { makeStage, makePicker, makeTrail, discTexture, ringTexture, fibSphere } from './caseDemoCore.js';

function smooth(t) { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); }

export function initIdentity(canvas, opts = {}) {
  const stage = makeStage(canvas, { fov: 45, fog: 0.05, bloomStrength: 0.78 });
  const { scene, camera, reduce } = stage;
  const accent = new THREE.Color(opts.accent || '#D3B6FF');
  const LAV = new THREE.Color('#B9A6FF'), PINK = new THREE.Color('#FF9EC4'), COOL = new THREE.Color('#8FB4FF');
  const pal = [LAV, accent, PINK, COOL];
  const DISC = discTexture(), RING = ringTexture();
  const disposables = [DISC, RING];

  camera.position.set(0, 0, 8);
  const group = new THREE.Group(); scene.add(group);
  const picker = makePicker(canvas, camera);

  const CL = 10, centers = fibSphere(CL).map((d) => d.clone().multiplyScalar(2.0));
  const axes = centers.map(() => new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize());

  // fragments
  const N = 600, frag = [], fragPos = new Float32Array(N * 3), fragCol = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const ci = i % CL, c = centers[ci];
    const sdir = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
    const scat = sdir.multiplyScalar(2.7 + Math.random() * 1.5);
    const mjit = new THREE.Vector3((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5)).multiplyScalar(0.22);
    const merged = c.clone().add(mjit);
    const tang = axes[ci].clone().cross(sdir).normalize().multiplyScalar(0.5 + Math.random() * 0.4);
    frag.push({ ci, scat, merged, tang });
  }
  const fGeo = new THREE.BufferGeometry();
  fGeo.setAttribute('position', new THREE.BufferAttribute(fragPos, 3));
  fGeo.setAttribute('color', new THREE.BufferAttribute(fragCol, 3));
  const fMat = new THREE.PointsMaterial({ map: DISC, size: 0.11, vertexColors: true, transparent: true, opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
  group.add(new THREE.Points(fGeo, fMat)); disposables.push(fGeo, fMat);

  const trail = makeTrail(group, { count: N, len: 3, size: 0.085, tex: DISC });
  for (let i = 0; i < N; i++) trail.setColor(i, pal[frag[i].ci % pal.length], 0.9);

  // edges (capped subset per cluster) — structure of a resolved identity
  const edgeFrag = [], edgeCi = [], perC = 10;
  for (let ci = 0; ci < CL; ci++) { let added = 0; for (let i = ci; i < N && added < perC; i += CL) { edgeFrag.push(i); edgeCi.push(ci); added++; } }
  const E = edgeFrag.length, ePos = new Float32Array(E * 6), eCol = new Float32Array(E * 6);
  const eGeo = new THREE.BufferGeometry();
  eGeo.setAttribute('position', new THREE.BufferAttribute(ePos, 3));
  eGeo.setAttribute('color', new THREE.BufferAttribute(eCol, 3));
  const eMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false });
  group.add(new THREE.LineSegments(eGeo, eMat)); disposables.push(eGeo, eMat);

  // cluster glows + rings
  const glows = centers.map((c, ci) => {
    const m = new THREE.SpriteMaterial({ map: DISC, color: pal[ci % pal.length].getHex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 });
    const sp = new THREE.Sprite(m); sp.position.copy(c); sp.scale.setScalar(0.5); sp.userData.ci = ci; group.add(sp); disposables.push(m);
    const rm = new THREE.SpriteMaterial({ map: RING, color: pal[ci % pal.length].getHex(), transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, opacity: 0 });
    const ring = new THREE.Sprite(rm); ring.position.copy(c); ring.renderOrder = 11; group.add(ring); disposables.push(rm);
    return { sp, m, ring, rm, ci };
  });
  const glowSprites = glows.map((g) => g.sp);

  // --- interaction state: scrub + per-cluster re-resolve ---
  let mode = 'auto', autoPhase = 0, manualK = 0.5;
  let rotY = 0, rotX = -0.1, pmx = 0, pmy = 0, pxE = 0, pyE = 0;
  let dragging = false, lastX = 0, lastY = 0, moved = 0, seededManual = false;
  const pulse = centers.map(() => ({ active: false, start: 0 }));
  const flash = new Float32Array(CL), prevK = new Float32Array(CL);
  const DUR = 2200;
  let hoverCi = -1;
  const isMouse = (e) => !e.pointerType || e.pointerType === 'mouse';

  function down(e) { if (!isMouse(e)) return; dragging = true; moved = 0; lastX = e.clientX; lastY = e.clientY; seededManual = false; canvas.style.cursor = 'grabbing'; }
  function move(e) {
    if (!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    if (!seededManual && Math.abs(dx) > 2) { mode = 'manual'; manualK = 0.5 - 0.5 * Math.cos(autoPhase); seededManual = true; }
    if (mode === 'manual') manualK = Math.max(0, Math.min(1, manualK + dx * 0.0045));
    rotX = Math.max(-1.0, Math.min(1.0, rotX + dy * 0.005));
    moved += Math.abs(dx) + Math.abs(dy); lastX = e.clientX; lastY = e.clientY;
  }
  function up(e) {
    if (!dragging) return; dragging = false; canvas.style.cursor = '';
    if (moved < 6 && isMouse(e)) { const hit = picker(glowSprites, e); if (hit) { const ci = hit.object.userData.ci; pulse[ci].active = true; pulse[ci].start = performance.now(); for (let i = ci; i < N; i += CL) { const p = frag[i].scat; trail.reset(i, p.x, p.y, p.z); } } }
  }
  function hover(e) {
    const r = canvas.getBoundingClientRect();
    pmx = ((e.clientX - r.left) / r.width) * 2 - 1; pmy = ((e.clientY - r.top) / r.height) * 2 - 1;
    if (!dragging) { const hit = picker(glowSprites, e); hoverCi = hit ? hit.object.userData.ci : -1; canvas.style.cursor = hit ? 'pointer' : ''; }
  }
  function leave() { pmx = 0; pmy = 0; hoverCi = -1; }
  function dbl() { mode = 'auto'; rotX = -0.1; }
  canvas.addEventListener('pointerdown', down);
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
  canvas.addEventListener('mousemove', hover);
  canvas.addEventListener('mouseleave', leave);
  canvas.addEventListener('dblclick', dbl);

  const kC = new Float32Array(CL), v = new THREE.Vector3();
  stage.onFrame((now) => {
    if (!reduce && mode === 'auto') autoPhase += 0.012;
    const baseK = mode === 'auto' ? (0.5 - 0.5 * Math.cos(autoPhase)) : manualK;

    // idle spin + tilt + parallax + breathe
    if (!dragging) rotY += reduce ? 0 : 0.0016;
    pxE += ((dragging ? 0 : pmx * 0.08) - pxE) * 0.06;
    pyE += ((dragging ? 0 : pmy * 0.08) - pyE) * 0.06;
    group.rotation.y = rotY + pxE;
    group.rotation.x = Math.max(-1.2, Math.min(1.2, rotX + pyE));
    group.scale.setScalar(1 + 0.012 * Math.sin(now * 0.0009));

    // per-cluster effective k (pulse overrides global)
    for (let ci = 0; ci < CL; ci++) {
      let k = baseK;
      if (pulse[ci].active) { const pr = (now - pulse[ci].start) / DUR; if (pr >= 1) { pulse[ci].active = false; k = baseK; } else k = smooth(pr); }
      kC[ci] = k;
      if (prevK[ci] < 0.82 && k >= 0.82) flash[ci] = 1;
      prevK[ci] = k; flash[ci] *= 0.92;
    }

    // fragments
    for (let i = 0; i < N; i++) {
      const f = frag[i], k = kC[f.ci], e = smooth(k);
      const sp = Math.sin(e * Math.PI) * (1 - e);
      v.copy(f.scat).lerp(f.merged, e).addScaledVector(f.tang, sp);
      fragPos[i * 3] = v.x; fragPos[i * 3 + 1] = v.y; fragPos[i * 3 + 2] = v.z;
      trail.push(i, v.x, v.y, v.z);
      const c = pal[f.ci % pal.length], hot = (f.ci === hoverCi ? 0.5 : 0), b = 0.5 + 0.8 * k + hot;
      fragCol[i * 3] = c.r * b; fragCol[i * 3 + 1] = c.g * b; fragCol[i * 3 + 2] = c.b * b;
    }
    fGeo.attributes.position.needsUpdate = true; fGeo.attributes.color.needsUpdate = true; trail.flush();

    // edges follow fragments, brightness ~ k
    for (let j = 0; j < E; j++) {
      const fi = edgeFrag[j], ci = edgeCi[j], c = centers[ci], o = j * 6, b = (0.1 + 0.9 * kC[ci]) * (ci === hoverCi ? 1.6 : 1);
      ePos[o] = fragPos[fi * 3]; ePos[o + 1] = fragPos[fi * 3 + 1]; ePos[o + 2] = fragPos[fi * 3 + 2];
      ePos[o + 3] = c.x; ePos[o + 4] = c.y; ePos[o + 5] = c.z;
      const col = pal[ci % pal.length];
      eCol[o] = col.r * b * 0.3; eCol[o + 1] = col.g * b * 0.3; eCol[o + 2] = col.b * b * 0.3;
      eCol[o + 3] = col.r * b; eCol[o + 4] = col.g * b; eCol[o + 5] = col.b * b;
    }
    eGeo.attributes.position.needsUpdate = true; eGeo.attributes.color.needsUpdate = true;

    // cluster glows + lock flash
    for (let ci = 0; ci < CL; ci++) {
      const g = glows[ci], k = kC[ci];
      g.sp.scale.setScalar(0.4 + 0.7 * k + 0.5 * flash[ci]);
      g.m.opacity = 0.15 + 0.7 * k + 0.5 * flash[ci];
      g.rm.opacity = 0.8 * flash[ci];
      g.ring.scale.setScalar(0.8 + (1 - flash[ci]) * 2.2);
    }
  });
  stage.begin();

  return {
    destroy() {
      canvas.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      canvas.removeEventListener('mousemove', hover);
      canvas.removeEventListener('mouseleave', leave);
      canvas.removeEventListener('dblclick', dbl);
      trail.dispose();
      disposables.forEach((d) => { try { d.dispose && d.dispose(); } catch (e) { /* noop */ } });
      stage.destroy();
    },
  };
}
