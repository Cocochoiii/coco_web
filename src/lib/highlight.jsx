import React from 'react';
import { TECH_WORDS, ORG_WORDS } from '../data/content.js';

function hlClass(word) {
  const core = word.replace(/^[^\w+#/]+/, '').replace(/[^\w+#/]+$/, '');
  if (!core) return null;
  const low = core.toLowerCase();
  if (TECH_WORDS[low]) return 'hl hl-tech';
  if (ORG_WORDS[low]) return 'hl hl-org';
  if (/\d/.test(core)) return 'hl hl-num';
  return null;
}

/**
 * Turns a space-joined word list into an array of React nodes, wrapping
 * recognised keywords in their colored highlight spans. `count`, if given,
 * limits how many words are rendered (used for the word-by-word stream).
 */
export function highlightWords(text, count = Infinity) {
  const words = text.split(' ');
  const n = Math.min(count, words.length);
  const out = [];
  for (let i = 0; i < n; i++) {
    const w = words[i];
    if (i > 0) out.push(' ');
    const cls = hlClass(w);
    if (cls) out.push(<span key={i} className={cls}>{w}</span>);
    else out.push(<React.Fragment key={i}>{w}</React.Fragment>);
  }
  return out;
}

export function wordCount(text) {
  return text.split(' ').length;
}
