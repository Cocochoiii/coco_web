import { useEffect, useRef } from 'react';

/**
 * Returns a ref. Attach it to an element that already has the `reveal` class
 * (plus optional r-left / r-right / r-scale). When the element enters the
 * viewport, the `in` class is added once — matching the original IO behaviour.
 */
export default function useReveal({ threshold = 0.14, rootMargin = '0px 0px -8% 0px' } = {}) {
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
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
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
