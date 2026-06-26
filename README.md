# Coco Choi — Portfolio (React + Vite + Tailwind)

A 1:1 React rewrite of the hand-coded portfolio. **Every design detail, color,
animation, and interaction from the original is preserved** — the original
stylesheet is the source of truth and Tailwind is layered on top without
overriding any of it.

## Requirements

- Node.js 18+ (20+ recommended)
- npm (or pnpm/yarn — examples use npm)

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
```

## Build & preview

```bash
npm run build    # outputs to dist/
npm run preview  # serve the production build locally
```

Deploy `dist/` to any static host (Vercel, Netlify, GitHub Pages, S3 …). On
Vercel/Netlify just point them at the repo — framework preset "Vite", build
command `npm run build`, output `dist`.

---

## ✏️ Fill these in (search for `TODO`)

Almost everything you'd want to edit lives in **`src/data/content.js`** — copy,
resume answers, the chat engine, and the tech-graph data are all in that one file.

1. **LinkedIn URL** — `src/data/content.js` → `LINKS.linkedin`
   (used by the left rail and the Contact card).
2. **Résumé** — drop `resume.pdf` into `public/`, then set
   `LINKS.resume = '/resume.pdf'` in `src/data/content.js`.
   While it's `'#'` the résumé pill is inert but still shows.
3. **Social preview image** — in `index.html`, uncomment the `og:url` and
   `og:image` tags and point them at your deployed URL + a 1200×630 image.
4. **Spline scenes** (optional) — swap the three URLs in `SPLINE` in
   `src/data/content.js` for your own scenes.

---

## How the design is preserved

- **`src/index.css` is the original `styles.css`, verbatim.** It's the single
  source of truth for the look — colors, layout, every keyframe.
- **Tailwind has Preflight disabled** (`corePlugins.preflight: false` in
  `tailwind.config.js`) so utility classes are available but Tailwind **never**
  resets or overrides the existing styles. The palette
  (`bg`, `surface`, `lav`, `pink`, `blue`, `ink`, …) and the three fonts
  (`font-display`, `font-body`, `font-mono`) are exposed as Tailwind tokens if
  you want to extend the UI later — but the existing components just reuse the
  original class names.
- **The 3D tech graph is real Three.js**, pinned to `three@0.128.0` (the r128 the
  original targeted). It's ported to proper ES-module imports, so bloom
  post-processing and the fat "LineSegments2" links now **always** load — in the
  original those were a best-effort CDN include with a graceful fallback, so this
  is a small fidelity upgrade, not a change in design.
- **Spline** is loaded via the official CDN module in `index.html`, which
  registers the `<spline-viewer>` custom element used by `SplineScene`.

## Notable behavior notes

- **Intro splash plays on every load**, exactly like the original. To make it
  play only once per browser session, gate the effect in
  `src/components/Intro.jsx` — at the very top of the `useEffect`, add:

  ```js
  if (sessionStorage.getItem('introSeen')) { setGone(true); return; }
  sessionStorage.setItem('introSeen', '1');
  ```

- **Accessibility:** flip cards expose `aria-pressed`, and the chips on the back
  are real `<button>`s, so they're keyboard-reachable. Tapping a chip jumps to
  the Tech Stack node and intentionally does **not** flip the card.
- **No `<StrictMode>`** (see `src/main.jsx`). Several effects create long-lived
  imperative resources (the Three.js graph, canvas loops, the intro). StrictMode's
  dev-only double-invoke would mount/unmount those twice. Every effect still
  returns a proper cleanup; this is purely a dev-time choice.
- Respects `prefers-reduced-motion` throughout (counters, rotator, streaming
  chat, ambient field, intro all short-circuit to a static state).

## Project structure

```
index.html                 Vite entry · fonts · Spline runtime · OG tags
src/
  main.jsx                 React entry (imports index.css)
  App.jsx                  Composes the page in the original DOM order
  index.css                The original stylesheet (design system) + Tailwind
  data/content.js          ← EDIT EVERYTHING HERE (copy, answers, graph data)
  hooks/                   useReveal · useRafScroll · usePrefersReducedMotion
  lib/
    techNetwork.js         Three.js force-directed tech graph (r128)
    techBus.js             Lets build-card chips focus a graph node
    highlight.jsx          Colored keyword highlighting for chat answers
  components/
    Intro · Ambient · Grain · ScrollProgress · TopNav · SocialRail · Backbone
    ResumeLink · Hero · TechStack · WhatIBuild · FlipCard · Numbers
    Chat · AskMeAnything · ChatWidget · About · Contact · SplineScene · Sparks
    Magnetic
```

## Tech

React 18 · Vite 5 · Tailwind CSS 3 · Three.js 0.128 · Spline viewer
