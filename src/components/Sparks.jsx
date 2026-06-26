import React from 'react';

/* The little drifting glints layered over the Spline figures. Each preset is a
   list of {left, top, w, dur, delay} matching the original inline spans exactly. */
export default function Sparks({ items }) {
  return (
    <div className="sparks" aria-hidden="true">
      {items.map((s, i) => (
        <span
          key={i}
          style={{
            left: s.left,
            top: s.top,
            width: s.w,
            height: s.w,
            animationDuration: s.dur,
            animationDelay: s.delay,
          }}
        />
      ))}
    </div>
  );
}

/* Exact spark layout from the "What I build" figure. */
export const SPARKS_BUILD = [
  { left: '18%', top: '28%', w: '3px', dur: '5s', delay: '0.0s' },
  { left: '30%', top: '62%', w: '4px', dur: '6s', delay: '0.6s' },
  { left: '24%', top: '80%', w: '5px', dur: '7s', delay: '1.2s' },
  { left: '70%', top: '24%', w: '3px', dur: '8s', delay: '1.8s' },
  { left: '78%', top: '58%', w: '4px', dur: '5s', delay: '2.4s' },
  { left: '66%', top: '82%', w: '5px', dur: '6s', delay: '3.0s' },
  { left: '50%', top: '14%', w: '3px', dur: '7s', delay: '3.6s' },
  { left: '46%', top: '90%', w: '4px', dur: '8s', delay: '4.2s' },
  { left: '12%', top: '50%', w: '5px', dur: '5s', delay: '4.8s' },
  { left: '86%', top: '40%', w: '3px', dur: '6s', delay: '0.4s' },
  { left: '38%', top: '40%', w: '4px', dur: '7s', delay: '1.0s' },
  { left: '60%', top: '50%', w: '5px', dur: '8s', delay: '1.6s' },
];

/* Exact spark layout from the About figure (a few positions differ). */
export const SPARKS_ABOUT = [
  { left: '18%', top: '26%', w: '3px', dur: '5s', delay: '0.0s' },
  { left: '30%', top: '60%', w: '4px', dur: '6s', delay: '0.6s' },
  { left: '24%', top: '80%', w: '5px', dur: '7s', delay: '1.2s' },
  { left: '70%', top: '24%', w: '3px', dur: '8s', delay: '1.8s' },
  { left: '78%', top: '56%', w: '4px', dur: '5s', delay: '2.4s' },
  { left: '66%', top: '82%', w: '5px', dur: '6s', delay: '3.0s' },
  { left: '50%', top: '14%', w: '3px', dur: '7s', delay: '3.6s' },
  { left: '46%', top: '90%', w: '4px', dur: '8s', delay: '4.2s' },
  { left: '14%', top: '48%', w: '5px', dur: '5s', delay: '4.8s' },
  { left: '84%', top: '40%', w: '3px', dur: '6s', delay: '0.4s' },
  { left: '40%', top: '40%', w: '4px', dur: '7s', delay: '1.0s' },
  { left: '58%', top: '48%', w: '5px', dur: '8s', delay: '1.6s' },
];
