import React, { useEffect, useRef } from 'react';
import { HERO_WORDS, SPLINE } from '../data/content.js';
import SplineScene from './SplineScene.jsx';

/* #home — left name block, right "I build {rotating word}", scroll cue, and the
   home Spline character. The rotator mutates the .rot node directly (add .out,
   swap text after 400ms, remove .out) to match the original transition exactly. */
export default function Hero() {
  const rotRef = useRef(null);

  useEffect(() => {
    const rot = rotRef.current;
    if (!rot) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let ri = 0;
    let swapTimer = null;
    const id = setInterval(() => {
      ri = (ri + 1) % HERO_WORDS.length;
      if (reduce) { rot.textContent = HERO_WORDS[ri]; return; }
      rot.classList.add('out');
      swapTimer = setTimeout(() => {
        rot.textContent = HERO_WORDS[ri];
        rot.classList.remove('out');
      }, 400);
    }, 2600);

    return () => { clearInterval(id); if (swapTimer) clearTimeout(swapTimer); };
  }, []);

  return (
    <section className="section" id="home" aria-label="Home">
      <div className="stage">
        <div className="scene-box scene-wrap">
          <SplineScene url={SPLINE.home} />
        </div>
      </div>
      <div className="left">
        <div className="hello">Hello! I'm</div>
        <h1>Coco<br />Choi</h1>
      </div>
      <div className="right">
        <div className="lead">I build</div>
        <div className="rot" id="rotWord" ref={rotRef}>{HERO_WORDS[0]}</div>
      </div>
      <div className="scrollcue">scroll ↓</div>
    </section>
  );
}
