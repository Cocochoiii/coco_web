import React, { useEffect, useRef } from 'react';
import useRafScroll from '../hooks/useRafScroll.js';
import { scrollToTarget } from '../lib/scrollTo.js';

const NODES = [
  { href: '#home', label: 'Home' },
  { href: '#stack', label: 'Tech' },
  { href: '#build', label: 'Work' },
  { href: '#numbers', label: 'Numbers' },
  { href: '#ask', label: 'Ask' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' },
];

/* Right-side scroll indicator + section nav.
   - The fill grows with scroll progress.
   - The packet CHASES the scroll position: scroll fast and it stretches into a
     bright streak (its speed tracks yours); idle and it settles to a calm dot.
   - Whichever section is crossing the viewport centre is "current": its node lights
     up and fires a one-shot ring, like a connection being established.
   Clicking a node smooth-scrolls there (through Lenis when active). */
export default function Backbone() {
  const navRef = useRef(null);
  const fillRef = useRef(null);
  const packetRef = useRef(null);
  const nodeRefs = useRef([]);

  // packet motion (all in refs so the rAF loop never goes stale across renders)
  const targetYRef = useRef(0); // scroll-progress position (px)
  const packetYRef = useRef(0); // eased rendered position (px)
  const velRef = useRef(0);     // smoothed chase speed
  const rafRef = useRef(0);
  const reduceRef = useRef(false);

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

  // scroll: fill height + packet target (active node is handled by the IO below)
  useRafScroll(() => {
    const bb = navRef.current, fill = fillRef.current, pk = packetRef.current;
    if (!bb || !fill) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    let p = max > 0 ? (window.scrollY || window.pageYOffset || 0) / max : 0;
    if (p < 0) p = 0; else if (p > 1) p = 1;
    const y = p * bb.clientHeight;
    fill.style.height = y + 'px';
    targetYRef.current = y;
    if (reduceRef.current) {
      packetYRef.current = y;
      if (pk) pk.style.transform = `translate(-50%, ${y}px)`;
    } else {
      ensureRaf();
    }
  });

  useEffect(() => {
    reduceRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  // current section -> light its node + fire a "connection established" ring
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
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
              { duration: 700, easing: 'ease-out' }
            );
          }
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.05, 0.2] }
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
