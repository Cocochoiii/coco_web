import { useEffect, useRef } from 'react';

/**
 * Returns a ref for an element that already has the `reveal` class (plus optional
 * r-left / r-right / r-scale). Enter/exit symmetry:
 *   - entering the viewport  -> `.in`  (fade + settle into place)
 *   - leaving via the top    -> `.out` (fade + drift upward, in the scroll direction)
 *   - leaving via the bottom -> back to the base hidden state, ready to re-enter
 * The observer keeps watching (no unobserve), so blocks breathe in and out as you scroll.
 * Reduced-motion shows everything immediately and never animates.
 */
export default function useReveal({ threshold = 0, rootMargin = '-14% 0px -10% 0px' } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) {
      el.classList.add('in');
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const t = e.target;
          if (e.isIntersecting) {
            t.classList.add('in');
            t.classList.remove('out');
          } else {
            t.classList.remove('in');
            const r = e.boundingClientRect;
            const vh = window.innerHeight || document.documentElement.clientHeight || 1;
            const aboveCenter = (r.top + r.height / 2) < vh / 2;
            t.classList.toggle('out', aboveCenter); // up-and-out only when it left past the top
          }
        });
      },
      { threshold, rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, rootMargin]);

  return ref;
}
