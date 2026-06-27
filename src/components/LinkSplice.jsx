import React, { useEffect, useRef, useState } from 'react';
import useRafScroll from '../hooks/useRafScroll.js';
import '../styles/home-fx.css';

/* Junctions to splice (the top edge of each = the seam from the section above). */
const SEAMS = ['#stack', '#build', '#numbers', '#ask', '#about', '#contact'];

/* A barely-there connector at each section boundary: a faint vertical line +
   a dot that flows downward (previous section -> next) while the seam is near
   the viewport, then goes static. Positioned absolutely inside <main> using
   each section's offsetTop, so it stays put and re-measures on resize. */
export default function LinkSplice() {
  const [tops, setTops] = useState([]);
  const markRefs = useRef([]);
  const reduceRef = useRef(false);

  useEffect(() => {
    reduceRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const measure = () => {
      setTops(SEAMS.map((sel) => {
        const el = document.querySelector(sel);
        return el ? el.offsetTop : null;
      }));
    };
    measure();
    const t = setTimeout(measure, 600);   // after fonts / Spline settle the layout
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', measure);
      window.removeEventListener('load', measure);
    };
  }, []);

  // a seam is "live" (its dot flows) only while its junction is on screen
  useRafScroll(() => {
    if (reduceRef.current) return;
    const vh = window.innerHeight || 1;
    for (let i = 0; i < markRefs.current.length; i++) {
      const m = markRefs.current[i];
      if (!m) continue;
      const top = m.getBoundingClientRect().top;
      m.classList.toggle('is-live', top > vh * 0.08 && top < vh * 0.92);
    }
  });

  return (
    <div className="splices" aria-hidden="true">
      {tops.map((top, i) => (top == null ? null : (
        <span
          key={SEAMS[i]}
          className="splice"
          style={{ top: `${top}px` }}
          ref={(el) => (markRefs.current[i] = el)}
        >
          <span className="splice__line" />
          <span className="splice__dot" />
        </span>
      )))}
    </div>
  );
}
