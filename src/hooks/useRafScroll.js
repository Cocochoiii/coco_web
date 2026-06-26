import { useEffect, useRef } from 'react';

/*
 * Shared scroll/resize driver.
 *
 * All callers funnel into ONE window 'scroll' + ONE 'resize' listener and a SINGLE
 * requestAnimationFrame per frame (instead of one set per component). Each subscriber
 * is invoked once per frame; the callback is read from a ref so it never goes stale.
 *
 * The listeners are bound lazily on first use and then left attached (these consumers
 * stay mounted for the life of the page), which keeps the hot path allocation-free.
 */
const subs = new Set();
let ticking = false;
let bound = false;

function flush() {
  ticking = false;
  subs.forEach((fn) => {
    try { fn(); } catch (e) { /* one bad subscriber shouldn't stop the rest */ }
  });
}
function onScrollOrResize() {
  if (!ticking) { ticking = true; requestAnimationFrame(flush); }
}
function ensureBound() {
  if (bound) return;
  bound = true;
  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize);
}

export default function useRafScroll(cb) {
  const ref = useRef(cb);
  ref.current = cb; // always call the latest callback

  useEffect(() => {
    ensureBound();
    const fn = () => { if (ref.current) ref.current(); };
    subs.add(fn);
    fn(); // run once on mount so initial state is correct
    return () => { subs.delete(fn); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
