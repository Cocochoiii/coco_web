import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { scrollToTarget } from '../lib/scrollTo.js';

/* Fixed top navigation. On the home page the links smooth-scroll to a section;
   from a detail page they navigate home first, passing the target section in
   router state so Home scrolls to it once it has entered. */
export default function TopNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const go = (e, href) => {
    e.preventDefault();
    if (pathname === '/') scrollToTarget(href);
    else navigate('/', { state: { scrollTo: href } });
  };

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
