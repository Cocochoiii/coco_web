import { useRef } from 'react';
import useRafScroll from '../hooks/useRafScroll.js';

export default function ScrollProgress() {
  const ref = useRef(null);

  useRafScroll(() => {
    const bar = ref.current;
    if (!bar) return;
    const y = window.scrollY || window.pageYOffset || 0;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (docH > 0 ? (y / docH) * 100 : 0) + '%';
  });

  return <div className="progress" id="progress" ref={ref} aria-hidden="true" />;
}
