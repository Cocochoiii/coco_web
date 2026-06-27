import React, { useLayoutEffect } from 'react';
import { ABOUT } from '../data/content.js';
import FailoverDemo from './FailoverDemo.jsx';
import useReveal from '../hooks/useReveal.js';

/* #about — figure on the left, the story on the right. The paragraph keeps its
   hand-placed highlight spans (this copy is bespoke, not auto-highlighted). */
export default function About() {
  const figRef = useReveal();
  const textRef = useReveal();

  // Give the demo box a *definite* height equal to the text column so its
  // absolutely-positioned canvas has real pixels to fill (without this it
  // collapses to 0 and the 3D demo never shows). Desktop only — on mobile the
  // CSS height (48vh) applies, so we clear the inline value there.
  useLayoutEffect(() => {
    const fig = figRef.current;
    const text = textRef.current;
    if (!fig || !text) return undefined;
    const sync = () => {
      if (window.innerWidth <= 980) { fig.style.height = ''; return; }
      fig.style.height = `${Math.round(text.offsetHeight)}px`;
    };
    sync();
    let ro = null;
    if ('ResizeObserver' in window) { ro = new ResizeObserver(sync); ro.observe(text); }
    window.addEventListener('resize', sync);
    // fonts can reflow the text after first paint
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(sync).catch(() => {});
    return () => { if (ro) ro.disconnect(); window.removeEventListener('resize', sync); };
  }, [figRef, textRef]);

  return (
    <section className="section" id="about" aria-label="About me">
      <div className="grid">
        <div className="about-fig is-demo reveal r-scale" ref={figRef}>
          <div className="aura" aria-hidden="true" />
          <FailoverDemo />
        </div>

        <div className="about-text reveal r-right" ref={textRef}>
          <div className="eyebrow">About me</div>
          <h2>Software engineer for systems that <span className="u">stay up under load.</span></h2>
          <p>
            I build <span className="hl hl-tech">network infrastructure and distributed systems</span>{' '}
            &mdash; traffic-engineering tooling, backbone telemetry pipelines, and backends that stay
            fast and reliable when traffic spikes and links fail. I&rsquo;m an{' '}
            <span className="hl hl-org">MSCS candidate at Northeastern</span> (<span className="hl hl-num">GPA 3.8</span>),
            heading to Amazon&rsquo;s <span className="hl hl-tech">AWS Global Backbone</span> team, with prior
            data &amp; cloud engineering at Audi, Mars, and WPP across Beijing and Hong Kong. I started in
            business and film before moving fully into systems engineering, so I care as much about how a
            system reads as how it runs.
          </p>
          <div className="facts">
            {ABOUT.facts.map((f) => (
              <span className="fact" key={f}>{f}</span>
            ))}
          </div>
          <ul className="principles">
            {ABOUT.principles.map((p) => (
              <li key={p.b}><b>{p.b}</b> {p.t}</li>
            ))}
          </ul>
          <div className="tagline">{'// latency \u00b7 scale \u00b7 failure \u2014 all on the table at once'}</div>
        </div>
      </div>
    </section>
  );
}
