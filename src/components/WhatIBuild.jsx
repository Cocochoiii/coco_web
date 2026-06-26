import React, { useRef } from 'react';
import { CARDS_LEFT, CARDS_RIGHT, SPLINE } from '../data/content.js';
import FlipCard from './FlipCard.jsx';
import SplineScene from './SplineScene.jsx';
import Sparks, { SPARKS_BUILD } from './Sparks.jsx';
import useReveal from '../hooks/useReveal.js';
import { focusTech } from '../lib/techBus.js';
import { scrollToTarget } from '../lib/scrollTo.js';

/* #build — the character is centered with experience cards flanking it.
   - Tapping a chip scrolls up to the Tech Stack and focuses that node (the same
     650ms hand-off the original used to let the smooth scroll settle first).
   - Hovering either column makes the character lean toward those cards (a touch
     of "looking at what you're reading"); the lean rides on the figure's transform,
     independent of the figFloat breathing which uses translate. */
export default function WhatIBuild() {
  const figRef = useReveal();   // .figcol (reveal + scale)
  const leanRef = useRef(null); // .fig (carries the lean transform)

  const jumpToTech = (tech) => {
    scrollToTarget('#stack');
    setTimeout(() => focusTech(tech), 650);
  };

  const setLean = (dir) => {
    const el = leanRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    el.style.transform =
      dir === 'left' ? 'translateX(-14px) rotate(-2.2deg)' :
      dir === 'right' ? 'translateX(14px) rotate(2.2deg)' : '';
  };

  return (
    <section className="section" id="build" aria-label="What I build">
      <div className="build-wrap">
        <div className="build-head">
          <div className="eyebrow">What I build · tap a card to flip · tap a chip to find it in the stack</div>
        </div>
        <div className="grid">
          <div
            className="col col-left"
            onMouseEnter={() => setLean('left')}
            onMouseLeave={() => setLean(null)}
          >
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
            <div className="fig scene-wrap" ref={leanRef}>
              <SplineScene url={SPLINE.build} />
            </div>
            <Sparks items={SPARKS_BUILD} />
            <div className="figcol-title">Work Experience</div>
          </div>

          <div
            className="col col-right"
            onMouseEnter={() => setLean('right')}
            onMouseLeave={() => setLean(null)}
          >
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
