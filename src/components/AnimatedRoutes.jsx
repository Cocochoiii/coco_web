import React, { useLayoutEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from '../pages/Home.jsx';
import ProjectDetail from '../pages/ProjectDetail.jsx';

/* Routed content.
   Entering a case page is intentionally calm: the page just swaps and the header +
   sections fade in naturally (see ProjectDetail) — no shared-element morph, which
   was being clipped by #build's overflow and felt stiff. Keying by pathname remounts
   the page so every entrance replays cleanly. We toggle `is-case` for the
   blueprint/spotlight backdrop, and jump scroll to the top on a normal change — but
   when returning home with a scrollTo target we leave scrolling to Home (it restores
   that section so you land back near the card you came from). */
export default function AnimatedRoutes() {
  const location = useLocation();

  useLayoutEffect(() => {
    document.body.classList.toggle('is-case', location.pathname.startsWith('/work/'));

    if (location.state && location.state.scrollTo) return; // Home restores it
    const lenis = window.__lenis;
    if (lenis && lenis.scrollTo) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [location.pathname, location.state]);

  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<Home />} />
      <Route path="/work/:slug" element={<ProjectDetail />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
