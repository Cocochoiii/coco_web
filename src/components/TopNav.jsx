import React from 'react';

/* Fixed top navigation. Anchors match the section ids and order of the original. */
export default function TopNav() {
  return (
    <header className="topnav">
      <a href="#home" className="brand">CC</a>
      <nav className="links" aria-label="Sections">
        <a href="#stack">TECH</a>
        <a href="#build">WORK</a>
        <a href="#about">ABOUT</a>
        <a href="#contact">CONTACT</a>
      </nav>
    </header>
  );
}
