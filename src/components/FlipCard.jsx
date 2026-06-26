import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * A single "What I build" card.
 *  - tap / Enter / Space flips it (aria-pressed reflects state)
 *  - hovering lights it (.lit) and tilts it in 3D toward the cursor
 *  - the back face has a "View case study" link that opens /work/:slug
 *  - each chip stops propagation (so it won't also flip the card)
 *
 * Two transforms are kept on separate NESTED elements so they never collide: the
 * middle .flip carries the cursor tilt; the inner .flip-inner carries the rotateY
 * flip. The "View case study" link just navigates — the case page handles its own
 * (calm) entrance.
 *
 * Reveal state (`in`/`out`) is React state, not imperative classes, so it survives
 * the re-renders caused by flipping/lighting.
 */
export default function FlipCard({ card, revealClass = '', delay = 0, onChip }) {
  const [flipped, setFlipped] = useState(false);
  const [lit, setLit] = useState(false);
  const [inView, setInView] = useState(false);
  const [out, setOut] = useState(false);
  const ref = useRef(null);
  const reduceRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    reduceRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // enter/exit symmetry (keeps observing; direction-aware exit)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduceRef.current || !('IntersectionObserver' in window)) { setInView(true); return; }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { setInView(true); setOut(false); }
          else {
            setInView(false);
            const r = e.boundingClientRect;
            const vh = window.innerHeight || 1;
            setOut((r.top + r.height / 2) < vh / 2);
          }
        });
      },
      { threshold: 0, rootMargin: '-14% 0px -10% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const toggle = () => setFlipped((f) => !f);
  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
  };

  const chipClick = (e, tech) => { e.stopPropagation(); onChip && onChip(tech); };
  const chipKey = (e, tech) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onChip && onChip(tech); }
  };

  const openCase = (e) => { e.stopPropagation(); navigate(`/work/${card.slug}`); };
  const openCaseKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); navigate(`/work/${card.slug}`); }
  };

  // 3D tilt toward the cursor (fast follow; CSS handles the spring-back on leave)
  const onMove = (e) => {
    if (reduceRef.current) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    const ry = (nx * 10).toFixed(2);
    const rx = (-ny * 10).toFixed(2);
    el.style.transition = 'transform .14s ease-out, scale .25s cubic-bezier(.2,.7,.2,1)';
    el.style.transform = `perspective(820px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  };
  const onEnter = () => setLit(true);
  const onLeave = () => {
    setLit(false);
    const el = ref.current;
    if (!el) return;
    el.style.transition = '';
    el.style.transform = '';
  };

  const cls = ['flip', 'reveal', revealClass, inView && 'in', out && 'out', flipped && 'flipped', lit && 'lit']
    .filter(Boolean)
    .join(' ');

  return (
    <div className="card-shell">
      <div
        ref={ref}
        className={cls}
        style={{ ['--d']: `${delay}ms` }}
        tabIndex={0}
        role="button"
        aria-pressed={flipped}
        aria-label={card.title}
        onClick={toggle}
        onKeyDown={onKeyDown}
        onMouseEnter={onEnter}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        <div className="flip-inner">
          <div className="flip-front">
            <div className="no">{card.no}</div>
            <h3>{card.title}</h3>
            <p className="flip-role">{card.role}</p>
            <p>{card.blurb}</p>
            <span className="flip-hint">tap to see impact ↻</span>
          </div>
          <div className="flip-back">
            <h4>{card.backTitle}</h4>
            <ul className="stat">
              {card.stats.map((s, i) => (
                <li key={i}>
                  <div className="row"><span>{s.label}</span><b>{s.value}</b></div>
                  <div className="bar"><i style={{ ['--w']: s.w }} /></div>
                </li>
              ))}
            </ul>
            <div className="chips">
              {card.chips.map((c) => (
                <button key={c} type="button" className="chip" onClick={(e) => chipClick(e, c)} onKeyDown={(e) => chipKey(e, c)}>
                  {c}
                </button>
              ))}
            </div>
            <button type="button" className="case-link" onClick={openCase} onKeyDown={openCaseKey}>
              View case study ↗
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
