/*
 * Smooth-scroll to an element, preferring Lenis when it's active so anchor jumps
 * share the same inertia as wheel scrolling. Falls back to native scrollIntoView
 * (instant under prefers-reduced-motion). `target` may be a selector or an element.
 */
export function scrollToTarget(target, opts = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;

  const lenis = typeof window !== 'undefined' ? window.__lenis : null;
  if (lenis && typeof lenis.scrollTo === 'function') {
    lenis.scrollTo(el, { offset: opts.offset || 0 });
    return;
  }

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}
