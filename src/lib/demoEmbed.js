/* ============================================================
   demoEmbed.js — RAG news embedding space (interactive + fancy)
   Drag to orbit · click to drop a query (then drag IT for live retrieval) ·
   hover any document to light its local neighbourhood. Topic blobs drift, the
   manifold follows, beams pulse outward and top hits get halo rings. No numbers.
   ============================================================ */
import * as THREE from 'three';
import { makeStage, makeOrbit, makePicker, makeTrail, discTexture, ringTexture } from './caseDemoCore.js';

export function initEmbed(canvas, opts = {}) {
  const stage = makeStage(canvas, { fov: 50, fog: 0.035, bloomStrength: 0.8 });
  const { scene, camera, reduce } = stage;
  const accent = new THREE.Color(opts.accent || '#FFB0D0');
  const LAV = new THREE.Color('#B9A6FF'), COOL = new THREE.Color('#8FB4FF'), PINK = new THREE.Color('#FF9EC4'), WARM = new THREE.Color('#FFC59E');
  const blobPal = [LAV, COOL, PINK, accent, WARM, new THREE.Color('#9EC0FF'), new THREE.Color('#C9A0FF')];
  const DISC = discTexture(), RING = ringTexture();
  const disposables = [DISC, RING];

  camera.position.set(0, 0, 8.4);
  const group = new THREE.Group(); scene.add(group);
  const orbit = makeOrbit(canvas, { idle: reduce ? 0 : 0.0011, restX: -0.06, parallax: 0.09, breathe: 0.012, canStartDrag: () => !(userQ.on && userQHover) });
  const picker = makePicker(canvas, camera);
  const dpick = makePicker(canvas, camera, 0.13);

  // 7 topic blobs that slowly drift
  const B = 7, perB = 100, N = B * perB;
  const blobs = [];
  for (let b = 0; b < B; b++) {
    const ang = (b / B) * Math.PI * 2, rad = 2.3;
    blobs.push({ home: new THREE.Vector3(Math.cos(ang) * rad, (Math.random() - 0.5) * 2.0, Math.sin(ang) * rad), axis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(), amp: 0.5 + Math.random() * 0.4, spd: 0.0002 + Math.random() * 0.0003, ph: Math.random() * 10, cur: new THREE.Vector3() });
  }
  const docBlob = new Int16Array(N), docOff = [], docPos = new Float32Array(N * 3), docCol = new Float32Array(N * 3), docBase = [];
  for (let i = 0; i < N; i++) {
    const b = (i / perB) | 0; docBlob[i] = b;
    const off = new THREE.Vector3((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5)).multiplyScalar(0.9 + Math.random() * 0.5);
    docOff.push(off); docBase.push(blobPal[b]);
    const p = blobs[b].home.clone().add(off);
    docPos[i * 3] = p.x; docPos[i * 3 + 1] = p.y; docPos[i * 3 + 2] = p.z;
  }
  const dGeo = new THREE.BufferGeometry();
  dGeo.setAttribute('position', new THREE.BufferAttribute(docPos, 3));
  dGeo.setAttribute('color', new THREE.BufferAttribute(docCol, 3));
  const dMat = new THREE.PointsMaterial({ map: DISC, size: 0.1, vertexColors: true, transparent: true, opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
  const docPoints = new THREE.Points(dGeo, dMat); group.add(docPoints); disposables.push(dGeo, dMat);

  // sparse kNN manifold (topology fixed once; endpoints follow drifting docs)
  const pairs = [];
  (function buildKNN() {
    const K = 3;
    for (let i = 0; i < N; i++) {
      const bi = []; const di = [];
      for (let j = 0; j < N; j++) {
        if (j === i) continue;
        const dx = docPos[i * 3] - docPos[j * 3], dy = docPos[i * 3 + 1] - docPos[j * 3 + 1], dz = docPos[i * 3 + 2] - docPos[j * 3 + 2];
        const d = dx * dx + dy * dy + dz * dz;
        if (bi.length < K) { bi.push(j); di.push(d); }
        else { let mx = 0; for (let k = 1; k < K; k++) if (di[k] > di[mx]) mx = k; if (d < di[mx]) { di[mx] = d; bi[mx] = j; } }
      }
      for (let k = 0; k < bi.length; k++) { const a = Math.min(i, bi[k]), c = Math.max(i, bi[k]); pairs.push(a * N + c); }
    }
  })();
  const uniq = Array.from(new Set(pairs)); const E = uniq.length;
  const eFrom = new Int32Array(E), eTo = new Int32Array(E), ePos = new Float32Array(E * 6), eCol = new Float32Array(E * 6);
  for (let j = 0; j < E; j++) { eFrom[j] = (uniq[j] / N) | 0; eTo[j] = uniq[j] % N; const c = blobPal[docBlob[eFrom[j]]]; const o = j * 6; for (let q = 0; q < 2; q++) { eCol[o + q * 3] = c.r * 0.16; eCol[o + q * 3 + 1] = c.g * 0.16; eCol[o + q * 3 + 2] = c.b * 0.16; } }
  const eGeo = new THREE.BufferGeometry();
  eGeo.setAttribute('position', new THREE.BufferAttribute(ePos, 3));
  eGeo.setAttribute('color', new THREE.BufferAttribute(eCol, 3));
  const eMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false });
  group.add(new THREE.LineSegments(eGeo, eMat)); disposables.push(eGeo, eMat);

  // queries: 2 roaming + 1 user-placed (draggable) + 1 transient hover
  function mkQuery(color, withSprite) {
    let sp = null, m = null;
    if (withSprite) { m = new THREE.SpriteMaterial({ map: DISC, color: color.getHex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }); sp = new THREE.Sprite(m); sp.scale.setScalar(0.42); group.add(sp); disposables.push(m); }
    return { pos: new THREE.Vector3(), color, sp, m, on: true, hover: false };
  }
  const roam = [mkQuery(accent, true), mkQuery(COOL, true)];
  const userQ = mkQuery(PINK, true); userQ.on = false; let userQHover = false;
  const hoverQ = mkQuery(LAV, false); hoverQ.on = false;

  const K = 14, TOP = 4, MAXQ = 4, MB = MAXQ * K;
  const beamPos = new Float32Array(MB * 6), beamCol = new Float32Array(MB * 6);
  const beamGeo = new THREE.BufferGeometry();
  beamGeo.setAttribute('position', new THREE.BufferAttribute(beamPos, 3));
  beamGeo.setAttribute('color', new THREE.BufferAttribute(beamCol, 3));
  const beamMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
  group.add(new THREE.LineSegments(beamGeo, beamMat)); disposables.push(beamGeo, beamMat);
  const beamTrail = makeTrail(group, { count: MB, len: 4, size: 0.1, tex: DISC });
  const beamActive = new Uint8Array(MB);
  const qPrev = new Uint8Array(MAXQ);

  const halos = [];
  for (let i = 0; i < MAXQ * TOP; i++) { const m = new THREE.SpriteMaterial({ map: RING, color: accent.getHex(), transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, opacity: 0 }); const sp = new THREE.Sprite(m); sp.renderOrder = 12; group.add(sp); disposables.push(m); halos.push({ sp, m }); }

  // neighbour search scratch
  const nIdx = new Int32Array(K), nD = new Float32Array(K);
  function topK(qx, qy, qz) {
    let cnt = 0;
    for (let i = 0; i < N; i++) {
      const dx = qx - docPos[i * 3], dy = qy - docPos[i * 3 + 1], dz = qz - docPos[i * 3 + 2]; const d = dx * dx + dy * dy + dz * dz;
      if (cnt < K) { nIdx[cnt] = i; nD[cnt] = d; cnt++; if (cnt === K) { /* sort asc */ for (let a = 1; a < K; a++) { const di = nD[a], ii = nIdx[a]; let b = a - 1; while (b >= 0 && nD[b] > di) { nD[b + 1] = nD[b]; nIdx[b + 1] = nIdx[b]; b--; } nD[b + 1] = di; nIdx[b + 1] = ii; } } }
      else if (d < nD[K - 1]) { let b = K - 2; while (b >= 0 && nD[b] > d) { nD[b + 1] = nD[b]; nIdx[b + 1] = nIdx[b]; b--; } nD[b + 1] = d; nIdx[b + 1] = i; }
    }
    return cnt;
  }

  // interaction
  const onMove = (e) => {
    if (userQ.on) { const h = picker([userQ.sp], e); userQHover = !!h; }
    if (orbit.dragging || qDrag) { hoverQ.on = false; return; }
    const hit = dpick([docPoints], e);
    if (hit && hit.index != null) { const i = hit.index; hoverQ.on = true; hoverQ.pos.set(docPos[i * 3], docPos[i * 3 + 1], docPos[i * 3 + 2]); canvas.style.cursor = 'pointer'; }
    else { hoverQ.on = false; canvas.style.cursor = userQHover ? 'grab' : ''; }
  };
  const onLeave = () => { hoverQ.on = false; userQHover = false; };
  canvas.addEventListener('mousemove', onMove);
  canvas.addEventListener('mouseleave', onLeave);

  let qDrag = false; const dragPlane = new THREE.Plane(), pNormal = new THREE.Vector3(), wHit = new THREE.Vector3();
  function down(e) {
    if (!(userQ.on && userQHover)) return; if (e.pointerType && e.pointerType !== 'mouse') return;
    qDrag = true; canvas.style.cursor = 'grabbing';
  }
  function move(e) {
    if (!qDrag) return;
    camera.getWorldDirection(pNormal);
    const wp = userQ.pos.clone(); group.localToWorld(wp);
    dragPlane.setFromNormalAndCoplanarPoint(pNormal, wp);
    picker.setRay(e);
    if (picker.ray.ray.intersectPlane(dragPlane, wHit)) { group.worldToLocal(wHit); userQ.pos.copy(wHit); }
  }
  function upWin() { if (qDrag) { qDrag = false; canvas.style.cursor = ''; } }
  canvas.addEventListener('pointerdown', down);
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', upWin);

  orbit.onTap((e) => {
    picker.setRay(e);
    picker.ray.ray.closestPointToPoint(new THREE.Vector3(0, 0, 0), wHit);
    group.worldToLocal(wHit); userQ.pos.copy(wHit); userQ.on = true;
  });

  const tmp = new THREE.Vector3();
  stage.onFrame((now) => {
    orbit.apply(group, now);

    // drift blobs + place docs
    for (let b = 0; b < B; b++) { const bl = blobs[b]; const s = Math.sin(now * bl.spd + bl.ph); bl.cur.copy(bl.home).addScaledVector(bl.axis, bl.amp * s); }
    for (let i = 0; i < N; i++) { const c = blobs[docBlob[i]].cur, o = docOff[i]; docPos[i * 3] = c.x + o.x; docPos[i * 3 + 1] = c.y + o.y; docPos[i * 3 + 2] = c.z + o.z; }
    dGeo.attributes.position.needsUpdate = true;
    for (let j = 0; j < E; j++) { const a = eFrom[j], c = eTo[j], o = j * 6; ePos[o] = docPos[a * 3]; ePos[o + 1] = docPos[a * 3 + 1]; ePos[o + 2] = docPos[a * 3 + 2]; ePos[o + 3] = docPos[c * 3]; ePos[o + 4] = docPos[c * 3 + 1]; ePos[o + 5] = docPos[c * 3 + 2]; }
    eGeo.attributes.position.needsUpdate = true;

    // roaming query motion
    roam[0].pos.set(Math.cos(now * 0.0004) * 2.2, Math.sin(now * 0.0005) * 1.6, Math.sin(now * 0.0003) * 2.2);
    roam[1].pos.set(Math.sin(now * 0.00035 + 2) * 2.4, Math.cos(now * 0.0004 + 1) * 1.4, Math.cos(now * 0.00045) * 2.0);

    // reset doc colors to dim base
    for (let i = 0; i < N; i++) { const c = docBase[i], o = i * 3; docCol[o] = c.r * 0.32; docCol[o + 1] = c.g * 0.32; docCol[o + 2] = c.b * 0.32; }

    const qs = [roam[0], roam[1]]; if (userQ.on) qs.push(userQ); if (hoverQ.on) qs.push(hoverQ);
    let hi = 0;
    for (let qi = 0; qi < MAXQ; qi++) {
      const present = qi < qs.length;
      if (!present) {
        if (qPrev[qi]) { for (let k = 0; k < K; k++) { const slot = qi * K + k, o = slot * 6; beamActive[slot] = 0; for (let z = 0; z < 6; z++) beamCol[o + z] = 0; beamTrail.setColor(slot, accent, 0); } }
        qPrev[qi] = 0; continue;
      }
      const q = qs[qi];
      topK(q.pos.x, q.pos.y, q.pos.z);
      if (q.sp) q.sp.scale.setScalar(0.42 + 0.08 * Math.sin(now * 0.004 + qi));
      const fresh = !qPrev[qi]; qPrev[qi] = 1;
      for (let k = 0; k < K; k++) {
        const di = nIdx[k], w = 1 - k / K, slot = qi * K + k, o = slot * 6, dO = di * 3;
        const b = 0.5 + 1.4 * w, dc = docBase[di];
        docCol[dO] = Math.min(2.0, docCol[dO] + dc.r * b); docCol[dO + 1] = Math.min(2.0, docCol[dO + 1] + dc.g * b); docCol[dO + 2] = Math.min(2.0, docCol[dO + 2] + dc.b * b);
        beamPos[o] = q.pos.x; beamPos[o + 1] = q.pos.y; beamPos[o + 2] = q.pos.z;
        beamPos[o + 3] = docPos[dO]; beamPos[o + 4] = docPos[dO + 1]; beamPos[o + 5] = docPos[dO + 2];
        const bc = q.color, bb = 0.25 + 0.85 * w;
        beamCol[o] = bc.r * bb * 0.5; beamCol[o + 1] = bc.g * bb * 0.5; beamCol[o + 2] = bc.b * bb * 0.5;
        beamCol[o + 3] = bc.r * bb; beamCol[o + 4] = bc.g * bb; beamCol[o + 5] = bc.b * bb;
        beamActive[slot] = 1;
        const tt = ((now * 0.0009 + k * 0.12 + qi) % 1);
        tmp.set(q.pos.x + (docPos[dO] - q.pos.x) * tt, q.pos.y + (docPos[dO + 1] - q.pos.y) * tt, q.pos.z + (docPos[dO + 2] - q.pos.z) * tt);
        beamTrail.setColor(slot, q.color, 1.2 * w + 0.2);
        if (fresh) beamTrail.reset(slot, tmp.x, tmp.y, tmp.z); else beamTrail.push(slot, tmp.x, tmp.y, tmp.z);
        if (k < TOP) { const h = halos[hi++]; h.sp.position.set(docPos[dO], docPos[dO + 1], docPos[dO + 2]); h.m.color.copy(q.color); h.sp.scale.setScalar(0.4 + 0.12 * Math.sin(now * 0.005 + k)); h.m.opacity = 0.5 + 0.3 * w; }
      }
    }
    while (hi < halos.length) { halos[hi].m.opacity = 0; hi++; }
    dGeo.attributes.color.needsUpdate = true; beamGeo.attributes.color.needsUpdate = true; beamGeo.attributes.position.needsUpdate = true; beamTrail.flush();

    for (let qi = 0; qi < roam.length; qi++) if (roam[qi].sp) roam[qi].sp.position.copy(roam[qi].pos);
    if (userQ.on && userQ.sp) { userQ.sp.position.copy(userQ.pos); userQ.sp.scale.setScalar((qDrag ? 0.6 : 0.46) + 0.06 * Math.sin(now * 0.006)); }
    if (userQ.sp) userQ.sp.visible = userQ.on;
  });
  stage.begin();

  return {
    destroy() {
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
      canvas.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', upWin);
      orbit.destroy(); beamTrail.dispose();
      disposables.forEach((d) => { try { d.dispose && d.dispose(); } catch (e) { /* noop */ } });
      stage.destroy();
    },
  };
}
