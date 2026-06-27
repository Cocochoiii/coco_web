/* ============================================================
   demoSwarm.js — Mars (interactive + fancy)
   Drag to rotate · move the cursor as a spotlight over the swarm · click to
   broadcast a visible expanding wave (nodes light as the front reaches them).
   Rim-lit shells · flickering live-socket links · comet-tail messages. No numbers.
   ============================================================ */
import * as THREE from 'three';
import { makeStage, makeOrbit, makePicker, makeTrail, discTexture, ringTexture, fibSphere } from './caseDemoCore.js';

function smoothstep(e0, e1, x) { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); }

export function initSwarm(canvas, opts = {}) {
  const stage = makeStage(canvas, { fov: 45, fog: 0.05, bloomStrength: 0.85 });
  const { scene, camera, reduce } = stage;
  const accent = new THREE.Color(opts.accent || '#FF9EC4');
  const LAV = new THREE.Color('#B9A6FF'), COOL = new THREE.Color('#8FB4FF'), PINK = new THREE.Color('#FF9EC4');
  const DISC = discTexture(), RING = ringTexture();
  const disposables = [DISC, RING];

  camera.position.set(0, 0, 7.6);
  const group = new THREE.Group(); scene.add(group);
  const orbit = makeOrbit(canvas, { idle: reduce ? 0 : 0.0013, restX: 0, parallax: 0.09, breathe: 0.016 });
  const picker = makePicker(canvas, camera);

  const clients = [], shells = [];
  function shell(n, RAD, jit, pal) {
    const dirs = fibSphere(n), pos = new Float32Array(n * 3), base = new Float32Array(n * 3), dir = [], rad = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const p = dirs[i].clone().multiplyScalar(RAD * (1 + (Math.random() - 0.5) * jit));
      clients.push(p);
      pos[i * 3] = p.x; pos[i * 3 + 1] = p.y; pos[i * 3 + 2] = p.z;
      const c = pal[i % pal.length];
      base[i * 3] = c.r; base[i * 3 + 1] = c.g; base[i * 3 + 2] = c.b;
      dir.push(p.clone().normalize()); rad[i] = p.length();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(base.slice(), 3));
    const mat = new THREE.PointsMaterial({ map: DISC, size: RAD > 2.8 ? 0.1 : 0.13, vertexColors: true, transparent: true, opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
    group.add(new THREE.Points(geo, mat)); disposables.push(geo, mat);
    shells.push({ geo, col: geo.attributes.color.array, base, dir, rad, n });
  }
  shell(520, 2.7, 0.1, [LAV, COOL, LAV]);
  shell(300, 3.4, 0.14, [COOL, LAV, PINK]);

  const cageGeo = new THREE.IcosahedronGeometry(3.45, 2);
  const cageWire = new THREE.WireframeGeometry(cageGeo);
  const cageMat = new THREE.LineBasicMaterial({ color: 0x6a5f8c, transparent: true, opacity: 0.05, depthWrite: false });
  group.add(new THREE.LineSegments(cageWire, cageMat)); disposables.push(cageGeo, cageWire, cageMat);

  // radial links with live-socket flicker
  const LINKN = 150, lp = new Float32Array(LINKN * 6), lc = new Float32Array(LINKN * 6), linkBright = new Float32Array(LINKN);
  for (let i = 0; i < LINKN; i++) { const c = clients[(i * 5) % clients.length]; lp[i * 6 + 3] = c.x; lp[i * 6 + 4] = c.y; lp[i * 6 + 5] = c.z; linkBright[i] = 0.16; }
  const lGeo = new THREE.BufferGeometry();
  lGeo.setAttribute('position', new THREE.BufferAttribute(lp, 3));
  lGeo.setAttribute('color', new THREE.BufferAttribute(lc, 3));
  const lMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
  group.add(new THREE.LineSegments(lGeo, lMat)); disposables.push(lGeo, lMat);

  const icoGeo = new THREE.IcosahedronGeometry(0.66, 1);
  const icoWire = new THREE.WireframeGeometry(icoGeo);
  const icoMat = new THREE.LineBasicMaterial({ color: accent.getHex(), transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending });
  const ico = new THREE.LineSegments(icoWire, icoMat); group.add(ico); disposables.push(icoGeo, icoWire, icoMat);
  const coreMat = new THREE.SpriteMaterial({ map: DISC, color: accent.getHex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const core = new THREE.Sprite(coreMat); core.scale.setScalar(1.5); group.add(core); disposables.push(coreMat);
  const orbits = [];
  for (let i = 0; i < 2; i++) {
    const rg = new THREE.TorusGeometry(1.0 + i * 0.4, 0.012, 8, 56);
    const rm = new THREE.MeshBasicMaterial({ color: (i ? COOL : accent).getHex(), transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending });
    const ring = new THREE.Mesh(rg, rm); ring.rotation.x = Math.PI / 2 + i * 0.7; group.add(ring); disposables.push(rg, rm);
    orbits.push({ ring, spd: 0.001 + i * 0.0008 });
  }

  // message pulses as comet tails
  const PN = 84, pulses = [];
  const trail = makeTrail(group, { count: PN, len: 6, size: 0.13, tex: DISC });
  for (let i = 0; i < PN; i++) {
    pulses.push({ c: clients[(Math.random() * clients.length) | 0], t: Math.random(), spd: 0.012 + Math.random() * 0.02, dir: Math.random() < 0.5 ? 1 : -1 });
    trail.setColor(i, i % 2 ? accent : COOL, 1.1);
  }

  const rippleMat = new THREE.SpriteMaterial({ map: RING, color: accent.getHex(), transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, opacity: 0 });
  const ripple = new THREE.Sprite(rippleMat); ripple.renderOrder = 11; group.add(ripple); disposables.push(rippleMat);
  let rippleBorn = -1, broadcastBoost = 0;

  // cursor spotlight (anchored in world; clients spin under it)
  let focusValid = false; const focusWorld = new THREE.Vector3(), sph = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 3.0);
  const onMove = (e) => {
    if (orbit.dragging) { focusValid = false; return; }
    picker.setRay(e);
    if (picker.ray.ray.intersectSphere(sph, focusWorld)) focusValid = true;
    else { picker.ray.ray.closestPointToPoint(sph.center, focusWorld); focusValid = true; }
  };
  const onLeave = () => { focusValid = false; };
  canvas.addEventListener('mousemove', onMove);
  canvas.addEventListener('mouseleave', onLeave);
  orbit.onTap(() => {
    rippleBorn = performance.now(); broadcastBoost = 1;
    for (let i = 0; i < PN; i++) { pulses[i].t = 0; pulses[i].dir = 1; pulses[i].c = clients[(Math.random() * clients.length) | 0]; }
  });

  const camLocal = new THREE.Vector3(), focusLocal = new THREE.Vector3(), v = new THREE.Vector3();
  stage.onFrame((now) => {
    orbit.apply(group, now);
    ico.rotation.y = now * 0.0006; ico.rotation.x = now * 0.0004;
    const en = focusValid ? 1 : 0;
    core.scale.setScalar((1.5 + 0.3 * en) + 0.2 * Math.sin(now * 0.005));
    icoMat.opacity = 0.6 + 0.3 * (0.5 + 0.5 * Math.sin(now * 0.005)) + 0.1 * en;
    for (let i = 0; i < orbits.length; i++) orbits[i].ring.rotation.z = now * orbits[i].spd * (1 + en);

    broadcastBoost *= 0.95;
    const wavefront = (1 - broadcastBoost) * 3.9, waveOn = broadcastBoost > 0.02;

    // camera direction + spotlight point in local space
    camLocal.copy(camera.position); group.worldToLocal(camLocal); camLocal.normalize();
    if (focusValid) { focusLocal.copy(focusWorld); group.worldToLocal(focusLocal); }

    for (let s = 0; s < shells.length; s++) {
      const sh = shells[s], col = sh.col, base = sh.base, dir = sh.dir, rad = sh.rad, n = sh.n;
      for (let i = 0; i < n; i++) {
        const rim = 1 - Math.abs(dir[i].x * camLocal.x + dir[i].y * camLocal.y + dir[i].z * camLocal.z);
        let boost = 1 + rim * 0.7;
        if (focusValid) {
          const px = dir[i].x * rad[i] - focusLocal.x, py = dir[i].y * rad[i] - focusLocal.y, pz = dir[i].z * rad[i] - focusLocal.z;
          const d = Math.sqrt(px * px + py * py + pz * pz);
          boost += 1.4 * smoothstep(1.3, 0.0, d);
        }
        if (waveOn) { const dd = (rad[i] - wavefront) / 0.5; boost += broadcastBoost * 1.8 * Math.exp(-dd * dd); }
        const b3 = i * 3;
        col[b3] = Math.min(2.2, base[b3] * boost);
        col[b3 + 1] = Math.min(2.2, base[b3 + 1] * boost);
        col[b3 + 2] = Math.min(2.2, base[b3 + 2] * boost);
      }
      sh.geo.attributes.color.needsUpdate = true;
    }

    // link flicker
    for (let i = 0; i < LINKN; i++) {
      linkBright[i] *= 0.92; if (Math.random() < 0.04) linkBright[i] = 0.7 + Math.random() * 0.5;
      const b = 0.12 + linkBright[i], o = i * 6;
      lc[o] = LAV.r * b; lc[o + 1] = LAV.g * b; lc[o + 2] = LAV.b * b;
      lc[o + 3] = LAV.r * b; lc[o + 4] = LAV.g * b; lc[o + 5] = LAV.b * b;
    }
    lGeo.attributes.color.needsUpdate = true;

    const speedK = 1 + 0.6 * en + 1.6 * broadcastBoost;
    for (let i = 0; i < PN; i++) {
      const p = pulses[i]; p.t += reduce ? 0 : p.spd * speedK;
      const u = p.dir > 0 ? Math.min(p.t, 1) : 1 - Math.min(p.t, 1);
      v.copy(p.c).multiplyScalar(u);
      if (p.t >= 1) { p.t = 0; p.c = clients[(Math.random() * clients.length) | 0]; p.dir = Math.random() < 0.5 ? 1 : -1; p.spd = 0.012 + Math.random() * 0.02; trail.reset(i, v.x, v.y, v.z); }
      else trail.push(i, v.x, v.y, v.z);
    }
    trail.flush();

    if (rippleBorn >= 0) {
      const age = (now - rippleBorn) / 1100;
      if (age >= 1) { rippleBorn = -1; rippleMat.opacity = 0; }
      else { ripple.scale.setScalar(0.5 + age * 7); rippleMat.opacity = 0.85 * (1 - age); }
    }
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
