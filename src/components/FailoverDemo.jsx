import React, { useEffect, useRef, useState } from 'react';
import { initFailoverNet } from '../lib/failoverNet.js';
import '../styles/failover.css';

/* Interactive backbone-failover demo (lives where the About character was).
   Direction A: the 3D scene carries the story (cable colour = utilisation,
   shock-rings = reconvergence, hover tooltips). The DOM adds only a small
   titled caption + a visually-hidden live region for screen readers. */
export default function FailoverDemo() {
  const canvasRef = useRef(null);
  const apiRef = useRef(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return undefined;
    const api = initFailoverNet(cv, { onStats: setStatus });
    apiRef.current = api;
    return () => { api.destroy(); apiRef.current = null; };
  }, []);

  return (
      <div className="failover" role="group" aria-label="Interactive backbone failover demo. Click a cable to cut it and watch traffic reroute; click two regions to trace the route between them.">
        <canvas ref={canvasRef} className="failover__canvas" />
        <div className="failover__cap">
          <h3>Demo</h3>
          <p>A live global backbone I built — it reroutes traffic in real time. <span className="k">Cut</span> a cable, <span className="k">trace</span> two regions, or <span className="k">double-click</span> to heal.</p>
        </div>
        <p className="failover__sr" aria-live="polite">{status}</p>
      </div>
  );
}