import React, { useEffect, useRef } from 'react';
import { initTechNetwork } from '../lib/techNetwork.js';
import { setTechApi, clearTechApi } from '../lib/techBus.js';
import useRafScroll from '../hooks/useRafScroll.js';
import useReveal from '../hooks/useReveal.js';

/* #stack — the interactive 3D graph of technologies. The graph instance is
   created once and published on the techBus so the build-section chips can
   focus a node. While the section is near the viewport, scroll progress
   rotates and zooms the constellation (same mapping as the original). */
export default function TechStack() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const apiRef = useRef(null);
  const headingRef = useReveal();

  useEffect(() => {
    const api = initTechNetwork(canvasRef.current);
    apiRef.current = api;
    setTechApi(api);
    return () => {
      clearTechApi(api);
      api.destroy();
      apiRef.current = null;
    };
  }, []);

  useRafScroll(() => {
    const api = apiRef.current;
    const stack = sectionRef.current;
    if (!api || !stack) return;
    const r = stack.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    if (r.bottom < -40 || r.top > vh + 40) return; // not near the viewport -> skip
    const p = (vh - r.top) / (vh + r.height); // 0 entering from below -> 1 fully passed
    api.setScrollProgress(p);
  });

  return (
    <section className="section" id="stack" aria-label="Tech stack" ref={sectionRef}>
      <div className="stack__head">
        <h2 className="heading reveal" ref={headingRef}>Tech Stack</h2>
        <p className="stack__hint">a living network · drag to rotate · scroll to zoom · hover to trace links</p>
      </div>
      <div className="net-glow" aria-hidden="true" />
      <canvas id="net" ref={canvasRef} aria-label="Interactive graph of technologies, grouped by category" />
    </section>
  );
}
