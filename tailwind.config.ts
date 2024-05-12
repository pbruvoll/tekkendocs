import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    screens: {
      xs: '475px',
      ...defaultTheme.screens,
    },
    extend: {
      colors: {
        text: {
          primary: 'var(--accent-a11)',
          'primary-subtle': 'var(--accent-5)',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
} satisfies Config
