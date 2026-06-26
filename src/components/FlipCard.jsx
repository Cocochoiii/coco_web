import React, { useEffect, useRef, useState } from 'react';

/**
 * A single "What I build" card.
 *  - tap / Enter / Space flips it (aria-pressed reflects state)
 *  - hovering lights it (.lit) and tilts it in 3D toward the cursor (depth on hover)
 *  - each chip stops propagation (so it won't also flip the card) and calls
 *    onChip(tech) — the parent scrolls to the stack and focuses that node.
 *
 * IMPORTANT: the scroll-reveal `in`/`out` classes are tracked in React state (not
 * added imperatively). Flipping/lighting changes this element's className, so React
 * re-renders and rewrites the whole class attribute — if `in` were added imperatively
 * that re-render would wipe it and the card would vanish on the first hover/click.
 * Keeping reveal state in React makes it survive re-renders.
 *
 * The hover tilt is written straight to element.style.transform (a visual-only style
 * React never sets here). `.lit` scales via the independent `scale` property, so the
 * tilt transform and the lit scale never fight. On mouse-leave we clear the inline
 * transform/transition so the card springs back using the CSS easing — and, if it is
 * leaving the viewport, settles into the `.out` exit state.
 */
export default function FlipCard({ card, revealClass = '', delay = 0, onChip }) {
  const [flipped, setFlipped] = useState(false);
  const [lit, setLit] = useState(false);
  const [inView, setInView] = useState(false);
  const [out, setOut] = useState(false);
  const ref = useRef(null);
  const reduceRef = useRef(false);

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

  const chipClick = (e, tech) => {
    e.stopPropagation();
    onChip && onChip(tech);
  };
  const chipKey = (e, tech) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      onChip && onChip(tech);
    }
  };

  // 3D tilt toward the cursor (fast follow; CSS handles the spring-back on leave)
  const onMove = (e) => {
    if (reduceRef.current) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;   // -0.5 .. 0.5
    const ny = (e.clientY - r.top) / r.height - 0.5;
    const ry = (nx * 10).toFixed(2);                   // max ~5deg
    const rx = (-ny * 10).toFixed(2);
    el.style.transition = 'transform .14s ease-out, scale .25s cubic-bezier(.2,.7,.2,1)';
    el.style.transform = `perspective(820px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  };
  const onEnter = () => setLit(true);
  const onLeave = () => {
    setLit(false);
    const el = ref.current;
    if (!el) return;
    el.style.transition = '';  // back to the CSS easing
    el.style.transform = '';   // springs back to none (or to the .out exit transform)
  };

  const cls = ['flip', 'reveal', revealClass, inView && 'in', out && 'out', flipped && 'flipped', lit && 'lit']
    .filter(Boolean)
    .join(' ');

  return (
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
              <button
                key={c}
                type="button"
                className="chip"
                onClick={(e) => chipClick(e, c)}
                onKeyDown={(e) => chipKey(e, c)}
              >
                {c}
              </button>
            ))}
          </div>
          <span className="flip-hint">tap a chip → find it in the stack ↑</span>
        </div>
      </div>
    </div>
  );
}
