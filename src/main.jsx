import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

/* NOTE: StrictMode is intentionally omitted. Several effects imperatively create
   long-lived resources (the Three.js graph, canvas loops, the intro splash, Lenis),
   and StrictMode's dev double-invoke would mount/unmount those twice. All effects
   return proper cleanups, so this is purely a dev-time choice.

   HashRouter is used so the site deep-links and refreshes correctly on GitHub Pages
   with zero server config (URLs look like /#/work/aws). In-page section anchors still
   work because nav clicks are handled in JS (scrollToTarget) and preventDefault. */
createRoot(document.getElementById('root')).render(
  <HashRouter>
    <App />
  </HashRouter>
);
