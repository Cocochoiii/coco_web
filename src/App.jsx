import React from 'react';

import Grain from './components/Grain.jsx';
import Intro from './components/Intro.jsx';
import ScrollProgress from './components/ScrollProgress.jsx';
import TopNav from './components/TopNav.jsx';
import SocialRail from './components/SocialRail.jsx';
import Backbone from './components/Backbone.jsx';
import ResumeLink from './components/ResumeLink.jsx';
import Hero from './components/Hero.jsx';
import TechStack from './components/TechStack.jsx';
import WhatIBuild from './components/WhatIBuild.jsx';
import Numbers from './components/Numbers.jsx';
import AskMeAnything from './components/AskMeAnything.jsx';
import About from './components/About.jsx';
import Contact from './components/Contact.jsx';
import ChatWidget from './components/ChatWidget.jsx';
import Magnetic from './components/Magnetic.jsx';

export default function App() {
  return (
    <>
      <Grain />
      <Intro />
      <ScrollProgress />

      <TopNav />
      <SocialRail />
      <Backbone />
      <ResumeLink />

      <main>
        <Hero />
        <TechStack />
        <WhatIBuild />
        <Numbers />
        <AskMeAnything />
        <About />
        <Contact />
      </main>

      <ChatWidget />

      {/* renders nothing — wires the magnetic-button pointer effect */}
      <Magnetic />
    </>
  );
}
