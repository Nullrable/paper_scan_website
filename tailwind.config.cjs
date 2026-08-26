/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Surfaces (black-dominant)
        bg: {
          0: 'var(--bg-0)',
          1: 'var(--bg-1)',
          2: 'var(--bg-2)',
          3: 'var(--bg-3)',
        },
        // Text
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        // Borders
        border: {
          subtle: 'var(--border-subtle)',
          strong: 'var(--border-strong)',
        },
        // Brand
        brand: {
          DEFAULT: 'var(--brand)',
          contrast: 'var(--brand-contrast)',
        },
        accent: 'var(--accent)',
        // States
        info: 'var(--info)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
      },
      spacing: {
        1: 'var(--space-1)',
        2: 'var(--space-2)',
        3: 'var(--space-3)',
        4: 'var(--space-4)',
        5: 'var(--space-5)',
        6: 'var(--space-6)',
        7: 'var(--space-7)',
        8: 'var(--space-8)',
        9: 'var(--space-9)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        pill: 'var(--radius-pill)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '220ms',
        slow: '400ms',
      },
      backgroundImage: {
        'pro-gradient': 'linear-gradient(135deg, #FFFFFF 0%, #D4D4D4 50%, #888888 100%)',
        'gradient-mesh':
          'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255,255,255,0.06), transparent 60%), radial-gradient(ellipse 50% 40% at 80% 60%, rgba(255,255,255,0.03), transparent 60%), radial-gradient(ellipse 50% 30% at 20% 80%, rgba(255,255,255,0.02), transparent 60%), #000000',
      },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,0.4)',
        hover: '0 12px 48px rgba(0,0,0,0.6)',
        'pro-glow': '0 0 60px rgba(255,255,255,0.15)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};