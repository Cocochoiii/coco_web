import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';

/* Parse a metric string into a countable shape.
   "−60%"        -> { prefix:'−', value:60,  suffix:'%' }
   "5,000+ DAU"  -> { prefix:'',  value:5000, suffix:'+ DAU', grouped:true }
   "~$2M/yr"     -> { prefix:'~$', value:2,  suffix:'M/yr' }
   "12s → 3s"    -> null  (a SECOND number lives in the suffix; don't animate)  */
function parseMetric(s) {
  const str = String(s);
  const m = str.match(/^([^\d]*)([\d,]+(?:\.\d+)?)(.*)$/);
  if (!m) return null;
  if (/\d/.test(m[3])) return null; // another number after -> render static
  const clean = m[2].replace(/,/g, '');
  const decimals = clean.includes('.') ? clean.split('.')[1].length : 0;
  return { prefix: m[1], value: parseFloat(clean), decimals, suffix: m[3], grouped: m[2].includes(',') };
}

function fmt(n, decimals, grouped) {
  let x = decimals > 0 ? n.toFixed(decimals) : String(Math.round(n));
  if (grouped) {
    const p = x.split('.');
    p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    x = p.join('.');
  }
  return x;
}

/**
 * Animated number.
 *  - Standalone (no `active` prop): counts up each time it scrolls into view
 *    (re-arms only once fully off-screen).
 *  - Carousel mode (`active` is a boolean, e.g. the focused coverflow card):
 *    counts up 0->final whenever it becomes active; shows the final value when
 *    it is NOT active (so side cards still read their real number).
 * Non-numeric metrics (or ones with a second number) render verbatim.
 */
export default function CountUp({ value, className, variants, duration = 1100, active }) {
  const parsed = useMemo(() => parseMetric(value), [value]);
  const ref = useRef(null);
  const rafRef = useRef(0);
  const hasActive = typeof active === 'boolean';
  const [disp, setDisp] = useState(
    parsed ? parsed.prefix + fmt(0, parsed.decimals, parsed.grouped) + parsed.suffix : value,
  );

  useEffect(() => {
    if (!parsed) { setDisp(value); return undefined; }
    const final = parsed.prefix + fmt(parsed.value, parsed.decimals, parsed.grouped) + parsed.suffix;
    const zero = parsed.prefix + fmt(0, parsed.decimals, parsed.grouped) + parsed.suffix;
    const reduce = typeof window !== 'undefined'
      && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setDisp(final); return undefined; }

    const run = () => {
      cancelAnimationFrame(rafRef.current);
      let t0 = null;
      const step = (t) => {
        if (t0 === null) t0 = t;
        const k = Math.min((t - t0) / duration, 1);
        const e = 1 - Math.pow(1 - k, 3); // easeOutCubic
        setDisp(parsed.prefix + fmt(parsed.value * e, parsed.decimals, parsed.grouped) + parsed.suffix);
        if (k < 1) rafRef.current = requestAnimationFrame(step);
        else setDisp(final);
      };
      rafRef.current = requestAnimationFrame(step);
    };

    // ----- carousel mode: parent decides when this card is the focused one -----
    if (hasActive) {
      if (active) run();
      else { cancelAnimationFrame(rafRef.current); setDisp(final); }
      return () => cancelAnimationFrame(rafRef.current);
    }

    // ----- standalone mode: re-count every time it scrolls back into view -----
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) { run(); return undefined; }
    let armed = true;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting && en.intersectionRatio >= 0.4) {
          if (armed) { armed = false; run(); }
        } else if (!en.isIntersecting) {
          armed = true;
          cancelAnimationFrame(rafRef.current);
          setDisp(zero);
        }
      });
    }, { threshold: [0, 0.4] });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(rafRef.current); };
  }, [active, hasActive, parsed, value, duration]);

  return <motion.span ref={ref} className={className} variants={variants}>{disp}</motion.span>;
}
