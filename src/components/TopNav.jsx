import React from 'react';
import { scrollToTarget } from '../lib/scrollTo.js';

/* Fixed top navigation. Anchors match the section ids and order of the original.
   Clicks route through scrollToTarget so in-page jumps share Lenis's inertia. */
export default function TopNav() {
  const go = (e, href) => { e.preventDefault(); scrollToTarget(href); };

  return (
    <header className="topnav">
      <a href="#home" className="brand" onClick={(e) => go(e, '#home')}>CC</a>
      <nav className="links" aria-label="Sections">
        <a href="#stack" onClick={(e) => go(e, '#stack')}>TECH</a>
        <a href="#build" onClick={(e) => go(e, '#build')}>WORK</a>
        <a href="#about" onClick={(e) => go(e, '#about')}>ABOUT</a>
        <a href="#contact" onClick={(e) => go(e, '#contact')}>CONTACT</a>
      </nav>
    </header>
  );
}
