import React from 'react';
import Chat from './Chat.jsx';
import { SUGGEST_FULL } from '../data/content.js';

const INTRO =
  "Hi! I\u2019m Coco\u2019s portfolio assistant. Ask me about her work, projects, tech stack, or how to reach her \u2014 what would you like to know?";

/* #ask — the full-height inline conversation panel. */
export default function AskMeAnything() {
  return (
    <section className="section" id="ask" aria-label="Ask me anything">
      <div className="ask-wrap">
        <div className="ask-head">
          <div className="eyebrow">Conversation</div>
          <h2 className="ask-title">Ask me <em>anything</em></h2>
          <p className="ask-sub">A little assistant trained on my resume. Tap a question or type your own.</p>
        </div>
        <div className="chat">
          <Chat intro={INTRO} initialSuggest={SUGGEST_FULL} />
        </div>
      </div>
    </section>
  );
}
