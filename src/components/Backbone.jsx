import React, { useEffect, useRef } from 'react';
import useRafScroll from '../hooks/useRafScroll.js';
import { scrollToTarget } from '../lib/scrollTo.js';
import '../styles/home-fx.css';

const NODES = [
  { href: '#home', label: 'Home' },
  { href: '#stack', label: 'Tech' },
  { href: '#build', label: 'Work' },
  { href: '#numbers', label: 'Numbers' },
  { href: '#ask', label: 'Ask' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' },
];

const FLOW_N = 3; // ambient packets travelling down the established trunk

/* Right-side scroll indicator + section nav, treated as a live fibre trunk.
   - The fill grows with scroll progress.
   - The packet CHASES the scroll position (stretches into a streak when fast).
   - FLOW_N small packets continuously travel down the *filled* length — the
     established link carrying traffic.
   - As the fill crosses a node it "handshakes": a quick ring + brighten.
   - Whichever section is crossing the viewport centre is "current" (its node
     lights + fires a ring). Reaching the bottom glows the whole trunk.
   Clicking a node smooth-scrolls there (through Lenis when active). */
export default function Backbone() {
  const navRef = useRef(null);
  const fillRef = useRef(null);
  const packetRef = useRef(null);
  const nodeRefs = useRef([]);
  const flowRefs = useRef([]);

  // packet motion (all in refs so the rAF loop never goes stale across renders)
  const targetYRef = useRef(0); // scroll-progress position (px)
  const packetYRef = useRef(0); // eased rendered position (px)
  const velRef = useRef(0);     // smoothed chase speed
  const rafRef = useRef(0);
  const reduceRef = useRef(false);

  // live-trunk extras
  const fillYRef = useRef(0);              // current fill height (px)
  const nodeYsRef = useRef([]);            // each node's centre Y within the nav
  const reachedRef = useRef(NODES.map(() => false));
  const flowRafRef = useRef(0);

  // velocity-driven packet loop; self-pauses when it has caught up
  const tick = () => {
    const pk = packetRef.current;
    if (!pk) { rafRef.current = 0; return; }
    const target = targetYRef.current;
    const gap = target - packetYRef.current;
    packetYRef.current += gap * 0.16;
    velRef.current += (Math.abs(gap) - velRef.current) * 0.25;
    const v = velRef.current;
    if (Math.abs(gap) > 0.25 || v > 0.25) {
      const stretch = Math.min(1 + v * 0.05, 3.2); // streak when chasing fast
      const glow = Math.min(8 + v * 0.7, 26);
      pk.style.transform = `translate(-50%, ${packetYRef.current.toFixed(1)}px) scaleY(${stretch.toFixed(2)})`;
      pk.style.boxShadow = `0 0 ${glow.toFixed(1)}px 2px rgba(185,166,255,.9)`;
      rafRef.current = requestAnimationFrame(tick);
    } else {
      packetYRef.current = target; velRef.current = 0;
      pk.style.transform = `translate(-50%, ${target.toFixed(1)}px) scaleY(1)`;
      pk.style.boxShadow = '';
      rafRef.current = 0;
    }
  };
  const ensureRaf = () => { if (!rafRef.current) rafRef.current = requestAnimationFrame(tick); };

  // a node "handshake" as the fill reaches it: reuse its ping ring + a brighten
  const handshake = (i) => {
    const node = nodeRefs.current[i];
    if (!node) return;
    const ping = node.querySelector('.backbone__ping');
    if (ping && ping.animate) {
      ping.animate(
        [{ opacity: 0.85, transform: 'scale(.55)' }, { opacity: 0, transform: 'scale(2.4)' }],
        { duration: 600, easing: 'ease-out' },
      );
    }
    if (node.animate) {
      node.animate(
        [
          { boxShadow: '0 0 0 0 rgba(185,166,255,0)' },
          { boxShadow: '0 0 12px 2px rgba(185,166,255,.9)' },
          { boxShadow: '0 0 0 0 rgba(185,166,255,0)' },
        ],
        { duration: 600, easing: 'ease-out' },
      );
    }
  };

  // measure each node's centre Y within the nav (for the fill-cross handshakes)
  const measure = () => {
    nodeYsRef.current = nodeRefs.current.map((n) => (n ? n.offsetTop + n.offsetHeight / 2 : null));
  };

  // continuous ambient packets flowing down the established (filled) trunk
  const flowTick = (ts) => {
    const fy = fillYRef.current;
    for (let i = 0; i < flowRefs.current.length; i++) {
      const d = flowRefs.current[i];
      if (!d) continue;
      if (fy < 24) { d.style.opacity = '0'; continue; }
      const span = Math.max(1, fy);
      const pxPerSec = 64 + i * 12;
      const y = (((ts / 1000) * pxPerSec + i * 37) % span);
      const u = y / span, edge = Math.min(u, 1 - u);
      d.style.transform = `translate(-50%, ${y.toFixed(1)}px)`;
      d.style.opacity = (Math.max(0, Math.min(1, edge * 6)) * 0.85).toFixed(2);
    }
    flowRafRef.current = requestAnimationFrame(flowTick);
  };
  const startFlow = () => { if (!flowRafRef.current && !reduceRef.current) flowRafRef.current = requestAnimationFrame(flowTick); };
  const stopFlow = () => { if (flowRafRef.current) { cancelAnimationFrame(flowRafRef.current); flowRafRef.current = 0; } };

  // scroll: fill height + packet target + flow length + node handshakes + finish
  useRafScroll(() => {
    const bb = navRef.current, fill = fillRef.current, pk = packetRef.current;
    if (!bb || !fill) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    let p = max > 0 ? (window.scrollY || window.pageYOffset || 0) / max : 0;
    if (p < 0) p = 0; else if (p > 1) p = 1;
    const y = p * bb.clientHeight;
    fill.style.height = y + 'px';
    targetYRef.current = y;
    fillYRef.current = y;

    // handshake each node the fill has just reached (re-arm when scrolling back up)
    if (!reduceRef.current) {
      const ys = nodeYsRef.current, reached = reachedRef.current;
      for (let i = 0; i < ys.length; i++) {
        if (ys[i] == null) continue;
        if (!reached[i] && y >= ys[i]) { reached[i] = true; handshake(i); }
        else if (reached[i] && y < ys[i] - 6) { reached[i] = false; }
      }
    }
    bb.classList.toggle('backbone--complete', p >= 0.995);

    if (reduceRef.current) {
      packetYRef.current = y;
      if (pk) pk.style.transform = `translate(-50%, ${y}px)`;
    } else {
      ensureRaf();
    }
  });

  useEffect(() => {
    reduceRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    measure();
    const t = setTimeout(measure, 600);
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    startFlow();
    const onVis = () => { if (document.hidden) stopFlow(); else startFlow(); };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      stopFlow();
      clearTimeout(t);
      window.removeEventListener('resize', measure);
      window.removeEventListener('load', measure);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  // current section -> light its node + fire a "connection established" ring
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return undefined;
    const reduce = reduceRef.current;
    const els = NODES.map((n) => document.querySelector(n.href));
    const ratios = new Array(NODES.length).fill(0);
    let current = -1;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const idx = els.indexOf(e.target);
          if (idx >= 0) ratios[idx] = e.isIntersecting ? e.intersectionRatio : 0;
        });
        let best = -1, bestR = -1;
        for (let i = 0; i < ratios.length; i++) { if (ratios[i] > bestR) { bestR = ratios[i]; best = i; } }
        if (best < 0 || bestR <= 0 || best === current) return;
        current = best;
        nodeRefs.current.forEach((n, i) => { if (n) n.classList.toggle('active', i === best); });
        if (!reduce) {
          const node = nodeRefs.current[best];
          const ping = node && node.querySelector('.backbone__ping');
          if (ping && ping.animate) {
            ping.animate(
              [{ opacity: 0.85, transform: 'scale(.55)' }, { opacity: 0, transform: 'scale(2.6)' }],
              { duration: 700, easing: 'ease-out' },
            );
          }
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.05, 0.2] },
    );
    els.forEach((el) => { if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);

  const jump = (e, href) => { e.preventDefault(); scrollToTarget(href); };

  return (
    <nav className="backbone" id="backbone" ref={navRef} aria-label="On this page">
      <span className="backbone__track" aria-hidden="true" />
      <span className="backbone__fill" ref={fillRef} aria-hidden="true" />
      <span className="backbone__packet" ref={packetRef} aria-hidden="true" />
      {Array.from({ length: FLOW_N }).map((_, i) => (
        <span key={`flow-${i}`} className="backbone__flow" ref={(el) => (flowRefs.current[i] = el)} aria-hidden="true" />
      ))}
      {NODES.map((n, i) => (
        <a
          key={n.href}
          className="backbone__node"
          href={n.href}
          data-label={n.label}
          aria-label={n.label}
          ref={(el) => (nodeRefs.current[i] = el)}
          onClick={(e) => jump(e, n.href)}
        >
          <span className="backbone__ping" aria-hidden="true" />
        </a>
      ))}
    </nav>
  );
}
