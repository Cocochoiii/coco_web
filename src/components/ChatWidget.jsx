import React, { useEffect, useState } from 'react';
import Chat from './Chat.jsx';
import { SUGGEST_MINI } from '../data/content.js';

const INTRO =
  "Hi! I\u2019m Coco\u2019s assistant. Ask me about her work, projects, or how to reach her.";

/* Floating assistant. Opens a popup that reuses the shared Chat engine.
   - Escape and outside clicks close it (the fab/pop stop propagation).
   - While the inline #ask section is in view, the fab hides and the popup closes
     (no point floating a second copy over the full panel). */
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  // hide over the #ask section
  useEffect(() => {
    const ask = document.getElementById('ask');
    if (!ask || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) { setHidden(true); setOpen(false); }
          else setHidden(false);
        });
      },
      { threshold: 0.3 }
    );
    io.observe(ask);
    return () => io.disconnect();
  }, []);

  // outside-click + Escape to close
  useEffect(() => {
    if (!open) return;
    const onDocClick = () => setOpen(false);
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <button
        className={`chat-fab ${open ? 'active' : ''} ${hidden ? 'hidden' : ''}`.trim()}
        aria-label="Ask me anything"
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
      >
        <svg className="ic-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
        <svg className="ic-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
      </button>

      <aside
        className={`chat-pop ${open ? 'open' : ''}`.trim()}
        aria-label="Ask me anything"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="chat-pop__head">
          <div className="avatar">C</div>
          <div className="meta">
            <span className="ttl">Ask me anything</span>
            <span className="sub"><i className="dot" /> usually replies instantly</span>
          </div>
          <button className="chat-pop__close" aria-label="Close chat" onClick={() => setOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <Chat intro={INTRO} initialSuggest={SUGGEST_MINI} active={open} />
      </aside>
    </>
  );
}
