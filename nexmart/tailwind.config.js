/** @type {import('tailwindcss').Config} */

// Brand colours are driven by CSS variables so `bg-accent` follows the active
// theme (warm ember in light, neon-lifted in dark). The variables hold raw
// channel values so Tailwind's opacity modifiers — bg-accent/90 — still work.
const withAlpha = (v) => `rgb(var(${v}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: withAlpha('--primary-rgb'),
        accent: withAlpha('--accent-rgb'),
        accent2: withAlpha('--accent2-rgb'),
        surface: 'var(--bg-surface)',
        border: 'var(--border-color)',
      },
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        sm: 'var(--r-sm)',
        md: 'var(--r-md)',
        lg: 'var(--r-lg)',
        xl: 'var(--r-xl)',
      },
      boxShadow: {
        'elev-1': 'var(--elev-1)',
        'elev-2': 'var(--elev-2)',
        'elev-3': 'var(--elev-3)',
        glow: 'var(--glow)',
      },
      transitionTimingFunction: {
        warm: 'cubic-bezier(.22,1,.36,1)',
      },
    },
  },
  plugins: [],
}
