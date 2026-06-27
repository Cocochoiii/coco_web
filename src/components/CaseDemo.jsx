import { useEffect, useRef } from 'react';
import { initGlobe } from '../lib/demoGlobe.js';
import { initFleet } from '../lib/demoFleet.js';
import { initSwarm } from '../lib/demoSwarm.js';
import { initIdentity } from '../lib/demoIdentity.js';
import { initBio } from '../lib/demoBio.js';
import { initEmbed } from '../lib/demoEmbed.js';
import '../styles/case-demo.css';

/* one bespoke 3D demo per case study (pure visual, no numbers) */
const DEMOS = {
  'aws-backbone': { init: initGlobe, cap: 'Global backbone — drag to spin · hover a region · click to broadcast.' },
  audi: { init: initFleet, cap: 'Connected-vehicle pipeline — drag to orbit · hover a source · click for a burst.' },
  mars: { init: initSwarm, cap: 'Real-time socket layer — drag to rotate · hover to energise · click to broadcast.' },
  wpp: { init: initIdentity, cap: 'Identity resolution — drag to rotate · hover a cluster · click to re-resolve.' },
  ubiwell: { init: initBio, cap: 'Health-sensing streams — drag to orbit · hover a trace · click to inject a beat.' },
  'rag-news': { init: initEmbed, cap: 'Embedding space — drag to orbit · click anywhere to run a query.' },
};

export const CASE_DEMO_SLUGS = new Set(Object.keys(DEMOS));

export default function CaseDemo({ slug, accent = '#B9A6FF' }) {
  const ref = useRef(null);
  const cfg = DEMOS[slug];

  useEffect(() => {
    if (!cfg || !ref.current) return undefined;
    let inst = null;
    try { inst = cfg.init(ref.current, { accent }); } catch (e) { /* noop */ }
    return () => { try { if (inst && inst.destroy) inst.destroy(); } catch (e) { /* noop */ } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, accent]);

  if (!cfg) return null;
  return (
    <div className="case-demo" style={{ '--accent': accent }}>
      <canvas ref={ref} className="case-demo__canvas" aria-hidden="true" />
      <p className="case-demo__cap">{cfg.cap}</p>
    </div>
  );
}
