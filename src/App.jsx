import React from 'react';
import { MotionConfig } from 'framer-motion';

import SmoothScroll from './components/SmoothScroll.jsx';
import Grain from './components/Grain.jsx';
import Intro from './components/Intro.jsx';
import ScrollProgress from './components/ScrollProgress.jsx';
import TopNav from './components/TopNav.jsx';
import SocialRail from './components/SocialRail.jsx';
import ResumeLink from './components/ResumeLink.jsx';
import ChatWidget from './components/ChatWidget.jsx';
import Magnetic from './components/Magnetic.jsx';
import AnimatedRoutes from './components/AnimatedRoutes.jsx';

/* App = a persistent chrome shell + a routed, animated content area.
   The chrome (nav, social rail, resume, chat, grain, smooth scroll, scroll bar)
   stays mounted across route changes so only the page content transitions.
   The Backbone section-nav lives inside the Home page (its nodes map to home
   sections), so it isn't part of the shell. */
export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll />
      <Grain />
      <Intro />
      <ScrollProgress />

      <TopNav />
      <SocialRail />
      <ResumeLink />

      <AnimatedRoutes />

      <ChatWidget />

      {/* renders nothing — wires the magnetic-button pointer effect */}
      <Magnetic />
    </MotionConfig>
  );
}
