import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-manrope)', 'Manrope', 'system-ui', 'sans-serif'],
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Mirrors styles/globals.css. Components should prefer these semantic
        // names over raw hex so a palette change lands in one place.
        green: {
          brand: 'var(--green-brand)', // decorative only — fails AA for text
          900: 'var(--green-900)',
          800: 'var(--green-800)',
          cta: 'var(--green-cta)',
          600: 'var(--green-600)',
          100: 'var(--green-100)',
          50: 'var(--green-50)',
        },
        beige: {
          50: 'var(--beige-50)',
          100: 'var(--beige-100)',
          200: 'var(--beige-200)',
        },
        ink: {
          900: 'var(--ink-900)',
          700: 'var(--ink-700)',
          600: 'var(--ink-600)',
          500: 'var(--ink-500)',
        },
        line: {
          DEFAULT: 'var(--border)',
          strong: 'var(--border-strong)',
        },
        status: {
          new: 'var(--status-new)',
          scheduled: 'var(--status-scheduled)',
          onboarded: 'var(--status-onboarded)',
          active: 'var(--status-active)',
        },
        danger: 'var(--error)',
      },
      borderRadius: {
        nav: 'var(--radius-nav)',
        card: 'var(--radius-card)',
        ctl: 'var(--radius-ctl)',
        chip: 'var(--radius-chip)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
      fontSize: {
        // 4pt-derived type scale. Body base is 16px — never smaller for prose.
        xs: ['0.75rem', { lineHeight: '1.5' }],
        sm: ['0.875rem', { lineHeight: '1.55' }],
        base: ['1rem', { lineHeight: '1.6' }],
        lg: ['1.125rem', { lineHeight: '1.6' }],
        xl: ['1.25rem', { lineHeight: '1.45' }],
        '2xl': ['1.5rem', { lineHeight: '1.3' }],
        '3xl': ['1.875rem', { lineHeight: '1.2' }],
        '4xl': ['2.25rem', { lineHeight: '1.15' }],
        '5xl': ['3rem', { lineHeight: '1.08' }],
        '6xl': ['3.75rem', { lineHeight: '1.05' }],
      },
      maxWidth: {
        content: '1160px',
        prose: '68ch',
      },
    },
  },
  plugins: [],
}

export default config
