import React, { useEffect, useRef, useState } from 'react';

/**
 * A single "What I build" card.
 *  - tap / Enter / Space flips it (aria-pressed reflects state)
 *  - hovering lights it (.lit), matching the build interactive layer
 *  - each chip stops propagation (so it won't also flip the card) and calls
 *    onChip(tech) — the parent scrolls to the stack and focuses that node.
 *
 * IMPORTANT: the scroll-reveal `in` class is tracked in React state (not added
 * imperatively). Because flipping/lighting changes this element's className,
 * React re-renders and rewrites the whole class attribute — if `in` were added
 * imperatively (the way the shared useReveal hook does it) that re-render would
 * wipe it, and the card would snap back to its hidden reveal state and vanish on
 * the first hover/click. Keeping `in` in state makes it survive re-renders.
 *
 * Chips are real <button>s so they stay keyboard-reachable; stopPropagation
 * keeps the flip and the chip actions cleanly separated.
 */
export default function FlipCard({ card, revealClass = '', delay = 0, onChip }) {
  const [flipped, setFlipped] = useState(false);
  const [lit, setLit] = useState(false);
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) { setInView(true); return; }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { setInView(true); io.unobserve(e.target); }
        });
      },
      { threshold: 0.14, rootMargin: '0px 0px -8% 0px' }
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

  const cls = ['flip', 'reveal', revealClass, inView && 'in', flipped && 'flipped', lit && 'lit']
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
      onMouseEnter={() => setLit(true)}
      onMouseLeave={() => setLit(false)}
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
