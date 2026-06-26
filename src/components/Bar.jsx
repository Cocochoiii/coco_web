import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const EASE = [0.2, 0.7, 0.2, 1];
const inView = { once: false, margin: '-12% 0px' }; // refill every time it re-enters view
// non-% metrics get a varied "visual weight" by row, so bars read as rhythm,
// not uniform full bars (the number beside the bar is the real readout)
const WEIGHTS = [0.86, 0.72, 0.93, 0.78, 0.66, 0.9];

function widthOf(value, i) {
  const m = String(value).match(/^([^\d]*)([\d,]+(?:\.\d+)?)(.*)$/);
  if (m && !/\d/.test(m[3]) && m[3].includes('%')) {
    const v = Math.abs(parseFloat(m[2].replace(/,/g, '')));
    return Math.max(0.06, Math.min(1, v / 100));
  }
  return WEIGHTS[i % WEIGHTS.length];
}

/* A thin gradient bar that fills to the metric's weight as it scrolls into
   view, with a glowing packet riding the leading edge to the value — the same
   "traffic on a link" language as the home Backbone connector. */
export default function Bar({ value, i = 0 }) {
  const w = useMemo(() => widthOf(value, i), [value, i]);
  return (
    <div className="csi-bar" aria-hidden="true">
      <div className="csi-bar__track">
        <motion.div
          className="csi-bar__fill"
          initial={{ width: 0 }}
          whileInView={{ width: `${(w * 100).toFixed(1)}%` }}
          viewport={inView}
          transition={{ duration: 1.1, ease: EASE }}
        >
          <span className="csi-bar__packet" />
        </motion.div>
      </div>
    </div>
  );
}
