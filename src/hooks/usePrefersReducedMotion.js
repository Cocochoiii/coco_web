import { useEffect, useState } from 'react';

/** Tracks the user's prefers-reduced-motion setting, live. */
export default function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    mq.addEventListener ? mq.addEventListener('change', on) : mq.addListener(on);
    return () => {
      mq.removeEventListener ? mq.removeEventListener('change', on) : mq.removeListener(on);
    };
  }, []);

  return reduced;
}
