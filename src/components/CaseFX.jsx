import React, { useEffect, useState } from 'react';

const prefersReduce = () =>
  typeof window !== 'undefined' && window.matchMedia
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = () =>
  typeof window !== 'undefined' && window.matchMedia
  && window.matchMedia('(hover: hover)').matches;

/**
 * Wayfinding for the case page: a right-side progress filament whose nodes map to
 * the numbered sections (scroll-spy + click-to-jump), plus a subtle cursor
 * parallax on the prev/next cards. All additive — no dependency on index.css.
 */
export default function CaseFX({ sections = [] }) {
  const reduce = prefersReduce();
  const [fill, setFill] = useState(0);
  const [active, setActive] = useState(sections[0] ? sections[0].id : null);

  // scroll -> filament fill height
  useEffect(() => {
    let raf = 0;
    const apply = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? (window.scrollY || window.pageYOffset || 0) / max : 0;
      setFill(Math.max(0, Math.min(1, p)));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(apply); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    apply();
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf); };
  }, []);

  // scroll-spy: light the section currently most in view
  useEffect(() => {
    if (!sections.length || !('IntersectionObserver' in window)) return undefined;
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean);
    const io = new IntersectionObserver((entries) => {
      let best = null;
      let bestRatio = 0;
      entries.forEach((e) => { if (e.isIntersecting && e.intersectionRatio > bestRatio) { bestRatio = e.intersectionRatio; best = e.target.id; } });
      if (best) setActive(best);
    }, { threshold: [0.15, 0.4, 0.7], rootMargin: '-18% 0px -42% 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections]);

  // prev/next cards: gentle cursor parallax
  useEffect(() => {
    if (reduce || !canHover()) return undefined;
    const links = Array.from(document.querySelectorAll('.cs-nav__link'));
    const onMove = (e) => {
      const link = e.currentTarget;
      const r = link.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      const inner = link.querySelector('.cs-nav__inner');
      if (inner) inner.style.transform = `translate(${(dx * 8).toFixed(1)}px, ${(dy * 5).toFixed(1)}px)`;
      link.style.setProperty('--px', (((e.clientX - r.left) / r.width) * 100).toFixed(1) + '%');
    };
    const onLeave = (e) => { const inner = e.currentTarget.querySelector('.cs-nav__inner'); if (inner) inner.style.transform = ''; };
    links.forEach((l) => { l.addEventListener('mousemove', onMove); l.addEventListener('mouseleave', onLeave); });
    return () => links.forEach((l) => { l.removeEventListener('mousemove', onMove); l.removeEventListener('mouseleave', onLeave); });
  }, [reduce]);

  const go = (id) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

  return (
    <>
      {sections.length > 0 && (
        <nav className="cs-rail" aria-label="On this page">
          <span className="cs-rail__track" aria-hidden="true" />
          <span className="cs-rail__fill" style={{ height: (fill * 100).toFixed(1) + '%' }} aria-hidden="true" />
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`cs-rail__node${active === s.id ? ' is-active' : ''}`}
              data-label={s.label}
              aria-label={s.label}
              aria-current={active === s.id}
              onClick={() => go(s.id)}
            >
              <span className="cs-rail__n">{s.n}</span>
            </button>
          ))}
        </nav>
      )}
    </>
  );
}
