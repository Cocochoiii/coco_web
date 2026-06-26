import React, { useEffect, useRef } from 'react';
import { initTechRing } from '../lib/techRing.js';
import useRafScroll from '../hooks/useRafScroll.js';

/* Mounts the 3D tech ring for a case study. `items` should be a STABLE array
   (memoize it in the parent) so the scene is built once per project, not on
   every render. While the ring is near the viewport, scroll progress nudges
   its rotation; it also self-rotates and responds to mouse drag. */
export default function TechRing({ items, label }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const apiRef = useRef(null);

  useEffect(() => {
    const api = initTechRing(canvasRef.current, items || []);
    apiRef.current = api;
    return () => { api.destroy(); apiRef.current = null; };
  }, [items]);

  useRafScroll(() => {
    const api = apiRef.current;
    const wrap = wrapRef.current;
    if (!api || !wrap) return;
    const r = wrap.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    if (r.bottom < -40 || r.top > vh + 40) return;
    const p = (vh - r.top) / (vh + r.height);
    api.setScrollProgress(p);
  });

  return (
    <div className="cs-ring" ref={wrapRef}>
      <canvas className="cs-ring__canvas" ref={canvasRef} aria-label={label || 'Technologies used on this project, on a rotating ring'} />
      <p className="cs-ring__hint">the stack behind this work · drag to spin</p>
    </div>
  );
}
