/* ============================================================
   demoBio.js — UbiWell vitals monitor (interactive + fancy)
   Drag to orbit · hover a trace (it lifts toward you + solos) · click to inject
   a beat · move the cursor left/right to set the heart rate. A scan line sweeps
   the monitor and each trace casts a soft floor reflection. No numbers.
   ============================================================ */
import * as THREE from 'three';
import { makeStage, makeOrbit, makePicker, makeSpring, discTexture } from './caseDemoCore.js';

function ecg(x) {
  const t = x - Math.floor(x);
  let v = 0.05 * Math.sin(t * Math.PI * 2);
  v += 0.95 * Math.exp(-Math.pow((t - 0.5) / 0.012, 2));   // R
  v -= 0.16 * Math.exp(-Math.pow((t - 0.47) / 0.012, 2));  // Q
  v -= 0.22 * Math.exp(-Math.pow((t - 0.54) / 0.016, 2));  // S
  v += 0.10 * Math.exp(-Math.pow((t - 0.20) / 0.03, 2));   // P
  v += 0.18 * Math.exp(-Math.pow((t - 0.74) / 0.05, 2));   // T
  return v;
}

export function initBio(canvas, opts = {}) {
  const stage = makeStage(canvas, { fov: 42, fog: 0.045, bloomStrength: 0.62 });
  const { scene, camera, reduce } = stage;
  const accent = new THREE.Color(opts.accent || '#B9A6FF');
  const PINK = new THREE.Color('#FF9EC4'), COOL = new THREE.Color('#8FB4FF'), LAV = new THREE.Color('#B9A6FF');
  const pal = [LAV, COOL, PINK, accent];
  const DISC = discTexture();
  const disposables = [DISC];

  camera.position.set(0, 0.3, 7.2);
  camera.lookAt(0, 0, 0);
  const group = new THREE.Group(); scene.add(group);
  const orbit = makeOrbit(canvas, { idle: 0, restX: -0.12, x0: -0.12, parallax: 0.06, breathe: 0 });
  const picker = makePicker(canvas, camera);

  const T = 10, SAMPLES = 160, X = 3.4, floorY = -2.85;
  const yTop = 2.2, yBot = -2.2;

  // faint monitor grid behind
  (function grid() {
    const seg = [], gx = 8, gy = 6;
    for (let i = 0; i <= gx; i++) { const x = -X + (2 * X) * i / gx; seg.push(x, yBot - 0.3, -0.7, x, yTop + 0.3, -0.7); }
    for (let j = 0; j <= gy; j++) { const y = (yBot - 0.3) + ((yTop + 0.6) - (yBot - 0.3)) * j / gy; seg.push(-X, y, -0.7, X, y, -0.7); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(seg, 3));
    const m = new THREE.LineBasicMaterial({ color: 0x6a5f8c, transparent: true, opacity: 0.06, depthWrite: false });
    group.add(new THREE.LineSegments(g, m)); disposables.push(g, m);
  })();

  const traces = [];
  for (let t = 0; t < T; t++) {
    const baseY = yTop - (yTop - yBot) * (t / (T - 1));
    const col = pal[t % pal.length];
    const mp = new Float32Array(SAMPLES * 3), rp = new Float32Array(SAMPLES * 3);
    for (let s = 0; s < SAMPLES; s++) { const x = -X + (2 * X) * s / (SAMPLES - 1); mp[s * 3] = x; rp[s * 3] = x; }
    const mg = new THREE.BufferGeometry(); mg.setAttribute('position', new THREE.BufferAttribute(mp, 3));
    const mm = new THREE.LineBasicMaterial({ color: col.getHex(), transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false });
    group.add(new THREE.Line(mg, mm));
    const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.BufferAttribute(rp, 3));
    const rm = new THREE.LineBasicMaterial({ color: col.getHex(), transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false });
    group.add(new THREE.Line(rg, rm));
    disposables.push(mg, mm, rg, rm);
    // pen / emitter dot at right edge
    const em = new THREE.SpriteMaterial({ map: DISC, color: col.getHex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const pen = new THREE.Sprite(em); pen.scale.setScalar(0.18); group.add(pen); disposables.push(em);
    traces.push({ baseY, col, mp, rp, mg, rg, mm, rm, pen, amp: 0.5 + Math.random() * 0.18, phase: Math.random() * 10, cycles: 3 + (t % 3), lift: makeSpring(0, { k: 0.12, damp: 0.7 }), inject: 0 });
  }

  // scan line
  const scanGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, yBot - 0.3, 0.05), new THREE.Vector3(0, yTop + 0.3, 0.05)]);
  const scanMat = new THREE.LineBasicMaterial({ color: accent.getHex(), transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false });
  const scan = new THREE.Line(scanGeo, scanMat); group.add(scan); disposables.push(scanGeo, scanMat);

  let focus = -1, rateMul = 1.0;
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hitW = new THREE.Vector3();
  function traceAt(e) {
    picker.setRay(e);
    if (!picker.ray.ray.intersectPlane(plane, hitW)) return -1;
    group.worldToLocal(hitW);
    if (Math.abs(hitW.x) > X + 0.4) return -1;
    let best = -1, bd = 0.34;
    for (let t = 0; t < T; t++) { const d = Math.abs(hitW.y - traces[t].baseY); if (d < bd) { bd = d; best = t; } }
    return best;
  }
  const onMove = (e) => {
    const r = canvas.getBoundingClientRect();
    rateMul = 0.4 + (((e.clientX - r.left) / r.width)) * 1.6;   // cursor X -> heart rate
    if (orbit.dragging) { focus = -1; return; }
    focus = traceAt(e); canvas.style.cursor = focus >= 0 ? 'pointer' : '';
  };
  const onLeave = () => { focus = -1; rateMul = 1.0; };
  canvas.addEventListener('mousemove', onMove);
  canvas.addEventListener('mouseleave', onLeave);
  orbit.onTap((e) => { const t = traceAt(e); if (t >= 0) traces[t].inject = 1; });

  stage.onFrame((now) => {
    orbit.apply(group, now);
    const scanX = -X + (2 * X) * (((now * 0.00018) % 1));
    scan.position.x = scanX; scanMat.opacity = 0.3 + 0.2 * Math.sin(now * 0.006);

    for (let t = 0; t < T; t++) {
      const tr = traces[t];
      tr.phase += (reduce ? 0 : 0.02) * rateMul * (tr.cycles / 3);
      tr.inject *= 0.86;
      const focd = t === focus ? 1 : 0; tr.lift.to(focd); const lift = tr.lift.step();
      const zo = lift * 0.9, yo = tr.baseY + lift * 0.25, ampS = tr.amp * (1 + lift * 0.5);
      for (let s = 0; s < SAMPLES; s++) {
        const u = s / (SAMPLES - 1);
        let y = ecg(u * tr.cycles - tr.phase) * ampS;
        if (tr.inject > 0.02) y += tr.inject * 1.2 * Math.exp(-Math.pow((u - 0.92) / 0.03, 2));
        const yy = yo + y;
        tr.mp[s * 3 + 1] = yy; tr.mp[s * 3 + 2] = zo;
        tr.rp[s * 3 + 1] = 2 * floorY - yy; tr.rp[s * 3 + 2] = zo;   // floor reflection
      }
      tr.mg.attributes.position.needsUpdate = true; tr.rg.attributes.position.needsUpdate = true;
      tr.mm.opacity = 0.4 + 0.45 * lift + 0.15 * tr.inject + (focus < 0 ? 0.15 : 0);
      tr.rm.opacity = (0.1 + 0.12 * lift) * (focus < 0 ? 1 : (focd ? 1 : 0.4));
      const endY = tr.mp[(SAMPLES - 1) * 3 + 1];
      tr.pen.position.set(X, endY, zo); tr.pen.scale.setScalar(0.16 + 0.12 * lift + 0.1 * tr.inject);
      const dim = focus < 0 ? 1 : (focd ? 1 : 0.35);
      tr.mm.color.copy(tr.col).multiplyScalar(dim); tr.pen.material.color.copy(tr.col).multiplyScalar(dim);
    }
  });
  stage.begin();

  return {
    destroy() {
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
      orbit.destroy();
      disposables.forEach((d) => { try { d.dispose && d.dispose(); } catch (e) { /* noop */ } });
      stage.destroy();
    },
  };
}
