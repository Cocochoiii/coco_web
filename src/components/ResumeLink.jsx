import React from 'react';
import { LINKS } from '../data/content.js';

/* Fixed resume link. Point LINKS.resume at '/resume.pdf' once you drop the file
   into /public. When it stays '#', the link is inert but keeps the visual. */
export default function ResumeLink() {
  const external = LINKS.resume && LINKS.resume !== '#';
  return (
    <a
      className="resume-link"
      href={LINKS.resume}
      {...(external ? { target: '_blank', rel: 'noopener' } : {})}
    >
      RESUME
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M7 3h7l5 5v13H7z" /><path d="M14 3v5h5" /></svg>
    </a>
  );
}
