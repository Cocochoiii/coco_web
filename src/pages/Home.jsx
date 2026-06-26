import React, { useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

import Backbone from '../components/Backbone.jsx';
import Hero from '../components/Hero.jsx';
import TechStack from '../components/TechStack.jsx';
import WhatIBuild from '../components/WhatIBuild.jsx';
import Numbers from '../components/Numbers.jsx';
import AskMeAnything from '../components/AskMeAnything.jsx';
import About from '../components/About.jsx';
import Contact from '../components/Contact.jsx';

const EASE = [0.2, 0.7, 0.2, 1];
const pageV = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.45, ease: EASE } },
  exit: { opacity: 0, transition: { duration: 0.3, ease: EASE } },
};

/* The long-scroll landing page. Backbone lives here because its nodes map to the
   sections below. When we arrive here from a detail page carrying a `scrollTo` in
   the navigation state, we jump that section back into place immediately (before
   paint) so you land right back at the Work card you came from, rather than at the
   top of the page. */
export default function Home() {
  const location = useLocation();

  useLayoutEffect(() => {
    const target = location.state && location.state.scrollTo;
    if (!target) return;
    const el = document.querySelector(target);
    if (!el) return;
    const lenis = window.__lenis;
    if (lenis && lenis.scrollTo) lenis.scrollTo(el, { immediate: true });
    else el.scrollIntoView({ behavior: 'auto', block: 'start' });
  }, [location.state]);

  return (
    <motion.div variants={pageV} initial="initial" animate="animate" exit="exit">
      <Backbone />
      <main>
        <Hero />
        <TechStack />
        <WhatIBuild />
        <Numbers />
        <AskMeAnything />
        <About />
        <Contact />
      </main>
    </motion.div>
  );
}
