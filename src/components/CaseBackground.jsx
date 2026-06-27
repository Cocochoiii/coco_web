import React, { useEffect, useRef } from 'react';
import { initCaseBackground } from '../lib/caseBackground.js';
import '../styles/case-bg.css';

/**
 * Full-bleed 3D backdrop for a case-study page. Sits behind the content
 * (z-index:0; the `.cs .wrap` content is z-index:1) and never intercepts
 * input (pointer-events:none). The motif is chosen by the parent page:
 *   'globe' for AWS Backbone, 'field' as the placeholder for the rest.
 * Page scroll slowly rotates the motif so the backdrop is tied to reading.
 */
export default function CaseBackground({ motif = 'field', accent = '#8FB4FF' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return undefined;
    const api = initCaseBackground(cv, { motif, accent });

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? (window.scrollY || window.pageYOffset || 0) / max : 0;
      api.setScrollProgress(p);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      api.destroy();
    };
  }, [motif, accent]);

  return (
    <div className="case-bg" aria-hidden="true">
      <canvas ref={canvasRef} className="case-bg__canvas" />
      <div className="case-bg__scrim" />
    </div>
  );
}
