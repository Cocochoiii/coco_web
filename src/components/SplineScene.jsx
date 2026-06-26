import React, { useEffect, useRef, useState } from 'react';

/**
 * Wraps a <spline-viewer> custom element (registered by the Spline runtime in index.html).
 *   1. LAZY-LOAD: the heavy 3D scene's `url` is only attached once the element nears the
 *      viewport (IntersectionObserver, preloaded ~300px early). Off-screen scenes cost
 *      nothing at first paint; the hero (at the top) still loads immediately.
 *   2. Hide the "Built with Spline" badge in the viewer's shadow DOM (with .logo-cover as a
 *      soft fallback) — polling starts only once the scene begins loading.
 *   3. Lock wheel events over the viewer so the page scrolls and the character doesn't spin.
 */
export default function SplineScene({ url, className = 'scene' }) {
  const ref = useRef(null);
  const [load, setLoad] = useState(false);

  // ---- lazy-load: attach the url only when the element is near the viewport ----
  useEffect(() => {
    if (load) return;
    const v = ref.current;
    if (!v) return;
    if (!('IntersectionObserver' in window)) { setLoad(true); return; }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { setLoad(true); io.disconnect(); }
    }, { rootMargin: '300px 0px' });
    io.observe(v);
    return () => io.disconnect();
  }, [load]);

  // ---- wheel lock (always; lets the page scroll past the viewer) ----
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const stop = (e) => e.stopPropagation();
    v.addEventListener('wheel', stop, { capture: true, passive: true });
    return () => v.removeEventListener('wheel', stop, { capture: true });
  }, []);

  // ---- hide the Spline badge once the scene starts loading ----
  useEffect(() => {
    if (!load) return;
    const v = ref.current;
    if (!v) return;
    function hideBadge() {
      try {
        const root = v.shadowRoot;
        if (!root) return false;
        const el =
          (root.getElementById && root.getElementById('logo')) ||
          root.querySelector('#logo, a[href*="spline.design"], [class*="logo" i]');
        if (el) { el.style.display = 'none'; el.style.opacity = '0'; el.style.pointerEvents = 'none'; return true; }
      } catch (e) { /* shadow root not ready / cross-origin guard */ }
      return false;
    }
    let n = 0;
    const iv = setInterval(() => { n++; if (hideBadge() || n > 60) clearInterval(iv); }, 250);
    return () => clearInterval(iv);
  }, [load]);

  return (
    <>
      <spline-viewer
        ref={ref}
        class={className}
        url={load ? url : undefined}
        loading-anim-type="spinner-small-light"
      />
      <span className="logo-cover" aria-hidden="true" />
    </>
  );
}
