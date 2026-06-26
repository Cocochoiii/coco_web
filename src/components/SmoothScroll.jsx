import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * Smooth inertia scrolling (Lenis). Renders nothing.
 *  - Skipped entirely under prefers-reduced-motion (native scrolling stays).
 *  - Drives Lenis from a single rAF loop and tears it down on unmount.
 *  - Exposes the instance on window.__lenis so anchor handlers (lib/scrollTo.js)
 *    can route hash navigation through the same inertia.
 *  - Touch is left native (best feel on mobile); only wheel is smoothed.
 *  - Containers marked [data-lenis-prevent] (e.g. the chat log) scroll natively.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    window.__lenis = lenis;

    let id = requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      id = requestAnimationFrame(raf);
    });

    return () => {
      cancelAnimationFrame(id);
      lenis.destroy();
      if (window.__lenis === lenis) delete window.__lenis;
    };
  }, []);

  return null;
}
