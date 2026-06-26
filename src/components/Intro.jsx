import { useEffect, useRef, useState } from 'react';

export default function Intro() {
  const rootRef = useRef(null);
  const svgRef = useRef(null);
  const capRef = useRef(null);
  const barRef = useRef(null);
  const [gone, setGone] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const intro = rootRef.current;
    const svg = svgRef.current;
    const cap = capRef.current;
    const bar = barRef.current;
    if (!intro) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const NS = 'http://www.w3.org/2000/svg';
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    let packetsOn = true;
    let rafId = 0;
    const timers = [];

    html.style.overflow = 'hidden';
    try { window.scrollTo(0, 0); } catch (e) {}

    function teardown() {
      packetsOn = false;
      cancelAnimationFrame(rafId);
      html.style.overflow = prevOverflow || '';
      setDone(true);
      timers.push(setTimeout(() => setGone(true), 950));
    }
    const reveal = (delay) => timers.push(setTimeout(teardown, delay));
    let hardKill = setTimeout(teardown, 6500);

    if (reduce || !svg) {
      if (cap) { cap.textContent = 'link established'; cap.style.opacity = '1'; }
      if (bar) bar.style.width = '100%';
      clearTimeout(hardKill);
      reveal(800);
      return cleanup;
    }

    try {
      const nodes = [[120, 86], [300, 58], [480, 86], [542, 180], [470, 286], [300, 316], [130, 280], [70, 180], [300, 180]];
      const edges = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0], [8, 0], [8, 2], [8, 4], [8, 6], [8, 1], [8, 5]];

      const defs = document.createElementNS(NS, 'defs');
      const grad = document.createElementNS(NS, 'linearGradient');
      grad.setAttribute('id', 'introGrad'); grad.setAttribute('gradientUnits', 'userSpaceOnUse');
      grad.setAttribute('x1', '40'); grad.setAttribute('y1', '40'); grad.setAttribute('x2', '560'); grad.setAttribute('y2', '320');
      [['0', '#FF9EC4'], ['1', '#B9A6FF']].forEach((s) => {
        const st = document.createElementNS(NS, 'stop'); st.setAttribute('offset', s[0]); st.setAttribute('stop-color', s[1]); grad.appendChild(st);
      });
      defs.appendChild(grad); svg.appendChild(defs);

      function dot(x, y, r, fill, glow) {
        const cc = document.createElementNS(NS, 'circle');
        cc.setAttribute('cx', x); cc.setAttribute('cy', y); cc.setAttribute('r', r); cc.setAttribute('fill', fill);
        if (glow) cc.style.filter = 'drop-shadow(0 0 ' + glow + 'px rgba(185,166,255,.85))';
        svg.appendChild(cc); return cc;
      }

      const paths = [];
      edges.forEach((e) => {
        const a = nodes[e[0]], b = nodes[e[1]];
        const p = document.createElementNS(NS, 'path');
        p.setAttribute('d', 'M ' + a[0] + ' ' + a[1] + ' L ' + b[0] + ' ' + b[1]);
        p.setAttribute('stroke', 'url(#introGrad)'); p.setAttribute('stroke-width', (e[0] === 8 || e[1] === 8) ? 1.5 : 1.2);
        p.setAttribute('fill', 'none'); p.setAttribute('stroke-linecap', 'round'); p.setAttribute('opacity', '0.5');
        p.style.filter = 'drop-shadow(0 0 3px rgba(185,166,255,.5))';
        svg.appendChild(p); paths.push(p);
      });

      nodes.forEach((n, i) => {
        if (i === 8) return;
        const cc = dot(n[0], n[1], 0, '#C7BDD8', 5);
        cc.animate([{ r: 0, opacity: 0 }, { r: 3.4, opacity: 1 }], { duration: 560, delay: 120 + i * 80, fill: 'forwards', easing: 'cubic-bezier(.2,.7,.2,1)' });
      });
      const ctr = dot(300, 180, 0, '#F3EEFA', 13);
      ctr.animate([{ r: 0, opacity: 0 }, { r: 7, opacity: 1 }], { duration: 700, delay: 320, fill: 'forwards', easing: 'cubic-bezier(.2,.7,.2,1)' });
      const halo = dot(300, 180, 7, 'none', 0);
      halo.setAttribute('stroke', '#B9A6FF'); halo.setAttribute('stroke-width', '1.2'); halo.setAttribute('opacity', '0');
      halo.animate([{ r: 7, opacity: 0.5 }, { r: 24, opacity: 0 }], { duration: 1900, delay: 900, iterations: Infinity, easing: 'ease-out' });

      paths.forEach((p, i) => {
        const len = p.getTotalLength();
        p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
        p.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 760, delay: 480 + i * 90, fill: 'forwards', easing: 'cubic-bezier(.4,0,.2,1)' });
      });

      const flow = [];
      edges.forEach((e, i) => {
        if (i % 2 !== 0) return;
        const len = paths[i].getTotalLength();
        const pk = dot(0, 0, 2.6, '#fff', 7); pk.setAttribute('opacity', '0');
        flow.push({ path: paths[i], len, pk, speed: 0.32 + Math.random() * 0.22, phase: Math.random() });
      });
      const t0 = performance.now();
      function loop(ts) {
        if (!packetsOn) return;
        const t = (ts - t0) / 1000;
        for (let k = 0; k < flow.length; k++) {
          const o = flow[k];
          const u = (t * o.speed + o.phase) % 1;
          const pt = o.path.getPointAtLength(u * o.len);
          o.pk.setAttribute('cx', pt.x); o.pk.setAttribute('cy', pt.y);
          o.pk.setAttribute('opacity', t > 1 ? '0.95' : '0');
        }
        rafId = requestAnimationFrame(loop);
      }
      rafId = requestAnimationFrame(loop);

      if (bar) bar.animate([{ width: '0%' }, { width: '100%' }], { duration: 3000, fill: 'forwards', easing: 'cubic-bezier(.4,0,.2,1)' });
      if (cap) cap.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 300, fill: 'forwards' });
      timers.push(setTimeout(() => { if (cap) cap.textContent = 'syncing nodes'; }, 1500));
      timers.push(setTimeout(() => { if (cap) cap.innerHTML = 'link established <span style="color:var(--lav)">&#10003;</span>'; }, 2900));

      clearTimeout(hardKill);
      reveal(3500);
    } catch (e) {
      clearTimeout(hardKill);
      reveal(600);
    }

    function cleanup() {
      packetsOn = false;
      cancelAnimationFrame(rafId);
      clearTimeout(hardKill);
      timers.forEach(clearTimeout);
      html.style.overflow = prevOverflow || '';
    }
    return cleanup;
  }, []);

  if (gone) return null;

  return (
    <div className={'intro' + (done ? ' done' : '')} id="intro" ref={rootRef} aria-hidden="true">
      <div className="intro__center">
        <svg className="intro__net" id="introNet" ref={svgRef} viewBox="0 0 600 360" preserveAspectRatio="xMidYMid meet" aria-hidden="true" />
        <div className="intro__cap" id="introCap" ref={capRef}>establishing link</div>
        <div className="intro__bar" aria-hidden="true"><i id="introBar" ref={barRef} /></div>
      </div>
    </div>
  );
}
