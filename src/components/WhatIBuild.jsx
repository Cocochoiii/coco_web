import React from 'react';
import { CARDS_LEFT, CARDS_RIGHT, SPLINE } from '../data/content.js';
import FlipCard from './FlipCard.jsx';
import SplineScene from './SplineScene.jsx';
import Sparks, { SPARKS_BUILD } from './Sparks.jsx';
import useReveal from '../hooks/useReveal.js';
import { focusTech } from '../lib/techBus.js';

/* #build — the character is centered with experience cards flanking it.
   Tapping a chip scrolls up to the Tech Stack and focuses that node (the same
   650ms hand-off the original used to let the smooth-scroll settle first). */
export default function WhatIBuild() {
  const figRef = useReveal();

  const jumpToTech = (tech) => {
    const stack = document.getElementById('stack');
    if (stack) stack.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => focusTech(tech), 650);
  };

  return (
    <section className="section" id="build" aria-label="What I build">
      <div className="build-wrap">
        <div className="build-head">
          <div className="eyebrow">What I build · tap a card to flip · tap a chip to find it in the stack</div>
        </div>
        <div className="grid">
          <div className="col col-left">
            {CARDS_LEFT.map((card, i) => (
              <FlipCard
                key={card.title}
                card={card}
                revealClass="r-left"
                delay={i * 100}
                onChip={jumpToTech}
              />
            ))}
          </div>

          <div className="figcol reveal r-scale" ref={figRef}>
            <div className="aura" aria-hidden="true" />
            <div className="fig scene-wrap">
              <SplineScene url={SPLINE.build} />
            </div>
            <Sparks items={SPARKS_BUILD} />
            <div className="figcol-title">Work Experience</div>
          </div>

          <div className="col col-right">
            {CARDS_RIGHT.map((card, i) => (
              <FlipCard
                key={card.title}
                card={card}
                revealClass="r-right"
                delay={i * 100}
                onChip={jumpToTech}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
