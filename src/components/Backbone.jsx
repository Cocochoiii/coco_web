import React, { useRef } from 'react';
import useRafScroll from '../hooks/useRafScroll.js';

const NODES = [
  { href: '#home', label: 'Home' },
  { href: '#stack', label: 'Tech' },
  { href: '#build', label: 'Work' },
  { href: '#numbers', label: 'Numbers' },
  { href: '#ask', label: 'Ask' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' },
];

/* Right-side scroll indicator + section nav. A gradient fill and a packet
   travel down with scroll progress; the nearest section node lights up;
   clicking a node smooth-scrolls there. */
export default function Backbone() {
  const navRef = useRef(null);
  const fillRef = useRef(null);
  const packetRef = useRef(null);
  const nodeRefs = useRef([]);

  useRafScroll(() => {
    const bb = navRef.current;
    const fill = fillRef.current;
    const packet = packetRef.current;
    if (!bb || !fill || !packet) return;

    const max = document.documentElement.scrollHeight - window.innerHeight;
    let p = max > 0 ? (window.scrollY || window.pageYOffset || 0) / max : 0;
    if (p < 0) p = 0; else if (p > 1) p = 1;

    const y = p * bb.clientHeight;
    fill.style.height = y + 'px';
    packet.style.transform = `translate(-50%, ${y}px)`;

    const idx = Math.round(p * (NODES.length - 1));
    nodeRefs.current.forEach((n, i) => {
      if (n) n.classList.toggle('active', i === idx);
    });
  });

  const jump = (e, href) => {
    e.preventDefault();
    const t = document.querySelector(href);
    if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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
        />
      ))}
    </nav>
  );
}
