import React, { useCallback, useEffect, useRef, useState } from 'react';
import CountUp from './CountUp.jsx';

const prefersReduce = () =>
  typeof window !== 'undefined' && window.matchMedia
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Per-offset 3D transform. offset 0 = front (flat, full); ±1/±2 fan back, shrink,
   dim; |offset|>2 hidden. translateX is a % of the card's own width. */
function styleFor(off) {
  const a = Math.abs(off);
  if (a === 0) {
    return { transform: 'translate(-50%, -50%) rotateY(0deg) translateZ(0px) scale(1)', opacity: 1, zIndex: 30 };
  }
  if (a > 2) {
    return { transform: 'translate(-50%, -50%) scale(0.6)', opacity: 0, zIndex: 0, pointerEvents: 'none' };
  }
  const sign = off > 0 ? 1 : -1;
  const x = sign * (58 + (a - 1) * 18);          // horizontal slot (% of card width)
  const rot = -sign * (34 - (a - 1) * 8);        // tilt toward the viewer
  const z = -90 - (a - 1) * 80;                  // push back (depth)
  const scale = a === 1 ? 0.84 : 0.7;
  const opacity = a === 1 ? 0.6 : 0.32;
  return {
    transform: `translate(calc(-50% + ${x}%), -50%) rotateY(${rot}deg) translateZ(${z}px) scale(${scale})`,
    opacity,
    zIndex: 30 - a,
  };
}

/**
 * Impact metrics as a 3D coverflow. The front card shows the full metric (big
 * count-up number + label + body); side cards show their number, angled back.
 * Idle slow auto-rotate (pauses on hover/drag/off-screen); drag / click a side
 * card / arrows / dots / keyboard to move. The focused card's number counts up
 * each time it reaches the front.
 */
export default function ImpactCoverflow({ highlights = [] }) {
  const N = highlights.length;
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const [paused, setPaused] = useState(false);
  const rootRef = useRef(null);
  const dragRef = useRef(null);
  const draggedRef = useRef(false);
  const reduce = prefersReduce();

  const offsetOf = (i) => {
    let o = i - active;
    if (o > N / 2) o -= N;
    if (o < -N / 2) o += N;
    return o;
  };
  const go = useCallback((dir) => setActive((a) => (a + dir + N) % N), [N]);
  const setTo = useCallback((i) => setActive(((i % N) + N) % N), [N]);

  // start auto-rotate / count-up only while the section is on screen
  useEffect(() => {
    const el = rootRef.current;
    if (!el || !('IntersectionObserver' in window)) { setInView(true); return undefined; }
    const io = new IntersectionObserver((es) => es.forEach((e) => setInView(e.isIntersecting)), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // idle auto-advance
  useEffect(() => {
    if (reduce || !inView || paused || N <= 1) return undefined;
    const t = setInterval(() => setActive((a) => (a + 1) % N), 4200);
    return () => clearInterval(t);
  }, [reduce, inView, paused, N]);

  const onKey = (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
  };

  // drag / swipe (one step per gesture)
  const onPointerDown = (e) => { dragRef.current = { x: e.clientX }; draggedRef.current = false; setPaused(true); };
  const onPointerMove = (e) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    if (Math.abs(dx) > 55 && !draggedRef.current) { draggedRef.current = true; go(dx < 0 ? 1 : -1); }
  };
  const endDrag = () => { dragRef.current = null; };

  if (!N) return null;

  return (
    <div
      className="impact-cf"
      ref={rootRef}
      role="group"
      aria-roledescription="carousel"
      aria-label="Impact highlights"
      tabIndex={0}
      onKeyDown={onKey}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => { setPaused(false); endDrag(); }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
    >
      <div className="impact-cf__stage">
        {highlights.map((h, i) => {
          const off = offsetOf(i);
          const isFront = off === 0;
          return (
            <article
              key={i}
              className={`impact-cf__card${isFront ? ' is-front' : ''}`}
              style={styleFor(off)}
              aria-hidden={!isFront}
              onClick={() => { if (!isFront && !draggedRef.current) setTo(i); }}
            >
              <span className="csi-no" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <div className="csi-metric"><CountUp className="csi-metric__n" value={h.metric} active={inView && isFront} /></div>
              <div className="csi-label">{h.label}</div>
              <p className="impact-cf__body">{h.body}</p>
            </article>
          );
        })}
      </div>

      {N > 1 && (
        <div className="impact-cf__controls">
          <button type="button" className="impact-cf__arrow" aria-label="Previous highlight" onClick={() => go(-1)}>←</button>
          <div className="impact-cf__dots">
            {highlights.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`impact-cf__dot${i === active ? ' is-active' : ''}`}
                aria-label={`Go to highlight ${i + 1}`}
                aria-current={i === active}
                onClick={() => setTo(i)}
              />
            ))}
          </div>
          <button type="button" className="impact-cf__arrow" aria-label="Next highlight" onClick={() => go(1)}>→</button>
        </div>
      )}
      {N > 1 && <p className="impact-cf__hint">drag · click a card · ← →</p>}
    </div>
  );
}
