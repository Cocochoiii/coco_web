import React from 'react';
import Chat from './Chat.jsx';
import { STARTERS } from '../data/content.js';

const INTRO = "Hi \u2014 I\u2019m Coco\u2019s assistant. What would you like to know?";

/* #ask — the full-height inline conversation panel. */
export default function AskMeAnything() {
  return (
    <section className="section" id="ask" aria-label="Ask me anything">
      <div className="ask-wrap">
        <div className="ask-head">
          <div className="eyebrow">Conversation</div>
          <h2 className="ask-title">Ask me <em>anything</em></h2>
          <p className="ask-sub">Trained on Coco&rsquo;s resume. Ask anything &mdash; or tap a starter.</p>
        </div>
        <div className="chat">
          <Chat intro={INTRO} initialSuggest={STARTERS} />
        </div>
      </div>
    </section>
  );
}
