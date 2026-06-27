import React, { useEffect, useRef, useState } from 'react';
import {
  LABEL, ANSWERS, ROUTES, THINK, PLACEHOLDERS, STARTERS,
} from '../data/content.js';
import { highlightWords } from '../lib/highlight.jsx';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion.js';
import '../styles/chat-fx.css';

/* free-typed question -> topic (first keyword hit wins; order = specific to generic) */
function route(text) {
  const t = text.toLowerCase();
  for (let i = 0; i < ROUTES.length; i++) {
    const kws = ROUTES[i][1];
    for (let j = 0; j < kws.length; j++) {
      if (t.indexOf(kws[j]) >= 0) return ROUTES[i][0];
    }
  }
  return null;
}

function resolveAnswer(key) {
  const d = ANSWERS[key];
  if (!d) {
    return {
      full: "Good question — I don't have a scripted answer for that one, but here's what I can tell you about:",
      follow: STARTERS,
    };
  }
  return { full: d.a, follow: d.follow };
}

const ThinkSpinner = () => (
  <span className="think-spin">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  </span>
);

const Avatar = () => <div className="avatar">C</div>;

/**
 * One chat engine, mounted both in the inline #ask panel and the floating widget.
 *
 * Props:
 *   intro          — first bot bubble text
 *   initialSuggest — array of question keys shown as starting chips
 *   active         — (popup only) focus the input when it becomes true
 */
export default function Chat({ intro, initialSuggest, active = false }) {
  const reduce = usePrefersReducedMotion();
  const idRef = useRef(0);
  const nextId = () => ++idRef.current;

  const [items, setItems] = useState([]);
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const [phIdx, setPhIdx] = useState(0);
  const [thinkIdx, setThinkIdx] = useState(0);
  const [streamId, setStreamId] = useState(null);
  const [streamShown, setStreamShown] = useState(0);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const timersRef = useRef([]);
  const completedRef = useRef(new Set());
  const startedRef = useRef(false);

  // Open like a real chat: a brief "typing…" beat, then a short greeting + a few
  // starter chips. Plays when the panel first scrolls into view (or immediately
  // under reduced motion / without IntersectionObserver).
  function playIntro() {
    if (startedRef.current) return;
    startedRef.current = true;
    const greet = () => setItems([
      { id: nextId(), type: 'bot', text: intro },
      { id: nextId(), type: 'suggest', keys: initialSuggest },
    ]);
    if (reduce) { greet(); return; }
    setItems([{ id: nextId(), type: 'typing' }]);
    const t = setTimeout(greet, 650);
    timersRef.current.push(t);
  }
  useEffect(() => {
    if (reduce || !('IntersectionObserver' in window) || !scrollRef.current) { playIntro(); return undefined; }
    const io = new IntersectionObserver((ents) => {
      ents.forEach((e) => { if (e.isIntersecting && e.intersectionRatio > 0.15) playIntro(); });
    }, { threshold: [0, 0.15] });
    io.observe(scrollRef.current);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // rotate the input hint while idle (paused on focus / when typing)
  useEffect(() => {
    if (reduce || focused || value) return undefined;
    const id = setInterval(() => setPhIdx((i) => (i + 1) % PLACEHOLDERS.length), 3200);
    return () => clearInterval(id);
  }, [reduce, focused, value]);

  // auto-scroll to the newest content
  useEffect(() => {
    const s = scrollRef.current;
    if (s) s.scrollTop = s.scrollHeight;
  }, [items, streamShown]);

  // focus the field when the popup opens
  useEffect(() => {
    if (active && inputRef.current) {
      const t = setTimeout(() => inputRef.current && inputRef.current.focus(), 160);
      return () => clearTimeout(t);
    }
  }, [active]);

  // rotate the "thinking" caption while a think bubble is present
  const hasThink = items.some((i) => i.type === 'think');
  useEffect(() => {
    if (!hasThink || reduce) return;
    let k = 1;
    const id = setInterval(() => { setThinkIdx(k % THINK.length); k++; }, 850);
    return () => clearInterval(id);
  }, [hasThink, reduce]);

  // word-by-word streaming of the active answer, then drop in the follow-up chips
  useEffect(() => {
    if (streamId == null) return;
    const item = items.find((i) => i.id === streamId);
    if (!item || item.type !== 'stream') return;
    const total = item.words.length;

    if (streamShown < total) {
      const t = setTimeout(() => setStreamShown((s) => Math.min(s + 1, total)), 24);
      return () => clearTimeout(t);
    }
    if (!completedRef.current.has(streamId)) {
      completedRef.current.add(streamId);
      if (item.follow && item.follow.length) {
        setItems((prev) => [...prev, { id: nextId(), type: 'suggest', keys: item.follow }]);
      }
    }
  }, [streamId, streamShown, items]);

  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  function ask(rawText, isFreeText) {
    const key = isFreeText ? route(rawText) : rawText;
    const userText = isFreeText ? rawText : (LABEL[key] || key);
    const { full, follow } = resolveAnswer(key);
    const words = full.split(' ');

    const thinkId = nextId();
    setItems((prev) => [
      ...prev.filter((i) => i.type !== 'suggest'),
      { id: nextId(), type: 'user', text: userText },
      { id: thinkId, type: 'think' },
    ]);
    setThinkIdx(0);

    const delay = reduce ? 0 : 950 + Math.random() * 650;
    const t = setTimeout(() => {
      const streamItemId = nextId();
      setItems((prev) =>
        prev.map((i) =>
          i.id === thinkId
            ? { id: streamItemId, type: 'stream', full, words, follow }
            : i
        )
      );
      setStreamId(streamItemId);
      setStreamShown(reduce ? words.length : 0);
    }, delay);
    timersRef.current.push(t);
  }

  function submit(e) {
    if (e) e.preventDefault();
    const v = value.trim();
    if (!v) return;
    setValue('');
    ask(v, true);
  }

  return (
    <>
      <div className="chat__scroll" ref={scrollRef} role="log" aria-live="polite" data-lenis-prevent>
        {items.map((it) => {
          if (it.type === 'bot') {
            return (
              <div className="msg bot" key={it.id}>
                <Avatar />
                <div className="bubble"><p>{it.text}</p></div>
              </div>
            );
          }
          if (it.type === 'user') {
            return (
              <div className="msg user" key={it.id}>
                <div className="bubble"><p>{it.text}</p></div>
              </div>
            );
          }
          if (it.type === 'think') {
            return (
              <div className="msg bot" key={it.id}>
                <Avatar />
                <div className="bubble think">
                  <ThinkSpinner />
                  <span className="think-txt">
                    <span className="think-t">Thinking</span>
                    <span className="think-s">{THINK[thinkIdx]}</span>
                  </span>
                </div>
              </div>
            );
          }
          if (it.type === 'stream') {
            const count = it.id === streamId ? streamShown : it.words.length;
            return (
              <div className="msg bot" key={it.id}>
                <Avatar />
                <div className="bubble"><p>{highlightWords(it.full, count)}</p></div>
              </div>
            );
          }
          if (it.type === 'typing') {
            return (
              <div className="msg bot" key={it.id}>
                <Avatar />
                <div className="bubble"><div className="typing"><span /><span /><span /></div></div>
              </div>
            );
          }
          // suggest
          return (
            <div className="suggest" key={it.id}>
              {it.keys.map((k, i) => (
                <button
                  key={k}
                  type="button"
                  className="qchip"
                  style={{ '--i': i }}
                  data-q={k}
                  onClick={() => ask(k, false)}
                >
                  {LABEL[k]}
                </button>
              ))}
            </div>
          );
        })}
      </div>

      <form className="chat__input" autoComplete="off" onSubmit={submit}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={(focused || value) ? 'Type your question…' : PLACEHOLDERS[phIdx]}
          autoComplete="off"
          aria-label="Ask a question"
        />
        <button type="submit" aria-label="Send">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" /></svg>
        </button>
      </form>
    </>
  );
}
