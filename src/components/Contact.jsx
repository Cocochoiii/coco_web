import React, { useRef, useState } from 'react';
import { LINKS, SPLINE } from '../data/content.js';
import SplineScene from './SplineScene.jsx';
import useReveal from '../hooks/useReveal.js';
import '../styles/contact-fig.css';

const ClipboardIcon = () => (
  <span className="ccard__icon" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  </span>
);

const ArrowIcon = () => (
  <span className="ccard__icon" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17L17 7M9 7h8v8" />
    </svg>
  </span>
);

function copyText(text) {
  const fallback = () => {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return true;
    } catch (e) {
      return false;
    }
  };
  return new Promise((resolve) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => resolve(true), () => resolve(fallback()));
    } else {
      resolve(fallback());
    }
  });
}

/* A card that copies its value and flashes a "Copied ✓" toast for 1.5s. */
function CopyCard({ label, value, ariaLabel }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  const act = async () => {
    const ok = await copyText(value);
    if (!ok) return;
    setCopied(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 1500);
  };
  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); }
  };

  return (
    <div
      className={`ccard ${copied ? 'copied' : ''}`.trim()}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={act}
      onKeyDown={onKeyDown}
    >
      <span className="k">{label}</span>
      <span className="v">{value}</span>
      <ClipboardIcon />
      <span className="ccard__toast" aria-hidden="true">Copied ✓</span>
    </div>
  );
}

/* #contact — closing footer. */
export default function Contact() {
  const ledeRef = useReveal();
  const gridRef = useReveal();

  return (
    <footer className="section stack-sec" id="contact" aria-label="Contact">
      <div className="wrap">
        <div className="eyebrow">Contact</div>
        <div className="contact__hero">
          <p className="contact__lede reveal" ref={ledeRef}>
            Let's build something that stays up under load.{' '}
            <a href={`mailto:${LINKS.email}`}>Say hello <span className="arrow">→</span></a>
          </p>
          <div className="contact__fig" aria-hidden="true">
            <SplineScene url={SPLINE.about} />
          </div>
        </div>
        <div className="contact__grid reveal" ref={gridRef}>
          <CopyCard label="Email" value={LINKS.email} ariaLabel="Copy email address" />
          <CopyCard label="Phone" value={LINKS.phone} ariaLabel="Copy phone number" />
          <a className="ccard" href={LINKS.linkedin} target="_blank" rel="noopener" aria-label="Open LinkedIn">
            <span className="k">LinkedIn</span>
            <span className="v">linkedin.com/in/…</span>
            <ArrowIcon />
          </a>
          <a className="ccard" href={LINKS.github} target="_blank" rel="noopener" aria-label="Open GitHub">
            <span className="k">GitHub</span>
            <span className="v">github.com/Cocochoiii</span>
            <ArrowIcon />
          </a>
        </div>
        <div className="colophon">
          <span>© 2026 Coco Choi — Boston / San Jose</span>
          <span><i className="cdot" /> Open to Summer 2026 · May–Aug</span>
        </div>
      </div>
    </footer>
  );
}
