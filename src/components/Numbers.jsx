import React, { useEffect, useRef } from 'react';
import { METRICS } from '../data/content.js';
import useReveal from '../hooks/useReveal.js';

/* Thousands-separated formatting, matching the original fmt(). */
function fmt(n, dec) {
  const x = dec > 0 ? n.toFixed(dec) : Math.round(n).toString();
  const p = x.split('.');
  p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return p.join('.');
}

/*
 * #numbers — four counters that roll up from 0 to their target (cubic ease-out,
 * ~1.6s). They fire EVERY TIME the row scrolls into view:
 *   - entering view (>=25% visible) plays the count-up once,
 *   - fully leaving the viewport re-arms it (and resets to 0 off-screen),
 * so every visit replays it. Staying on the section doesn't re-fire, and the
 * reset happens off-screen so there's no flicker. prefers-reduced-motion shows
 * the final values without animating.
 */
export default function Numbers() {
  const metricsRef = useReveal();      // the fade-up reveal of the whole row
  const numRefs = useRef([]);
  const rafRef = useRef(0);

  useEffect(() => {
    const sec = metricsRef.current;
    if (!sec) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const paint = (factor) => {
      METRICS.forEach((m, i) => {
        const el = numRefs.current[i];
        if (!el) return;
        el.textContent = (m.prefix || '') + fmt((m.to || 0) * factor, m.decimals || 0) + (m.suffix || '');
      });
    };

    if (reduce || !('IntersectionObserver' in window)) { paint(1); return; }

    paint(0);
    let armed = true; // ready to play on the next time it enters view

    const animate = () => {
      const dur = 1600;
      let start = null;
      const step = (t) => {
        if (start == null) start = t;
        const k = Math.min((t - start) / dur, 1);
        paint(1 - Math.pow(1 - k, 3)); // ease-out cubic
        if (k < 1) rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    };
    const reset = () => {
      cancelAnimationFrame(rafRef.current);
      paint(0);
      armed = true; // re-arm for the next scroll-in
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio >= 0.25) {
            if (armed) { armed = false; animate(); }
          } else if (e.intersectionRatio === 0) {
            reset();
          }
        });
      },
      { threshold: [0, 0.25, 0.6] }
    );
    io.observe(sec);
    return () => { io.disconnect(); cancelAnimationFrame(rafRef.current); };
  }, []);

  return (
    <section className="section stack-sec" id="numbers" aria-label="By the numbers">
      <div className="wrap">
        <div className="eyebrow">By the numbers</div>
        <div className="metrics reveal" ref={metricsRef}>
          {METRICS.map((m, i) => (
            <div className="mtr" key={i}>
              <div className="mtr__n" ref={(el) => (numRefs.current[i] = el)}>0</div>
              <div className="mtr__l">{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
