import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

/* NOTE: StrictMode is intentionally omitted. Several effects here imperatively
   create long-lived resources (the Three.js graph, canvas animation loops, the
   intro splash). StrictMode's double-invoke in development would mount/unmount
   those twice and is more confusing than helpful for this kind of app. All
   effects still return proper cleanups, so this is purely a dev-time choice. */
createRoot(document.getElementById('root')).render(<App />);
