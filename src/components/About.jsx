import React from 'react';
import { ABOUT, SPLINE } from '../data/content.js';
import SplineScene from './SplineScene.jsx';
import Sparks, { SPARKS_ABOUT } from './Sparks.jsx';
import useReveal from '../hooks/useReveal.js';

/* #about — figure on the left, the story on the right. The paragraph keeps its
   hand-placed highlight spans (this copy is bespoke, not auto-highlighted). */
export default function About() {
  const figRef = useReveal();
  const textRef = useReveal();

  return (
    <section className="section" id="about" aria-label="About me">
      <div className="grid">
        <div className="about-fig reveal r-scale" ref={figRef}>
          <div className="aura" aria-hidden="true" />
          <SplineScene url={SPLINE.about} />
          <Sparks items={SPARKS_ABOUT} />
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
