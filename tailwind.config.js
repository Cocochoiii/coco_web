/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  // The bespoke stylesheet (src/index.css) already handles all resets and is the
  // source of truth for the design. We disable Tailwind's Preflight so utility
  // classes are available WITHOUT Tailwind overriding any of the existing look.
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'bg-2': 'var(--bg-2)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        line: 'var(--line)',
        'line-soft': 'var(--line-soft)',
        ink: 'var(--ink)',
        'ink-dim': 'var(--ink-dim)',
        muted: 'var(--muted)',
        lav: 'var(--lav)',
        pink: 'var(--pink)',
        blue: 'var(--blue)',
      },
      fontFamily: {
        display: ['Bricolage Grotesque', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['IBM Plex Sans', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      maxWidth: { content: 'var(--maxw)' },
    },
  },
  plugins: [],
};
