import { useEffect } from 'react';

/* Nav links, the resume pill, and the chat FAB gently pull toward the cursor.
   Renders nothing — it just wires global pointer listeners after mount, once the
   target elements exist in the DOM. Skipped for reduced-motion and touch. */
export default function Magnetic() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(hover: none)').matches) return;

    const els = [].slice.call(
      document.querySelectorAll('.topnav .links a, .resume-link, .chat-fab')
    );
    if (!els.length) return;

    const items = els.map((el) => {
      const fab = el.classList.contains('chat-fab');
      return { el, rect: null, fab, strength: fab ? 0.4 : 0.32, pad: fab ? 90 : 58, cap: fab ? 16 : 12 };
    });

    const measure = () => items.forEach((it) => { it.rect = it.el.getBoundingClientRect(); });
    measure();

    let mx = 0, my = 0, ticking = false;
    const apply = () => {
      ticking = false;
      for (let i = 0; i < items.length; i++) {
        const it = items[i], r = it.rect;
        if (!r) continue;
        if (it.fab && it.el.classList.contains('hidden')) {
          if (it.el.style.translate) it.el.style.translate = '';
          continue;
        }
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const dx = mx - cx, dy = my - cy, dist = Math.hypot(dx, dy);
        const reach = Math.max(r.width, r.height) / 2 + it.pad;
        if (dist < reach) {
          const f = it.strength * (1 - dist / reach);
          const tx = Math.max(-it.cap, Math.min(it.cap, dx * f));
          const ty = Math.max(-it.cap, Math.min(it.cap, dy * f));
          it.el.style.translate = tx.toFixed(1) + 'px ' + ty.toFixed(1) + 'px';
        } else if (it.el.style.translate) {
          it.el.style.translate = '';
        }
      }
    };
    const onMove = (e) => {
      mx = e.clientX; my = e.clientY;
      if (!ticking) { ticking = true; requestAnimationFrame(apply); }
    };
    const resetAll = () => items.forEach((it) => { if (it.el.style.translate) it.el.style.translate = ''; });

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('resize', measure);
    document.addEventListener('mouseleave', resetAll);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', measure);
      document.removeEventListener('mouseleave', resetAll);
      resetAll();
    };
  }, []);

  return null;
}
